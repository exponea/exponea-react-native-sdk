#!/usr/bin/env bash
#
# Compiles the SDK's Android module against a specific React Native version.
#
# The SDK declares a React Native peer range in package.json, but the example
# app (and therefore any local build) only ever compiles against one version.
# Native APIs change between releases, so code that compiles on the newest
# version can fail on the oldest supported one. This script
# temporarily pins the example app to the requested version, compiles the SDK
# module through the example's Gradle project and restores the example again.
#
# Usage:
#   scripts/check-android-rn-compat.sh                # lowest version of the peer range
#   scripts/check-android-rn-compat.sh 0.85           # latest 0.85.x patch
#   scripts/check-android-rn-compat.sh 0.84.0         # exact version
#   scripts/check-android-rn-compat.sh 0.83 --full    # also assemble the whole example app
#   scripts/check-android-rn-compat.sh 0.83 --keep    # leave the example pinned (run the app by hand)
#
# Requires: git, node, npm, yarn, an Android SDK (ANDROID_HOME) and a clean example tree.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXAMPLE="$ROOT/example"
ROOT_GRADLE="$EXAMPLE/android/build.gradle"
APP_GRADLE="$EXAMPLE/android/app/build.gradle"
WRAPPER="$EXAMPLE/android/gradle/wrapper/gradle-wrapper.properties"
TOUCHED=("$EXAMPLE/package.json" "$ROOT/yarn.lock" "$ROOT_GRADLE" "$APP_GRADLE" "$WRAPPER")

REQUESTED=""
FULL=0
KEEP=0
for arg in "$@"; do
  case "$arg" in
    --full) FULL=1 ;;
    --keep) KEEP=1 ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    -*) echo "[rn-compat] Unknown option: $arg (use --full, --keep or --help)" >&2; exit 2 ;;
    *)
      [ -z "$REQUESTED" ] || { echo "[rn-compat] Only one version can be given, got '$REQUESTED' and '$arg'" >&2; exit 2; }
      REQUESTED="$arg"
      ;;
  esac
done

# In-place regex replacement without relying on sed -i, whose flags differ between macOS and Linux.
# Usage: replace_in_file FILE PATTERN REPLACEMENT   (JavaScript regex, multiline, first match only)
replace_in_file() {
  node -e '
    const fs = require("fs");
    const [file, pattern, replacement] = process.argv.slice(1);
    const before = fs.readFileSync(file, "utf8");
    const after = before.replace(new RegExp(pattern, "m"), replacement);
    if (after === before) { console.error(`[rn-compat] Pattern not found in ${file}: ${pattern}`); process.exit(1); }
    fs.writeFileSync(file, after);
  ' "$1" "$2" "$3"
}

log() { printf '\n\033[1;34m[rn-compat]\033[0m %s\n' "$*"; }
die() { printf '\n\033[1;31m[rn-compat] %s\033[0m\n' "$*" >&2; exit 1; }

cd "$ROOT"

if ! git diff --quiet -- "${TOUCHED[@]}"; then
  die "Uncommitted changes in the example files this script rewrites. Commit or stash them first."
fi

if [ -z "$REQUESTED" ]; then
  REQUESTED="$(node -p "require('$ROOT/package.json').peerDependencies['react-native'].match(/>=\s*(\d+\.\d+)/)[1]")"
  log "No version given, using lowest supported minor from peerDependencies: $REQUESTED"
fi

# Resolve "0.83" or "0.83.0" to the newest patch of that minor; keep an explicit patch as is.
if [[ "$REQUESTED" =~ ^[0-9]+\.[0-9]+$ ]]; then
  RANGE="~$REQUESTED.0"
else
  RANGE="$REQUESTED"
fi
# npm exits non-zero for an unknown version; capture that instead of letting set -e abort silently.
if ! NPM_OUT="$(npm view "react-native@$RANGE" version --json 2>&1)"; then
  die "react-native@$RANGE does not exist on npm (requested '$REQUESTED'). Run 'npm view react-native versions' to list available versions."
fi
RN_VERSION="$(node -p "const v = JSON.parse(require('fs').readFileSync(0, 'utf8')); Array.isArray(v) ? v[v.length - 1] : v" <<<"$NPM_OUT" 2>/dev/null || true)"
[ -n "$RN_VERSION" ] && [ "$RN_VERSION" != "undefined" ] || die "No react-native version matches '$REQUESTED' on npm."
RN_MINOR="$(echo "$RN_VERSION" | cut -d. -f2)"

restore() {
  if [ "$KEEP" = 1 ]; then
    log "--keep given: example stays pinned to React Native $RN_VERSION. Restore with:"
    echo "  git checkout -- example yarn.lock && yarn install"
    return
  fi
  log "Restoring example app"
  git checkout -- "${TOUCHED[@]}"
  yarn install > /dev/null 2>&1 || log "yarn install failed during restore, run it manually"
}
trap restore EXIT

log "Pinning example app to React Native $RN_VERSION"
RN_VERSION="$RN_VERSION" RN_MINOR="$RN_MINOR" node - "$EXAMPLE/package.json" <<'NODE'
const fs = require('fs');
const file = process.argv[2];
const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
const version = process.env.RN_VERSION;
const minor = Number(process.env.RN_MINOR);
pkg.dependencies['react-native'] = version;
for (const name of Object.keys(pkg.devDependencies)) {
  if (!name.startsWith('@react-native/')) continue;
  // @react-native/jest-preset only exists from 0.85; older versions ship the preset inside react-native.
  if (name === '@react-native/jest-preset' && minor < 85) {
    delete pkg.devDependencies[name];
  } else {
    pkg.devDependencies[name] = version;
  }
}
fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
NODE

log "Installing dependencies"
yarn install

TOML="$EXAMPLE/node_modules/@react-native/gradle-plugin/gradle/libs.versions.toml"
[ -f "$TOML" ] || die "Gradle plugin not found at $TOML"
AGP="$(grep -E '^agp\s*=' "$TOML" | sed -E 's/.*"([^"]+)".*/\1/')"
KOTLIN="$(grep -E '^kotlin\s*=' "$TOML" | sed -E 's/.*"([^"]+)".*/\1/')"
AGP_MAJOR="$(echo "$AGP" | cut -d. -f1)"
if [ "$AGP_MAJOR" -ge 9 ]; then
  SDK=37; GRADLE=9.4.1
else
  SDK=36; GRADLE=9.0.0
fi
log "React Native $RN_VERSION ships AGP $AGP and Kotlin $KOTLIN; using compileSdk $SDK and Gradle $GRADLE"

replace_in_file "$ROOT_GRADLE" 'buildToolsVersion = "[0-9.]+"' "buildToolsVersion = \"$SDK.0.0\""
replace_in_file "$ROOT_GRADLE" 'compileSdkVersion = [0-9]+' "compileSdkVersion = $SDK"
replace_in_file "$ROOT_GRADLE" 'kotlinVersion = "[0-9.]+"' "kotlinVersion = \"$KOTLIN\""
replace_in_file "$ROOT_GRADLE" 'com\.android\.tools\.build:gradle:[0-9.]+' "com.android.tools.build:gradle:$AGP"
replace_in_file "$WRAPPER" 'gradle-[0-9.]+-bin\.zip' "gradle-$GRADLE-bin.zip"
if [ "$AGP_MAJOR" -lt 9 ] && ! grep -q 'org.jetbrains.kotlin.android' "$APP_GRADLE"; then
  # AGP 9 applies Kotlin itself; AGP 8 needs the plugin applied explicitly.
  replace_in_file "$APP_GRADLE" '^(apply plugin: "com\.android\.application"\n)' $'$1apply plugin: "org.jetbrains.kotlin.android"\n'
fi

if [ "$FULL" = 1 ]; then
  TASKS=(:app:assembleGmsDebug)
else
  TASKS=(:react-native-exponea-sdk:compileDebugKotlin :react-native-exponea-sdk:compileDebugJavaWithJavac)
fi

log "Running Gradle: ${TASKS[*]}"
(cd "$EXAMPLE/android" && ./gradlew "${TASKS[@]}" --no-daemon --console=plain -PreactNativeArchitectures=arm64-v8a)

log "SDK Android module compiles against React Native $RN_VERSION"

// Mirrors the classic example app into example_expo. The classic example is
// the source of truth: change it, then run `yarn sync:expo-example`.
// scripts/verify-expo-package.js uses findDrift() to catch forgotten syncs.
//
// Intentional differences between the two apps, inside the mirrored folders:
// - Small text differences are substitutions applied while copying. The only
//   one today is the iOS app group in src/App.tsx (see SUBSTITUTIONS).
// - Whole files that belong to the Expo app are listed in EXPO_OWNED_FILES.
//   The sync never overwrites or deletes them, and the drift check skips them.
//   Use it for an Expo-only file, or for an Expo variant of a classic file that
//   a substitution can't express.
// Everything outside the mirrored folders (app.config.js, plugins/, configs)
// belongs to the Expo app and is never touched.
//
// Safety: the sync refuses to overwrite or delete an example_expo file that it
// didn't write itself and that Git can't restore (untracked, or with uncommitted
// changes), so a direct edit is never lost. Move the change to example/, list
// the file in EXPO_OWNED_FILES, or rerun with --force. What the sync wrote is
// recorded in example_expo/.sync-manifest.json, a local file ignored by Git.
const { Buffer } = require('buffer');
const childProcess = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourceRoot = path.join(root, 'example');
const targetRoot = path.join(root, 'example_expo');

const MIRRORED_FOLDERS = ['src', '__tests__', '__mocks__', 'types'];
const IGNORED_FILES = new Set(['.DS_Store']);
const MANIFEST = path.join(targetRoot, '.sync-manifest.json');

// Paths relative to example_expo, for example 'src/util/ExpoOnly.ts'.
const EXPO_OWNED_FILES = new Set([]);

// Text replaced while copying a file from example/ into example_expo/.
// `occurrences` guards against the classic text changing unnoticed.
const SUBSTITUTIONS = [
  {
    file: path.join('src', 'App.tsx'),
    from: "'group.com.exponea.sdk.example'",
    to: "'group.com.bloomreach.sdk.example.expo'",
    occurrences: 2,
    reason:
      'The Expo app uses its own iOS app group (example_expo/app.config.js).',
  },
];

function filesBelow(directory, rootDirectory = directory) {
  if (!fs.existsSync(directory)) return [];
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory())
      result.push(...filesBelow(absolute, rootDirectory));
    else if (!IGNORED_FILES.has(entry.name))
      result.push(path.relative(rootDirectory, absolute));
  }
  return result.sort();
}

function mirroredFiles(baseDirectory) {
  return MIRRORED_FOLDERS.flatMap((folder) =>
    filesBelow(path.join(baseDirectory, folder), baseDirectory)
  );
}

function isExpoOwned(relativePath) {
  return EXPO_OWNED_FILES.has(relativePath.split(path.sep).join('/'));
}

function expoContent(relativePath, content) {
  let result = content;
  for (const substitution of SUBSTITUTIONS) {
    if (substitution.file !== relativePath) continue;
    const text = result.toString('utf8');
    const found = text.split(substitution.from).length - 1;
    if (found !== substitution.occurrences) {
      throw new Error(
        `Expected ${substitution.from} exactly ${substitution.occurrences} ` +
          `times in example/${relativePath}, found ${found}. Update ` +
          'SUBSTITUTIONS in scripts/sync-expo-example.js.'
      );
    }
    result = Buffer.from(text.split(substitution.from).join(substitution.to));
  }
  return result;
}

// Returns the example_expo paths that differ from what the sync would write.
function findDrift() {
  const sourceFiles = mirroredFiles(sourceRoot);
  const targetFiles = new Set(mirroredFiles(targetRoot));
  const drift = [];
  for (const file of sourceFiles) {
    if (isExpoOwned(file)) continue;
    const expected = expoContent(
      file,
      fs.readFileSync(path.join(sourceRoot, file))
    );
    if (!targetFiles.has(file)) drift.push({ file, reason: 'missing' });
    else if (!expected.equals(fs.readFileSync(path.join(targetRoot, file))))
      drift.push({ file, reason: 'differs' });
  }
  const sourceSet = new Set(sourceFiles);
  for (const file of targetFiles) {
    if (!sourceSet.has(file) && !isExpoOwned(file))
      drift.push({
        file,
        reason:
          'not in example/: move it to example/, or list it in EXPO_OWNED_FILES',
      });
  }
  for (const owned of EXPO_OWNED_FILES) {
    if (!fs.existsSync(path.join(targetRoot, owned)))
      drift.push({
        file: owned,
        reason: 'listed in EXPO_OWNED_FILES but missing: remove the entry',
      });
  }
  return drift.sort((a, b) => a.file.localeCompare(b.file));
}

function hashOf(absolutePath) {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(absolutePath))
    .digest('hex');
}

function readManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  } catch {
    return {};
  }
}

function writeManifest() {
  const manifest = {};
  for (const file of mirroredFiles(targetRoot)) {
    if (!isExpoOwned(file))
      manifest[file] = hashOf(path.join(targetRoot, file));
  }
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
}

// True when nothing would be lost: the sync wrote the current content itself,
// or Git can restore the file because it is tracked and unchanged.
function isSafeToReplace(relativePath, manifest) {
  const absolute = path.join(targetRoot, relativePath);
  if (manifest[relativePath] === hashOf(absolute)) return true;
  const file = path.join('example_expo', relativePath);
  const git = (args) =>
    childProcess.spawnSync('git', args, { cwd: root, stdio: 'ignore' });
  if (git(['ls-files', '--error-unmatch', '--', file]).status !== 0)
    return false;
  return git(['diff', '--quiet', 'HEAD', '--', file]).status === 0;
}

function removeEmptyDirectories(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory())
      removeEmptyDirectories(path.join(directory, entry.name));
  }
  if (fs.readdirSync(directory).length === 0) fs.rmdirSync(directory);
}

function sync({ force = false } = {}) {
  const drift = findDrift();
  const stale = drift.filter(({ reason }) => reason.startsWith('listed in'));
  const changes = drift.filter((entry) => !stale.includes(entry));
  const manifest = readManifest();
  const blocked = changes.filter(
    ({ file, reason }) =>
      reason !== 'missing' && !force && !isSafeToReplace(file, manifest)
  );
  if (stale.length > 0 || blocked.length > 0) {
    for (const { file, reason } of stale)
      console.error(`stale    example_expo/${file}: ${reason}`);
    for (const { file } of blocked)
      console.error(
        `kept     example_expo/${file}: untracked or has uncommitted changes`
      );
    if (blocked.length > 0)
      console.error(
        'Nothing was changed. Move these changes to example/, list Expo-only ' +
          'files in EXPO_OWNED_FILES (scripts/sync-expo-example.js), or rerun ' +
          'with `yarn sync:expo-example --force` to discard them.'
      );
    process.exit(1);
  }
  for (const { file, reason } of changes) {
    const target = path.join(targetRoot, file);
    if (reason.startsWith('not in example/')) {
      fs.rmSync(target);
      console.log(`removed  example_expo/${file}`);
    } else {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(
        target,
        expoContent(file, fs.readFileSync(path.join(sourceRoot, file)))
      );
      console.log(`updated  example_expo/${file}`);
    }
  }
  for (const folder of MIRRORED_FOLDERS)
    removeEmptyDirectories(path.join(targetRoot, folder));
  writeManifest();
  console.log(
    changes.length === 0
      ? 'example_expo is already in sync with example.'
      : `Synced ${changes.length} file(s) from example into example_expo.`
  );
}

module.exports = { MIRRORED_FOLDERS, EXPO_OWNED_FILES, findDrift };

if (require.main === module) sync({ force: process.argv.includes('--force') });

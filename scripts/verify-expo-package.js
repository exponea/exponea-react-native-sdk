const assert = require('assert');
const childProcess = require('child_process');
const path = require('path');
const { MIRRORED_FOLDERS, findDrift } = require('./sync-expo-example');

const root = path.resolve(__dirname, '..');
const packageJson = require(path.join(root, 'package.json'));

assert.equal(packageJson.expo, './app.plugin.js');
assert.equal(packageJson.peerDependencies.expo, '^57.0.0');
assert.equal(packageJson.peerDependenciesMeta.expo.optional, true);
for (const file of ['app.plugin.js', 'plugin']) {
  assert(
    packageJson.files.includes(file),
    `${file} is missing from package files`
  );
}

const drift = findDrift();
if (drift.length > 0) {
  console.error(
    `example_expo is out of sync with example (${MIRRORED_FOLDERS.join(', ')}):`
  );
  for (const { file, reason } of drift)
    console.error(`  example_expo/${file} (${reason})`);
  console.error(
    'Make the change in example/, then run `yarn sync:expo-example`. ' +
      'For an intentional Expo-only file, add it to EXPO_OWNED_FILES in ' +
      'scripts/sync-expo-example.js.'
  );
  process.exit(1);
}

const expoExampleVersion = require(
  path.join(root, 'example_expo', 'package.json')
).dependencies.expo;
assert(
  /^~57\./.test(expoExampleVersion),
  `example_expo must use Expo SDK 57, found ${expoExampleVersion}`
);

// The generated native projects are local prebuild output: they may exist on
// disk, but must never be committed.
const committedGenerated = childProcess
  .execFileSync(
    'git',
    ['ls-files', '--', 'example_expo/android', 'example_expo/ios'],
    { cwd: root, encoding: 'utf8' }
  )
  .trim();
assert.equal(
  committedGenerated,
  '',
  `Generated native projects must not be committed:\n${committedGenerated}`
);

const pack = JSON.parse(
  childProcess.execFileSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: root,
    encoding: 'utf8',
  })
)[0];
const packedFiles = new Set(pack.files.map((entry) => entry.path));
for (const file of [
  'app.plugin.js',
  'plugin/ios/ExponeaNotificationService/NotificationService.swift',
  'plugin/ios/ExponeaNotificationContent/NotificationViewController.swift',
]) {
  assert(packedFiles.has(file), `${file} is missing from npm pack output`);
}
assert(
  ![...packedFiles].some((file) => file.startsWith('example_expo/')),
  'The source example must not be included in the published package'
);

console.log('Expo package and source-only example checks passed.');

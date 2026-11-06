// Deploys the traffic analytics backend (backend/analytics):
//   1. creates/updates the CloudFormation stack (table, logins, API, functions)
//   2. uploads the Lambda code from backend/analytics/src
//   3. prints the values the website needs (src/environments/environment.ts)
//
// Usage: npm run deploy:analytics   (uses the "freshprints" AWS profile unless AWS_PROFILE is set)

const { readdirSync, readFileSync, statSync, writeFileSync, mkdtempSync } = require('fs');
const { join, relative, resolve } = require('path');
const { tmpdir } = require('os');
const { spawnSync } = require('child_process');
const zlib = require('zlib');

// Fresh Prints has its own IAM user; its keys live in the "freshprints" AWS CLI profile.
process.env.AWS_PROFILE = process.env.AWS_PROFILE || 'freshprints';

const stackName = 'freshprints-analytics';
const region = process.env.AWS_REGION || 'us-east-2';
const root = resolve(__dirname, '..', 'backend', 'analytics');
const functions = ['freshprints-analytics-collect', 'freshprints-analytics-api'];

function aws(args, { capture = false } = {}) {
  const result = spawnSync('aws', [...args, '--region', region], {
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
    encoding: 'utf8',
  });
  if (result.status !== 0) process.exit(result.status || 1);
  return capture ? result.stdout : '';
}

// Small "stored" (uncompressed) zip writer so the deploy needs no extra tools.
function zipDirectory(dir) {
  const files = [];
  (function walk(d) {
    for (const name of readdirSync(d)) {
      const full = join(d, name);
      if (statSync(full).isDirectory()) walk(full);
      else files.push(full);
    }
  })(dir);

  const local = [];
  const central = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(relative(dir, file).split('\\').join('/'));
    const data = readFileSync(file);
    const crc = zlib.crc32(data);

    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0x0800, 6); // UTF-8 names
    header.writeUInt16LE(0, 8); // stored
    header.writeUInt32LE(0, 10); // time/date
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(data.length, 18);
    header.writeUInt32LE(data.length, 22);
    header.writeUInt16LE(name.length, 26);
    local.push(header, name, data);

    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0);
    entry.writeUInt16LE(0x031e, 4); // made by: unix
    entry.writeUInt16LE(20, 6);
    entry.writeUInt16LE(0x0800, 8);
    entry.writeUInt16LE(0, 10);
    entry.writeUInt32LE(0, 12);
    entry.writeUInt32LE(crc, 16);
    entry.writeUInt32LE(data.length, 20);
    entry.writeUInt32LE(data.length, 24);
    entry.writeUInt16LE(name.length, 28);
    entry.writeUInt32LE((0o100644 << 16) >>> 0, 38); // file permissions
    entry.writeUInt32LE(offset, 42);
    central.push(entry, name);

    offset += header.length + name.length + data.length;
  }

  const centralSize = central.reduce((n, b) => n + b.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, ...central, end]);
}

console.log(`\n▶ Deploying stack ${stackName} (${region})`);
aws([
  'cloudformation', 'deploy',
  '--stack-name', stackName,
  '--template-file', join(root, 'template.yaml'),
  '--capabilities', 'CAPABILITY_NAMED_IAM',
  '--no-fail-on-empty-changeset',
  '--tags', 'project=freshprints', 'component=analytics',
]);

console.log('\n▶ Uploading function code');
const zipPath = join(mkdtempSync(join(tmpdir(), 'fp-analytics-')), 'code.zip');
writeFileSync(zipPath, zipDirectory(join(root, 'src')));
for (const fn of functions) {
  aws(['lambda', 'update-function-code', '--function-name', fn, '--zip-file', `fileb://${zipPath}`, '--query', 'LastUpdateStatus', '--output', 'text']);
  aws(['lambda', 'wait', 'function-updated', '--function-name', fn]);
  console.log(`  ${fn} updated`);
}

const outputs = JSON.parse(aws([
  'cloudformation', 'describe-stacks', '--stack-name', stackName,
  '--query', 'Stacks[0].Outputs', '--output', 'json',
], { capture: true }));
const get = (key) => outputs.find((o) => o.OutputKey === key)?.OutputValue;

console.log(`
✔ Done. The website's src/environments/environment.ts should contain:

  analytics: {
    apiUrl: '${get('ApiUrl')}',
    collectUrl: '${get('CollectUrl')}',
    region: '${region}',
    userPoolClientId: '${get('UserPoolClientId')}'
  }

User pool: ${get('UserPoolId')}
`);

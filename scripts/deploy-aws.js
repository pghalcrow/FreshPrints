const { existsSync } = require('fs');
const { resolve } = require('path');
const { spawnSync } = require('child_process');

const bucket = process.env.AWS_DEPLOY_BUCKET || 'realfreshprints.com';
const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-2';
const outputDir = resolve('./dist/fresh-prints/browser');
const routes = [
  '/about',
  '/booklets',
  '/catalogs',
  '/flyers',
  '/labels',
  '/packaging',
  '/postcards',
  '/sleeves',
  '/stickers',
  '/upload',
];
const routeAliases = [
  { route: '/services', sourceRoute: '/' },
  { route: '/contact', sourceRoute: '/upload' },
];

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

run('aws', [
  's3',
  'sync',
  outputDir,
  `s3://${bucket}/`,
  '--delete',
  '--region',
  region,
]);

routes.forEach((route) => {
  const routePath = route.replace(/^\//, '');
  const prerenderedIndex = resolve(outputDir, routePath, 'index.html');

  if (!existsSync(prerenderedIndex)) {
    throw new Error(`Missing prerendered route file: ${prerenderedIndex}`);
  }

  run('aws', [
    's3',
    'cp',
    prerenderedIndex,
    `s3://${bucket}/${routePath}`,
    '--content-type',
    'text/html',
    '--cache-control',
    'no-cache',
    '--region',
    region,
  ]);
});

routeAliases.forEach(({ route, sourceRoute }) => {
  const routePath = route.replace(/^\//, '');
  const prerenderedIndex = sourceRoute === '/'
    ? resolve(outputDir, 'index.html')
    : resolve(outputDir, sourceRoute.replace(/^\//, ''), 'index.html');

  if (!existsSync(prerenderedIndex)) {
    throw new Error(`Missing prerendered alias source file: ${prerenderedIndex}`);
  }

  run('aws', [
    's3',
    'cp',
    prerenderedIndex,
    `s3://${bucket}/${routePath}`,
    '--content-type',
    'text/html',
    '--cache-control',
    'no-cache',
    '--region',
    region,
  ]);
});

console.log(`Deployed ${outputDir} to s3://${bucket}/`);

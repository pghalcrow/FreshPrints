const { createWriteStream, mkdirSync } = require('fs');
const { resolve } = require('path');
const { execSync } = require('child_process');
const { SitemapStream, streamToPromise } = require('sitemap');

const outputDir = resolve('./dist/fresh-prints/browser');
const outputPath = resolve(outputDir, 'sitemap.xml');
const sitemap = new SitemapStream({ hostname: 'https://realfreshprints.com' });

mkdirSync(outputDir, { recursive: true });
const writeStream = createWriteStream(outputPath);
sitemap.pipe(writeStream);

const routes = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/about', changefreq: 'monthly', priority: 0.8 },
  { url: '/booklets', changefreq: 'monthly', priority: 0.9 },
  { url: '/catalogs', changefreq: 'monthly', priority: 0.9 },
  { url: '/flyers', changefreq: 'monthly', priority: 0.9 },
  { url: '/labels', changefreq: 'monthly', priority: 0.9 },
  { url: '/packaging', changefreq: 'monthly', priority: 0.9 },
  { url: '/postcards', changefreq: 'monthly', priority: 0.9 },
  { url: '/kearny-postcards', changefreq: 'monthly', priority: 0.7 },
  { url: '/sleeves', changefreq: 'monthly', priority: 0.9 },
  { url: '/stickers', changefreq: 'monthly', priority: 0.9 },
  { url: '/faq', changefreq: 'monthly', priority: 0.8 },
  { url: '/upload', changefreq: 'yearly', priority: 0.5 },
];

// Date of the last commit that touched the page's source folder.
function lastModified(url) {
  const page = url === '/' ? 'home' : url.replace(/^\//, '');

  try {
    const date = execSync(`git log -1 --format=%cs -- src/app/pages/${page}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return date || undefined;
  } catch {
    return undefined;
  }
}

routes.forEach((route) => {
  const lastmod = lastModified(route.url);
  sitemap.write(lastmod ? { ...route, lastmod } : route);
});
sitemap.end();

streamToPromise(sitemap).then(() => {
  console.log('Sitemap generated successfully.');
});

const { createWriteStream, mkdirSync } = require('fs');
const { resolve } = require('path');
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
  { url: '/sleeves', changefreq: 'monthly', priority: 0.9 },
  { url: '/stickers', changefreq: 'monthly', priority: 0.9 },
  { url: '/upload', changefreq: 'yearly', priority: 0.5 },
];

routes.forEach((route) => sitemap.write(route));
sitemap.end();

streamToPromise(sitemap).then(() => {
  console.log('Sitemap generated successfully.');
});

const express = require('express');
const router = express.Router();
const Property = require('../models/Property');

router.get('/sitemap.xml', async (req, res) => {
  res.header('Content-Type', 'application/xml');
  
  try {
    const properties = await Property.find({}, '_id updatedAt').lean();
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    
    // 1. Static Pages
    const staticPages = [
      { url: 'https://manyprop.onrender.com/', priority: '1.0', changefreq: 'daily' },
      { url: 'https://manyprop.onrender.com/home', priority: '0.9', changefreq: 'daily' },
      { url: 'https://manyprop.onrender.com/properties', priority: '0.8', changefreq: 'daily' },
      { url: 'https://manyprop.onrender.com/post-property', priority: '0.7', changefreq: 'weekly' },
      { url: 'https://manyprop.onrender.com/compare', priority: '0.5', changefreq: 'weekly' },
      { url: 'https://manyprop.onrender.com/login', priority: '0.5', changefreq: 'monthly' },
      { url: 'https://manyprop.onrender.com/register', priority: '0.5', changefreq: 'monthly' }
    ];
    
    staticPages.forEach(p => {
      xml += `  <url>\n`;
      xml += `    <loc>${p.url}</loc>\n`;
      xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
      xml += `    <priority>${p.priority}</priority>\n`;
      xml += `  </url>\n`;
    });
    
    // 2. Dynamic Property Pages
    properties.forEach(p => {
      const lastMod = p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      xml += `  <url>\n`;
      xml += `    <loc>https://manyprop.onrender.com/properties/${p._id}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });
    
    xml += `</urlset>\n`;
    
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap generation failed:', error);
    // Return a basic fallback sitemap on failure so crawlers don't error out
    let fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    fallbackXml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    fallbackXml += `  <url>\n`;
    fallbackXml += `    <loc>https://manyprop.onrender.com/</loc>\n`;
    fallbackXml += `    <priority>1.0</priority>\n`;
    fallbackXml += `  </url>\n`;
    fallbackXml += `</urlset>\n`;
    return res.status(200).send(fallbackXml);
  }
});

module.exports = router;

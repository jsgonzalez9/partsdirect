import { getAllPartNumbers, getAllSymptomSlugs } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const host = req.headers.get('host') || 'partsdirect.vercel.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Fetch all parts and symptoms
    const partNumbers = await getAllPartNumbers(10000);
    const symptomSlugs = await getAllSymptomSlugs(1000);

    const staticRoutes = [
      '',
      '/compatibility',
      '/dashboard',
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes.map(route => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
  ${partNumbers.map(num => `
  <url>
    <loc>${baseUrl}/p/${num}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
  ${symptomSlugs.map(slug => `
  <url>
    <loc>${baseUrl}/symptom/${slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59'
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}

import { getAllPartNumbers, getAllSymptomSlugs } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const host = req.headers.get('host') || 'partsdirect.vercel.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Fetch parts and symptoms (Reduced limit for baseline stability)
    const partNumbers = await getAllPartNumbers(5000);
    const symptomSlugs = await getAllSymptomSlugs(1000);

    const staticRoutes = [
      { path: '/', priority: '1.0' },
      { path: '/compatibility', priority: '0.8' },
      { path: '/dashboard', priority: '0.8' },
    ];

    const today = new Date().toISOString().split('T')[0];

    const escapeXml = (unsafe: string) => {
      return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '\'': return '&apos;';
          case '"': return '&quot;';
          default: return c;
        }
      });
    };

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes.map(route => `
  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('')}
  ${partNumbers.map(num => `
  <url>
    <loc>${baseUrl}/p/${escapeXml(num)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
  ${symptomSlugs.map(slug => `
  <url>
    <loc>${baseUrl}/symptoms/${escapeXml(slug)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('')}
</urlset>`.trim();

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59'
      },
    });
  } catch (error: any) {
    console.error('Sitemap generation error:', error);
    return new Response(`Error generating sitemap: ${error.message || JSON.stringify(error)}`, { status: 500 });
  }
}

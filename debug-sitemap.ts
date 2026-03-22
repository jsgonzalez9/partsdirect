import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getAllPartNumbers, getAllSymptomSlugs } from './src/lib/supabase';

async function debugSitemap() {
  console.log('--- Debugging Sitemap Generation ---');
  try {
    console.log('Fetching part numbers...');
    const parts = await getAllPartNumbers(10);
    console.log('Parts found:', parts);

    console.log('Fetching symptom slugs...');
    const symptoms = await getAllSymptomSlugs(10);
    console.log('Symptoms found:', symptoms);

    console.log('Success!');
  } catch (error) {
    console.error('DEBUG ERROR:', error);
  }
}

debugSitemap();

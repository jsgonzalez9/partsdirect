import { getSEOPage } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Wrench, ArrowRight, ShieldAlert, Clock, Phone, MapPin, CheckCircle2, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface SymptomPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: SymptomPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const page = await getSEOPage(slug);
    if (!page) return { title: 'Symptom Not Found' };

    return {
      title: page.seo_title,
      description: page.seo_description,
    };
  } catch (error) {
    return { title: 'Symptom Troubleshooting' };
  }
}

export default async function SymptomPage({ params }: SymptomPageProps) {
  const { slug } = await params;
  
  let page;
  try {
    page = await getSEOPage(slug);
  } catch (error) {
    console.error('Error fetching symptom page:', error);
    notFound();
  }

  if (!page) {
    notFound();
  }

  const parts = page.seo_page_parts?.map((p: any) => p.parts) || [];
  const firstPart = parts[0] || { name: 'Replacement Part', price: 0, brand: 'OEM' };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="border-b border-zinc-100 bg-white/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-black tracking-tighter text-orange-600">
            PARTS<span className="text-zinc-900">DIRECT</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 leading-tight">
              {page.title}
            </h1>
            <div className="prose max-w-none text-xl text-zinc-500 mb-8" dangerouslySetInnerHTML={{ __html: page.content }} />
          </div>

          {/* Lead Gen Box */}
          <div className="mb-16 bg-zinc-900 rounded-2xl p-8 text-white border-l-8 border-orange-600">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Need a professional fix?</h2>
                <p className="text-zinc-400 mb-0">
                  Find certified mechanics near you to diagnose and repair this issue today.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <Button className="bg-orange-600 hover:bg-orange-700 font-bold h-12 px-8 flex items-center gap-2">
                  <MapPin size={18} />
                  Find a mechanic
                </Button>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Wrench className="text-orange-600" size={24} />
            Recommended Replacement Components
          </h2>

          <div className="grid gap-8">
            {parts.map((part: any) => (
              <div key={part.id} className="border-2 border-zinc-100 rounded-2xl p-8 hover:border-orange-200 transition-all group">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="border-zinc-200 text-zinc-500 uppercase tracking-widest text-[10px]">{part.brand}</Badge>
                      <Badge className="bg-orange-100 text-orange-600 border-none px-3 py-1 font-bold">{part.category}</Badge>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-orange-600 transition-colors">
                      {part.name}
                    </h3>
                    <p className="text-zinc-500 mb-6 leading-relaxed">
                      {part.description}
                    </p>
                  </div>
                  
                  <div className="md:w-64">
                    <div className="bg-zinc-50 rounded-xl p-6 text-center">
                      <p className="text-zinc-400 text-xs mb-1 uppercase font-bold tracking-widest">Est. Part Price</p>
                      <p className="text-3xl font-black mb-6">${part.price?.toFixed(2) || '0.00'}</p>
                      <Link href={`/p/${part.part_number}`}>
                        <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold h-12">
                          View details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

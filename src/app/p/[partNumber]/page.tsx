import { getPartByNumber } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { PriceComparison } from "@/components/PriceComparison";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Truck, Shield, AlertTriangle, CheckCircle, Wrench, Clock } from "lucide-react";

interface PartPageProps {
  params: Promise<{
    partNumber: string;
  }>;
}

export default async function PartPage({ params }: PartPageProps) {
  const { partNumber } = await params;
  
  let part;
  try {
    part = await getPartByNumber(partNumber);
  } catch (error) {
    console.error('Error fetching part:', error);
    notFound();
  }

  if (!part) {
    notFound();
  }

  // Handle the case where prices might be empty or missing
  const prices = part.prices || [];
  const bestPrice = [...prices].sort((a, b) => (a.price + (a.shipping_cost || 0)) - (b.price + (b.shipping_cost || 0)))[0];

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <header className="border-b border-[#333333] bg-[#1a1a1a]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold">
              Parts<span className="text-[#f96706]">Direct</span>
            </a>
          </div>
        </div>
      </header>

      {/* Product Detail */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Product Info */}
          <div>
            <div className="bg-[#1e1e1e] border border-[#333333] rounded-lg p-8 mb-6">
              <div className="h-80 bg-[#2a2a2a] rounded-lg flex items-center justify-center">
                <span className="text-6xl font-bold text-gray-700">
                  {part.part_number.slice(0, 2)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{part.part_number}</span>
                {part.oem_flag && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    OEM
                  </Badge>
                )}
                <Badge className="bg-[#333333] text-gray-300">{part.brand}</Badge>
              </div>

              <h1 className="text-3xl font-bold">{part.name}</h1>

              <p className="text-gray-400">{part.description}</p>

              <div className="flex items-center gap-4 pt-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <Truck size={18} />
                  <span className="text-sm">Free shipping over $35</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Shield size={18} />
                  <span className="text-sm">2-year warranty</span>
                </div>
              </div>

              {/* Symptoms Section */}
              {part.failures && part.failures.length > 0 && (
                <div className="mt-6 p-4 bg-[#1e1e1e] border border-[#333333] rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="text-amber-500" size={20} />
                    Common Symptoms
                  </h3>
                  <div className="space-y-3">
                    {part.failures.map((failure, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-[#2a2a2a] rounded">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          failure.severity_score >= 8 ? 'bg-red-500' :
                          failure.severity_score >= 5 ? 'bg-orange-500' : 'bg-yellow-500'
                        }`} />
                        <div className="flex-1">
                          <p className="font-medium">{failure.symptom}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                            <span className={failure.urgency_score >= 8 ? 'text-red-400' : ''}>
                              Urgency: {failure.urgency_score}/10
                            </span>
                            <span>{failure.drivable ? '✓ Safe to drive' : '✗ Do not drive'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Install Info */}
              {part.install_info && part.install_info[0] && (
                <div className="mt-6 p-4 bg-[#1e1e1e] border border-[#333333] rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Wrench className="text-[#f96706]" size={20} />
                    Installation
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Difficulty</p>
                      <p className="font-medium">{part.install_info[0].skill_level}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium flex items-center gap-1">
                        <Clock size={14} /> {part.install_info[0].labor_hours || '1-2'} hours
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Price & Actions */}
          <div className="space-y-6">
            <div className="bg-[#1e1e1e] border border-[#333333] rounded-lg p-6">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-[#f96706]">
                  ${part.price.toFixed(2)}
                </span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  In Stock
                </Badge>
              </div>

              <Button className="w-full bg-[#f96706] hover:bg-orange-600 text-white h-12 text-lg mb-4">
                <ShoppingCart className="mr-2" size={20} />
                View Best Price
              </Button>

              {bestPrice && (
                <a 
                  href={bestPrice.affiliate_link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full border-[#333333] text-white hover:bg-[#2a2a2a] h-12"
                  >
                    Check {bestPrice.retailer}
                  </Button>
                </a>
              )}
            </div>

            {prices.length > 0 && <PriceComparison prices={prices} />}

            {/* Mechanic Lead Gen */}
            <div className="bg-gradient-to-br from-[#f96706]/20 to-[#f96706]/5 border border-[#f96706]/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Need a Mechanic?</h3>
              <p className="text-sm text-gray-400 mb-4">
                Get quotes from local shops for {part.name} installation
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter ZIP code"
                  className="w-full bg-[#121212] border border-[#333333] rounded px-4 py-3 text-white placeholder:text-gray-500"
                />
                <Button className="w-full bg-white text-black hover:bg-gray-200 h-12">
                  Get Free Quotes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

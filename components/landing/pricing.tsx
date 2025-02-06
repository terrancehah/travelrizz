import { cn } from '@/utils/cn'
import { Badge } from '@/components/ui/badge'
import { Button } from "@/components/ui/button"
import Link from "next/link"



export default function Pricing() {
  return (
    <section id="pricing" className="w-full py-16 bg-gradient-to-b from-white to-blue-50/20">
      <div className="container w-[80%] mx-auto">
        
        <h2 className="text-4xl md:text-5xl font-caveat text-primary text-center mb-6">
          Simple & Transparent Pricing
        </h2>
        
        <p className="text-lg text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Get access for a single payment. We're exploring subscription options 
          for frequent travelers, but will always keep one-time pricing available.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Current Pricing */}
          <div className="p-8 rounded-xl border-2 border-primary bg-white">
            <h3 className="text-3xl font-caveat font-bold mb-4">One-Time Access</h3>
            <div className="text-2xl font-raleway text-primary mb-6">
              $1.99
              <span className="text-lg text-gray-500 ml-2">(one-time)</span>
            </div>
            <div className="space-y-4 mb-8">
              <ul className="space-y-2">
                <li className="flex items-center">✓ Unlimited AI suggestions</li>
                <li className="flex items-center">✓ Visualised route optimization</li>
                <li className="flex items-center">✓ Cultural etiquette guides</li>
                <li className="flex items-center">✓ Ad-Free Experience</li>
                {/* <li className="flex items-center">✓ Lifetime updates</li> */}
              </ul>
            </div>
          </div>

          {/* Future Subscription */}
          <div className={cn(
            "p-8 rounded-xl border-2 bg-white",
            "border-gray-200 opacity-100 relative"
          )}>
            <Badge variant="outline" className="absolute -top-3 right-4 bg-white">
              Future Plan
            </Badge>
            <h3 className="text-3xl font-caveat font-bold mb-4 text-gray-400">Monthly Access</h3>
            <div className="text-2xl font-raleway text-gray-400 mb-6">
              $9.99<span className="text-lg ml-2">/month</span>
            </div>
            <div className="space-y-4 mb-8">
              <p className="text-gray-400">
                For frequent travelers (coming soon):
              </p>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">✓ Team collaboration</li>
                <li className="flex items-center">✓ Multi-trip management</li>
                <li className="flex items-center">✓ Premium templates</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-x-4 w-full pt-12 items-center flex justify-center">
          <Button asChild size="lg" className="bg-sky-blue/90 text-white hover:bg-sky-blue hover:shadow-md border border-slate-500">
            <Link href="/travel-form">Let's Plan Together</Link>
          </Button>
        </div>

      </div>
    </section>
  )
}

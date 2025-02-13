import { cn } from '@/utils/cn'
import { Badge } from '@/components/ui/badge'
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Pricing() {
  return (
    <section id="pricing" className="w-full py-16 bg-white dark:bg-gray-900">
      <div className="container w-[80%] mx-auto">
        <h2 className="text-4xl md:text-5xl font-caveat text-primary dark:text-sky-100 text-center mb-6">
          Simple Pricing
        </h2>
        
        <p className="text-lg text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
          Get access for a single payment. We're exploring subscription options 
          for frequent travelers, but will always keep one-time pricing available.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Current Pricing */}
          <div className="p-8 rounded-xl border-2 border-primary dark:border-sky-400 bg-white dark:bg-gray-800/85 transition-colors duration-400 space-y-6">
            <h3 className="text-3xl font-caveat font-bold mb-4 dark:text-white">One-Time Access</h3>
            <div className="gap-x-4 gap-y-2 flex flex-wrap">
              <span className="text-2xl font-raleway text-primary order-1 basis-1/5 dark:text-white">US$1.99</span>
              <span className=" text-2xl font-raleway text-gray-400 order-1 basis-1/5 line-through">US$2.99</span>
              <span className="bg-blue-200 dark:bg-sky-500 text-blue-500 dark:text-sky-100 text-base font-medium px-2.5 py-1 order-2 rounded">Early Adopter Special</span>
              {/* <span className="text-lg text-gray-500 dark:text-gray-400 ml-2">(one-time)</span> */}
            </div>
            <div className="space-y-4 mb-2">
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 text-base">
                <li className="flex items-center">✓ Unlimited AI suggestions</li>
                <li className="flex items-center">✓ Visualised route optimization</li>
                <li className="flex items-center">✓ Local etiquette guidance</li>
                <li className="flex items-center">✓ Ad-Free experience</li>
              </ul>
            </div>
          </div>

          {/* Future Subscription */}
          <div className="p-8 rounded-xl border-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-400 opacity-100 relative">
            <Badge variant="outline" className="absolute -top-3 right-4 bg-white dark:bg-gray-800 dark:text-gray-300">
              Coming Soon
            </Badge>
            <h3 className="text-3xl font-caveat font-bold mb-6 mt-0 text-gray-400 dark:text-gray-500">Monthly Access</h3>
            <div className="gap-x-4 gap-y-2 flex flex-wrap mb-6">
              <span className="text-2xl font-raleway text-gray-400 dark:text-gray-500"> US$9.99 /month</span>
              <span className="bg-blue-600/50 dark:bg-blue-600/70 text-blue-600 dark:text-gray-400 text-base font-medium px-2.5 py-1 order-2 basis-min rounded">For Frequent Travelers</span>
            </div>
            <div className="space-y-4 mb-2">
                <ul className="space-y-2 text-gray-400 dark:text-gray-500 text-base">
                  <li className="flex items-center">✓ Team collaboration</li>
                  <li className="flex items-center">✓ Multi-trip management</li>
                  <li className="flex items-center">✓ Premium templates</li>
                  <li className="flex items-center">✓ Advanced attractions information</li>
                </ul>
            </div>
          </div>
        </div>

        <div className="space-x-4 w-full pt-12 items-center flex justify-center">
          <Button asChild size="lg" className="bg-sky-blue hover:bg-sky-600 text-white dark:bg-sky-500 dark:hover:bg-sky-400">
            <Link href="/travel-form">Let's Plan Together</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

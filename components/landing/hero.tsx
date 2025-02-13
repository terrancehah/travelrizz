import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Hero() {
  return (
    <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 flex items-center bg-white dark:bg-gray-900 transition-colors duration-400">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat "
        style={{
          backgroundImage: 'url("/images/kalbarri-beach.jpeg")',
          opacity: 0.4
        }}
      />
      {/* Content */}
      <div className="relative z-10 flex flex-col w-[80%] mx-auto items-center space-y-6 text-center">
        <div className="space-y-6">
          <h1 className="text-3xl font-semi-bold font-caveat tracking-tighter text-primary dark:text-sky-100 sm:text-4xl md:text-5xl lg:text-6xl/none">
            Plan Your Dream Trip Effortlessly
          </h1>
          <p className="mx-auto max-w-[700px] font-raleway text-gray-700 dark:text-sky-100 md:text-xl">
            Let's plan your perfect journey together, combining human expertise with AI assistance to create a personalized trip that's uniquely yours. 
            No more overwhelming planning - just the joy of looking forward to your next adventure.
          </p>
        </div>
        <div className="space-x-4">
          <Button asChild size="lg" className="bg-sky-blue hover:bg-sky-600 text-white dark:bg-sky-500 dark:hover:bg-sky-400">
            <Link href="/travel-form">Let's Plan Together</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

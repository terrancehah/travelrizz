import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {cn} from "@/utils/cn"

export default function Features() {
  const features = [
    {
      title: "AI Chat Interface",
      description:
        "Have a conversation with Travel-Rizz about your dream trip. Share your ideas, and we'll help shape them into reality.",
      image: "/images/ai-chat-interface.png",
    },
    {
      title: "Dynamic Travel Insights",
      description:
        "Travel with confidence knowing you have all the essential details - from weather patterns to local customs - right when you need them.",
      image: "/images/generative-ui.png",
    },
    {
      title: "Visualised Route Planning",
      description:
        "See your daily adventures come to life with interactive maps. Optimize your routes and make the most of every day of your journey.",
      image: "/images/visualised-routes.png",
    },
    {
      title: "Flexible Itinerary Builder",
      description:
        "Easily organize and reorganize your plans with our intuitive drag-and-drop interface. Your perfect itinerary is just a few clicks away.",
      image: "/images/daily-itinerary-planning.png",
    },
  ]

  return (
    <section id="features" className="w-full py-16 flex items-center bg-white dark:bg-gray-900 transition-colors duration-400">
      <div className="container w-[80%] md:w-[90%] mx-auto">

        <h2 className="text-4xl md:text-5xl font-caveat text-primary dark:text-sky-100 text-center mb-12">
          How We Make Travel Planning Effortless
        </h2>

        {/* Mobile Layout (default) */}
        <div className="grid grid-cols-1 gap-6 md:hidden">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col gap-y-4 p-6 bg-gray-100/80 dark:bg-gray-700/70 rounded-xl backdrop-blur-sm transition-all duration-300"
            >
              <Image
                src={feature.image}
                alt={feature.title}
                width={600}
                height={400}
                className="rounded-lg border border-gray-200 dark:border-gray-700 object-cover w-full"
              />
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-medium font-raleway text-primary dark:text-sky-100">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg font-raleway leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tablet Layout (2x2 grid) */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col gap-y-4 p-6 bg-gray-100/80 dark:bg-gray-700/70 rounded-xl backdrop-blur-sm transition-all duration-300"
            >
              <div className="relative w-full h-[300px]">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="rounded-lg border border-gray-200 dark:border-gray-700 object-cover"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-medium font-raleway text-primary dark:text-sky-100">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg font-raleway leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid grid-cols-12 gap-8 mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "group overflow-hidden rounded-xl bg-sky-100/50 dark:bg-gray-700/70 backdrop-blur-sm transition-all duration-300",
                index === 0 || index === 3 ? "col-span-8 h-[350px]" : "col-span-4 h-[350px]"
              )}
            >
              <div className={cn(
                "h-full w-full p-6 flex",
                index === 0 || index === 3 ? "flex-row items-center" : "flex-col"
              )}>
                <div className={cn(
                  "relative",
                  index === 0 || index === 3 ? "w-[62.5%] h-[100%]" : "w-full h-2/3"
                )}>
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="rounded-lg border border-gray-200 dark:border-gray-700 object-cover"
                  />
                </div>
                <div className={cn(
                  "flex flex-col justify-center",
                  index === 0 || index === 3 ? "w-[37.5%] pl-6" : "w-full h-1/2 pt-2"
                )}>
                  <h3 className="text-xl font-medium font-raleway text-primary dark:text-sky-100 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-md font-raleway leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* <div className="space-x-4 w-full pt-12 items-center flex justify-center">
          <Button asChild size="lg" className="bg-sky-blue/90 text-white hover:bg-sky-blue hover:shadow-md border border-slate-500">
            <Link href="/travel-form">Let's Plan Together</Link>
          </Button>
        </div> */}
      </div>
      
    </section>
  )
}

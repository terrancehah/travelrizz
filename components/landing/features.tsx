import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Features() {
  const features = [
    {
      title: "AI Chat Interface",
      description:
        "Have a conversation about your dream trip. Share your ideas, and we'll help shape them into reality with personalized suggestions that evolve as we learn more about what matters to you.",
      image: "/images/ai-chat-interface.png",
    },
    {
      title: "Dynamic Travel Insights",
      description:
        "Travel with confidence knowing you have all the essential details - from weather patterns to local customs - right when you need them. Real insights that help you plan smarter and travel better.",
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
      <div className="container w-[80%] mx-auto">

        <h2 className="text-4xl md:text-5xl font-caveat text-primary dark:text-sky-400 text-center mb-12">
          How We Make Travel Planning Effortless
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col gap-y-4 p-8 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl backdrop-blur-sm"
            >
              <Image
                src={feature.image}
                alt={feature.title}
                width={600}
                height={400}
                className="rounded-lg border border-gray-200 dark:border-gray-700 object-cover w-full"
              />
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-medium font-raleway text-primary dark:text-sky-300">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg font-raleway leading-relaxed">{feature.description}</p>
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

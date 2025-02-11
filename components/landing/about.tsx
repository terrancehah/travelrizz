export default function About() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-800/50 transition-colors duration-400">
      <div className="container px-6 md:px-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-caveat tracking-tighter text-primary dark:text-sky-400 sm:text-4xl md:text-5xl transition-colors duration-400">
              About Travel-Rizz
            </h2>
            <p className="max-w-[900px] text-gray-600 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed transition-colors duration-400">
              I created Travel-Rizz because I believe everyone deserves to experience the joy of perfectly planned travel, regardless of their planning expertise. Having spent years helping friends and family organize their trips, I noticed how overwhelming the process can be.
            </p>
            <p className="max-w-[900px] text-gray-600 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed transition-colors duration-200">
            Travel shouldn't be stressful - it should be an exciting journey right from the planning stage. 
            That's why I combined the power of AI with my passion for travel to create a tool that makes trip planning as enjoyable as the trip itself.
            </p>
            <p className="max-w-[900px] text-gray-600 dark:text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed transition-colors duration-200">
              Whether you're a seasoned traveler or planning your first adventure, Travel-Rizz is here to make your dream trip a reality, one personalized recommendation at a time.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

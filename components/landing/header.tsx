import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Twitter, Instagram, Facebook, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useLocalizedFont } from "@/hooks/useLocalizedFont"

export default function Header() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const fonts = useLocalizedFont()

  // Only render theme switch after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky flex top-0 z-50 w-full bg-light-blue/95 backdrop-blur supports-[backdrop-filter]:bg-light-blue/60 dark:bg-gray-900 shadow-sm transition-colors duration-400">
      <div className="flex p-3 px-4 w-full justify-between items-center">

        {/* Logo and Brand Name */}
        <Link href="/" className={`flex gap-x-1 ${fonts.heading} cursor-pointer`}>
          <Image
            src="/images/travel-rizz.png"
            alt="Travel-Rizz Logo"
            width={40}
            height={40}
            className="h-12 w-12 object-contain dark:invert dark:brightness-0 dark:contrast-200 transition-colors duration-400"
          />
          <span className={`font-caveat text-3xl h-min my-auto text-primary dark:text-white ${fonts.heading} transition-colors duration-400`}>Travel-Rizz</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-x-1">
          <div className="hidden md:flex items-center gap-x-4">
            <Link href="https://x.com/travelrizz" target="_blank" className="text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors duration-400">
              <Twitter className="h-6 w-6" />
            </Link>
            <Link href="https://instagram.com/travelrizz" target="_blank" className="text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors duration-400">
              <Instagram className="h-6 w-6" />
            </Link>
            <Link href="https://facebook.com/travelrizz" target="_blank" className="text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors duration-400">
              <Facebook className="h-6 w-6" />
            </Link>
          </div>
          
          {mounted && (
            <div className="flex items-center gap-x-1">
              <div className="flex items-right justify-end rounded-md p-2">
                <LanguageSwitcher />
              </div>

              <div className="flex items-center justify-center bg-sky-200/80 dark:bg-blue-900 rounded-md p-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className="w-6 h-6 relative"
                >
                  <Sun className="h-[1.5rem] w-[1.5rem] rotate-0 scale-100 transition-all duration-300 dark:rotate-90 dark:scale-0 text-secondary hover:text-primary dark:text-white" />
                  <Moon className="absolute h-[1.5rem] w-[1.5rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-gray-300 hover:text-white" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </div>
              
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

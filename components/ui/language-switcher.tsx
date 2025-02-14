import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Languages } from "lucide-react"
import { useRouter } from "next/router"

const languages = {
  en: "English",
  ms: "Bahasa Melayu",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  cs: "Čeština",
  zh: "简体中文",
  ja: "日本語",
  ko: "한국어"
}

export function LanguageSwitcher() {
  const router = useRouter()
  const { pathname, asPath, query, locale } = router

  const changeLanguage = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; max-age=31536000; path=/`
    router.push(router.asPath, router.asPath, { locale: newLocale })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-6 h-6"
        >
          <Languages className="h-[1.5rem] w-[1.5rem] text-secondary hover:text-primary dark:text-gray-300 dark:hover:text-white" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        {Object.entries(languages).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            className={`font-raleway cursor-pointer text-secondary dark:text-gray-300 hover:text-primary dark:hover:text-white ${
              locale === code ? 'bg-light-blue/90 dark:bg-sky-900' : ''
            }`}
            onClick={() => changeLanguage(code)}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

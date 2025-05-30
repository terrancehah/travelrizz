import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/router"
import { cn } from "@/utils/cn"
import React from "react"

const languages = {
  en: "English",
  ms: "Bahasa Melayu",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  cs: "Čeština",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  ja: "日本語",
  ko: "한국어"
}

const buttonLabels = {
  en: "EN",
  ms: "MY",
  es: "ES",
  fr: "FR",
  de: "DE",
  it: "IT",
  cs: "CS",
  "zh-CN": "简中",
  "zh-TW": "繁中",
  ja: "JP",
  ko: "KR"
}

export function LanguageSwitcher() {
  const router = useRouter()
  const { pathname, asPath, query, locale } = router

  const changeLanguage = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; max-age=31536000; path=/`
    router.push(router.asPath, router.asPath, { locale: newLocale })
  }

  // Get short display name for the button
  const getButtonLabel = (locale: string | undefined) => {
    if (!locale) return 'EN'
    return buttonLabels[locale as keyof typeof buttonLabels] || locale.toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <span className="font-semibold text-base text-secondary hover:text-primary dark:hover:text-white dark:text-gray-300">
            {getButtonLabel(locale)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[180px] bg-white dark:bg-gray-800"
        align="end"
        sideOffset={8}
        alignOffset={-8}
      >
        {Object.entries(languages).map(([code, name], index) => {
          const isLast = index === Object.entries(languages).length - 1;
          return (
            <React.Fragment key={code}>
              <DropdownMenuItem
                className={cn(
                  "cursor-pointer text-base text-secondary dark:text-gray-300 hover:text-primary hover:bg-sky-100 dark:hover:bg-sky-800 dark:hover:text-white",
                  locale === code && "bg-sky-200 dark:bg-sky-900"
                )}
                onClick={() => changeLanguage(code)}
              >
                {name}
              </DropdownMenuItem>
              {!isLast && <DropdownMenuSeparator />}
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

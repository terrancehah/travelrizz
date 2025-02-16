import { useRouter } from 'next/router'

type FontClass = {
  text: string
  heading: string
}

export function useLocalizedFont(): FontClass {
  const { locale } = useRouter()

  if (locale === 'zh-CN' || locale === 'zh-TW') {
    return {
      text: 'font-noto-sc font-normal tracking-normal',
      heading: 'font-noto-sc font-semi-bold tracking-normal', 
    }
  }

  return {
    text: 'font-raleway',
    heading: 'font-caveat tracking-tight',
  }
}

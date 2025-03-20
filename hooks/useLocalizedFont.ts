import { useRouter } from 'next/router'

type FontClass = {
  text: string
  heading: string
}

export function useLocalizedFont(): FontClass {
  const { locale } = useRouter()

  if (locale === 'zh-CN' || locale === 'zh-TW') {
    return {
      text: 'font-noto-sc',
      heading: 'font-noto-sc', 
    }
  }

  return {
    text: 'font-raleway',
    heading: 'font-caveat',
  }
}

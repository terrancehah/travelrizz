import { useRouter } from 'next/router'

type FontClass = {
  text: string
  heading: string
}

export function useLocalizedFont(): FontClass {
  const { locale } = useRouter()

  if (locale === 'zh') {
    return {
      text: 'font-noto-sc font-normal',
      heading: 'font-noto-sc font-semi-bold tracking-tight', 
    }
  }

  return {
    text: 'font-raleway',
    heading: 'font-caveat tracking-tight',
  }
}

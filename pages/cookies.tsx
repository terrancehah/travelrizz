import Cookies from '../components/landing/cookies';
import Header from "@/components/landing/header"
import Footer from "@/components/landing/footer"

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="flex flex-col">
        <Cookies />
      </main>
      <Footer />
    </>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
      props: {
          messages: {
              landing: (await import(`../public/locales/${locale}/landing.json`)).default,
              travelForm: (await import(`../public/locales/${locale}/travel-form.json`)).default,
              travelChat: (await import(`../public/locales/${locale}/travel-chat.json`)).default,
              parameters: (await import(`../public/locales/${locale}/parameters.json`)).default,
              components: (await import(`../public/locales/${locale}/components.json`)).default
          },
          locale,
          timeZone: 'Asia/Singapore'
      }
  }
}

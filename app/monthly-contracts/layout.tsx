import Header from '@/components/shared/header'
import Footer from '@/components/shared/footer'
import WhatsAppButton from '@/components/shared/whatsapp-button'

export default function MonthlyContractsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='flex flex-col min-h-screen font-cairo' dir="rtl">
      <Header />
      <main className='flex-1 flex flex-col'>{children}</main>
      <Footer />
      <WhatsAppButton phoneNumber="+201014535302" />
    </div>
  )
}

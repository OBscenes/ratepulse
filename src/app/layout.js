import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata = {
  title: 'RatePulse — Community Remittance Rate Tracker',
  description: 'See what exchange rates your community is actually getting for GBP→NGN, GBP→GHS, EUR→NGN and EUR→GHS. Vote, compare, and get notified.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={geist.variable}>
      <body>{children}</body>
    </html>
  )
}

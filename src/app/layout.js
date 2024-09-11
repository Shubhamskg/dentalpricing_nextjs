import { Poppins } from 'next/font/google'
import { Analytics } from "@vercel/analytics/react"
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const poppins = Poppins({
   weight: ['300', '400', '500', '600', '700'],
   subsets: ['latin'],
   display: 'swap',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.className}>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Analytics/>
      </body>
    </html>
  )
}
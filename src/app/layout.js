import { Poppins } from 'next/font/google'
import { Analytics } from "@vercel/analytics/react"
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Inter } from 'next/font/google';
import styles from './globals.scss';

const inter = Inter({ subsets: ['latin'] });


const poppins = Poppins({
   weight: ['300', '400', '500', '600', '700'],
   subsets: ['latin'],
   display: 'swap',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Navbar />
        <main className={styles.main}>{children}</main>
        <Footer />
        <Analytics/>
      </body>
    </html>
  )
}
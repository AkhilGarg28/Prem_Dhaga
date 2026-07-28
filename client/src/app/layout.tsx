import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import Image from 'next/image';
import Link from 'next/link';
import './globals.css';
import Navbar from '@/components/Navbar';
import ClientChrome from '@/components/ClientChrome';
import LenisProvider from '@/components/LenisProvider';
import { Icons } from '@/components/Icons';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  display: 'swap',
  preload: true,
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: 'Prem Dhaga | Threads Woven With Devotion',
    template: '%s | Prem Dhaga',
  },
  description: 'Handcrafted Laddu Gopal poshaks, mukuts, jewellery and premium seva sets, made slowly in Vrindavan.',
  metadataBase: new URL('https://premdhaga.com'),
  keywords: ['Laddu Gopal poshak', 'Krishna dress', 'Laddu Gopal mukut', 'seva set', 'Vrindavan'],
  openGraph: {
    title: 'Prem Dhaga | Threads Woven With Devotion',
    description: 'Devotional couture, handcrafted in Vrindavan.',
    type: 'website',
    locale: 'en_IN',
    images: [{ url: '/images/prem-dhaga-hero.png', width: 1536, height: 1024, alt: 'Prem Dhaga dawn darshan' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prem Dhaga | Threads Woven With Devotion',
    description: 'Devotional couture, handcrafted in Vrindavan.',
    images: ['/images/prem-dhaga-hero.png'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0d0b08',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-temple-black font-body text-ivory antialiased">
        <Navbar />
        <ClientChrome />
        <LenisProvider>
          <main>{children}</main>
        </LenisProvider>
        <footer className="relative overflow-hidden border-t border-royal-gold/15 bg-[#080705] px-5 py-16 sm:px-10 lg:px-16 lg:py-24">
          <Image src="/images/prem-dhaga-hero.png" alt="" fill sizes="100vw" className="absolute inset-0 object-cover object-[70%_center] opacity-[0.18]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080705] via-[#080705]/92 to-[#080705]/76" />
          <div className="absolute inset-0 temple-grain opacity-25" />
          <div className="relative mx-auto max-w-[1450px]">
            <div className="grid gap-14 border-b border-royal-gold/12 pb-14 lg:grid-cols-[1.2fr_.75fr_.75fr_1fr]">
              <div>
                <Link href="/" className="inline-flex items-center gap-3">
                  <Icons.PeacockFeather size={32} className="text-royal-gold" />
                  <span className="font-display text-2xl tracking-[0.18em] text-ivory">PREM DHAGA</span>
                </Link>
                <p className="mt-7 max-w-sm font-display text-3xl font-light italic leading-10 text-cream/68">Threads woven with devotion, from the heart of Vrindavan.</p>
                <p className="mt-7 font-utility text-[9px] uppercase tracking-[0.24em] text-royal-gold/70">Instagram / WhatsApp / Vrindavan atelier</p>
              </div>

              <div>
                <p className="mb-5 font-utility text-[9px] uppercase tracking-[0.27em] text-royal-gold">Discover</p>
                <div className="space-y-3 font-body text-xs text-cream/55">
                  <Link className="block transition hover:text-cream" href="/collections">Collections</Link>
                  <Link className="block transition hover:text-cream" href="/custom">Bespoke atelier</Link>
                  <Link className="block transition hover:text-cream" href="/seva-guide">Seva journal</Link>
                  <Link className="block transition hover:text-cream" href="/about">Our house</Link>
                </div>
              </div>

              <div>
                <p className="mb-5 font-utility text-[9px] uppercase tracking-[0.27em] text-royal-gold">Assistance</p>
                <div className="space-y-3 font-body text-xs text-cream/55">
                  <Link className="block transition hover:text-cream" href="/account">Your account</Link>
                  <Link className="block transition hover:text-cream" href="/account">Track an order</Link>
                  <Link className="block transition hover:text-cream" href="/seva-guide">Size guide</Link>
                  <a className="block transition hover:text-cream" href="mailto:seva@premdhaga.com">Contact the atelier</a>
                </div>
              </div>

              <div>
                <p className="font-utility text-[9px] uppercase tracking-[0.27em] text-royal-gold">Letters from Vrindavan</p>
                <p className="mt-4 font-body text-xs leading-6 text-cream/50">Festival edits, artisan notes and quiet reminders for seasonal seva.</p>
                <form className="mt-6 flex border-b border-cream/25 pb-3">
                  <input type="email" aria-label="Email address" placeholder="Your email address" className="min-w-0 flex-1 bg-transparent font-body text-xs text-cream placeholder:text-cream/30 focus:outline-none" />
                  <button type="submit" aria-label="Join newsletter" className="text-royal-gold"><Icons.ArrowRight size={16} /></button>
                </form>
              </div>
            </div>

            <div className="grid gap-6 pt-8 font-utility text-[8px] uppercase tracking-[0.22em] text-cream/34 lg:grid-cols-[1fr_auto] lg:items-center">
              <p>Copyright {new Date().getFullYear()} Prem Dhaga / Handcrafted in Vrindavan</p>
              <p className="font-display text-lg normal-case tracking-normal text-cream/62">Seva is not only a garment. It is an offering of love.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}



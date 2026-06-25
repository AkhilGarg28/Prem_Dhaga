import type { Metadata } from 'next';
import {
  Cormorant_Garamond,
  Playfair_Display,
  DM_Sans,
  Jost,
  Noto_Serif_Devanagari,
} from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import AudioController from '@/components/AudioController';
import LenisProvider from '@/components/LenisProvider';


// 1. Configure display font
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  style: ['normal', 'italic'],
});

// 2. Configure section heads
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-playfair',
});

// 3. Configure body text
const dmsans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dmsans',
});

// 4. Configure utility text (pricing/labels)
const jost = Jost({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jost',
});

// 5. Configure Hindi script
const notoDevanagari = Noto_Serif_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500'],
  variable: '--font-devanagari',
});

export const metadata: Metadata = {
  title: 'Prem Dhaga | Luxury Devotional Fashion for Laddu Gopal',
  description:
    'Threads Woven with Devotion. Discover handcrafted, luxury 3D cinematic e-commerce collections, poshaks, mukuts and seva sets designed for your beloved Laddu Gopal.',
  metadataBase: new URL('https://premdhaga.com'),
  openGraph: {
    title: 'Prem Dhaga | Luxury Devotional Fashion',
    description: 'Threads Woven with Devotion. Crafted for your beloved Laddu Gopal.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${playfair.variable} ${dmsans.variable} ${jost.variable} ${notoDevanagari.variable}`}
    >
      <body className="antialiased font-body bg-temple-black text-ivory min-h-screen flex flex-col">
        {/* Navigation Bar */}
        <Navbar />

        {/* Floating audio control */}
        <AudioController />

        {/* Global Cart Overlay Drawer */}
        <CartDrawer />

        {/* Main Workspace wrapped in smooth scroll */}
        <LenisProvider>
          <main className="flex-1 flex flex-col">{children}</main>
        </LenisProvider>

        {/* Footer */}
        <footer className="py-12 border-t border-royal-gold/15 bg-temple-black/80 px-6 text-center text-xs text-warm-beige/40">
          <div className="max-w-4xl mx-auto space-y-4">
            <p className="font-display text-base tracking-widest text-royal-gold uppercase">
              Prem Dhaga
            </p>
            <p className="font-hindi text-sm italic">
              “सेवा केवल वस्त्र नहीं, प्रेम का अर्पण है।”
            </p>
            <p className="font-utility tracking-widest">
              © {new Date().getFullYear()} PREM DHAGA. ALL RIGHTS RESERVED. HANDCRAFTED IN VRINDAVAN.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

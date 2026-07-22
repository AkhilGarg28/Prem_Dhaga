'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Icons } from '../Icons';
import LoadingScreen from './LoadingScreen';
import { useAudio } from '../../store/useAudio';
import { useScene } from '../../store/useScene';
import { useCart } from '../../store/useCart';

const MainCanvas = dynamic(() => import('../canvas/MainCanvas'), { ssr: false });

type NavigatorWithConnection = Navigator & {
  connection?: {
    effectiveType?: string;
    saveData?: boolean;
  };
};

const collections = [
  {
    number: '01',
    title: 'Morning Darshan',
    subtitle: 'Light silk, pearls and soft floral borders for the first seva of the day.',
    href: '/collections/morning-darshan',
    image: '/images/prem-dhaga-hero.png',
    tone: 'Golden sunrise',
  },
  {
    number: '02',
    title: 'Janmashtami Atelier',
    subtitle: 'Ceremonial zardozi, mukuts and heirloom details for Kanha\'s appearance day.',
    href: '/collections/janmashtami-grand-edition',
    image: '/images/janmashtami-poshak.png',
    tone: 'Temple gold',
  },
  {
    number: '03',
    title: 'Rajbhog Royal',
    subtitle: 'Peacock velvet, kundan accents and afternoon grandeur.',
    href: '/collections/rajbhog-royal',
    image: '/images/janmashtami-poshak.png',
    tone: 'Peacock blue',
  },
  {
    number: '04',
    title: 'Shayan in Moonlight',
    subtitle: 'Ivory silk, featherweight trims and quiet night seva pieces.',
    href: '/collections/shayan-veshbhusha',
    image: '/images/shayan-poshak.png',
    tone: 'Moon ivory',
  },
  {
    number: '05',
    title: 'Winter Seva',
    subtitle: 'Layered velvet, warm brocades and jewel-toned accessories.',
    href: '/collections/winter-seva',
    image: '/images/shayan-poshak.png',
    tone: 'Brass dusk',
  },
  {
    number: '06',
    title: 'Premium Handmade',
    subtitle: 'One-of-one sets finished slowly by master hands in Vrindavan.',
    href: '/collections/premium-handmade',
    image: '/images/prem-dhaga-hero.png',
    tone: 'Lotus rose',
  },
];

const darshanChapters = [
  { title: 'Mangala', time: '5:30 AM', light: 'Pre-dawn blue', fabric: 'Ivory muslin', detail: 'The altar opens in silence. Soft pearls, tulsi leaves and the first lamps of the morning.' },
  { title: 'Shringar', time: '8:15 AM', light: 'Sunlit gold', fabric: 'Banarasi silk', detail: 'A brighter poshak, fresh flowers and fine borders that catch the first temple light.' },
  { title: 'Rajbhog', time: '12:00 PM', light: 'Royal noon', fabric: 'Peacock velvet', detail: 'A fuller silhouette for the afternoon offering, with kundan, brass and deep blue accents.' },
  { title: 'Festival', time: '4:30 PM', light: 'Lotus glow', fabric: 'Zardozi brocade', detail: 'Petals, garlands and richer embroidery for days when every detail becomes celebration.' },
  { title: 'Janmashtami', time: 'Midnight', light: 'Golden aarti', fabric: 'Heirloom silk', detail: 'A ceremonial set designed to feel treasured now and remembered for years.' },
  { title: 'Winter', time: 'Dusk', light: 'Amber brass', fabric: 'Layered velvet', detail: 'Soft warmth, deeper colors and a calmer palette for the colder seva months.' },
  { title: 'Shayan', time: '9:15 PM', light: 'Moon ivory', fabric: 'Feather silk', detail: 'The final offering of the day, quiet, light and made for rest.' },
];

const productRelics = [
  {
    id: 'prod_3',
    slug: '/products/swarna-janmashtami-poshak',
    name: 'Swarna Janmashtami Poshak',
    price: 4500,
    priceLabel: 'INR 4,500',
    image: '/images/janmashtami-poshak.png',
    swatchHex: '#c4a15a',
    swatchName: 'Antique Gold',
    note: 'Twelve days of zardozi over deep ceremonial silk.',
  },
  {
    id: 'prod_4',
    slug: '/products/nidhra-silk-night-dress',
    name: 'Nidhra Shayan Silk',
    price: 1850,
    priceLabel: 'INR 1,850',
    image: '/images/shayan-poshak.png',
    swatchHex: '#f6f0e4',
    swatchName: 'Moon Ivory',
    note: 'A feather-soft night seva set with quiet floral details.',
  },
  {
    id: 'prod_2',
    slug: '/products/morpankh-velvet-poshak',
    name: 'Morpankh Rajbhog Set',
    price: 3200,
    priceLabel: 'INR 3,200',
    image: '/images/janmashtami-poshak.png',
    swatchHex: '#184c54',
    swatchName: 'Peacock Blue',
    note: 'Velvet, kundan work and a matching mukut composition.',
  },
];

const craftDetails = ['Aari embroidery', 'Seed pearls', 'Banarasi silk', 'Hand-set mukuts', 'Temple-packed gifting'];

const galleryStories = [
  { title: 'Aarti at first light', image: '/images/prem-dhaga-hero.png', place: 'Vrindavan' },
  { title: 'Janmashtami altar', image: '/images/janmashtami-poshak.png', place: 'Jaipur' },
  { title: 'Moonlit shayan', image: '/images/shayan-poshak.png', place: 'Delhi' },
  { title: 'Festival thali', image: '/images/janmashtami-poshak.png', place: 'Mumbai' },
  { title: 'Daily seva corner', image: '/images/prem-dhaga-hero.png', place: 'Bengaluru' },
  { title: 'Royal Rajbhog', image: '/images/janmashtami-poshak.png', place: 'Ahmedabad' },
];

const testimonials = [
  { quote: 'The packaging felt like opening a temple drawer. Every fold was considered, and the poshak looked even more delicate in person.', name: 'Lalita Sharma', city: 'New Delhi' },
  { quote: 'I ordered for Janmashtami and the embroidery had the quiet richness I was hoping for. It did not feel mass-made.', name: 'Meera Vyas', city: 'Mumbai' },
  { quote: 'Their team helped me choose the right size and matching mukut. The whole experience felt calm, respectful and premium.', name: 'Raghav Joshi', city: 'Ahmedabad' },
];

const reveal = {
  hidden: { opacity: 0, y: 34 },
  visible: { opacity: 1, y: 0 },
};

export default function HomeContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [showCanvas, setShowCanvas] = useState(false);
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ['start start', 'end end'] });
  const heroScale = useTransform(scrollYProgress, [0, 0.18], [1, prefersReducedMotion ? 1 : 1.08]);
  const heroY = useTransform(scrollYProgress, [0, 0.18], ['0%', prefersReducedMotion ? '0%' : '8%']);
  const { setScrollProgress, setActivePoshakIndex, setCurrentScene } = useScene();
  const { updateMix } = useAudio();
  const { addItem, setIsOpen } = useCart();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const connection = (navigator as NavigatorWithConnection).connection;
    const isSlowConnection = connection?.saveData || /2g/.test(connection?.effectiveType ?? '');
    if (isSlowConnection) return;

    const timer = window.setTimeout(() => setShowCanvas(true), 650);
    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion]);
useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (progress) => {
      setScrollProgress(progress);
      setActivePoshakIndex(Math.min(6, Math.max(0, Math.floor(progress * 7))));
      setCurrentScene(progress < 0.2 ? 1 : progress < 0.42 ? 2 : progress < 0.72 ? 3 : 4);
      updateMix(progress);
    });
    return unsubscribe;
  }, [scrollYProgress, setActivePoshakIndex, setCurrentScene, setScrollProgress, updateMix]);

  const addOffering = (product: (typeof productRelics)[number]) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: 2,
      swatchHex: product.swatchHex,
      swatchName: product.swatchName,
      image: product.image,
    });
    setIsOpen(true);
  };

  return (
    <div ref={rootRef} className="home-canvas relative overflow-hidden bg-temple-black text-ivory">
      <LoadingScreen />

      <section className="hero-chapter relative min-h-[112svh] overflow-hidden" aria-labelledby="hero-title">
        <motion.div className="absolute inset-0 z-0" style={{ scale: heroScale, y: heroY }}>
          <Image
            src="/images/prem-dhaga-hero.png"
            alt="Laddu Gopal seated in a dawn-lit Vrindavan temple courtyard"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[66%_center] opacity-70"
          />
        </motion.div>
        {showCanvas && <MainCanvas className="z-[1] opacity-70 mix-blend-screen" />}
        <div className="absolute inset-0 z-[2] hero-veil" />
        <div className="absolute inset-0 z-[3] temple-grain pointer-events-none" />
        <div className="hero-ray absolute -right-32 top-0 z-[3] h-[75vh] w-[45vw] rotate-[-12deg]" />
        <div className="absolute inset-x-0 bottom-0 z-[3] h-48 bg-gradient-to-t from-temple-black to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[112svh] max-w-[1600px] items-center px-5 pb-28 pt-32 sm:px-10 lg:px-16">
          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            variants={reveal}
            className="max-w-[850px]"
          >
            <p className="eyebrow mb-7">Prem Dhaga / Vrindavan atelier</p>
            <h1 id="hero-title" className="font-display text-[4rem] font-light uppercase leading-[0.82] tracking-normal text-ivory sm:text-8xl sm:leading-[0.76] lg:text-[9.5rem] 2xl:text-[11rem]">
              Threads
              <span className="block pl-[0.4em] italic normal-case text-gold-gradient">woven</span>
              <span className="block">with devotion</span>
            </h1>
            <div className="mt-10 grid w-full max-w-[21.5rem] gap-8 border-l border-royal-gold/45 pl-6 pr-2 sm:max-w-3xl sm:pr-0 md:grid-cols-[1fr_auto] md:items-end">
              <p className="max-w-md font-body text-sm font-light leading-7 text-cream/76">
                Luxury handcrafted poshaks, mukuts and seva essentials for your beloved Laddu Gopal, made slowly by the hands of Vrindavan.
              </p>
              <div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/collections" className="particle-button luxury-button">Explore collection</Link>
                <Link href="#darshan-journey" className="particle-button luxury-button-outline">Begin darshan</Link>
              </div>
            </div>
          </motion.div>

          <div className="absolute bottom-9 left-5 z-10 flex items-center gap-4 sm:left-10 lg:left-16">
            <span className="h-px w-14 bg-royal-gold/50" />
            <span className="font-utility text-[9px] uppercase tracking-[0.32em] text-cream/45">Scroll for darshan</span>
          </div>
          <div className="absolute bottom-8 right-6 z-10 hidden grid-cols-3 gap-5 border border-royal-gold/14 bg-temple-black/45 p-4 backdrop-blur-md xl:grid">
            {['Hand finished', 'Temple packed', 'Custom sized'].map((item) => (
              <span key={item} className="font-utility text-[9px] uppercase tracking-[0.24em] text-cream/55">{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#ece2d1] px-5 py-28 text-deep-charcoal sm:px-10 lg:px-16 lg:py-44">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-temple-bronze/30 to-transparent" />
        <div className="mx-auto grid max-w-[1450px] gap-16 lg:grid-cols-[0.66fr_1.34fr] lg:gap-24">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} variants={reveal} transition={{ duration: 0.9 }}>
            <p className="eyebrow !text-temple-bronze">The philosophy</p>
            <div className="mt-10 space-y-7">
              {craftDetails.map((detail) => (
                <div key={detail} className="flex items-center gap-4 border-b border-deep-charcoal/10 pb-4">
                  <span className="h-2 w-2 rounded-full bg-temple-bronze" />
                  <span className="font-utility text-[10px] uppercase tracking-[0.24em] text-deep-charcoal/62">{detail}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={reveal} transition={{ duration: 1, delay: 0.1 }}>
            <h2 className="font-display text-5xl sm:text-6xl lg:text-8xl 2xl:text-[7rem] font-light leading-[0.94] tracking-normal">
              This is not fashion.
              <span className="block italic text-temple-bronze">This is seva.</span>
            </h2>
            <div className="mt-12 grid gap-8 border-t border-deep-charcoal/15 pt-8 sm:grid-cols-2">
              <p className="font-body text-sm leading-7 text-deep-charcoal/66">
                Every offering begins as a mood: first light, festival brass, shayan quiet, monsoon green. The atelier translates that feeling into silk, zari, pearls and fit.
              </p>
              <p className="font-body text-sm leading-7 text-deep-charcoal/66">
                We keep the interface calm for the same reason we keep the stitching slow. Nothing shouts. Everything invites attention.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="darshan-journey" className="relative overflow-hidden bg-[#15110d] px-5 py-28 sm:px-10 lg:px-16 lg:py-40">
        <div className="absolute inset-0 seva-aura" />
        <div className="relative mx-auto max-w-[1450px]">
          <div className="grid items-end gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="eyebrow">Divine darshan</p>
              <h2 className="mt-5 font-display text-6xl sm:text-7xl lg:text-[8rem] 2xl:text-[8.4rem] font-light leading-[0.86] tracking-normal">
                A day moves
                <span className="block italic text-gold-gradient">through cloth.</span>
              </h2>
            </div>
            <p className="max-w-xl font-body text-sm leading-7 text-cream/62 lg:justify-self-end">
              As the scroll moves, the temple mood shifts from pre-dawn blue to brass aarti and moonlit shayan. Each darshan carries its own light, texture and offering.
            </p>
          </div>

          <div className="mt-20 grid gap-4 md:grid-cols-2 xl:grid-cols-7">
            {darshanChapters.map((chapter, index) => (
              <motion.article
                key={chapter.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.78, delay: index * 0.05 }}
                className="darshan-stage group"
              >
                <span className="font-utility text-[8px] uppercase tracking-[0.28em] text-royal-gold/70">{chapter.time}</span>
                <h3 className="mt-8 font-display text-4xl font-light text-ivory">{chapter.title}</h3>
                <div className="mt-7 h-px w-12 bg-royal-gold/45 transition-all duration-500 group-hover:w-24" />
                <p className="mt-8 font-body text-xs leading-6 text-cream/56">{chapter.detail}</p>
                <div className="mt-10 space-y-2 font-utility text-[8px] uppercase tracking-[0.22em] text-cream/38">
                  <p>{chapter.light}</p>
                  <p>{chapter.fabric}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-5 py-28 sm:px-10 lg:px-16 lg:py-40" id="collections">
        <div className="mx-auto max-w-[1450px]">
          <div className="mb-16 flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Collection stories</p>
              <h2 className="mt-5 font-display text-6xl sm:text-7xl lg:text-[7.4rem] 2xl:text-[7.8rem] font-light leading-none tracking-normal">Seva, by season.</h2>
            </div>
            <Link href="/collections" className="sacred-link group self-start md:self-auto">
              View all collections <Icons.ArrowRight size={15} className="transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-12 lg:grid-rows-[310px_310px_310px]">
            {collections.map((collection, index) => (
              <motion.article
                key={collection.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.85, delay: index * 0.06 }}
                className={`collection-editorial group relative min-h-[430px] overflow-hidden lg:min-h-0 ${index === 0 ? 'lg:col-span-7 lg:row-span-2' : index === 5 ? 'lg:col-span-7' : 'lg:col-span-5'}`}
              >
                <Link href={collection.href} prefetch={true} aria-label={`Explore ${collection.title}`} className="absolute inset-0 z-20" />
                <Image
                  src={collection.image}
                  alt={`${collection.title} devotional collection`}
                  fill
                  sizes={index === 0 || index === 5 ? '(min-width: 1024px) 58vw, 100vw' : '(min-width: 1024px) 42vw, 100vw'}
                  className={`object-cover transition duration-[1.6s] ease-out group-hover:scale-105 ${index === 2 ? 'scale-x-[-1] object-[50%_42%] group-hover:scale-x-[-1.05]' : 'object-center'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/20 to-black/8" />
                <span className="absolute left-6 top-6 font-utility text-[9px] uppercase tracking-[0.3em] text-cream/65">{collection.number} / {collection.tone}</span>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-6 sm:p-8">
                  <div>
                    <h3 className="font-display text-3xl font-light text-ivory sm:text-4xl">{collection.title}</h3>
                    <p className="mt-2 max-w-md font-body text-xs leading-5 text-cream/62">{collection.subtitle}</p>
                  </div>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-cream/35 text-cream transition duration-500 group-hover:border-royal-gold group-hover:bg-royal-gold group-hover:text-temple-black">
                    <Icons.ArrowRight size={16} />
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#e9dfce] px-5 py-28 text-deep-charcoal sm:px-10 lg:px-16 lg:py-40">
        <div className="mx-auto max-w-[1450px]">
          <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow !text-temple-bronze">Museum pieces</p>
              <h2 className="mt-5 font-display text-5xl sm:text-7xl lg:text-[7rem] 2xl:text-[7.4rem] font-light leading-none tracking-normal">Objects of devotion.</h2>
            </div>
            <p className="max-w-md font-body text-sm leading-7 text-deep-charcoal/62">
              Product discovery behaves like a private viewing: close, quiet, tactile and fast.
            </p>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {productRelics.map((product, index) => (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.85, delay: index * 0.08 }}
                className="product-relic group"
              >
                <Link href={product.slug} className="relative block aspect-[4/5] overflow-hidden bg-[#16110c]">
                  <Image src={product.image} alt={product.name} fill sizes="(min-width: 1024px) 31vw, 100vw" className="object-cover transition duration-[1.4s] group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/8 to-transparent" />
                  <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-cream/20 bg-black/20 px-3 py-2 backdrop-blur-md">
                    <span className="h-3 w-3 rounded-full border border-cream/35" style={{ backgroundColor: product.swatchHex }} />
                    <span className="font-utility text-[8px] uppercase tracking-[0.18em] text-cream/76">{product.swatchName}</span>
                  </div>
                  <span className="absolute bottom-5 left-5 font-utility text-[9px] uppercase tracking-[0.24em] text-cream/72">Quick view / 360 mood</span>
                </Link>
                <div className="space-y-5 p-6">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <h3 className="font-display text-3xl font-light text-deep-charcoal">{product.name}</h3>
                      <p className="mt-2 font-body text-xs leading-6 text-deep-charcoal/58">{product.note}</p>
                    </div>
                    <span className="shrink-0 font-utility text-[10px] uppercase tracking-[0.16em] text-temple-bronze">{product.priceLabel}</span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                    <Link href={product.slug} className="button-ink text-center">View</Link>
                    <button type="button" aria-label={`Wishlist ${product.name}`} className="icon-action"><Icons.Heart size={16} /></button>
                    <button type="button" onClick={() => addOffering(product)} aria-label={`Add ${product.name} to cart`} className="icon-action"><Icons.Cart size={16} /></button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#120f0b] px-5 py-28 sm:px-10 lg:px-16 lg:py-40">
        <div className="absolute inset-0 temple-grain opacity-20" />
        <div className="relative mx-auto grid max-w-[1450px] items-center gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-24">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 1 }} className="atelier-window relative aspect-[4/5] overflow-hidden">
            <Image src="/images/shayan-poshak.png" alt="Handcrafted silk poshak displayed with temple styling" fill sizes="(min-width: 1024px) 46vw, 100vw" className="object-cover" />
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={reveal} transition={{ duration: 0.9 }}>
            <p className="eyebrow">The atelier</p>
            <h2 className="mt-6 font-display text-5xl sm:text-7xl lg:text-[6.4rem] 2xl:text-[6.8rem] font-light leading-[0.92] tracking-normal">
              Woven in quiet.
              <span className="block italic text-gold-gradient">Finished as offering.</span>
            </h2>
            <p className="mt-7 max-w-lg font-body text-sm leading-7 text-cream/62">
              Silk passes from dyer to embroiderer, from jeweller to final shringar. A slight difference in a pearl, a turn of zari, the signature of the hand: that is how you know an offering is alive.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ['11', 'artisan touchpoints'],
                ['72h', 'festival finishing window'],
                ['1:1', 'custom sizing support'],
              ].map(([value, label]) => (
                <div key={label} className="border-t border-royal-gold/20 pt-5">
                  <strong className="font-display text-5xl font-light text-ivory">{value}</strong>
                  <span className="mt-2 block font-utility text-[8px] uppercase tracking-[0.22em] text-cream/38">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative bg-[#eee5d6] px-5 py-28 text-deep-charcoal sm:px-10 lg:px-16 lg:py-40">
        <div className="mx-auto max-w-[1450px]">
          <div className="mb-14 grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow !text-temple-bronze">My Kanha</p>
              <h2 className="mt-5 font-display text-5xl sm:text-7xl lg:text-[6.6rem] 2xl:text-[7rem] font-light leading-none tracking-normal">Devotee gallery.</h2>
            </div>
            <Link href="/account" className="sacred-link !text-deep-charcoal group self-start lg:self-auto">
              Save your darshan <Icons.ArrowRight size={15} className="transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="customer-gallery">
            {galleryStories.map((story, index) => (
              <motion.article
                key={`${story.title}-${story.place}`}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.75, delay: index * 0.05 }}
                className="gallery-polaroid group"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-deep-charcoal">
                  <Image src={story.image} alt={story.title} fill sizes="(min-width: 1024px) 22vw, 50vw" className="object-cover transition duration-1000 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <h3 className="font-display text-2xl text-deep-charcoal">{story.title}</h3>
                  <p className="mt-1 font-utility text-[8px] uppercase tracking-[0.22em] text-temple-bronze/76">{story.place}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#17130f] px-5 py-28 sm:px-10 lg:px-16 lg:py-40">
        <div className="mx-auto max-w-[1250px] text-center">
          <p className="eyebrow justify-center">Letters from devotees</p>
          <h2 className="mt-5 font-display text-5xl sm:text-7xl lg:text-[6.4rem] 2xl:text-[6.8rem] font-light leading-none tracking-normal">Handwritten blessings.</h2>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.figure
                key={testimonial.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.75, delay: index * 0.08 }}
                className="parchment-card p-7 text-left"
              >
                <div className="mb-8 flex items-center justify-between">
                  <span className="font-utility text-[8px] uppercase tracking-[0.24em] text-temple-bronze">Prem Dhaga</span>
                  <span className="wax-seal">PD</span>
                </div>
                <blockquote className="font-serif-head text-base italic leading-7 text-deep-charcoal/82">&ldquo;{testimonial.quote}&rdquo;</blockquote>
                <figcaption className="mt-8 border-t border-temple-bronze/15 pt-4 font-utility text-[9px] uppercase tracking-[0.2em] text-temple-bronze/80">
                  {testimonial.name} / {testimonial.city}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      <section className="relative flex min-h-[82vh] items-center overflow-hidden px-5 py-28 sm:px-10 lg:px-16">
        <Image src="/images/prem-dhaga-hero.png" alt="" fill sizes="100vw" className="object-cover object-[70%_center] opacity-36" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,transparent_0%,#0d0b08_72%)]" />
        <div className="relative mx-auto w-full max-w-[1450px]">
          <p className="eyebrow">Bespoke seva</p>
          <h2 className="mt-6 max-w-4xl font-display text-6xl sm:text-8xl lg:text-[8rem] 2xl:text-[9rem] font-light leading-[0.85] tracking-normal">
            Made for your
            <span className="block italic text-gold-gradient">beloved.</span>
          </h2>
          <p className="mt-8 max-w-md font-body text-sm leading-7 text-cream/62">
            Share a size, a festival, or simply a feeling. The atelier composes a one-of-one seva set with you.
          </p>
          <Link href="/custom" className="particle-button luxury-button mt-10 inline-flex">Begin a commission</Link>
        </div>
      </section>
    </div>
  );
}


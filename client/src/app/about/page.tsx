import Image from 'next/image';
import Link from 'next/link';
import { Icons } from '@/components/Icons';

const principles = [
  ['The artisans', 'Families of handworkers shape each poshak through cutting, embroidery, jewellery pairing and final finishing.'],
  ['The fabrics', 'Silks, brocades and velvets are selected for scale, drape and the way they receive temple light.'],
  ['The devotion', 'Every stitch is treated as an offering, not an inventory unit. The pace is deliberate.'],
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-temple-black text-ivory">
      <section className="relative flex min-h-[76svh] items-end overflow-hidden px-5 pb-20 pt-36 sm:px-10 lg:px-16">
        <Image src="/images/prem-dhaga-hero.png" alt="Prem Dhaga Vrindavan darshan" fill priority sizes="100vw" className="absolute inset-0 object-cover object-[64%_center] opacity-50" />
        <div className="absolute inset-0 hero-veil" />
        <div className="absolute inset-0 temple-grain opacity-30" />
        <div className="relative mx-auto w-full max-w-[1450px]">
          <p className="eyebrow">Our house</p>
          <h1 className="mt-6 max-w-5xl font-display text-6xl font-light leading-[0.88] tracking-normal sm:text-8xl lg:text-[8.4rem]">
            Every thread is woven with love.
          </h1>
          <p className="mt-8 max-w-xl font-body text-sm leading-7 text-cream/68">
            Prem Dhaga bridges Vrindavan handcraft, devotional intimacy and a luxury standard of detail for Laddu Gopal seva.
          </p>
        </div>
      </section>

      <section className="bg-[#eee5d6] px-5 py-24 text-deep-charcoal sm:px-10 lg:px-16 lg:py-36">
        <div className="mx-auto grid max-w-[1450px] gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
          <div>
            <p className="eyebrow !text-temple-bronze">Brand philosophy</p>
            <h2 className="mt-6 font-display text-5xl font-light leading-none sm:text-7xl lg:text-[6.6rem]">
              Not fashion.
              <span className="block italic text-temple-bronze">Seva.</span>
            </h2>
          </div>
          <div className="grid gap-8 border-t border-deep-charcoal/12 pt-8 md:grid-cols-3">
            {principles.map(([title, text]) => (
              <article key={title} className="space-y-5">
                <span className="block h-px w-14 bg-temple-bronze/55" />
                <h3 className="font-display text-3xl text-deep-charcoal">{title}</h3>
                <p className="font-body text-sm leading-7 text-deep-charcoal/62">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-10 lg:px-16 lg:py-36">
        <div className="mx-auto grid max-w-[1450px] items-center gap-14 lg:grid-cols-2 lg:gap-24">
          <div className="atelier-window relative aspect-[4/5] overflow-hidden">
            <Image src="/images/janmashtami-poshak.png" alt="Ceremonial Prem Dhaga poshak" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <p className="eyebrow">The mission</p>
            <h2 className="mt-6 font-display text-5xl font-light leading-none sm:text-7xl">Bring Vrindavan home with grace.</h2>
            <div className="mt-8 space-y-5 font-body text-sm leading-7 text-cream/64">
              <p>
                We design for families who want their daily seva to feel peaceful, beautiful and deeply personal. The work must be refined enough for a festival altar and gentle enough for everyday devotion.
              </p>
              <p>
                When a Prem Dhaga piece leaves the atelier, it is folded, checked, paired and packed as something meant for worship.
              </p>
            </div>
            <Link href="/collections" className="particle-button luxury-button mt-10 inline-flex">Explore collections</Link>
          </div>
        </div>
      </section>

      <section className="border-t border-royal-gold/12 px-5 py-20 text-center sm:px-10 lg:px-16">
        <Icons.PeacockFeather className="mx-auto text-royal-gold" size={38} />
        <p className="mx-auto mt-7 max-w-2xl font-display text-3xl font-light italic leading-10 text-cream/78">
          Seva is not only a garment. It is an offering of love.
        </p>
      </section>
    </div>
  );
}

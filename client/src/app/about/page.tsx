import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-temple-black pt-28 pb-20 px-6 md:px-16 flex flex-col justify-start">
      <div className="max-w-3xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="font-utility text-xs text-royal-gold tracking-widest uppercase">The Artisan Heritage</span>
          <h1 className="font-display text-4xl md:text-5xl text-ivory">Our Devotional Journey</h1>
          <p className="font-body text-xs md:text-sm text-warm-beige/70 max-w-xl mx-auto leading-relaxed">
            Discover the legacy of Prem Dhaga: bridging centuries-old Vrindavan handloom traditions with premium luxury design.
          </p>
        </div>

        {/* Narrative Section 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-deep-charcoal border border-royal-gold/10 p-6 md:p-8 rounded-sm">
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-royal-gold">The Loom of Vrindavan</h2>
            <p className="font-body text-xs md:text-sm text-warm-beige/80 leading-relaxed">
              Prem Dhaga was born out of a desire to honour the humble artisans of Vrindavan. For generations, these families have spent their lives weaving, embroidering, and sewing poshaks for local mandirs.
            </p>
            <p className="font-body text-xs md:text-sm text-warm-beige/80 leading-relaxed">
              Every dress we produce starts on wood handlooms, utilizing organic silk threads and authentic metal lace borders. Each piece is treated as a sacred prayer.
            </p>
          </div>
          <div className="w-full aspect-[4/3] bg-temple-black overflow-hidden relative border border-royal-gold/15">
            <img
              src="https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=600&auto=format&fit=crop"
              alt="Artisan loom work"
              className="w-full h-full object-cover opacity-75"
            />
          </div>
        </div>

        {/* Narrative Section 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-deep-charcoal border border-royal-gold/10 p-6 md:p-8 rounded-sm md:flex-row-reverse">
          <div className="w-full aspect-[4/3] bg-temple-black overflow-hidden relative border border-royal-gold/15 md:order-last">
            <img
              src="https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop"
              alt="Golden threads"
              className="w-full h-full object-cover opacity-75"
            />
          </div>
          <div className="space-y-4">
            <h2 className="font-display text-2xl text-royal-gold">“Threads Woven with Devotion.”</h2>
            <p className="font-body text-xs md:text-sm text-warm-beige/80 leading-relaxed">
              We believe shopping for your deity is an extension of Bhakti (devotion). Therefore, we maintain a peaceful, meditative work environment. No rushed production lines. Weavers work at their own pace, accompanied by devotional chants and prayers.
            </p>
            <p className="font-body text-xs md:text-sm text-warm-beige/80 leading-relaxed">
              When you dress your deity in Prem Dhaga, you are not just offering a dress—you are bringing home the pure prayers of Vrindavan's master craftsmen.
            </p>
          </div>
        </div>

        {/* Closing banner */}
        <div className="text-center space-y-4 py-8 border-t border-royal-gold/15">
          <p className="font-display text-2xl text-ivory">Experience the Offering</p>
          <p className="font-hindi text-sm italic text-royal-gold">“सेवा केवल वस्त्र नहीं, प्रेम का अर्पण है।”</p>
        </div>
      </div>
    </div>
  );
}

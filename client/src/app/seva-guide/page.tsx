import React from 'react';
import { Icons } from '@/components/Icons';


export default function SevaGuidePage() {
  const sevas = [
    {
      time: '05:30 AM',
      title: 'Mangala Darshan',
      ritual: 'The Awakening',
      description: 'Gently awaken the lord with soft humming, quiet prayers, and chime offerings. Offer a warm milk cup. Dress him in light, breathable cotton or soft ivory silk nightwear to ease the morning breeze.',
    },
    {
      time: '08:00 AM',
      title: 'Shringar Darshan',
      ritual: 'The Adornment',
      description: 'Perform the morning bath (Abhishek) with milk, honey, and water. Adorn the lord in vibrant silk poshaks, peacock crowns (mukuts), flute, ankle bells, and fragrant sandalwood paste (chandan).',
    },
    {
      time: '12:30 PM',
      title: 'Rajbhog Darshan',
      ritual: 'The Royal Feast',
      description: 'The primary midday meal. Offer an elaborate feast of butter, sweets, and hot dishes. The lord is dressed in grand, heavily decorated royal brocade poshaks with gold embroideries (Zardozi).',
    },
    {
      time: '06:30 PM',
      title: 'Sandhya Aarti',
      ritual: 'The Sunset Lamps',
      description: 'Wave the warm ghee and camphor lamps, ring temple bells, and blow conch shells. Offer fruits and light snacks. Dress the lord in rich, deeply saturated colors (reds, saffrons, deep green) that reflect the lamp fire.',
    },
    {
      time: '08:30 PM',
      title: 'Shayan Seva',
      ritual: 'The Divine Rest',
      description: 'Prepare the altar bed with soft velvet sheets. Massage the lord’s feet, play a sweet flute lullaby, and dim the lights. Change the attire to loose, thin cotton sleep robes or plain night poshaks for sound sleep.',
    },
  ];

  return (
    <div className="min-h-screen bg-temple-black pt-28 pb-20 px-6 md:px-16 flex flex-col justify-start">
      <div className="max-w-3xl mx-auto w-full space-y-16">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="font-utility text-xs text-royal-gold tracking-widest uppercase">Devotional Editorial</span>
          <h1 className="font-display text-4xl md:text-5xl text-ivory">Daily Seva Ritual Guide</h1>
          <p className="font-body text-xs md:text-sm text-warm-beige/70 max-w-xl mx-auto leading-relaxed">
            Serving Laddu Gopal is not a ritual of rules, but an offering of love. This guide details the five traditional daily darshans and how to choose their corresponding attires.
          </p>
        </div>

        {/* Timeline block */}
        <div className="space-y-12">
          {sevas.map((seva, idx) => (
            <div
              key={idx}
              className="glass-panel p-6 md:p-8 border border-royal-gold/15 flex flex-col md:flex-row gap-6 items-start rounded-sm"
            >
              {/* Left Column: Time & Title */}
              <div className="md:w-1/3 space-y-1 flex-shrink-0">
                <span className="font-utility text-xs text-royal-gold font-bold tracking-widest block">
                  {seva.time}
                </span>
                <h2 className="font-display text-xl md:text-2xl text-ivory leading-tight">
                  {seva.title}
                </h2>
                <span className="font-utility text-[10px] text-warm-beige/50 uppercase tracking-wider block">
                  {seva.ritual}
                </span>
              </div>

              {/* Right Column: Instructions */}
              <div className="flex-1 space-y-3 border-t md:border-t-0 md:border-l border-royal-gold/10 pt-4 md:pt-0 md:pl-6">
                <p className="font-body text-xs md:text-sm text-warm-beige/80 leading-relaxed">
                  {seva.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Editorial Quote block */}
        <div className="text-center p-8 bg-deep-charcoal border border-royal-gold/10 rounded-sm">
          <Icons.PeacockFeather className="text-royal-gold mx-auto mb-4 opacity-50" size={32} />
          <p className="font-serif-head text-base italic text-warm-beige/80 leading-relaxed max-w-lg mx-auto">
            "सेवा केवल वस्त्र नहीं, प्रेम का अर्पण है। When we dress our Kanha, we weave our own hearts into the folds of his poshak."
          </p>
          <span className="font-utility text-[9px] tracking-wider text-royal-gold uppercase mt-2 block">
            - Vrindavan Ashram Pujari
          </span>
        </div>
      </div>
    </div>
  );
}

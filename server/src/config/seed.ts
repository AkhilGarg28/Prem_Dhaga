import { Collection } from '../models/Collection';
import { Product } from '../models/Product';

export const seedDatabase = async () => {
  try {
    const collectionsCount = await Collection.countDocuments();
    if (collectionsCount > 0) {
      console.log('Database already has data. Skipping seed.');
      return;
    }

    console.log('Seeding initial collections and products...');

    // 1. Create Collections
    const collectionsData = [
      {
        title: 'Summer Silk Collection',
        slug: 'summer-silk',
        description: 'Lightweight, breathable pure silk poshaks for the warm Vrindavan summers.',
        coverImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop',
        isActive: true,
      },
      {
        title: 'Janmashtami Grand Edition',
        slug: 'janmashtami-grand-edition',
        description: "Exquisite heavily embroidered royal attire for Kanha's appearance day.",
        coverImage: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?q=80&w=600&auto=format&fit=crop',
        isActive: true,
      },
      {
        title: 'Rajbhog Royal Collection',
        slug: 'rajbhog-royal',
        description: 'Grand attire in deep shades decorated with detailed Zardozi work for the afternoon meal offering.',
        coverImage: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=600&auto=format&fit=crop',
        isActive: true,
      },
      {
        title: 'Shayan Veshbhusha',
        slug: 'shayan-veshbhusha',
        description: 'Soft, comfortable silk and cotton nightwear designed for peaceful rest.',
        coverImage: 'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?q=80&w=600&auto=format&fit=crop',
        isActive: true,
      },
    ];

    const createdCollections = await Collection.create(collectionsData);
    const colMap = new Map(createdCollections.map((c) => [c.slug, c._id]));

    // Helper to generate pricing for sizes 0 to 8
    const generateSizes = (base: number) => {
      const sizesArr = [];
      for (let i = 0; i <= 8; i++) {
        sizesArr.push({
          size: i,
          price: base + i * 150,
        });
      }
      return sizesArr;
    };

    // 2. Create Products
    const productsData = [
      {
        name: 'Lotus Shringaar Poshak',
        slug: 'lotus-shringaar-poshak',
        description: 'Handcrafted in Vrindavan with delicate lotus embroidery and fine golden borders. Woven with love on pure organic silk.',
        basePrice: 1200,
        images: [
          'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=600&auto=format&fit=crop',
        ],
        collectionId: colMap.get('summer-silk'),
        sizes: generateSizes(1200),
        swatches: [
          { name: 'Vrindavan Green', hex: '#3B6B3B' },
          { name: 'Lotus Pink', hex: '#D4788A' },
          { name: 'Royal Gold', hex: '#C9A84C' },
          { name: 'Peacock Blue', hex: '#1B5E6E' },
        ],
        isFeatured: true,
        stock: 15,
      },
      {
        name: 'Morpankh Velvet Poshak',
        slug: 'morpankh-velvet-poshak',
        description: 'Deep royal blue velvet poshak with detailed hand-embroidered peacock feathers. Ideal for cold seasons and grand afternoon darshans.',
        basePrice: 2800,
        images: [
          'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=600&auto=format&fit=crop',
        ],
        collectionId: colMap.get('rajbhog-royal'),
        sizes: generateSizes(2800),
        swatches: [
          { name: 'Peacock Blue', hex: '#1B5E6E' },
          { name: 'Royal Gold', hex: '#C9A84C' },
          { name: 'Temple Bronze', hex: '#8B6914' },
        ],
        isFeatured: true,
        stock: 8,
      },
      {
        name: 'Swarna Janmashtami Poshak',
        slug: 'swarna-janmashtami-poshak',
        description: 'Heavily embellished golden Zardozi poshak with matching crown (mukut) fabric. Crafted over 12 days by master artisans in Vrindavan.',
        basePrice: 4500,
        images: [
          'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?q=80&w=600&auto=format&fit=crop',
        ],
        collectionId: colMap.get('janmashtami-grand-edition'),
        sizes: generateSizes(4500),
        swatches: [
          { name: 'Royal Gold', hex: '#C9A84C' },
          { name: 'Lotus Pink', hex: '#D4788A' },
        ],
        isFeatured: true,
        stock: 5,
      },
      {
        name: 'Nidhra Silk Night Dress',
        slug: 'nidhra-silk-night-dress',
        description: 'Ultra-soft ivory silk night poshak with minimal floral embroidery. Light, non-restrictive design ensures peaceful rest for Laddu Gopal.',
        basePrice: 950,
        images: [
          'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?q=80&w=600&auto=format&fit=crop',
        ],
        collectionId: colMap.get('shayan-veshbhusha'),
        sizes: generateSizes(950),
        swatches: [
          { name: 'Ivory White', hex: '#FAF6EF' },
          { name: 'Lotus Pink', hex: '#D4788A' },
        ],
        isFeatured: false,
        stock: 20,
      },
    ];

    await Product.create(productsData);
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

import bcrypt from 'bcryptjs';
import { connectDB, closeDB } from './config/db.js';

const sampleStudios = [
  {
    title: 'The White Infinity Cyc - Daylight Photo Studio',
    category: 'Photo Studios',
    hourlyRate: 85,
    securityDeposit: 150,
    maxCapacity: 15,
    location: 'Brooklyn Arts District, New York, NY',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['2-Wall Cyclorama', 'Profoto Strobes', 'South-Facing Daylight Windows', 'Private Hair & Makeup Station', 'High-Speed Wi-Fi', 'Client Lounge Area', 'C-Stands & Sandbags'],
    overview: 'A pristine 2,400 sq.ft loft studio featuring a corner seamless infinity cyc wall and sweeping natural southern light. Ideal for editorial fashion shoots, commercial catalog productions, and portrait photography sessions.',
    hostName: 'Sarah Jenkins',
    hostEmail: 'sarah.studio@studiospace.com',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    rating: 4.95,
    reviewsCount: 38,
    featured: true,
    createdAt: new Date('2026-01-15T10:00:00Z'),
    updatedAt: new Date('2026-01-15T10:00:00Z')
  },
  {
    title: 'Apex Cinema Soundstage & LED Volume',
    category: 'Sound Stages',
    hourlyRate: 195,
    securityDeposit: 400,
    maxCapacity: 40,
    location: 'Burbank Media Quarter, Los Angeles, CA',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1533518463841-d62e1fc91373?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Full Soundproofing (STC 65)', 'Curved 4K LED Backdrop', 'Overhead Lighting Grid with DMX Control', 'Drive-In Roll-Up Loading Door', 'Green Screen Capabilities', '3-Phase 400A Power', 'Production Green Room'],
    overview: 'Designed specifically for feature films, music videos, and commercial cinematography. Features a state-of-the-art virtual production LED volume, silent dual-zone HVAC, and dedicated production offices.',
    hostName: 'Marcus Vance',
    hostEmail: 'marcus.films@studiospace.com',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    rating: 4.98,
    reviewsCount: 52,
    featured: true,
    createdAt: new Date('2026-01-20T11:00:00Z'),
    updatedAt: new Date('2026-01-20T11:00:00Z')
  },
  {
    title: 'Neon Horizon Podcast Lounge & Live Stream Lab',
    category: 'Podcast Rooms',
    hourlyRate: 65,
    securityDeposit: 100,
    maxCapacity: 8,
    location: 'Downtown Creative Hub, Austin, TX',
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['4x Shure SM7B Microphones', 'RodeCaster Pro II Console', 'Triple 4K Sony FX3 Camera Setup', 'Acoustic Slat Wood Paneling', 'Custom RGB Ambient Lighting', 'Blackmagic ATEM Mini Switcher', 'Fast Fiber Internet'],
    overview: 'Turnkey recording paradise built for high-end podcasts, vodcasts, and live Twitch/YouTube broadcasts. Just plug in your SD card or laptop and record broadcast-ready content in minutes.',
    hostName: 'Elena Rostova',
    hostEmail: 'elena.audio@studiospace.com',
    hostAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    rating: 4.92,
    reviewsCount: 46,
    featured: true,
    createdAt: new Date('2026-01-25T14:00:00Z'),
    updatedAt: new Date('2026-01-25T14:00:00Z')
  },
  {
    title: 'Velvet Analog Recording & Mastering Suite',
    category: 'Music Suites',
    hourlyRate: 110,
    securityDeposit: 200,
    maxCapacity: 10,
    location: 'Music Row, Nashville, TN',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['SSL 4000 Console', 'Neumann U87 & Tube Mics', 'Genelec 8351B Studio Monitors', 'Acoustically Isolated Vocal Booth', 'Fender Rhodes & Yamaha Grand Piano', 'Avid Pro Tools Ultimate HDX'],
    overview: 'A world-class acoustic recording studio tuned by acoustic architects. Equipped with legendary vintage analog outboard gear and state-of-the-art digital audio workstations for album tracking and vocal sessions.',
    hostName: 'David Mercer',
    hostEmail: 'david.sound@studiospace.com',
    hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    rating: 4.97,
    reviewsCount: 31,
    featured: true,
    createdAt: new Date('2026-02-01T09:30:00Z'),
    updatedAt: new Date('2026-02-01T09:30:00Z')
  },
  {
    title: 'Sunlit Ceramic & Sculpture Workshop Atelier',
    category: 'Art Workshops',
    hourlyRate: 50,
    securityDeposit: 80,
    maxCapacity: 18,
    location: 'Mission District, San Francisco, CA',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['6x Shimpo Potter Wheels', 'Electric Skutt Kiln on site', 'Heavy-Duty Work Benches', 'Wash-Down Clay Sink & Trap', 'Natural Skylights', 'Aprons & Sculpting Toolkits', 'Drying Racks'],
    overview: 'Vibrant, open-concept atelier tailored for pottery workshops, clay sculpting, and mixed-media artisan masterclasses. Features polished concrete floors, tall ceilings, and ample ventilation.',
    hostName: 'Chloe Bennett',
    hostEmail: 'chloe.art@studiospace.com',
    hostAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    rating: 4.88,
    reviewsCount: 24,
    featured: true,
    createdAt: new Date('2026-02-05T12:00:00Z'),
    updatedAt: new Date('2026-02-05T12:00:00Z')
  },
  {
    title: 'The Industrial Darkroom & Tintype Photo Studio',
    category: 'Photo Studios',
    hourlyRate: 75,
    securityDeposit: 120,
    maxCapacity: 12,
    location: 'West Loop, Chicago, IL',
    image: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Traditional Wet Darkroom', 'Enlargers for 35mm & Medium Format', 'Continuous Hot Lights (Aputure)', 'Exposed Brick Backdrops', 'Seamless Paper Rolls (Multiple Colors)', 'Private Dressing Room'],
    overview: 'An atmospheric industrial studio combining historic brick character with both classic darkroom chemistry and modern continuous LED lighting rigs. A beloved favorite for film and portrait artists.',
    hostName: 'Julian Croft',
    hostEmail: 'julian.film@studiospace.com',
    hostAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
    rating: 4.91,
    reviewsCount: 19,
    featured: true,
    createdAt: new Date('2026-02-10T16:20:00Z'),
    updatedAt: new Date('2026-02-10T16:20:00Z')
  },
  {
    title: 'Cyberpunk Soundstage & Volumetric Motion Lab',
    category: 'Sound Stages',
    hourlyRate: 160,
    securityDeposit: 350,
    maxCapacity: 25,
    location: 'Pioneer Square, Seattle, WA',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['16x OptiTrack Motion Capture Cameras', 'Full RGB Ceiling Array', 'Haze and Fog Machines Included', 'Motorized Camera Jib', 'Dedicated Client Suite & Catering Bar'],
    overview: 'Cutting-edge production stage geared toward sci-fi productions, music videos, experimental motion capture, and virtual reality production pipelines with comprehensive lighting controls.',
    hostName: 'Kai Tanaka',
    hostEmail: 'kai.mocap@studiospace.com',
    hostAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    rating: 4.96,
    reviewsCount: 35,
    featured: false,
    createdAt: new Date('2026-02-12T08:15:00Z'),
    updatedAt: new Date('2026-02-12T08:15:00Z')
  },
  {
    title: 'The Modern Broadcast & Multitrack Suite',
    category: 'Music Suites',
    hourlyRate: 95,
    securityDeposit: 150,
    maxCapacity: 8,
    location: 'Wynwood Art District, Miami, FL',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Universal Audio Apollo x8p', 'Focal Trio6 Be Monitors', 'Moog Sub 37 & Dave Smith Synths', 'Vocal Booth with Kaotica Eyeball', 'Ultra-Low Latency Monitoring'],
    overview: 'A sleek, sun-drenched production space tailored for contemporary electronic, pop, and hip-hop producers. Loaded with industry-standard analog synthesizers and pristine digital conversion.',
    hostName: 'Mateo Rossi',
    hostEmail: 'mateo.beats@studiospace.com',
    hostAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
    rating: 4.93,
    reviewsCount: 28,
    featured: false,
    createdAt: new Date('2026-02-15T15:45:00Z'),
    updatedAt: new Date('2026-02-15T15:45:00Z')
  }
];

async function seedDatabase() {
  console.log('🌱 Starting StudioSpace database seed...');
  const db = await connectDB();

  if (!db) {
    console.error('❌ Cannot seed: Database connection failed. Please ensure your MongoDB URI and password are set in server/.env');
    process.exit(1);
  }

  try {
    // 1. Create or update Examiner Test User
    const examinerEmail = 'examiner@studiospace.com';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Examiner123!', salt);

    const testUser = {
      name: 'StudioSpace Examiner',
      email: examinerEmail,
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      passwordHash,
      role: 'creator',
      wishlist: [],
      updatedAt: new Date()
    };

    await db.collection('users').updateOne(
      { email: examinerEmail },
      { $set: testUser, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    console.log(`✅ Examiner user created/updated: ${examinerEmail} (Password: Examiner123!)`);

    // 2. Clear existing sample studios to prevent duplicate runs
    const existingCount = await db.collection('studios').countDocuments();
    if (existingCount === 0) {
      await db.collection('studios').insertMany(sampleStudios);
      console.log(`✅ Seeded ${sampleStudios.length} rich creative studio spaces!`);
    } else {
      console.log(`ℹ️ Studios collection already has ${existingCount} items. Skipping initial insert to preserve data.`);
    }

    console.log('🎉 Database seeding completed successfully.');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await closeDB();
    process.exit(0);
  }
}

seedDatabase();

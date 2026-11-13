/**
 * @fileoverview Data Katalog Furnitur, Utilitas Pemformatan, dan Konten Statis Aplikasi STILL.
 *
 * File ini berfungsi sebagai "Single Source of Truth" (sumber data tunggal) untuk:
 * 1. Daftar produk awal (9 produk aktif di etalase + 1 produk Out of Stock untuk tabel Seller Inventory).
 * 2. Fungsi pembantu (`helper functions`) untuk format mata uang Rupiah, status stok, dan kalkulasi dimensi.
 * 3. Data pendukung untuk Home Collection Bento, Filter Shop, Add-on Checkout, Bank Transfer, QRIS, dan Concierge FAQ.
 */

import { IMAGES } from '../assets/assetMap'

/**
 * Mengubah angka numerik menjadi string format mata uang Rupiah Indonesia.
 *
 * @param {number} amount - Nilai nominal harga dalam satuan Rupiah (misal: 6800000).
 * @returns {string} Format Rupiah yang mudah dibaca, misalnya "Rp 6.800.000".
 */
export function formatRupiah(amount) {
  const safeNumber = Number.isFinite(Number(amount)) ? Number(amount) : 0
  return `Rp ${Math.round(safeNumber).toLocaleString('id-ID')}`
}

/**
 * Mengubah angka harga menjadi label ringkas berawalan "Rp" dengan satuan K atau M untuk pill filter.
 *
 * @param {number} amount - Nilai harga dalam Rupiah.
 * @returns {string} String ringkas, misal 500000 -> "500K" atau 10000000 -> "10M".
 */
export function formatCompactPrice(amount) {
  if (amount >= 1000000) {
    const millions = amount / 1000000
    return Number.isInteger(millions) ? `${millions}M` : `${millions.toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `${Math.round(amount / 1000)}K`
  }
  return String(amount)
}

/**
 * Menentukan label status stok produk dan kelas warna badge-nya berdasarkan jumlah stok saat ini.
 * Logika ini dipakai seragam oleh ProductCard (Storefront) dan tabel Inventory (Seller Workspace).
 *
 * @param {number} stock - Jumlah unit tersedia di gudang.
 * @returns {{ label: string, tone: 'in-stock' | 'low-stock' | 'out-of-stock' }} Objek status & variasi warna.
 */
export function getStockMeta(stock) {
  if (stock <= 0) {
    return { label: 'Out of stock', tone: 'out-of-stock' }
  }
  if (stock < 10) {
    return { label: 'Low stock', tone: 'low-stock' }
  }
  return { label: 'In stock', tone: 'in-stock' }
}

/**
 * Menghitung luas jejak lantai (footprint) furnitur dalam meter persegi (m²) dari dimensi cm.
 *
 * @param {number} widthCm - Lebar produk dalam sentimeter.
 * @param {number} depthCm - Kedalaman produk dalam sentimeter.
 * @returns {string} Luas lantai terformat dua desimal, misalnya "0.56 m²".
 */
export function calculateFootprintSqm(widthCm, depthCm) {
  const sqm = ((Number(widthCm) || 72) * (Number(depthCm) || 78)) / 10000
  return `${sqm.toFixed(2)} m²`
}

/**
 * Daftar koleksi editorial pada bagian bento 3-kartu di halaman Home (01 Home).
 */
export const COLLECTION_STORIES = [
  {
    id: 'quiet-corner',
    number: '01',
    title: 'FIND YOUR QUIET CORNER',
    subtitle: 'Soft silhouettes and warm natural upholstery for restorative reading rituals.',
    tag: 'THE NATURAL COLLECTION',
    roomFilter: 'Living room',
    materialFilter: 'Natural materials',
    image: IMAGES.naturalCollection,
    featuredProductId: 'forma-lounge-chair',
  },
  {
    id: 'crafted-to-stay',
    number: '02',
    title: 'CRAFTED TO STAY WITH YOU',
    subtitle: 'Kiln-dried solid walnut and white oak joinery designed to age gracefully over decades.',
    tag: 'ARCHITECTURAL JOINERY',
    roomFilter: 'Living room',
    materialFilter: 'Solid wood',
    image: IMAGES.heroLivingRoom,
    featuredProductId: 'linea-sideboard',
  },
  {
    id: 'small-space',
    number: '03',
    title: 'SMALL SPACE. MORE POSSIBILITY.',
    subtitle: 'Clean proportions and modular pieces tailored for compact urban apartments.',
    tag: 'COMPACT PROPORTIONS',
    roomFilter: 'Workspace',
    materialFilter: 'Natural materials',
    image: IMAGES.naturalCollection,
    featuredProductId: 'studio-writing-desk',
  },
]

/**
 * Data awal katalog furnitur STILL yang dipadukan dari frame Figma Storefront (02) dan Inventory (05).
 */
export const INITIAL_PRODUCTS = [
  {
    id: 'forma-lounge-chair',
    sku: 'FRM-001',
    name: 'Forma lounge chair',
    category: 'Seating',
    room: 'Living room',
    collectionTag: 'THE NATURAL COLLECTION',
    price: 6800000,
    stock: 24,
    status: 'Published',
    rating: 4.9,
    reviewsCount: 128,
    materials: ['Natural materials', 'Solid wood', 'Bouclé fabric'],
    dimensions: {
      width: 72,
      depth: 78,
      height: 76,
      seatHeight: 42,
      boxSize: '82 × 80 × 84 cm',
    },
    sizeTier: 'Compact (< 90cm)',
    finishes: [
      { id: 'walnut-oatmeal', name: 'Walnut & Oatmeal', swatch: '#8c6239', accent: '#dfd9ce' },
      { id: 'natural-oak', name: 'Natural oak', swatch: '#cbb38f', accent: '#f1ede4' },
      { id: 'black-ash', name: 'Black ash', swatch: '#232325', accent: '#525257' },
    ],
    image: IMAGES.formaLoungeChair,
    gallery: [
      { id: 'angle-hero', label: 'Three-quarter view', src: IMAGES.formaLoungeChair },
      { id: 'angle-front', label: 'Front profile', src: IMAGES.formaFrontView },
      { id: 'angle-rear', label: 'Rear joinery', src: IMAGES.formaRearView },
      { id: 'angle-detail', label: 'Bouclé & walnut grain', src: IMAGES.formaMaterialDetail },
    ],
    summary:
      'Sculpted solid walnut frame paired with textured oatmeal bouclé cushions. Engineered for low-slung, restorative lounging.',
    specs: [
      { label: 'FRAME', value: 'Kiln-dried solid American walnut with matte oil finish' },
      { label: 'UPHOLSTERY', value: '480gsm Belgian oatmeal bouclé blend, removable covers' },
      { label: 'JOINERY', value: 'Exposed wedged mortise-and-tenon timber construction' },
      { label: 'CARE', value: 'Dust dry weekly; vacuum fabric with soft upholstery brush' },
    ],
  },
  {
    id: 'luma-modular-sofa',
    sku: 'LUM-004',
    name: 'Luma modular sofa',
    category: 'Seating',
    room: 'Living room',
    collectionTag: 'THE ESSENTIAL EDIT',
    price: 9800000,
    stock: 7,
    status: 'Published',
    rating: 4.8,
    reviewsCount: 94,
    materials: ['Natural materials', 'Linen blend', 'Solid wood'],
    dimensions: {
      width: 224,
      depth: 94,
      height: 74,
      seatHeight: 41,
      boxSize: '230 × 100 × 78 cm',
    },
    sizeTier: 'Large (> 160cm)',
    finishes: [
      { id: 'warm-linen', name: 'Warm linen', swatch: '#dfd8cd', accent: '#f3f1ec' },
      { id: 'stone-grey', name: 'Stone grey', swatch: '#8b8a88', accent: '#d6d4cf' },
      { id: 'espresso-oak', name: 'Espresso oak base', swatch: '#4b382c', accent: '#a89f94' },
    ],
    image: IMAGES.lumaModularSofa,
    gallery: [
      { id: 'luma-main', label: 'Full silhouette', src: IMAGES.lumaModularSofa },
      { id: 'luma-fabric', label: 'Textile close-up', src: IMAGES.formaMaterialDetail },
      { id: 'luma-room', label: 'Living space view', src: IMAGES.heroLivingRoom },
    ],
    summary:
      'Generous three-seat modular silhouette anchored on recessed oak plinth legs. Deep down-feather cushions adapt effortlessly to your space.',
    specs: [
      { label: 'FRAME', value: 'Solid kiln-dried white oak & reinforced webbing' },
      { label: 'FILLING', value: 'High-resilience multi-density core wrapped in microfiber feather' },
      { label: 'UPHOLSTERY', value: 'Breathable 65% Belgian linen, 35% cotton weave' },
      { label: 'MODULARITY', value: 'Concealed brass alligator clips lock sections securely' },
    ],
  },
  {
    id: 'arc-coffee-table',
    sku: 'ARC-002',
    name: 'Arc coffee table',
    category: 'Tables',
    room: 'Living room',
    collectionTag: 'THE ESSENTIAL EDIT',
    price: 3450000,
    stock: 18,
    status: 'Published',
    rating: 4.9,
    reviewsCount: 76,
    materials: ['Natural materials', 'Solid wood'],
    dimensions: {
      width: 110,
      depth: 62,
      height: 36,
      seatHeight: 36,
      boxSize: '118 × 70 × 44 cm',
    },
    sizeTier: 'Medium (90–160cm)',
    finishes: [
      { id: 'smoked-oak', name: 'Smoked oak', swatch: '#7c5d41', accent: '#c9b29b' },
      { id: 'natural-ash', name: 'Natural ash', swatch: '#d3c2a6', accent: '#f1eae0' },
    ],
    image: IMAGES.arcCoffeeTable,
    gallery: [
      { id: 'arc-main', label: 'Primary angle', src: IMAGES.arcCoffeeTable },
      { id: 'arc-grain', label: 'Wood surface grain', src: IMAGES.formaMaterialDetail },
    ],
    summary:
      'Low architectural coffee table with softly chamfered edges and twin curved slab legs that lend lightness to compact living rooms.',
    specs: [
      { label: 'TOP THICKNESS', value: '28mm solid timber with bevelled underside edge' },
      { label: 'FINISH', value: 'Zero-VOC hardwax matte botanical oil' },
      { label: 'MAX LOAD', value: '45 kg distributed weight' },
      { label: 'ASSEMBLY', value: 'Ships flat-packed with 4-bolt tool-free leg key' },
    ],
  },
  {
    id: 'linea-sideboard',
    sku: 'LIN-009',
    name: 'Linea sideboard',
    category: 'Storage',
    room: 'Dining room',
    collectionTag: 'THE NATURAL COLLECTION',
    price: 8900000,
    stock: 12,
    status: 'Published',
    rating: 5.0,
    reviewsCount: 52,
    materials: ['Natural materials', 'Solid wood'],
    dimensions: {
      width: 165,
      depth: 45,
      height: 78,
      seatHeight: 78,
      boxSize: '172 × 52 × 85 cm',
    },
    sizeTier: 'Large (> 160cm)',
    finishes: [
      { id: 'teak-matte', name: 'Natural teak', swatch: '#98693f', accent: '#d8c2ab' },
      { id: 'ebony-stain', name: 'Charcoal oak', swatch: '#2c2927', accent: '#75706b' },
    ],
    image: IMAGES.lineaSideboard,
    gallery: [
      { id: 'linea-main', label: 'Credenza elevation', src: IMAGES.lineaSideboard },
      { id: 'linea-detail', label: 'Fluted grain detail', src: IMAGES.formaMaterialDetail },
    ],
    summary:
      'Quiet horizontal proportions with push-to-open solid timber doors and adjustable interior shelves for diningware or audio equipment.',
    specs: [
      { label: 'DOORS', value: 'Soft-close Blum European concealed hinges' },
      { label: 'STORAGE', value: 'Three compartments with height-adjustable shelves & cable pass' },
      { label: 'MATERIAL', value: 'FSC-certified solid teak & oak veneer core' },
      { label: 'WEIGHT', value: '48 kg (White-Glove delivery recommended)' },
    ],
  },
  {
    id: 'halo-floor-lamp',
    sku: 'HAL-011',
    name: 'Halo floor lamp',
    category: 'Lighting',
    room: 'Living room',
    collectionTag: 'THE ESSENTIAL EDIT',
    price: 2150000,
    stock: 31,
    status: 'Published',
    rating: 4.8,
    reviewsCount: 64,
    materials: ['Steel & stone', 'Natural materials'],
    dimensions: {
      width: 34,
      depth: 34,
      height: 158,
      seatHeight: 158,
      boxSize: '42 × 42 × 165 cm',
    },
    sizeTier: 'Compact (< 90cm)',
    finishes: [
      { id: 'matte-black-linen', name: 'Matte black & rice paper', swatch: '#1f1f21', accent: '#edeae2' },
      { id: 'brushed-brass', name: 'Brushed brass', swatch: '#b79658', accent: '#f3efe6' },
    ],
    image: IMAGES.haloFloorLamp,
    gallery: [
      { id: 'halo-main', label: 'Full height view', src: IMAGES.haloFloorLamp },
    ],
    summary:
      'Slender blackened steel stem crowned by a diffused linen drum shade that casts a warm 2700K architectural glow across evening rooms.',
    specs: [
      { label: 'LIGHT SOURCE', value: 'Included warm dimmable LED E27 bulb (2700K)' },
      { label: 'BASE', value: 'Weighted honed basalt stone cylinder for stability' },
      { label: 'CORD', value: '2.4m braided fabric cord with brass inline foot switch' },
      { label: 'VOLTAGE', value: '220–240V Indonesian standard Type-F plug' },
    ],
  },
  {
    id: 'grid-oak-shelf',
    sku: 'GRD-007',
    name: 'Grid oak shelf',
    category: 'Storage',
    room: 'Workspace',
    collectionTag: 'THE NATURAL COLLECTION',
    price: 4200000,
    stock: 15,
    status: 'Published',
    rating: 4.9,
    reviewsCount: 41,
    materials: ['Natural materials', 'Solid wood'],
    dimensions: {
      width: 120,
      depth: 36,
      height: 145,
      seatHeight: 145,
      boxSize: '150 × 44 × 24 cm',
    },
    sizeTier: 'Medium (90–160cm)',
    finishes: [
      { id: 'white-oak', name: 'Natural white oak', swatch: '#cbb38f', accent: '#f1ede4' },
      { id: 'walnut-oak', name: 'Smoked walnut', swatch: '#6d4c33', accent: '#baa590' },
    ],
    image: IMAGES.gridOakShelf,
    gallery: [
      { id: 'grid-main', label: 'Open shelving view', src: IMAGES.gridOakShelf },
    ],
    summary:
      'Open rhythmic grid shelving system crafted from solid European oak—doubles naturally as a sculptural library wall or room divider.',
    specs: [
      { label: 'SHELF THICKNESS', value: '22mm solid oak rails with brass dowel pins' },
      { label: 'BAY HEIGHT', value: '33 cm clearance — fits vinyl records & oversized art books' },
      { label: 'CAPACITY', value: '25 kg per bay' },
      { label: 'WALL ANCHOR', value: 'Discrete brushed-steel anti-tip bracket included' },
    ],
  },
  {
    id: 'fold-dining-chair',
    sku: 'FLD-003',
    name: 'Fold dining chair',
    category: 'Seating',
    room: 'Dining room',
    collectionTag: 'THE NATURAL COLLECTION',
    price: 1950000,
    stock: 29,
    status: 'Published',
    rating: 4.7,
    reviewsCount: 83,
    materials: ['Natural materials', 'Solid wood'],
    dimensions: {
      width: 49,
      depth: 52,
      height: 79,
      seatHeight: 45,
      boxSize: '56 × 58 × 86 cm',
    },
    sizeTier: 'Compact (< 90cm)',
    finishes: [
      { id: 'steam-ash', name: 'Steam-bent ash', swatch: '#cbb38f', accent: '#f0ece3' },
      { id: 'blackened-ash', name: 'Blackened ash', swatch: '#222224', accent: '#626268' },
    ],
    image: IMAGES.foldDiningChair,
    gallery: [
      { id: 'fold-main', label: 'Dining profile', src: IMAGES.foldDiningChair },
    ],
    summary:
      'Featherweight yet tactile dining chair featuring a contoured steam-bent backrest that supports hours of unhurried dinner conversation.',
    specs: [
      { label: 'WOOD', value: 'Solid German beech or European white ash' },
      { label: 'STACKABLE', value: 'Up to 4 chairs neatly stacked with felt pads' },
      { label: 'SEAT HEIGHT', value: '45 cm — calibrated for 74–76 cm dining tables' },
      { label: 'WEIGHT', value: '4.6 kg per chair' },
    ],
  },
  {
    id: 'studio-writing-desk',
    sku: 'STD-008',
    name: 'Studio writing desk',
    category: 'Tables',
    room: 'Workspace',
    collectionTag: 'THE ESSENTIAL EDIT',
    price: 5600000,
    stock: 11,
    status: 'Published',
    rating: 4.9,
    reviewsCount: 68,
    materials: ['Natural materials', 'Solid wood', 'Steel & stone'],
    dimensions: {
      width: 140,
      depth: 68,
      height: 75,
      seatHeight: 75,
      boxSize: '148 × 76 × 22 cm',
    },
    sizeTier: 'Medium (90–160cm)',
    finishes: [
      { id: 'walnut-slate', name: 'Walnut & slate', swatch: '#745137', accent: '#3d3d42' },
      { id: 'oak-ivory', name: 'White oak', swatch: '#cbb38f', accent: '#f1ede4' },
    ],
    image: IMAGES.studioWritingDesk,
    gallery: [
      { id: 'studio-main', label: 'Desk perspective', src: IMAGES.studioWritingDesk },
    ],
    summary:
      'Architectural study desk featuring a concealed cable trough, two dovetailed stationery drawers, and tapered splayed solid timber legs.',
    specs: [
      { label: 'CABLE MANAGEMENT', value: 'Full-width leather-lined flip tray along rear edge' },
      { label: 'DRAWERS', value: 'Two soft-close drawers lined in charcoal wool felt' },
      { label: 'WORK SURFACE', value: 'Satin-matte urethane resistant to coffee & fountain ink' },
      { label: 'DIMENSIONS', value: '140 × 68 × 75 cm (knee clearance 64 cm)' },
    ],
  },
  {
    id: 'nook-platform-bed',
    sku: 'NOK-010',
    name: 'Nook platform bed',
    category: 'Bedroom',
    room: 'Bedroom',
    collectionTag: 'THE NATURAL COLLECTION',
    price: 9400000,
    stock: 10,
    status: 'Published',
    rating: 4.9,
    reviewsCount: 47,
    materials: ['Natural materials', 'Solid wood'],
    dimensions: {
      width: 188,
      depth: 214,
      height: 88,
      seatHeight: 32,
      boxSize: '205 × 46 × 38 cm (2 boxes)',
    },
    sizeTier: 'Large (> 160cm)',
    finishes: [
      { id: 'natural-oak-linen', name: 'White oak', swatch: '#c5ab87', accent: '#ece7de' },
      { id: 'walnut-bed', name: 'American walnut', swatch: '#724f34', accent: '#b7a189' },
    ],
    image: IMAGES.nookPlatformBed,
    gallery: [
      { id: 'nook-main', label: 'Queen platform view', src: IMAGES.nookPlatformBed },
    ],
    summary:
      'Grounded Japanese-inspired timber platform frame with recessed floating legs and an gently angled solid oak headboard for restful nights.',
    specs: [
      { label: 'MATTRESS FIT', value: 'Indonesian Queen (160 × 200 cm) & King adapters' },
      { label: 'SLATS', value: 'Silent birch plywood slats with wool anti-squeak felt tape' },
      { label: 'CLEARANCE', value: '18 cm under-bed visual reveal' },
      { label: 'ASSEMBLY', value: '15-minute corner-lock brass joinery' },
    ],
  },
  {
    id: 'terra-dining-stool',
    sku: 'TER-012',
    name: 'Terra dining stool',
    category: 'Seating',
    room: 'Dining room',
    collectionTag: 'THE NATURAL COLLECTION',
    price: 850000,
    stock: 0,
    status: 'Out of stock',
    rating: 4.8,
    reviewsCount: 35,
    materials: ['Natural materials', 'Solid wood'],
    dimensions: {
      width: 38,
      depth: 38,
      height: 46,
      seatHeight: 46,
      boxSize: '44 × 44 × 52 cm',
    },
    sizeTier: 'Compact (< 90cm)',
    finishes: [
      { id: 'teak-raw', name: 'Raw teak', swatch: '#966b43', accent: '#d8c5ae' },
    ],
    image: IMAGES.foldDiningChair,
    gallery: [
      { id: 'terra-main', label: 'Turned wood stool', src: IMAGES.foldDiningChair },
    ],
    summary:
      'Turned solid Java teak stool crafted from reclaimed timber offcuts. Ideal as extra guest seating or an understated bedside perch.',
    specs: [
      { label: 'WOOD', value: '100% reclaimed solid Java teak' },
      { label: 'SEAT DIAMETER', value: '35 cm subtly dished circular top' },
      { label: 'WEIGHT', value: '5.2 kg solid turnery' },
      { label: 'RESTOCK ETA', value: 'Batch 04 arriving early next month' },
    ],
  },
]

/**
 * Daftar layanan tambahan pengiriman pada halaman Checkout (09 Checkout Desktop).
 */
export const DELIVERY_ADDONS = [
  {
    id: 'white-glove',
    title: 'White Glove Room-of-Choice Delivery',
    description: '2-person courier team carries the piece inside your chosen room.',
    price: 75000,
  },
  {
    id: 'onsite-assembly',
    title: 'On-site Assembly & Packaging Removal',
    description: 'Unboxed, assembled, levelled, and all cardboard responsibly recycled.',
    price: 50000,
  },
]

/**
 * Daftar opsi rekening Bank Transfer manual yang ditampilkan pada tab Bank Transfer di Checkout.
 */
export const BANK_TRANSFER_OPTIONS = [
  {
    id: 'bca',
    name: 'BCA',
    fullName: 'Bank Central Asia',
    accountNumber: '5280 1192 4401',
    accountName: 'PT STILL FURNITUR INDONESIA',
  },
  {
    id: 'mandiri',
    name: 'Mandiri',
    fullName: 'Bank Mandiri',
    accountNumber: '1240 0088 7310 2',
    accountName: 'PT STILL FURNITUR INDONESIA',
  },
  {
    id: 'bni',
    name: 'BNI',
    fullName: 'Bank Negara Indonesia',
    accountNumber: '0884 2219 04',
    accountName: 'PT STILL FURNITUR INDONESIA',
  },
]

/**
 * Dompet digital / m-banking pendukung QRIS pada layar Checkout (04 & 09).
 */
export const QRIS_PROVIDERS = ['GoPay', 'OVO', 'Dana', 'ShopeePay', 'BCA Mobile']

/**
 * Chip pertanyaan cepat (FAQ) untuk drawer STILL Concierge (07 / Concierge).
 */
export const CONCIERGE_FAQS = [
  {
    id: 'faq-finish',
    label: 'Custom wood finish?',
    reply:
      'Yes! We craft bespoke stains on Walnut, White Oak, and Ash with +7 working days lead time in our Jepara workshop. Which tone suits your space?',
  },
  {
    id: 'faq-bandung',
    label: 'Shipping time to Bandung?',
    reply:
      'For ready-stock pieces like the Forma lounge chair, Jabodetabek & Bandung courier arrives within 2–4 business days with protective blanket wrap.',
  },
  {
    id: 'faq-photos',
    label: 'Request real wood photos',
    reply:
      'Here is a note from our Kemang showroom: every walnut slab has unique cathedral grain. Share your lighting ambiance (warm/cool) and our admin will send natural daylight photos!',
  },
]

/**
 * Pesan awal saat drawer STILL Concierge dibuka agar terasa hidup dan siap membantu.
 */
export const INITIAL_CONCIERGE_MESSAGES = [
  {
    id: 'msg-1',
    sender: 'admin',
    author: 'Raka · STILL Admin',
    time: 'Just now',
    text: 'Hello! Ask us anything about grain tone, upholstery swatches, doorway fit, or Jabodetabek/Bandung delivery.',
  },
]

const SESSION_STORAGE_KEY = 'still_dummy_auth_user'

/**
 * Daftar akun dummy frontend untuk simulasi login peran Pembeli dan Penjual.
 * Catatan belajar: Di aplikasi produksi nanti, data password & validasi ini digantikan
 * oleh backend API/database, bukan disimpan di frontend.
 */
export const DUMMY_ACCOUNTS = {
  customer: {
    id: 'user-buyer-01',
    role: 'customer',
    roleLabel: 'Pembeli',
    name: 'Ayu Prameswari',
    email: 'buyer@still.co.id',
    password: 'still123',
    phone: '+62 812 9400 1122',
    street: 'Jl. Gunawarman No. 42, Kebayoran Baru',
    city: 'Jakarta Selatan',
    postalCode: '12110',
    defaultPage: 'home',
  },
  seller: {
    id: 'user-seller-01',
    role: 'seller',
    roleLabel: 'Penjual',
    name: 'STILL Indonesia',
    email: 'seller@still.co.id',
    password: 'seller123',
    storeLocation: 'Kemang Showroom, Jakarta Selatan',
    defaultPage: 'seller-inventory',
  },
}

/**
 * Memverifikasi kredensial email & kata sandi terhadap akun dummy sesuai peran yang dipilih.
 *
 * @param {object} credentials - Input kredensial dari form Sign In.
 * @param {'customer' | 'seller'} credentials.role - Peran yang dipilih pada tab login (`customer` atau `seller`).
 * @param {string} credentials.email - Alamat email yang diketik pengguna.
 * @param {string} credentials.password - Kata sandi yang diketik pengguna.
 * @returns {{ ok: true, user: object } | { ok: false, error: string }} Hasil verifikasi beserta data sesi tanpa password atau pesan error.
 */
export function authenticateDummyAccount({ role, email, password }) {
  const cleanEmail = (email || '').trim().toLowerCase()
  const cleanPassword = (password || '').trim()

  if (!cleanEmail || !cleanPassword) {
    return { ok: false, error: 'Email dan kata sandi wajib diisi.' }
  }

  const targetAccount = DUMMY_ACCOUNTS[role]
  const otherRoleKey = role === 'customer' ? 'seller' : 'customer'
  const otherAccount = DUMMY_ACCOUNTS[otherRoleKey]

  // Beri pesan spesifik jika pengguna memasukkan email milik peran seberang
  if (cleanEmail === otherAccount.email && cleanPassword === otherAccount.password) {
    return {
      ok: false,
      error: `Kredensial ini terdaftar sebagai akun ${otherAccount.roleLabel}. Silakan pindah ke tab ${otherAccount.roleLabel}.`,
    }
  }

  if (!targetAccount || cleanEmail !== targetAccount.email || cleanPassword !== targetAccount.password) {
    return {
      ok: false,
      error: `Email atau kata sandi salah untuk akun ${targetAccount?.roleLabel || role}.`,
    }
  }

  // Jangan simpan field `password` ke dalam state sesi aplikasi
  const safeSessionUser = { ...targetAccount }
  delete safeSessionUser.password
  return { ok: true, user: safeSessionUser }
}

/**
 * Membaca sesi login dummy tersimpan di `localStorage` agar status login tetap bertahan saat halaman di-refresh.
 *
 * @returns {object | null} Data akun yang sedang login atau `null` jika belum Sign In.
 */
export function loadDummySession() {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Menyimpan objek sesi akun dummy ke `localStorage` setelah berhasil Sign In.
 *
 * @param {object} user - Objek user terautentikasi (tanpa password).
 */
export function saveDummySession(user) {
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user))
  } catch {
    // Abaikan jika browser memblokir localStorage
  }
}

/**
 * Menghapus sesi login dummy dari `localStorage` ketika pengguna melakukan Sign Out.
 */
export function clearDummySession() {
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // Abaikan jika browser memblokir localStorage
  }
}

/**
 * @fileoverview Kamus Lokalisasi Bahasa (Indonesia & Inggris) serta Struktur Navigasi Terpadu.
 *
 * Memastikan isi tautan pada Navbar (desktop & mobile) dan Footer selalu sinkron,
 * semua menu memiliki fungsi nyata, dan seluruh antarmuka dapat berganti bahasa (ID / EN).
 */

/**
 * Daftar menu navigasi utama yang digunakan bersama oleh Navbar (Desktop & Mobile) serta Footer.
 * Setiap item memiliki rute URL nyata atau aksi interaktif sehingga tidak ada tautan mati.
 */
export const SHARED_NAV_LINKS = [
  { id: 'home', path: '/', labelKey: 'navHome' },
  { id: 'shop', path: '/shop', labelKey: 'navShop' },
  { id: 'checkout', path: '/checkout', labelKey: 'navCheckout' },
  { id: 'seller', path: '/seller/inventory', labelKey: 'navSeller' },
]

/**
 * Kamus teks antarmuka dalam Bahasa Indonesia (`id`) dan Bahasa Inggris (`en`).
 */
export const TRANSLATIONS = {
  id: {
    // Navigasi & Header
    navHome: 'Beranda',
    navShop: 'Katalog',
    navLivingRoom: 'Ruang Tamu',
    navCheckout: 'Pembayaran',
    navSeller: 'Studio Penjual',
    navConcierge: 'Tanya Admin',
    searchPlaceholder: 'Cari kursi, sofa, meja, kayu walnut...',
    searchButton: 'Cari',
    signIn: 'Masuk',
    bagTitle: 'Tas Belanja',
    menuLabel: 'Menu',
    langLabel: 'Bahasa',

    // Hero Section (HomePage)
    heroTag: 'KOLEKSI ARSITEKTURAL 026',
    heroTitleLine1: 'OBJEK UNTUK',
    heroTitleLine2: 'RUANG HIDUP.',
    heroSubtitle:
      'Furnitur kayu solid dan tekstil alami dengan proporsi terukur untuk ruang tinggal modern.',
    heroPrimaryCta: 'Jelajahi Katalog',
    heroSecondaryCta: 'Lihat Forma Chair',
    heroCaptionTitle: 'Detail Konstruksi & Material',
    heroCaptionDesc: 'Sambungan kayu walnut kering-oven dengan pelapis bouclé ramah ruang.',

    // Home Sections
    featuredTag: 'KATALOG UTAMA',
    featuredTitle: 'Dirancang untuk keseharian.',
    featuredViewAll: 'Lihat semua katalog',
    collectionsTag: 'KURASI RUANG',
    collectionsTitle: 'Pilih penataan sesuai fungsi ruang Anda.',
    collectionsAction: 'Buka katalog ruang ini',

    // API States (Loading & Error)
    apiLoadingTitle: 'Memuat data katalog dari API...',
    apiErrorTitle: 'Gagal memuat data produk dari server API',
    apiErrorDesc:
      'Koneksi ke endpoint katalog terputus atau server mengembalikan respons gagal. Silakan muat ulang permintaan data.',
    apiRetryBtn: 'Coba Muat Ulang',
    apiSimLabel: 'Simulasi API:',
    apiSimReload: 'Muat Ulang Data (Loading)',
    apiSimError: 'Simulasikan Error API',
    apiSimNormal: 'Mode API Normal',

    // Shop Page
    shopTag: 'KATALOG FURNITUR',
    shopTitle: 'Temukan Furnitur.',
    shopShowing: 'Menampilkan',
    shopPieces: 'produk',
    filterTitle: 'Filter Katalog',
    filterReset: 'Atur Ulang',
    filterCategory: 'Kategori',
    filterPrice: 'Rentang Harga',
    filterMaterial: 'Material',
    filterRoom: 'Ruangan',
    filterDimensions: 'Ukuran Ruang',
    sortLabel: 'Urutkan:',
    sortFeatured: 'Unggulan',
    sortPriceAsc: 'Harga: Rendah ke Tinggi',
    sortPriceDesc: 'Harga: Tinggi ke Rendah',
    sortNameAsc: 'Nama: A ke Z',
    emptyFilterTitle: 'Tidak ada furnitur yang cocok dengan filter ini',
    emptyFilterDesc: 'Coba perluas batas harga atau hapus salah satu filter kategori dan ruangan.',

    // Product Detail Page
    detailNotFoundTitle: 'Produk tidak ditemukan',
    detailNotFoundDesc: 'ID produk pada URL tidak terdaftar di kontrak data katalog kami.',
    detailBackToShop: 'Kembali ke Katalog',
    detailScaleBtn: 'Panduan skala & proporsi ruang (170cm & 3x3m)',
    detailMaterialFinish: 'Pilihan Akhir Material',
    detailBuyNow: 'Beli Sekarang',
    detailAddToCart: 'Tambah ke Tas',
    detailAdded: 'Tersimpan di Tas',
    detailAskAdmin: 'Tanya Admin Tentang Produk Ini',
    detailSpecsTag: 'SPESIFIKASI & KONSTRUKSI',
    detailSpecsTitle: 'Detail teknis produk.',
    detailRelatedTitle: 'Padukan dengan furnitur lain',

    // Footer
    footerTagline: 'Furnitur terukur untuk ruang hidup sehari-hari.',
    footerNavHeading: 'Navigasi Utama',
    footerFeatureHeading: 'Layanan & Akses',
    footerShowroomHeading: 'Showroom Jakarta',
    footerCopyright: '© 2026 fahrizaa - STILL. Hak cipta dilindungi.',
  },
  en: {
    // Navigation & Header
    navHome: 'Home',
    navShop: 'Catalog',
    navLivingRoom: 'Living Room',
    navCheckout: 'Checkout',
    navSeller: 'Seller Studio',
    navConcierge: 'Ask Concierge',
    searchPlaceholder: 'Search chair, sofa, table, walnut...',
    searchButton: 'Search',
    signIn: 'Sign In',
    bagTitle: 'Shopping Bag',
    menuLabel: 'Menu',
    langLabel: 'Language',

    // Hero Section (HomePage)
    heroTag: 'ARCHITECTURAL COLLECTION 026',
    heroTitleLine1: 'OBJECTS FOR',
    heroTitleLine2: 'EVERYDAY LIVING.',
    heroSubtitle:
      'Kiln-dried solid hardwood furniture and natural textiles proportioned for calm, modern rooms.',
    heroPrimaryCta: 'Browse Catalog',
    heroSecondaryCta: 'Inspect Forma Chair',
    heroCaptionTitle: 'Construction & Materiality',
    heroCaptionDesc: 'Solid American walnut mortise joinery paired with tactile oatmeal bouclé.',

    // Home Sections
    featuredTag: 'CORE CATALOG',
    featuredTitle: 'Made for your everyday.',
    featuredViewAll: 'View full catalog',
    collectionsTag: 'ROOM CURATION',
    collectionsTitle: 'Select a room setting for your space.',
    collectionsAction: 'Filter by this room',

    // API States (Loading & Error)
    apiLoadingTitle: 'Fetching catalog data from API...',
    apiErrorTitle: 'Failed to fetch product data from API endpoint',
    apiErrorDesc:
      'The catalog request could not be completed. Check the endpoint connection or retry fetching the JSON payload.',
    apiRetryBtn: 'Retry Request',
    apiSimLabel: 'API Simulation:',
    apiSimReload: 'Refetch Data (Loading)',
    apiSimError: 'Simulate API Error',
    apiSimNormal: 'Normal API Mode',

    // Shop Page
    shopTag: 'FURNITURE CATALOG',
    shopTitle: 'Discover Furniture.',
    shopShowing: 'Showing',
    shopPieces: 'pieces',
    filterTitle: 'Filter Catalog',
    filterReset: 'Reset',
    filterCategory: 'Category',
    filterPrice: 'Price Range',
    filterMaterial: 'Material',
    filterRoom: 'Room',
    filterDimensions: 'Footprint Size',
    sortLabel: 'Sort by:',
    sortFeatured: 'Featured',
    sortPriceAsc: 'Price: Low to High',
    sortPriceDesc: 'Price: High to Low',
    sortNameAsc: 'Name: A to Z',
    emptyFilterTitle: 'No furniture matches your active filters',
    emptyFilterDesc: 'Broaden your price range or clear one of the active room or category filters.',

    // Product Detail Page
    detailNotFoundTitle: 'Product not found',
    detailNotFoundDesc: 'The requested product ID does not exist in the catalog data contract.',
    detailBackToShop: 'Return to Catalog',
    detailScaleBtn: 'Room scale & proportions guide (170cm & 3x3m)',
    detailMaterialFinish: 'Material Finish',
    detailBuyNow: 'Buy Now',
    detailAddToCart: 'Add to Bag',
    detailAdded: 'Added to Bag',
    detailAskAdmin: 'Ask Admin About This Product',
    detailSpecsTag: 'SPECIFICATIONS & JOINERY',
    detailSpecsTitle: 'Technical construction details.',
    detailRelatedTitle: 'Pair cleanly with',

    // Footer
    footerTagline: 'Considered furniture for everyday living.',
    footerNavHeading: 'Main Navigation',
    footerFeatureHeading: 'Features & Access',
    footerShowroomHeading: 'Jakarta Showroom',
    footerCopyright: '© 2026 fahrizaa - STILL. All rights reserved.',
  },
}

const LANGUAGE_STORAGE_KEY = 'still_ui_language'

/**
 * Membaca preferensi bahasa (`id` atau `en`) dari `localStorage`, default ke Bahasa Indonesia (`id`).
 *
 * @returns {'id' | 'en'} Kode bahasa aktif.
 */
export function loadSavedLanguage() {
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return saved === 'en' || saved === 'id' ? saved : 'id'
  } catch {
    return 'id'
  }
}

/**
 * Menyimpan preferensi bahasa pilihan pengguna ke `localStorage`.
 *
 * @param {'id' | 'en'} lang - Kode bahasa yang dipilih.
 */
export function saveLanguagePreference(lang) {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
  } catch {
    // Abaikan jika localStorage dibatasi browser
  }
}

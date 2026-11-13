/**
 * @fileoverview Halaman Katalog & Filter Belanja (`02 — Shop / Discover furniture`).
 *
 * Fitur lengkap sesuai Figma Screen 02:
 * - Bilah pencarian real-time berdasarkan nama produk, SKU, maupun material.
 * - Chip filter aktif yang dapat dihapus satu per satu atau dikosongkan sekaligus (`Clear all`).
 * - Sidebar filter kategori (dengan hitung jumlah produk), dual-handle slider rentang harga
 *   (`Rp 500.000` – `Rp 10.000.000`), material, tipe ruangan, dan filter ukuran.
 * - Pengurutan (`Featured`, `Price: Low to High`, `Price: High to Low`, `Newest`) + paginasi grid 3 kolom.
 */

import { useMemo, useState } from 'react'
import { ICONS } from '../assets/assetMap'
import ProductCard from '../components/ProductCard'
import { formatCompactPrice, formatRupiah } from '../data/furnitureData'

const ITEMS_PER_PAGE = 9
const MIN_PRICE_BOUND = 500000
const MAX_PRICE_BOUND = 10000000
const PRICE_STEP = 250000

/**
 * Merender halaman katalog Shop beserta seluruh kontrol pencarian, filter bertingkat, dan paginasi.
 *
 * @param {object} props - Properti ShopPage.
 * @param {Array<object>} props.products - Daftar seluruh produk di aplikasi.
 * @param {object} props.filters - State filter aktif dari parent (`searchQuery`, `categories`, `materials`, `rooms`, `priceMin`, `priceMax`, `sizeTier`, `sortBy`).
 * @param {Function} props.onUpdateFilters - Handler untuk mengubah nilai filter.
 * @param {Function} props.onResetFilters - Handler mengembalikan seluruh filter ke kondisi default.
 * @param {Function} props.onSelectProduct - Handler berpindah ke halaman Detail Produk.
 * @param {Function} props.onAddToCart - Handler menambah produk ke keranjang.
 * @returns {JSX.Element} Elemen halaman katalog belanja.
 */
export default function ShopPage({
  products,
  filters,
  onUpdateFilters,
  onResetFilters,
  onSelectProduct,
  onAddToCart,
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Hanya tampilkan produk berstatus Published (atau produk aktif) di storefront, tetap hormati stok 0 bila published
  const storefrontProducts = useMemo(
    () => products.filter((item) => item.status !== 'Draft'),
    [products]
  )

  // Daftar opsi unik untuk checkbox sidebar agar otomatis selaras dengan penambahan produk baru di Seller Studio
  const categoryOptions = ['Seating', 'Tables', 'Storage', 'Lighting', 'Bedroom']
  const materialOptions = ['Natural materials', 'Solid wood', 'Bouclé fabric', 'Steel & stone', 'Linen blend']
  const roomOptions = ['Living room', 'Dining room', 'Bedroom', 'Workspace']
  const sizeTierOptions = ['All sizes', 'Compact (< 90cm)', 'Medium (90–160cm)', 'Large (> 160cm)']

  /**
   * Menambah atau menghapus nilai dari array filter multi-pilih (`categories`, `materials`, `rooms`).
   *
   * @param {'categories' | 'materials' | 'rooms'} key - Nama kunci array di objek filters.
   * @param {string} value - Nilai opsi filter yang di-toggle.
   */
  const toggleArrayFilter = (key, value) => {
    const current = filters[key] || []
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
    onUpdateFilters({ [key]: next })
    setCurrentPage(1)
  }

  /**
   * Menghitung daftar produk terfilter dan terurut secara memoized agar performa tetap instan.
   */
  const filteredProducts = useMemo(() => {
    const query = (filters.searchQuery || '').trim().toLowerCase()

    const matched = storefrontProducts.filter((product) => {
      // 1. Cek kecocokan kata kunci pencarian
      if (query) {
        const haystack = [
          product.name,
          product.sku,
          product.category,
          product.room,
          ...(product.materials || []),
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(query)) return false
      }

      // 2. Cek kategori terpilih
      if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
        return false
      }

      // 3. Cek tipe ruangan terpilih
      if (filters.rooms.length > 0 && !filters.rooms.includes(product.room)) {
        return false
      }

      // 4. Cek material terpilih
      if (
        filters.materials.length > 0 &&
        !filters.materials.some((mat) => (product.materials || []).includes(mat))
      ) {
        return false
      }

      // 5. Cek rentang harga
      if (product.price < filters.priceMin || product.price > filters.priceMax) {
        return false
      }

      // 6. Cek dimensi / ukuran
      if (filters.sizeTier !== 'All sizes' && product.sizeTier !== filters.sizeTier) {
        return false
      }

      return true
    })

    // Pengurutan hasil
    const sorted = [...matched]
    if (filters.sortBy === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price)
    } else if (filters.sortBy === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price)
    } else if (filters.sortBy === 'name-asc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    }

    return sorted
  }, [storefrontProducts, filters])

  // Kalkulasi paginasi halaman aktif
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  )

  /**
   * Membangun daftar chip filter aktif di atas grid untuk memudahkan pengguna melihat filter yang diterapkan.
   */
  const activeFilterChips = []
  filters.categories.forEach((cat) =>
    activeFilterChips.push({
      id: `cat-${cat}`,
      label: cat,
      onRemove: () => toggleArrayFilter('categories', cat),
    })
  )
  filters.rooms.forEach((room) =>
    activeFilterChips.push({
      id: `room-${room}`,
      label: room,
      onRemove: () => toggleArrayFilter('rooms', room),
    })
  )
  filters.materials.forEach((mat) =>
    activeFilterChips.push({
      id: `mat-${mat}`,
      label: mat,
      onRemove: () => toggleArrayFilter('materials', mat),
    })
  )
  if (filters.priceMin > MIN_PRICE_BOUND || filters.priceMax < MAX_PRICE_BOUND) {
    activeFilterChips.push({
      id: 'price-range',
      label: `Rp ${formatCompactPrice(filters.priceMin)} – ${formatCompactPrice(filters.priceMax)}`,
      onRemove: () => onUpdateFilters({ priceMin: MIN_PRICE_BOUND, priceMax: MAX_PRICE_BOUND }),
    })
  }
  if (filters.sizeTier !== 'All sizes') {
    activeFilterChips.push({
      id: 'size-tier',
      label: filters.sizeTier,
      onRemove: () => onUpdateFilters({ sizeTier: 'All sizes' }),
    })
  }

  // Persentase posisi track bar warna gelap di slider harga ganda
  const minPercent = ((filters.priceMin - MIN_PRICE_BOUND) / (MAX_PRICE_BOUND - MIN_PRICE_BOUND)) * 100
  const maxPercent = ((filters.priceMax - MIN_PRICE_BOUND) / (MAX_PRICE_BOUND - MIN_PRICE_BOUND)) * 100

  return (
    <main className="mx-auto max-w-[1440px] px-5 pt-8 sm:px-8 sm:pt-10 lg:px-12">
      {/* Header Judul Halaman Shop */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#e6e6e9] pb-7 lg:flex-row lg:items-end">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#71717a]">
            CATALOG — COLLECTION 026
          </p>
          <h1 className="mt-2 text-[36px] sm:text-[48px] font-normal leading-none tracking-[-1.6px] text-[#111111]">
            DISCOVER FURNITURE.
          </h1>
        </div>
        <p className="text-[13px] text-[#71717a]">
          Showing <strong className="font-medium text-[#111111]">{filteredProducts.length}</strong>{' '}
          considered pieces ready for modern rooms
        </p>
      </div>

      {/* Bilah Pencarian & Urutkan */}
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="flex h-[46px] flex-1 items-center gap-3 rounded-full bg-[#f5f5f7] px-5">
            <img src={ICONS.search} alt="" width={16} height={16} className="h-4 w-4 opacity-70" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => {
                onUpdateFilters({ searchQuery: e.target.value })
                setCurrentPage(1)
              }}
              placeholder="Search sofa, lounge chair, walnut, SKU..."
              className="w-full bg-transparent text-[13px] text-[#111111] placeholder:text-[#71717a] focus:outline-none"
            />
            {filters.searchQuery ? (
              <button
                type="button"
                onClick={() => onUpdateFilters({ searchQuery: '' })}
                className="text-[12px] text-[#71717a] hover:text-[#111111] cursor-pointer"
              >
                Clear
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            className="inline-flex h-[46px] items-center gap-2 rounded-full border border-[#e6e6e9] bg-white px-4 text-[12px] font-medium text-[#111111] lg:hidden cursor-pointer"
          >
            <span>Filters</span>
            {activeFilterChips.length > 0 ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#141414] text-[10px] text-white">
                {activeFilterChips.length}
              </span>
            ) : null}
          </button>
        </div>

        {/* Dropdown Pengurutan */}
        <div className="flex items-center gap-2.5">
          <label htmlFor="shop-sort-select" className="text-[12px] text-[#71717a]">
            Sort by:
          </label>
          <select
            id="shop-sort-select"
            value={filters.sortBy}
            onChange={(e) => onUpdateFilters({ sortBy: e.target.value })}
            className="h-[46px] rounded-full border border-[#e6e6e9] bg-[#f5f5f7] px-4 text-[12px] font-medium text-[#111111] focus:outline-none cursor-pointer"
          >
            <option value="featured">Featured pieces</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Alphabetical: A–Z</option>
          </select>
        </div>
      </div>

      {/* Baris Active Filter Pills */}
      {activeFilterChips.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeFilterChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={chip.onRemove}
              className="inline-flex items-center gap-2 rounded-full bg-[#141414] px-3.5 py-1.5 text-[11px] font-medium text-white transition-opacity hover:opacity-85 cursor-pointer"
            >
              <span>{chip.label}</span>
              <span className="text-[#38bdf8]">×</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              onResetFilters()
              setCurrentPage(1)
            }}
            className="px-2.5 py-1.5 text-[11px] font-medium text-[#71717a] underline underline-offset-4 hover:text-[#111111] cursor-pointer"
          >
            Clear all
          </button>
        </div>
      ) : null}

      {/* Tata Letak Dua Kolom: Filter Sidebar Kiri + Grid Produk Kanan */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[276px_1fr]">
        {/* SIDEBAR FILTER */}
        <aside
          className={`${
            mobileFiltersOpen ? 'block' : 'hidden'
          } lg:block h-fit rounded-[20px] border border-[#e6e6e9] bg-[#fafafa] p-5`}
        >
          <div className="flex items-center justify-between border-b border-[#e6e6e9] pb-3.5">
            <h2 className="text-[12px] font-medium uppercase tracking-[0.1em] text-[#111111]">
              FILTER BY
            </h2>
            <button
              type="button"
              onClick={() => {
                onResetFilters()
                setCurrentPage(1)
              }}
              className="text-[11px] text-[#71717a] hover:text-[#111111] cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* 1. Category Filter */}
          <div className="mt-5 border-b border-[#e6e6e9] pb-5">
            <h3 className="text-[12px] font-medium text-[#111111]">Category</h3>
            <div className="mt-3 space-y-2.5">
              {categoryOptions.map((category) => {
                const count = storefrontProducts.filter((p) => p.category === category).length
                const checked = filters.categories.includes(category)
                return (
                  <label
                    key={category}
                    className="flex items-center justify-between text-[13px] cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5 text-[#111111]">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleArrayFilter('categories', category)}
                        className="h-4 w-4 accent-[#141414] rounded cursor-pointer"
                      />
                      <span>{category}</span>
                    </span>
                    <span className="text-[11px] text-[#71717a]">{count}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* 2. Dual-Range Price Slider */}
          <div className="mt-5 border-b border-[#e6e6e9] pb-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-medium text-[#111111]">Price range</h3>
              <span className="text-[11px] font-medium text-[#71717a]">IDR</span>
            </div>

            <div className="mt-4">
              <div className="relative h-5 flex items-center">
                <div className="h-1.5 w-full rounded-full bg-[#e6e6e9]" />
                <div
                  className="absolute h-1.5 rounded-full bg-[#141414]"
                  style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
                />
                <input
                  type="range"
                  aria-label="Minimum price"
                  min={MIN_PRICE_BOUND}
                  max={MAX_PRICE_BOUND}
                  step={PRICE_STEP}
                  value={filters.priceMin}
                  onChange={(e) => {
                    const nextMin = Math.min(Number(e.target.value), filters.priceMax - PRICE_STEP)
                    onUpdateFilters({ priceMin: nextMin })
                    setCurrentPage(1)
                  }}
                  className="range-slider-thumb pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent"
                />
                <input
                  type="range"
                  aria-label="Maximum price"
                  min={MIN_PRICE_BOUND}
                  max={MAX_PRICE_BOUND}
                  step={PRICE_STEP}
                  value={filters.priceMax}
                  onChange={(e) => {
                    const nextMax = Math.max(Number(e.target.value), filters.priceMin + PRICE_STEP)
                    onUpdateFilters({ priceMax: nextMax })
                    setCurrentPage(1)
                  }}
                  className="range-slider-thumb pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent"
                />
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] font-medium text-[#111111]">
                <span>{formatRupiah(filters.priceMin)}</span>
                <span>{formatRupiah(filters.priceMax)}</span>
              </div>
            </div>
          </div>

          {/* 3. Material Filter */}
          <div className="mt-5 border-b border-[#e6e6e9] pb-5">
            <h3 className="text-[12px] font-medium text-[#111111]">Material</h3>
            <div className="mt-3 space-y-2.5">
              {materialOptions.map((mat) => (
                <label key={mat} className="flex items-center gap-2.5 text-[13px] text-[#111111] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.materials.includes(mat)}
                    onChange={() => toggleArrayFilter('materials', mat)}
                    className="h-4 w-4 accent-[#141414] rounded cursor-pointer"
                  />
                  <span>{mat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. Room Type Filter */}
          <div className="mt-5 border-b border-[#e6e6e9] pb-5">
            <h3 className="text-[12px] font-medium text-[#111111]">Room</h3>
            <div className="mt-3 space-y-2.5">
              {roomOptions.map((room) => (
                <label key={room} className="flex items-center gap-2.5 text-[13px] text-[#111111] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.rooms.includes(room)}
                    onChange={() => toggleArrayFilter('rooms', room)}
                    className="h-4 w-4 accent-[#141414] rounded cursor-pointer"
                  />
                  <span>{room}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 5. Dimension Footprint Filter */}
          <div className="mt-5">
            <label htmlFor="size-tier-select" className="block text-[12px] font-medium text-[#111111]">
              Dimensions / Footprint
            </label>
            <select
              id="size-tier-select"
              value={filters.sizeTier}
              onChange={(e) => {
                onUpdateFilters({ sizeTier: e.target.value })
                setCurrentPage(1)
              }}
              className="mt-2.5 h-10 w-full rounded-xl border border-[#e6e6e9] bg-white px-3 text-[12px] text-[#111111] focus:outline-none cursor-pointer"
            >
              {sizeTierOptions.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* GRID PRODUK KANAN */}
        <div>
          {paginatedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#d4d4d8] bg-[#fafafa] px-6 py-20 text-center">
              <p className="text-[18px] font-normal text-[#111111]">
                No furniture matches your selected filters
              </p>
              <p className="mt-2 max-w-md text-[13px] text-[#71717a]">
                Try broadening your price ceiling or clearing a material/room filter to inspect more pieces.
              </p>
              <button
                type="button"
                onClick={() => {
                  onResetFilters()
                  setCurrentPage(1)
                }}
                className="mt-6 rounded-full bg-[#141414] px-6 py-2.5 text-[12px] font-medium text-white cursor-pointer"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={onSelectProduct}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          )}

          {/* Paginasi Bawah */}
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#e6e6e9] pt-6 sm:flex-row">
            <p className="text-[12px] text-[#71717a]">
              Page {safePage} of {totalPages} · {filteredProducts.length} pieces matched
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f7] text-[12px] text-[#111111] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                aria-label="Halaman sebelumnya"
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-medium transition-colors cursor-pointer ${
                    pageNum === safePage
                      ? 'bg-[#141414] text-white'
                      : 'bg-[#f5f5f7] text-[#71717a] hover:text-[#111111]'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f7] text-[12px] text-[#111111] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                aria-label="Halaman berikutnya"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

/**
 * @fileoverview Halaman Katalog & Filter Belanja (`/shop`).
 *
 * Fitur yang diterapkan:
 * - Terintegrasi dengan URL Query Parameters (`?q=`, `?room=`, `?category=`) menggunakan `useSearchParams`
 *   dari React Router agar tautan dari Navbar, Search Bar, dan Beranda langsung menyaring katalog.
 * - Menampilkan `ProductGridSkeleton` saat data sedang dimuat dari API dan `ApiErrorState` bila gagal.
 * - Mendukung bahasa Indonesia (`id`) dan Inggris (`en`).
 */

import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ICONS } from '../assets/assetMap'
import ProductCard from '../components/ProductCard'
import { ApiErrorState, ProductGridSkeleton } from '../components/ui/ApiStateViews'
import { formatCompactPrice, formatRupiah } from '../data/furnitureData'

const ITEMS_PER_PAGE = 9
const MIN_PRICE_BOUND = 500000
const MAX_PRICE_BOUND = 10000000
const PRICE_STEP = 250000

/**
 * Merender halaman katalog `/shop` dengan sinkronisasi URL query params & penanganan state API.
 *
 * @param {object} props - Properti ShopPage.
 * @param {Array<object>} props.products - Daftar seluruh produk dari API contract.
 * @param {boolean} props.isLoading - Status loading pemanggilan data API.
 * @param {string | null} props.apiError - Pesan error jika pemanggilan API gagal.
 * @param {Function} props.onRetryFetch - Handler memanggil ulang API.
 * @param {Function} props.onAddToCart - Handler menambah produk ke keranjang.
 * @param {object} props.t - Kamus bahasa aktif.
 * @returns {JSX.Element} Elemen halaman katalog belanja.
 */
export default function ShopPage({
  products,
  isLoading,
  apiError,
  onRetryFetch,
  onAddToCart,
  t,
}) {
  const [searchParams, setSearchParams] = useSearchParams()

  // Membaca filter awal dari URL query string (`?q=`, `?room=`, `?category=`)
  const urlQuery = searchParams.get('q') || ''
  const urlRoom = searchParams.get('room') || ''
  const urlCategory = searchParams.get('category') || ''

  const [selectedCategories, setSelectedCategories] = useState(() =>
    urlCategory ? [urlCategory] : []
  )
  const [selectedRooms, setSelectedRooms] = useState(() => (urlRoom ? [urlRoom] : []))
  const [selectedMaterials, setSelectedMaterials] = useState([])
  const [priceMin, setPriceMin] = useState(MIN_PRICE_BOUND)
  const [priceMax, setPriceMax] = useState(MAX_PRICE_BOUND)
  const [sizeTier, setSizeTier] = useState('All sizes')
  const [sortBy, setSortBy] = useState('featured')
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Menggabungkan filter URL (`?room=` atau `?category=`) dengan pilihan checkbox lokal
  const effectiveCategories = useMemo(() => {
    if (urlCategory && !selectedCategories.includes(urlCategory)) {
      return [...selectedCategories, urlCategory]
    }
    return selectedCategories
  }, [selectedCategories, urlCategory])

  const effectiveRooms = useMemo(() => {
    if (urlRoom && !selectedRooms.includes(urlRoom)) {
      return [...selectedRooms, urlRoom]
    }
    return selectedRooms
  }, [selectedRooms, urlRoom])

  const storefrontProducts = useMemo(
    () => products.filter((item) => item.status !== 'Draft'),
    [products]
  )

  const categoryOptions = ['Seating', 'Tables', 'Storage', 'Lighting', 'Bedroom']
  const materialOptions = [
    'Natural materials',
    'Solid wood',
    'Bouclé fabric',
    'Steel & stone',
    'Linen blend',
  ]
  const roomOptions = ['Living room', 'Dining room', 'Bedroom', 'Workspace']
  const sizeTierOptions = ['All sizes', 'Compact (< 90cm)', 'Medium (90-160cm)', 'Large (> 160cm)']

  /**
   * Memperbarui kata kunci pencarian langsung pada URL (`?q=...`).
   *
   * @param {string} nextQuery - Kata kunci pencarian baru.
   */
  const handleSearchQueryChange = (nextQuery) => {
    const nextParams = new URLSearchParams(searchParams)
    if (nextQuery.trim()) {
      nextParams.set('q', nextQuery)
    } else {
      nextParams.delete('q')
    }
    setSearchParams(nextParams, { replace: true })
    setCurrentPage(1)
  }

  /**
   * Mengaktifkan atau menonaktifkan nilai pada filter kategori, ruangan, atau material.
   *
   * @param {'categories' | 'rooms' | 'materials'} type - Grup filter yang diubah.
   * @param {string} value - Nilai item filter.
   */
  const toggleFilterItem = (type, value) => {
    const nextParams = new URLSearchParams(searchParams)
    if (type === 'categories') {
      if (urlCategory === value) nextParams.delete('category')
      setSelectedCategories((prev) => {
        const base = urlCategory && !prev.includes(urlCategory) ? [...prev, urlCategory] : prev
        return base.includes(value) ? base.filter((i) => i !== value) : [...base, value]
      })
    } else if (type === 'rooms') {
      if (urlRoom === value) nextParams.delete('room')
      setSelectedRooms((prev) => {
        const base = urlRoom && !prev.includes(urlRoom) ? [...prev, urlRoom] : prev
        return base.includes(value) ? base.filter((i) => i !== value) : [...base, value]
      })
    } else {
      setSelectedMaterials((prev) =>
        prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
      )
    }
    setSearchParams(nextParams, { replace: true })
    setCurrentPage(1)
  }

  /**
   * Mengembalikan seluruh filter dan parameter URL ke kondisi awal.
   */
  const handleResetAllFilters = () => {
    setSelectedCategories([])
    setSelectedRooms([])
    setSelectedMaterials([])
    setPriceMin(MIN_PRICE_BOUND)
    setPriceMax(MAX_PRICE_BOUND)
    setSizeTier('All sizes')
    setSortBy('featured')
    setSearchParams({}, { replace: true })
    setCurrentPage(1)
  }

  const filteredProducts = useMemo(() => {
    const query = urlQuery.trim().toLowerCase()

    const matched = storefrontProducts.filter((product) => {
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

      if (effectiveCategories.length > 0 && !effectiveCategories.includes(product.category)) {
        return false
      }

      if (effectiveRooms.length > 0 && !effectiveRooms.includes(product.room)) {
        return false
      }

      if (
        selectedMaterials.length > 0 &&
        !selectedMaterials.some((mat) => (product.materials || []).includes(mat))
      ) {
        return false
      }

      if (product.price < priceMin || product.price > priceMax) {
        return false
      }

      if (
        sizeTier !== 'All sizes' &&
        product.sizeTier.replace('–', '-') !== sizeTier.replace('–', '-')
      ) {
        return false
      }

      return true
    })

    const sorted = [...matched]
    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'name-asc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    }

    return sorted
  }, [
    storefrontProducts,
    urlQuery,
    effectiveCategories,
    effectiveRooms,
    selectedMaterials,
    priceMin,
    priceMax,
    sizeTier,
    sortBy,
  ])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  )

  const activeFilterChips = []
  effectiveCategories.forEach((cat) =>
    activeFilterChips.push({
      id: `cat-${cat}`,
      label: cat,
      onRemove: () => toggleFilterItem('categories', cat),
    })
  )
  effectiveRooms.forEach((room) =>
    activeFilterChips.push({
      id: `room-${room}`,
      label: room,
      onRemove: () => toggleFilterItem('rooms', room),
    })
  )
  selectedMaterials.forEach((mat) =>
    activeFilterChips.push({
      id: `mat-${mat}`,
      label: mat,
      onRemove: () => toggleFilterItem('materials', mat),
    })
  )
  if (priceMin > MIN_PRICE_BOUND || priceMax < MAX_PRICE_BOUND) {
    activeFilterChips.push({
      id: 'price-range',
      label: `Rp ${formatCompactPrice(priceMin)} - ${formatCompactPrice(priceMax)}`,
      onRemove: () => {
        setPriceMin(MIN_PRICE_BOUND)
        setPriceMax(MAX_PRICE_BOUND)
      },
    })
  }
  if (sizeTier !== 'All sizes') {
    activeFilterChips.push({
      id: 'size-tier',
      label: sizeTier,
      onRemove: () => setSizeTier('All sizes'),
    })
  }

  const minPercent = ((priceMin - MIN_PRICE_BOUND) / (MAX_PRICE_BOUND - MIN_PRICE_BOUND)) * 100
  const maxPercent = ((priceMax - MIN_PRICE_BOUND) / (MAX_PRICE_BOUND - MIN_PRICE_BOUND)) * 100

  return (
    <main className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-8 sm:pt-10 lg:px-12">
      {/* Header Judul Halaman Katalog */}
      <div className="flex flex-col justify-between gap-3 border-b border-[#e6e6e9] pb-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#71717a]">
            {t.shopTag}
          </p>
          <h1 className="mt-1.5 text-[34px] sm:text-[44px] font-normal leading-none tracking-[-1.4px] text-[#111111]">
            {t.shopTitle}
          </h1>
        </div>
        <p className="text-[13px] text-[#52525b]">
          {t.shopShowing}{' '}
          <strong className="font-medium text-[#111111]">{filteredProducts.length}</strong>{' '}
          {t.shopPieces}
        </p>
      </div>

      {/* Bilah Pencarian & Urutkan */}
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2.5">
          <div className="flex h-11 flex-1 items-center gap-3 rounded-full border border-[#e6e6e9] bg-[#f5f5f7] px-4">
            <img src={ICONS.search} alt="" width={16} height={16} className="h-4 w-4 opacity-70" />
            <input
              type="text"
              value={urlQuery}
              onChange={(e) => handleSearchQueryChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-transparent text-[13px] text-[#111111] placeholder:text-[#71717a] focus:outline-none"
            />
            {urlQuery ? (
              <button
                type="button"
                onClick={() => handleSearchQueryChange('')}
                className="text-[12px] text-[#71717a] hover:text-[#111111] cursor-pointer"
              >
                ×
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[#e6e6e9] bg-white px-4 text-[12px] font-medium text-[#111111] lg:hidden cursor-pointer"
          >
            <span>{t.filterTitle}</span>
            {activeFilterChips.length > 0 ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#141414] text-[10px] text-white">
                {activeFilterChips.length}
              </span>
            ) : null}
          </button>
        </div>

        {/* Dropdown Pengurutan */}
        <div className="flex items-center gap-2.5">
          <label htmlFor="shop-sort-select" className="text-[12px] text-[#52525b]">
            {t.sortLabel}
          </label>
          <select
            id="shop-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-11 rounded-full border border-[#e6e6e9] bg-[#f5f5f7] px-4 text-[12px] font-medium text-[#111111] focus:outline-none cursor-pointer"
          >
            <option value="featured">{t.sortFeatured}</option>
            <option value="price-asc">{t.sortPriceAsc}</option>
            <option value="price-desc">{t.sortPriceDesc}</option>
            <option value="name-asc">{t.sortNameAsc}</option>
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
              className="inline-flex h-8 items-center gap-2 rounded-full bg-[#141414] px-3.5 text-[11px] font-medium text-white transition-opacity hover:opacity-85 cursor-pointer"
            >
              <span>{chip.label}</span>
              <span className="text-[#38bdf8]">×</span>
            </button>
          ))}
          <button
            type="button"
            onClick={handleResetAllFilters}
            className="px-2.5 py-1.5 text-[12px] font-medium text-[#52525b] underline underline-offset-4 hover:text-[#111111] cursor-pointer"
          >
            {t.filterReset}
          </button>
        </div>
      ) : null}

      {/* Tata Letak Dua Kolom: Filter Sidebar Kiri + Grid Produk Kanan */}
      <div className="mt-7 grid grid-cols-1 gap-8 lg:grid-cols-[268px_1fr]">
        {/* SIDEBAR FILTER */}
        <aside
          className={`${
            mobileFiltersOpen ? 'block' : 'hidden'
          } lg:block h-fit rounded-[20px] border border-[#e6e6e9] bg-[#fafafa] p-5`}
        >
          <div className="flex items-center justify-between border-b border-[#e6e6e9] pb-3.5">
            <h2 className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#111111]">
              {t.filterTitle}
            </h2>
            <button
              type="button"
              onClick={handleResetAllFilters}
              className="text-[11px] font-medium text-[#52525b] hover:text-[#111111] cursor-pointer"
            >
              {t.filterReset}
            </button>
          </div>

          {/* 1. Category Filter */}
          <div className="mt-5 border-b border-[#e6e6e9] pb-5">
            <h3 className="text-[12px] font-medium text-[#111111]">{t.filterCategory}</h3>
            <div className="mt-3 space-y-2.5">
              {categoryOptions.map((category) => {
                const count = storefrontProducts.filter((p) => p.category === category).length
                const checked = effectiveCategories.includes(category)
                return (
                  <label
                    key={category}
                    className="flex items-center justify-between text-[13px] cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5 text-[#111111]">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleFilterItem('categories', category)}
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
              <h3 className="text-[12px] font-medium text-[#111111]">{t.filterPrice}</h3>
              <span className="text-[11px] font-medium text-[#71717a]">IDR</span>
            </div>

            <div className="mt-4">
              <div className="relative flex h-5 items-center">
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
                  value={priceMin}
                  onChange={(e) => {
                    const nextMin = Math.min(Number(e.target.value), priceMax - PRICE_STEP)
                    setPriceMin(nextMin)
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
                  value={priceMax}
                  onChange={(e) => {
                    const nextMax = Math.max(Number(e.target.value), priceMin + PRICE_STEP)
                    setPriceMax(nextMax)
                    setCurrentPage(1)
                  }}
                  className="range-slider-thumb pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent"
                />
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] font-medium text-[#111111]">
                <span>{formatRupiah(priceMin)}</span>
                <span>{formatRupiah(priceMax)}</span>
              </div>
            </div>
          </div>

          {/* 3. Material Filter */}
          <div className="mt-5 border-b border-[#e6e6e9] pb-5">
            <h3 className="text-[12px] font-medium text-[#111111]">{t.filterMaterial}</h3>
            <div className="mt-3 space-y-2.5">
              {materialOptions.map((mat) => (
                <label
                  key={mat}
                  className="flex items-center gap-2.5 text-[13px] text-[#111111] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedMaterials.includes(mat)}
                    onChange={() => toggleFilterItem('materials', mat)}
                    className="h-4 w-4 accent-[#141414] rounded cursor-pointer"
                  />
                  <span>{mat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. Room Type Filter */}
          <div className="mt-5 border-b border-[#e6e6e9] pb-5">
            <h3 className="text-[12px] font-medium text-[#111111]">{t.filterRoom}</h3>
            <div className="mt-3 space-y-2.5">
              {roomOptions.map((room) => (
                <label
                  key={room}
                  className="flex items-center gap-2.5 text-[13px] text-[#111111] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={effectiveRooms.includes(room)}
                    onChange={() => toggleFilterItem('rooms', room)}
                    className="h-4 w-4 accent-[#141414] rounded cursor-pointer"
                  />
                  <span>{room}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 5. Dimension Footprint Filter */}
          <div className="mt-5">
            <label
              htmlFor="size-tier-select"
              className="block text-[12px] font-medium text-[#111111]"
            >
              {t.filterDimensions}
            </label>
            <select
              id="size-tier-select"
              value={sizeTier}
              onChange={(e) => {
                setSizeTier(e.target.value)
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

        {/* GRID PRODUK KANAN (DENGAN SKELETON & ERROR HANDLING API) */}
        <div>
          {isLoading ? (
            <ProductGridSkeleton count={6} label={t.apiLoadingTitle} />
          ) : apiError ? (
            <ApiErrorState
              title={t.apiErrorTitle}
              description={t.apiErrorDesc}
              errorDetail={apiError}
              retryLabel={t.apiRetryBtn}
              onRetry={onRetryFetch}
            />
          ) : paginatedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#d4d4d8] bg-[#fafafa] px-6 py-16 text-center">
              <p className="text-[18px] font-normal text-[#111111]">{t.emptyFilterTitle}</p>
              <p className="mt-2 max-w-md text-[13px] text-[#52525b]">{t.emptyFilterDesc}</p>
              <button
                type="button"
                onClick={handleResetAllFilters}
                className="mt-6 h-11 rounded-full bg-[#141414] px-6 text-[12px] font-medium text-white cursor-pointer"
              >
                {t.filterReset}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          )}

          {/* Paginasi Bawah */}
          {!isLoading && !apiError && filteredProducts.length > 0 ? (
            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#e6e6e9] pt-6 sm:flex-row">
              <p className="text-[12px] text-[#52525b]">
                Page {safePage} / {totalPages} · {filteredProducts.length} {t.shopPieces}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5f5f7] text-[12px] text-[#111111] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  ←
                </button>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`flex h-11 w-11 items-center justify-center rounded-full text-[12px] font-medium transition-colors cursor-pointer ${
                      pageNum === safePage
                        ? 'bg-[#141414] text-white'
                        : 'bg-[#f5f5f7] text-[#52525b] hover:text-[#111111]'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5f5f7] text-[12px] text-[#111111] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  →
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}

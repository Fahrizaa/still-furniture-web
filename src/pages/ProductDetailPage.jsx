/**
 * @fileoverview Halaman Detail Produk (`03 — Product / Forma lounge chair`).
 *
 * Menerjemahkan tampilan Figma Screen 03 dengan komponen interaktif penuh:
 * - Breadcrumb navigasi (`Home / Shop furniture / Category / Product`).
 * - Galeri multi-sudut pandang dengan pemilih thumbnail dan tombol wishlist (`♡` / `♥`).
 * - Tabel dimensi (`WIDTH / DEPTH / HEIGHT`) plus tombol `How it fits in your space` (membuka `08 ScaleModal`).
 * - Swatch pilihan material finishing, pemilih jumlah stok (`− / +`), `Buy Now`, `Add to Cart`,
 *   dan `Ask Admin About This Product` (membuka `07 ConciergeDrawer`).
 * - Rincian `The details that matter.` & rekomendasi produk sejenis di bagian bawah.
 */

import { useState } from 'react'
import ProductCard from '../components/ProductCard'
import { ActionPillButton, BadgeChip } from '../components/ui/Buttons'
import { formatRupiah, getStockMeta } from '../data/furnitureData'

/**
 * Merender halaman detail lengkap untuk satu unit furnitur.
 * Catatan: parent menyematkan `key={product.id}` agar state galeri & finish otomatis reset saat pindah produk.
 *
 * @param {object} props - Properti ProductDetailPage.
 * @param {object} props.product - Objek lengkap produk yang sedang dilihat.
 * @param {Array<object>} props.relatedProducts - Daftar 3 produk terkait untuk bagian bawah halaman.
 * @param {Function} props.onNavigate - Handler navigasi halaman (`home`, `shop`, `checkout`).
 * @param {Function} props.onSelectProduct - Handler memilih produk lain dari bagian rekomendasi.
 * @param {Function} props.onAddToCart - Handler menambah produk ke tas belanja (`(product, qty, finishName) => void`).
 * @param {Function} props.onOpenScale - Handler membuka modal `08 Scale & Proportions`.
 * @param {Function} props.onOpenConcierge - Handler membuka drawer `07 STILL Concierge`.
 * @returns {JSX.Element} Elemen halaman detail produk.
 */
export default function ProductDetailPage({
  product,
  relatedProducts,
  onNavigate,
  onSelectProduct,
  onAddToCart,
  onOpenScale,
  onOpenConcierge,
}) {
  const gallery = product.gallery?.length
    ? product.gallery
    : [{ id: 'default', label: product.name, src: product.image }]
  const finishes = product.finishes?.length
    ? product.finishes
    : [{ id: 'standard', name: 'Natural finish', swatch: '#8c6239', accent: '#dfd9ce' }]

  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [selectedFinishIdx, setSelectedFinishIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
  const [addedBanner, setAddedBanner] = useState(false)

  const activeImage = gallery[activeImageIdx] || gallery[0]
  const selectedFinish = finishes[selectedFinishIdx] || finishes[0]
  const stockMeta = getStockMeta(product.stock)
  const isOutOfStock = product.stock <= 0

  /**
   * Menambahkan item pilihan ke tas belanja lalu memunculkan umpan balik visual singkat.
   */
  const handleAddToBag = () => {
    if (isOutOfStock) return
    onAddToCart(product, qty, selectedFinish.name)
    setAddedBanner(true)
    setTimeout(() => setAddedBanner(false), 1800)
  }

  /**
   * Menambahkan item pilihan ke tas belanja dan langsung membawa pengguna ke halaman Checkout (`04/09`).
   */
  const handleBuyNow = () => {
    if (isOutOfStock) return
    onAddToCart(product, qty, selectedFinish.name)
    onNavigate('checkout')
  }

  return (
    <main className="mx-auto max-w-[1440px] px-5 pt-6 sm:px-8 sm:pt-8 lg:px-12">
      {/* Breadcrumb Navigasi */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[12px] text-[#71717a]">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="hover:text-[#111111] cursor-pointer"
        >
          Home
        </button>
        <span>/</span>
        <button
          type="button"
          onClick={() => onNavigate('shop', { clearFilters: true })}
          className="hover:text-[#111111] cursor-pointer"
        >
          Shop furniture
        </button>
        <span>/</span>
        <button
          type="button"
          onClick={() => onNavigate('shop', { categories: [product.category] })}
          className="hover:text-[#111111] cursor-pointer"
        >
          {product.category}
        </button>
        <span>/</span>
        <span className="font-medium text-[#111111]">{product.name}</span>
      </nav>

      {/* TATA LETAK UTAMA 2 KOLOM: GALERI FOTO + INFO & KONTROL */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        {/* KOLOM KIRI: Galeri Foto Produk */}
        <div className="lg:col-span-7">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] bg-[#f5f5f7]">
            <img
              src={activeImage.src}
              alt={`${product.name} — ${activeImage.label}`}
              className="h-full w-full object-cover"
            />

            {/* Badge Koleksi & Tombol Wishlist Mengambang */}
            <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-2">
              <span className="rounded-full bg-white/90 px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#111111] backdrop-blur-sm">
                {product.collectionTag || 'STILL COLLECTION'}
              </span>
              <button
                type="button"
                onClick={() => setWishlisted((prev) => !prev)}
                aria-label="Toggle wishlist"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[16px] text-[#111111] shadow-xs backdrop-blur-sm transition-transform hover:scale-105 cursor-pointer"
              >
                {wishlisted ? '♥' : '♡'}
              </button>
            </div>
          </div>

          {/* Thumbnail Strip 4 Sudut Pandang */}
          <div className="mt-3.5 grid grid-cols-4 gap-3">
            {gallery.map((item, idx) => {
              const isSelected = idx === activeImageIdx
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`group overflow-hidden rounded-[14px] border-2 bg-[#f5f5f7] transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#141414]'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={item.src}
                    alt={item.label}
                    className="aspect-square w-full object-cover"
                  />
                </button>
              )
            })}
          </div>
        </div>

        {/* KOLOM KANAN: Detail Harga, Dimensi, Finish, Aksi */}
        <div className="flex flex-col justify-between lg:col-span-5">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[12px] text-[#111111]">
                <span className="text-[#8c6239]">★</span>
                <span className="font-medium">{product.rating?.toFixed(1) || '4.9'}</span>
                <span className="text-[#71717a]">({product.reviewsCount || 48} reviews)</span>
              </div>
              <BadgeChip tone={stockMeta.tone}>
                {isOutOfStock ? 'Out of stock' : `${stockMeta.label} · ${product.stock} left`}
              </BadgeChip>
            </div>

            <h1 className="mt-3 text-[32px] sm:text-[40px] font-normal leading-[1.08] tracking-[-1.2px] text-[#111111]">
              {product.name}
            </h1>

            <p className="mt-3 text-[24px] font-normal tracking-[-0.4px] text-[#111111]">
              {formatRupiah(product.price)}
            </p>

            <p className="mt-4 text-[14px] leading-[1.65] text-[#71717a]">{product.summary}</p>

            {/* Kartu Dimensi + Pemicu Modal Skala (08 ScaleModal) */}
            <div className="mt-6 rounded-[18px] border border-[#e6e6e9] bg-[#fafafa] p-4">
              <div className="grid grid-cols-3 gap-3 border-b border-[#e6e6e9] pb-3.5 text-center sm:text-left">
                <div>
                  <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-[#71717a]">
                    WIDTH
                  </p>
                  <p className="mt-1 text-[15px] font-medium text-[#111111]">
                    {product.dimensions?.width || 72} cm
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-[#71717a]">
                    DEPTH
                  </p>
                  <p className="mt-1 text-[15px] font-medium text-[#111111]">
                    {product.dimensions?.depth || 78} cm
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-[#71717a]">
                    HEIGHT
                  </p>
                  <p className="mt-1 text-[15px] font-medium text-[#111111]">
                    {product.dimensions?.height || 76} cm
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenScale(product)}
                className="mt-3 flex w-full items-center justify-between text-[12px] font-medium text-[#111111] hover:text-[#8c6239] transition-colors cursor-pointer"
              >
                <span>How it fits in your space (170cm & 3×3m room guide)</span>
                <span>↗</span>
              </button>
            </div>

            {/* Pemilih Material Finishing (Swatches) */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-medium uppercase tracking-[0.08em] text-[#71717a]">
                  MATERIAL FINISH
                </span>
                <span className="font-medium text-[#111111]">{selectedFinish.name}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2.5">
                {finishes.map((finish, idx) => {
                  const isSelected = idx === selectedFinishIdx
                  return (
                    <button
                      key={finish.id}
                      type="button"
                      onClick={() => setSelectedFinishIdx(idx)}
                      className={`flex items-center gap-2.5 rounded-full border px-3.5 py-2 text-[12px] transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#141414] bg-[#f5f5f7] font-medium text-[#111111]'
                          : 'border-[#e6e6e9] bg-white text-[#71717a] hover:border-[#b4b4bc]'
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-black/15"
                        style={{ backgroundColor: finish.swatch }}
                      />
                      <span>{finish.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Kontrol Kuantitas & Tombol Beli */}
            <div className="mt-7 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Stepper Jumlah Unit */}
                <div className="inline-flex h-[48px] items-center gap-5 rounded-full border border-[#e6e6e9] bg-[#f5f5f7] px-5 text-[14px]">
                  <button
                    type="button"
                    onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                    className="text-[#111111] hover:opacity-60 cursor-pointer"
                    aria-label="Kurangi kuantitas"
                  >
                    −
                  </button>
                  <span className="min-w-[20px] text-center font-medium text-[#111111]">{qty}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setQty((prev) => Math.min(Math.max(1, product.stock), prev + 1))
                    }
                    className="text-[#111111] hover:opacity-60 cursor-pointer"
                    aria-label="Tambah kuantitas"
                  >
                    +
                  </button>
                </div>

                <ActionPillButton
                  label={isOutOfStock ? 'Out of stock' : 'Buy Now'}
                  variant="dark"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className="flex-1"
                />

                <ActionPillButton
                  label={addedBanner ? 'Added to Bag ✓' : 'Add to Cart'}
                  variant="light"
                  icon="none"
                  disabled={isOutOfStock}
                  onClick={handleAddToBag}
                  className="w-full sm:w-auto"
                />
              </div>

              {/* Tombol Tanya Admin (07 STILL ConciergeDrawer) */}
              <button
                type="button"
                onClick={() => onOpenConcierge(product)}
                className="flex h-[48px] w-full items-center justify-between rounded-full border border-[#e8e5df] bg-[#faf9f6] px-5 text-[13px] font-medium text-[#1a1a1a] transition-colors hover:bg-[#f5f3ef] cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-[#2e7d32]" />
                  <span>Ask Admin About This Product</span>
                </span>
                <span className="text-[11px] text-[#8c6239]">STILL Concierge ↗</span>
              </button>
            </div>
          </div>

          <p className="mt-6 text-[11px] leading-[1.5] text-[#71717a]">
            SKU {product.sku} · 3-year joinery warranty · Free insured Jabodetabek shipping on orders above Rp 5.000.000.
          </p>
        </div>
      </div>

      {/* BAGIAN SPESIFIKASI ("The details that matter.") */}
      <section className="mt-20 rounded-[24px] bg-[#f5f5f7] p-6 sm:p-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#71717a]">
              CRAFTSMANSHIP & SPECS
            </p>
            <h2 className="mt-2 text-[28px] sm:text-[34px] font-normal leading-[1.1] tracking-[-1px] text-[#111111]">
              The details that matter.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-8">
            {(product.specs || []).map((spec) => (
              <div key={spec.label} className="border-t border-[#d8d8de] pt-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#71717a]">
                  {spec.label}
                </p>
                <p className="mt-2 text-[14px] leading-[1.55] text-[#111111]">{spec.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BAGIAN PRODUK TERKAIT */}
      {relatedProducts.length > 0 ? (
        <section className="mt-20">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[24px] sm:text-[30px] font-normal tracking-[-0.8px] text-[#111111]">
              Pair cleanly with
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('shop', { clearFilters: true })}
              className="text-[12px] font-medium text-[#111111] underline underline-offset-4 cursor-pointer"
            >
              View full catalog →
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}

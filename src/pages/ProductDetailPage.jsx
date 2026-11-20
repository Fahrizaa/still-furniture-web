/**
 * @fileoverview Halaman Detail Produk Dinamis (`/product/:id`).
 *
 * Fitur yang diterapkan:
 * - Membaca parameter `:id` langsung dari URL melalui `useParams()` React Router.
 * - Menampilkan `ProductDetailSkeleton` saat data sedang dimuat dari API,
 *   `ApiErrorState` bila gagal, dan tampilan 404 Product Not Found jika ID tidak valid.
 * - Mendukung Bahasa Indonesia (`id`) dan Inggris (`en`).
 */

import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { ApiErrorState, ProductDetailSkeleton } from '../components/ui/ApiStateViews'
import { ActionPillButton, BadgeChip } from '../components/ui/Buttons'
import { formatRupiah, getStockMeta } from '../data/furnitureData'

/**
 * Komponen internal konten detail produk yang di-reset otomatis melalui `key={product.id}`.
 *
 * @param {object} props - Properti ProductDetailView.
 * @param {object} props.product - Objek produk yang ditemukan.
 * @param {Array<object>} props.relatedProducts - Daftar produk terkait.
 * @param {Function} props.onAddToCart - Handler tambah ke keranjang.
 * @param {Function} props.onOpenScale - Handler buka modal Scale & Proportions.
 * @param {Function} props.onOpenConcierge - Handler buka drawer STILL Concierge.
 * @param {object} props.t - Kamus bahasa aktif.
 * @returns {JSX.Element} Konten detail produk.
 */
function ProductDetailView({
  product,
  relatedProducts,
  onAddToCart,
  onOpenScale,
  onOpenConcierge,
  t,
}) {
  const navigate = useNavigate()

  const finishes =
    product.finishes?.length >= 2
      ? product.finishes.slice(0, 2)
      : [
          {
            id: 'natural',
            name: 'Natural Walnut',
            swatch: '#8c6239',
            image: product.image,
            gallery: product.gallery,
          },
          {
            id: 'black-ash',
            name: 'Black Ash',
            swatch: '#232325',
            image: product.image,
            gallery: product.gallery,
          },
        ]

  const [selectedFinishIdx, setSelectedFinishIdx] = useState(0)
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
  const [addedBanner, setAddedBanner] = useState(false)

  const selectedFinish = finishes[selectedFinishIdx] || finishes[0]
  const gallery = selectedFinish.gallery?.length
    ? selectedFinish.gallery
    : product.gallery?.length
      ? product.gallery
      : [{ id: 'default', label: product.name, src: selectedFinish.image || product.image }]

  const activeImage = gallery[activeImageIdx] || gallery[0]
  const stockMeta = getStockMeta(product.stock)
  const isOutOfStock = product.stock <= 0

  /**
   * Menambahkan item beserta gambar warna terpilih ke tas belanja.
   */
  const handleAddToBag = () => {
    if (isOutOfStock) return
    onAddToCart(
      { ...product, image: selectedFinish.image || activeImage.src },
      qty,
      selectedFinish.name
    )
    setAddedBanner(true)
    setTimeout(() => setAddedBanner(false), 1800)
  }

  /**
   * Menambahkan item beserta gambar warna terpilih ke tas belanja lalu menuju `/checkout`.
   */
  const handleBuyNow = () => {
    if (isOutOfStock) return
    onAddToCart(
      { ...product, image: selectedFinish.image || activeImage.src },
      qty,
      selectedFinish.name
    )
    navigate('/checkout')
  }

  return (
    <main className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-8 sm:pt-8 lg:px-12">
      {/* Breadcrumb Navigasi Berbasis Route */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-[12px] text-[#52525b]"
      >
        <Link to="/" className="hover:text-[#111111]">
          {t.navHome}
        </Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-[#111111]">
          {t.navShop}
        </Link>
        <span>/</span>
        <Link
          to={`/shop?category=${encodeURIComponent(product.category)}`}
          className="hover:text-[#111111]"
        >
          {product.category}
        </Link>
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
              alt={`${product.name} - ${activeImage.label}`}
              width={960}
              height={720}
              className="h-full w-full object-cover"
            />

            <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-2">
              <span className="rounded-full bg-white/95 px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-[#111111]">
                {product.collectionTag || 'STILL COLLECTION'}
              </span>
              <button
                type="button"
                onClick={() => setWishlisted((prev) => !prev)}
                aria-label="Toggle wishlist"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[16px] text-[#111111] shadow-xs transition-transform hover:scale-105 cursor-pointer"
              >
                {wishlisted ? '♥' : '♡'}
              </button>
            </div>
          </div>

          <div className="mt-3.5 grid grid-cols-4 gap-3">
            {gallery.map((item, idx) => {
              const isSelected = idx === activeImageIdx
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`overflow-hidden rounded-[14px] border-2 bg-[#f5f5f7] transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#141414]'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={item.src}
                    alt={item.label}
                    width={240}
                    height={240}
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
              <span className="text-[12px] font-medium text-[#52525b]">
                SKU {product.sku} · {product.room}
              </span>
              <BadgeChip tone={stockMeta.tone}>
                {isOutOfStock ? 'Out of stock' : `${stockMeta.label} · ${product.stock} unit`}
              </BadgeChip>
            </div>

            <h1 className="mt-3 text-[32px] sm:text-[40px] font-normal leading-[1.08] tracking-[-1.2px] text-[#111111]">
              {product.name}
            </h1>

            <p className="mt-3 text-[24px] font-medium tracking-[-0.4px] text-[#111111]">
              {formatRupiah(product.price)}
            </p>

            <p className="mt-4 text-[14px] leading-[1.65] text-[#52525b]">{product.summary}</p>

            {/* Kartu Dimensi + Pemicu Modal Skala */}
            <div className="mt-6 rounded-[18px] border border-[#e6e6e9] bg-[#fafafa] p-4">
              <div className="grid grid-cols-3 gap-3 border-b border-[#e6e6e9] pb-3.5 text-center sm:text-left">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#71717a]">
                    WIDTH
                  </p>
                  <p className="mt-1 text-[15px] font-medium text-[#111111]">
                    {product.dimensions?.width || 72} cm
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#71717a]">
                    DEPTH
                  </p>
                  <p className="mt-1 text-[15px] font-medium text-[#111111]">
                    {product.dimensions?.depth || 78} cm
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#71717a]">
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
                className="mt-3 flex min-h-[36px] w-full items-center justify-between text-left text-[12px] font-medium text-[#111111] transition-colors hover:text-[#8c6239] cursor-pointer"
              >
                <span>{t.detailScaleBtn}</span>
                <span>↗</span>
              </button>
            </div>

            {/* Pemilih Material Finishing */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-medium uppercase tracking-[0.08em] text-[#52525b]">
                  {t.detailMaterialFinish}
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
                      className={`flex min-h-[42px] items-center gap-2.5 rounded-full border px-3.5 py-2 text-[12px] transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#141414] bg-[#f5f5f7] font-medium text-[#111111]'
                          : 'border-[#e6e6e9] bg-white text-[#52525b] hover:border-[#b4b4bc]'
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
                <div className="inline-flex h-[48px] items-center gap-4 rounded-full border border-[#e6e6e9] bg-[#f5f5f7] px-4 text-[14px]">
                  <button
                    type="button"
                    onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                    className="flex h-8 w-8 items-center justify-center text-[#111111] hover:opacity-60 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="min-w-[20px] text-center font-medium text-[#111111]">{qty}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setQty((prev) => Math.min(Math.max(1, product.stock), prev + 1))
                    }
                    className="flex h-8 w-8 items-center justify-center text-[#111111] hover:opacity-60 cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <ActionPillButton
                  label={isOutOfStock ? 'Out of stock' : t.detailBuyNow}
                  variant="dark"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className="flex-1"
                />

                <ActionPillButton
                  label={addedBanner ? `${t.detailAdded} ✓` : t.detailAddToCart}
                  variant="light"
                  icon="none"
                  disabled={isOutOfStock}
                  onClick={handleAddToBag}
                  className="w-full sm:w-auto"
                />
              </div>

              <button
                type="button"
                onClick={() => onOpenConcierge(product)}
                className="flex h-[48px] w-full items-center justify-between rounded-full border border-[#e8e5df] bg-[#faf9f6] px-5 text-[13px] font-medium text-[#1a1a1a] transition-colors hover:bg-[#f5f3ef] cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-[#2e7d32]" />
                  <span>{t.detailAskAdmin}</span>
                </span>
                <span className="text-[11px] text-[#8c6239]">STILL Concierge ↗</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BAGIAN SPESIFIKASI */}
      <section className="mt-16 rounded-[24px] bg-[#f5f5f7] p-6 sm:p-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#71717a]">
              {t.detailSpecsTag}
            </p>
            <h2 className="mt-2 text-[26px] sm:text-[32px] font-normal leading-[1.1] tracking-[-1px] text-[#111111]">
              {t.detailSpecsTitle}
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
        <section className="mt-16">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[24px] sm:text-[28px] font-normal tracking-[-0.8px] text-[#111111]">
              {t.detailRelatedTitle}
            </h2>
            <Link
              to="/shop"
              className="text-[12px] font-medium text-[#111111] underline underline-offset-4"
            >
              {t.featuredViewAll} →
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}

/**
 * Wrapper komponen rute `/product/:id` yang menangani state loading API, error API,
 * dan resolusi produk berdasarkan parameter URL `:id`.
 *
 * @param {object} props - Properti ProductDetailPage.
 * @param {Array<object>} props.products - Daftar seluruh produk dari API contract.
 * @param {boolean} props.isLoading - Status loading API.
 * @param {string | null} props.apiError - Pesan error API.
 * @param {Function} props.onRetryFetch - Handler retry API.
 * @param {Function} props.onAddToCart - Handler tambah ke keranjang.
 * @param {Function} props.onOpenScale - Handler buka modal skala.
 * @param {Function} props.onOpenConcierge - Handler buka drawer concierge.
 * @param {object} props.t - Kamus bahasa aktif.
 * @returns {JSX.Element} Elemen halaman detail produk.
 */
export default function ProductDetailPage({
  products,
  isLoading,
  apiError,
  onRetryFetch,
  onAddToCart,
  onOpenScale,
  onOpenConcierge,
  t,
}) {
  const { id } = useParams()
  const navigate = useNavigate()

  if (isLoading) {
    return <ProductDetailSkeleton label={t.apiLoadingTitle} />
  }

  if (apiError) {
    return (
      <main className="mx-auto max-w-[1440px] px-4 pt-10 sm:px-8 lg:px-12">
        <ApiErrorState
          title={t.apiErrorTitle}
          description={t.apiErrorDesc}
          errorDetail={apiError}
          retryLabel={t.apiRetryBtn}
          onRetry={onRetryFetch}
        />
      </main>
    )
  }

  const product = products.find((p) => p.id === id)

  if (!product) {
    return (
      <main className="mx-auto max-w-[1440px] px-4 pt-14 sm:px-8 lg:px-12">
        <div className="rounded-[24px] border border-[#e6e6e9] bg-[#fafafa] p-10 text-center">
          <p className="font-mono text-[11px] uppercase text-[#71717a]">404 · /product/{id}</p>
          <h1 className="mt-2 text-[28px] font-normal text-[#111111]">{t.detailNotFoundTitle}</h1>
          <p className="mt-2 text-[14px] text-[#52525b]">{t.detailNotFoundDesc}</p>
          <ActionPillButton
            label={t.detailBackToShop}
            variant="dark"
            className="mt-6"
            onClick={() => navigate('/shop')}
          />
        </div>
      </main>
    )
  }

  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.status !== 'Draft' && p.stock > 0)
    .slice(0, 3)

  return (
    <ProductDetailView
      key={product.id}
      product={product}
      relatedProducts={relatedProducts}
      onAddToCart={onAddToCart}
      onOpenScale={onOpenScale}
      onOpenConcierge={onOpenConcierge}
      t={t}
    />
  )
}

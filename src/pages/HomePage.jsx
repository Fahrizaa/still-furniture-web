/**
 * @fileoverview Halaman Utama (`/`) Aplikasi Web STILL.
 *
 * Revisi UI/UX & Fitur yang diterapkan:
 * 1. Hero Section yang sinkron dan proporsional antara tipografi di sisi kiri dan foto ruang di sisi kanan.
 * 2. Menghapus elemen dekoratif/pengisi ruang kosong dan menggantinya dengan chip akses cepat kategori ke `/shop`.
 * 3. Menampilkan indikator `ProductGridSkeleton` saat data sedang di-fetch dari API,
 *    serta `ApiErrorState` jika pemanggilan API gagal.
 * 4. Mendukung penuh lokalisasi Bahasa Indonesia (`id`) dan Inggris (`en`).
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IMAGES } from '../assets/assetMap'
import ProductCard from '../components/ProductCard'
import { ApiErrorState, ProductGridSkeleton } from '../components/ui/ApiStateViews'
import { ActionPillButton } from '../components/ui/Buttons'
import { COLLECTION_STORIES } from '../data/furnitureData'

/**
 * Merender halaman beranda STILL yang terhubung dengan React Router dan simulasi API.
 *
 * @param {object} props - Properti HomePage.
 * @param {Array<object>} props.products - Daftar produk dari API contract.
 * @param {boolean} props.isLoading - Status loading pemanggilan data API.
 * @param {string | null} props.apiError - Pesan error jika pemanggilan API gagal.
 * @param {Function} props.onRetryFetch - Handler untuk memanggil ulang API.
 * @param {Function} props.onAddToCart - Handler menambah produk ke tas belanja.
 * @param {object} props.t - Kamus bahasa aktif (`id` atau `en`).
 * @returns {JSX.Element} Elemen halaman beranda.
 */
export default function HomePage({
  products,
  isLoading,
  apiError,
  onRetryFetch,
  onAddToCart,
  t,
}) {
  const [activeStoryId, setActiveStoryId] = useState(COLLECTION_STORIES[0].id)
  const navigate = useNavigate()

  const activeStory =
    COLLECTION_STORIES.find((story) => story.id === activeStoryId) || COLLECTION_STORIES[0]

  const featuredIds = [
    'forma-lounge-chair',
    'arc-coffee-table',
    'luma-modular-sofa',
    'linea-sideboard',
  ]
  const featuredProducts = featuredIds
    .map((id) => products.find((item) => item.id === id))
    .filter(Boolean)

  const quickCategories = ['Seating', 'Tables', 'Storage', 'Lighting', 'Bedroom']

  return (
    <main className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-8 sm:pt-10 lg:px-12">
      {/* BAGIAN 1: HERO SECTION MINIMALIS TANPA OUTLINE BOX */}
      <section aria-label="Hero" className="pt-2 sm:pt-4">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Kolom Kiri: Hirarki Tipografi Bersih Tanpa Outline Shape */}
          <div className="flex flex-col justify-between lg:col-span-5">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#71717a]">
                {t.heroTag}
              </p>
              <h1 className="mt-3 text-[38px] sm:text-[50px] xl:text-[58px] font-normal leading-[1.02] tracking-[-0.04em] text-[#111111]">
                <span className="block">{t.heroTitleLine1}</span>
                <span className="block">{t.heroTitleLine2}</span>
              </h1>
              <p className="mt-4 max-w-md text-[14px] sm:text-[15px] leading-[1.65] text-[#52525b]">
                {t.heroSubtitle}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-5">
                <ActionPillButton
                  label={t.heroPrimaryCta}
                  variant="dark"
                  onClick={() => navigate('/shop')}
                />
                <button
                  type="button"
                  onClick={() => navigate('/product/forma-lounge-chair')}
                  className="text-[13px] font-medium text-[#111111] underline underline-offset-4 transition-opacity hover:opacity-65 cursor-pointer"
                >
                  {t.heroSecondaryCta}
                </button>
              </div>
            </div>

            {/* Akses Cepat Kategori Minimalis Tanpa Outline Pills */}
            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 pt-2">
              {quickCategories.map((cat) => (
                <Link
                  key={cat}
                  to={`/shop?category=${encodeURIComponent(cat)}`}
                  className="text-[13px] font-normal text-[#71717a] transition-colors hover:text-[#111111]"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Kolom Kanan: Foto Ruang Tamu Arsitektural Bersih Tanpa Overlay Box */}
          <div className="lg:col-span-7">
            <div className="aspect-[16/10] w-full overflow-hidden rounded-[20px] bg-[#f5f5f7]">
              <img
                src={IMAGES.heroLivingRoom}
                alt="Ruang tamu arsitektural dengan sofa modular dan meja kayu solid STILL"
                width={1376}
                height={768}
                fetchPriority="high"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* BAGIAN 2: KATALOG UTAMA (DENGAN LOADING SKELETON & ERROR HANDLING API) */}
      <section className="mt-14 sm:mt-16">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#71717a]">
              {t.featuredTag}
            </p>
            <h2 className="mt-1.5 text-[26px] sm:text-[34px] font-normal tracking-[-1px] text-[#111111]">
              {t.featuredTitle}
            </h2>
          </div>

          <ActionPillButton
            label={t.featuredViewAll}
            variant="light"
            onClick={() => navigate('/shop')}
          />
        </div>

        <div className="mt-7">
          {isLoading ? (
            <ProductGridSkeleton count={4} label={t.apiLoadingTitle} />
          ) : apiError ? (
            <ApiErrorState
              title={t.apiErrorTitle}
              description={t.apiErrorDesc}
              errorDetail={apiError}
              retryLabel={t.apiRetryBtn}
              onRetry={onRetryFetch}
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* BAGIAN 3: KURASI RUANG INTERAKTIF */}
      <section className="mt-16">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#71717a]">
              {t.collectionsTag}
            </p>
            <h2 className="mt-1.5 text-[26px] sm:text-[34px] font-normal leading-[1.12] tracking-[-1px] text-[#111111]">
              {t.collectionsTitle}
            </h2>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* 3 Tab Cerita Ruangan */}
          <div className="flex flex-col gap-3.5 lg:col-span-5">
            {COLLECTION_STORIES.map((story) => {
              const isSelected = story.id === activeStory.id
              return (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => setActiveStoryId(story.id)}
                  className={`flex flex-col justify-between rounded-[18px] p-5 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#141414] text-white'
                      : 'border border-[#e6e6e9] bg-[#f5f5f7] text-[#111111] hover:bg-[#ececef]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className={`text-[11px] font-medium tracking-[0.08em] ${
                        isSelected ? 'text-[#38bdf8]' : 'text-[#71717a]'
                      }`}
                    >
                      {story.number} · {story.roomFilter.toUpperCase()}
                    </span>
                    <span className={isSelected ? 'text-[#38bdf8]' : 'text-[#71717a]'}>→</span>
                  </div>

                  <div className="mt-3">
                    <h3 className="text-[16px] font-medium leading-[1.3]">{story.title}</h3>
                    <p
                      className={`mt-1.5 text-[13px] leading-[1.55] ${
                        isSelected ? 'text-[#b4b4bc]' : 'text-[#52525b]'
                      }`}
                    >
                      {story.subtitle}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Pratinjau Foto Ruangan & Tombol Filter Langsung */}
          <div className="relative min-h-[320px] sm:min-h-[420px] overflow-hidden rounded-[20px] bg-[#ebe6de] lg:col-span-7">
            <img
              src={activeStory.image}
              alt={activeStory.tag}
              width={1376}
              height={768}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-end sm:p-8">
              <div className="text-white">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/80">
                  {activeStory.roomFilter}
                </p>
                <h3 className="mt-1.5 text-[24px] sm:text-[30px] font-normal tracking-[-0.8px]">
                  {activeStory.tag}
                </h3>
              </div>

              <ActionPillButton
                label={t.collectionsAction}
                variant="light"
                onClick={() =>
                  navigate(`/shop?room=${encodeURIComponent(activeStory.roomFilter)}`)
                }
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

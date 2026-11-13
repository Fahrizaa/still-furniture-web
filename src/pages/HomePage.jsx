/**
 * @fileoverview Halaman Utama (`01 — Home / Editorial living`) Aplikasi Web STILL.
 *
 * Menerjemahkan layout editorial dari Figma Screen 01 secara presisi:
 * 1. Hero Display Typography (`OBJECTS / FOR LIVING.`) yang menumpang (overlap) di atas foto ruang tamu arsitektural.
 * 2. Statistik editorial (`10K+ HAPPY HOMES`, `5K+ PIECES SOLD`, `15+ CATEGORIES`).
 * 3. Bagian narasi brand (`LESS, BUT BETTER LIVING.`).
 * 4. Bento Koleksi Interaktif (`COLLECTIONS THAT SPEAK TO HOW YOU LIVE.`) dengan 3 kartu cerita yang dapat dipilih.
 * 5. Bagian `Made for your everyday.` dengan kartu spotlight `THE ESSENTIAL EDIT` + 3 produk unggulan.
 */

import { useState } from 'react'
import { IMAGES } from '../assets/assetMap'
import { COLLECTION_STORIES } from '../data/furnitureData'
import ProductCard from '../components/ProductCard'
import { ActionPillButton } from '../components/ui/Buttons'

/**
 * Merender halaman beranda editorial STILL.
 *
 * @param {object} props - Properti HomePage.
 * @param {Array<object>} props.products - Daftar produk katalog aktif untuk menampilkan Essential Edit.
 * @param {Function} props.onNavigate - Handler navigasi antar halaman (`shop`, `product`, dll).
 * @param {Function} props.onSelectProduct - Handler membuka detail produk tertentu.
 * @param {Function} props.onAddToCart - Handler menambah produk cepat ke tas belanja.
 * @returns {JSX.Element} Elemen halaman beranda.
 */
export default function HomePage({ products, onNavigate, onSelectProduct, onAddToCart }) {
  // Menginisialisasi cerita aktif pada kartu '02' sesuai highlight gelap di desain Figma
  const [activeStoryId, setActiveStoryId] = useState(COLLECTION_STORIES[1].id)

  const activeStory =
    COLLECTION_STORIES.find((story) => story.id === activeStoryId) || COLLECTION_STORIES[0]

  // Mengambil 3 produk unggulan untuk grid Essential Edit: Forma, Arc, Luma
  const featuredIds = ['forma-lounge-chair', 'arc-coffee-table', 'luma-modular-sofa']
  const featuredProducts = featuredIds
    .map((id) => products.find((item) => item.id === id))
    .filter(Boolean)

  return (
    <main className="mx-auto max-w-[1440px] px-5 pt-8 sm:px-8 sm:pt-12 lg:px-12">
      {/* BAGIAN 1: EDITORIAL HERO + TIPOGRAFI TUMPANG TINDIH ("OBJECTS / FOR LIVING.") */}
      <section aria-label="Hero Koleksi Utama">
        {/* Baris Atas: Kata "OBJECTS" */}
        <h1 className="text-[52px] sm:text-[86px] lg:text-[118px] font-normal leading-[0.88] tracking-[-0.06em] text-[#111111]">
          OBJECTS
        </h1>

        {/* Baris Kedua: Microcopy Kiri + "FOR LIVING." Overlap + Statistik Kanan */}
        <div className="mt-3 grid grid-cols-1 items-end gap-5 lg:mt-0 lg:grid-cols-12">
          <div className="lg:col-span-3 lg:pb-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#71717a]">
              A MORE CONSIDERED HOME
            </p>
            <p className="mt-1.5 max-w-[220px] text-[13px] leading-[1.45] text-[#111111]">
              Quiet forms for thoughtful rooms, crafted to stay relevant beyond fleeting seasons.
            </p>
          </div>

          <div className="relative z-10 lg:col-span-6 lg:-mb-[36px]">
            <p className="text-[48px] sm:text-[78px] lg:text-[114px] font-normal leading-[0.88] tracking-[-0.06em] text-[#111111]">
              FOR LIVING.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 lg:col-span-3 lg:justify-end lg:pb-6">
            <div>
              <p className="text-[20px] font-normal tracking-[-0.5px] text-[#111111]">10K+</p>
              <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-[#71717a]">
                HAPPY HOMES
              </p>
            </div>
            <div>
              <p className="text-[20px] font-normal tracking-[-0.5px] text-[#111111]">5K+</p>
              <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-[#71717a]">
                PIECES SOLD
              </p>
            </div>
            <div>
              <p className="text-[20px] font-normal tracking-[-0.5px] text-[#111111]">15+</p>
              <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-[#71717a]">
                CATEGORIES
              </p>
            </div>
          </div>
        </div>

        {/* Kartu Foto Hero Arsitektural */}
        <div className="relative mt-4 h-[360px] sm:h-[460px] lg:h-[530px] w-full overflow-hidden rounded-[20px] bg-[#e9e6e0]">
          <img
            src={IMAGES.heroLivingRoom}
            alt="Ruang tamu arsitektural dengan sofa modular dan meja kayu solid STILL"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

          {/* Overlay Label Bawah Hero & CTA */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-end sm:p-9">
            <div className="text-white">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/80">
                STILL — COLLECTION 026
              </p>
              <h2 className="mt-1.5 text-[24px] sm:text-[32px] font-normal tracking-[-0.8px] text-white">
                THE ART OF EVERYDAY LIVING
              </h2>
            </div>

            <ActionPillButton
              label="Explore collection"
              variant="light"
              onClick={() => onNavigate('shop', { clearFilters: true })}
            />
          </div>
        </div>
      </section>

      {/* BAGIAN 2: PERNYATAAN BRAND ("LESS, BUT BETTER LIVING.") */}
      <section
        id="brand-statement"
        className="mt-20 grid grid-cols-1 gap-8 border-b border-[#e6e6e9] pb-16 lg:grid-cols-12 lg:items-end"
      >
        <div className="lg:col-span-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#71717a]">
            DESIGN PHILOSOPHY
          </p>
          <h2 className="mt-3 text-[34px] sm:text-[46px] font-normal leading-[1.05] tracking-[-1.5px] text-[#111111]">
            LESS, BUT BETTER LIVING.
          </h2>
        </div>

        <div className="lg:col-span-6 lg:pl-8">
          <p className="text-[15px] leading-[1.65] text-[#71717a]">
            We believe the objects you live with every day shape how you rest, think, and gather.
            Each STILL piece balances clean architectural geometry with honest solid hardwoods and breathable textiles.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ActionPillButton
              label="Explore collection"
              variant="dark"
              onClick={() => onNavigate('shop', { clearFilters: true })}
            />
            <ActionPillButton
              label="Inspect Forma Chair"
              variant="light"
              onClick={() => onSelectProduct('forma-lounge-chair')}
            />
          </div>
        </div>
      </section>

      {/* BAGIAN 3: BENTO KOLEKSI INTERAKTIF ("COLLECTIONS THAT SPEAK TO HOW YOU LIVE.") */}
      <section id="editorial-collections" className="mt-16">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#71717a]">
              CURATED CHAPTERS
            </p>
            <h2 className="mt-2 max-w-xl text-[28px] sm:text-[36px] font-normal leading-[1.1] tracking-[-1px] text-[#111111]">
              COLLECTIONS THAT SPEAK TO HOW YOU LIVE.
            </h2>
          </div>
          <p className="text-[12px] text-[#71717a]">Select a chapter to preview its room pairing</p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Kolom Kiri: 3 Kartu Pilihan Koleksi */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            {COLLECTION_STORIES.map((story) => {
              const isSelected = story.id === activeStory.id
              return (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => setActiveStoryId(story.id)}
                  className={`flex flex-col justify-between rounded-[20px] p-6 text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-[#141414] text-white shadow-sm'
                      : 'bg-[#f5f5f7] text-[#111111] hover:bg-[#ececef]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`text-[11px] font-medium tracking-[0.08em] ${
                        isSelected ? 'text-[#38bdf8]' : 'text-[#71717a]'
                      }`}
                    >
                      {story.number}
                    </span>
                    <span
                      className={`text-[14px] ${
                        isSelected ? 'text-[#38bdf8]' : 'text-[#71717a]'
                      }`}
                    >
                      ↗
                    </span>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-[17px] font-medium leading-[1.3] tracking-[-0.2px]">
                      {story.title}
                    </h3>
                    <p
                      className={`mt-2 text-[13px] leading-[1.55] ${
                        isSelected ? 'text-[#b4b4bc]' : 'text-[#71717a]'
                      }`}
                    >
                      {story.subtitle}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Kolom Kanan: Panel Foto Koleksi Pilihan */}
          <div className="relative min-h-[380px] sm:min-h-[460px] overflow-hidden rounded-[20px] bg-[#ebe6de] lg:col-span-7">
            <img
              src={activeStory.image}
              alt={activeStory.tag}
              className="h-full w-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 flex flex-col justify-between gap-4 p-7 sm:flex-row sm:items-end">
              <div className="text-white">
                <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-white backdrop-blur-md">
                  CHAPTER {activeStory.number}
                </span>
                <h3 className="mt-3 text-[26px] sm:text-[32px] font-normal tracking-[-0.8px]">
                  {activeStory.tag}
                </h3>
              </div>

              <ActionPillButton
                label="Shop this room"
                variant="light"
                onClick={() =>
                  onNavigate('shop', {
                    roomFilter: activeStory.roomFilter,
                    materialFilter: activeStory.materialFilter,
                  })
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* BAGIAN 4: THE ESSENTIAL EDIT ("Made for your everyday.") */}
      <section className="mt-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#71717a]">
              CURATED PIECES
            </p>
            <h2 className="mt-2 text-[30px] sm:text-[40px] font-normal tracking-[-1.2px] text-[#111111]">
              Made for your everyday.
            </h2>
          </div>

          <ActionPillButton
            label="Explore all furniture"
            variant="light"
            onClick={() => onNavigate('shop', { clearFilters: true })}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Kartu Spotlight Gelap: THE ESSENTIAL EDIT */}
          <div className="flex flex-col justify-between rounded-[20px] bg-[#141414] p-7 text-white">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#38bdf8]">
                SEASON 026
              </span>
              <h3 className="mt-4 text-[28px] font-normal leading-[1.1] tracking-[-0.8px]">
                THE
                <br />
                ESSENTIAL
                <br />
                EDIT
              </h3>
              <p className="mt-4 text-[13px] leading-[1.6] text-[#a1a1aa]">
                Three foundational silhouettes engineered to anchor calm living rooms.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('shop', { clearFilters: true })}
              className="mt-8 inline-flex items-center justify-between rounded-full border border-white/15 bg-white/5 px-4 py-3 text-[12px] font-medium text-white transition-colors hover:bg-white/10 cursor-pointer"
            >
              <span>View {products.filter((p) => p.stock > 0).length} active pieces</span>
              <span className="text-[#38bdf8]">→</span>
            </button>
          </div>

          {/* 3 Kartu Produk Unggulan */}
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </section>
    </main>
  )
}

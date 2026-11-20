/**
 * @fileoverview Komponen Footer Editorial Gelap Storefront STILL.
 *
 * Revisi UI/UX yang diterapkan:
 * - Tautan navigasi menggunakan `SHARED_NAV_LINKS` sehingga 100% sinkron dengan Navbar (desktop & mobile).
 * - Semua tombol di Footer memiliki fungsi nyata (navigasi rute, buka Concierge, buka Sign In, ganti bahasa).
 * - Menambahkan copyright resmi `© 2026 fahrizaa - STILL`.
 */

import { Link } from 'react-router-dom'
import { SHARED_NAV_LINKS } from '../data/translations'

/**
 * Merender footer global STILL untuk seluruh halaman storefront.
 *
 * @param {object} props - Properti komponen Footer.
 * @param {Function} props.onOpenConcierge - Handler membuka panel bantuan STILL Concierge.
 * @param {Function} props.onOpenSignIn - Handler membuka modal Sign In / Akun.
 * @param {Function} props.onOpenCart - Handler membuka drawer Tas Belanja.
 * @param {'id' | 'en'} props.lang - Kode bahasa aktif.
 * @param {Function} props.onToggleLang - Handler mengganti bahasa (`id` <-> `en`).
 * @param {object} props.t - Kamus terjemahan aktif.
 * @returns {JSX.Element} Elemen footer storefront.
 */
export default function Footer({
  onNavigate,
  onOpenConcierge,
  onOpenSignIn,
  onOpenCart,
  currentUser,
  lang,
  onToggleLang,
  t,
}) {
  return (
    <footer className="mt-16 bg-[#141414] text-white">
      <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 sm:py-14 lg:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Identitas Brand */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            <div>
              <Link
                to="/"
                className="inline-block text-[42px] sm:text-[52px] font-normal leading-none tracking-[-2px] text-white hover:opacity-80"
              >
                still.
              </Link>
              <p className="mt-3 max-w-sm text-[13px] leading-[1.6] text-[#a1a1aa]">
                {t.footerTagline}
              </p>
            </div>

            <div className="text-[12px] text-[#a1a1aa]">
              <p className="font-medium text-white">{t.footerShowroomHeading}</p>
              <p className="mt-1">Jl. Kemang Selatan VIII No. 14, Jakarta Selatan 12730</p>
            </div>
          </div>

          {/* Kolom Navigasi yang Sinkron dengan Navbar */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-7">
            <div>
              <p className="mb-3.5 text-[11px] font-medium uppercase tracking-[0.1em] text-[#a1a1aa]">
                {t.footerNavHeading}
              </p>
              <ul className="space-y-2 text-[13px] text-[#e4e4e7]">
                {SHARED_NAV_LINKS.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      onClick={(e) => {
                        if (item.path.startsWith('/seller') && currentUser?.role !== 'seller') {
                          e.preventDefault()
                          onNavigate(item.path)
                        }
                      }}
                      className="inline-flex min-h-[36px] items-center transition-colors hover:text-[#38bdf8]"
                    >
                      {t[item.labelKey]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-3.5 text-[11px] font-medium uppercase tracking-[0.1em] text-[#a1a1aa]">
                {t.footerFeatureHeading}
              </p>
              <ul className="space-y-2 text-[13px] text-[#e4e4e7]">
                <li>
                  <button
                    type="button"
                    onClick={onOpenConcierge}
                    className="inline-flex min-h-[36px] items-center transition-colors hover:text-[#38bdf8] cursor-pointer"
                  >
                    {t.navConcierge}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenCart}
                    className="inline-flex min-h-[36px] items-center transition-colors hover:text-[#38bdf8] cursor-pointer"
                  >
                    {t.bagTitle}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenSignIn}
                    className="inline-flex min-h-[36px] items-center transition-colors hover:text-[#38bdf8] cursor-pointer"
                  >
                    {t.signIn} (Pembeli / Penjual)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onToggleLang}
                    className="inline-flex min-h-[36px] items-center transition-colors hover:text-[#38bdf8] cursor-pointer"
                  >
                    {t.langLabel}: {lang === 'id' ? 'Bahasa Indonesia (ID)' : 'English (EN)'}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Garis Bawah Hak Cipta (`fahrizaa - STILL`) */}
        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-[12px] text-[#a1a1aa] sm:flex-row sm:items-center sm:justify-between">
          <p>{t.footerCopyright}</p>
          <p>Jakarta, Indonesia</p>
        </div>
      </div>
    </footer>
  )
}

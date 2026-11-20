/**
 * @fileoverview Komponen Bilah Navigasi Utama (Navbar) Storefront STILL.
 *
 * Revisi UI/UX yang diterapkan:
 * - Menggunakan `SHARED_NAV_LINKS` agar isi menu Navbar (desktop & mobile) identik dengan Footer.
 * - Menu Search dipindahkan keluar dari hamburger navigation agar langsung dapat diakses di bilah atas mobile & desktop.
 * - Menambahkan ikon User (`ICONS.user`) pada tombol Sign In / Akun.
 * - Menambahkan tombol pemilih bahasa (`ID` / `EN`).
 */

import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ICONS } from '../assets/assetMap'
import { SHARED_NAV_LINKS } from '../data/translations'

/**
 * Merender header navigasi sticky responsif untuk seluruh halaman storefront.
 *
 * @param {object} props - Properti komponen Navbar.
 * @param {number} props.cartCount - Total unit barang di dalam keranjang belanja.
 * @param {Function} props.onOpenCart - Handler membuka drawer keranjang belanja.
 * @param {Function} props.onOpenSignIn - Handler membuka modal Sign In / Akun Dummy.
 * @param {Function} props.onOpenConcierge - Handler membuka drawer live chat STILL Concierge.
 * @param {object | null} props.currentUser - Objek sesi pengguna aktif atau `null` jika tamu.
 * @param {'id' | 'en'} props.lang - Kode bahasa aktif (`id` atau `en`).
 * @param {Function} props.onToggleLang - Handler mengganti bahasa (`id` <-> `en`).
 * @param {object} props.t - Kamus terjemahan aktif.
 * @returns {JSX.Element} Elemen header navigasi aplikasi.
 */
export default function Navbar({
  cartCount,
  onNavigate,
  onOpenCart,
  onOpenSignIn,
  onOpenConcierge,
  currentUser,
  lang,
  onToggleLang,
  t,
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  // Menampilkan angka keranjang dimulai dari 0, 1, 2 dst tanpa awalan '00'
  const formattedCartCount = String(cartCount)
  const userButtonLabel = currentUser
    ? currentUser.role === 'seller'
      ? 'Penjual'
      : 'Customer'
    : t.signIn

  /**
   * Memeriksa apakah item navigasi sedang aktif berdasarkan pathname & query string URL saat ini.
   *
   * @param {string} targetPath - Path rute item navigasi.
   * @returns {boolean} `true` bila rute cocok dengan URL aktif.
   */
  const isLinkActive = (targetPath) => {
    if (targetPath === '/') return location.pathname === '/'
    if (targetPath.includes('?')) {
      return `${location.pathname}${location.search}` === targetPath
    }
    return location.pathname.startsWith(targetPath) && !location.search
  }

  /**
   * Menangani pengiriman form pencarian cepat dari Navbar langsung ke rute `/shop?q=...`.
   *
   * @param {React.FormEvent} event - Event submit form pencarian.
   */
  const handleQuickSearch = (event) => {
    event.preventDefault()
    const clean = searchInput.trim()
    navigate(clean ? `/shop?q=${encodeURIComponent(clean)}` : '/shop')
    setSearchOpen(false)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#e6e6e9] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-8 lg:px-12">
        {/* Identitas Brand: `still.®` */}
        <Link
          to="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-start gap-0.5 text-left transition-opacity hover:opacity-75"
          aria-label="STILL Home"
        >
          <span className="text-[28px] sm:text-[32px] font-normal leading-none tracking-[-1.2px] text-[#111111]">
            still.
          </span>
          <span className="mt-1 text-[10px] font-medium text-[#71717a]">®</span>
        </Link>

        {/* Tautan Navigasi Desktop (Sinkron dengan Mobile & Footer) */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Main navigation">
          {SHARED_NAV_LINKS.map((item) => {
            const active = isLinkActive(item.path)
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={(e) => {
                  if (item.path.startsWith('/seller') && currentUser?.role !== 'seller') {
                    e.preventDefault()
                    onNavigate(item.path)
                  }
                }}
                className={`relative py-2 text-[13px] transition-colors ${
                  active
                    ? 'font-medium text-[#111111]'
                    : 'font-normal text-[#71717a] hover:text-[#111111]'
                }`}
              >
                {t[item.labelKey]}
                {active ? (
                  <span className="absolute bottom-0 left-0 right-0 h-[1.5px] rounded-full bg-[#111111]" />
                ) : null}
              </Link>
            )
          })}
          <button
            type="button"
            onClick={onOpenConcierge}
            className="py-2 text-[13px] font-normal text-[#71717a] transition-colors hover:text-[#111111] cursor-pointer"
          >
            {t.navConcierge}
          </button>
        </nav>

        {/* Utilitas Kanan: Bahasa, Search Ringkas, Keranjang (0, 1, dst), & User Minimalis */}
        <div className="flex items-center gap-2">
          {/* Input Search Inline Ringkas (Tidak Memanjang Sepanjang Layar) */}
          {searchOpen ? (
            <form
              onSubmit={handleQuickSearch}
              className="hidden sm:flex h-10 w-52 md:w-64 items-center gap-2 rounded-full bg-[#f5f5f7] px-3.5 transition-all"
            >
              <img
                src={ICONS.search}
                alt=""
                width={14}
                height={14}
                className="h-3.5 w-3.5 shrink-0 opacity-60"
              />
              <input
                type="text"
                autoFocus
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-transparent text-[12px] text-[#111111] placeholder:text-[#71717a] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-[14px] leading-none text-[#71717a] hover:text-[#111111] cursor-pointer"
                aria-label="Close search"
              >
                ×
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSearchOpen(true)
                setMobileMenuOpen(false)
              }}
              aria-expanded={searchOpen}
              aria-label={t.searchButton}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f7] text-[#111111] transition-colors hover:bg-[#eaecef] cursor-pointer"
            >
              <img src={ICONS.search} alt="" width={15} height={15} className="h-4 w-4" />
            </button>
          )}

          {/* Tombol Toggle Bahasa ID / EN Minimalis */}
          <button
            type="button"
            onClick={onToggleLang}
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#f5f5f7] px-3 text-[11px] font-medium text-[#111111] transition-colors hover:bg-[#eaecef] cursor-pointer"
            aria-label={`${t.langLabel}: ${lang.toUpperCase()}`}
          >
            <span className={lang === 'id' ? 'font-semibold text-[#111111]' : 'text-[#71717a]'}>
              ID
            </span>
            <span className="mx-1 text-[#b4b4bc]">/</span>
            <span className={lang === 'en' ? 'font-semibold text-[#111111]' : 'text-[#71717a]'}>
              EN
            </span>
          </button>

          {/* Tombol Tas Belanja (Dimulai dari 0, 1, dst) */}
          <button
            type="button"
            onClick={onOpenCart}
            className="flex h-10 items-center gap-2 rounded-full bg-[#f5f5f7] px-3 transition-colors hover:bg-[#eaecef] cursor-pointer"
            aria-label={`${t.bagTitle} (${cartCount})`}
          >
            <img src={ICONS.cart} alt="" width={17} height={17} className="h-[17px] w-[17px]" />
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#141414] px-1.5 text-[11px] font-medium text-white">
              {formattedCartCount}
            </span>
          </button>

          {/* Tombol User / Login Minimalis Tanpa Merk STILL (Langsung Nama Peran: Customer / Penjual) */}
          <button
            type="button"
            onClick={onOpenSignIn}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#f5f5f7] px-3.5 text-[12px] font-medium text-[#111111] transition-colors hover:bg-[#eaecef] cursor-pointer"
            aria-label={userButtonLabel}
          >
            <img src={ICONS.user} alt="" width={15} height={15} className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{userButtonLabel}</span>
          </button>

          {/* Tombol Hamburger Navigasi Mobile */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen((prev) => !prev)
              setSearchOpen(false)
            }}
            aria-expanded={mobileMenuOpen}
            aria-label={t.menuLabel}
            className="inline-flex lg:hidden h-10 items-center gap-1.5 rounded-full bg-[#f5f5f7] px-3 text-[11px] font-medium text-[#111111] cursor-pointer"
          >
            <span>{t.menuLabel}</span>
            <span className="flex flex-col gap-1">
              <span className="h-[1.5px] w-3.5 bg-[#111111]" />
              <span className="h-[1.5px] w-3.5 bg-[#111111]" />
            </span>
          </button>
        </div>
      </div>

      {/* Input Search Ringkas Khusus Layar Mobile (<sm) */}
      {searchOpen ? (
        <div className="border-t border-[#e6e6e9] bg-white px-4 py-2.5 sm:hidden">
          <form
            onSubmit={handleQuickSearch}
            className="mx-auto flex max-w-sm items-center gap-2 rounded-full bg-[#f5f5f7] px-3.5 py-2"
          >
            <img
              src={ICONS.search}
              alt=""
              width={14}
              height={14}
              className="h-3.5 w-3.5 shrink-0 opacity-60"
            />
            <input
              type="text"
              autoFocus
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-transparent text-[12px] text-[#111111] placeholder:text-[#71717a] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="text-[14px] leading-none text-[#71717a] hover:text-[#111111] cursor-pointer"
              aria-label="Close search"
            >
              ×
            </button>
          </form>
        </div>
      ) : null}

      {/* Dropdown Hamburger Mobile (Isinya Sinkron dengan Navbar Desktop & Footer, Tanpa Search) */}
      {mobileMenuOpen ? (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-[#e6e6e9] bg-white px-4 py-4 lg:hidden"
        >
          <div className="flex flex-col gap-1">
            {SHARED_NAV_LINKS.map((item) => {
              const active = isLinkActive(item.path)
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={(e) => {
                    setMobileMenuOpen(false)
                    if (item.path.startsWith('/seller') && currentUser?.role !== 'seller') {
                      e.preventDefault()
                      onNavigate(item.path)
                    }
                  }}
                  className={`flex h-11 items-center justify-between rounded-xl px-3.5 text-[14px] transition-colors ${
                    active
                      ? 'bg-[#f5f5f7] font-medium text-[#111111]'
                      : 'text-[#111111] hover:bg-[#f5f5f7]'
                  }`}
                >
                  <span>{t[item.labelKey]}</span>
                  <span className="text-[12px] text-[#71717a]">→</span>
                </Link>
              )
            })}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenConcierge()
              }}
              className="flex h-11 items-center justify-between rounded-xl px-3.5 text-left text-[14px] text-[#111111] hover:bg-[#f5f5f7] cursor-pointer"
            >
              <span>{t.navConcierge}</span>
              <span className="text-[12px] text-[#71717a]">↗</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenSignIn()
              }}
              className="mt-2 flex h-11 items-center justify-between rounded-xl bg-[#141414] px-4 text-left text-[13px] font-medium text-white cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <img
                  src={ICONS.user}
                  alt=""
                  width={15}
                  height={15}
                  className="h-4 w-4 brightness-0 invert"
                />
                <span>
                  {currentUser ? userButtonLabel : `${t.signIn} (Customer / Penjual)`}
                </span>
              </span>
              <span className="text-[#38bdf8]">→</span>
            </button>
          </div>
        </nav>
      ) : null}
    </header>
  )
}

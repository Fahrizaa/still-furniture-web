/**
 * @fileoverview Komponen Bilah Navigasi Utama (Navbar) Storefront STILL.
 *
 * Menampilkan identitas merek `still.®`, menu navigasi antar-halaman,
 * kolom pencarian cepat ke halaman Shop, tombol tas belanja dengan penghitung real-time,
 * serta tombol Sign In / Workspace Switcher untuk berpindah ke Seller Workspace.
 */

import { useState } from 'react'
import { ICONS } from '../assets/assetMap'

/**
 * Merender header navigasi sticky responsif untuk seluruh halaman storefront (`01`–`04`).
 *
 * @param {object} props - Properti komponen Navbar.
 * @param {string} props.currentPage - ID halaman aktif saat ini (`home`, `shop`, `product`, `checkout`).
 * @param {Function} props.onNavigate - Callback untuk berpindah halaman (`(pageId, options?) => void`).
 * @param {number} props.cartCount - Total unit barang di dalam keranjang belanja.
 * @param {Function} props.onOpenCart - Handler untuk membuka drawer keranjang belanja.
 * @param {Function} props.onOpenSignIn - Handler untuk membuka modal Sign In / Akun Dummy.
 * @param {Function} props.onSearchSubmit - Handler ketika pengguna mengetik & mengirim kata kunci pencarian.
 * @param {object | null} props.currentUser - Objek sesi pengguna aktif (Pembeli / Penjual) atau `null` jika tamu.
 * @returns {JSX.Element} Elemen header navigasi aplikasi.
 */
export default function Navbar({
  currentPage,
  onNavigate,
  cartCount,
  onOpenCart,
  onOpenSignIn,
  onSearchSubmit,
  currentUser,
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  /**
   * Memformat angka jumlah item tas belanja menjadi 2 digit seperti desain Figma (`01`, `02`, dst).
   */
  const formattedCartCount = String(cartCount).padStart(2, '0')

  /**
   * Menangani pengiriman form pencarian cepat dari Navbar langsung ke halaman Shop.
   *
   * @param {React.FormEvent} event - Event submit form pencarian.
   */
  const handleQuickSearch = (event) => {
    event.preventDefault()
    onSearchSubmit(searchInput.trim())
    setSearchOpen(false)
    setMobileMenuOpen(false)
  }

  /**
   * Memindahkan halaman dari tautan menu navigasi lalu menutup menu mobile bila sedang terbuka.
   *
   * @param {string} targetPage - Halaman tujuan (`home` atau `shop`).
   * @param {object} [options] - Parameter opsional (filter awal atau ID section scroll).
   */
  const handleMenuLinkClick = (targetPage, options) => {
    onNavigate(targetPage, options)
    setMobileMenuOpen(false)
  }

  const navLinks = [
    {
      id: 'shop',
      label: 'Shop furniture',
      isActive: currentPage === 'shop' || currentPage === 'product',
      action: () => handleMenuLinkClick('shop', { clearFilters: true }),
    },
    {
      id: 'rooms',
      label: 'Rooms',
      isActive: false,
      action: () => handleMenuLinkClick('shop', { roomFilter: 'Living room' }),
    },
    {
      id: 'story',
      label: 'Our story',
      isActive: false,
      action: () => handleMenuLinkClick('home', { scrollToId: 'brand-statement' }),
    },
    {
      id: 'journal',
      label: 'Journal',
      isActive: false,
      action: () => handleMenuLinkClick('home', { scrollToId: 'editorial-collections' }),
    },
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-[#e6e6e9]/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        {/* Identitas Brand: `still.®` */}
        <button
          type="button"
          onClick={() => handleMenuLinkClick('home')}
          className="flex items-start gap-0.5 text-left transition-opacity hover:opacity-75 cursor-pointer"
          aria-label="Kembali ke beranda STILL"
        >
          <span className="text-[30px] sm:text-[34px] font-normal leading-none tracking-[-1.2px] text-[#111111]">
            still.
          </span>
          <span className="mt-1 text-[10px] font-medium text-[#71717a]">®</span>
        </button>

        {/* Tautan Navigasi Desktop */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9" aria-label="Navigasi utama">
          {navLinks.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className={`relative text-[13px] transition-colors cursor-pointer ${
                item.isActive
                  ? 'font-medium text-[#111111]'
                  : 'font-normal text-[#71717a] hover:text-[#111111]'
              }`}
            >
              {item.label}
              {item.isActive ? (
                <span className="absolute -bottom-1.5 left-0 right-0 h-[1.5px] rounded-full bg-[#111111]" />
              ) : null}
            </button>
          ))}
        </nav>

        {/* Utilitas Kanan: Cari, Tas Belanja, & Workspace Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Pencarian Inline yang Dapat Dibuka-Tutup */}
          {searchOpen ? (
            <form
              onSubmit={handleQuickSearch}
              className="hidden sm:flex h-[40px] items-center gap-2 rounded-full border border-[#e6e6e9] bg-[#f5f5f7] px-3.5"
            >
              <img src={ICONS.search} alt="" width={15} height={15} className="h-3.5 w-3.5 opacity-70" />
              <input
                type="text"
                autoFocus
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search pieces..."
                className="w-36 bg-transparent text-[12px] text-[#111111] placeholder:text-[#71717a] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-[11px] text-[#71717a] hover:text-[#111111] cursor-pointer"
                aria-label="Tutup pencarian"
              >
                ×
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#f5f5f7] text-[#111111] transition-colors hover:bg-[#eaecef] cursor-pointer"
              aria-label="Cari furnitur"
            >
              <img src={ICONS.search} alt="Search" width={16} height={16} className="h-4 w-4" />
            </button>
          )}

          {/* Tombol Tas Belanja + Lencana Jumlah */}
          <button
            type="button"
            onClick={onOpenCart}
            className="flex h-[40px] items-center gap-2 rounded-full bg-[#f5f5f7] px-3.5 transition-colors hover:bg-[#eaecef] cursor-pointer"
            aria-label={`Buka tas belanja (${cartCount} item)`}
          >
            <img src={ICONS.cart} alt="Bag" width={18} height={18} className="h-[18px] w-[18px]" />
            <span className="flex h-[22px] min-w-[26px] items-center justify-center rounded-full bg-[#141414] px-1.5 text-[10px] font-medium text-white">
              {formattedCartCount}
            </span>
          </button>

          {/* Tombol Sign In / Info Akun Aktif */}
          <button
            type="button"
            onClick={onOpenSignIn}
            className="hidden sm:inline-flex h-[40px] items-center gap-2 rounded-full border border-[#e6e6e9] bg-white px-4 text-[11px] font-medium tracking-[0.06em] text-[#111111] transition-colors hover:bg-[#f5f5f7] cursor-pointer"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                currentUser?.role === 'seller'
                  ? 'bg-[#38bdf8]'
                  : currentUser?.role === 'customer'
                    ? 'bg-[#376b56]'
                    : 'bg-[#111111]'
              }`}
            />
            {currentUser
              ? `${currentUser.name.split(' ')[0].toUpperCase()} · ${currentUser.roleLabel.toUpperCase()}`
              : 'SIGN IN'}
          </button>

          {/* Tombol Hamburger Khusus Layar Mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex md:hidden h-[40px] w-[40px] flex-col items-center justify-center gap-1 rounded-full bg-[#f5f5f7] cursor-pointer"
            aria-label="Toggle menu navigasi mobile"
          >
            <span className="h-[1.5px] w-4 bg-[#111111]" />
            <span className="h-[1.5px] w-4 bg-[#111111]" />
          </button>
        </div>
      </div>

      {/* Dropdown Menu Mobile */}
      {mobileMenuOpen ? (
        <div className="border-t border-[#e6e6e9] bg-white px-5 py-4 md:hidden">
          <form
            onSubmit={handleQuickSearch}
            className="mb-4 flex h-[42px] items-center gap-2 rounded-full bg-[#f5f5f7] px-4"
          >
            <img src={ICONS.search} alt="" width={16} height={16} className="h-4 w-4 opacity-70" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search sofa, lounge chair, walnut..."
              className="w-full bg-transparent text-[13px] text-[#111111] focus:outline-none"
            />
          </form>
          <div className="flex flex-col gap-1">
            {navLinks.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-[14px] text-[#111111] hover:bg-[#f5f5f7] cursor-pointer"
              >
                <span>{item.label}</span>
                <span className="text-[12px] text-[#71717a]">→</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenSignIn()
              }}
              className="mt-2 flex items-center justify-between rounded-xl bg-[#141414] px-4 py-3 text-left text-[13px] font-medium text-white cursor-pointer"
            >
              <span>
                {currentUser
                  ? `${currentUser.name} (${currentUser.roleLabel}) · Manage Account`
                  : 'Sign In (Pembeli / Penjual)'}
              </span>
              <span className="text-[#38bdf8]">↗</span>
            </button>
          </div>
        </div>
      ) : null}
    </header>
  )
}

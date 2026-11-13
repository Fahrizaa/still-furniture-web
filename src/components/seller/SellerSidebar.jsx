/**
 * @fileoverview Komponen Sidebar Navigasi Bersama untuk Seller Workspace (`05`, `06`, `10`).
 *
 * Menampilkan identitas `still. / SELLER WORKSPACE`, menu navigasi antar panel penjual,
 * kartu status toko `Your store is live` beserta tautan kembali ke storefront pelanggan,
 * dan informasi akun `STILL Indonesia · seller@still.co.id`.
 */

import { ICONS } from '../../assets/assetMap'

/**
 * Merender sidebar kiri Seller Workspace yang responsif (drawer horizontal ringkas di mobile, panel 232px di desktop).
 *
 * @param {object} props - Properti SellerSidebar.
 * @param {string} props.activeSection - Bagian aktif saat ini (`inventory`, `studio`, `overview`, `orders`, `messages`, `analytics`, `settings`).
 * @param {Function} props.onSelectSection - Handler klik menu sidebar.
 * @param {Function} props.onViewStorefront - Handler kembali ke Storefront publik (`home`).
 * @param {object | null} [props.currentUser] - Data akun penjual yang sedang login.
 * @param {Function} [props.onSignOut] - Handler keluar dari akun penjual kembali ke Storefront publik.
 * @returns {JSX.Element} Elemen navigasi sidebar Seller.
 */
export default function SellerSidebar({
  activeSection,
  onSelectSection,
  onViewStorefront,
  currentUser,
  onSignOut,
}) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: ICONS.grid },
    { id: 'inventory', label: 'Inventory', icon: ICONS.box },
    { id: 'studio', label: 'Add Furniture', icon: ICONS.edit },
    { id: 'orders', label: 'Orders', icon: ICONS.bag },
    { id: 'messages', label: 'Messages', icon: ICONS.chat },
    { id: 'analytics', label: 'Analytics', icon: ICONS.chart },
    { id: 'settings', label: 'Settings', icon: ICONS.settings },
  ]

  return (
    <aside className="flex w-full shrink-0 flex-col justify-between bg-[#f5f5f7] px-5 py-6 lg:min-h-screen lg:w-[244px] lg:px-6 lg:py-8">
      <div>
        {/* Brand Header Seller */}
        <div className="flex items-center justify-between lg:block">
          <div>
            <p className="text-[32px] font-normal leading-none tracking-[-1px] text-[#111111]">
              still.
            </p>
            <p className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.14em] text-[#71717a]">
              SELLER WORKSPACE
            </p>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={onViewStorefront}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[11px] font-medium text-[#111111] shadow-xs cursor-pointer"
            >
              <img src={ICONS.back} alt="" width={12} height={12} className="h-3 w-3" />
              Storefront
            </button>
            {onSignOut ? (
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center rounded-full bg-[#fcedec] px-3 py-2 text-[11px] font-medium text-[#9b3f3f] cursor-pointer"
              >
                Sign out
              </button>
            ) : null}
          </div>
        </div>

        {/* Daftar Menu Navigasi Dashboard */}
        <nav
          className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1 lg:mt-10 lg:flex-col lg:overflow-visible"
          aria-label="Navigasi Seller"
        >
          {menuItems.map((item) => {
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`flex h-[42px] shrink-0 items-center gap-3 rounded-full px-4 text-left text-[13px] transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#141414] font-medium text-white'
                    : 'text-[#71717a] hover:bg-white/70 hover:text-[#111111]'
                }`}
              >
                <img
                  src={item.icon}
                  alt=""
                  width={17}
                  height={17}
                  className={`h-[17px] w-[17px] ${isActive ? 'brightness-0 invert' : 'opacity-75'}`}
                />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Kartu Store Health (Desktop) */}
        <div className="mt-8 hidden rounded-[20px] bg-white p-[18px] lg:block">
          <p className="text-[14px] font-medium text-[#111111]">Your store is live</p>
          <p className="mt-1 text-[11px] leading-[1.45] text-[#71717a]">
            Bring considered living to more homes.
          </p>
          <button
            type="button"
            onClick={onViewStorefront}
            className="mt-4 inline-flex items-center gap-2 text-[12px] font-medium text-[#111111] hover:opacity-70 cursor-pointer"
          >
            <span>View storefront</span>
            <img src={ICONS.back} alt="" width={14} height={14} className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Info Akun Penjual & Tombol Sign Out */}
      <div className="mt-8 hidden border-t border-[#e6e6e9] pt-5 lg:block">
        <p className="text-[13px] font-medium text-[#111111]">
          {currentUser?.name || 'STILL Indonesia'}
        </p>
        <p className="mt-0.5 text-[11px] text-[#71717a]">
          {currentUser?.email || 'seller@still.co.id'}
        </p>
        {onSignOut ? (
          <button
            type="button"
            onClick={onSignOut}
            className="mt-3 inline-flex rounded-full border border-[#e6e6e9] bg-white px-3.5 py-1.5 text-[11px] font-medium text-[#9b3f3f] hover:bg-[#fcedec] transition-colors cursor-pointer"
          >
            Sign out
          </button>
        ) : null}
      </div>
    </aside>
  )
}

/**
 * @fileoverview Komponen Footer Editorial Gelap (`01–04 Footer`) untuk Storefront STILL.
 *
 * Menyajikan penutup halaman dengan latar gelap `#141414`, tipografi besar `still.`,
 * slogan merek, tautan cepat storefront maupun Seller Workspace, dan hak cipta Jakarta, Indonesia.
 */

/**
 * Merender footer global STILL untuk seluruh halaman storefront.
 *
 * @param {object} props - Properti komponen Footer.
 * @param {Function} props.onNavigate - Handler navigasi halaman ketika tautan footer diklik.
 * @param {Function} props.onOpenConcierge - Handler untuk membuka panel bantuan STILL Concierge.
 * @returns {JSX.Element} Elemen footer storefront.
 */
export default function Footer({ onNavigate, onOpenConcierge }) {
  return (
    <footer className="mt-20 bg-[#141414] text-white">
      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        {/* Baris Atas: Wordmark Besar & Kolom Navigasi */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            <div>
              <p className="text-[48px] sm:text-[64px] font-normal leading-none tracking-[-2.5px] text-white">
                still.
              </p>
              <p className="mt-4 max-w-xs text-[10px] font-medium uppercase tracking-[0.14em] text-[#a1a1aa]">
                CONSIDERED FURNITURE.
                <br />
                EVERYDAY LIVING.
              </p>
            </div>
            <p className="max-w-sm text-[13px] leading-[1.6] text-[#8a8a93]">
              Architectural pieces built in small runs with sustainably harvested hardwoods and natural textiles.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            <div>
              <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.12em] text-[#71717a]">
                Storefront
              </p>
              <ul className="space-y-2.5 text-[13px] text-[#e4e4e7]">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('home')}
                    className="hover:text-[#38bdf8] transition-colors cursor-pointer"
                  >
                    Home Editorial
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('shop', { clearFilters: true })}
                    className="hover:text-[#38bdf8] transition-colors cursor-pointer"
                  >
                    Shop All Furniture
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('product', { productId: 'forma-lounge-chair' })}
                    className="hover:text-[#38bdf8] transition-colors cursor-pointer"
                  >
                    Forma Lounge Chair
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('checkout')}
                    className="hover:text-[#38bdf8] transition-colors cursor-pointer"
                  >
                    Checkout & QRIS
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.12em] text-[#71717a]">
                Seller & Studio
              </p>
              <ul className="space-y-2.5 text-[13px] text-[#e4e4e7]">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('seller-inventory')}
                    className="hover:text-[#38bdf8] transition-colors cursor-pointer"
                  >
                    Seller Inventory
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('seller-studio')}
                    className="hover:text-[#38bdf8] transition-colors cursor-pointer"
                  >
                    Seller Add Studio
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenConcierge()}
                    className="hover:text-[#38bdf8] transition-colors cursor-pointer"
                  >
                    Ask STILL Concierge
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.12em] text-[#71717a]">
                Showroom
              </p>
              <div className="space-y-2 text-[13px] text-[#a1a1aa]">
                <p>Jl. Kemang Selatan VIII No. 14</p>
                <p>Jakarta Selatan 12730</p>
                <p className="pt-2 text-white">hello@still.co.id</p>
              </div>
            </div>
          </div>
        </div>

        {/* Garis Bawah Hak Cipta */}
        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-[11px] text-[#71717a] sm:flex-row sm:items-center sm:justify-between">
          <p>Jakarta, Indonesia</p>
          <p>© 2026 STILL — Considered Furniture Studio</p>
        </div>
      </div>
    </footer>
  )
}

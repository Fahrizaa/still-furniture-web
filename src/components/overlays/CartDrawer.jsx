/**
 * @fileoverview Drawer Tas Belanja (CartDrawer) Interaktif untuk Storefront STILL.
 *
 * Memberikan pengalaman e-commerce nyata ketika pengguna menekan ikon tas belanja
 * atau tombol tambah cepat (`+`): menampilkan daftar item, ubah jumlah qty, hapus item,
 * estimasi subtotal, dan tombol menuju halaman Checkout (`04/09`).
 */

import { ICONS } from '../../assets/assetMap'
import { formatRupiah } from '../../data/furnitureData'
import { ActionPillButton } from '../ui/Buttons'

/**
 * Merender drawer samping kanan untuk melihat dan mengelola isi keranjang belanja.
 *
 * @param {object} props - Properti CartDrawer.
 * @param {boolean} props.isOpen - Status buka/tutup drawer keranjang.
 * @param {Function} props.onClose - Handler menutup drawer.
 * @param {Array<object>} props.cartItems - Daftar item di keranjang (`productId, name, price, qty, finishName, image, sku`).
 * @param {Function} props.onUpdateQty - Handler mengubah kuantitas item (`(productId, finishName, delta) => void`).
 * @param {Function} props.onRemoveItem - Handler menghapus satu baris item dari keranjang.
 * @param {Function} props.onProceedCheckout - Handler berpindah ke halaman Checkout.
 * @param {Function} props.onGoShop - Handler berpindah ke katalog Shop ketika keranjang kosong.
 * @returns {JSX.Element | null} Elemen drawer atau `null` jika sedang tertutup.
 */
export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onProceedCheckout,
  onGoShop,
}) {
  if (!isOpen) return null

  /**
   * Menghitung total harga semua barang di tas sebelum biaya ongkir & pajak.
   */
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0)

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px]">
      {/* Area klik di luar panel untuk menutup drawer */}
      <div className="flex-1" onClick={onClose} aria-hidden="true" />

      <aside
        className="flex h-full w-full max-w-[420px] flex-col bg-white shadow-2xl"
        aria-label="Tas Belanja"
      >
        {/* Header Drawer */}
        <div className="flex items-center justify-between border-b border-[#e6e6e9] px-6 py-5">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#71717a]">
              YOUR BAG
            </p>
            <h2 className="mt-0.5 text-[20px] font-normal tracking-[-0.4px] text-[#111111]">
              Selected pieces ({totalQty})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f7] hover:bg-[#e6e6e9] cursor-pointer"
            aria-label="Tutup tas belanja"
          >
            <img src={ICONS.close} alt="Close" width={16} height={16} className="h-4 w-4" />
          </button>
        </div>

        {/* Daftar Item Tas Belanja */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f5f7]">
                <img src={ICONS.bag} alt="" width={22} height={22} className="h-5 w-5 opacity-70" />
              </div>
              <p className="mt-4 text-[16px] text-[#111111]">Your bag is currently empty</p>
              <p className="mt-1 max-w-xs text-[13px] text-[#71717a]">
                Explore considered living room, dining, and studio pieces crafted in solid wood.
              </p>
              <ActionPillButton
                label="Browse catalog"
                variant="dark"
                className="mt-6"
                onClick={() => {
                  onClose()
                  onGoShop()
                }}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={`${item.productId}-${item.finishName}`}
                  className="flex gap-3.5 rounded-[16px] border border-[#e6e6e9] bg-[#fafafa] p-3.5"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 shrink-0 rounded-[12px] bg-white object-cover"
                  />
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-[14px] font-medium text-[#111111]">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-[#71717a]">
                          Finish: {item.finishName} · {item.sku}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.productId, item.finishName)}
                        className="text-[11px] text-[#71717a] hover:text-[#9b3f3f] cursor-pointer"
                        aria-label={`Hapus ${item.name}`}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex h-8 items-center gap-3 rounded-full bg-white border border-[#e6e6e9] px-3 text-[12px]">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.productId, item.finishName, -1)}
                          className="text-[#111111] hover:opacity-60 cursor-pointer"
                          aria-label="Kurangi jumlah"
                        >
                          −
                        </button>
                        <span className="min-w-[16px] text-center font-medium">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.productId, item.finishName, 1)}
                          className="text-[#111111] hover:opacity-60 cursor-pointer"
                          aria-label="Tambah jumlah"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-[13px] font-medium text-[#111111]">
                        {formatRupiah(item.price * item.qty)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Subtotal & Tombol Checkout */}
        {cartItems.length > 0 ? (
          <div className="border-t border-[#e6e6e9] bg-[#f5f5f7] px-6 py-5">
            <div className="flex items-center justify-between text-[13px] text-[#71717a]">
              <span>Subtotal</span>
              <span className="text-[17px] font-medium text-[#111111]">
                {formatRupiah(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-[#71717a]">
              White-glove shipping & optional assembly calculated at checkout.
            </p>
            <ActionPillButton
              label="Proceed to Checkout"
              variant="dark"
              className="mt-4 w-full"
              onClick={() => {
                onClose()
                onProceedCheckout()
              }}
            />
          </div>
        ) : null}
      </aside>
    </div>
  )
}

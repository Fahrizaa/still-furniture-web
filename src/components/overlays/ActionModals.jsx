/**
 * @fileoverview Kumpulan Modal Konfirmasi, Pratinjau, & Pengalih Mode (ActionModals).
 *
 * Menerjemahkan overlay-overlay dari Figma STILL ke dalam komponen modal terstruktur:
 * 1. `OrderReservedModal` (`5:2691` / `28:1351`): Konfirmasi pesanan setelah Place Order.
 * 2. `DeleteConfirmModal` (`5:2348`): Konfirmasi penghapusan produk di Seller Inventory.
 * 3. `ProductSavedModal` (`5:2705` / `28:1360`): Notifikasi sukses menyimpan / menerbitkan furnitur.
 * 4. `StorefrontPreviewModal` (`28:1391`): Pratinjau tampilan kartu produk pelanggan langsung dari Seller Studio.
 * 5. `SignInModal`: Pintu masuk cepat untuk mencoba peran Pembeli (Storefront) atau Penjual (Seller Workspace).
 */

import { useState } from 'react'
import { ICONS } from '../../assets/assetMap'
import {
  DUMMY_ACCOUNTS,
  authenticateDummyAccount,
  formatRupiah,
  getStockMeta,
} from '../../data/furnitureData'
import { ActionPillButton, BadgeChip } from '../ui/Buttons'

/**
 * Modal konfirmasi pesanan berhasil dibuat di halaman Checkout (`Order reserved`).
 *
 * @param {object} props - Properti OrderReservedModal.
 * @param {object | null} props.orderSummary - Data ringkasan pesanan terakhir (`orderId`, `total`, `methodLabel`, `recipient`).
 * @param {Function} props.onClose - Menutup modal dan kembali ke Beranda/Shop.
 * @param {Function} props.onContinueShopping - Berpindah kembali ke katalog Shop.
 * @returns {JSX.Element | null} Elemen modal atau `null`.
 */
export function OrderReservedModal({ orderSummary, onClose, onContinueShopping }) {
  if (!orderSummary) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[460px] rounded-[24px] border border-[#e8e5df] bg-[#faf9f6] p-7 text-center text-[#1a1a1a] shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#edf5ea] text-[20px] font-semibold text-[#2e7d32]">
          ✓
        </div>
        <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.14em] text-[#8c6239]">
          ORDER RESERVED · {orderSummary.orderId}
        </p>
        <h2 className="mt-1.5 text-[24px] font-normal tracking-[-0.6px] text-[#1a1a1a]">
          Thank you, {orderSummary.recipient}.
        </h2>
        <p className="mt-2 text-[13px] leading-[1.55] text-[#716b63]">
          Your furniture reservation via <strong>{orderSummary.methodLabel}</strong> has been logged.
          Our Jakarta dispatch team will confirm your white-glove slot shortly.
        </p>

        <div className="mt-5 rounded-[16px] border border-[#e8e5df] bg-white p-4 text-left text-[13px]">
          <div className="flex items-center justify-between text-[#716b63]">
            <span>Payment Method</span>
            <span className="font-medium text-[#1a1a1a]">{orderSummary.methodLabel}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[#716b63]">
            <span>Reserved Total</span>
            <span className="text-[15px] font-semibold text-[#1a1a1a]">
              {formatRupiah(orderSummary.total)}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <ActionPillButton
            label="Explore More"
            variant="warm-light"
            icon="none"
            className="flex-1"
            onClick={onContinueShopping}
          />
          <ActionPillButton
            label="Back to Home"
            variant="warm-dark"
            className="flex-1"
            onClick={onClose}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Modal konfirmasi penghapusan produk permanen pada Seller Inventory (`Delete furniture confirmation`).
 *
 * @param {object} props - Properti DeleteConfirmModal.
 * @param {object | null} props.product - Objek produk yang hendak dihapus.
 * @param {Function} props.onCancel - Membatalkan penghapusan dan menutup modal.
 * @param {Function} props.onConfirm - Mengeksekusi penghapusan produk dari daftar inventaris.
 * @returns {JSX.Element | null} Elemen modal atau `null`.
 */
export function DeleteConfirmModal({ product, onCancel, onConfirm }) {
  if (!product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[430px] rounded-[24px] border border-[#e6e6e9] bg-white p-7 text-center shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fcedec]">
          <img src={ICONS.trashRed} alt="" width={22} height={22} className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-[21px] font-normal tracking-[-0.5px] text-[#111111]">
          Remove “{product.name}”?
        </h2>
        <p className="mt-2 text-[13px] leading-[1.55] text-[#71717a]">
          SKU <strong>{product.sku}</strong> will be removed from your active Seller Inventory and storefront catalog.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-[46px] flex-1 rounded-full border border-[#e6e6e9] bg-[#f5f5f7] text-[13px] font-medium text-[#111111] hover:bg-[#e6e6e9] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(product.id)}
            className="h-[46px] flex-1 rounded-full bg-[#9b3f3f] text-[13px] font-medium text-white hover:bg-[#823232] cursor-pointer"
          >
            Delete piece
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Modal konfirmasi setelah penjual menyimpan draf atau menerbitkan produk ke storefront (`Product saved`).
 *
 * @param {object} props - Properti ProductSavedModal.
 * @param {object | null} props.savedInfo - Data status produk tersimpan (`name`, `status`, `productId`).
 * @param {Function} props.onBackToInventory - Navigasi ke halaman Seller Inventory.
 * @param {Function} props.onViewInStorefront - Navigasi ke halaman Product Detail di Storefront.
 * @returns {JSX.Element | null} Elemen modal atau `null`.
 */
export function ProductSavedModal({ savedInfo, onBackToInventory, onViewInStorefront }) {
  if (!savedInfo) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[450px] rounded-[24px] border border-[#e8e5df] bg-[#faf9f6] p-7 text-center text-[#1a1a1a] shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#edf5ea] text-[20px] text-[#2e7d32]">
          ✓
        </div>
        <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.14em] text-[#8c6239]">
          {savedInfo.status === 'Draft' ? 'DRAFT SAVED' : 'LIVE ON STOREFRONT'}
        </p>
        <h2 className="mt-1 text-[22px] font-normal tracking-[-0.5px] text-[#1a1a1a]">
          {savedInfo.name}
        </h2>
        <p className="mt-2 text-[13px] leading-[1.55] text-[#716b63]">
          {savedInfo.status === 'Draft'
            ? 'Saved safely to your workspace drafts. You can refine photography and specs anytime.'
            : 'Updated in Seller Inventory and published directly to the STILL customer storefront.'}
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <ActionPillButton
            label="Back to Inventory"
            variant="warm-light"
            icon="none"
            className="flex-1"
            onClick={onBackToInventory}
          />
          <ActionPillButton
            label="View in Storefront"
            variant="warm-dark"
            className="flex-1"
            onClick={() => onViewInStorefront(savedInfo.productId)}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Modal pratinjau penuh tampilan pelanggan (`Customer storefront preview`) untuk draft Seller Studio.
 *
 * @param {object} props - Properti StorefrontPreviewModal.
 * @param {boolean} props.isOpen - Status buka/tutup modal pratinjau.
 * @param {Function} props.onClose - Handler menutup pratinjau.
 * @param {object} props.draftProduct - Data furnitur yang sedang disunting di Seller Studio.
 * @returns {JSX.Element | null} Elemen modal atau `null`.
 */
export function StorefrontPreviewModal({ isOpen, onClose, draftProduct }) {
  if (!isOpen || !draftProduct) return null
  const stockMeta = getStockMeta(Number(draftProduct.stock) || 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[680px] overflow-hidden rounded-[24px] border border-[#e8e5df] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e6e6e9] px-6 py-4">
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#71717a]">
            CUSTOMER STOREFRONT PREVIEW
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f7] cursor-pointer"
            aria-label="Tutup pratinjau"
          >
            <img src={ICONS.close} alt="Close" width={14} height={14} className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
          <div className="aspect-square overflow-hidden rounded-[18px] bg-[#f5f5f7]">
            <img
              src={draftProduct.image}
              alt={draftProduct.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BadgeChip tone="neutral">{draftProduct.category}</BadgeChip>
                <BadgeChip tone={stockMeta.tone}>{stockMeta.label}</BadgeChip>
              </div>
              <h3 className="mt-3 text-[24px] font-normal tracking-[-0.6px] text-[#111111]">
                {draftProduct.name || 'Untitled piece'}
              </h3>
              <p className="mt-1 text-[18px] font-medium text-[#111111]">
                {formatRupiah(draftProduct.price || 0)}
              </p>
              <p className="mt-3 text-[13px] leading-[1.6] text-[#71717a]">
                {draftProduct.summary || 'Crafted in small batches for enduring everyday warmth.'}
              </p>
              <div className="mt-4 rounded-xl bg-[#f5f5f7] p-3 text-[12px] text-[#111111]">
                <span className="text-[#71717a]">Dimensions: </span>
                {draftProduct.dimensions?.width || 72} × {draftProduct.dimensions?.depth || 78} ×{' '}
                {draftProduct.dimensions?.height || 76} cm
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-5 h-11 w-full rounded-full bg-[#141414] text-[13px] font-medium text-white hover:bg-[#27272a] cursor-pointer"
            >
              Close preview & keep editing
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Komponen internal formulir kredensial login dummy (Pembeli & Penjual) di dalam SignInModal.
 * Dipisahkan agar state form (`email`, `password`, `error`) otomatis segar lewat prop `key` setiap kali modal/tab dibuka.
 *
 * @param {object} props - Properti SignInCredentialForm.
 * @param {'customer' | 'seller'} props.initialRole - Tab peran awal saat form dibuka.
 * @param {string} [props.authNotice=''] - Pesan konteks opsional (misal saat membuka Seller Workspace sebagai guest).
 * @param {object | null} props.currentUser - Sesi akun aktif saat ini jika user sedang login dan ingin beralih akun.
 * @param {Function} props.onClose - Menutup modal.
 * @param {Function} props.onSignInSuccess - Callback setelah kredensial dummy berhasil diverifikasi.
 * @param {Function} props.onSignOut - Callback keluar dari sesi aktif.
 * @param {Function} props.onNavigatePage - Callback berpindah halaman cepat untuk user yang sudah login.
 * @returns {JSX.Element} Konten form login dummy atau panel status sesi aktif.
 */
function SignInModalContent({
  initialRole,
  authNotice,
  currentUser,
  onClose,
  onSignInSuccess,
  onSignOut,
  onNavigatePage,
}) {
  const [selectedRole, setSelectedRole] = useState(initialRole || 'customer')
  const [showCredentialForm, setShowCredentialForm] = useState(!currentUser || Boolean(authNotice))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const demoAccount = DUMMY_ACCOUNTS[selectedRole]

  /**
   * Mengganti tab peran login (Pembeli vs Penjual) dan mereset pesan error sebelumnya.
   *
   * @param {'customer' | 'seller'} nextRole - Peran tujuan yang diklik pengguna.
   */
  const handleRoleTabChange = (nextRole) => {
    setSelectedRole(nextRole)
    setEmail('')
    setPassword('')
    setErrorMsg('')
  }

  /**
   * Mengisi otomatis kolom Email & Password menggunakan kredensial dummy peran aktif
   * untuk mempermudah pengujian cepat di frontend.
   */
  const handleFillDemo = () => {
    setEmail(demoAccount.email)
    setPassword(demoAccount.password)
    setErrorMsg('')
  }

  /**
   * Memproses submit form login, memvalidasi kredensial dummy via `authenticateDummyAccount()`,
   * lalu meneruskan hasil sukses atau menampilkan error di form.
   *
   * @param {React.FormEvent} event - Event submit form login.
   */
  const handleFormSubmit = (event) => {
    event.preventDefault()
    const result = authenticateDummyAccount({
      role: selectedRole,
      email,
      password,
    })

    if (!result.ok) {
      setErrorMsg(result.error)
      return
    }

    onSignInSuccess(result.user)
  }

  return (
    <div className="w-full max-w-[480px] rounded-[24px] border border-[#e6e6e9] bg-white p-6 sm:p-7 shadow-2xl">
      {/* Header Modal */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#71717a]">
            STILL ACCOUNT · DUMMY AUTH
          </p>
          <h2 className="mt-1 text-[24px] font-normal tracking-[-0.6px] text-[#111111]">
            {showCredentialForm ? 'Sign in to STILL.' : 'Your active session.'}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f5f5f7] hover:bg-[#e6e6e9] cursor-pointer"
          aria-label="Tutup modal Sign In"
        >
          <img src={ICONS.close} alt="Close" width={14} height={14} className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Banner Informasi Jika Dialihkan dari Halaman Terproteksi */}
      {authNotice ? (
        <div className="mt-4 rounded-[14px] border border-[#e8e5df] bg-[#faf9f6] px-4 py-3 text-[12px] leading-[1.5] text-[#8c6239]">
          {authNotice}
        </div>
      ) : null}

      {/* TAMPILAN 1: STATUS SESI AKTIF (JIKA SUDAH LOGIN DAN TIDAK SEDANG GANTI AKUN) */}
      {currentUser && !showCredentialForm ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-[18px] border border-[#e6e6e9] bg-[#f5f5f7] p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[#376b56]">
                <span className="h-2 w-2 rounded-full bg-[#376b56]" />
                Signed in as {currentUser.roleLabel}
              </span>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-medium text-[#111111] border border-[#e6e6e9]">
                {currentUser.role === 'seller' ? 'SELLER WORKSPACE' : 'STOREFRONT'}
              </span>
            </div>
            <p className="mt-2.5 text-[18px] font-medium text-[#111111]">{currentUser.name}</p>
            <p className="text-[12px] text-[#71717a]">{currentUser.email}</p>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {currentUser.role === 'seller' ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onNavigatePage('seller-inventory')
                  }}
                  className="h-11 rounded-full bg-[#141414] px-4 text-[12px] font-medium text-white hover:bg-[#27272a] cursor-pointer"
                >
                  Open Seller Inventory
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onNavigatePage('seller-studio')
                  }}
                  className="h-11 rounded-full border border-[#e6e6e9] bg-white px-4 text-[12px] font-medium text-[#111111] hover:bg-[#f5f5f7] cursor-pointer"
                >
                  Open Seller Studio
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onNavigatePage('shop')
                  }}
                  className="h-11 rounded-full bg-[#141414] px-4 text-[12px] font-medium text-white hover:bg-[#27272a] cursor-pointer"
                >
                  Browse Furniture
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onNavigatePage('checkout')
                  }}
                  className="h-11 rounded-full border border-[#e6e6e9] bg-white px-4 text-[12px] font-medium text-[#111111] hover:bg-[#f5f5f7] cursor-pointer"
                >
                  Go to Checkout
                </button>
              </>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-[#e6e6e9] pt-4 text-[12px]">
            <button
              type="button"
              onClick={() => {
                setSelectedRole(currentUser.role === 'seller' ? 'customer' : 'seller')
                setShowCredentialForm(true)
              }}
              className="font-medium text-[#111111] underline underline-offset-4 hover:opacity-70 cursor-pointer"
            >
              Switch to {currentUser.role === 'seller' ? 'Pembeli' : 'Penjual'} account
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-full bg-[#fcedec] px-4 py-2 font-medium text-[#9b3f3f] hover:bg-[#f9dcd9] cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        /* TAMPILAN 2: FORM LOGIN KREDENSIAL DUMMY (PEMBELI vs PENJUAL) */
        <form onSubmit={handleFormSubmit} className="mt-5">
          {/* Pilihan Peran (2 Tab: Pembeli & Penjual) */}
          <div className="grid grid-cols-2 gap-1.5 rounded-full border border-[#e6e6e9] bg-[#f5f5f7] p-1">
            {[
              { id: 'customer', title: 'Pembeli', subtitle: 'Buyer' },
              { id: 'seller', title: 'Penjual', subtitle: 'Seller' },
            ].map((roleTab) => {
              const active = selectedRole === roleTab.id
              return (
                <button
                  key={roleTab.id}
                  type="button"
                  onClick={() => handleRoleTabChange(roleTab.id)}
                  className={`rounded-full py-2.5 text-[12px] font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-[#141414] text-white shadow-xs'
                      : 'text-[#71717a] hover:text-[#111111]'
                  }`}
                >
                  {roleTab.title} ({roleTab.subtitle})
                </button>
              )
            })}
          </div>

          {/* Kotak Bantuan Kredensial Dummy Sesuai Peran Aktif */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-[#e8e5df] bg-[#faf9f6] px-4 py-3">
            <div className="text-[11px] leading-[1.5] text-[#716b63]">
              <p className="font-medium uppercase tracking-[0.08em] text-[#8c6239]">
                DEMO CREDENTIALS ({demoAccount.roleLabel})
              </p>
              <p className="mt-0.5 text-[#1a1a1a]">
                Email: <code className="font-mono font-medium">{demoAccount.email}</code>
              </p>
              <p className="text-[#1a1a1a]">
                Password: <code className="font-mono font-medium">{demoAccount.password}</code>
              </p>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="rounded-full border border-[#1a1a1a] bg-white px-3.5 py-1.5 text-[11px] font-medium text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors cursor-pointer"
            >
              Isi Otomatis
            </button>
          </div>

          {/* Input Email & Password */}
          <div className="mt-4 space-y-3.5">
            <div>
              <label htmlFor="dummy-login-email" className="block text-[11px] font-medium text-[#71717a]">
                Email Address
              </label>
              <input
                id="dummy-login-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errorMsg) setErrorMsg('')
                }}
                placeholder={demoAccount.email}
                className="mt-1.5 h-11 w-full rounded-xl border border-[#e6e6e9] bg-[#fafafa] px-4 text-[13px] text-[#111111] focus:border-[#141414] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="dummy-login-password"
                  className="block text-[11px] font-medium text-[#71717a]"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-[11px] font-medium text-[#71717a] hover:text-[#111111] cursor-pointer"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="dummy-login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errorMsg) setErrorMsg('')
                }}
                placeholder="Enter demo password"
                className="mt-1.5 h-11 w-full rounded-xl border border-[#e6e6e9] bg-[#fafafa] px-4 text-[13px] text-[#111111] focus:border-[#141414] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Pesan Error Validasi Kredensial */}
          {errorMsg ? (
            <div className="mt-3.5 rounded-xl bg-[#fcedec] px-3.5 py-2.5 text-[12px] text-[#9b3f3f]">
              {errorMsg}
            </div>
          ) : null}

          {/* Tombol Submit Login */}
          <ActionPillButton
            type="submit"
            label={`Sign In as ${demoAccount.roleLabel}`}
            variant="dark"
            className="mt-5 w-full"
          />

          {currentUser ? (
            <button
              type="button"
              onClick={() => setShowCredentialForm(false)}
              className="mt-3 w-full text-center text-[12px] text-[#71717a] hover:text-[#111111] cursor-pointer"
            >
              ← Back to current session ({currentUser.email})
            </button>
          ) : null}
        </form>
      )}
    </div>
  )
}

/**
 * Modal Sign In dengan kredensial dummy untuk peran Pembeli (`buyer@still.co.id`)
 * dan Penjual (`seller@still.co.id`), sekaligus manajemen sesi aktif & Sign Out.
 *
 * @param {object} props - Properti SignInModal.
 * @param {boolean} props.isOpen - Status tampil modal.
 * @param {'customer' | 'seller'} [props.initialRole='customer'] - Tab login awal saat modal dibuka.
 * @param {string} [props.authNotice=''] - Catatan konteks saat dialihkan dari halaman terproteksi.
 * @param {object | null} props.currentUser - Sesi akun aktif atau `null` jika belum login.
 * @param {Function} props.onClose - Menutup modal.
 * @param {Function} props.onSignInSuccess - Dipanggil saat autentikasi dummy berhasil.
 * @param {Function} props.onSignOut - Dipanggil saat pengguna menekan Sign Out.
 * @param {Function} props.onNavigatePage - Dipanggil untuk menavigasi dari menu sesi aktif.
 * @returns {JSX.Element | null} Elemen modal Sign In atau `null`.
 */
export function SignInModal({
  isOpen,
  initialRole = 'customer',
  authNotice = '',
  currentUser,
  onClose,
  onSignInSuccess,
  onSignOut,
  onNavigatePage,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">
      <SignInModalContent
        key={`${initialRole}-${currentUser?.email || 'guest'}-${authNotice}`}
        initialRole={initialRole}
        authNotice={authNotice}
        currentUser={currentUser}
        onClose={onClose}
        onSignInSuccess={onSignInSuccess}
        onSignOut={onSignOut}
        onNavigatePage={onNavigatePage}
      />
    </div>
  )
}

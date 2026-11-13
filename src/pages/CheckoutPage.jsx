/**
 * @fileoverview Halaman Pembayaran (`04 — Checkout / Secure payment` + `09 / Checkout — Warm Editorial`).
 *
 * Menggabungkan kelengkapan form pengiriman Screen 04 dan kehangatan UI Screen 09:
 * 1. Ringkasan alamat pengiriman (`DELIVERING TO` + tombol `Edit` yang membuka form alamat lengkap).
 * 2. Pilihan layanan pengiriman tambahan (`Delivery Add-ons`: White Glove Delivery & On-site Assembly).
 * 3. Tab metode pembayaran interaktif: `QRIS` (logo resmi Bank Indonesia, kode QR demo,
 *    timer hitung mundur 14:59 langsung, tombol `Copy Amount`, serta chip e-wallet),
 *    `Virtual Account` (BCA/Mandiri/BNI VA + Copy), dan `Bank Transfer` (BCA/Mandiri/BNI rekening manual).
 * 4. Panel kanan berisi ringkasan item keranjang, kode promo (`STILL10`), rincian total,
 *    tombol `Place Order`, dan tautan bantuan langsung ke `STILL Concierge`.
 */

import { useEffect, useState } from 'react'
import { ICONS } from '../assets/assetMap'
import { ActionPillButton } from '../components/ui/Buttons'
import {
  BANK_TRANSFER_OPTIONS,
  DELIVERY_ADDONS,
  QRIS_PROVIDERS,
  formatRupiah,
} from '../data/furnitureData'

const INITIAL_QRIS_SECONDS = 14 * 60 + 59 // 14:59 sesuai tampilan Figma 09

/**
 * Memformat detik tersisa menjadi teks `MM:SS` untuk hitung mundur pembayaran QRIS.
 *
 * @param {number} totalSeconds - Jumlah detik tersisa.
 * @returns {string} Format waktu dua digit per unit, misal `"14:59"`.
 */
function formatCountdown(totalSeconds) {
  const safe = Math.max(0, totalSeconds)
  const minutes = String(Math.floor(safe / 60)).padStart(2, '0')
  const seconds = String(safe % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

/**
 * Merender halaman Checkout responsif dengan kalkulasi biaya real-time dan interaksi pembayaran lengkap.
 *
 * @param {object} props - Properti CheckoutPage.
 * @param {Array<object>} props.cartItems - Daftar item furnitur di dalam keranjang.
 * @param {Function} props.onUpdateQty - Handler ubah kuantitas langsung di ringkasan Checkout.
 * @param {Function} props.onNavigate - Handler kembali ke Shop atau Home.
 * @param {Function} props.onPlaceOrder - Handler konfirmasi pesanan yang membuka `OrderReservedModal`.
 * @param {Function} props.onOpenConcierge - Handler membuka drawer STILL Concierge.
 * @param {object | null} [props.currentUser] - Sesi akun pengguna aktif untuk pengisian awal alamat Pembeli.
 * @returns {JSX.Element} Elemen halaman Checkout.
 */
export default function CheckoutPage({
  cartItems,
  onUpdateQty,
  onNavigate,
  onPlaceOrder,
  onOpenConcierge,
  currentUser,
}) {
  // State alamat pengiriman (`isEditingAddress` beralih antara kartu ringkas 09 vs form lengkap 04)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [address, setAddress] = useState(() => ({
    fullName: currentUser?.role === 'customer' ? currentUser.name : 'Ayu Prameswari',
    phone: currentUser?.phone || '+62 812 9400 1122',
    email: currentUser?.role === 'customer' ? currentUser.email : 'ayu.prameswari@studio.id',
    street: currentUser?.street || 'Jl. Gunawarman No. 42, Kebayoran Baru',
    city: currentUser?.city || 'Jakarta Selatan',
    postalCode: currentUser?.postalCode || '12110',
    notes: 'Please call security at the main lobby gate before arriving.',
  }))

  // Layanan pengiriman tambahan
  const [selectedAddons, setSelectedAddons] = useState(['white-glove'])

  // Metode pembayaran aktif ('qris' | 'va' | 'bank')
  const [paymentMethod, setPaymentMethod] = useState('qris')
  const [selectedBankId, setSelectedBankId] = useState('bca')
  const [qrisSecondsLeft, setQrisSecondsLeft] = useState(INITIAL_QRIS_SECONDS)
  const [copiedKey, setCopiedKey] = useState('')

  // Promo code state (`STILL10` memberi potongan 10%)
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState('')
  const [promoError, setPromoError] = useState('')

  /**
   * Menjalankan timer hitung mundur setiap 1 detik khusus saat tab QRIS aktif.
   */
  useEffect(() => {
    if (paymentMethod !== 'qris') return undefined
    const intervalId = setInterval(() => {
      setQrisSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(intervalId)
  }, [paymentMethod])

  /**
   * Menyalin teks ke clipboard sistem (nominal QRIS, nomor VA, atau rekening) dengan fallback aman.
   *
   * @param {string} key - Identifier tombol yang ditekan untuk badge "Copied!".
   * @param {string} value - Teks yang ingin disalin.
   */
  const handleCopyText = async (key, value) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Abaikan jika browser membatasi clipboard API di mode tertentu
    }
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(''), 1800)
  }

  /**
   * Mengaktifkan atau menonaktifkan salah satu layanan tambahan pengiriman (`Delivery Add-ons`).
   *
   * @param {string} addonId - ID layanan add-on.
   */
  const toggleAddon = (addonId) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    )
  }

  /**
   * Memvalidasi dan menerapkan kode kupon promosi (`STILL10`).
   *
   * @param {React.FormEvent} event - Event submit form promo.
   */
  const handleApplyPromo = (event) => {
    event.preventDefault()
    const normalized = promoInput.trim().toUpperCase()
    if (!normalized) return
    if (normalized === 'STILL10') {
      setAppliedPromo('STILL10')
      setPromoError('')
    } else {
      setAppliedPromo('')
      setPromoError('Invalid code. Try "STILL10" for 10% off.')
    }
  }

  // Kalkulasi finansial pesanan
  const merchandiseSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const addonsTotal = DELIVERY_ADDONS.filter((addon) => selectedAddons.includes(addon.id)).reduce(
    (sum, addon) => sum + addon.price,
    0
  )
  const standardCourierFee = merchandiseSubtotal >= 5000000 || merchandiseSubtotal === 0 ? 0 : 150000
  const promoDiscount = appliedPromo === 'STILL10' ? Math.round(merchandiseSubtotal * 0.1) : 0
  const grandTotal = Math.max(0, merchandiseSubtotal + addonsTotal + standardCourierFee - promoDiscount)

  const activeBank =
    BANK_TRANSFER_OPTIONS.find((bank) => bank.id === selectedBankId) || BANK_TRANSFER_OPTIONS[0]

  const vaNumbers = {
    bca: '8808 1200 0010 24',
    mandiri: '8902 1200 0010 24',
    bni: '8277 1200 0010 24',
  }

  /**
   * Mengumpulkan ringkasan final pesanan lalu memicu modal konfirmasi reservasi order.
   */
  const handleSubmitOrder = () => {
    if (cartItems.length === 0) return
    const methodLabel =
      paymentMethod === 'qris'
        ? 'QRIS Instant Pay'
        : paymentMethod === 'va'
          ? `${activeBank.name} Virtual Account`
          : `${activeBank.name} Bank Transfer`

    onPlaceOrder({
      orderId: `STL-${String(Math.floor(100000 + Math.random() * 900000))}`,
      recipient: address.fullName,
      methodLabel,
      total: grandTotal,
    })
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] pb-16 pt-8 text-[#1a1a1a]">
      <main className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        {/* Header Checkout & Tautan Concierge */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#e8e5df] pb-6 sm:flex-row sm:items-end">
          <div>
            <button
              type="button"
              onClick={() => onNavigate('shop')}
              className="inline-flex items-center gap-2 text-[12px] text-[#716b63] hover:text-[#1a1a1a] cursor-pointer"
            >
              <span>←</span>
              <span>Back to catalog</span>
            </button>
            <h1 className="mt-2 text-[32px] sm:text-[42px] font-normal tracking-[-1.2px] text-[#1a1a1a]">
              Secure checkout.
            </h1>
          </div>

          <button
            type="button"
            onClick={() => onOpenConcierge()}
            className="inline-flex items-center gap-2 rounded-full border border-[#e8e5df] bg-white px-4 py-2.5 text-[12px] font-medium text-[#1a1a1a] hover:bg-[#f5f3ef] cursor-pointer"
          >
            <span className="h-2 w-2 rounded-full bg-[#2e7d32]" />
            <span>Help with your order? STILL Concierge ↗</span>
          </button>
        </div>

        {/* Konten 2 Kolom */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* KOLOM KIRI: Alamat + Add-on + Pembayaran */}
          <div className="space-y-6 lg:col-span-7">
            {/* 01. DELIVERING TO / SHIPPING ADDRESS */}
            <section className="rounded-[20px] border border-[#e8e5df] bg-white p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#8c6239]">
                    01 · DELIVERING TO
                  </p>
                  <h2 className="mt-1 text-[18px] font-normal text-[#1a1a1a]">
                    Shipping destination
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingAddress((prev) => !prev)}
                  className="rounded-full border border-[#e8e5df] bg-[#faf9f6] px-4 py-1.5 text-[12px] font-medium text-[#1a1a1a] hover:bg-[#f5f3ef] cursor-pointer"
                >
                  {isEditingAddress ? 'Done' : 'Edit'}
                </button>
              </div>

              {isEditingAddress ? (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-medium text-[#716b63]">Full Name</label>
                    <input
                      type="text"
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      className="mt-1.5 h-11 w-full rounded-xl border border-[#e8e5df] bg-[#faf9f6] px-3.5 text-[13px] focus:border-[#1a1a1a] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#716b63]">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="mt-1.5 h-11 w-full rounded-xl border border-[#e8e5df] bg-[#faf9f6] px-3.5 text-[13px] focus:border-[#1a1a1a] focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-[#716b63]">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="mt-1.5 h-11 w-full rounded-xl border border-[#e8e5df] bg-[#faf9f6] px-3.5 text-[13px] focus:border-[#1a1a1a] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#716b63]">City</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="mt-1.5 h-11 w-full rounded-xl border border-[#e8e5df] bg-[#faf9f6] px-3.5 text-[13px] focus:border-[#1a1a1a] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#716b63]">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={address.postalCode}
                      onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                      className="mt-1.5 h-11 w-full rounded-xl border border-[#e8e5df] bg-[#faf9f6] px-3.5 text-[13px] focus:border-[#1a1a1a] focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-[#716b63]">
                      Delivery Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={address.notes}
                      onChange={(e) => setAddress({ ...address, notes: e.target.value })}
                      className="mt-1.5 h-11 w-full rounded-xl border border-[#e8e5df] bg-[#faf9f6] px-3.5 text-[13px] focus:border-[#1a1a1a] focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-[14px] border border-[#e8e5df] bg-[#faf9f6] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[14px] font-medium text-[#1a1a1a]">{address.fullName}</p>
                    <p className="text-[12px] text-[#716b63]">{address.phone}</p>
                  </div>
                  <p className="mt-1.5 text-[13px] text-[#716b63]">
                    {address.street}, {address.city} {address.postalCode}
                  </p>
                  {address.notes ? (
                    <p className="mt-1 text-[11px] text-[#8c6239]">Note: {address.notes}</p>
                  ) : null}
                </div>
              )}
            </section>

            {/* 02. DELIVERY ADD-ONS (Screen 09 Warm Checkout) */}
            <section className="rounded-[20px] border border-[#e8e5df] bg-white p-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#8c6239]">
                02 · DELIVERY CARE
              </p>
              <h2 className="mt-1 text-[18px] font-normal text-[#1a1a1a]">
                White-glove placement & assembly
              </h2>

              <div className="mt-4 space-y-3">
                {DELIVERY_ADDONS.map((addon) => {
                  const checked = selectedAddons.includes(addon.id)
                  return (
                    <label
                      key={addon.id}
                      className={`flex items-start justify-between gap-4 rounded-[14px] border p-4 transition-colors cursor-pointer ${
                        checked
                          ? 'border-[#1a1a1a] bg-[#faf9f6]'
                          : 'border-[#e8e5df] bg-white hover:bg-[#faf9f6]/60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAddon(addon.id)}
                          className="mt-1 h-4 w-4 accent-[#1a1a1a] rounded cursor-pointer"
                        />
                        <div>
                          <p className="text-[14px] font-medium text-[#1a1a1a]">{addon.title}</p>
                          <p className="mt-0.5 text-[12px] text-[#716b63]">{addon.description}</p>
                        </div>
                      </div>
                      <span className="shrink-0 text-[13px] font-medium text-[#1a1a1a]">
                        +{formatRupiah(addon.price)}
                      </span>
                    </label>
                  )
                })}
              </div>
            </section>

            {/* 03. PAYMENT METHOD (QRIS, Virtual Account, Bank Transfer) */}
            <section className="rounded-[20px] border border-[#e8e5df] bg-white p-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#8c6239]">
                03 · PAYMENT METHOD
              </p>
              <h2 className="mt-1 text-[18px] font-normal text-[#1a1a1a]">Choose how to settle</h2>

              {/* Tabs Pemilih Metode Pembayaran */}
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-full border border-[#e8e5df] bg-[#f5f3ef] p-1">
                {[
                  { id: 'qris', label: 'QRIS' },
                  { id: 'va', label: 'Virtual Account' },
                  { id: 'bank', label: 'Bank Transfer' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPaymentMethod(tab.id)}
                    className={`rounded-full py-2.5 text-[12px] font-medium transition-all cursor-pointer ${
                      paymentMethod === tab.id
                        ? 'bg-[#1a1a1a] text-white shadow-xs'
                        : 'text-[#716b63] hover:text-[#1a1a1a]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Konten Tab QRIS */}
              {paymentMethod === 'qris' ? (
                <div className="mt-6 flex flex-col items-center rounded-[18px] border border-[#e8e5df] bg-[#faf9f6] p-6 text-center">
                  <div className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-[#e8e5df] pb-4">
                    {/* Logo QRIS Resmi (mempertahankan orientasi dari vektor Figma) */}
                    <img
                      src={ICONS.qrisBiLogo}
                      alt="QRIS Bank Indonesia"
                      width={108}
                      height={42}
                      className="h-7 w-auto -rotate-180 -scale-x-100"
                    />
                    <span className="rounded-full bg-[#fef3e6] px-3 py-1 text-[11px] font-medium text-[#a16620]">
                      Pay within {formatCountdown(qrisSecondsLeft)}
                    </span>
                  </div>

                  <div className="mt-6 rounded-[18px] border border-[#e8e5df] bg-white p-4 shadow-xs">
                    <img
                      src={ICONS.qrisDemoQr200}
                      alt="Demo QRIS code STILL order"
                      width={200}
                      height={200}
                      className="h-[180px] w-[180px] sm:h-[200px] sm:w-[200px]"
                    />
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <p className="text-[16px] font-medium text-[#1a1a1a]">
                      {formatRupiah(grandTotal)}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCopyText('qris-amount', String(grandTotal))}
                      className="rounded-full border border-[#e8e5df] bg-white px-3.5 py-1.5 text-[11px] font-medium text-[#1a1a1a] hover:bg-[#f5f3ef] cursor-pointer"
                    >
                      {copiedKey === 'qris-amount' ? 'Copied!' : 'Copy Amount'}
                    </button>
                    {qrisSecondsLeft === 0 ? (
                      <button
                        type="button"
                        onClick={() => setQrisSecondsLeft(INITIAL_QRIS_SECONDS)}
                        className="rounded-full bg-[#1a1a1a] px-3.5 py-1.5 text-[11px] font-medium text-white cursor-pointer"
                      >
                        Refresh QR
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {QRIS_PROVIDERS.map((wallet) => (
                      <span
                        key={wallet}
                        className="rounded-full border border-[#e8e5df] bg-white px-3 py-1 text-[11px] text-[#716b63]"
                      >
                        {wallet}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Konten Tab Virtual Account */}
              {paymentMethod === 'va' ? (
                <div className="mt-6 space-y-4 rounded-[18px] border border-[#e8e5df] bg-[#faf9f6] p-5">
                  <div className="flex flex-wrap gap-2">
                    {BANK_TRANSFER_OPTIONS.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBankId(bank.id)}
                        className={`rounded-full px-4 py-2 text-[12px] font-medium transition-colors cursor-pointer ${
                          selectedBankId === bank.id
                            ? 'bg-[#1a1a1a] text-white'
                            : 'border border-[#e8e5df] bg-white text-[#1a1a1a]'
                        }`}
                      >
                        {bank.name} VA
                      </button>
                    ))}
                  </div>

                  <div className="rounded-[14px] border border-[#e8e5df] bg-white p-4">
                    <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#716b63]">
                      {activeBank.name} VIRTUAL ACCOUNT NUMBER
                    </p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono text-[18px] font-semibold tracking-wider text-[#1a1a1a]">
                        {vaNumbers[activeBank.id]}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopyText('va-num', vaNumbers[activeBank.id])}
                        className="rounded-full border border-[#e8e5df] bg-[#faf9f6] px-4 py-1.5 text-[11px] font-medium text-[#1a1a1a] cursor-pointer"
                      >
                        {copiedKey === 'va-num' ? 'Copied!' : 'Copy VA'}
                      </button>
                    </div>
                    <p className="mt-2 text-[12px] text-[#716b63]">
                      Automatic verification within 60 seconds after transfer.
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Konten Tab Bank Transfer */}
              {paymentMethod === 'bank' ? (
                <div className="mt-6 space-y-4 rounded-[18px] border border-[#e8e5df] bg-[#faf9f6] p-5">
                  <div className="flex flex-wrap gap-2">
                    {BANK_TRANSFER_OPTIONS.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                        onClick={() => setSelectedBankId(bank.id)}
                        className={`rounded-full px-4 py-2 text-[12px] font-medium transition-colors cursor-pointer ${
                          selectedBankId === bank.id
                            ? 'bg-[#1a1a1a] text-white'
                            : 'border border-[#e8e5df] bg-white text-[#1a1a1a]'
                        }`}
                      >
                        {bank.name}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-[14px] border border-[#e8e5df] bg-white p-4">
                    <p className="text-[11px] font-medium text-[#716b63]">{activeBank.fullName}</p>
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono text-[18px] font-semibold text-[#1a1a1a]">
                        {activeBank.accountNumber}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopyText('bank-acc', activeBank.accountNumber)}
                        className="rounded-full border border-[#e8e5df] bg-[#faf9f6] px-4 py-1.5 text-[11px] font-medium text-[#1a1a1a] cursor-pointer"
                      >
                        {copiedKey === 'bank-acc' ? 'Copied!' : 'Copy Account'}
                      </button>
                    </div>
                    <p className="mt-2 text-[12px] text-[#716b63]">
                      Beneficiary: <strong className="text-[#1a1a1a]">{activeBank.accountName}</strong>
                    </p>
                  </div>
                </div>
              ) : null}
            </section>
          </div>

          {/* KOLOM KANAN: Ringkasan Pesanan & Kode Promo */}
          <div className="space-y-5 lg:col-span-5">
            <section className="rounded-[20px] border border-[#e8e5df] bg-white p-6">
              <div className="flex items-center justify-between border-b border-[#e8e5df] pb-4">
                <h2 className="text-[18px] font-normal text-[#1a1a1a]">Order summary</h2>
                <span className="text-[12px] text-[#716b63]">{cartItems.length} line items</span>
              </div>

              {cartItems.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-[14px] text-[#716b63]">Your bag is empty.</p>
                  <ActionPillButton
                    label="Browse furniture"
                    variant="warm-light"
                    className="mt-4"
                    onClick={() => onNavigate('shop')}
                  />
                </div>
              ) : (
                <div className="mt-4 space-y-3.5">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.productId}-${item.finishName}`}
                      className="flex items-center gap-3.5 border-b border-[#f0ede6] pb-3.5 last:border-b-0 last:pb-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 shrink-0 rounded-[12px] bg-[#f5f3ef] object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-[#1a1a1a]">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-[#716b63]">{item.finishName}</p>
                        <div className="mt-1.5 inline-flex items-center gap-2 rounded-full border border-[#e8e5df] px-2.5 py-0.5 text-[11px]">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.productId, item.finishName, -1)}
                            className="cursor-pointer"
                          >
                            −
                          </button>
                          <span>{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.productId, item.finishName, 1)}
                            className="cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <p className="text-[13px] font-medium text-[#1a1a1a]">
                        {formatRupiah(item.price * item.qty)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Form Kode Promo */}
              <form onSubmit={handleApplyPromo} className="mt-5 border-t border-[#e8e5df] pt-5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Promo code (try STILL10)"
                    className="h-11 flex-1 rounded-full border border-[#e8e5df] bg-[#faf9f6] px-4 text-[12px] focus:border-[#1a1a1a] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="h-11 rounded-full border border-[#e8e5df] bg-[#f5f3ef] px-5 text-[12px] font-medium text-[#1a1a1a] hover:bg-[#eae5db] cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {appliedPromo ? (
                  <p className="mt-2 text-[11px] font-medium text-[#2e7d32]">
                    ✓ Code {appliedPromo} applied (10% privilege discount)
                  </p>
                ) : null}
                {promoError ? (
                  <p className="mt-2 text-[11px] text-[#9b3f3f]">{promoError}</p>
                ) : null}
              </form>

              {/* Rincian Biaya */}
              <div className="mt-5 space-y-2.5 border-t border-[#e8e5df] pt-5 text-[13px]">
                <div className="flex justify-between text-[#716b63]">
                  <span>Merchandise subtotal</span>
                  <span className="text-[#1a1a1a]">{formatRupiah(merchandiseSubtotal)}</span>
                </div>
                <div className="flex justify-between text-[#716b63]">
                  <span>Standard Jabodetabek courier</span>
                  <span className="text-[#2e7d32]">
                    {standardCourierFee === 0 ? 'Free' : formatRupiah(standardCourierFee)}
                  </span>
                </div>
                <div className="flex justify-between text-[#716b63]">
                  <span>Care & assembly add-ons</span>
                  <span className="text-[#1a1a1a]">{formatRupiah(addonsTotal)}</span>
                </div>
                {promoDiscount > 0 ? (
                  <div className="flex justify-between text-[#2e7d32]">
                    <span>Promo ({appliedPromo})</span>
                    <span>−{formatRupiah(promoDiscount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between border-t border-[#e8e5df] pt-3 text-[16px] font-medium text-[#1a1a1a]">
                  <span>Total to pay</span>
                  <span>{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              <ActionPillButton
                label="Place Order"
                variant="warm-dark"
                disabled={cartItems.length === 0}
                onClick={handleSubmitOrder}
                className="mt-6 w-full"
              />
            </section>

            {/* Kartu Gelap Janji Pengiriman STILL */}
            <div className="rounded-[20px] bg-[#141414] p-6 text-white">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#38bdf8]">
                STILL DELIVERY PROMISE
              </p>
              <p className="mt-2 text-[16px] font-normal leading-[1.4]">
                Insured blanket-wrapped delivery & 14-day calm-home return guarantee.
              </p>
              <p className="mt-2 text-[12px] text-[#a1a1aa]">
                Estimated arrival: 2–4 business days inside Jabodetabek & Bandung.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

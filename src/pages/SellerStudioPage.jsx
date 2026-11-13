/**
 * @fileoverview Halaman Studio Penambahan & Penyuntingan Furnitur (`06 — Seller / Add furniture` + `10 / Seller studio`).
 *
 * Memadukan form editorial bertahap dari Figma Screen 06 & Warm Live Studio Screen 10:
 * - Beralih mulus antara mode `Create New Piece` dan `Edit Existing` (beserta pemilih produk bila Edit).
 * - Bagian bernomor:
 *   `01 Essentials` (Nama, SKU, Kategori, Ruangan, Harga IDR, Stok)
 *   `02 Size & Materials` (Dimensi P×L×T, Tinggi Dudukan, tag pilihan material kayu/kain)
 *   `03 Tell its story` (Deskripsi naratif editorial produk)
 *   `04 Product photography` (Pemilih 4 slot foto + unggah foto lokal dari perangkat)
 * - Panel kanan **Live Storefront Preview** (`10 Seller studio`) yang langsung berubah real-time saat mengetik!
 * - Tombol `Preview Modal`, `Save Draft`, dan `Publish to Storefront` yang benar-benar menambah/memperbarui katalog.
 */

import { useRef, useState } from 'react'
import { ICONS, IMAGES } from '../assets/assetMap'
import SellerSidebar from '../components/seller/SellerSidebar'
import { ActionPillButton, BadgeChip } from '../components/ui/Buttons'
import { formatRupiah, getStockMeta } from '../data/furnitureData'

const MATERIAL_CHOICES = [
  'Natural materials',
  'Solid wood',
  'Bouclé fabric',
  'Steel & stone',
  'Linen blend',
]

const STUDIO_IMAGE_PRESETS = [
  { id: 'forma', label: 'Forma Lounge', src: IMAGES.formaLoungeChair },
  { id: 'luma', label: 'Luma Sofa', src: IMAGES.lumaModularSofa },
  { id: 'arc', label: 'Arc Coffee Table', src: IMAGES.arcCoffeeTable },
  { id: 'linea', label: 'Linea Sideboard', src: IMAGES.lineaSideboard },
]

/**
 * Menghasilkan objek nilai awal form Studio berdasarkan produk yang dipilih (mode Edit)
 * atau nilai templat kosong bersih (mode Buat Baru).
 *
 * @param {object | null} editingProduct - Objek produk eksisting jika dalam mode Edit.
 * @returns {object} State awal seluruh field form Studio.
 */
function buildInitialFormState(editingProduct) {
  if (editingProduct) {
    return {
      name: editingProduct.name,
      sku: editingProduct.sku,
      category: editingProduct.category,
      room: editingProduct.room || 'Living room',
      price: String(editingProduct.price),
      stock: String(editingProduct.stock),
      width: String(editingProduct.dimensions?.width || 72),
      depth: String(editingProduct.dimensions?.depth || 78),
      height: String(editingProduct.dimensions?.height || 76),
      seatHeight: String(editingProduct.dimensions?.seatHeight || 42),
      materials: editingProduct.materials || ['Natural materials', 'Solid wood'],
      summary: editingProduct.summary || '',
      image: editingProduct.image || IMAGES.formaLoungeChair,
    }
  }

  return {
    name: 'Kanso timber bench',
    sku: 'KAN-014',
    category: 'Seating',
    room: 'Dining room',
    price: '3250000',
    stock: '14',
    width: '135',
    depth: '40',
    height: '45',
    seatHeight: '45',
    materials: ['Natural materials', 'Solid wood'],
    summary:
      'Low architectural hallway or dining bench sculpted from solid sustainably harvested white oak.',
    image: IMAGES.arcCoffeeTable,
  }
}

/**
 * Merender halaman Seller Add / Edit Furniture Studio.
 * Parent menyematkan `key={editingProductId || 'new'}` agar state form tersinkron bersih saat berganti target produk.
 *
 * @param {object} props - Properti SellerStudioPage.
 * @param {Array<object>} props.products - Daftar seluruh produk saat ini (untuk pemilih Edit Existing).
 * @param {object | null} props.editingProduct - Produk yang sedang diedit, atau `null` jika membuat baru.
 * @param {Function} props.onSwitchEditTarget - Mengganti mode antara Buat Baru vs produk eksisting tertentu.
 * @param {Function} props.onSaveProduct - Menyimpan produk ke katalog utama & memunculkan `ProductSavedModal`.
 * @param {Function} props.onOpenPreviewModal - Membuka `StorefrontPreviewModal`.
 * @param {Function} props.onBackToInventory - Kembali ke tabel Seller Inventory.
 * @param {Function} props.onViewStorefront - Kembali ke Beranda publik.
 * @param {object | null} [props.currentUser] - Data sesi akun penjual aktif.
 * @param {Function} [props.onSignOut] - Handler keluar dari akun penjual.
 * @returns {JSX.Element} Elemen halaman Seller Studio.
 */
export default function SellerStudioPage({
  products,
  editingProduct,
  onSwitchEditTarget,
  onSaveProduct,
  onOpenPreviewModal,
  onBackToInventory,
  onViewStorefront,
  currentUser,
  onSignOut,
}) {
  const [form, setForm] = useState(() => buildInitialFormState(editingProduct))
  const [validationError, setValidationError] = useState('')
  const fileInputRef = useRef(null)

  const isEditMode = Boolean(editingProduct)

  /**
   * Memperbarui salah satu nilai kolom teks/angka di state `form`.
   *
   * @param {string} field - Nama kunci kolom.
   * @param {string} value - Nilai baru input pengguna.
   */
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (validationError) setValidationError('')
  }

  /**
   * Menambah atau mencabut pilihan tag material dari bagian `02 Size & Materials`.
   *
   * @param {string} material - Nama tag material.
   */
  const toggleMaterial = (material) => {
    setForm((prev) => {
      const exists = prev.materials.includes(material)
      const next = exists
        ? prev.materials.filter((m) => m !== material)
        : [...prev.materials, material]
      return { ...prev, materials: next }
    })
  }

  /**
   * Membaca file foto lokal unggahan seller menjadi Object URL agar langsung terlihat di Live Preview.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - Event input file gambar.
   */
  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const objectUrl = URL.createObjectURL(file)
    updateField('image', objectUrl)
  }

  /**
   * Menyusun objek data produk siap-simpan dari input form saat ini.
   *
   * @param {'Draft' | 'Published'} targetStatus - Status penerbitan produk.
   * @returns {object} Objek produk terstruktur sesuai skema katalog `INITIAL_PRODUCTS`.
   */
  const compileProductPayload = (targetStatus) => {
    const numericPrice = Math.max(0, Number(form.price) || 0)
    const numericStock = Math.max(0, Number(form.stock) || 0)
    const numericW = Math.max(10, Number(form.width) || 72)
    const numericD = Math.max(10, Number(form.depth) || 78)
    const numericH = Math.max(10, Number(form.height) || 76)
    const numericSeat = Math.max(10, Number(form.seatHeight) || 42)

    const sizeTier =
      numericW < 90
        ? 'Compact (< 90cm)'
        : numericW <= 160
          ? 'Medium (90–160cm)'
          : 'Large (> 160cm)'

    const generatedSlug =
      form.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `piece-${Date.now()}`

    return {
      id: editingProduct ? editingProduct.id : `${generatedSlug}-${Date.now().toString().slice(-4)}`,
      sku: form.sku.trim().toUpperCase() || 'STL-NEW',
      name: form.name.trim() || 'Untitled piece',
      category: form.category,
      room: form.room,
      collectionTag: editingProduct?.collectionTag || 'THE NATURAL COLLECTION',
      price: numericPrice,
      stock: numericStock,
      status: targetStatus,
      rating: editingProduct?.rating || 5.0,
      reviewsCount: editingProduct?.reviewsCount || 1,
      materials: form.materials.length > 0 ? form.materials : ['Natural materials'],
      dimensions: {
        width: numericW,
        depth: numericD,
        height: numericH,
        seatHeight: numericSeat,
        boxSize: `${numericW + 8} × ${numericD + 8} × ${numericH + 8} cm`,
      },
      sizeTier,
      finishes: editingProduct?.finishes || [
        { id: 'walnut-natural', name: 'Natural finish', swatch: '#8c6239', accent: '#dfd9ce' },
        { id: 'white-oak', name: 'White oak', swatch: '#cbb38f', accent: '#f1ede4' },
      ],
      image: form.image,
      gallery: [
        { id: 'primary', label: 'Primary view', src: form.image },
        ...(editingProduct?.gallery?.slice(1) || []),
      ],
      summary: form.summary.trim(),
      specs: editingProduct?.specs || [
        { label: 'MATERIALS', value: form.materials.join(', ') || 'Kiln-dried solid hardwood' },
        { label: 'DIMENSIONS', value: `${numericW} × ${numericD} × ${numericH} cm` },
        { label: 'ROOM PAIRING', value: `${form.room} · ${form.category}` },
        { label: 'WARRANTY', value: '3-year structural joinery warranty' },
      ],
    }
  }

  /**
   * Memvalidasi field wajib (Nama & Harga) sebelum meneruskan data ke handler penyimpanan aplikasi.
   *
   * @param {'Draft' | 'Published'} targetStatus - Status simpan Draf atau Terbitkan.
   */
  const handleSubmit = (targetStatus) => {
    if (!form.name.trim()) {
      setValidationError('Please enter a furniture name in 01 Essentials before saving.')
      return
    }
    if (Number(form.price) <= 0) {
      setValidationError('Price must be greater than Rp 0.')
      return
    }
    const payload = compileProductPayload(targetStatus)
    onSaveProduct(payload, isEditMode)
  }

  const previewStockMeta = getStockMeta(Number(form.stock) || 0)

  return (
    <div className="flex min-h-screen flex-col bg-[#faf9f6] text-[#1a1a1a] lg:flex-row">
      <SellerSidebar
        activeSection="studio"
        onSelectSection={(sec) => {
          if (sec !== 'studio') onBackToInventory()
        }}
        onViewStorefront={onViewStorefront}
        currentUser={currentUser}
        onSignOut={onSignOut}
      />

      <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-[1180px]">
          {/* Header Top Bar Studio */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e5df] pb-4 text-[11px] text-[#716b63]">
            <button
              type="button"
              onClick={onBackToInventory}
              className="inline-flex items-center gap-2 font-medium text-[#1a1a1a] hover:text-[#8c6239] cursor-pointer"
            >
              <img src={ICONS.back} alt="" width={14} height={14} className="h-3.5 w-3.5" />
              <span>BACK TO INVENTORY</span>
            </button>
            <p className="uppercase tracking-[0.12em]">
              SELLER STUDIO · {isEditMode ? `EDITING ${editingProduct.sku}` : 'NEW CATALOG PIECE'}
            </p>
          </div>

          {/* Judul + Toggle Mode Create New vs Edit Existing */}
          <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-[32px] sm:text-[40px] font-normal leading-[1.08] tracking-[-1.3px] text-[#1a1a1a]">
                {isEditMode ? `Refine ${editingProduct.name}` : 'Introduce a new piece.'}
              </h1>
              <p className="mt-1.5 text-[13px] text-[#716b63]">
                Craft product specs alongside real-time Customer Storefront Preview before publishing.
              </p>
            </div>

            {/* Pemilih Cepat Create New vs Edit Existing */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onSwitchEditTarget(null)}
                className={`rounded-full px-4 py-2 text-[12px] font-medium transition-colors cursor-pointer ${
                  !isEditMode
                    ? 'bg-[#1a1a1a] text-white'
                    : 'border border-[#e8e5df] bg-white text-[#716b63] hover:text-[#1a1a1a]'
                }`}
              >
                + Create New
              </button>

              <select
                aria-label="Edit existing product"
                value={editingProduct ? editingProduct.id : ''}
                onChange={(e) => onSwitchEditTarget(e.target.value || null)}
                className="h-9 rounded-full border border-[#e8e5df] bg-white px-3.5 text-[12px] font-medium text-[#1a1a1a] focus:outline-none cursor-pointer"
              >
                <option value="">Edit Existing Piece...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    Edit: {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {validationError ? (
            <div className="mt-5 rounded-[14px] border border-[#f2c6c6] bg-[#fcedec] px-4 py-3 text-[13px] text-[#9b3f3f]">
              {validationError}
            </div>
          ) : null}

          {/* GRID 2 KOLOM: FORM EDITOR (KIRI) + LIVE PREVIEW STICKY (KANAN) */}
          <div className="mt-7 grid grid-cols-1 gap-7 lg:grid-cols-12">
            {/* KOLOM FORM EDITOR */}
            <div className="space-y-6 lg:col-span-7">
              {/* 01 ESSENTIALS */}
              <section className="rounded-[20px] border border-[#e8e5df] bg-white p-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#8c6239]">
                  01 · ESSENTIALS
                </p>
                <h2 className="mt-1 text-[18px] font-normal text-[#1a1a1a]">
                  Identity, category & pricing
                </h2>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-[#716b63]">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="e.g. Forma lounge chair"
                      className="mt-1.5 h-11 w-full rounded-xl border border-[#e8e5df] bg-[#faf9f6] px-4 text-[13px] focus:border-[#1a1a1a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#716b63]">SKU Code</label>
                    <input
                      type="text"
                      value={form.sku}
                      onChange={(e) => updateField('sku', e.target.value)}
                      placeholder="FRM-001"
                      className="mt-1.5 h-11 w-full rounded-xl border border-[#e8e5df] bg-[#faf9f6] px-4 text-[13px] uppercase focus:border-[#1a1a1a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#716b63]">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => updateField('category', e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-[#e8e5df] bg-[#faf9f6] px-3.5 text-[13px] focus:outline-none cursor-pointer"
                    >
                      {['Seating', 'Tables', 'Storage', 'Lighting', 'Bedroom'].map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#716b63]">
                      Primary Room
                    </label>
                    <select
                      value={form.room}
                      onChange={(e) => updateField('room', e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-[#e8e5df] bg-[#faf9f6] px-3.5 text-[13px] focus:outline-none cursor-pointer"
                    >
                      {['Living room', 'Dining room', 'Bedroom', 'Workspace'].map((room) => (
                        <option key={room} value={room}>
                          {room}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#716b63]">
                      Price (IDR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50000"
                      value={form.price}
                      onChange={(e) => updateField('price', e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-[#e8e5df] bg-[#faf9f6] px-4 text-[13px] focus:border-[#1a1a1a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#716b63]">
                      Warehouse Stock (Units)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) => updateField('stock', e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-[#e8e5df] bg-[#faf9f6] px-4 text-[13px] focus:border-[#1a1a1a] focus:outline-none"
                    />
                  </div>
                </div>
              </section>

              {/* 02 SIZE & MATERIALS */}
              <section className="rounded-[20px] border border-[#e8e5df] bg-white p-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#8c6239]">
                  02 · SIZE & MATERIALS
                </p>
                <h2 className="mt-1 text-[18px] font-normal text-[#1a1a1a]">
                  Dimensions & finishes
                </h2>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { key: 'width', label: 'Width (cm)' },
                    { key: 'depth', label: 'Depth (cm)' },
                    { key: 'height', label: 'Height (cm)' },
                    { key: 'seatHeight', label: 'Seat H (cm)' },
                  ].map((dim) => (
                    <div key={dim.key}>
                      <label className="block text-[11px] font-medium text-[#716b63]">
                        {dim.label}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={form[dim.key]}
                        onChange={(e) => updateField(dim.key, e.target.value)}
                        className="mt-1.5 h-10 w-full rounded-xl border border-[#e8e5df] bg-[#faf9f6] px-3 text-[13px] focus:border-[#1a1a1a] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <p className="text-[11px] font-medium text-[#716b63]">Materials tags</p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {MATERIAL_CHOICES.map((mat) => {
                      const active = form.materials.includes(mat)
                      return (
                        <button
                          key={mat}
                          type="button"
                          onClick={() => toggleMaterial(mat)}
                          className={`rounded-full px-3.5 py-1.5 text-[12px] transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#1a1a1a] text-white'
                              : 'border border-[#e8e5df] bg-[#faf9f6] text-[#716b63] hover:text-[#1a1a1a]'
                          }`}
                        >
                          {active ? '✓ ' : ''}
                          {mat}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </section>

              {/* 03 TELL ITS STORY */}
              <section className="rounded-[20px] border border-[#e8e5df] bg-white p-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#8c6239]">
                  03 · TELL ITS STORY
                </p>
                <h2 className="mt-1 text-[18px] font-normal text-[#1a1a1a]">
                  Editorial product copy
                </h2>

                <textarea
                  rows={4}
                  value={form.summary}
                  onChange={(e) => updateField('summary', e.target.value)}
                  placeholder="Describe craftsmanship details, timber joinery, and intended room atmosphere..."
                  className="mt-4 w-full rounded-2xl border border-[#e8e5df] bg-[#faf9f6] p-4 text-[13px] leading-[1.6] focus:border-[#1a1a1a] focus:outline-none"
                />
              </section>

              {/* 04 PRODUCT PHOTOGRAPHY */}
              <section className="rounded-[20px] border border-[#e8e5df] bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#8c6239]">
                      04 · PRODUCT PHOTOGRAPHY
                    </p>
                    <h2 className="mt-1 text-[18px] font-normal text-[#1a1a1a]">
                      Studio angle or upload custom image
                    </h2>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-full border border-[#e8e5df] bg-[#faf9f6] px-4 py-2 text-[12px] font-medium text-[#1a1a1a] hover:bg-[#f5f3ef] cursor-pointer"
                  >
                    <img src={ICONS.upload} alt="" width={16} height={16} className="h-4 w-4" />
                    <span>Upload File</span>
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {STUDIO_IMAGE_PRESETS.map((preset) => {
                    const selected = form.image === preset.src
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => updateField('image', preset.src)}
                        className={`overflow-hidden rounded-[14px] border-2 bg-[#faf9f6] text-left transition-all cursor-pointer ${
                          selected ? 'border-[#1a1a1a]' : 'border-transparent hover:border-[#d7d2c8]'
                        }`}
                      >
                        <img
                          src={preset.src}
                          alt={preset.label}
                          className="aspect-square w-full object-cover"
                        />
                        <p className="truncate px-2.5 py-2 text-[11px] font-medium text-[#1a1a1a]">
                          {preset.label}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </section>
            </div>

            {/* KOLOM KANAN: LIVE STOREFRONT PREVIEW (Screen 10 Seller Studio) */}
            <div className="lg:col-span-5">
              <div className="sticky top-6 space-y-5">
                <section className="rounded-[24px] border border-[#e8e5df] bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-[#e8e5df] pb-3.5">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#8c6239]">
                        LIVE STOREFRONT PREVIEW
                      </p>
                      <p className="text-[12px] text-[#716b63]">Updates as you type</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenPreviewModal(compileProductPayload('Published'))}
                      className="rounded-full border border-[#e8e5df] bg-[#faf9f6] px-3.5 py-1.5 text-[11px] font-medium text-[#1a1a1a] hover:bg-[#f5f3ef] cursor-pointer"
                    >
                      Expand Preview ↗
                    </button>
                  </div>

                  {/* Simulasi Kartu Produk Storefront Langsung */}
                  <div className="mt-5 rounded-[20px] bg-[#f5f5f7] p-4">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[14px] bg-white">
                      <img
                        src={form.image}
                        alt={form.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium uppercase text-[#111111]">
                          {form.category}
                        </span>
                        <BadgeChip tone={previewStockMeta.tone}>{previewStockMeta.label}</BadgeChip>
                      </div>
                    </div>

                    <div className="mt-3.5 flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[16px] font-normal text-[#111111]">
                          {form.name || 'Untitled piece'}
                        </p>
                        <p className="mt-0.5 text-[14px] font-medium text-[#71717a]">
                          {formatRupiah(Number(form.price) || 0)}
                        </p>
                      </div>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#141414] text-white">
                        +
                      </span>
                    </div>
                  </div>

                  {/* Ringkasan Dimensi & Material Live */}
                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-[14px] border border-[#e8e5df] bg-[#faf9f6] p-3.5 text-[12px]">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.08em] text-[#716b63]">SKU</p>
                      <p className="mt-0.5 font-medium text-[#1a1a1a]">
                        {form.sku || 'STL-NEW'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.08em] text-[#716b63]">
                        DIMENSIONS
                      </p>
                      <p className="mt-0.5 font-medium text-[#1a1a1a]">
                        {form.width || 0} × {form.depth || 0} × {form.height || 0} cm
                      </p>
                    </div>
                  </div>

                  {/* Tombol Simpan Draft & Publish to Storefront */}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <ActionPillButton
                      label="Save Draft"
                      variant="warm-light"
                      icon="none"
                      className="flex-1"
                      onClick={() => handleSubmit('Draft')}
                    />
                    <ActionPillButton
                      label={isEditMode ? 'Update Product' : 'Publish to Storefront'}
                      variant="warm-dark"
                      className="flex-1"
                      onClick={() => handleSubmit('Published')}
                    />
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

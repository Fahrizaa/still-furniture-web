/**
 * @fileoverview Halaman Manajemen Inventaris Penjual (`05 — Seller / Inventory`).
 *
 * Menerjemahkan Screen 05 Figma ke dalam dashboard workspace penjual interaktif:
 * - Sidebar navigasi bersama (`SellerSidebar`) dengan tab sub-tampilan ringkas bila menu lain diklik.
 * - 4 Kartu metrik stok langsung terhitung otomatis dari state katalog (`Total`, `Active`, `Low`, `Out of Stock`).
 * - Pencarian berdasarkan nama atau SKU, filter kategori & status stok, serta fitur ekspor CSV nyata (`↓ Export`).
 * - Tabel produk dengan stepper stok inline (`− / +`), badge status reaktif, tombol Edit ke Studio, dan Delete modal.
 */

import { useMemo, useState } from 'react'
import { ICONS } from '../assets/assetMap'
import SellerSidebar from '../components/seller/SellerSidebar'
import { ActionPillButton, BadgeChip } from '../components/ui/Buttons'
import { formatRupiah, getStockMeta } from '../data/furnitureData'

const ROWS_PER_PAGE = 6

/**
 * Merender halaman workspace inventaris penjual STILL.
 *
 * @param {object} props - Properti SellerInventoryPage.
 * @param {Array<object>} props.products - Daftar seluruh produk furnitur (storefront + draft/out-of-stock).
 * @param {Function} props.onAdjustStock - Handler menambah/mengurangi jumlah stok (`(productId, delta) => void`).
 * @param {Function} props.onAddNew - Handler menuju halaman `SellerStudio` mode Buat Baru.
 * @param {Function} props.onEditProduct - Handler menuju halaman `SellerStudio` mode Edit untuk ID tertentu.
 * @param {Function} props.onRequestDelete - Handler membuka modal konfirmasi hapus produk.
 * @param {Function} props.onViewStorefront - Handler kembali melihat Storefront publik.
 * @param {Function} props.onNavigate - Handler navigasi halaman studio atau sub-tampilan.
 * @param {object | null} [props.currentUser] - Data sesi akun penjual aktif.
 * @param {Function} [props.onSignOut] - Handler keluar dari akun penjual.
 * @returns {JSX.Element} Elemen workspace inventaris penjual.
 */
export default function SellerInventoryPage({
  products,
  onAdjustStock,
  onAddNew,
  onEditProduct,
  onRequestDelete,
  onViewStorefront,
  onNavigate,
  currentUser,
  onSignOut,
}) {
  const [sidebarTab, setSidebarTab] = useState('inventory')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All categories')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [selectedIds, setSelectedIds] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [exportToast, setExportToast] = useState(false)

  // Menghitung angka metrik dashboard secara dinamis dari daftar `products`
  const metrics = useMemo(() => {
    const activeCount = products.filter((p) => p.stock > 0 && p.status !== 'Draft').length
    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 10).length
    const outOfStockCount = products.filter((p) => p.stock <= 0).length
    const categoriesCount = new Set(products.map((p) => p.category)).size
    return {
      total: products.length,
      activeCount,
      lowStockCount,
      outOfStockCount,
      categoriesCount,
    }
  }, [products])

  // Menyaring daftar baris tabel berdasarkan query pencarian, kategori, dan status
  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return products.filter((item) => {
      if (query) {
        const matchText = `${item.name} ${item.sku} ${item.category}`.toLowerCase()
        if (!matchText.includes(query)) return false
      }

      if (categoryFilter !== 'All categories' && item.category !== categoryFilter) {
        return false
      }

      if (statusFilter !== 'All statuses') {
        const meta = getStockMeta(item.stock)
        if (statusFilter === 'Draft') {
          if (item.status !== 'Draft') return false
        } else if (meta.label !== statusFilter) {
          return false
        }
      }

      return true
    })
  }, [products, searchTerm, categoryFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const visibleRows = filteredRows.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE)

  /**
   * Memilih atau membatalkan pilihan satu baris checkbox di tabel inventaris.
   *
   * @param {string} id - ID produk baris terkait.
   */
  const toggleRowSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    )
  }

  /**
   * Mengekspor data produk yang sedang tampil menjadi file `.csv` langsung dari browser.
   */
  const handleExportCsv = () => {
    const headers = ['SKU', 'Name', 'Category', 'Room', 'Price_IDR', 'Stock', 'Status']
    const csvLines = filteredRows.map((item) =>
      [
        item.sku,
        `"${item.name.replace(/"/g, '""')}"`,
        item.category,
        item.room,
        item.price,
        item.stock,
        item.status === 'Draft' ? 'Draft' : getStockMeta(item.stock).label,
      ].join(',')
    )
    const csvContent = [headers.join(','), ...csvLines].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'still-inventory-export.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setExportToast(true)
    setTimeout(() => setExportToast(false), 2000)
  }

  /**
   * Menangani navigasi item pada SellerSidebar (`studio` -> Add Furniture Studio, lainnya ubah tab view).
   *
   * @param {string} sectionId - ID menu yang ditekan.
   */
  const handleSidebarSelect = (sectionId) => {
    if (sectionId === 'studio') {
      onAddNew()
      return
    }
    setSidebarTab(sectionId)
  }

  const categoryChoices = ['All categories', ...Array.from(new Set(products.map((p) => p.category)))]

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#111111] lg:flex-row">
      <SellerSidebar
        activeSection={sidebarTab}
        onSelectSection={handleSidebarSelect}
        onViewStorefront={onViewStorefront}
        currentUser={currentUser}
        onSignOut={onSignOut}
      />

      <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-[1160px]">
          {/* Top Bar Workspace */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e6e6e9] pb-4 text-[11px] text-[#71717a]">
            <p className="font-medium uppercase tracking-[0.12em]">
              WORKSPACE / {sidebarTab.toUpperCase()}
            </p>
            <p>Help center · EN · Jakarta, ID</p>
          </div>

          {/* Tampilan Sub-Tab Non-Inventory (Overview / Orders / Messages / Analytics / Settings) */}
          {sidebarTab !== 'inventory' ? (
            <section className="mt-8 rounded-[24px] border border-[#e6e6e9] bg-[#fafafa] p-8">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#71717a]">
                SELLER WORKSPACE MODULE
              </p>
              <h1 className="mt-2 text-[32px] font-normal tracking-[-1px] text-[#111111]">
                {sidebarTab.charAt(0).toUpperCase() + sidebarTab.slice(1)} overview
              </h1>
              <p className="mt-2 max-w-xl text-[14px] leading-[1.6] text-[#71717a]">
                {sidebarTab === 'orders'
                  ? 'Recent Jabodetabek & Bandung white-glove orders sync automatically from customer Checkout reservations.'
                  : sidebarTab === 'messages'
                    ? 'Customer inquiries from the STILL Concierge drawer appear in real time for showroom admin follow-up.'
                    : 'All live storefront metrics, stock adjustments, and studio drafts are unified in your Inventory & Add Studio tools.'}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ActionPillButton
                  label="Open Inventory Table"
                  variant="dark"
                  onClick={() => setSidebarTab('inventory')}
                />
                <ActionPillButton
                  label="+ Add New Furniture"
                  variant="light"
                  onClick={() => onNavigate('seller-studio')}
                />
              </div>
            </section>
          ) : (
            <>
              {/* Heading & CTA Tambah Produk */}
              <div className="mt-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <h1 className="text-[32px] sm:text-[40px] font-normal leading-[1.1] tracking-[-1.4px] text-[#111111]">
                    Your collection, in order.
                  </h1>
                  <p className="mt-1.5 text-[13px] text-[#71717a]">
                    Manage the pieces that make a home. Adjust stock inline or edit specifications.
                  </p>
                </div>

                <ActionPillButton
                  label="+ Add New Furniture"
                  variant="dark"
                  onClick={onAddNew}
                />
              </div>

              {/* 4 Kartu Statistik Inventaris */}
              <section
                className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
                aria-label="Statistik Inventaris"
              >
                <div className="rounded-[20px] bg-[#141414] p-5 text-white">
                  <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#b4b4bc]">
                    TOTAL PRODUCTS
                  </p>
                  <p className="mt-2 text-[32px] font-normal leading-none">{metrics.total}</p>
                  <p className="mt-2 text-[11px] text-[#b4b4bc]">
                    Across {metrics.categoriesCount} categories
                  </p>
                </div>

                <div className="rounded-[20px] bg-[#f5f5f7] p-5">
                  <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#71717a]">
                    ACTIVE LISTINGS
                  </p>
                  <p className="mt-2 text-[32px] font-normal leading-none text-[#111111]">
                    {metrics.activeCount}
                  </p>
                  <p className="mt-2 text-[11px] text-[#71717a]">Visible in your store</p>
                </div>

                <div className="rounded-[20px] bg-[#f5f5f7] p-5">
                  <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#71717a]">
                    LOW STOCK
                  </p>
                  <p className="mt-2 text-[32px] font-normal leading-none text-[#a16620]">
                    {metrics.lowStockCount}
                  </p>
                  <p className="mt-2 text-[11px] text-[#71717a]">Fewer than 10 pieces</p>
                </div>

                <div className="rounded-[20px] bg-[#f5f5f7] p-5">
                  <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#71717a]">
                    OUT OF STOCK
                  </p>
                  <p className="mt-2 text-[32px] font-normal leading-none text-[#9b3f3f]">
                    {metrics.outOfStockCount}
                  </p>
                  <p className="mt-2 text-[11px] text-[#71717a]">Ready for restock</p>
                </div>
              </section>

              {/* Bilah Pencarian & Filter Tabel */}
              <div className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="flex h-[48px] items-center gap-3 rounded-full bg-[#f5f5f7] px-5 md:col-span-6">
                  <img
                    src={ICONS.search}
                    alt=""
                    width={15}
                    height={15}
                    className="h-4 w-4 opacity-70"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                    placeholder="Search by product name or SKU"
                    className="w-full bg-transparent text-[13px] text-[#111111] placeholder:text-[#71717a] focus:outline-none"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  aria-label="Filter category"
                  className="h-[48px] rounded-full bg-[#f5f5f7] px-4 text-[12px] font-medium text-[#111111] focus:outline-none md:col-span-2 cursor-pointer"
                >
                  {categoryChoices.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  aria-label="Filter status"
                  className="h-[48px] rounded-full bg-[#f5f5f7] px-4 text-[12px] font-medium text-[#111111] focus:outline-none md:col-span-2 cursor-pointer"
                >
                  <option value="All statuses">All statuses</option>
                  <option value="In stock">In stock</option>
                  <option value="Low stock">Low stock</option>
                  <option value="Out of stock">Out of stock</option>
                  <option value="Draft">Draft</option>
                </select>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="flex h-[48px] items-center justify-center rounded-full bg-[#f5f5f7] px-4 text-[12px] font-medium text-[#111111] transition-colors hover:bg-[#e6e6e9] md:col-span-2 cursor-pointer"
                >
                  {exportToast ? '✓ Exported CSV' : '↓ Export'}
                </button>
              </div>

              {/* Tabel Inventaris Responsif */}
              <div className="mt-6 overflow-hidden rounded-[20px] border border-[#e6e6e9] bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[780px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-[#e6e6e9] bg-[#f5f5f7] text-[10px] font-medium uppercase tracking-[0.08em] text-[#71717a]">
                        <th className="w-12 px-5 py-3.5">Sel</th>
                        <th className="px-4 py-3.5">Furniture Piece</th>
                        <th className="px-4 py-3.5">SKU</th>
                        <th className="px-4 py-3.5">Category</th>
                        <th className="px-4 py-3.5">Price</th>
                        <th className="px-4 py-3.5">Stock</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#e6e6e9] text-[13px]">
                      {visibleRows.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-14 text-center text-[#71717a]">
                            No inventory items match your search criteria.
                          </td>
                        </tr>
                      ) : (
                        visibleRows.map((item) => {
                          const stockMeta = getStockMeta(item.stock)
                          const isChecked = selectedIds.includes(item.id)
                          return (
                            <tr key={item.id} className="hover:bg-[#fafafa]">
                              <td className="px-5 py-3.5">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleRowSelection(item.id)}
                                  aria-label={`Select ${item.name}`}
                                  className="h-4 w-4 accent-[#141414] rounded cursor-pointer"
                                />
                              </td>

                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-10 w-10 shrink-0 rounded-[8px] bg-[#f5f5f7] object-cover"
                                  />
                                  <span className="font-normal text-[#111111]">{item.name}</span>
                                </div>
                              </td>

                              <td className="px-4 py-3.5 text-[11px] font-medium text-[#71717a]">
                                {item.sku}
                              </td>

                              <td className="px-4 py-3.5">
                                <BadgeChip tone="neutral">{item.category}</BadgeChip>
                              </td>

                              <td className="px-4 py-3.5 font-medium text-[#111111]">
                                {formatRupiah(item.price)}
                              </td>

                              <td className="px-4 py-3.5">
                                <div className="inline-flex h-[34px] w-[100px] items-center justify-between rounded-full bg-[#f5f5f7] px-3 text-[12px] text-[#111111]">
                                  <button
                                    type="button"
                                    onClick={() => onAdjustStock(item.id, -1)}
                                    className="hover:opacity-60 cursor-pointer"
                                    aria-label={`Kurangi stok ${item.name}`}
                                  >
                                    −
                                  </button>
                                  <span className="font-medium">{item.stock}</span>
                                  <button
                                    type="button"
                                    onClick={() => onAdjustStock(item.id, 1)}
                                    className="hover:opacity-60 cursor-pointer"
                                    aria-label={`Tambah stok ${item.name}`}
                                  >
                                    +
                                  </button>
                                </div>
                              </td>

                              <td className="px-4 py-3.5">
                                {item.status === 'Draft' ? (
                                  <BadgeChip tone="warm">Draft</BadgeChip>
                                ) : (
                                  <BadgeChip tone={stockMeta.tone}>{stockMeta.label}</BadgeChip>
                                )}
                              </td>

                              <td className="px-5 py-3.5">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => onEditProduct(item.id)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f7] hover:bg-[#e6e6e9] cursor-pointer"
                                    aria-label={`Edit ${item.name}`}
                                  >
                                    <img
                                      src={ICONS.edit}
                                      alt="Edit"
                                      width={16}
                                      height={16}
                                      className="h-4 w-4"
                                    />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onRequestDelete(item)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f7] hover:bg-[#fcedec] cursor-pointer"
                                    aria-label={`Hapus ${item.name}`}
                                  >
                                    <img
                                      src={ICONS.trash}
                                      alt="Delete"
                                      width={16}
                                      height={16}
                                      className="h-4 w-4"
                                    />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Baris Paginasi Tabel */}
              <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-[12px] text-[#71717a]">
                  {visibleRows.length} visible · {filteredRows.length} matching products (Page {safePage}{' '}
                  of {totalPages})
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="flex h-7 items-center rounded-full bg-[#f5f5f7] px-3 text-[11px] text-[#71717a] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    ←
                  </button>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`flex h-7 items-center rounded-full px-3 text-[11px] font-medium cursor-pointer ${
                        pageNum === safePage
                          ? 'bg-[#141414] text-white'
                          : 'bg-[#f5f5f7] text-[#71717a] hover:text-[#111111]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="flex h-7 items-center rounded-full bg-[#f5f5f7] px-3 text-[11px] text-[#71717a] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

/**
 * @fileoverview Komponen Kartu Produk (ProductCard) untuk Halaman Home dan Shop.
 *
 * Menerjemahkan komponen Figma `Product card` ke dalam kartu responsif yang memuat:
 * - Gambar produk berlatar lembut dengan sudut membulat (`rounded-[20px]`)
 * - Lencana kategori & status ketersediaan stok (`In stock`, `Low stock`, `Out of stock`)
 * - Nama produk, harga terformat Rupiah, dan tombol `+` tambah cepat ke tas belanja.
 */

import { useState } from 'react'
import { formatRupiah, getStockMeta } from '../data/furnitureData'
import { BadgeChip } from './ui/Buttons'

/**
 * Merender satu kartu produk furnitur interaktif.
 *
 * @param {object} props - Properti komponen ProductCard.
 * @param {object} props.product - Objek data produk (id, name, price, category, stock, image).
 * @param {Function} props.onSelectProduct - Handler saat kartu/judul diklik untuk membuka Product Detail.
 * @param {Function} props.onAddToCart - Handler saat tombol `+` diklik untuk menambah produk ke keranjang.
 * @returns {JSX.Element} Elemen kartu produk.
 */
export default function ProductCard({ product, onSelectProduct, onAddToCart }) {
  const [justAdded, setJustAdded] = useState(false)
  const stockMeta = getStockMeta(product.stock)
  const isOutOfStock = product.stock <= 0

  /**
   * Menangani klik tombol tambah cepat (`+`) agar tidak ikut memicu navigasi ke halaman detail (`stopPropagation`),
   * lalu menampilkan feedback centang singkat selama 1,2 detik.
   *
   * @param {React.MouseEvent} event - Event klik mouse pada tombol `+`.
   */
  const handleQuickAdd = (event) => {
    event.stopPropagation()
    if (isOutOfStock) return
    onAddToCart(product, 1)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <article
      onClick={() => onSelectProduct(product.id)}
      className="group flex flex-col rounded-[20px] bg-[#f5f5f7] p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ededf1] cursor-pointer"
    >
      {/* Wadah Foto Produk */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[14px] bg-white">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />

        {/* Lencana Status & Kategori di Pojok Atas Gambar */}
        <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-2">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.06em] text-[#111111] backdrop-blur-sm">
            {product.category}
          </span>
          <BadgeChip tone={stockMeta.tone}>{stockMeta.label}</BadgeChip>
        </div>
      </div>

      {/* Informasi Nama, Harga & Tombol Tambah Cepat */}
      <div className="mt-3.5 flex items-end justify-between gap-3 px-1 pb-1">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-normal leading-[1.35] text-[#111111]">
            {product.name}
          </h3>
          <p className="mt-0.5 text-[13px] font-medium text-[#71717a]">
            {formatRupiah(product.price)}
          </p>
        </div>

        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={isOutOfStock}
          aria-label={`Tambah ${product.name} ke keranjang`}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[15px] font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
            justAdded
              ? 'bg-[#376b56] text-white'
              : 'bg-[#141414] text-white hover:bg-[#2c2c30]'
          }`}
        >
          {justAdded ? '✓' : '+'}
        </button>
      </div>
    </article>
  )
}

/**
 * @fileoverview Komponen Kartu Produk (ProductCard) untuk Halaman Beranda dan Katalog.
 *
 * Menggunakan rute dinamis `/product/:id` dari React Router untuk navigasi halaman detail,
 * serta tombol `+` berukuran ramah sentuhan (44x44px) untuk tambah cepat ke tas belanja.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatRupiah, getStockMeta } from '../data/furnitureData'
import { BadgeChip } from './ui/Buttons'

/**
 * Merender satu kartu produk furnitur interaktif yang terhubung ke `/product/:id`.
 *
 * @param {object} props - Properti komponen ProductCard.
 * @param {object} props.product - Objek data produk (id, name, price, category, stock, image).
 * @param {Function} props.onAddToCart - Handler saat tombol `+` diklik untuk menambah produk ke keranjang.
 * @returns {JSX.Element} Elemen kartu produk.
 */
export default function ProductCard({ product, onAddToCart }) {
  const [justAdded, setJustAdded] = useState(false)
  const stockMeta = getStockMeta(product.stock)
  const isOutOfStock = product.stock <= 0

  /**
   * Menangani klik tombol tambah cepat (`+`) agar tidak memicu perpindahan rute `<Link>`,
   * lalu menampilkan feedback centang singkat.
   *
   * @param {React.MouseEvent} event - Event klik mouse pada tombol `+`.
   */
  const handleQuickAdd = (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (isOutOfStock) return
    onAddToCart(product, 1)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <article className="group flex flex-col rounded-[20px] border border-[#e6e6e9]/70 bg-[#f5f5f7] p-3.5 transition-colors duration-200 hover:border-[#d4d4d8] hover:bg-[#ededf1]">
      <Link
        to={`/product/${product.id}`}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-[14px] bg-white block"
      >
        <img
          src={product.image}
          alt={product.name}
          width={640}
          height={480}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />

        <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-2">
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.06em] text-[#111111]">
            {product.category}
          </span>
          <BadgeChip tone={stockMeta.tone}>{stockMeta.label}</BadgeChip>
        </div>
      </Link>

      <div className="mt-3.5 flex items-center justify-between gap-3 px-1 pb-0.5">
        <Link to={`/product/${product.id}`} className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-medium leading-[1.35] text-[#111111] group-hover:underline">
            {product.name}
          </h3>
          <p className="mt-0.5 text-[13px] font-normal text-[#52525b]">
            {formatRupiah(product.price)}
          </p>
        </Link>

        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={isOutOfStock}
          aria-label={`Add ${product.name} to bag`}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[16px] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
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

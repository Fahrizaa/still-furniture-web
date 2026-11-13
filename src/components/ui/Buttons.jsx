/**
 * @fileoverview Komponen Tombol & Lencana (Badge) Dasar yang Dapat Digunakan Ulang.
 *
 * Kumpulan komponen UI atomik yang mengikuti aturan visual Design System STILL di Figma:
 * - Tombol berbentuk kapsul (`rounded-full`) dengan tinggi 44–48px.
 * - Lencana status stok dengan warna semantik (hijau, amber, merah lembut).
 */

import { ICONS } from '../../assets/assetMap'

/**
 * Merender tombol utama atau sekunder berbentuk pill (kapsul) dengan ikon panah opsional.
 * Digunakan sebagai CTA utama di seluruh storefront dan halaman checkout/seller.
 *
 * @param {object} props - Properti komponen tombol.
 * @param {string} props.label - Teks label yang tampil di dalam tombol.
 * @param {'dark' | 'light' | 'warm-dark' | 'warm-light'} [props.variant='dark'] - Variasi tema warna tombol.
 * @param {'arrow' | 'up-right' | 'none'} [props.icon='arrow'] - Jenis ikon arah di sisi kanan teks.
 * @param {Function} [props.onClick] - Handler saat tombol diklik.
 * @param {string} [props.type='button'] - Tipe tombol HTML (`button` atau `submit`).
 * @param {boolean} [props.disabled=false] - Status nonaktif untuk validasi form/stok habis.
 * @param {string} [props.className=''] - Kelas Tailwind tambahan dari parent.
 * @returns {JSX.Element} Elemen tombol kapsul interaktif.
 */
export function ActionPillButton({
  label,
  variant = 'dark',
  icon = 'arrow',
  onClick,
  type = 'button',
  disabled = false,
  className = '',
}) {
  const variantClasses = {
    dark: 'bg-[#141414] text-white hover:bg-[#26262a] border border-transparent',
    light: 'bg-white text-[#111111] hover:bg-[#f5f5f7] border border-[#e6e6e9]',
    'warm-dark': 'bg-[#1a1a1a] text-white hover:bg-[#2d2a26] border border-transparent',
    'warm-light': 'bg-[#f5f3ef] text-[#1a1a1a] hover:bg-[#eae6de] border border-[#e8e5df]',
  }

  /**
   * Memilih ikon panah yang kontras dengan warna latar tombol agar tetap terbaca jelas.
   */
  const resolveArrowSrc = () => {
    if (icon === 'none') return null
    const isDarkSurface = variant === 'dark' || variant === 'warm-dark'
    if (icon === 'up-right') {
      return isDarkSurface ? ICONS.arrowUpRightCyan : ICONS.arrowUpRightDark
    }
    return isDarkSurface ? ICONS.arrowCyan : ICONS.arrowDark
  }

  const arrowSrc = resolveArrowSrc()

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-[46px] sm:h-[48px] items-center justify-center gap-[14px] rounded-full px-[20px] sm:px-[22px] text-[13px] sm:text-[14px] font-medium leading-[1.3] transition-all duration-200 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${variantClasses[variant] || variantClasses.dark} ${className}`}
    >
      <span className="whitespace-nowrap">{label}</span>
      {arrowSrc ? (
        <img
          src={arrowSrc}
          alt=""
          width={16}
          height={16}
          className="h-4 w-4 shrink-0 object-contain"
        />
      ) : null}
    </button>
  )
}

/**
 * Merender chip lencana (badge) berukuran ringkas untuk kategori produk maupun status stok.
 *
 * @param {object} props - Properti komponen BadgeChip.
 * @param {React.ReactNode} props.children - Teks atau isi di dalam lencana.
 * @param {'in-stock' | 'low-stock' | 'out-of-stock' | 'neutral' | 'warm'} [props.tone='neutral'] - Tema warna semantik badge.
 * @param {string} [props.className=''] - Kelas Tailwind tambahan.
 * @returns {JSX.Element} Elemen badge pill.
 */
export function BadgeChip({ children, tone = 'neutral', className = '' }) {
  const toneClasses = {
    'in-stock': 'bg-[#edf5ef] text-[#376b56]',
    'low-stock': 'bg-[#fef3e6] text-[#a16620]',
    'out-of-stock': 'bg-[#fcedec] text-[#9b3f3f]',
    neutral: 'bg-[#f5f5f7] text-[#111111]',
    warm: 'bg-[#f5f3ef] text-[#716b63] border border-[#e8e5df]',
  }

  return (
    <span
      className={`inline-flex h-[26px] items-center rounded-full px-[10px] text-[10px] font-medium leading-none tracking-[0.01em] whitespace-nowrap ${toneClasses[tone] || toneClasses.neutral} ${className}`}
    >
      {children}
    </span>
  )
}

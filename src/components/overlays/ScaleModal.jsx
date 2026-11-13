/**
 * @fileoverview Modal `08 / Scale — Scale & Proportions` Sesuai Desain Figma.
 *
 * Membantu pembeli memvisualisasikan ukuran furnitur di ruang nyata sebelum membeli:
 * - Segmented Toggle antara tampilan `Compare with Human (170cm)` dan `View in 3×3m Room`.
 * - Menjaga aspek rasio asli diagram SVG (`656 × 304`) agar garis ukur presisi.
 * - Menampilkan 3 kartu spesifikasi dimensi kunci: Total Footprint (m²), Seat Height, & Box Size.
 */

import { useState } from 'react'
import { ICONS } from '../../assets/assetMap'
import { calculateFootprintSqm } from '../../data/furnitureData'

/**
 * Merender modal panduan skala dan proporsi ruang produk furnitur.
 *
 * @param {object} props - Properti ScaleModal.
 * @param {boolean} props.isOpen - Status buka/tutup modal skala.
 * @param {Function} props.onClose - Callback menutup modal kembali ke halaman produk.
 * @param {object} props.product - Objek produk yang dimensinya sedang diperiksa.
 * @returns {JSX.Element | null} Elemen modal atau `null` jika tidak aktif.
 */
export default function ScaleModal({ isOpen, onClose, product }) {
  const [viewMode, setViewMode] = useState('human')

  if (!isOpen || !product) return null

  const dims = product.dimensions || {
    width: 72,
    depth: 78,
    height: 76,
    seatHeight: 42,
    boxSize: '82 × 80 × 84 cm',
  }

  const footprint = calculateFootprintSqm(dims.width, dims.depth)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">
      <div
        className="w-full max-w-[740px] overflow-hidden rounded-[24px] border border-[#e8e5df] bg-[#faf9f6] text-[#1a1a1a] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="scale-modal-title"
      >
        {/* Header Modal */}
        <div className="flex items-start justify-between gap-4 border-b border-[#e8e5df] px-6 py-5 sm:px-8">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#8c6239]">
              SCALE & PROPORTIONS
            </p>
            <h2
              id="scale-modal-title"
              className="mt-1 text-[20px] sm:text-[22px] font-normal tracking-[-0.5px] text-[#1a1a1a]"
            >
              {product.name} · {dims.width} × {dims.depth} × {dims.height} cm
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e8e5df] bg-white hover:bg-[#f5f3ef] cursor-pointer"
            aria-label="Tutup modal skala"
          >
            <img src={ICONS.close} alt="Close" width={15} height={15} className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Konten Visual & Kontrol */}
        <div className="max-h-[78vh] overflow-y-auto px-6 py-6 sm:px-8">
          {/* Segmented Toggle: Compare with Human vs View in 3x3m Room */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-full border border-[#e8e5df] bg-[#f5f3ef] p-1">
              <button
                type="button"
                onClick={() => setViewMode('human')}
                className={`rounded-full px-4 py-2 text-[12px] font-medium transition-all cursor-pointer ${
                  viewMode === 'human'
                    ? 'bg-[#1a1a1a] text-white shadow-xs'
                    : 'text-[#716b63] hover:text-[#1a1a1a]'
                }`}
              >
                Compare with Human (170cm)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('room')}
                className={`rounded-full px-4 py-2 text-[12px] font-medium transition-all cursor-pointer ${
                  viewMode === 'room'
                    ? 'bg-[#1a1a1a] text-white shadow-xs'
                    : 'text-[#716b63] hover:text-[#1a1a1a]'
                }`}
              >
                View in 3×3m Room
              </button>
            </div>

            <span className="rounded-full bg-[#edf5ea] px-3 py-1.5 text-[11px] font-medium text-[#2e7d32]">
              ✓ Fits standard 80cm doorways
            </span>
          </div>

          {/* Panggung Diagram Vektor dengan Aspek Rasio SVG Asli (656:304) */}
          <div className="relative aspect-[656/304] w-full overflow-hidden rounded-[18px] border border-[#e8e5df] bg-white">
            {/* Grid Garis Arsitektural Halus */}
            <div
              className="pointer-events-none absolute inset-0 opacity-35"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #e8e5df 1px, transparent 1px), linear-gradient(to bottom, #e8e5df 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />

            {viewMode === 'human' ? (
              <>
                <img
                  src={ICONS.scaleHumanOutline}
                  alt="Human height reference 170 cm"
                  width={656}
                  height={304}
                  className="absolute inset-0 h-full w-full object-contain"
                />
                <img
                  src={ICONS.scaleChairElevation}
                  alt={`${product.name} front elevation`}
                  width={656}
                  height={304}
                  className="absolute inset-0 h-full w-full object-contain"
                />
                <img
                  src={ICONS.scaleDimensionLines}
                  alt="Dimension extension lines"
                  width={656}
                  height={304}
                  className="absolute inset-0 h-full w-full object-contain"
                />
                <span className="absolute left-[11%] top-[14%] rounded-full bg-[#faf9f6]/95 px-2.5 py-0.5 text-[10px] font-medium text-[#716b63] border border-[#e8e5df]">
                  170 cm reference
                </span>
                <span className="absolute right-[14%] bottom-[16%] rounded-full bg-[#faf9f6]/95 px-2.5 py-0.5 text-[10px] font-medium text-[#8c6239] border border-[#e8e5df]">
                  H {dims.height} cm × W {dims.width} cm
                </span>
              </>
            ) : (
              <>
                <img
                  src={ICONS.scaleRoomPlan}
                  alt="3 by 3 meter room floor plan with doorway clearance"
                  width={656}
                  height={304}
                  className="absolute inset-0 h-full w-full object-contain"
                />
                <span className="absolute left-[6%] top-[14%] rounded-full bg-[#faf9f6]/95 px-3 py-1 text-[10px] font-medium text-[#716b63] border border-[#e8e5df]">
                  300 × 300 cm Room Grid
                </span>
                <span className="absolute right-[8%] bottom-[14%] rounded-full bg-[#faf9f6]/95 px-3 py-1 text-[10px] font-medium text-[#8c6239] border border-[#e8e5df]">
                  Footprint {footprint}
                </span>
              </>
            )}
          </div>

          {/* 3 Kartu Spesifikasi Ringkas */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-[16px] border border-[#e8e5df] bg-white p-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#716b63]">
                TOTAL FOOTPRINT
              </p>
              <p className="mt-1.5 text-[20px] font-normal text-[#1a1a1a]">{footprint}</p>
              <p className="mt-0.5 text-[11px] text-[#716b63]">
                {dims.width} cm × {dims.depth} cm floor area
              </p>
            </div>

            <div className="rounded-[16px] border border-[#e8e5df] bg-white p-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#716b63]">
                SEAT / TOP HEIGHT
              </p>
              <p className="mt-1.5 text-[20px] font-normal text-[#1a1a1a]">{dims.seatHeight} cm</p>
              <p className="mt-0.5 text-[11px] text-[#716b63]">Ergonomic daily clearance</p>
            </div>

            <div className="rounded-[16px] border border-[#e8e5df] bg-white p-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#716b63]">
                SHIPPING BOX SIZE
              </p>
              <p className="mt-1.5 text-[18px] font-normal text-[#1a1a1a]">{dims.boxSize}</p>
              <p className="mt-0.5 text-[11px] text-[#716b63]">Protective crated carton</p>
            </div>
          </div>

          {/* Tombol Kembali */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#e8e5df] pt-5">
            <p className="text-[12px] text-[#716b63]">
              Need custom hallway clearance advice? Ask our Kemang concierge anytime.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-full bg-[#1a1a1a] px-6 py-3 text-[13px] font-medium text-white hover:opacity-90 cursor-pointer"
            >
              Back to product
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

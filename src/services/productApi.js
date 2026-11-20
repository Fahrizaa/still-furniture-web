/**
 * @fileoverview Service Layer Pemanggilan Data API & Normalisasi Data Contract (JSON).
 *
 * Arsitektur ini memisahkan komponen UI React dari detail pemanggilan jaringan:
 * 1. Mengambil data melalui HTTP `fetch()` ke endpoint JSON lokal (`/api/products.json`)
 *    dengan simulasi latensi jaringan agar indikator Loading Skeleton dan Error State dapat diuji.
 * 2. Memetakan setiap varian warna (`finishes`, dibatasi 2 warna utama) ke aset gambar yang sesuai
 *    (misal: Natural Walnut vs Black Ash / Charcoal).
 */

import { IMAGES } from '../assets/assetMap'
import { INITIAL_PRODUCTS } from '../data/furnitureData'

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  productsPath: '/products.json',
  simulatedLatencyMs: 650,
}

/**
 * Memetakan satu objek produk mentah dari payload JSON Data Contract menjadi
 * format objek siap-pakai di komponen React, termasuk gambar spesifik untuk tiap pilihan warna.
 *
 * @param {object} rawItem - Objek produk dari array `data` pada JSON contract.
 * @returns {object} Objek produk yang telah dinormalisasi.
 */
export function normalizeProductContract(rawItem) {
  const baseKey = rawItem.imageKey || 'formaLoungeChair'
  const darkKey = `${baseKey}Black`

  const resolvedPrimaryImage =
    IMAGES[baseKey] || rawItem.image || IMAGES.formaLoungeChair
  const resolvedDarkImage =
    IMAGES[darkKey] || resolvedPrimaryImage

  const resolvedGallery = Array.isArray(rawItem.gallery)
    ? rawItem.gallery.map((g, idx) => ({
        id: g.id || `angle-${idx}`,
        label: g.label || rawItem.name,
        src: (g.imageKey && IMAGES[g.imageKey]) || g.src || resolvedPrimaryImage,
      }))
    : [{ id: 'primary', label: rawItem.name, src: resolvedPrimaryImage }]

  const resolvedDarkGallery = Array.isArray(rawItem.gallery)
    ? rawItem.gallery.map((g, idx) => {
        const gDarkKey = g.imageKey ? `${g.imageKey}Black` : darkKey
        return {
          id: `${g.id || `angle-${idx}`}-black`,
          label: `${g.label || rawItem.name} (Black)`,
          src: IMAGES[gDarkKey] || resolvedDarkImage,
        }
      })
    : [{ id: 'primary-black', label: `${rawItem.name} (Black)`, src: resolvedDarkImage }]

  // Setiap produk memiliki tepat 2 opsi warna: Natural/Warm (indeks 0) dan Black/Charcoal (indeks 1)
  const rawFinishes = Array.isArray(rawItem.finishes) ? rawItem.finishes.slice(0, 2) : []
  const normalizedFinishes = [
    {
      id: rawFinishes[0]?.id || 'natural-finish',
      name: rawFinishes[0]?.name || 'Natural Walnut',
      swatch: rawFinishes[0]?.swatch || '#8c6239',
      image: resolvedPrimaryImage,
      gallery: resolvedGallery,
    },
    {
      id: rawFinishes[1]?.id || 'black-ash',
      name: rawFinishes[1]?.name || 'Black Ash',
      swatch: '#232325',
      image: resolvedDarkImage,
      gallery: resolvedDarkGallery,
    },
  ]

  return {
    id: String(rawItem.id),
    sku: String(rawItem.sku || 'STL-000'),
    name: String(rawItem.name || 'Untitled piece'),
    category: String(rawItem.category || 'Seating'),
    room: String(rawItem.room || 'Living room'),
    collectionTag: String(rawItem.collectionTag || 'THE NATURAL COLLECTION'),
    price: Number(rawItem.price) || 0,
    stock: Number.isFinite(Number(rawItem.stock)) ? Number(rawItem.stock) : 0,
    status: rawItem.status || 'Published',
    rating: Number(rawItem.rating) || 4.8,
    reviewsCount: Number(rawItem.reviewsCount) || 0,
    materials: Array.isArray(rawItem.materials) ? rawItem.materials : ['Natural materials'],
    dimensions: {
      width: Number(rawItem.dimensions?.width) || 72,
      depth: Number(rawItem.dimensions?.depth) || 78,
      height: Number(rawItem.dimensions?.height) || 76,
      seatHeight: Number(rawItem.dimensions?.seatHeight) || 42,
      boxSize: String(rawItem.dimensions?.boxSize || '82 x 80 x 84 cm'),
    },
    sizeTier: rawItem.sizeTier || 'Compact (< 90cm)',
    finishes: normalizedFinishes,
    image: resolvedPrimaryImage,
    gallery: resolvedGallery,
    summary: String(rawItem.summary || ''),
    specs: Array.isArray(rawItem.specs) ? rawItem.specs : [],
  }
}

/**
 * Mengambil daftar katalog produk dari endpoint API JSON (`/api/products.json`).
 *
 * @param {object} [options={}] - Opsi pemanggilan API.
 * @param {boolean} [options.shouldFail=false] - Jika `true`, menyimulasikan kegagalan jaringan/503 Error.
 * @returns {Promise<{ contractVersion: string, endpoint: string, products: Array<object> }>} Payload produk yang sudah tervalidasi.
 */
export async function fetchProductsCatalog({ shouldFail = false } = {}) {
  const endpointUrl = `${API_CONFIG.baseUrl}${API_CONFIG.productsPath}`

  await new Promise((resolve) => setTimeout(resolve, API_CONFIG.simulatedLatencyMs))

  if (shouldFail) {
    throw new Error(`HTTP 503 Service Unavailable (${endpointUrl})`)
  }

  const response = await fetch(endpointUrl, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} Failed to fetch ${endpointUrl}`)
  }

  const payload = await response.json()
  const rawList = Array.isArray(payload?.data) ? payload.data : INITIAL_PRODUCTS

  return {
    contractVersion: payload?.contractVersion || '1.0.0',
    endpoint: payload?.endpoint || endpointUrl,
    products: rawList.map(normalizeProductContract),
  }
}

/**
 * @fileoverview Komponen Visual Loading Skeleton, Error State, & Panel Uji Simulasi API.
 *
 * Dibuat menggunakan palet warna dan proporsi desain yang senada dengan identitas STILL:
 * - `ProductGridSkeleton`: Kerangka kartu produk dengan efek pulse lembut saat data sedang di-fetch.
 * - `ProductDetailSkeleton`: Kerangka halaman detail produk `/product/:id` saat menunggu respons API.
 * - `ApiErrorState`: Kotak pemberitahuan gagal panggil API beserta tombol Retry.
 * - `ApiSimulationBar`: Bilah kontrol untuk mendemonstrasikan kondisi Loading & Error API secara langsung.
 */

/**
 * Merender grid kartu skeleton saat katalog produk sedang diambil dari endpoint API.
 *
 * @param {object} props - Properti ProductGridSkeleton.
 * @param {number} [props.count=6] - Jumlah kotak kerangka kartu yang ditampilkan.
 * @param {string} [props.label='Memuat data katalog dari API...'] - Teks status pemuatan bagi pembaca layar.
 * @returns {JSX.Element} Elemen skeleton grid produk.
 */
export function ProductGridSkeleton({ count = 6, label = 'Loading catalog...' }) {
  return (
    <div role="status" aria-live="polite" className="w-full">
      <div className="mb-4 flex items-center gap-2.5 text-[12px] text-[#71717a]">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#8c6239]" />
        <span>{label}</span>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, idx) => (
          <div
            key={idx}
            className="flex flex-col rounded-[20px] border border-[#e6e6e9] bg-[#f5f5f7] p-3.5"
          >
            <div className="aspect-[4/3] w-full animate-pulse rounded-[14px] bg-[#e4e4e8]" />
            <div className="mt-4 flex items-end justify-between gap-3 px-1 pb-1">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded-md bg-[#e2e2e7]" />
                <div className="h-3.5 w-1/2 animate-pulse rounded-md bg-[#e8e8ec]" />
              </div>
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-[#e2e2e7]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Merender skeleton halaman detail produk (`/product/:id`) saat data sedang dimuat.
 *
 * @param {object} props - Properti ProductDetailSkeleton.
 * @param {string} [props.label] - Teks status pemuatan.
 * @returns {JSX.Element} Elemen skeleton halaman detail.
 */
export function ProductDetailSkeleton({ label = 'Loading product details...' }) {
  return (
    <main
      role="status"
      aria-live="polite"
      className="mx-auto max-w-[1440px] px-5 pt-8 sm:px-8 lg:px-12"
    >
      <div className="mb-5 flex items-center gap-2 text-[12px] text-[#71717a]">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#8c6239]" />
        <span>{label}</span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <div className="aspect-[4/3] w-full animate-pulse rounded-[24px] bg-[#f0eff3]" />
          <div className="mt-3.5 grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-square animate-pulse rounded-[14px] bg-[#f0eff3]" />
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between space-y-6 lg:col-span-5">
          <div className="space-y-4">
            <div className="h-5 w-32 animate-pulse rounded-full bg-[#f0eff3]" />
            <div className="h-10 w-3/4 animate-pulse rounded-xl bg-[#e8e7ec]" />
            <div className="h-7 w-40 animate-pulse rounded-lg bg-[#f0eff3]" />
            <div className="h-20 w-full animate-pulse rounded-xl bg-[#f5f5f7]" />
            <div className="h-24 w-full animate-pulse rounded-[18px] bg-[#f5f5f7]" />
          </div>
          <div className="h-12 w-full animate-pulse rounded-full bg-[#e8e7ec]" />
        </div>
      </div>
    </main>
  )
}

/**
 * Merender tampilan pesan Error dengan tone visual Warm Editorial STILL ketika pemanggilan API gagal.
 *
 * @param {object} props - Properti ApiErrorState.
 * @param {string} props.title - Judul pesan kegagalan API.
 * @param {string} props.description - Penjelasan penyebab dan langkah selanjutnya.
 * @param {string} [props.errorDetail] - Detail kode status teknis dari exception `fetch()`.
 * @param {string} props.retryLabel - Teks tombol muat ulang.
 * @param {Function} props.onRetry - Handler untuk memanggil ulang API dalam mode normal.
 * @returns {JSX.Element} Elemen panel error API.
 */
export function ApiErrorState({ title, description, errorDetail, retryLabel, onRetry }) {
  return (
    <div
      role="alert"
      className="rounded-[24px] border border-[#e8e5df] bg-[#faf9f6] p-7 sm:p-9 text-[#1a1a1a]"
    >
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#fcedec] px-3 py-1 text-[11px] font-medium text-[#9b3f3f]">
            API Connection Error
          </span>
          <h3 className="mt-3 text-[22px] font-normal tracking-[-0.5px] text-[#1a1a1a]">
            {title}
          </h3>
          <p className="mt-1.5 text-[13px] leading-[1.6] text-[#716b63]">{description}</p>
          {errorDetail ? (
            <p className="mt-2 font-mono text-[11px] text-[#9b3f3f]">
              Detail: {errorDetail}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#141414] px-6 text-[13px] font-medium text-white transition-colors hover:bg-[#27272a] cursor-pointer"
        >
          {retryLabel}
        </button>
      </div>
    </div>
  )
}

/**
 * Bilah penguji simulasi API agar pengguna dapat mengetes state Loading Skeleton
 * maupun Error Handling secara interaktif kapan saja.
 *
 * @param {object} props - Properti ApiSimulationBar.
 * @param {object} props.t - Objek kamus bahasa aktif.
 * @param {boolean} props.isLoading - Status apakah fetch sedang berjalan.
 * @param {boolean} props.hasError - Status apakah sedang dalam kondisi error API.
 * @param {Function} props.onTriggerRefetch - Memicu fetch ulang normal (menampilkan skeleton).
 * @param {Function} props.onTriggerError - Memicu fetch dengan simulasi gagal (HTTP 503).
 * @returns {JSX.Element} Bilah kontrol simulasi API.
 */
export function ApiSimulationBar({
  t,
  isLoading,
  hasError,
  onTriggerRefetch,
  onTriggerError,
}) {
  return (
    <div className="border-b border-[#e6e6e9] bg-[#faf9f6] px-5 py-2 text-[11px] text-[#716b63] sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#1a1a1a]">{t.apiSimLabel}</span>
          <code className="rounded bg-white px-2 py-0.5 font-mono text-[10px] text-[#8c6239] border border-[#e8e5df]">
            GET /api/products.json
          </code>
          <span className="hidden sm:inline text-[#716b63]">
            ({isLoading ? 'Loading...' : hasError ? 'HTTP 503 Error' : '200 OK · JSON Contract v1.0'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onTriggerRefetch}
            className="rounded-full border border-[#e8e5df] bg-white px-3 py-1 font-medium text-[#1a1a1a] hover:bg-[#f5f3ef] disabled:opacity-50 cursor-pointer"
          >
            {t.apiSimReload}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onTriggerError}
            className={`rounded-full px-3 py-1 font-medium transition-colors cursor-pointer disabled:opacity-50 ${
              hasError
                ? 'bg-[#9b3f3f] text-white'
                : 'border border-[#f2c6c6] bg-[#fcedec] text-[#9b3f3f] hover:bg-[#f9dcd9]'
            }`}
          >
            {t.apiSimError}
          </button>
        </div>
      </div>
    </div>
  )
}

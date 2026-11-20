/**
 * @fileoverview Komponen Root (`App.jsx`) dengan Multi-Page App Router, Simulasi Fetch API, & Lokalisasi (ID/EN).
 *
 * Arsitektur Utama:
 * 1. Multi-page Routing (`Routes` & `Route` dari `react-router-dom`):
 *    - `/` : Halaman Utama (`HomePage`)
 *    - `/shop` : Halaman Katalog & Filter (`ShopPage`)
 *    - `/product/:id` : Halaman Detail Produk Dinamis (`ProductDetailPage`)
 *    - `/checkout` : Halaman Pembayaran (`CheckoutPage`)
 *    - `/seller/inventory` : Halaman Inventaris Penjual (`SellerInventoryPage`)
 *    - `/seller/studio` : Halaman Studio Tambah/Edit Produk (`SellerStudioPage`)
 * 2. Konsumsi Data API & Data Contract (`/api/products.json` via `fetchProductsCatalog()`):
 *    - Mengelola state `isLoading` (Loading Skeleton) dan `apiError` (Error State + Retry).
 * 3. Pengaturan Bahasa (`id` Bahasa Indonesia & `en` English).
 */

import { useCallback, useEffect, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import {
  DeleteConfirmModal,
  OrderReservedModal,
  ProductSavedModal,
  SignInModal,
  StorefrontPreviewModal,
} from './components/overlays/ActionModals'
import CartDrawer from './components/overlays/CartDrawer'
import ConciergeDrawer from './components/overlays/ConciergeDrawer'
import ScaleModal from './components/overlays/ScaleModal'
import { ApiSimulationBar } from './components/ui/ApiStateViews'
import {
  INITIAL_PRODUCTS,
  clearDummySession,
  loadDummySession,
  saveDummySession,
} from './data/furnitureData'
import {
  TRANSLATIONS,
  loadSavedLanguage,
  saveLanguagePreference,
} from './data/translations'
import CheckoutPage from './pages/CheckoutPage'
import HomePage from './pages/HomePage'
import ProductDetailPage from './pages/ProductDetailPage'
import SellerInventoryPage from './pages/SellerInventoryPage'
import SellerStudioPage from './pages/SellerStudioPage'
import ShopPage from './pages/ShopPage'
import { fetchProductsCatalog } from './services/productApi'

/**
 * Mengonversi nama rute logis maupun path menjadi URL path standar React Router.
 *
 * @param {string} target - Nama halaman atau path tujuan.
 * @param {object} [options={}] - Opsi tambahan seperti `productId` atau filter query.
 * @returns {string} Path URL tujuan.
 */
function resolveRoutePath(target, options = {}) {
  if (target === 'home' || target === '/') return '/'
  if (target === 'shop' || target === '/shop') {
    const params = new URLSearchParams()
    if (options.roomFilter) params.set('room', options.roomFilter)
    if (options.categories?.[0]) params.set('category', options.categories[0])
    if (options.searchQuery) params.set('q', options.searchQuery)
    const qs = params.toString()
    return qs ? `/shop?${qs}` : '/shop'
  }
  if (target === 'product' || target.startsWith('/product')) {
    const pid = options.productId || 'forma-lounge-chair'
    return `/product/${pid}`
  }
  if (target === 'checkout' || target === '/checkout') return '/checkout'
  if (target === 'seller-inventory' || target === '/seller/inventory') return '/seller/inventory'
  if (target === 'seller-studio' || target === '/seller/studio') return '/seller/studio'
  return target.startsWith('/') ? target : '/'
}

/**
 * Komponen utama aplikasi STILL yang mengoordinasikan App Router, Fetch API, Keranjang, dan Autentikasi.
 *
 * @returns {JSX.Element} Pohon komponen aplikasi React.
 */
export default function App() {
  const navigate = useNavigate()
  const location = useLocation()

  // State bahasa antarmuka ('id' | 'en')
  const [lang, setLang] = useState(() => loadSavedLanguage())
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id

  // State sesi autentikasi dummy ('customer' | 'seller' | null)
  const [currentUser, setCurrentUser] = useState(() => loadDummySession())

  // State produk dari API JSON Contract beserta state Loading & Error
  const [products, setProducts] = useState(INITIAL_PRODUCTS)
  const [isLoadingApi, setIsLoadingApi] = useState(true)
  const [apiError, setApiError] = useState(null)

  const [editingProductId, setEditingProductId] = useState(null)

  // State Tas Belanja (dimulai dari 0 item)
  const [cartItems, setCartItems] = useState([])

  // State buka/tutup drawer & modal
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [conciergeState, setConciergeState] = useState({
    isOpen: false,
    product: INITIAL_PRODUCTS[0],
  })
  const [scaleState, setScaleState] = useState({
    isOpen: false,
    product: INITIAL_PRODUCTS[0],
  })
  const [signInDialog, setSignInDialog] = useState({
    isOpen: false,
    initialRole: 'customer',
    notice: '',
    redirectPage: null,
  })
  const [reservedOrder, setReservedOrder] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [savedProductInfo, setSavedProductInfo] = useState(null)
  const [studioPreviewProduct, setStudioPreviewProduct] = useState(null)

  /**
   * Memanggil endpoint JSON contract (`/api/products.json`) dan memperbarui state `products`,
   * `isLoadingApi`, serta `apiError`.
   *
   * @param {boolean} [shouldFail=false] - Opsi untuk menyimulasikan kegagalan respons server API.
   */
  const loadCatalogFromApi = useCallback(async (shouldFail = false) => {
    setIsLoadingApi(true)
    setApiError(null)
    try {
      const result = await fetchProductsCatalog({ shouldFail })
      setProducts(result.products)
    } catch (err) {
      setApiError(err?.message || 'Unknown API Error')
    } finally {
      setIsLoadingApi(false)
    }
  }, [])

  // Memuat data produk dari API contract saat aplikasi pertama kali dijalankan
  useEffect(() => {
    let cancelled = false
    fetchProductsCatalog({ shouldFail: false })
      .then((result) => {
        if (!cancelled) setProducts(result.products)
      })
      .catch((err) => {
        if (!cancelled) setApiError(err?.message || 'Unknown API Error')
      })
      .finally(() => {
        if (!cancelled) setIsLoadingApi(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  /**
   * Mengganti bahasa aktif antara Bahasa Indonesia (`id`) dan Bahasa Inggris (`en`).
   */
  const handleToggleLanguage = () => {
    const nextLang = lang === 'id' ? 'en' : 'id'
    setLang(nextLang)
    saveLanguagePreference(nextLang)
  }

  /**
   * Menavigasi ke halaman tujuan menggunakan React Router dengan proteksi rute khusus Seller Workspace.
   *
   * @param {string} targetPage - Nama halaman atau URL path tujuan.
   * @param {object} [options={}] - Opsi parameter rute atau bypass guard setelah login.
   */
  const navigateToPage = (targetPage, options = {}) => {
    const resolvedPath = resolveRoutePath(targetPage, options)
    const isSellerTarget = resolvedPath.startsWith('/seller')

    if (isSellerTarget && !options.bypassAuthCheck && currentUser?.role !== 'seller') {
      setSignInDialog({
        isOpen: true,
        initialRole: 'seller',
        notice: 'Silakan Sign In memakai akun demo Penjual untuk membuka Seller Workspace.',
        redirectPage: resolvedPath,
      })
      return
    }

    navigate(resolvedPath)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /**
   * Membuka modal Sign In dummy dengan tab peran default yang sesuai.
   *
   * @param {'customer' | 'seller'} [initialRole='customer'] - Tab awal (`customer` atau `seller`).
   * @param {string} [notice=''] - Pesan keterangan opsional.
   */
  const openSignInDialog = (initialRole = 'customer', notice = '') => {
    setSignInDialog({
      isOpen: true,
      initialRole,
      notice,
      redirectPage: null,
    })
  }

  /**
   * Menyimpan sesi akun dummy setelah kredensial tervalidasi dan menavigasi ke rute sesuai peran.
   *
   * @param {object} authenticatedUser - Objek user Pembeli/Penjual dari `authenticateDummyAccount()`.
   */
  const handleSignInSuccess = (authenticatedUser) => {
    const pendingRedirect = signInDialog.redirectPage
    setCurrentUser(authenticatedUser)
    saveDummySession(authenticatedUser)
    setSignInDialog({ isOpen: false, initialRole: 'customer', notice: '', redirectPage: null })

    if (authenticatedUser.role === 'seller') {
      const target = pendingRedirect || '/seller/inventory'
      if (target.includes('studio')) setEditingProductId(null)
      navigateToPage(target, { bypassAuthCheck: true })
    } else if (location.pathname.startsWith('/seller')) {
      navigate('/')
    }
  }

  /**
   * Mengakhiri sesi akun dummy saat ini dan mengembalikan tampilan ke Storefront utama.
   */
  const handleSignOut = () => {
    clearDummySession()
    setCurrentUser(null)
    setSignInDialog({ isOpen: false, initialRole: 'customer', notice: '', redirectPage: null })
    if (location.pathname.startsWith('/seller')) {
      navigate('/')
    }
  }

  /**
   * Menambahkan produk furnitur (beserta varian finish) ke tas belanja.
   *
   * @param {object} product - Objek produk yang ditambahkan.
   * @param {number} [qtyToAdd=1] - Jumlah unit yang ditambahkan.
   * @param {string} [finishName] - Nama finishing kayu/kain yang dipilih.
   */
  const handleAddToCart = (product, qtyToAdd = 1, finishName) => {
    const chosenFinish = finishName || product.finishes?.[0]?.name || 'Natural finish'

    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.productId === product.id && item.finishName === chosenFinish
      )
      if (existingIdx > -1) {
        return prev.map((item, idx) =>
          idx === existingIdx ? { ...item, qty: item.qty + qtyToAdd } : item
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          sku: product.sku,
          name: product.name,
          price: product.price,
          qty: qtyToAdd,
          finishName: chosenFinish,
          image: product.image,
        },
      ]
    })
  }

  /**
   * Mengubah kuantitas satu item di dalam keranjang belanja.
   *
   * @param {string} productId - ID produk target.
   * @param {string} finishName - Varian finishing item.
   * @param {number} delta - Perubahan jumlah (`+1` atau `-1`).
   */
  const handleUpdateCartQty = (productId, finishName, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId && item.finishName === finishName
            ? { ...item, qty: item.qty + delta }
            : item
        )
        .filter((item) => item.qty > 0)
    )
  }

  /**
   * Menghapus satu baris produk + finish sepenuhnya dari tas belanja.
   *
   * @param {string} productId - ID produk yang ingin dihapus.
   * @param {string} finishName - Nama varian finishing yang ingin dihapus.
   */
  const handleRemoveCartItem = (productId, finishName) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.productId === productId && item.finishName === finishName))
    )
  }

  /**
   * Memproses konfirmasi Place Order dari halaman Checkout dan mengosongkan keranjang.
   *
   * @param {object} orderSummary - Ringkasan nomor order, metode bayar, & total harga.
   */
  const handlePlaceOrder = (orderSummary) => {
    setReservedOrder(orderSummary)
    setCartItems([])
  }

  /**
   * Menyesuaikan angka stok secara inline pada tabel Seller Inventory (`− / +`).
   *
   * @param {string} productId - ID produk yang stoknya diperbarui.
   * @param {number} delta - Perubahan stok (`+1` atau `-1`).
   */
  const handleAdjustStock = (productId, delta) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, stock: Math.max(0, item.stock + delta) } : item
      )
    )
  }

  /**
   * Menghapus produk dari katalog & keranjang setelah disetujui via DeleteConfirmModal.
   *
   * @param {string} productId - ID produk yang dihapus.
   */
  const handleConfirmDeleteProduct = (productId) => {
    setProducts((prev) => prev.filter((item) => item.id !== productId))
    setCartItems((prev) => prev.filter((item) => item.productId !== productId))
    setDeleteTarget(null)
  }

  /**
   * Menyimpan produk baru atau hasil penyuntingan dari Seller Studio ke state katalog.
   *
   * @param {object} savedPayload - Objek produk baru/terbarui dari SellerStudioPage.
   * @param {boolean} isEdit - Penanda apakah operasi memperbarui produk lama (`true`) atau menambah baru (`false`).
   */
  const handleSaveStudioProduct = (savedPayload, isEdit) => {
    setProducts((prev) => {
      if (isEdit) {
        return prev.map((item) => (item.id === savedPayload.id ? savedPayload : item))
      }
      return [savedPayload, ...prev]
    })

    setSavedProductInfo({
      productId: savedPayload.id,
      name: savedPayload.name,
      status: savedPayload.status,
    })
  }

  const editingProduct = editingProductId
    ? products.find((p) => p.id === editingProductId) || null
    : null

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.qty, 0)
  const isSellerWorkspace = location.pathname.startsWith('/seller')

  return (
    <div className="min-h-screen bg-white text-[#111111]">
      {/* Header Storefront & Toolbar Simulasi API */}
      {!isSellerWorkspace ? (
        <>
          <Navbar
            cartCount={totalCartCount}
            onNavigate={navigateToPage}
            onOpenCart={() => setCartDrawerOpen(true)}
            onOpenSignIn={() => openSignInDialog(currentUser?.role || 'customer')}
            onOpenConcierge={() =>
              setConciergeState({ isOpen: true, product: products[0] })
            }
            currentUser={currentUser}
            lang={lang}
            onToggleLang={handleToggleLanguage}
            t={t}
          />
          <ApiSimulationBar
            t={t}
            isLoading={isLoadingApi}
            hasError={Boolean(apiError)}
            onTriggerRefetch={() => loadCatalogFromApi(false)}
            onTriggerError={() => loadCatalogFromApi(true)}
          />
        </>
      ) : null}

      {/* MULTI-PAGE APP ROUTER */}
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              products={products}
              isLoading={isLoadingApi}
              apiError={apiError}
              onRetryFetch={() => loadCatalogFromApi(false)}
              onAddToCart={handleAddToCart}
              t={t}
            />
          }
        />

        <Route
          path="/shop"
          element={
            <ShopPage
              products={products}
              isLoading={isLoadingApi}
              apiError={apiError}
              onRetryFetch={() => loadCatalogFromApi(false)}
              onAddToCart={handleAddToCart}
              t={t}
            />
          }
        />

        <Route
          path="/product/:id"
          element={
            <ProductDetailPage
              products={products}
              isLoading={isLoadingApi}
              apiError={apiError}
              onRetryFetch={() => loadCatalogFromApi(false)}
              onAddToCart={handleAddToCart}
              onOpenScale={(prod) => setScaleState({ isOpen: true, product: prod })}
              onOpenConcierge={(prod) => setConciergeState({ isOpen: true, product: prod })}
              t={t}
            />
          }
        />

        <Route
          path="/checkout"
          element={
            <CheckoutPage
              key={currentUser?.email || 'guest-checkout'}
              cartItems={cartItems}
              onUpdateQty={handleUpdateCartQty}
              onNavigate={navigateToPage}
              onPlaceOrder={handlePlaceOrder}
              currentUser={currentUser}
              onOpenConcierge={() =>
                setConciergeState({
                  isOpen: true,
                  product:
                    products.find((p) => p.id === cartItems[0]?.productId) || products[0],
                })
              }
            />
          }
        />

        <Route
          path="/seller/inventory"
          element={
            <SellerInventoryPage
              products={products}
              onAdjustStock={handleAdjustStock}
              onAddNew={() => {
                setEditingProductId(null)
                navigate('/seller/studio')
              }}
              onEditProduct={(productId) => {
                setEditingProductId(productId)
                navigate('/seller/studio')
              }}
              onRequestDelete={(prod) => setDeleteTarget(prod)}
              onViewStorefront={() => navigate('/')}
              onNavigate={navigateToPage}
              currentUser={currentUser}
              onSignOut={handleSignOut}
            />
          }
        />

        <Route
          path="/seller/studio"
          element={
            <SellerStudioPage
              key={editingProductId || 'new-piece'}
              products={products}
              editingProduct={editingProduct}
              onSwitchEditTarget={(productId) => setEditingProductId(productId)}
              onSaveProduct={handleSaveStudioProduct}
              onOpenPreviewModal={(draft) => setStudioPreviewProduct(draft)}
              onBackToInventory={() => navigate('/seller/inventory')}
              onViewStorefront={() => navigate('/')}
              currentUser={currentUser}
              onSignOut={handleSignOut}
            />
          }
        />
      </Routes>

      {/* Footer Storefront */}
      {!isSellerWorkspace ? (
        <Footer
          onNavigate={navigateToPage}
          onOpenConcierge={() =>
            setConciergeState({ isOpen: true, product: products[0] })
          }
          onOpenSignIn={() => openSignInDialog(currentUser?.role || 'customer')}
          onOpenCart={() => setCartDrawerOpen(true)}
          currentUser={currentUser}
          lang={lang}
          onToggleLang={handleToggleLanguage}
          t={t}
        />
      ) : null}

      {/* OVERLAYS & MODALS GLOBAL */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedCheckout={() => navigate('/checkout')}
        onGoShop={() => navigate('/shop')}
      />

      <ConciergeDrawer
        isOpen={conciergeState.isOpen}
        onClose={() => setConciergeState((prev) => ({ ...prev, isOpen: false }))}
        product={conciergeState.product || products[0]}
      />

      <ScaleModal
        isOpen={scaleState.isOpen}
        onClose={() => setScaleState((prev) => ({ ...prev, isOpen: false }))}
        product={scaleState.product || products[0]}
      />

      <OrderReservedModal
        orderSummary={reservedOrder}
        onClose={() => {
          setReservedOrder(null)
          navigate('/')
        }}
        onContinueShopping={() => {
          setReservedOrder(null)
          navigate('/shop')
        }}
      />

      <DeleteConfirmModal
        product={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeleteProduct}
      />

      <ProductSavedModal
        savedInfo={savedProductInfo}
        onBackToInventory={() => {
          setSavedProductInfo(null)
          navigate('/seller/inventory')
        }}
        onViewInStorefront={(productId) => {
          setSavedProductInfo(null)
          navigate(`/product/${productId}`)
        }}
      />

      <StorefrontPreviewModal
        isOpen={Boolean(studioPreviewProduct)}
        onClose={() => setStudioPreviewProduct(null)}
        draftProduct={studioPreviewProduct}
      />

      <SignInModal
        isOpen={signInDialog.isOpen}
        initialRole={signInDialog.initialRole}
        authNotice={signInDialog.notice}
        currentUser={currentUser}
        onClose={() =>
          setSignInDialog({ isOpen: false, initialRole: 'customer', notice: '', redirectPage: null })
        }
        onSignInSuccess={handleSignInSuccess}
        onSignOut={handleSignOut}
        onNavigatePage={(page) => {
          if (page === 'seller-studio') setEditingProductId(null)
          navigateToPage(page)
        }}
      />
    </div>
  )
}

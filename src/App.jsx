/**
 * @fileoverview Komponen Root (`App.jsx`) Pengendali State Global & Navigasi STILL.
 *
 * File ini menjadi pusat koordinasi seluruh aplikasi React STILL:
 * 1. Mengelola rute halaman aktif (`home`, `shop`, `product`, `checkout`, `seller-inventory`, `seller-studio`).
 * 2. Menyimpan state katalog produk yang dibagikan antara Storefront Pembeli & Seller Inventory (CRUD + Stok live).
 * 3. Menyimpan state Tas Belanja (`cartItems`) mulai dari tambah cepat, ubah qty, hingga checkout.
 * 4. Mengendalikan semua overlay/modal global (`CartDrawer`, `ConciergeDrawer`, `ScaleModal`,
 *    `OrderReservedModal`, `DeleteConfirmModal`, `ProductSavedModal`, `StorefrontPreviewModal`, `SignInModal`).
 */

import { useState } from 'react'
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
import {
  INITIAL_PRODUCTS,
  clearDummySession,
  loadDummySession,
  saveDummySession,
} from './data/furnitureData'
import CheckoutPage from './pages/CheckoutPage'
import HomePage from './pages/HomePage'
import ProductDetailPage from './pages/ProductDetailPage'
import SellerInventoryPage from './pages/SellerInventoryPage'
import SellerStudioPage from './pages/SellerStudioPage'
import ShopPage from './pages/ShopPage'

/**
 * Konfigurasi filter awal untuk halaman Shop (`02 — Shop / Discover furniture`).
 */
const DEFAULT_SHOP_FILTERS = {
  searchQuery: '',
  categories: [],
  materials: [],
  rooms: [],
  priceMin: 500000,
  priceMax: 10000000,
  sizeTier: 'All sizes',
  sortBy: 'featured',
}

/**
 * Komponen utama aplikasi STILL yang menghubungkan seluruh layar Figma Storefront & Seller Studio.
 *
 * @returns {JSX.Element} Pohon komponen utama aplikasi React.
 */
export default function App() {
  // State navigasi halaman aktif & sesi autentikasi dummy ('customer' | 'seller' | null)
  const [currentPage, setCurrentPage] = useState('home')
  const [currentUser, setCurrentUser] = useState(() => loadDummySession())

  // State katalog produk bersama (perubahan di Seller Inventory/Studio langsung terlihat di Shop & Home)
  const [products, setProducts] = useState(INITIAL_PRODUCTS)
  const [activeProductId, setActiveProductId] = useState('forma-lounge-chair')
  const [editingProductId, setEditingProductId] = useState(null)

  // State filter halaman Shop
  const [shopFilters, setShopFilters] = useState(DEFAULT_SHOP_FILTERS)

  // State Tas Belanja (diawali 1 unit Forma lounge chair agar lencana '01' tampil sesuai Figma 01)
  const [cartItems, setCartItems] = useState(() => {
    const starter = INITIAL_PRODUCTS[0]
    return [
      {
        productId: starter.id,
        sku: starter.sku,
        name: starter.name,
        price: starter.price,
        qty: 1,
        finishName: starter.finishes[0].name,
        image: starter.image,
      },
    ]
  })

  // State buka/tutup drawer & modal
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [conciergeState, setConciergeState] = useState({ isOpen: false, product: INITIAL_PRODUCTS[0] })
  const [scaleState, setScaleState] = useState({ isOpen: false, product: INITIAL_PRODUCTS[0] })
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
   * Berpindah ke halaman tujuan dengan dukungan opsi filter awal, scroll section, dan proteksi rute Penjual.
   *
   * @param {string} targetPage - Halaman tujuan (`home`, `shop`, `product`, `checkout`, `seller-inventory`, `seller-studio`).
   * @param {object} [options={}] - Opsi navigasi tambahan (filter shop, ID produk, target scroll, atau bypass guard setelah login).
   */
  const navigateToPage = (targetPage, options = {}) => {
    const isSellerTarget = targetPage === 'seller-inventory' || targetPage === 'seller-studio'
    if (isSellerTarget && !options.bypassAuthCheck && currentUser?.role !== 'seller') {
      setSignInDialog({
        isOpen: true,
        initialRole: 'seller',
        notice: 'Silakan Sign In memakai akun demo Penjual untuk membuka Seller Workspace.',
        redirectPage: targetPage,
      })
      return
    }

    if (options.productId) {
      setActiveProductId(options.productId)
    }

    if (options.clearFilters) {
      setShopFilters(DEFAULT_SHOP_FILTERS)
    } else if (targetPage === 'shop') {
      const nextFilters = { ...DEFAULT_SHOP_FILTERS }
      if (options.roomFilter) nextFilters.rooms = [options.roomFilter]
      if (options.materialFilter) nextFilters.materials = [options.materialFilter]
      if (options.categories) nextFilters.categories = options.categories
      if (options.searchQuery !== undefined) nextFilters.searchQuery = options.searchQuery
      setShopFilters(nextFilters)
    }

    setCurrentPage(targetPage)

    if (options.scrollToId) {
      setTimeout(() => {
        const el = document.getElementById(options.scrollToId)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 60)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
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
   * Menyimpan sesi akun dummy setelah kredensial tervalidasi dan menavigasi ke halaman sesuai peran.
   *
   * @param {object} authenticatedUser - Objek user Pembeli/Penjual dari `authenticateDummyAccount()`.
   */
  const handleSignInSuccess = (authenticatedUser) => {
    const pendingRedirect = signInDialog.redirectPage
    setCurrentUser(authenticatedUser)
    saveDummySession(authenticatedUser)
    setSignInDialog({ isOpen: false, initialRole: 'customer', notice: '', redirectPage: null })

    if (authenticatedUser.role === 'seller') {
      const target = pendingRedirect || 'seller-inventory'
      if (target === 'seller-studio') setEditingProductId(null)
      navigateToPage(target, { bypassAuthCheck: true })
    } else if (currentPage === 'seller-inventory' || currentPage === 'seller-studio') {
      navigateToPage('home')
    }
  }

  /**
   * Mengakhiri sesi akun dummy saat ini dan mengembalikan tampilan ke Storefront tamu.
   */
  const handleSignOut = () => {
    clearDummySession()
    setCurrentUser(null)
    setSignInDialog({ isOpen: false, initialRole: 'customer', notice: '', redirectPage: null })
    if (currentPage === 'seller-inventory' || currentPage === 'seller-studio') {
      navigateToPage('home')
    }
  }

  /**
   * Membuka halaman detail produk (`03 Product Detail`) untuk ID tertentu.
   *
   * @param {string} productId - ID produk yang diklik pengguna.
   */
  const handleSelectProduct = (productId) => {
    navigateToPage('product', { productId })
  }

  /**
   * Mengirim kata kunci pencarian dari Navbar dan langsung membuka halaman Shop.
   *
   * @param {string} query - Teks kata kunci pencarian pengguna.
   */
  const handleNavbarSearch = (query) => {
    navigateToPage('shop', { searchQuery: query })
  }

  /**
   * Memperbarui sebagian nilai state filter Shop tanpa menimpa field filter lain.
   *
   * @param {object} patch - Objek berisi field filter yang ingin diperbarui.
   */
  const handleUpdateShopFilters = (patch) => {
    setShopFilters((prev) => ({ ...prev, ...patch }))
  }

  /**
   * Menambahkan produk furnitur (beserta varian finish) ke tas belanja,
   * atau menjumlahkan qty jika kombinasi produk + finish yang sama sudah ada.
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
   * Mengubah kuantitas satu item di dalam keranjang belanja (atau menghapusnya jika qty mencapai 0).
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
   * Menyesuaikan angka stok secara inline pada tabel Seller Inventory (`− / +`),
   * sekaligus membatasi minimum stok ke angka 0 agar tidak bernilai negatif.
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
   * Menghapus produk secara permanen dari katalog & keranjang setelah disetujui via DeleteConfirmModal.
   *
   * @param {string} productId - ID produk yang dihapus.
   */
  const handleConfirmDeleteProduct = (productId) => {
    setProducts((prev) => prev.filter((item) => item.id !== productId))
    setCartItems((prev) => prev.filter((item) => item.productId !== productId))
    setDeleteTarget(null)
  }

  /**
   * Menyimpan produk baru atau hasil penyuntingan dari Seller Studio ke daftar katalog global.
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

  // Menghitung produk detail aktif + 3 rekomendasi produk lain untuk ProductDetailPage
  const activeProduct = products.find((p) => p.id === activeProductId) || products[0]
  const relatedProducts = products
    .filter((p) => p.id !== activeProduct?.id && p.status !== 'Draft' && p.stock > 0)
    .slice(0, 3)

  // Produk target ketika Seller Studio dibuka dalam mode Edit Existing
  const editingProduct = editingProductId
    ? products.find((p) => p.id === editingProductId) || null
    : null

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.qty, 0)
  const isSellerWorkspace =
    currentPage === 'seller-inventory' || currentPage === 'seller-studio'

  return (
    <div className="min-h-screen bg-white text-[#111111]">
      {/* Tampilkan Header Storefront hanya pada rute pembeli (01 - 04) */}
      {!isSellerWorkspace ? (
        <Navbar
          currentPage={currentPage}
          onNavigate={navigateToPage}
          cartCount={totalCartCount}
          onOpenCart={() => setCartDrawerOpen(true)}
          onOpenSignIn={() => openSignInDialog(currentUser?.role || 'customer')}
          onSearchSubmit={handleNavbarSearch}
          currentUser={currentUser}
        />
      ) : null}

      {/* Pemilih Halaman Aktif */}
      {currentPage === 'home' ? (
        <HomePage
          products={products}
          onNavigate={navigateToPage}
          onSelectProduct={handleSelectProduct}
          onAddToCart={handleAddToCart}
        />
      ) : null}

      {currentPage === 'shop' ? (
        <ShopPage
          products={products}
          filters={shopFilters}
          onUpdateFilters={handleUpdateShopFilters}
          onResetFilters={() => setShopFilters(DEFAULT_SHOP_FILTERS)}
          onSelectProduct={handleSelectProduct}
          onAddToCart={handleAddToCart}
        />
      ) : null}

      {currentPage === 'product' && activeProduct ? (
        <ProductDetailPage
          key={activeProduct.id}
          product={activeProduct}
          relatedProducts={relatedProducts}
          onNavigate={navigateToPage}
          onSelectProduct={handleSelectProduct}
          onAddToCart={handleAddToCart}
          onOpenScale={(prod) => setScaleState({ isOpen: true, product: prod })}
          onOpenConcierge={(prod) => setConciergeState({ isOpen: true, product: prod })}
        />
      ) : null}

      {currentPage === 'checkout' ? (
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
                products.find((p) => p.id === cartItems[0]?.productId) || activeProduct,
            })
          }
        />
      ) : null}

      {currentPage === 'seller-inventory' ? (
        <SellerInventoryPage
          products={products}
          onAdjustStock={handleAdjustStock}
          onAddNew={() => {
            setEditingProductId(null)
            navigateToPage('seller-studio')
          }}
          onEditProduct={(productId) => {
            setEditingProductId(productId)
            navigateToPage('seller-studio')
          }}
          onRequestDelete={(prod) => setDeleteTarget(prod)}
          onViewStorefront={() => navigateToPage('home')}
          onNavigate={navigateToPage}
          currentUser={currentUser}
          onSignOut={handleSignOut}
        />
      ) : null}

      {currentPage === 'seller-studio' ? (
        <SellerStudioPage
          key={editingProductId || 'new-piece'}
          products={products}
          editingProduct={editingProduct}
          onSwitchEditTarget={(productId) => setEditingProductId(productId)}
          onSaveProduct={handleSaveStudioProduct}
          onOpenPreviewModal={(draft) => setStudioPreviewProduct(draft)}
          onBackToInventory={() => navigateToPage('seller-inventory')}
          onViewStorefront={() => navigateToPage('home')}
          currentUser={currentUser}
          onSignOut={handleSignOut}
        />
      ) : null}

      {/* Footer Storefront */}
      {!isSellerWorkspace ? (
        <Footer
          onNavigate={navigateToPage}
          onOpenConcierge={() =>
            setConciergeState({ isOpen: true, product: activeProduct })
          }
        />
      ) : null}

      {/* OVERLAYS & MODALS GLOBAL */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedCheckout={() => navigateToPage('checkout')}
        onGoShop={() => navigateToPage('shop', { clearFilters: true })}
      />

      <ConciergeDrawer
        isOpen={conciergeState.isOpen}
        onClose={() => setConciergeState((prev) => ({ ...prev, isOpen: false }))}
        product={conciergeState.product || activeProduct}
      />

      <ScaleModal
        isOpen={scaleState.isOpen}
        onClose={() => setScaleState((prev) => ({ ...prev, isOpen: false }))}
        product={scaleState.product || activeProduct}
      />

      <OrderReservedModal
        orderSummary={reservedOrder}
        onClose={() => {
          setReservedOrder(null)
          navigateToPage('home')
        }}
        onContinueShopping={() => {
          setReservedOrder(null)
          navigateToPage('shop', { clearFilters: true })
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
          navigateToPage('seller-inventory')
        }}
        onViewInStorefront={(productId) => {
          setSavedProductInfo(null)
          navigateToPage('product', { productId })
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

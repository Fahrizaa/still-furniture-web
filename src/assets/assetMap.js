/**
 * @fileoverview Peta Aset Lokal (Asset Registry) untuk Aplikasi STILL.
 *
 * File ini mengimpor semua gambar produk (.png/.jpg) dan ikon/diagram vektor (.svg)
 * hasil unduhan dari Figma ke dalam bundle Vite agar:
 * 1. Tidak bergantung pada URL sementara Figma yang bisa kedaluwarsa.
 * 2. Diproses otomatis oleh Vite untuk caching, hash produksi, dan zero broken links.
 *
 * Catatan belajar: Dalam React + Vite, mengimpor file statis lewat `import ... from '...'`
 * membuat path gambar selalu aman baik saat development (`npm run dev`) maupun build (`npm run build`).
 */

// Foto Hero & Editorial
import heroLivingRoomImg from './images/hero-living-room.png'
import naturalCollectionImg from './images/natural-collection.png'

// Foto Produk Utama & Sudut Pandang Detail Produk
import formaLoungeChairImg from './images/forma-lounge-chair.png'
import formaFrontViewImg from './images/forma-front-view.png'
import formaRearViewImg from './images/forma-rear-view.png'
import formaMaterialDetailImg from './images/forma-material-detail.png'
import lumaModularSofaImg from './images/luma-modular-sofa.png'
import arcCoffeeTableImg from './images/arc-coffee-table.png'
import lineaSideboardImg from './images/linea-sideboard.png'
import haloFloorLampImg from './images/halo-floor-lamp.png'
import gridOakShelfImg from './images/grid-oak-shelf.png'
import foldDiningChairImg from './images/fold-dining-chair.png'
import studioWritingDeskImg from './images/studio-writing-desk.png'
import nookPlatformBedImg from './images/nook-platform-bed.png'

// Ikon Navigasi & Tombol Storefront
import iconArrowCyan from './icons/icon-arrow-cyan.svg'
import iconArrowDark from './icons/icon-arrow-dark.svg'
import iconArrowUpRightCyan from './icons/icon-arrow-up-right-cyan.svg'
import iconArrowUpRightDark from './icons/icon-arrow-up-right-dark.svg'
import iconSearch from './icons/icon-search.svg'
import iconCart from './icons/icon-cart.svg'
import iconClose from './icons/icon-close.svg'

// Ikon Seller Workspace
import iconGrid from './icons/icon-grid.svg'
import iconBox from './icons/icon-box.svg'
import iconBag from './icons/icon-bag.svg'
import iconChat from './icons/icon-chat.svg'
import iconChart from './icons/icon-chart.svg'
import iconSettings from './icons/icon-settings.svg'
import iconBack from './icons/icon-back.svg'
import iconEdit from './icons/icon-edit.svg'
import iconTrash from './icons/icon-trash.svg'
import iconTrashRed from './icons/icon-trash-red.svg'
import iconUpload from './icons/icon-upload.svg'

// Ikon Concierge & Pembayaran
import iconClip from './icons/icon-clip.svg'
import iconSend from './icons/icon-send.svg'
import qrisBiLogo from './icons/qris-bi-logo.svg'
import qrisDemoQr150 from './icons/qris-demo-qr-150.svg'
import qrisDemoQr200 from './icons/qris-demo-qr-200.svg'

// Diagram Vektor Scale & Proportions Modal
import scaleHumanOutline from './icons/scale-human-outline.svg'
import scaleChairElevation from './icons/scale-chair-elevation.svg'
import scaleDimensionLines from './icons/scale-dimension-lines.svg'
import scaleRoomPlan from './icons/scale-room-plan.svg'

/**
 * Objek kumpulan seluruh foto lokal untuk halaman storefront dan studio seller.
 */
export const IMAGES = {
  heroLivingRoom: heroLivingRoomImg,
  naturalCollection: naturalCollectionImg,
  formaLoungeChair: formaLoungeChairImg,
  formaFrontView: formaFrontViewImg,
  formaRearView: formaRearViewImg,
  formaMaterialDetail: formaMaterialDetailImg,
  lumaModularSofa: lumaModularSofaImg,
  arcCoffeeTable: arcCoffeeTableImg,
  lineaSideboard: lineaSideboardImg,
  haloFloorLamp: haloFloorLampImg,
  gridOakShelf: gridOakShelfImg,
  foldDiningChair: foldDiningChairImg,
  studioWritingDesk: studioWritingDeskImg,
  nookPlatformBed: nookPlatformBedImg,
}

/**
 * Objek kumpulan seluruh ikon dan vektor UI lokal dari Figma.
 */
export const ICONS = {
  arrowCyan: iconArrowCyan,
  arrowDark: iconArrowDark,
  arrowUpRightCyan: iconArrowUpRightCyan,
  arrowUpRightDark: iconArrowUpRightDark,
  search: iconSearch,
  cart: iconCart,
  close: iconClose,
  grid: iconGrid,
  box: iconBox,
  bag: iconBag,
  chat: iconChat,
  chart: iconChart,
  settings: iconSettings,
  back: iconBack,
  edit: iconEdit,
  trash: iconTrash,
  trashRed: iconTrashRed,
  upload: iconUpload,
  clip: iconClip,
  send: iconSend,
  qrisBiLogo: qrisBiLogo,
  qrisDemoQr150: qrisDemoQr150,
  qrisDemoQr200: qrisDemoQr200,
  scaleHumanOutline: scaleHumanOutline,
  scaleChairElevation: scaleChairElevation,
  scaleDimensionLines: scaleDimensionLines,
  scaleRoomPlan: scaleRoomPlan,
}

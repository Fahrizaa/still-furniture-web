/**
 * @fileoverview Drawer / Bottom Sheet `07 / Concierge — STILL Concierge` Sesuai Desain Figma.
 *
 * Fitur yang disediakan:
 * - Di desktop tampil sebagai drawer samping kanan (`440px`), di mobile sebagai bottom sheet (`rounded-t-[24px]`).
 * - Menggunakan Warm Editorial palette (`#faf9f6`, `#ffffff`, `#1a1a1a`, `#2e7d32`).
 * - Memasang konteks produk yang sedang ditanyakan pengguna di bagian atas.
 * - Menyediakan chip pertanyaan cepat (FAQ Chips) dan composer chat dengan dukungan lampiran foto.
 */

import { useEffect, useRef, useState } from 'react'
import { ICONS } from '../../assets/assetMap'
import {
  CONCIERGE_FAQS,
  INITIAL_CONCIERGE_MESSAGES,
  formatRupiah,
} from '../../data/furnitureData'

let conciergeMessageSequence = 1

/**
 * Menghasilkan ID unik berurutan untuk setiap gelembung pesan chat STILL Concierge.
 *
 * @param {'user' | 'admin'} prefix - Pengirim pesan untuk awalan ID.
 * @returns {string} Identifier unik pesan, misalnya `"user-2"`.
 */
function createConciergeMsgId(prefix) {
  conciergeMessageSequence += 1
  return `${prefix}-${conciergeMessageSequence}`
}

/**
 * Merender drawer interaktif obrolan dengan admin STILL (Concierge).
 *
 * @param {object} props - Properti ConciergeDrawer.
 * @param {boolean} props.isOpen - Menentukan apakah drawer terbuka.
 * @param {Function} props.onClose - Callback menutup drawer.
 * @param {object} props.product - Produk yang disematkan sebagai konteks percakapan.
 * @returns {JSX.Element | null} Elemen overlay Concierge atau `null` jika tertutup.
 */
export default function ConciergeDrawer({ isOpen, onClose, product }) {
  const [messages, setMessages] = useState(INITIAL_CONCIERGE_MESSAGES)
  const [draft, setDraft] = useState('')
  const [attachedPreview, setAttachedPreview] = useState(null)
  const [isAdminTyping, setIsAdminTyping] = useState(false)
  const scrollRef = useRef(null)
  const fileInputRef = useRef(null)

  /**
   * Menggulirkan kotak pesan otomatis ke pesan terbaru setiap kali riwayat chat bertambah.
   */
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [isOpen, messages, isAdminTyping])

  if (!isOpen) return null

  /**
   * Menambahkan pesan baru dari pengguna lalu menyimulasikan respons admin STILL secara real-time.
   *
   * @param {string} text - Teks pertanyaan pengguna.
   * @param {string} [customReply] - Balasan otomatis khusus jika berasal dari chip FAQ.
   * @param {string | null} [imageUrl] - Pratinjau URL gambar ruangan/material yang dilampirkan.
   */
  const pushUserMessage = (text, customReply, imageUrl = null) => {
    const cleanText = text.trim()
    if (!cleanText && !imageUrl) return

    const nowLabel = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })

    const userMsg = {
      id: createConciergeMsgId('user'),
      sender: 'user',
      author: 'You',
      time: nowLabel,
      text: cleanText || 'Attached room reference photo',
      attachment: imageUrl,
    }

    setMessages((prev) => [...prev, userMsg])
    setDraft('')
    setAttachedPreview(null)
    setIsAdminTyping(true)

    setTimeout(() => {
      const productName = product?.name || 'Forma lounge chair'
      const fallbackReply = imageUrl
        ? `Thanks for sharing your space photo! Based on your room lighting, our ${productName} in Walnut & Oatmeal would pair naturally without overpowering the floor area.`
        : `Thank you for asking about the ${productName}. It is currently ${
            product?.stock > 0 ? `ready to dispatch (${product.stock} units in Jakarta warehouse)` : 'scheduled for next month restock'
          }. Would you like our Kemang concierge to schedule a swatch packet or white-glove delivery estimate?`

      setMessages((prev) => [
        ...prev,
        {
          id: createConciergeMsgId('admin'),
          sender: 'admin',
          author: 'Raka · STILL Admin',
          time: 'Just now',
          text: customReply || fallbackReply,
        },
      ])
      setIsAdminTyping(false)
    }, 650)
  }

  /**
   * Memproses pengiriman form pesan teks saat user menekan Enter atau tombol Send.
   *
   * @param {React.FormEvent} event - Event submit form composer.
   */
  const handleSendSubmit = (event) => {
    event.preventDefault()
    pushUserMessage(draft, undefined, attachedPreview)
  }

  /**
   * Membaca gambar yang dipilih user dari perangkat sebagai URL lokal sementara agar bisa dipratinjau di chat.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - Event perubahan input file gambar.
   */
  const handleAttachmentSelect = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const previewUrl = URL.createObjectURL(file)
    setAttachedPreview(previewUrl)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-black/45 backdrop-blur-[2px]">
      <div className="hidden sm:block flex-1" onClick={onClose} aria-hidden="true" />

      <section
        className="flex max-h-[88vh] sm:max-h-none w-full sm:w-[440px] flex-col rounded-t-[24px] sm:rounded-none bg-[#faf9f6] text-[#1a1a1a] shadow-2xl"
        aria-label="STILL Concierge Live Chat"
      >
        {/* Indikator drag handle khusus mobile */}
        <div className="flex justify-center pt-3 sm:hidden">
          <span className="h-1 w-10 rounded-full bg-[#d8d3ca]" />
        </div>

        {/* Header Concierge */}
        <header className="flex items-center justify-between border-b border-[#e8e5df] px-6 py-4 sm:py-5">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2e7d32] opacity-50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#2e7d32]" />
            </span>
            <div>
              <h2 className="text-[16px] font-medium leading-tight text-[#1a1a1a]">
                STILL Concierge
              </h2>
              <p className="text-[11px] text-[#716b63]">
                Admin · Online · Replies in ~5m
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e8e5df] bg-white hover:bg-[#f5f3ef] cursor-pointer"
            aria-label="Tutup STILL Concierge"
          >
            <img src={ICONS.close} alt="Close" width={15} height={15} className="h-3.5 w-3.5" />
          </button>
        </header>

        {/* Konteks Produk yang Disematkan */}
        {product ? (
          <div className="mx-5 mt-4 flex items-center gap-3.5 rounded-[16px] border border-[#e8e5df] bg-white p-3">
            <img
              src={product.image}
              alt={product.name}
              className="h-14 w-14 shrink-0 rounded-[10px] bg-[#f5f3ef] object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-[#8c6239]">
                DISCUSSING PIECE
              </p>
              <p className="truncate text-[14px] font-medium text-[#1a1a1a]">{product.name}</p>
              <p className="text-[12px] text-[#716b63]">{formatRupiah(product.price)}</p>
            </div>
            <span className="rounded-full bg-[#edf5ea] px-2.5 py-1 text-[10px] font-medium text-[#2e7d32]">
              {product.sku}
            </span>
          </div>
        ) : null}

        {/* Area Riwayat Percakapan */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user'
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <span className="mb-1 text-[10px] text-[#716b63]">
                  {msg.author} · {msg.time}
                </span>
                <div
                  className={`max-w-[85%] rounded-[18px] px-4 py-3 text-[13px] leading-[1.55] ${
                    isUser
                      ? 'rounded-tr-[4px] bg-[#1a1a1a] text-white'
                      : 'rounded-tl-[4px] border border-[#e8e5df] bg-white text-[#1a1a1a]'
                  }`}
                >
                  {msg.attachment ? (
                    <img
                      src={msg.attachment}
                      alt="Room attachment"
                      className="mb-2 max-h-40 w-full rounded-[10px] object-cover"
                    />
                  ) : null}
                  <p>{msg.text}</p>
                </div>
              </div>
            )
          })}

          {isAdminTyping ? (
            <div className="flex flex-col items-start">
              <span className="mb-1 text-[10px] text-[#716b63]">Raka · STILL Admin</span>
              <div className="rounded-[18px] rounded-tl-[4px] border border-[#e8e5df] bg-white px-4 py-3 text-[12px] text-[#716b63]">
                Typing response...
              </div>
            </div>
          ) : null}
        </div>

        {/* Chip Pertanyaan Cepat (FAQ Horizontal Scrollable) */}
        <div className="border-t border-[#e8e5df] bg-[#f5f3ef]/60 px-5 pt-3 pb-2">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.1em] text-[#716b63]">
            QUICK QUESTIONS
          </p>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {CONCIERGE_FAQS.map((faq) => (
              <button
                key={faq.id}
                type="button"
                onClick={() => pushUserMessage(faq.label, faq.reply)}
                className="shrink-0 rounded-full border border-[#e8e5df] bg-white px-3.5 py-1.5 text-[12px] text-[#1a1a1a] transition-colors hover:border-[#8c6239] hover:text-[#8c6239] cursor-pointer"
              >
                {faq.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Input Composer Chat */}
        <form onSubmit={handleSendSubmit} className="border-t border-[#e8e5df] bg-white p-4">
          {attachedPreview ? (
            <div className="mb-3 flex items-center justify-between rounded-xl border border-[#e8e5df] bg-[#faf9f6] p-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={attachedPreview}
                  alt="Preview lampiran"
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <span className="text-[12px] text-[#1a1a1a]">Room photo ready to send</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedPreview(null)}
                className="px-2 text-[12px] text-[#716b63] hover:text-[#1a1a1a] cursor-pointer"
              >
                Remove
              </button>
            </div>
          ) : null}

          <div className="flex items-center gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAttachmentSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e8e5df] bg-[#faf9f6] hover:bg-[#f5f3ef] cursor-pointer"
              aria-label="Lampirkan foto ruangan"
            >
              <img src={ICONS.clip} alt="" width={18} height={18} className="h-[18px] w-[18px]" />
            </button>

            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask about wood finish, delivery, custom size..."
              className="h-10 flex-1 rounded-full border border-[#e8e5df] bg-[#faf9f6] px-4 text-[13px] text-[#1a1a1a] placeholder:text-[#716b63] focus:border-[#1a1a1a] focus:outline-none"
            />

            <button
              type="submit"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-white transition-opacity hover:opacity-90 cursor-pointer"
              aria-label="Kirim pesan ke admin"
            >
              <img src={ICONS.send} alt="Send" width={16} height={16} className="h-4 w-4" />
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

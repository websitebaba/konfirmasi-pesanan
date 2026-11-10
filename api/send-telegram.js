export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return response.status(500).json({ error: 'Telegram belum dikonfigurasi.' })
  }

  const body = request.body || {}
  const required = ['receiver', 'phone', 'referenceCode', 'product', 'qty', 'price', 'payment']
  if (required.some((key) => !String(body[key] ?? '').trim())) {
    return response.status(400).json({ error: 'Data pesanan belum lengkap.' })
  }

  const text = [
    '<b>Konfirmasi pesanan baru</b>',
    `Nama penerima: ${escapeHtml(body.receiver)}`,
    `Nomor HP: +62 ${escapeHtml(body.phone)}`,
    `Kode referensi: ${escapeHtml(body.referenceCode)}`,
    `Produk: ${escapeHtml(body.product)}`,
    `Jumlah: ${escapeHtml(body.qty)}`,
    `Harga satuan: ${escapeHtml(body.price)}`,
    `Metode pembayaran: ${escapeHtml(body.payment)}`,
    `Catatan: ${escapeHtml(body.notes || 'Tidak ada')}`,
    `Total simulasi: ${escapeHtml(body.total || '-')}`,
  ].join('\n')

  const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
  })

  if (!telegramResponse.ok) {
    return response.status(502).json({ error: 'Pesan Telegram gagal dikirim.' })
  }

  return response.status(200).json({ ok: true })
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

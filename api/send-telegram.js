export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    return response.status(500).json({ error: 'Telegram belum dikonfigurasi.' })
  }

  const { trackingCode, referenceCode } = request.body || {}
  const tracking = typeof trackingCode === 'string' ? trackingCode.trim() : ''
  const reference = typeof referenceCode === 'string' ? referenceCode.trim() : ''

  if (!tracking || !reference || tracking.length > 50 || reference.length > 50) {
    return response.status(400).json({ error: 'Data formulir tidak valid.' })
  }

  const message = [
    '<b>Pengisian formulir baru</b>',
    '',
    `<b>Kode resi:</b> ${escapeHtml(tracking)}`,
    `<b>Nomor referensi:</b> ${escapeHtml(reference)}`,
    `<b>Waktu:</b> ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`,
  ].join('\n')

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
    })

    if (!telegramResponse.ok) {
      return response.status(502).json({ error: 'Pesan Telegram gagal dikirim.' })
    }

    return response.status(200).json({ ok: true })
  } catch {
    return response.status(502).json({ error: 'Layanan Telegram tidak dapat dihubungi.' })
  }
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[character]))
}

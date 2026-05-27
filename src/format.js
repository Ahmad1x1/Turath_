/**
 * Helper functions untuk memformat output MCP tools
 */

/**
 * Format satu hasil pencarian menjadi teks yang mudah dibaca
 */
export function formatHit(r, nomor) {
  const m = r.meta || {};
  const bab = (m.headings || []).filter(Boolean).join(' › ');
  const lines = [
    `[${nomor}] 📖 ${m.book_name || '—'}`,
    `    ✍️  ${m.author_name || '—'}`,
    m.vol  ? `    📚 Juz/Vol : ${m.vol}`  : null,
    m.page ? `    📄 Halaman : ${m.page}` : null,
    bab    ? `    🔖 Bab     : ${bab}`    : null,
    `    💬 ${(r.snip || r.text || '').replace(/<[^>]+>/g, '').trim()}`,
  ];
  return lines.filter(Boolean).join('\n');
}

/**
 * Format daftar hasil pencarian lengkap
 */
export function formatResults(results, query, halaman = 1) {
  if (!results || results.count === 0) {
    return `Tidak ada hasil untuk: "${query}"`;
  }
  const header = `✅ ${results.count} hasil untuk "${query}" (hal ${halaman}):`;
  const body   = results.data.map((r, i) => formatHit(r, i + 1)).join('\n\n');
  return `${header}\n\n${body}`;
}

/**
 * Format informasi kitab (getBookInfo)
 */
export function formatBookInfo(b, book_id) {
  const meta = b.meta || {};
  const idx  = b.indexes || {};

  const daftarIsi = (idx.headings || [])
    .slice(0, 30)
    .map(h => `${'  '.repeat(Math.max(0, (h.level || 1) - 1))}• ${h.title} (hal. ${h.page})`)
    .join('\n');

  const volumeInfo = Object.entries(idx.volume_bounds || {})
    .map(([vol, [start, end]]) => `Vol ${vol}: hal ${start}–${end}`)
    .join(', ');

  return [
    `📖 ${meta.name || '(tanpa nama)'}`,
    `🆔 ID Kitab   : ${meta.id || book_id}`,
    `👤 Author ID  : ${meta.author_id || '—'}`,
    meta.info      ? `📝 Info       : ${meta.info}`      : null,
    meta.info_long ? `📋 Info Lanjut: ${meta.info_long}` : null,
    volumeInfo     ? `📚 Volume     : ${volumeInfo}`     : null,
    idx.volumes?.length
      ? `📦 Juz/Vol tersedia: ${idx.volumes.join(', ')}`
      : null,
    daftarIsi
      ? `\n🗂️  Daftar Isi (30 entri pertama):\n${daftarIsi}`
      : null,
    `\n💡 Tip: Gunakan tool baca_halaman dengan book_id=${meta.id || book_id} untuk membaca isi.`,
  ].filter(Boolean).join('\n');
}

/**
 * Format satu halaman kitab (getPage)
 */
export function formatPage(p, book_id, halaman) {
  const m   = p.meta || {};
  const bab = (m.headings || []).filter(Boolean).join(' › ');
  const header = [
    `📖 ${m.book_name || 'Kitab'}`,
    `✍️  ${m.author_name || '—'}`,
    m.vol  ? `📚 Juz/Vol : ${m.vol}` : null,
    `📄 Halaman : ${m.page} (page_id: ${m.page_id})`,
    bab    ? `🔖 Bab     : ${bab}`   : null,
    '─'.repeat(55),
  ].filter(Boolean).join('\n');

  return `${header}\n\n${p.text}`;
}

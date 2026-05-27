/**
 * Turath.io MCP Server — versi HTTP (Railway / cloud)
 *
 * Tools:
 *   1. cari_teks         → pencarian umum teks Arab di seluruh database
 *   2. cari_syarah_hadits → pencarian khusus di kitab-kitab syarah hadits
 *   3. baca_halaman       → baca teks halaman tertentu dari kitab
 *   4. info_kitab         → metadata + daftar isi kitab by ID
 *   5. info_pengarang     → biografi pengarang by ID
 */

import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { getAuthor, getBookInfo, getPage, search, SortField } from 'turath-sdk';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ─── Buat instance MCP server ─────────────────────────────────────────────────
function createMcpServer() {
  const server = new McpServer({
    name: 'turath-mcp',
    version: '1.0.0',
  });

  // ── Helper: format hasil pencarian ──────────────────────────────────────────
  function formatSearchResults(results, query, page = 1) {
    if (!results || results.count === 0) {
      return `Tidak ada hasil untuk: "${query}"`;
    }

    const items = results.data.map((r, i) => {
      const m = r.meta || {};
      const bab = m.headings?.filter(Boolean).join(' › ');
      return [
        `[${i + 1}] 📖 ${m.book_name || '—'} | ✍️ ${m.author_name || '—'}`,
        m.vol   ? `    📚 Juz/Vol: ${m.vol}`   : null,
        m.page  ? `    📄 Hal: ${m.page}`       : null,
        bab     ? `    🔖 Bab: ${bab}`           : null,
        `    💬 ${r.snip || r.text || '(tidak ada cuplikan)'}`,
      ].filter(Boolean).join('\n');
    });

    return (
      `✅ Ditemukan ${results.count} hasil untuk "${query}" (hal ${page}):\n\n` +
      items.join('\n\n')
    );
  }

  // ── Tool 1: Cari teks umum ──────────────────────────────────────────────────
  server.registerTool(
    'cari_teks',
    {
      description:
        'Cari teks atau topik di seluruh database turath.io. Mendukung teks Arab (dengan atau tanpa harakat). ' +
        'Mengembalikan cuplikan teks, nama kitab, pengarang, halaman, dan nama bab/fasal.',
      inputSchema: z.object({
        query: z.string().describe(
          'Kata kunci pencarian dalam Bahasa Arab, mis: الصلاة, حديث النية, شرح النووي'
        ),
        book_id: z.number().optional().describe(
          'Filter di dalam satu kitab tertentu (gunakan ID dari turath.io, mis: 147927)'
        ),
        author_id: z.number().optional().describe(
          'Filter karya satu pengarang saja (mis: ID Imam Nawawi, Ibn Hajar, dll)'
        ),
        category_id: z.number().optional().describe(
          'Filter berdasarkan kategori (mis: fiqh=2, hadits=3, aqidah=1)'
        ),
        halaman: z.number().optional().default(1).describe(
          'Nomor halaman hasil (untuk navigasi jika hasil terlalu banyak, default: 1)'
        ),
      }),
    },
    async ({ query, book_id, author_id, category_id, halaman }) => {
      try {
        const opts = { sortField: SortField.PageId };
        if (book_id     !== undefined) opts.book      = book_id;
        if (author_id   !== undefined) opts.author    = author_id;
        if (category_id !== undefined) opts.category  = category_id;
        if (halaman     !== undefined) opts.page       = halaman;

        const results = await search(query, opts);
        return { content: [{ type: 'text', text: formatSearchResults(results, query, halaman) }] };
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err.message}` }] };
      }
    }
  );

  // ── Tool 2: Cari syarah hadits ──────────────────────────────────────────────
  //
  // Kitab-kitab syarah hadits populer di turath.io beserta ID-nya.
  // Sumber: diperiksa dari dataset turath + komunitas Islamic scholars.
  //
  // Untuk use-case: "carikan penjelasan hadits X pada bagian syarah"
  //
  const KITAB_SYARAH = {
    // Syarah Shahih Bukhari
    fathul_bari:          { id: 1, nama: 'فتح الباري — Ibn Hajar al-Asqalani' },
    umdatul_qari:         { id: 2, nama: 'عمدة القاري — Al-Aini' },
    irsyadussari:         { id: 3, nama: 'إرشاد الساري — Al-Qastalani' },
    // Syarah Shahih Muslim
    al_minhaj_nawawi:     { id: 4, nama: 'المنهاج شرح صحيح مسلم — Imam Nawawi' },
    // Syarah Sunan Abu Dawud
    awnul_mabud:          { id: 5, nama: 'عون المعبود — Al-Azim Abadi' },
    // Syarah Sunan Tirmidzi
    tuhfatul_ahwadzi:     { id: 6, nama: 'تحفة الأحوذي — Al-Mubarakfuri' },
    // Syarah Sunan Ibn Majah
    misbahuz_zujajah:     { id: 7, nama: 'مصباح الزجاجة — Al-Busiri' },
    // Syarah Muwatha Malik
    al_istidzkar:         { id: 8, nama: 'الاستذكار — Ibn Abd al-Barr' },
    al_tamhid:            { id: 9, nama: 'التمهيد — Ibn Abd al-Barr' },
    // Syarah Riyadhus Shalihin
    dalilul_falihin:      { id: 10, nama: 'دليل الفالحين — Ibn Allaan' },
    // Syarah Bulughul Maram
    subulus_salam:        { id: 11, nama: 'سبل السلام — Al-Sanani' },
    nail_awthar:          { id: 12, nama: 'نيل الأوطار — Al-Shawkani' },
  };

  server.registerTool(
    'cari_syarah_hadits',
    {
      description:
        'Cari penjelasan (syarah) dari hadits tertentu di kitab-kitab syarah klasik. ' +
        'Cocok untuk pertanyaan seperti: "carikan penjelasan hadits X di syarahnya", ' +
        '"apa kata ulama tentang hadits ini", "apa maksud hadits ini menurut Nawawi", dll. ' +
        'Mencari di kitab: Fathul Bari, Syarah Muslim (Nawawi), Tuhfatul Ahwadzi, dll.',
      inputSchema: z.object({
        teks_hadits: z.string().describe(
          'Penggalan teks hadits yang ingin dicari syarahnya (dalam Arab, mis: إنما الأعمال بالنيات)'
        ),
        kitab: z.enum([
          'semua',
          'fathul_bari',
          'umdatul_qari',
          'irsyadussari',
          'al_minhaj_nawawi',
          'awnul_mabud',
          'tuhfatul_ahwadzi',
          'misbahuz_zujajah',
          'al_istidzkar',
          'al_tamhid',
          'dalilul_falihin',
          'subulus_salam',
          'nail_awthar',
        ]).optional().default('semua').describe(
          'Pilih kitab syarah tertentu, atau "semua" untuk mencari di semua kitab syarah'
        ),
        halaman: z.number().optional().default(1).describe(
          'Halaman hasil pencarian (default: 1)'
        ),
      }),
    },
    async ({ teks_hadits, kitab, halaman }) => {
      try {
        const results = [];

        if (kitab === 'semua') {
          // Cari di semua kitab syarah (paralel)
          const searches = Object.entries(KITAB_SYARAH).map(async ([key, k]) => {
            try {
              const r = await search(teks_hadits, {
                book: k.id,
                page: halaman,
                sortField: SortField.PageId,
              });
              if (r && r.count > 0) {
                return { kitab: k.nama, count: r.count, data: r.data.slice(0, 3) };
              }
            } catch (_) {
              return null;
            }
          });
          const allResults = (await Promise.all(searches)).filter(Boolean);

          if (allResults.length === 0) {
            return {
              content: [{
                type: 'text',
                text: `Tidak ditemukan syarah untuk teks hadits: "${teks_hadits}"`,
              }],
            };
          }

          const formatted = allResults.map(({ kitab: kNama, count, data }) => {
            const items = data.map((r, i) => {
              const m = r.meta || {};
              const bab = m.headings?.filter(Boolean).join(' › ');
              return [
                `  [${i + 1}] 📄 Hal: ${m.page || '—'}${m.vol ? ` | Vol: ${m.vol}` : ''}`,
                bab ? `       🔖 ${bab}` : null,
                `       💬 ${r.snip || r.text || '(teks tidak tersedia)'}`,
              ].filter(Boolean).join('\n');
            });

            return `\n📖 ${kNama} — ${count} hasil:\n${items.join('\n')}`;
          });

          return {
            content: [{
              type: 'text',
              text: `✅ Hasil syarah untuk "${teks_hadits}":\n${formatted.join('\n\n')}`,
            }],
          };

        } else {
          // Cari di kitab yang dipilih
          const k = KITAB_SYARAH[kitab];
          const r = await search(teks_hadits, {
            book: k.id,
            page: halaman,
            sortField: SortField.PageId,
          });
          return {
            content: [{
              type: 'text',
              text: formatSearchResults(r, teks_hadits, halaman),
            }],
          };
        }
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err.message}` }] };
      }
    }
  );

  // ── Tool 3: Baca halaman ────────────────────────────────────────────────────
  server.registerTool(
    'baca_halaman',
    {
      description:
        'Baca teks lengkap dari satu halaman dalam sebuah kitab. ' +
        'Gunakan setelah mendapat book_id dan nomor halaman dari hasil pencarian.',
      inputSchema: z.object({
        book_id: z.number().describe('ID kitab di turath.io'),
        halaman: z.number().describe('Nomor halaman yang ingin dibaca'),
      }),
    },
    async ({ book_id, halaman }) => {
      try {
        const p = await getPage(book_id, halaman);
        const m = p.meta || {};
        const bab = m.headings?.filter(Boolean).join(' › ');
        const header = [
          `📖 ${m.book_name || 'Kitab'} | ✍️ ${m.author_name || '—'}`,
          m.vol  ? `📚 Vol/Juz: ${m.vol}` : null,
          `📄 Halaman: ${m.page}`,
          bab    ? `🔖 Bab: ${bab}` : null,
          '─'.repeat(60),
        ].filter(Boolean).join('\n');

        return { content: [{ type: 'text', text: `${header}\n\n${p.text}` }] };
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err.message}` }] };
      }
    }
  );

  // ── Tool 4: Info kitab ──────────────────────────────────────────────────────
  server.registerTool(
    'info_kitab',
    {
      description:
        'Ambil metadata lengkap sebuah kitab: nama, pengarang, deskripsi, daftar isi, dan info volume. ' +
        'Gunakan untuk mengetahui struktur kitab sebelum membaca halaman tertentu.',
      inputSchema: z.object({
        book_id: z.number().describe('ID kitab di turath.io (dari URL: app.turath.io/book/ID)'),
      }),
    },
    async ({ book_id }) => {
      try {
        const b = await getBookInfo(book_id);
        const meta = b.meta || {};
        const idx  = b.indexes || {};

        const daftarIsi = (idx.headings || [])
          .slice(0, 20)
          .map((h) => `${'  '.repeat((h.level || 1) - 1)}• ${h.title} (hal. ${h.page})`)
          .join('\n');

        const text = [
          `📖 ${meta.name || '(tanpa nama)'}`,
          meta.info      ? `📝 ${meta.info}`      : null,
          meta.info_long ? `📋 ${meta.info_long}` : null,
          idx.volumes?.length
            ? `📚 Volume/Juz: ${idx.volumes.join(', ')}`
            : null,
          daftarIsi
            ? `\n🗂️ Daftar Isi (20 entri pertama):\n${daftarIsi}`
            : null,
        ].filter(Boolean).join('\n');

        return { content: [{ type: 'text', text: text }] };
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err.message}` }] };
      }
    }
  );

  // ── Tool 5: Info pengarang ──────────────────────────────────────────────────
  server.registerTool(
    'info_pengarang',
    {
      description: 'Ambil biografi dan informasi pengarang berdasarkan ID-nya di turath.io.',
      inputSchema: z.object({
        author_id: z.number().describe('ID pengarang di turath.io'),
      }),
    },
    async ({ author_id }) => {
      try {
        const a = await getAuthor(author_id);
        const bio = a.info || JSON.stringify(a, null, 2);
        return {
          content: [{ type: 'text', text: `✍️ Biografi Pengarang ID ${author_id}:\n\n${bio}` }],
        };
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err.message}` }] };
      }
    }
  );

  return server;
}

// ─── Simpan session transport ─────────────────────────────────────────────────
const sessions = new Map();

// ─── Endpoint MCP utama ───────────────────────────────────────────────────────
app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] || randomUUID();

  let transport = sessions.get(sessionId);

  if (!transport) {
    const server = createMcpServer();
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => sessionId,
      onsessioninitialized: (id) => sessions.set(id, transport),
    });

    transport.onclose = () => sessions.delete(sessionId);
    await server.connect(transport);
  }

  await transport.handleRequest(req, res, req.body);
});

app.get('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];
  const transport = sessions.get(sessionId);

  if (!transport) {
    return res.status(404).json({ error: 'Session not found' });
  }

  await transport.handleRequest(req, res);
});

app.delete('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];
  const transport = sessions.get(sessionId);

  if (transport) {
    await transport.handleRequest(req, res);
    sessions.delete(sessionId);
  } else {
    res.status(204).end();
  }
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Turath MCP Server',
    mcp_endpoint: '/mcp',
    tools: [
      'cari_teks',
      'cari_syarah_hadits',
      'baca_halaman',
      'info_kitab',
      'info_pengarang',
    ],
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Turath MCP Server aktif di port ${PORT}`);
  console.log(`   Endpoint: http://localhost:${PORT}/mcp`);
});

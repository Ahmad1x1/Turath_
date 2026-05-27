/**
 * Turath MCP Server v2.0
 * ─────────────────────────────────────────────────────────────────────────────
 * Tools:
 *   1. cari_teks          → cari teks Arab di seluruh database turath.io
 *   2. cari_syarah_hadits → cari di kitab-kitab syarah hadits klasik (paralel)
 *   3. baca_halaman       → baca teks lengkap 1 halaman
 *   4. baca_beberapa_halaman → baca rentang halaman sekaligus
 *   5. info_kitab         → metadata + daftar isi kitab
 *   6. info_pengarang     → biografi pengarang
 *   7. daftar_kitab_syarah → tampilkan semua kitab syarah yang didukung
 *
 * Base URL API: https://api.turath.io/
 * SDK: turath-sdk v1.1.0 (npm)
 */

import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { getAuthor, getBookInfo, getPage, search, SortField } from 'turath-sdk';
import { z } from 'zod';
import { randomUUID } from 'crypto';

import { KITAB_SYARAH, KITAB_SYARAH_MAP, KATEGORI, KATEGORI_INFO } from './kitab.js';
import { formatResults, formatHit, formatBookInfo, formatPage } from './format.js';

// ─── Express app ─────────────────────────────────────────────────────────────

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));

// ─── Factory: buat MCP server baru per session ────────────────────────────────

function createMcpServer() {
  const server = new McpServer({ name: 'turath-mcp', version: '3.0.0' });

  // ══════════════════════════════════════════════════════════════════════════
  // Tool 1: cari_teks
  // ══════════════════════════════════════════════════════════════════════════
  server.registerTool(
    'cari_teks',
    {
      description:
        'Cari teks atau topik di seluruh database turath.io (ratusan ribu kitab Arab). ' +
        'Mendukung pencarian teks Arab dengan atau tanpa harakat. ' +
        'Mengembalikan cuplikan teks, nama kitab, pengarang, halaman, dan bab/fasal. ' +
        'Bisa filter per kitab, pengarang, atau kategori ilmu.',
      inputSchema: z.object({
        query: z.string().describe(
          'Kata kunci pencarian teks Arab. Contoh: إنما الأعمال بالنيات | شرح النووي | الفقه الإسلامي'
        ),
        book_id: z.number().int().positive().optional().describe(
          'Filter di kitab tertentu. Gunakan ID dari turath.io (mis: 147927 untuk Arba\'in Nawawiyah)'
        ),
        author_id: z.number().int().positive().optional().describe(
          'Filter karya satu pengarang saja (mis: 1207 = Al-Mundziri, 44 = pengarang Arba\'in)'
        ),
        category_id: z.number().int().min(1).max(37).optional().describe(
          'Filter kategori (1-37). Contoh: 1=Aqidah, 3=Tafsir, 6=Kutub Sunnah, 7=Syarah Hadits, ' +
          '11=Ushul Fiqh, 14=Fiqh Hanafi, 16=Fiqh Syafii, 23=Adab & Adzkar, 26=Biografi. ' +
          'Gunakan tool daftar_kategori untuk melihat semua 37 kategori lengkap.'
        ),
        halaman: z.number().int().positive().optional().default(1).describe(
          'Halaman hasil pencarian untuk navigasi (default: 1, tiap halaman ~10 hasil)'
        ),
        presisi: z.number().int().min(0).max(1).optional().describe(
          'Presisi pencarian: 0=umum/luas, 1=tepat/ketat. Default: 0'
        ),
      }),
    },
    async ({ query, book_id, author_id, category_id, halaman, presisi }) => {
      try {
        const opts = { sortField: SortField.PageId };
        if (book_id     !== undefined) opts.book      = book_id;
        if (author_id   !== undefined) opts.author    = author_id;
        if (category_id !== undefined) opts.category  = category_id;
        if (halaman     !== undefined) opts.page      = halaman;
        if (presisi     !== undefined) opts.precision = presisi;

        const results = await search(query, opts);
        return { content: [{ type: 'text', text: formatResults(results, query, halaman) }] };
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error pencarian: ${err.message}` }] };
      }
    }
  );

  // ══════════════════════════════════════════════════════════════════════════
  // Tool 2: cari_syarah_hadits
  // ══════════════════════════════════════════════════════════════════════════
  const kitabKeys = ['semua', ...KITAB_SYARAH.map(k => k.key)];

  server.registerTool(
    'cari_syarah_hadits',
    {
      description:
        'Cari penjelasan (syarah) hadits di kitab-kitab syarah klasik secara otomatis. ' +
        'Strategi: mencari teks hadits + nama kitab syarah secara paralel di seluruh database. ' +
        'Kitab yang didukung: Fathul Bari, Syarah Muslim (Nawawi), Tuhfatul Ahwadzi, ' +
        'Awnul Mabud, Subulus Salam, Nail al-Awthar, Taysir al-Allam, dll. ' +
        'Cocok untuk: "apa kata Ibn Hajar tentang hadits X?", "carikan syarah hadits ini", dll.',
      inputSchema: z.object({
        teks_hadits: z.string().describe(
          'Penggalan teks hadits dalam Arab. Contoh: إنما الأعمال بالنيات | لا ضرر ولا ضرار'
        ),
        kitab: z.enum(kitabKeys).optional().default('semua').describe(
          'Pilih kitab syarah tertentu atau "semua" untuk cari di semua kitab sekaligus (paralel)'
        ),
        halaman: z.number().int().positive().optional().default(1).describe(
          'Halaman hasil per kitab (default: 1)'
        ),
        max_hasil_per_kitab: z.number().int().min(1).max(5).optional().default(2).describe(
          'Jumlah hasil maksimal per kitab saat mode "semua" (default: 2, max: 5)'
        ),
      }),
    },
    async ({ teks_hadits, kitab, halaman, max_hasil_per_kitab }) => {
      try {
        const targetKitab = kitab === 'semua' ? KITAB_SYARAH : [KITAB_SYARAH_MAP[kitab]];

        if (!targetKitab || targetKitab.length === 0) {
          return { content: [{ type: 'text', text: `❌ Kitab "${kitab}" tidak ditemukan.` }] };
        }

        // Cari paralel di semua kitab target
        // Strategi: gabungkan teks hadits + nama kitab sebagai query
        const searches = targetKitab.map(async (k) => {
          try {
            // Query: teks hadits saja, filter kategori hadits
            const r = await search(teks_hadits, {
              category: KATEGORI.hadits,
              page: halaman,
              sortField: SortField.PageId,
            });

            // Filter hasil yang nama kitabnya mengandung kata kunci nama kitab
            const kataKunci = k.query_kitab.split(' ').slice(0, 2).join(' ');
            const filtered = r.data.filter(hit => {
              const m = hit.meta || {};
              return (
                (m.book_name || '').includes(k.nama.split(' ')[0]) ||
                (m.book_name || '').includes(k.pengarang.split(' ')[0]) ||
                (m.book_name || '').includes(kataKunci.split(' ')[0])
              );
            });

            if (filtered.length === 0) return null;

            const items = filtered
              .slice(0, max_hasil_per_kitab)
              .map((r, i) => {
                const m = r.meta || {};
                const bab = (m.headings || []).filter(Boolean).join(' › ');
                return [
                  `  [${i+1}] 📄 Hal: ${m.page || '—'} | Vol: ${m.vol || '—'} | book_id: ${r.book_id}`,
                  bab ? `       🔖 ${bab}` : null,
                  `       💬 ${(r.snip || r.text || '').replace(/<[^>]+>/g, '').trim()}`,
                ].filter(Boolean).join('\n');
              }).join('\n');

            return `📖 ${k.nama}\n   ✍️ ${k.pengarang} — ${filtered.length} hasil:\n${items}`;
          } catch (_) {
            return null;
          }
        });

        const allResults = (await Promise.all(searches)).filter(Boolean);

        if (allResults.length === 0) {
          // Fallback: cari langsung tanpa filter kitab
          const fallback = await search(teks_hadits, {
            category: KATEGORI.hadits,
            page: halaman,
            sortField: SortField.PageId,
          });
          return {
            content: [{
              type: 'text',
              text: `ℹ️ Tidak ditemukan di kitab syarah spesifik. Hasil dari semua kitab hadits:\n\n` +
                    formatResults(fallback, teks_hadits, halaman),
            }],
          };
        }

        const header = `✅ Syarah hadits "${teks_hadits}" ditemukan di ${allResults.length} kitab:\n`;
        return {
          content: [{ type: 'text', text: header + allResults.join('\n\n') }],
        };

      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err.message}` }] };
      }
    }
  );

  // ══════════════════════════════════════════════════════════════════════════
  // Tool 3: baca_halaman
  // ══════════════════════════════════════════════════════════════════════════
  server.registerTool(
    'baca_halaman',
    {
      description:
        'Baca teks lengkap dari satu halaman dalam kitab. ' +
        'Gunakan setelah mendapat book_id dan nomor halaman dari hasil cari_teks. ' +
        'Menampilkan teks Arab asli + info konteks (bab, juz, halaman cetak).',
      inputSchema: z.object({
        book_id: z.number().int().positive().describe(
          'ID kitab di turath.io. Didapat dari hasil cari_teks (field book_id) atau dari URL app.turath.io/book/ID'
        ),
        halaman: z.number().int().positive().describe(
          'Nomor halaman (page_id dari hasil pencarian, BUKAN halaman cetak)'
        ),
      }),
    },
    async ({ book_id, halaman }) => {
      try {
        const p = await getPage(book_id, halaman);
        return { content: [{ type: 'text', text: formatPage(p, book_id, halaman) }] };
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err.message}` }] };
      }
    }
  );

  // ══════════════════════════════════════════════════════════════════════════
  // Tool 4: baca_beberapa_halaman
  // ══════════════════════════════════════════════════════════════════════════
  server.registerTool(
    'baca_beberapa_halaman',
    {
      description:
        'Baca beberapa halaman sekaligus dari satu kitab. ' +
        'Dua mode: ' +
        '(1) mode "penuh" — teks Arab lengkap, maks 30 halaman agar tidak melebihi context Claude. ' +
        '(2) mode "ringkas" — hanya bab/heading + 2 baris awal tiap halaman, maks 80 halaman, ' +
        'cocok untuk memindai satu bab penuh sebelum memilih halaman yang ingin dibaca penuh. ' +
        'Gunakan mode ringkas dulu untuk navigasi bab, lalu baca_halaman untuk detail.',
      inputSchema: z.object({
        book_id: z.number().int().positive().describe(
          'ID kitab di turath.io'
        ),
        dari_halaman: z.number().int().positive().describe(
          'Nomor halaman awal (page_id)'
        ),
        sampai_halaman: z.number().int().positive().describe(
          'Nomor halaman akhir (page_id). Mode penuh maks +29, mode ringkas maks +79'
        ),
        mode: z.enum(['penuh', 'ringkas']).optional().default('penuh').describe(
          '"penuh" = teks Arab lengkap (maks 30 hal). "ringkas" = heading + 2 baris awal (maks 80 hal)'
        ),
      }),
    },
    async ({ book_id, dari_halaman, sampai_halaman, mode }) => {
      try {
        const MAX = mode === 'ringkas' ? 79 : 29;
        const akhir = Math.min(sampai_halaman, dari_halaman + MAX);
        const jumlah = akhir - dari_halaman + 1;

        const pageNums = Array.from({ length: jumlah }, (_, i) => dari_halaman + i);

        // Fetch paralel dengan concurrency limit 10 agar tidak spam API
        const hasil = [];
        for (let i = 0; i < pageNums.length; i += 10) {
          const batch = pageNums.slice(i, i + 10);
          const batchResult = await Promise.all(
            batch.map(pg => getPage(book_id, pg).catch(e => ({ _error: e.message, pg })))
          );
          hasil.push(...batchResult);
        }

        const parts = hasil.map((p, i) => {
          if (p._error) return `[page_id ${pageNums[i]}] ❌ ${p._error}`;
          const m   = p.meta || {};
          const bab = (m.headings || []).filter(Boolean).join(' › ');
          const label = `📄 Hal: ${m.page} (page_id: ${m.page_id})` + (bab ? ` | 🔖 ${bab}` : '');

          if (mode === 'ringkas') {
            // Ambil 2 baris pertama teks, bersihkan tag HTML
            const teksAwal = (p.text || '')
              .replace(/<[^>]+>/g, '')
              .split('\n')
              .filter(l => l.trim())
              .slice(0, 2)
              .join(' ')
              .slice(0, 200);
            return `${label}\n    ${teksAwal}…`;
          }

          return [`${'─'.repeat(50)}`, label, '', p.text].join('\n');
        });

        const firstOk = hasil.find(p => !p._error);
        const m = firstOk?.meta || {};
        const modeLabel = mode === 'ringkas'
          ? `(mode ringkas — gunakan baca_halaman untuk teks penuh)`
          : `(mode penuh)`;

        const header =
          `📖 ${m.book_name || 'Kitab'} | ✍️ ${m.author_name || '—'}\n` +
          `📚 Vol: ${m.vol || '—'} | page_id ${dari_halaman}–${akhir} | ${jumlah} halaman ${modeLabel}\n`;

        const separator = mode === 'ringkas' ? '\n' : '\n';
        return { content: [{ type: 'text', text: header + '\n' + parts.join(separator) }] };

      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err.message}` }] };
      }
    }
  );

  // ══════════════════════════════════════════════════════════════════════════
  // Tool 5: info_kitab
  // ══════════════════════════════════════════════════════════════════════════
  server.registerTool(
    'info_kitab',
    {
      description:
        'Ambil metadata lengkap sebuah kitab: nama, pengarang, deskripsi, ' +
        'daftar isi/bab, info volume/juz, dan rentang halaman. ' +
        'Gunakan sebelum baca_halaman untuk memahami struktur kitab.',
      inputSchema: z.object({
        book_id: z.number().int().positive().describe(
          'ID kitab di turath.io. Contoh: 147927 = Arba\'in Nawawiyah, 17616 = Mukhtashar Shahih Muslim'
        ),
      }),
    },
    async ({ book_id }) => {
      try {
        const b = await getBookInfo(book_id);
        return { content: [{ type: 'text', text: formatBookInfo(b, book_id) }] };
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err.message}` }] };
      }
    }
  );

  // ══════════════════════════════════════════════════════════════════════════
  // Tool 6: info_pengarang
  // ══════════════════════════════════════════════════════════════════════════
  server.registerTool(
    'info_pengarang',
    {
      description:
        'Ambil biografi dan informasi pengarang berdasarkan author_id-nya di turath.io. ' +
        'Author ID didapat dari hasil cari_teks (field author_id) atau info_kitab.',
      inputSchema: z.object({
        author_id: z.number().int().positive().describe(
          'ID pengarang di turath.io. Contoh: 1207 = Al-Mundziri, 44 = pengarang Arba\'in'
        ),
      }),
    },
    async ({ author_id }) => {
      try {
        const a   = await getAuthor(author_id);
        const bio = a.info || '(biografi tidak tersedia)';
        return {
          content: [{
            type: 'text',
            text: `✍️ Biografi Pengarang (author_id: ${author_id}):\n\n${bio}`,
          }],
        };
      } catch (err) {
        return { content: [{ type: 'text', text: `❌ Error: ${err.message}` }] };
      }
    }
  );

  // ══════════════════════════════════════════════════════════════════════════
  // Tool 7: daftar_kitab_syarah
  // ══════════════════════════════════════════════════════════════════════════
  server.registerTool(
    'daftar_kitab_syarah',
    {
      description:
        'Tampilkan daftar semua kitab syarah hadits yang didukung oleh server ini, ' +
        'lengkap dengan nama, pengarang, dan key yang dipakai di tool cari_syarah_hadits.',
      inputSchema: z.object({}),
    },
    async () => {
      const daftar = KITAB_SYARAH.map((k, i) =>
        `[${i+1}] key: "${k.key}"\n    📖 ${k.nama}\n    ✍️  ${k.pengarang}`
      ).join('\n\n');

      return {
        content: [{
          type: 'text',
          text: `📚 Kitab Syarah Hadits yang Didukung (${KITAB_SYARAH.length} kitab):\n\n${daftar}`,
        }],
      };
    }
  );

  // ══════════════════════════════════════════════════════════════════════════
  // Tool 8: daftar_kategori
  // ══════════════════════════════════════════════════════════════════════════
  server.registerTool(
    'daftar_kategori',
    {
      description:
        'Tampilkan semua 37 kategori ilmu di turath.io beserta ID-nya. ' +
        'Gunakan ID kategori ini sebagai parameter category_id di tool cari_teks ' +
        'untuk menyempitkan pencarian ke bidang ilmu tertentu.',
      inputSchema: z.object({
        filter: z.string().optional().describe(
          'Filter nama kategori (opsional). Contoh: "fiqh" akan tampilkan semua kategori fiqh'
        ),
      }),
    },
    async ({ filter }) => {
      const entries = Object.entries(KATEGORI_INFO);
      const filtered = filter
        ? entries.filter(([, v]) =>
            v.ar.includes(filter) ||
            v.id.toLowerCase().includes(filter.toLowerCase())
          )
        : entries;

      const baris = filtered.map(([id, v]) =>
        `[${String(id).padStart(2, ' ')}] ${v.ar.padEnd(40, ' ')} — ${v.id}`
      ).join('\n');

      const header = filter
        ? `🔍 Kategori turath.io yang cocok dengan "${filter}" (${filtered.length} hasil):\n\n`
        : `📚 Semua Kategori turath.io (${filtered.length} kategori):\n\n`;

      const footer = '\n\n💡 Gunakan nomor ID ini sebagai category_id di tool cari_teks.\n' +
                     '   Contoh: category_id=7 untuk mencari di kitab-kitab Syarah Hadits.';

      return {
        content: [{ type: 'text', text: header + baris + footer }],
      };
    }
  );

  return server;
}

// ─── Session management ───────────────────────────────────────────────────────

const sessions = new Map();

async function handleMcp(req, res) {
  const sessionId = req.headers['mcp-session-id'] || randomUUID();
  let transport   = sessions.get(sessionId);

  if (!transport) {
    const mcpServer = createMcpServer();
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => sessionId,
      onsessioninitialized: (id) => sessions.set(id, transport),
    });
    transport.onclose = () => sessions.delete(sessionId);
    await mcpServer.connect(transport);
  }

  await transport.handleRequest(req, res, req.body);
}

app.post('/mcp',    handleMcp);
app.get('/mcp',     handleMcp);
app.delete('/mcp',  handleMcp);

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/', (_req, res) => {
  res.json({
    status:       'ok',
    service:      'Turath MCP Server',
    version:      '3.0.0',
    mcp_endpoint: '/mcp',
    tools: [
      'cari_teks',
      'cari_syarah_hadits',
      'baca_halaman',
      'baca_beberapa_halaman',
      'info_kitab',
      'info_pengarang',
      'daftar_kitab_syarah',
      'daftar_kategori',
    ],
    kitab_syarah_count: KITAB_SYARAH.length,
    kategori_count: Object.keys(KATEGORI_INFO).length,
    active_sessions: sessions.size,
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅ Turath MCP Server v3.0 aktif di port ${PORT}`);
  console.log(`   Endpoint MCP : http://localhost:${PORT}/mcp`);
  console.log(`   Health check : http://localhost:${PORT}/`);
  console.log(`   Tools aktif  : 8 tools`);
  console.log(`   Kitab syarah : ${KITAB_SYARAH.length} kitab`);
  console.log(`   Kategori     : ${Object.keys(KATEGORI_INFO).length} kategori`);
});

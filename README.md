# Turath MCP Server — Deploy ke Railway 🚀

MCP Server untuk mengakses ribuan **kitab Islam & Arab klasik** dari [turath.io](https://turath.io),
khusus untuk keperluan riset hadits, fiqh, aqidah, dan lainnya.

---

## Tools yang Tersedia

| Tool | Fungsi |
|------|--------|
| `cari_teks` | Cari teks Arab di seluruh database turath.io |
| `cari_syarah_hadits` | Cari penjelasan hadits di kitab-kitab syarah klasik |
| `baca_halaman` | Baca teks lengkap halaman tertentu dari kitab |
| `info_kitab` | Metadata + daftar isi kitab by ID |
| `info_pengarang` | Biografi pengarang by ID |

**Kitab syarah yang didukung:**
- Fathul Bari (Ibn Hajar)
- Syarah Muslim / Al-Minhaj (Imam Nawawi)
- Umdatul Qari (Al-Aini)
- Irsyadus Sari (Al-Qastalani)
- Tuhfatul Ahwadzi (Al-Mubarakfuri)
- Awnul Mabud (Al-Azim Abadi)
- Subulus Salam (Al-Sanani)
- Nail al-Awthar (Al-Shawkani)
- Dan lainnya...

---

## Langkah 1 — Upload ke GitHub

```bash
# Di folder ini:
git init
git add .
git commit -m "turath mcp server"

# Buat repo baru di github.com, lalu:
git remote add origin https://github.com/USERNAME/turath-mcp.git
git push -u origin main
```

---

## Langkah 2 — Deploy ke Railway

1. Buka [railway.com](https://railway.com) → **New Project**
2. Pilih **Deploy from GitHub repo**
3. Pilih repo `turath-mcp` yang baru dibuat
4. Railway otomatis mendeteksi Node.js dan menjalankan `npm start`
5. Klik **Generate Domain** di tab **Settings → Networking**
6. Catat URL yang diberikan, mis: `https://turath-mcp-production.up.railway.app`

**Verifikasi:**
Buka URL tersebut di browser — harus muncul JSON:
```json
{
  "status": "ok",
  "service": "Turath MCP Server",
  "mcp_endpoint": "/mcp"
}
```

---

## Langkah 3 — Hubungkan ke Claude.ai

1. Buka [claude.ai](https://claude.ai) → **Settings** → **Connectors**
2. Klik **"Add custom connector"**
3. Isi URL: `https://turath-mcp-production.up.railway.app/mcp`
   *(ganti dengan URL Railway Anda)*
4. Klik **Add**
5. Aktifkan connector di halaman chat

---

## Contoh Penggunaan di Claude

Setelah terhubung, ketik langsung di Claude:

```
Carikan penjelasan hadits "إنما الأعمال بالنيات" di semua kitab syarah yang tersedia

Cari hadis tentang shalat berjamaah dan apa kata Fathul Bari tentangnya

Carikan pembahasan tentang صيام رمضان di kitab Subulus Salam

Tampilkan halaman 42 dari kitab ID 147927

Siapa pengarang ID 44?
```

---

## Cara Menemukan ID Kitab

ID kitab bisa dilihat langsung dari URL turath.io:

```
https://app.turath.io/book/147927
                            ^^^^^^
                        ID = 147927
```

---

## Catatan Teknis

- Server tidak memerlukan API key — turath.io gratis dan publik
- Pencarian mendukung Arab dengan atau tanpa harakat
- Railway free tier: 500 jam/bulan (cukup untuk penggunaan pribadi)
- Port diatur otomatis oleh Railway via variabel `$PORT`

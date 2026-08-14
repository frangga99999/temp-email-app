# TempMail Pro ⚡

Generator alamat email sekali pakai + inbox real, statis murni di GitHub Pages, **dua provider**:

**Live:** https://frangga99999.github.io/temp-email-app/

## Provider
| | Guerrilla Mail | mail.tm |
|---|---|---|
| Jalur | langsung dari browser (CORS terbuka) | via proxy VPS + Cloudflare Tunnel |
| Inbox | ±1 jam | beberapa hari |
| Format | HTML/text | HTML penuh |
| Hapus mailbox server | ✅ | — (hapus lokal) |

## Arsitektur
```
Browser (GitHub Pages, HTTPS)
  ├─ guerrillamail ── api.guerrillamail.com (langsung, tanpa server)
  └─ mail.tm ──────── https://<tunnel>.trycloudflare.com → VPS :20129 (proxy.py) → api.mail.tm
```

Proxy VPS (`/opt/mailproxy/proxy.py`, systemd `mailproxy`):
- meneruskan `/mailtm/*` → `https://api.mail.tm/*` dan `/1secmail/*` → 1secmail (mati, tidak dipakai)
- menambah header CORS `*` + meneruskan status error asli (401/403/404)
- **auth wajib**: header `X-Proxy-Token` (403 tanpa token; OPTIONS preflight bebas)

## Fitur
- Generator: acak/custom username, batch 1–5, pilihan provider
- Multi-address: riwayat localStorage, switch, hapus (server/lokal)
- Inbox: auto-refresh (10–60 dtk, bisa jeda), cari, filter (belum dibaca/bintang/OTP/tag), global search lintas alamat, reading pane ala email client
- 🔑 Deteksi OTP otomatis (chip klik-untuk-salin), ⚙️ aturan otomatis (star/hide/tag), 🏷 tag warna, 📊 analitik (KPI, top pengirim, histogram 24 jam)
- 💾 Backup/restore penuh, QR code, export inbox JSON, unduh email `.eml`
- PWA: manifest + service worker (network-first HTML, cache-first CDN), installable
- Shortcut: `G` generate · `R` refresh · `/` cari · `A` analitik · `Esc` tutup

## Setelan proxy (tab ⚙️ Setelan)
- **URL Proxy VPS**: tunnel `https://xxx.trycloudflare.com` — **berubah setiap cloudflared restart / VPS reboot**; ganti di sini (tersimpan localStorage, tanpa deploy)
- **Token Proxy**: `X-Proxy-Token` — cocokkan dengan `TOKEN` di `/opt/mailproxy/proxy.py` VPS

## Deploy
```bash
git add -A && git commit -m "..." && git push   # Pages auto-build (~1-2 mnt)
gh api --method POST repos/<user>/temp-email-app/pages -f "source[branch]=main" -f "source[path]=/"
```

## Proxy VPS (referensi)
- Install: `sudo tee /opt/mailproxy/proxy.py` + systemd unit `mailproxy.service`, `systemctl enable --now mailproxy`
- Logs: `sudo journalctl -u mailproxy -f`
- Restart: `sudo systemctl restart mailproxy`
- Tunnel: `nohup cloudflared tunnel --url http://localhost:20129 > /tmp/tunnel.log 2>&1 &` → ambil URL: `grep -o "https://[a-z0-9-]*\.trycloudflare\.com" /tmp/tunnel.log | head -1`
- Firewall VPS: buka TCP 20129 (Security Group Tencent) — hanya perlu kalau akses tanpa tunnel

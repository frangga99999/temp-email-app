# Temp Email App

Generator alamat email sekali pakai + inbox, pakai API [mail.tm](https://mail.tm) (gratis, tanpa API key).

## Jalan
```bash
npm install
node server.js
# buka http://localhost:3000
```

## Cara kerja
- `GET /api/domain` → domain aktif dari mail.tm (mis. `emalupe.com`)
- `POST /api/account` → buat akun `userxxxx@domain`, balas JWT token
- `GET /api/messages?token=...` → daftar email di inbox
- `GET /api/message?token=...&id=...` → isi lengkap (HTML/text)
- Server jadi proxy biar token tidak terekspos ke browser & CORS aman.

Alamat + inbox kadaluarsa ~beberapa hari (kebijakan mail.tm). Token disimpan di memori server per client; restart server = alamat baru.
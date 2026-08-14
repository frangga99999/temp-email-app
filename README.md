# TempMail Pro ⚡

Generator alamat email sekali pakai + inbox real, statis murni (tanpa server), di-hosting gratis di GitHub Pages.

**Live:** https://frangga99999.github.io/temp-email-app/

## Fitur
- Generate alamat acak (🎲) atau custom username
- Multi-address: riwayat alamat tersimpan di localStorage, bisa switch & hapus
- Inbox real: auto-refresh 20 detik, cari subjek/pengirim, badge unread
- Detail email dengan HTML aman (DOMPurify), link aktif
- Powered by [guerrillamail](https://www.guerrillamail.com) (API CORS-open, tanpa API key)
- Email & inbox terhapus otomatis ±1 jam

## Cara kerja
Frontend memanggil `https://api.guerrillamail.com/ajax.php` langsung dari browser:
- `f=get_email_address` / `f=set_email_user&email_user=...` → buat alamat + `sid_token`
- `f=get_email_list&sid_token=...&offset=0&limit=50` → daftar email (wajib offset+limit!)
- `f=fetch_email&sid_token=...&email_id=...` → isi lengkap

## Develop lokal
```bash
cd ~/temp-email-app
python3 -m http.server 8080   # atau npx serve .
# buka http://localhost:8080
```

## Deploy (GitHub Pages)
```bash
gh repo create temp-email-app --public --source=. --push
gh api --method POST repos/<user>/temp-email-app/pages \
  -f "source[branch]=main" -f "source[path]=/"
```

## Catatan versi full-stack
Folder `api/` + `dev-server.js` (Express, proxy mail.tm + guerrillamail) ada di disk tapi di-gitignore — versi itu untuk VPS dengan domain sendiri (mail.tm punya CORS tertutup, butuh proxy; inbox lebih lama dari 1 jam).
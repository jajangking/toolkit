# Tips Platform - Public Blog System

## Perubahan yang Dilakukan

### 1. **Public Access untuk Semua User**
- Siapa saja bisa login dengan Google dan membuat artikel
- Tidak perlu jadi admin untuk menulis

### 2. **Approval System**
- **User biasa**: Artikel masuk status `pending` dan perlu approval admin
- **Admin (jajangnurdiana123@gmail.com)**: Artikel langsung `approved` dan publish

### 3. **Rich Text Editor**
- Menggunakan Tiptap editor dengan fitur:
  - Bold, Italic, Strikethrough
  - Headings (H2, H3)
  - Bullet & Numbered Lists
  - Code blocks
  - **Links** - bisa insert link ke text
  - **Images** - bisa insert gambar via URL

### 4. **Struktur Artikel: Problem-Solution-Result**
- **Problem**: Jelaskan masalah yang dihadapi
- **Solution**: Step-by-step cara menyelesaikan
- **Result**: Hasil dan kesimpulan
- **Content**: Konten utama dengan rich text editor

### 5. **Admin Dashboard**
- URL: `/tips/admin`
- Hanya admin yang bisa akses
- Fitur:
  - Lihat semua artikel pending
  - Approve artikel (langsung publish)
  - Reject artikel dengan alasan

### 6. **Updated Google Sheets Schema**
Kolom baru di spreadsheet "Toolkit Blog Tips":
```
A: ID
B: Slug
C: Title
D: Excerpt
E: Content (HTML dari rich editor)
F: Problem
G: Solution
H: Result
I: Date
J: Author
K: AuthorEmail
L: SolvesId
M: Status (draft/pending/approved/rejected)
N: ApprovedBy
O: ApprovedAt
P: RejectionReason
Q: Reactions (JSON)
```

## API Endpoints

### POST `/api/tips`
- Buat artikel baru
- Auth: Semua user yang login
- Admin → langsung approved
- User biasa → pending approval

### GET `/api/tips/pending`
- List artikel pending
- Auth: Admin only

### POST `/api/tips/approve`
- Approve/reject artikel
- Auth: Admin only
- Body: `{ tipId, action: 'approve'|'reject', rejectionReason? }`

### GET `/api/tips/public`
- List artikel approved (untuk publik)
- No auth required

## Pages

- `/tips/writer` - Form buat artikel (login required)
- `/tips/admin` - Admin dashboard (admin only)
- `/tips` - List artikel approved
- `/tips/[slug]` - Detail artikel

## Environment Variables

```
NEXT_PUBLIC_ADMIN_EMAIL=jajangnurdiana123@gmail.com
```

## Cara Pakai

1. **User biasa**:
   - Login dengan Google di `/tips/writer`
   - Tulis artikel dengan rich text editor
   - Submit → tunggu approval admin

2. **Admin**:
   - Login dengan Google (jajangnurdiana123@gmail.com)
   - Bisa langsung publish artikel
   - Akses `/tips/admin` untuk approve/reject artikel pending

## Upload Foto

Saat ini upload foto menggunakan URL eksternal:
1. Upload foto ke hosting (Imgur, Cloudinary, dll)
2. Copy URL foto
3. Klik tombol "Image" di editor
4. Paste URL

**Future improvement**: Bisa tambah upload langsung ke Google Drive atau cloud storage.

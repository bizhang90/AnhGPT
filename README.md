# AnhGPT Images

Giao diện tạo và chỉnh sửa ảnh bằng GPT-Image cho Bee Creative Hub, triển khai trên Vercel theo mô hình **BYOK (Bring Your Own Key)**.

## Tính năng

- Người dùng tự nhập OpenAI API key trên giao diện
- Không cần gắn cứng API key trên Vercel
- Hỗ trợ tạo ảnh từ prompt
- Hỗ trợ chỉnh sửa / tạo ảnh bằng ảnh tham chiếu
- Hỗ trợ `gpt-image-2.5-sunburst`, `gpt-image-2.5-flare`, `gpt-image-2`
- Giao diện tiếng Việt

## Chạy local

```bash
npm install
npm run dev
```

## Vercel

Kết nối repo `bizhang90/AnhGPT` với project Vercel và để Production Branch là `main`.
Mỗi commit mới vào `main` sẽ tạo deployment mới.

## Bảo mật

API key do người dùng tự nhập và chỉ được chuyển tiếp cho request đang chạy. Không log request body hoặc secrets trong production.

---

Deploy sync trigger: 2026-09-10 18:16 ICT

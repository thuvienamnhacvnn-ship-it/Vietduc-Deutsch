# Triển khai

Bản đang chạy: **https://deutsch.57-129-45-199.sslip.io**

Tên miền `sslip.io` tự phân giải về đúng địa chỉ IP nằm trong chính tên miền,
nên bản xem thử có HTTPS thật mà không phải đăng ký DNS ở đâu cả. Khi có tên
miền chính thức thì chỉ sửa một dòng `server_name` trong nginx và chạy lại
certbot.

## Máy chủ

Một máy duy nhất, và mọi thứ nói chuyện với nhau qua `127.0.0.1`:

| Thành phần | Ở đâu | Ghi chú |
|---|---|---|
| Ứng dụng Next | `/opt/vietduc-deutsch`, cổng 3055 | pm2 tên `vietduc-deutsch`, chỉ nghe trên 127.0.0.1 |
| Cơ sở dữ liệu | PostgreSQL 18, database `vietduc_deutsch` | user riêng `vd_deutsch` |
| Engine giọng nói | `/opt/vd-voice`, cổng 3600 | systemd `vd-voice` |
| Bộ giảng dạy | llama.cpp, cổng 8080 | systemd `vd-llm` |
| nginx | `/etc/nginx/sites-available/vietduc-deutsch` | chứng chỉ Let's Encrypt |

**Không dịch vụ nào trong bảng phơi ra Internet trừ nginx.** Ứng dụng gọi engine
qua `127.0.0.1`, nên không cần đường hầm SSH và cũng không cần mở cổng - khác
hẳn với lúc chạy ở máy phát triển.

Vì ứng dụng đứng sau nginx của chính máy này, `.env.production` đặt
`LINGORA_TRUST_PROXY=1`; đó là điều kiện để hạn mức chống lạm dụng đọc đúng địa
chỉ của từng người thay vì gộp tất cả vào một.

## Cập nhật

```bash
# ở máy phát triển
git push

# rồi
ssh ovh-fra '/opt/vietduc-deutsch/scripts/deploy.sh'
```

Script kéo mã, cài gói, build, áp migration rồi mới khởi động lại - build hỏng
thì bản cũ vẫn chạy. Nó KHÔNG chạy seed.

## Dựng lại từ đầu

```bash
# 1. cơ sở dữ liệu
sudo -u postgres psql -c "CREATE ROLE vd_deutsch LOGIN PASSWORD '<mật khẩu>'"
sudo -u postgres createdb -O vd_deutsch vietduc_deutsch

# 2. mã nguồn
sudo mkdir -p /opt/vietduc-deutsch && sudo chown "$USER":"$USER" /opt/vietduc-deutsch
git clone https://github.com/thuvienamnhacvnn-ship-it/Vietduc-Deutsch.git /opt/vietduc-deutsch
cd /opt/vietduc-deutsch

# 3. cấu hình: chép .env.example rồi điền, chmod 600
#    DATABASE_URL, LINGORA_APP_URL, LINGORA_TRUST_PROXY=1,
#    LINGORA_VOICE_URL/TOKEN, LINGORA_LLM_URL/MODEL

# 4. cài, build, migration, dữ liệu mẫu
npm ci && npm run build
set -a; . ./.env.production; set +a
npx tsx scripts/db-push.ts
npx tsx scripts/seed.ts          # chỉ lần đầu

# 5. chạy
pm2 start ./node_modules/next/dist/bin/next --name vietduc-deutsch \
  --cwd /opt/vietduc-deutsch -- start -p 3055 -H 127.0.0.1
pm2 save

# 6. nginx + HTTPS
sudo ln -s /etc/nginx/sites-available/vietduc-deutsch /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d <tên miền> --redirect
```

Hai chỗ trong cấu hình nginx không được bỏ:

- `client_max_body_size 25m` - mặc định 1 MB của nginx cắt mất đoạn ghi âm 90
  giây của bài Nói, và lỗi hiện ra ở tận trình duyệt dưới dạng "413".
- `proxy_read_timeout 300s` - mô hình chạy trên CPU, một lượt trong lớp mất vài
  giây còn chấm bài thì lâu hơn.

## Kiểm tra sau khi triển khai

```bash
curl -s https://deutsch.57-129-45-199.sslip.io/api/suc-khoe
```

Trả về trạng thái database và **hỏi thẳng cả hai engine**, nên nó là câu trả lời
thật cho "cái gì đang chạy", không phải bản chép lại của biến môi trường.

Bộ kiểm thử chạy được thẳng vào bản đã triển khai:

```bash
node tests/smoke.mjs   https://deutsch.57-129-45-199.sslip.io
node tests/xep-lop.mjs https://deutsch.57-129-45-199.sslip.io
node tests/lop-hoc.mjs https://deutsch.57-129-45-199.sslip.io
```

`tests/google.mjs` thì KHÔNG: nó kiểm luồng đăng nhập mô phỏng, mà bản mô phỏng
cố ý bị tắt ở production. Chính điều đó đã được kiểm trên bản đang chạy - đường
dẫn mô phỏng trả 404 và nút Google hiện "chưa kết nối" kèm lý do.

## Đổi sang tên miền chính thức

1. Thêm bản ghi A của tên miền (ví dụ `hoc.vietducgroup.com.vn`) trỏ về
   `57.129.45.199`.
2. Sửa `server_name` trong `/etc/nginx/sites-available/vietduc-deutsch`.
3. `sudo certbot --nginx -d hoc.vietducgroup.com.vn --redirect`
4. Sửa `LINGORA_APP_URL` trong `.env.production` rồi
   `pm2 restart vietduc-deutsch --update-env`.

Bước 4 không được quên: đường dẫn trong email xác minh và ảnh chia sẻ mạng xã
hội đều dựng từ biến đó.

#!/usr/bin/env bash
#
# Cập nhật bản đang chạy trên VPS.
#
#   ssh ovh-fra '/opt/vietduc-deutsch/scripts/deploy.sh'
#
# Kéo mã mới, cài gói, build, áp migration rồi khởi động lại. KHÔNG chạy seed:
# seed là dữ liệu mẫu, chạy lại trên máy đang có học viên thật là chuyện khác
# hẳn và phải do người quyết định.
#
# Script dừng ngay khi có lệnh nào hỏng (`set -e`), nên bản cũ vẫn chạy nếu build
# không thành công - pm2 chỉ được gọi ở dòng cuối cùng.
set -euo pipefail

APP_DIR=/opt/vietduc-deutsch
APP_NAME=vietduc-deutsch

cd "$APP_DIR"

echo "== mã nguồn"
git fetch --all --quiet
git reset --hard origin/main --quiet
git log --oneline -1

echo "== gói"
npm ci --no-audit --no-fund --silent

echo "== build"
npm run build

echo "== migration"
set -a
# shellcheck disable=SC1091
. "$APP_DIR/.env.production"
set +a
npx tsx scripts/db-push.ts

echo "== khởi động lại"
pm2 restart "$APP_NAME" --update-env
sleep 3

echo "== kiểm tra"
curl -fsS http://127.0.0.1:3055/api/suc-khoe | head -c 400
echo

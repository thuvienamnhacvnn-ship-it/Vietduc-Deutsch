#!/usr/bin/env bash
#
# Dựng máy chủ GỬI thư trên VPS: postfix (chỉ gửi) + opendkim (ký DKIM).
#
#   scp scripts/vps/may-chu-thu.sh ovh-fra:/tmp/ && ssh ovh-fra 'sudo bash /tmp/may-chu-thu.sh'
#
# Chạy lại bao nhiêu lần cũng được: khoá DKIM đã có thì giữ nguyên (sinh khoá
# mới là phải sửa lại bản ghi DNS).
#
# Máy này KHÔNG nhận thư: postfix chỉ nghe trên 127.0.0.1, nên không ai ngoài
# Internet dùng được nó để chuyển thư rác. Chỉ ứng dụng trên chính máy này gửi
# qua lệnh `sendmail`.
#
# Gửi bằng IPv4, không IPv6: VPS có cả hai, và mỗi địa chỉ gửi đi đều phải có
# SPF + reverse DNS riêng. Một địa chỉ là đủ, và là thứ ít chỗ sai nhất.
set -euo pipefail

DOMAIN=vietduc-lingua.com
HOST=mail.vietduc-lingua.com
SELECTOR=vd2026
KEYDIR=/etc/opendkim/keys/$DOMAIN

echo "== gói"
echo "postfix postfix/main_mailer_type select Internet Site" | debconf-set-selections
echo "postfix postfix/mailname string $DOMAIN" | debconf-set-selections
DEBIAN_FRONTEND=noninteractive apt-get install -y -q postfix opendkim opendkim-tools >/dev/null

echo "== khoá DKIM"
mkdir -p "$KEYDIR"
if [ ! -f "$KEYDIR/$SELECTOR.private" ]; then
  opendkim-genkey -b 2048 -h rsa-sha256 -r -d "$DOMAIN" -s "$SELECTOR" -D "$KEYDIR"
fi
chown -R opendkim:opendkim /etc/opendkim/keys
chmod 700 "$KEYDIR"
chmod 600 "$KEYDIR/$SELECTOR.private"

echo "== opendkim"
cat > /etc/opendkim.conf <<CONF
# Dựng bởi scripts/vps/may-chu-thu.sh - sửa ở đó, không sửa tay ở đây.
Syslog                  yes
UMask                   007
Mode                    s
Canonicalization        relaxed/simple
Domain                  $DOMAIN
Selector                $SELECTOR
KeyFile                 $KEYDIR/$SELECTOR.private
Socket                  inet:8891@127.0.0.1
OversignHeaders         From
UserID                  opendkim
PidFile                 /run/opendkim/opendkim.pid
TrustAnchorFile         /usr/share/dns/root.key
CONF
# Bản Ubuntu có thể đặt socket ở /etc/default/opendkim và ghi đè tệp cấu hình.
if [ -f /etc/default/opendkim ]; then
  sed -i 's|^SOCKET=.*|SOCKET=inet:8891@127.0.0.1|' /etc/default/opendkim
fi

echo "== postfix"
postconf -e \
  "myhostname = $HOST" \
  "myorigin = $DOMAIN" \
  "mydestination = localhost" \
  "inet_interfaces = loopback-only" \
  "inet_protocols = ipv4" \
  "relayhost =" \
  "smtp_tls_security_level = may" \
  "smtp_tls_loglevel = 1" \
  "smtpd_milters = inet:127.0.0.1:8891" \
  "non_smtpd_milters = inet:127.0.0.1:8891" \
  "milter_default_action = accept" \
  "milter_protocol = 6"

systemctl enable --now opendkim >/dev/null 2>&1 || true
systemctl restart opendkim
systemctl restart postfix

echo "== kiểm tra"
ss -ltnp | grep -E '127.0.0.1:(25|8891) ' || { echo "postfix hoặc opendkim không nghe trên 127.0.0.1"; exit 1; }
postconf -h inet_interfaces

echo "== bản ghi DNS cho DKIM ($SELECTOR._domainkey.$DOMAIN)"
# Nối các mảnh trong tệp .txt thành một chuỗi liền để dán vào bảng DNS.
tr -d '\n' < "$KEYDIR/$SELECTOR.txt" | sed -E 's/.*\( *//; s/ *\).*//; s/" *"//g; s/"//g; s/[[:space:]]+/ /g'
echo

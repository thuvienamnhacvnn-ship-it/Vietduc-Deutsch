# Engine tự host: giọng nói và mô hình ngôn ngữ

Việt Đức KHÔNG mua dịch vụ AI theo lượt. Ba thứ nặng nhất của sản phẩm - đọc
tiếng Đức, nghe tiếng Đức, và bộ giảng dạy - chạy trên máy chủ của trường bằng
phần mềm mã nguồn mở.

| Việc | Phần mềm | Giấy phép | Chạy ở đâu |
|---|---|---|---|
| Đọc tiếng Đức (TTS) | piper + giọng `de_DE-thorsten-medium` | MIT | CPU |
| Nghe tiếng Đức (STT) | whisper.cpp + `ggml-small` / `ggml-large-v3-turbo` | MIT | CPU |
| Giảng dạy, chấm bài | llama.cpp + model GGUF mã nguồn mở | MIT | CPU |

Cả ba đều là chương trình biên dịch sẵn dạng nhị phân, KHÔNG cần Python. Đây là
lý do chọn chúng thay vì các bộ Python phổ biến hơn: máy chủ đang chạy Ubuntu
với Python 3.14, mà phần lớn thư viện học máy chưa có bản dựng cho phiên bản
này. Một đường phụ thuộc không có Python là một đường không hỏng vào ngày nâng
cấp hệ điều hành.

## Đo thật trên máy 8 nhân, 24 GB RAM

| Việc | Thời gian |
|---|---|
| Đọc một câu (piper) | 0,8 giây cho câu 2 giây tiếng nói — nhanh hơn thời gian thực 12 lần |
| Đọc lại câu đã đọc | 3 mili giây (bộ nhớ đệm trên đĩa) |
| Nghe 11 giây tiếng nói, model `small` | 5,2 giây |
| Nghe 11 giây tiếng nói, model `large-v3-turbo` | 17,2 giây |

`small` nghe sai một từ trong câu thử ("Worum" thay vì "Wo"); `large-v3-turbo`
nghe đúng cả `heiße` và `möchte`. Vì vậy hai model được dùng cho hai việc khác
nhau: `nhanh` (small) cho lớp học, nơi người học đang chờ; `ky` (turbo) cho
chấm bài, chạy nền.

## Dịch vụ `vd-voice`

Một dịch vụ HTTP nhỏ bằng Node bọc hai chương trình trên, chạy bằng systemd.

- Mã: `/opt/vd-voice/server.mjs` trên máy chủ
- Cấu hình: `/etc/vd-voice.env` (quyền 600) — chứa `VD_VOICE_TOKEN`
- Nghe ở `127.0.0.1:3600`, KHÔNG phơi ra Internet
- Xác thực: header `x-voice-token`

Đường dẫn:

| Đường dẫn | Việc |
|---|---|
| `GET /health` | kiểm tra sống, liệt kê giọng và model |
| `POST /tts` | `{text, voice}` → mp3 |
| `POST /stt?ext=webm&model=nhanh` | thân request là dữ liệu âm thanh thô → `{text, ms}` |

Câu đã đọc được lưu đệm theo mã băm của nội dung, nên một câu nghe trong bài thi
chỉ tốn CPU đúng một lần cho toàn bộ học viên.

## Nối vào ứng dụng

Ứng dụng chạy ở máy khác thì mở đường hầm SSH thay vì mở cổng ra Internet:

```
ssh -N -L 3600:127.0.0.1:3600 ovh-fra
```

Rồi đặt trong `.env.local`:

```
LINGORA_VOICE_URL=http://127.0.0.1:3600
LINGORA_VOICE_TOKEN=<đọc trong /etc/vd-voice.env trên máy chủ>
```

Khi ứng dụng chạy trên chính máy chủ đó thì không cần đường hầm, và cũng không
cần mở cổng: cả hai đều nghe trên `127.0.0.1`.

## Cài đặt lại từ đầu

Các lệnh dưới đây chạy trên máy chủ. Chúng đã chạy thật một lần trên
`ovh-fra`, không phải lệnh viết theo trí nhớ.

```bash
sudo apt-get update -qq
sudo apt-get install -y build-essential cmake git ffmpeg wget

sudo mkdir -p /opt/vd-voice && sudo chown "$USER":"$USER" /opt/vd-voice
cd /opt/vd-voice

# nghe
git clone --depth 1 https://github.com/ggml-org/whisper.cpp.git
cd whisper.cpp
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release -j "$(nproc)"
cd /opt/vd-voice && mkdir -p models && cd models
wget -O ggml-small.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin
wget -O ggml-large-v3-turbo.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo.bin

# đọc
cd /opt/vd-voice
wget -O piper.tar.gz https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_x86_64.tar.gz
tar xzf piper.tar.gz && rm piper.tar.gz
mkdir -p voices && cd voices
BASE=https://huggingface.co/rhasspy/piper-voices/resolve/main/de/de_DE
wget -O de_DE-thorsten-medium.onnx      "$BASE/thorsten/medium/de_DE-thorsten-medium.onnx"
wget -O de_DE-thorsten-medium.onnx.json "$BASE/thorsten/medium/de_DE-thorsten-medium.onnx.json"
```

Sau đó tạo `/opt/vd-voice/server.mjs`, `/etc/vd-voice.env` và unit systemd
`vd-voice.service` (bản đang chạy trên máy chủ là bản chuẩn để chép lại).

## Bộ giảng dạy (llama.cpp)

```bash
cd /opt/vd-voice
git clone --depth 1 https://github.com/ggml-org/llama.cpp.git
cd llama.cpp
cmake -B build -DCMAKE_BUILD_TYPE=Release -DLLAMA_CURL=OFF
cmake --build build --config Release -j "$(nproc)" --target llama-server

cd /opt/vd-voice/models
wget -O qwen2.5-7b-instruct-q4_k_m.gguf \
  https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-GGUF/resolve/main/qwen2.5-7b-instruct-q4_k_m.gguf

/opt/vd-voice/llama.cpp/build/bin/llama-server \
  -m /opt/vd-voice/models/qwen2.5-7b-instruct-q4_k_m.gguf \
  --host 127.0.0.1 --port 8080 -c 4096 -t "$(nproc)"
```

Chọn Qwen2.5-7B vì nó là model mã nguồn mở (giấy phép Apache 2.0) làm được cả
tiếng Đức lẫn tiếng Việt ở cùng một chỗ - lời giảng phải là tiếng Việt trong khi
câu nói mẫu phải là tiếng Đức, và một model chỉ mạnh tiếng Anh sẽ hỏng đúng ở
chỗ đó.

Nối vào ứng dụng:

```
LINGORA_LLM_URL=http://127.0.0.1:8080/v1
LINGORA_LLM_MODEL=qwen2.5-7b-instruct
```

Trên CPU, một câu trả lời ngắn của giáo viên mất khoảng 5-15 giây. Đó là lý do
câu Anna mở lời trong mỗi bài là câu cố định, không do model sinh: người vừa vào
lớp không phải nhìn màn hình trống.

## Điều KHÔNG tự host được

Thẻ tín dụng và PayPal cần tài khoản thương gia đứng tên pháp nhân, có hợp đồng
và thẩm định - không có phần mềm mã nguồn mở nào thay được. Vì vậy cách thanh
toán mặc định của sản phẩm là **chuyển khoản ngân hàng**, xem
`src/lib/thanh-toan.ts`.

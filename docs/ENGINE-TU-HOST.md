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
ssh -N -L 3600:127.0.0.1:3600 -L 8080:127.0.0.1:8080 ovh-fra
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
# Bản đang dùng: 3B, vì tốc độ mới là thứ quyết định lớp học dùng được hay không.
wget -O qwen2.5-3b-instruct-q4_k_m.gguf \
  https://huggingface.co/bartowski/Qwen2.5-3B-Instruct-GGUF/resolve/main/Qwen2.5-3B-Instruct-Q4_K_M.gguf
# Bản 7B để dành cho việc chạy nền (chấm bài viết), nơi không ai phải chờ:
wget -O qwen2.5-7b-instruct-q4_k_m.gguf \
  https://huggingface.co/bartowski/Qwen2.5-7B-Instruct-GGUF/resolve/main/Qwen2.5-7B-Instruct-Q4_K_M.gguf

/opt/vd-voice/llama.cpp/build/bin/llama-server \
  -m /opt/vd-voice/models/qwen2.5-3b-instruct-q4_k_m.gguf \
  --host 127.0.0.1 --port 8080 -c 4096 -t 6 --jinja
```

BẪY đã mất thời gian: kho GGUF chính chủ của Qwen chia bản Q4_K_M thành hai mảnh
(`-00001-of-00002`), nên đường dẫn tới một tệp đơn ở đó trả 404. Kho
`bartowski` để một tệp liền, dùng thẳng được.

Chọn Qwen2.5 vì nó là model mã nguồn mở (giấy phép Apache 2.0) làm được cả tiếng
Đức lẫn tiếng Việt ở cùng một chỗ - lời giảng phải là tiếng Việt trong khi câu
nói mẫu phải là tiếng Đức, và một model chỉ mạnh tiếng Anh sẽ hỏng đúng ở chỗ đó.

Nối vào ứng dụng:

```
LINGORA_LLM_URL=http://127.0.0.1:8080/v1
LINGORA_LLM_MODEL=qwen2.5-3b-instruct
```

### Đo thật, và vì sao lớp học không để model sinh câu nói

Chạy thử trên chính máy chủ (8 nhân CPU, không GPU), cùng một lời nhắc:

| Model | Tốc độ | Chất lượng quan sát được |
|---|---|---|
| Qwen2.5-7B Q4 | 2,4-4,3 token/giây → **25-45 giây một câu đáp** | sửa nhầm lỗi gõ ß, giải thích bằng tiếng Đức thay vì tiếng Việt |
| Qwen2.5-3B Q4 | ~9 token/giây → **16 giây một câu đáp** | có lượt trả lời phần tiếng Việt bằng **tiếng Trung** |

Kết luận rút ra từ hai bảng số đó, không phải từ sở thích: **model cỡ nhỏ chạy
CPU không đủ để làm người đối thoại trực tiếp trong lớp tiếng Đức.** Người học A1
không chờ nửa phút cho câu "Woher kommst du?", và một câu tiếng Trung giữa lớp
tiếng Đức thì hỏng hoàn toàn.

Nên lớp học được dựng lại theo hướng khác:

- **Câu Anna nói lấy từ kịch bản của bài** (`script` trong
  `src/content/bai-hoc.ts`). Ra ngay lập tức, luôn đúng cấp độ, không bao giờ
  bịa.
- **Model chỉ làm đúng một việc**: nhìn câu người học vừa nói và chỉ ra một lỗi.
  Việc này ngắn, và đo được **3,8-4,5 giây một lượt** với model 3B.
- **Model hỏng, chậm hay chưa bật thì buổi học vẫn chạy**, chỉ là không có ô sửa
  lỗi.

Chất lượng phần chữa lỗi sau khi thêm ví dụ mẫu và ba chốt chặn ở server
(`src/lib/lop-hoc.ts`):

| Câu người học nói | Kết quả |
|---|---|
| Ich komme von Vietnam. | `komme von` → `komme aus`, giải thích tiếng Việt ✓ |
| Gestern ich habe nach Berlin gefahren. | `habe nach` → `bin nach` ✓ |
| Ich möchte zwei Kilo Tomaten. | không chữa ✓ (tiếng Đức đời thường, không phải lỗi) |
| Ich treffe meine Freundin um acht Uhr. | không chữa ✓ |
| Ich heisse Mai. | không chữa ✓ (ß gõ thành ss là bàn phím, không phải lỗi) |
| Ich habe gestern in Berlin gefahren. | không chữa ✗ (bỏ sót) |

Bỏ sót thì chấp nhận được; chữa sai thì không. Người học tin lời cô giáo, nên
một lời chữa sai làm hỏng đúng cái mà buổi học vừa dạy đúng. Ba chốt chặn ở
server đều sinh ra từ lỗi gặp thật khi chạy thử: câu sửa phải là tiếng Đức
(model đã có lần "sửa" `ich heisse` thành `tôi tên là`), phần bị coi là sai
phải thật sự nằm trong câu người học nói, và khác biệt chỉ ở ß/ä/ö/ü thì bỏ.

**Đường nâng cấp khi có GPU:** dùng model lớn hơn cho phần chữa lỗi và cho phép
model sinh cả câu đáp. Không cần đổi kiến trúc - chỉ đổi biến môi trường.

### Dịch vụ vd-llm

systemd unit `vd-llm.service`, nghe `127.0.0.1:8080`, dùng chung máy với
`vd-voice`. Đổi model là sửa đường dẫn trong unit rồi
`systemctl restart vd-llm`; model nạp xong trong vài giây (3B) tới một phút (7B).

## Điều KHÔNG tự host được

Thẻ tín dụng và PayPal cần tài khoản thương gia đứng tên pháp nhân, có hợp đồng
và thẩm định - không có phần mềm mã nguồn mở nào thay được. Vì vậy cách thanh
toán mặc định của sản phẩm là **chuyển khoản ngân hàng**, xem
`src/lib/thanh-toan.ts`.

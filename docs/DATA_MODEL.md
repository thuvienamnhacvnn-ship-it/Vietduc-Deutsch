# Mô hình dữ liệu

Nguồn sự thật là `src/lib/db/schema.ts`; tài liệu này giải thích **vì sao** các
bảng có hình dạng như vậy. Migration SQL nằm trong `drizzle/`.

## Nguyên tắc chung

1. **Ownership tường minh.** Mọi bảng chứa dữ liệu người học đều có `user_id` và
   mọi truy vấn đọc/ghi đều lọc theo `user_id` của phiên - kiểm ở server, không
   phải bằng cách ẩn nút trên UI.
2. **Điểm gắn phiên bản.** `skill_scores.rubric_version_id`,
   `responses.question_version`, `exercise_attempts.lesson_version_id`. Sửa rubric
   hay giáo trình về sau không được làm sai lệch điểm đã chấm.
3. **Tiền lưu số nguyên nhỏ nhất.** `amount_cents integer` + `currency char(3)`.
   Không bao giờ dùng số thực cho tiền.
4. **Sự kiện có khóa chống trùng.** `webhook_events.event_id`,
   `jobs.idempotency_key`, `progress_events.idempotency_key` đều UNIQUE. Request
   lặp không tạo hệ quả lặp.
5. **Thời gian lưu UTC** (`timestamptz`). Hiển thị đổi sang
   `learner_profiles.timezone`, mặc định `Europe/Berlin`.

## Nhóm bảng

### Identity
- `users` - email (unique, viết thường), `password_hash` (scrypt), `role`,
  `email_verified_at`, `status`.
- `sessions` - `token` unique, `user_id`, `expires_at`, `user_agent`, `revoked_at`.
- `auth_tokens` - token dùng một lần cho xác minh email và đặt lại mật khẩu; lưu
  **hash** của token, có `purpose`, `expires_at`, `used_at`.
- `consents` - `user_id`, `kind` (terms, privacy, marketing_contact), `granted`,
  `granted_at`, `document_version`.
- `learner_profiles` - mục tiêu học, lý do, thời gian mỗi tuần, hạn mong muốn,
  ngôn ngữ hỗ trợ, timezone, tùy chọn accessibility (JSONB), lịch khả dụng (JSONB).

### Learning
- `courses` -> `modules` -> `lessons` -> `lesson_versions`.
  Nội dung bài nằm ở `lesson_versions.body` (JSONB, có `schema_version`), trạng
  thái draft / in_review / published / archived. Học viên chỉ đọc bản published.
- `objectives` - mục tiêu "có thể làm" theo CEFR; `lesson_objectives` nối
  nhiều-nhiều để đo độ phủ.
- `assets` - audio/ảnh: `storage_key`, `mime`, `bytes`, `license`, `alt_text`.
- `enrollments`, `learning_plans` (`items` JSONB có thứ tự, `revision`, lý do thay đổi).

### Assessment
- `question_bank` + `question_versions` - `level`, `skill`, `objective_id`,
  `difficulty`, `payload` JSONB, `answer_key` hoặc `rubric_id`, `review_state`.
- `assessment_sessions` - `kind` (quick / placement), `status`, `resume_state`
  JSONB. Cho phép rời đi rồi quay lại.
- `responses` - một dòng mỗi câu, ghi ngay khi trả lời (yêu cầu C-10), có
  `question_version`, `raw` JSONB, `audio_asset_id`.
- `rubric_versions` - tiêu chí chấm dạng JSONB, bất biến sau khi đã dùng để chấm.
- `skill_scores` - mỗi kỹ năng một dòng: `level_estimate`, `confidence` (0-1),
  `evidence` JSONB, `insufficient_evidence` boolean. **Cột cuối là điểm mấu chốt**:
  thiếu audio thì kỹ năng Nói được đánh dấu thiếu bằng chứng chứ không được suy ra điểm.

### Classroom
- `class_sessions` - buổi học: `lesson_version_id`, `state` (máy trạng thái),
  `started_at`, `ended_at`, `summary` JSONB.
- `turns` - từng lượt nói: `turn_id` (uuid do client sinh), `role`, `transcript`,
  `transcript_edited_by_user`, `audio_asset_id`, `latency_ms` JSONB (stt/model/tts
  tách riêng), `cancelled_at`. Lượt bị ngắt lời được đánh dấu `cancelled_at` và
  không bao giờ được phát.
- `exercise_attempts` - bài tập: `payload`, `score`, `rubric_version_id`,
  `feedback` JSONB.
- `progress_events` - nhật ký tiến độ có `idempotency_key`.
- `review_items` - spaced repetition: `item_type` (vocab / error_pattern),
  `due_at`, `interval_days`, `ease`, `lapses`.
- `learner_memories` - bộ nhớ dài hạn đã xác nhận: `kind`, `content`,
  `confirmed_at`, `source_session_id`. Chỉ đọc theo đúng `user_id`.

### Commerce
- `plans` -> `plan_versions` (giá EUR, chu kỳ, hạn mức AI/voice, dùng thử). Order
  luôn trỏ tới một `plan_version_id` cụ thể; đổi giá về sau không sửa đơn cũ.
- `orders`, `payments`, `subscriptions`, `entitlements`, `webhook_events`.
- `entitlements` là thứ duy nhất quyết định quyền học: `user_id`, `scope` (một
  cấp độ hoặc toàn khóa), `source_payment_id`, `active_from`, `active_until`.

### Operations
- `agent_runs` - mỗi lần gọi agent: `role`, `prompt_version`, `input_digest`,
  `tokens_in`/`tokens_out`, `cost_micros`, `status`, `error`, `reason_for_role`
  (yêu cầu E-02).
- `usage_ledger` - usage theo `service` (llm/stt/tts/avatar), `unit`, `quantity`,
  `cost_micros`, gắn `user_id` và `class_session_id` để tính chi phí theo học viên.
- `jobs` - hàng đợi: `kind`, `run_at`, `attempts`, `max_attempts`,
  `idempotency_key`, `locked_by`.
- `notifications`, `audit_logs` (`actor_user_id`, `action`, `entity`, `entity_id`,
  `before`/`after` JSONB, `ip`).

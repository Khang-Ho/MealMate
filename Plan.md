# MealMate — Project Plan

## 1. Executive Summary

Một ứng dụng di động hỗ trợ người dùng tối ưu hóa việc chuẩn bị nguyên liệu nấu ăn. Hệ thống sử dụng AI để phân tích công thức, tích hợp dữ liệu tồn kho thực tế (Real-time Inventory) từ các chuỗi bán lẻ lớn tại Mỹ và hiển thị trực quan lộ trình di chuyển tối ưu thông qua Mapbox.

---

## 2. Problem Statement

- **Thông tin rời rạc:** Google Maps chỉ biết vị trí cửa hàng, không biết cửa hàng đó còn "Bánh phở" hay "Hành tây" không.
- **Lãng phí thời gian:** Người dùng tại Mỹ tốn trung bình 20–30 phút lái xe chỉ để nhận ra siêu thị hết món đồ họ cần.
- **Thiếu phương án dự phòng:** Khi thiếu một nguyên liệu đặc thù, người dùng lúng túng không biết nên đi xa hơn hay đổi món khác.

---

## 3. User Flow

1. **Recipe Selection** — Người dùng nhập/chọn món ăn (ví dụ: "Phở").
2. **Ingredient Checklist** — AI trích xuất danh sách nguyên liệu. Người dùng tích chọn những thứ đã có; hệ thống xác định danh sách cần mua.
3. **Smart Search** — Hệ thống quét các cửa hàng trong bán kính 2–5 miles.
4. **Decision Point**
   - ✅ Nếu có đủ: Hiển thị bản đồ dẫn đường.
   - ⚠️ Nếu thiếu/Quá xa: AI gợi ý đổi sang món ăn khác có thể nấu với số nguyên liệu hiện có.

---

## 4. Technical Architecture

| Thành phần   | Công nghệ             | Mục đích                                                                 |
| ------------ | --------------------- | ------------------------------------------------------------------------ |
| Frontend     | React Native          | Phát triển nhanh, mượt trên cả iOS/Android.                              |
| Map Engine   | Mapbox SDK            | Hiển thị bản đồ tùy chỉnh, vẽ marker và label khoảng cách/thời gian.    |
| Backend      | FastAPI (Python)      | Xử lý logic AI (LangChain), kết nối API và tính toán khoảng cách.       |
| Database     | PostgreSQL + PostGIS  | Lưu trữ dữ liệu địa lý siêu thị và thông tin người dùng.                |
| Cache Layer  | Redis                 | Lưu tạm kết quả tìm kiếm để tránh gọi Google API lặp lại (tiết kiệm chi phí). |

---

## 5. API Integration Strategy

### A. Location & Mapping

- **Google Places API** — Tìm kiếm chính xác các địa điểm siêu thị (dữ liệu POI của Google tại Mỹ rất mạnh).
- **Mapbox Directions API** — Tính toán thời gian di chuyển thực tế (Traffic-aware) và hiển thị khoảng cách trên bản đồ.

### B. Inventory & Product Data

- **Kroger API** — Lấy dữ liệu tồn kho thật từ hệ thống Kroger, Ralphs, Fred Meyer...
- **Serper.dev (Google Shopping Scraper)** — Verify tồn kho cho các chuỗi không có API mở như Trader Joe's hoặc Whole Foods.
- **Spoonacular API** — Cung cấp data công thức nấu ăn chuẩn và gợi ý món thay thế (Substitution logic).

### C. Intelligence Layer

- **Gemini 1.5 Flash** — Trích xuất thực thể (Entity Extraction) và xử lý logic đổi món dựa trên nguyên liệu khả dụng.

---

## 6. Detailed Logic: Search & Visualization

### Step 1: Geo-Scanning & Filtering

Hệ thống nhận tọa độ GPS, gọi Google Places để lọc ra 3 tầng (Tiers):

| Tier | Chuỗi siêu thị          | Đặc điểm           |
| ---- | ------------------------ | ------------------ |
| 1    | Walmart, Costco          | Mọi thứ            |
| 2    | Whole Foods, Kroger      | Đồ tươi, gia vị đặc thù |
| 3    | CVS, Walgreens           | Đồ khô, sữa, trứng |

### Step 2: Mapbox Visualization

- Hiển thị **Marker** cho tất cả các điểm khả thi.
- Mỗi Marker đính kèm nhãn: `[Tên siêu thị] — [Khoảng cách] — [Tình trạng hàng]`.
- Nếu người dùng chọn "Plan cho 2–3 ngày tới", hệ thống ưu tiên các siêu thị Tier 1 dù ở xa hơn.

### Step 3: Failure Handling (Logic đổi món)

Nếu nguyên liệu X không tìm thấy trong bán kính 5 miles:

- **Option 1:** Gợi ý cửa hàng ở xa hơn (>10 miles) kèm thời gian lái xe ước tính.
- **Option 2:** AI gợi ý — *"Bạn thiếu Bánh phở, nhưng bạn có sẵn Thịt bò và Hành tây. Bạn có muốn đổi sang nấu Bò né không?"*

---

## 7. Next Steps

- [ ] **Setup Environment** — Khởi tạo project FastAPI và kết nối thử với Mapbox SDK.
- [ ] **API Keys** — Đăng ký tài khoản Developer cho Kroger và Google Cloud.
- [ ] **MVP Script** — Viết script Python nhận Input (Món ăn) → Output (Danh sách nguyên liệu cần mua) dùng Gemini API.

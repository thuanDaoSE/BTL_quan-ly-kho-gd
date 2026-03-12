# 🏢 Hệ thống Quản lý Kho Gia dụng (WMS - Warehouse Management System)

## 📋 Tổng quan
Hệ thống WMS được phát triển bằng Spring Boot 3.x + React để quản lý toàn bộ quy trình nhập - xuất - tồn kho cho các sản phẩm gia dụng như tủ lạnh, máy giặt, bếp từ...

## 🏗️ Kiến trúc hệ thống
- **Backend**: Spring Boot 3.x, Spring Data JPA, MySQL
- **Frontend**: React + Vite + Tailwind CSS
- **Database**: MySQL 8.0
- **Architecture**: REST API với DTO pattern

---
## 🛠️ Cài đặt & Chạy

### Backend (Spring Boot)
```bash
# Clone project
git clone <repository-url>
cd quan-ly-kho-gd/demo

# Cấu hình database (application.properties)
spring.datasource.url=jdbc:mysql://localhost:3306/wms_db
spring.datasource.username=root
spring.datasource.password=your_password

# Chạy ứng dụng
docker-compose up -d --build
mvn spring-boot:run
```

### Frontend (React)
```bash
cd src/main/frontend/wms-frontend
npm install
npm run dev
```

### Database
```sql
CREATE DATABASE wms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 🎯 Nghiệp vụ cốt lõi

### 1. Serial Number Management
- Mỗi thiết bị có 1 mã định danh duy nhất
- Trạng thái: AVAILABLE → SOLD/DEFECTIVE
- Full traceability từ nhập → xuất

### 2. Real-time Inventory
- Tồn kho = Count(SerialNumber.AVAILABLE)
- Cập nhật tự động, không nhập tay

### 3. FIFO (First In, First Out)
- Ưu tiên xuất hàng nhập trước
- Đảm bảo quản lý tuổi kho hiệu quả

---

## 📱 Giao diện người dùng

### 🏠 Dashboard
- Tổng quan hệ thống
- Biểu đồ thống kê
- Quick actions

### 📦 Quản lý kho
- Form tạo phiếu nhập/xuất
- Danh sách phiếu
- Quản lý Serial Number

### 🔍 Truy xuất
- Tìm kiếm Serial Number
- Lịch sử thiết bị
- Đánh dấu hàng lỗi

### 👥 Quản trị
- Quản lý user
- Phân quyền
- Master data

---

## 🔒 Security Features

- 🛡️ Role-based access control (RBAC)
- 🔐 JWT/Session authentication
- 📝 Audit trail (người tạo, thời gian)
- 🚫 CORS configuration cho frontend

---

## 📝 Development Notes

### Code Structure
```
com.example.demo/
├── model/          # JPA Entities
├── dto/            # Data Transfer Objects  
├── repository/     # Spring Data JPA
├── service/        # Business Logic
├── controller/     # REST API
└── security/       # Security Config
---

## 🎯 Module 1: Quản trị Hệ thống & Phân quyền (Security & User Management)

### 🔐 Đăng nhập/Đăng xuất
- Xác thực người dùng qua REST API
- Hỗ trợ JWT hoặc Session-based authentication

### 👥 Phân quyền (RBAC - Role-Based Access Control)

#### 🛡️ Quyền Admin / Quản lý
- ✅ Toàn quyền trên hệ thống
- ✅ Xem báo cáo tài chính, doanh thu
- ✅ Quản lý tài khoản nhân viên
- ✅ Xem tất cả các module

#### 📦 Quyền Thủ kho (Warehouse Keeper)
- ✅ Tạo phiếu nhập/xuất
- ✅ Quản lý trạng thái thiết bị
- ✅ Xem danh sách hàng hóa
- ❌ Không được xem báo cáo tiền bạc
- ❌ Không được xóa nhân sự

### 👨‍💼 Quản lý Nhân sự (User CRUD)
- Thêm, sửa, xóa, khóa tài khoản nhân viên
- Phân quyền Admin/Thủ kho cho từng tài khoản

---

## 📚 Module 2: Quản lý Danh mục & Đối tác (Master Data Management)

### 🏷️ Quản lý Danh mục (Category)
- Thêm, sửa, xóa danh mục sản phẩm
- Ví dụ: Tủ lạnh, Máy giặt, Bếp từ
- API: `GET/POST/PUT/DELETE /api/categories`

### 📦 Quản lý Sản phẩm (Product)
- Quản lý thông tin chi tiết sản phẩm:
  - Mã SKU (duy nhất)
  - Tên sản phẩm
  - Mô tả
  - Giá bán dự kiến
  - Đơn vị tính
  - Thuộc danh mục
- API: `GET/POST/PUT/DELETE /api/products`

### 🏭 Quản lý Nhà cung cấp (Supplier)
- Thêm, sửa, xóa thông tin nhà cung cấp
- Thông tin: Tên, SĐT, Địa chỉ
- Dùng cho nghiệp vụ Nhập kho
- API: `GET/POST/PUT/DELETE /api/suppliers`

### 🤝 Quản lý Khách hàng/Đại lý (Customer)
- Thêm, sửa, xóa thông tin khách hàng
- Dùng cho nghiệp vụ Xuất kho
- API: `GET/POST/PUT/DELETE /api/customers`

---

## 📥 Module 3: Nghiệp vụ Nhập Kho (Inbound Logistics)

### 📋 Lập Phiếu nhập kho (Receipt)
- Tạo phiếu nhập với thông tin:
  - Nhà cung cấp
  - Ghi chú
  - Người lập phiếu (User)
  - Thời gian lập (auto)
- API: `POST /api/receipts`

### 📝 Chi tiết Phiếu nhập (Receipt Detail)
- Thêm sản phẩm vào phiếu:
  - Sản phẩm
  - Số lượng
  - Giá nhập lô hàng
- Hỗ trợ nhập nhiều sản phẩm trong 1 phiếu

### 🎯 **Nghiệp vụ cốt lõi 1: Tự động sinh mã Serial**
Khi phiếu nhập được xác nhận hoàn tất:
```
Ví dụ: Nhập 10 Tủ lạnh Model XYZ
→ Hệ thống tự tạo 10 SerialNumber độc nhất:
  SN-TL-XYZ-001, SN-TL-XYZ-002, ..., SN-TL-XYZ-010
→ Trạng thái: AVAILABLE (Sẵn sàng xuất)
→ Liên kết với ReceiptDetail để truy xuất nguồn gốc
```

---

## 📤 Module 4: Nghiệp vụ Xuất Kho (Outbound Logistics)

### 📋 Lập Phiếu xuất kho (Issue)
- Tạo phiếu xuất với thông tin:
  - Khách hàng/Đại lý
  - Ghi chú
  - Người lập phiếu (User)
- API: `POST /api/issues`

### 📝 Chi tiết Phiếu xuất (Issue Detail)
- Chọn sản phẩm cần xuất:
  - Sản phẩm
  - Số lượng
  - Giá xuất
- Hỗ trợ xuất nhiều sản phẩm trong 1 phiếu

### 🎯 **Nghiệp vụ cốt lõi 2: Tự động xuất & Gắn mã Serial**
Khi xác nhận phiếu xuất, hệ thống thực hiện:

1. **Kiểm tra tồn kho**:
   ```
   Số lượng AVAILABLE >= Số lượng yêu cầu?
   → Nếu不足: Báo lỗi, chặn xuất
   ```

2. **Tự động lấy Serial (FIFO)**:
   ```
   Ưu tiên lấy hàng nhập trước
   Ví dụ: Cần xuất 5 chiếc → Lấy 5 S/N AVAILABLE sớm nhất
   ```

3. **Cập nhật trạng thái**:
   ```
   Chuyển trạng thái: AVAILABLE → SOLD
   Liên kết với IssueDetail để lưu lịch sử
   ```

---

## 🔍 Module 5: Quản lý Tồn kho & Kiểm soát Thiết bị (Inventory & Tracking)

### 📍 Traceability (Truy xuất nguồn gốc)
Với mỗi mã Serial, có thể truy vết:
- 🏷️ Thuộc sản phẩm nào?
- 📅 Ngày nhập kho? (Từ phiếu nhập nào?)
- 🚚 Đã xuất đi chưa? (Thuộc phiếu xuất nào, cho khách nào?)
- 📊 Trạng thái hiện tại: AVAILABLE/SOLD/DEFECTIVE

### ⚠️ Quản lý hàng lỗi/hỏng
- Thủ kho có thể đánh dấu thiết bị lỗi:
  ```
  Tìm mã S/N → Chuyển trạng thái: AVAILABLE → DEFECTIVE
  ```
- Serial bị đánh dấu lỗi:
  - ❌ Bị loại khỏi danh sách xuất kho
  - ✅ Vẫn hiển thị trong báo cáo tồn kho

### 📊 Tính toán tồn kho thời gian thực
```
Tồn kho = COUNT(SerialNumber WHERE status = 'AVAILABLE' AND product_id = ?)
```
- Không nhập tay - Tự động tính toán
- Cập nhật real-time khi có nhập/xuất

---

## 📈 Module 6: Báo cáo & Thống kê (Dashboards)

### 📊 Bảng điều khiển (Dashboard)
- 📈 Tổng số sản phẩm trong tháng
- 📥 Tổng số phiếu nhập trong tháng  
- 📤 Tổng số phiếu xuất trong tháng
- 💰 Tổng giá trị tồn kho hiện tại
  ```
  Giá trị = Σ(Số lượng AVAILABLE × Giá vốn)
  ```

### 🏆 Top Bán chạy
- Thống kê 5 mặt hàng xuất nhiều nhất
- Có thể filter theo khoảng thời gian

### 📑 Xuất file Excel
- 📊 Báo cáo tồn kho: Danh sách hàng hóa + số lượng + giá trị
- 📋 Báo cáo xuất nhập tồn: Chi tiết các giao dịch
- Sử dụng Apache POI để generate Excel

---

## 🚀 API Endpoints

### Products
```
POST   /api/products          - Tạo sản phẩm
GET    /api/products          - Lấy danh sách
PUT    /api/products/{id}     - Cập nhật
DELETE /api/products/{id}     - Xóa
```

### Receipts (Nhập kho)
```
POST   /api/receipts          - Tạo phiếu nhập
GET    /api/receipts          - Lấy danh sách
GET    /api/receipts/{id}     - Chi tiết phiếu
```

### Issues (Xuất kho)
```
POST   /api/issues            - Tạo phiếu xuất
GET    /api/issues            - Lấy danh sách  
GET    /api/issues/{id}       - Chi tiết phiếu
```

### Serial Numbers (Truy xuất)
```
GET    /api/serials           - Lấy danh sách
GET    /api/serials/{code}    - Tra cứu mã S/N
PUT    /api/serials/{code}    - Đánh dấu lỗi
```

---

## 🗄️ Database Schema

### Entities chính
- **User**: Người dùng & phân quyền
- **Category**: Danh mục sản phẩm
- **Product**: Thông tin sản phẩm
- **Supplier**: Nhà cung cấp
- **Customer**: Khách hàng
- **Receipt**: Phiếu nhập kho
- **ReceiptDetail**: Chi tiết phiếu nhập
- **Issue**: Phiếu xuất kho
- **IssueDetail**: Chi tiết phiếu xuất
- **SerialNumber**: Mã định danh thiết bị (🎯 Core Entity)

### Mối quan hệ
```
Product (1) → (*) SerialNumber
Receipt (1) → (*) ReceiptDetail → (*) SerialNumber
Issue (1) → (*) IssueDetail → (*) SerialNumber
SerialNumber (0..1) → ReceiptDetail (Nguồn gốc)
SerialNumber (0..1) → IssueDetail (Lịch sử xuất)
```





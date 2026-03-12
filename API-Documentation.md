# WMS API Documentation

## REST API Endpoints

### Product Management
- **POST** `/api/products` - Tạo sản phẩm mới

```json
{
  "skuCode": "LAP-001",
  "name": "Laptop Dell XPS 13",
  "description": "Laptop cao cấp",
  "price": 25000000,
  "unit": "cái",
  "categoryId": 1
}
```

### Receipt Management (Nhập kho)
- **POST** `/api/receipts` - Tạo phiếu nhập kho

```json
{
  "supplierName": "Công ty ABC",
  "note": "Nhập lô hàng mới",
  "totalAmount": 50000000,
  "userId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "importPrice": 25000000
    }
  ]
}
```

### Issue Management (Xuất kho)
- **POST** `/api/issues` - Tạo phiếu xuất kho

```json
{
  "customerName": "Khách hàng XYZ",
  "note": "Xuất bán lẻ",
  "userId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 1,
      "exportPrice": 27000000
    }
  ]
}
```

## Features
- ✅ Tự động sinh mã Serial cho từng sản phẩm nhập kho
- ✅ Kiểm tra tồn kho trước khi xuất (nếu không đủ hàng sẽ báo lỗi)
- ✅ Quản lý trạng thái Serial: AVAILABLE → SOLD
- ✅ Transaction management đảm bảo tính toàn vẹn dữ liệu

## Error Handling
- **400 Bad Request**: Trả về message lỗi chi tiết (ví dụ: "Không đủ hàng cho sản phẩm Laptop Dell XPS 13. Cần: 2, Có sẵn: 1")
- **500 Internal Server Error**: Lỗi hệ thống

## Architecture
- **DTO Layer**: Tách biệt dữ liệu input/output
- **Service Layer**: Xử lý logic nghiệp vụ
- **Repository Layer**: Truy cập dữ liệu
- **Controller Layer**: REST API endpoints

package com.example.demo.controller;

import com.example.demo.dto.ReceiptItemRequest;
import com.example.demo.dto.ReceiptRequest;
import com.example.demo.model.Receipt;
import com.example.demo.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/receipts")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptService receiptService;

    @PostMapping
    public ResponseEntity<?> createReceipt(@RequestBody ReceiptRequest request) {
        try {
            // Chuyển đổi DTO sang Entity
            Receipt receipt = Receipt.builder()
                    .receiptCode(generateReceiptCode())
                    .supplierName(request.getSupplierName())
                    .note(request.getNote())
                    .totalAmount(request.getTotalAmount())
                    // User có thể được set null hoặc tìm từ userId
                    .build();

            // Chuyển đổi danh sách ReceiptItemRequest
            List<ReceiptItemRequest> items = request.getItems();

            Receipt savedReceipt = receiptService.createReceipt(receipt, items);
            
            return ResponseEntity.ok(savedReceipt);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi tạo phiếu nhập: " + e.getMessage());
        }
    }

    private String generateReceiptCode() {
        return "REC-" + System.currentTimeMillis();
    }
}

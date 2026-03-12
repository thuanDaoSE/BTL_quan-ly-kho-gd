package com.example.demo.service;

import com.example.demo.dto.ReceiptItemRequest;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final ReceiptDetailRepository receiptDetailRepository;
    private final ProductRepository productRepository;
    private final SerialNumberRepository serialNumberRepository;

    public Receipt createReceipt(Receipt receipt, List<ReceiptItemRequest> items) {
        // Lưu Receipt
        receipt.setStatus(ReceiptStatus.COMPLETED);
        Receipt savedReceipt = receiptRepository.save(receipt);

        BigDecimal totalAmount = BigDecimal.ZERO;

        // Lưu các ReceiptDetail và tạo SerialNumber
        for (ReceiptItemRequest item : items) {
            // Kiểm tra Product tồn tại
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + item.getProductId()));

            // Tạo ReceiptDetail
            ReceiptDetail receiptDetail = ReceiptDetail.builder()
                    .receipt(savedReceipt)
                    .product(product)
                    .quantity(item.getQuantity())
                    .importPrice(item.getImportPrice())
                    .build();

            ReceiptDetail savedReceiptDetail = receiptDetailRepository.save(receiptDetail);

            // Tính tổng tiền
            totalAmount = totalAmount.add(item.getImportPrice().multiply(BigDecimal.valueOf(item.getQuantity())));

            // Sinh SerialNumber cho từng sản phẩm
            for (int i = 0; i < item.getQuantity(); i++) {
                SerialNumber serialNumber = SerialNumber.builder()
                        .serialCode(generateSerialCode(product.getSkuCode(), i + 1))
                        .product(product)
                        .receiptDetail(savedReceiptDetail)
                        .status(SerialStatus.AVAILABLE)
                        .build();

                serialNumberRepository.save(serialNumber);
            }
        }

        // Cập nhật tổng tiền cho Receipt
        savedReceipt.setTotalAmount(totalAmount);
        return receiptRepository.save(savedReceipt);
    }

    private String generateSerialCode(String skuCode, int sequence) {
        return skuCode + "-" + System.currentTimeMillis() + "-" + sequence;
    }
}

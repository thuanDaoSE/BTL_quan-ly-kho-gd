package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptRequest {
    private String supplierName;
    private String note;
    private BigDecimal totalAmount;
    private Long userId;
    private List<ReceiptItemRequest> items;
}

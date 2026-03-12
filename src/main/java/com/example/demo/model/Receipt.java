package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "receipts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Receipt extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String receiptCode;

    private String supplierName;
    private String note;
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private ReceiptStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // Người lập phiếu
}

// Bạn có thể đặt enum này chung file hoặc tách ra file riêng biệt
enum ReceiptStatus {
    PENDING, COMPLETED
}
package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "serial_numbers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SerialNumber extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String serialCode;

    @Enumerated(EnumType.STRING)
    private SerialStatus status; 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    // Truy xuất nguồn gốc: Thiết bị này được nhập vào từ lô hàng nào?
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receipt_detail_id")
    private ReceiptDetail receiptDetail;

    // Thiết bị này đã được xuất đi trong đơn hàng nào? (Sẽ là null nếu chưa xuất)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_detail_id")
    private IssueDetail issueDetail;
}

enum SerialStatus {
    AVAILABLE, SOLD, DEFECTIVE
}
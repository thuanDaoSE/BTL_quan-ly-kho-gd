package com.example.demo.service;

import com.example.demo.dto.IssueItemRequest;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class IssueService {

    private final IssueRepository issueRepository;
    private final IssueDetailRepository issueDetailRepository;
    private final ProductRepository productRepository;
    private final SerialNumberRepository serialNumberRepository;

    public Issue createIssue(Issue issue, List<IssueItemRequest> items) {
        // Lưu Issue
        issue.setStatus(IssueStatus.COMPLETED);
        Issue savedIssue = issueRepository.save(issue);

        // Lưu các IssueDetail và cập nhật SerialNumber
        for (IssueItemRequest item : items) {
            // Kiểm tra Product tồn tại
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + item.getProductId()));

            // Kiểm tra số lượng hàng AVAILABLE trong kho
            long availableCount = serialNumberRepository.countByProductIdAndStatus(
                    item.getProductId(), SerialStatus.AVAILABLE);

            if (availableCount < item.getQuantity()) {
                throw new RuntimeException("Không đủ hàng cho sản phẩm " + product.getName() + 
                        ". Cần: " + item.getQuantity() + ", Có sẵn: " + availableCount);
            }

            // Tạo IssueDetail
            IssueDetail issueDetail = IssueDetail.builder()
                    .issue(savedIssue)
                    .product(product)
                    .quantity(item.getQuantity())
                    .exportPrice(item.getExportPrice())
                    .build();

            IssueDetail savedIssueDetail = issueDetailRepository.save(issueDetail);

            // Tìm và cập nhật SerialNumber từ AVAILABLE thành SOLD
            List<SerialNumber> availableSerials = serialNumberRepository
                    .findByProductIdAndStatus(item.getProductId(), SerialStatus.AVAILABLE)
                    .stream()
                    .limit(item.getQuantity())
                    .toList();

            for (SerialNumber serial : availableSerials) {
                serial.setStatus(SerialStatus.SOLD);
                serial.setIssueDetail(savedIssueDetail);
                serialNumberRepository.save(serial);
            }
        }

        return savedIssue;
    }
}

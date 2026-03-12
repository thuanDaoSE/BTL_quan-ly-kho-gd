package com.example.demo.controller;

import com.example.demo.dto.IssueRequest;
import com.example.demo.model.Issue;
import com.example.demo.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    @PostMapping
    public ResponseEntity<?> createIssue(@RequestBody IssueRequest request) {
        try {
            // Chuyển đổi DTO sang Entity
            Issue issue = Issue.builder()
                    .issueCode(generateIssueCode())
                    .customerName(request.getCustomerName())
                    .note(request.getNote())
                    // User có thể được set null hoặc tìm từ userId
                    .build();

            // Chuyển đổi danh sách IssueItemRequest
            List<IssueService.IssueItemRequest> items = request.getItems().stream()
                    .map(item -> new IssueService.IssueItemRequest(
                            item.getProductId(),
                            item.getQuantity(),
                            item.getExportPrice()
                    ))
                    .collect(Collectors.toList());

            Issue savedIssue = issueService.createIssue(issue, items);
            
            return ResponseEntity.ok(savedIssue);
        } catch (RuntimeException e) {
            // Bắt exception "Không đủ hàng" và các lỗi khác
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi tạo phiếu xuất: " + e.getMessage());
        }
    }

    private String generateIssueCode() {
        return "ISS-" + System.currentTimeMillis();
    }
}

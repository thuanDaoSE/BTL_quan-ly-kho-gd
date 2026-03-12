package com.example.demo.controller;

import com.example.demo.dto.IssueItemRequest;
import com.example.demo.dto.IssueRequest;
import com.example.demo.model.Issue;
import com.example.demo.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@CrossOrigin(origins = "http://localhost:5173")
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
            List<IssueItemRequest> items = request.getItems();

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

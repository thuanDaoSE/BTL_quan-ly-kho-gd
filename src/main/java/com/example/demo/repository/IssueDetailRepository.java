package com.example.demo.repository;

import com.example.demo.model.IssueDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IssueDetailRepository extends JpaRepository<IssueDetail, Long> {
}

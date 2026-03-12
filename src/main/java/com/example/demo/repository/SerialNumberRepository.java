package com.example.demo.repository;

import com.example.demo.model.SerialNumber;
import com.example.demo.model.SerialStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SerialNumberRepository extends JpaRepository<SerialNumber, Long> {
    
    List<SerialNumber> findByProductIdAndStatus(Long productId, SerialStatus status);
    
    @Query("SELECT COUNT(s) FROM SerialNumber s WHERE s.product.id = :productId AND s.status = :status")
    long countByProductIdAndStatus(@Param("productId") Long productId, @Param("status") SerialStatus status);
}

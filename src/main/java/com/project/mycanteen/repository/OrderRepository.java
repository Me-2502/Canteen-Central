package com.project.mycanteen.repository;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.project.mycanteen.entity.Order;
import com.project.mycanteen.entity.type.OrderStatus;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    Page<Order> findByCustomerIdOrderByCreatedAtDesc(UUID customerId, Pageable pageable);

    Page<Order> findByCanteenIdOrderByCreatedAtDesc(UUID canteenId, Pageable pageable);

    Page<Order> findByCanteenIdAndCreatedAtAfterOrderByCreatedAtAsc(UUID canteenId, Date createdAfter, Pageable pageable);

    Page<Order> findByCanteenIdAndCreatedAtBeforeOrderByCreatedAtAsc(UUID canteenId, Date createdBefore, Pageable pageable);

    List<Order> findByCanteenIdAndStatusNotOrderByCreatedAtAsc(UUID canteenId, OrderStatus status);

    List<Order> findByCanteenIdAndCreatedAtAfterOrderByCreatedAtAsc(UUID canteenId, Date createdAfter);

    List<Order> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);

    List<Order> findByCanteenIdOrderByCreatedAtDesc(UUID canteenId);
}

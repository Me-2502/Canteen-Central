package com.project.mycanteen.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.mycanteen.entity.Order;

public interface OrderRepository extends JpaRepository<Order, UUID> {

}

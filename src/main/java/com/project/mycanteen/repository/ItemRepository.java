package com.project.mycanteen.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.project.mycanteen.entity.Canteen;
import com.project.mycanteen.entity.Item;

public interface ItemRepository extends JpaRepository<Item, UUID> {

    List<Item> findByCanteenIdOrderByCreatedAtDesc(UUID canteenId);

    Page<Item> findByCanteenAndNameContainingIgnoreCase(Canteen canteen, String name, Pageable pageable);

    Page<Item> findByCanteenIdAndNameContainingIgnoreCase(UUID canteenId, String name, Pageable pageable);

    Optional<Item> findByIdAndCanteenId(UUID itemId, UUID canteenId);

    List<Item> findByCanteenId(UUID canteenId);
}

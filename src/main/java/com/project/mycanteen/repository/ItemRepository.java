package com.project.mycanteen.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.project.mycanteen.entity.Canteen;
import com.project.mycanteen.entity.Item;
import com.project.mycanteen.entity.type.EntityStatus;
import com.project.mycanteen.entity.type.ItemType;
import com.project.mycanteen.entity.type.OrderStatus;

public interface ItemRepository extends JpaRepository<Item, UUID> {

    String PUBLIC_ITEM_FILTER = " WHERE c.status = :canteenStatus " +
            "AND (:canteenId IS NULL OR c.id = :canteenId) " +
            "AND (:type IS NULL OR i.type = :type) " +
            "AND LOWER(i.name) LIKE LOWER(CONCAT('%', :keyword, '%')) ";

    List<Item> findByCanteenIdOrderByCreatedAtDesc(UUID canteenId);

    Page<Item> findByCanteenAndNameContainingIgnoreCase(Canteen canteen, String name, Pageable pageable);

    Page<Item> findByCanteenIdAndNameContainingIgnoreCase(UUID canteenId, String name, Pageable pageable);

    Optional<Item> findByIdAndCanteenId(UUID itemId, UUID canteenId);

    List<Item> findByCanteenId(UUID canteenId);

    // Sorting is taken from the Pageable (rating, price, newest, ...)
    @Query(value = "SELECT i FROM Item i JOIN FETCH i.canteen c" + PUBLIC_ITEM_FILTER,
            countQuery = "SELECT COUNT(i) FROM Item i JOIN i.canteen c" + PUBLIC_ITEM_FILTER)
    Page<Item> searchPublicItems(@Param("canteenStatus") EntityStatus canteenStatus,
                                 @Param("canteenId") UUID canteenId,
                                 @Param("type") ItemType type,
                                 @Param("keyword") String keyword,
                                 Pageable pageable);

    // Popularity = units sold across orders that were not cancelled; ties broken by rating, then number of ratings
    @Query(value = "SELECT i FROM Item i JOIN FETCH i.canteen c" + PUBLIC_ITEM_FILTER +
            "ORDER BY (SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi " +
            "WHERE oi.item = i AND oi.order.status <> :excludedOrderStatus) DESC, " +
            "i.rating DESC, i.ratingCount DESC, i.createdAt DESC",
            countQuery = "SELECT COUNT(i) FROM Item i JOIN i.canteen c" + PUBLIC_ITEM_FILTER)
    Page<Item> findPopularPublicItems(@Param("canteenStatus") EntityStatus canteenStatus,
                                      @Param("canteenId") UUID canteenId,
                                      @Param("type") ItemType type,
                                      @Param("keyword") String keyword,
                                      @Param("excludedOrderStatus") OrderStatus excludedOrderStatus,
                                      Pageable pageable);
}

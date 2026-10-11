package com.project.mycanteen.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.project.mycanteen.entity.OrderItem;
import com.project.mycanteen.entity.type.OrderStatus;

public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    List<OrderItem> findByOrderId(UUID orderId);

    // Returns rows of [itemId, unitsSold]; items with no matching orders are absent
    @Query("SELECT oi.item.id, SUM(oi.quantity) FROM OrderItem oi " +
            "WHERE oi.item.id IN :itemIds AND oi.order.status <> :excludedOrderStatus " +
            "GROUP BY oi.item.id")
    List<Object[]> sumQuantityByItemIds(@Param("itemIds") Collection<UUID> itemIds,
                                        @Param("excludedOrderStatus") OrderStatus excludedOrderStatus);
}

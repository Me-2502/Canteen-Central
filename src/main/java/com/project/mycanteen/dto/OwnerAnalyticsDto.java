package com.project.mycanteen.dto;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import com.project.mycanteen.entity.type.ItemType;
import com.project.mycanteen.entity.type.OrderStatus;
import com.project.mycanteen.entity.type.OrderType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Sales analytics for one canteen over the last {@code days} days, compared with the period before it. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerAnalyticsDto {
    private UUID canteenId;
    private String canteenName;
    private int days;
    private Summary summary;
    private List<DailyPoint> daily;
    private List<HourlyPoint> hourly;
    private List<StatusCount> statuses;
    private List<TypeBreakdown> orderTypes;
    private List<TopItem> topItems;
    private List<RecentOrder> recentOrders;

    /** Revenue and order figures exclude cancelled orders. */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private double revenue;
        private double previousRevenue;
        private long orders;
        private long previousOrders;
        private double averageOrderValue;
        private double previousAverageOrderValue;
        private long itemsSold;
        private long uniqueCustomers;
        private long cancelledOrders;
        private long menuItems;
        private long menuItemsSold;
        private float rating;
        private int ratingCount;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DailyPoint {
        private String date;
        private double revenue;
        private long orders;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class HourlyPoint {
        private int hour;
        private long orders;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class StatusCount {
        private OrderStatus status;
        private long count;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TypeBreakdown {
        private OrderType type;
        private long orders;
        private double revenue;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TopItem {
        private UUID itemId;
        private String name;
        private ItemType type;
        private long quantity;
        private double revenue;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RecentOrder {
        private UUID id;
        private String receiverName;
        private OrderStatus status;
        private OrderType type;
        private long itemCount;
        private double total;
        private Date createdAt;
    }
}

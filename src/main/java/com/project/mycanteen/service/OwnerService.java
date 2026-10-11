package com.project.mycanteen.service;

import java.time.DateTimeException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.EnumMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.mycanteen.dto.CanteenDto;
import com.project.mycanteen.dto.OwnerAnalyticsDto;
import com.project.mycanteen.dto.OwnerAnalyticsDto.DailyPoint;
import com.project.mycanteen.dto.OwnerAnalyticsDto.HourlyPoint;
import com.project.mycanteen.dto.OwnerAnalyticsDto.RecentOrder;
import com.project.mycanteen.dto.OwnerAnalyticsDto.StatusCount;
import com.project.mycanteen.dto.OwnerAnalyticsDto.Summary;
import com.project.mycanteen.dto.OwnerAnalyticsDto.TopItem;
import com.project.mycanteen.dto.OwnerAnalyticsDto.TypeBreakdown;
import com.project.mycanteen.entity.Canteen;
import com.project.mycanteen.entity.Item;
import com.project.mycanteen.entity.Order;
import com.project.mycanteen.entity.OrderItem;
import com.project.mycanteen.entity.User;
import com.project.mycanteen.entity.type.OrderStatus;
import com.project.mycanteen.entity.type.OrderType;
import com.project.mycanteen.error.BadRequestException;
import com.project.mycanteen.error.ForbiddenException;
import com.project.mycanteen.error.ResourceNotFoundException;
import com.project.mycanteen.repository.CanteenRepository;
import com.project.mycanteen.repository.ItemRepository;
import com.project.mycanteen.repository.OrderRepository;

import lombok.RequiredArgsConstructor;

/** Owner-only views. Every method is scoped to canteens the current user owns. */
@Service
@RequiredArgsConstructor
public class OwnerService {

    private static final int MAX_DAYS = 365;
    private static final int TOP_ITEMS = 8;
    private static final int RECENT_ORDERS = 8;

    private final CanteenRepository canteenRepository;
    private final ItemRepository itemRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public List<CanteenDto> getMyCanteens() {
        return canteenRepository.findByOwnerId(getCurrentUser().getId()).stream()
                .sorted(Comparator.comparing(Canteen::getName, String.CASE_INSENSITIVE_ORDER))
                .map(c -> CanteenDto.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .address(c.getAddress())
                        .imageUrl(c.getImageUrl())
                        .status(c.getStatus())
                        .rating(c.getRating())
                        .ratingCount(c.getRatingCount())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public OwnerAnalyticsDto getAnalytics(UUID canteenId, int days, String timeZone) {
        Canteen canteen = canteenRepository.findById(canteenId)
                .orElseThrow(() -> new ResourceNotFoundException("Canteen", canteenId));
        if (!Objects.equals(canteen.getOwner().getId(), getCurrentUser().getId())) {
            throw new ForbiddenException("You can only view analytics for canteens you own.");
        }
        if (days < 1 || days > MAX_DAYS) {
            throw new BadRequestException("days must be between 1 and " + MAX_DAYS + ".");
        }
        ZoneId zone = parseZone(timeZone);

        // The current period is today plus the (days - 1) days before it; the previous period is the same length just before
        LocalDate today = LocalDate.now(zone);
        LocalDate firstDay = today.minusDays(days - 1L);
        Instant periodStart = firstDay.atStartOfDay(zone).toInstant();
        Instant previousStart = firstDay.minusDays(days).atStartOfDay(zone).toInstant();
        Instant end = today.plusDays(1).atStartOfDay(zone).toInstant();

        List<Order> all = orderRepository.findByCanteenIdAndCreatedAtBetween(
                canteenId, Date.from(previousStart), Date.from(end));
        List<Order> current = new ArrayList<>();
        List<Order> previous = new ArrayList<>();
        for (Order order : all) {
            if (order.getCreatedAt() == null) continue;
            (order.getCreatedAt().toInstant().isBefore(periodStart) ? previous : current).add(order);
        }

        List<Order> currentValid = current.stream().filter(OwnerService::isNotCancelled).toList();
        List<Order> previousValid = previous.stream().filter(OwnerService::isNotCancelled).toList();
        double revenue = currentValid.stream().mapToDouble(OwnerService::orderTotal).sum();
        double previousRevenue = previousValid.stream().mapToDouble(OwnerService::orderTotal).sum();

        // Daily trend, with a zero entry for days without orders
        Map<LocalDate, DailyPoint> daily = new LinkedHashMap<>();
        for (LocalDate d = firstDay; !d.isAfter(today); d = d.plusDays(1)) {
            daily.put(d, new DailyPoint(d.toString(), 0, 0));
        }
        long[] hourly = new long[24];
        Map<OrderType, TypeBreakdown> types = new EnumMap<>(OrderType.class);
        Map<UUID, TopItem> items = new LinkedHashMap<>();
        Set<UUID> customers = new HashSet<>();
        long itemsSold = 0;

        for (Order order : currentValid) {
            ZonedDateTime at = order.getCreatedAt().toInstant().atZone(zone);
            double total = orderTotal(order);
            DailyPoint point = daily.get(at.toLocalDate());
            if (point != null) {
                point.setRevenue(point.getRevenue() + total);
                point.setOrders(point.getOrders() + 1);
            }
            hourly[at.getHour()]++;

            TypeBreakdown type = types.computeIfAbsent(order.getType(), t -> new TypeBreakdown(t, 0, 0));
            type.setOrders(type.getOrders() + 1);
            type.setRevenue(type.getRevenue() + total);

            if (order.getCustomer() != null) customers.add(order.getCustomer().getId());

            for (OrderItem line : order.getOrderItems()) {
                Item item = line.getItem();
                TopItem top = items.computeIfAbsent(item.getId(),
                        id -> new TopItem(id, item.getName(), item.getType(), 0, 0));
                top.setQuantity(top.getQuantity() + line.getQuantity());
                top.setRevenue(top.getRevenue() + line.getFinalPrice());
                itemsSold += line.getQuantity();
            }
        }

        // Status counts include cancelled orders so owners can see the drop-off
        Map<OrderStatus, Long> statuses = new EnumMap<>(OrderStatus.class);
        for (Order order : current) statuses.merge(order.getStatus(), 1L, Long::sum);

        List<RecentOrder> recentOrders = current.stream()
                .sorted(Comparator.comparing(Order::getCreatedAt).reversed())
                .limit(RECENT_ORDERS)
                .map(o -> new RecentOrder(o.getId(), o.getReceiverName(), o.getStatus(), o.getType(),
                        o.getOrderItems().stream().mapToLong(OrderItem::getQuantity).sum(),
                        orderTotal(o), o.getCreatedAt()))
                .toList();

        Summary summary = Summary.builder()
                .revenue(revenue)
                .previousRevenue(previousRevenue)
                .orders(currentValid.size())
                .previousOrders(previousValid.size())
                .averageOrderValue(currentValid.isEmpty() ? 0 : revenue / currentValid.size())
                .previousAverageOrderValue(previousValid.isEmpty() ? 0 : previousRevenue / previousValid.size())
                .itemsSold(itemsSold)
                .uniqueCustomers(customers.size())
                .cancelledOrders(statuses.getOrDefault(OrderStatus.CANCELLED, 0L))
                .menuItems(itemRepository.findByCanteenId(canteenId).size())
                .menuItemsSold(items.size())
                .rating(canteen.getRating())
                .ratingCount(canteen.getRatingCount())
                .build();

        List<HourlyPoint> hourlyPoints = new ArrayList<>();
        for (int h = 0; h < 24; h++) hourlyPoints.add(new HourlyPoint(h, hourly[h]));

        return OwnerAnalyticsDto.builder()
                .canteenId(canteen.getId())
                .canteenName(canteen.getName())
                .days(days)
                .summary(summary)
                .daily(new ArrayList<>(daily.values()))
                .hourly(hourlyPoints)
                .statuses(statuses.entrySet().stream().map(e -> new StatusCount(e.getKey(), e.getValue())).toList())
                .orderTypes(new ArrayList<>(types.values()))
                .topItems(items.values().stream()
                        .sorted(Comparator.comparingDouble(TopItem::getRevenue).reversed())
                        .limit(TOP_ITEMS)
                        .toList())
                .recentOrders(recentOrders)
                .build();
    }

    private static boolean isNotCancelled(Order order) {
        return order.getStatus() != OrderStatus.CANCELLED;
    }

    private static double orderTotal(Order order) {
        return order.getOrderItems().stream().mapToDouble(OrderItem::getFinalPrice).sum();
    }

    private static ZoneId parseZone(String timeZone) {
        if (timeZone == null || timeZone.isBlank()) return ZoneId.systemDefault();
        try {
            return ZoneId.of(timeZone);
        } catch (DateTimeException e) {
            throw new BadRequestException("Unknown time zone: " + timeZone);
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new BadRequestException("No authenticated user found.");
        }
        return user;
    }
}

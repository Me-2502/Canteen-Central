package com.project.mycanteen.entity;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.project.mycanteen.entity.type.EntityStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name="canteens")
public class Canteen {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "email", nullable = false, unique = true)
    private String mailid;
    @Column(name = "phone_number", nullable = true)
    private String phoneNumber;
    @Column(nullable = false)
    private String address;

    @Column(name = "canteen_url")
    private String url;
    @Column(name = "imgUrl")
    private String imageUrl;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable =  false, updatable = false)
    private User createdBy;
    @Column(name = "created_at", updatable = false)
    private Date createdAt;
    @Column(name = "updated_at", nullable = false)
    private Date updatedAt;

    @Enumerated(EnumType.STRING)
    @Column
    private EntityStatus status;

    @Column(name = "start_time")
    private Date startTime;
    @Column(name = "end_time")
    private Date endTime;

    @Column
    private float rating;
    @Column(name = "rating_count")
    private int ratingCount;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "allowed_order_domains")
    private List<String> allowedDomains = new ArrayList<>();

    @OneToMany(mappedBy = "canteen", fetch = FetchType.LAZY)
    private List<CanteenMember> members = new ArrayList<>();

    @OneToMany(mappedBy = "canteen", fetch = FetchType.LAZY)
    private List<Item> items = new ArrayList<>();

    @OneToMany(mappedBy = "canteen", fetch = FetchType.LAZY)
    private List<Order> orders = new ArrayList<>();
}

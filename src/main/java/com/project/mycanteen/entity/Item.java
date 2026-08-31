package com.project.mycanteen.entity;

import java.util.Date;
import java.util.UUID;

import com.project.mycanteen.entity.type.ItemType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "items")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String description;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "canteen_id", nullable = false, updatable = false)
    private Canteen canteen;

    @Column(nullable = false)
    private ItemType type;
    @Column
    private float measure;

    @Column(name = "img_url")
    private String imageUrl;

    @Column(name = "unit_price", nullable = false)
    private float unitPrice;

    @Column
    private float discount;

    @Column
    private float rating;
    @Column(name = "rating_count")
    private int ratingCount;

    @Column(name = "created_at", updatable = false)
    private Date createdAt;
    @Column(name = "updated_at", nullable = false)
    private Date updatedAt;
}

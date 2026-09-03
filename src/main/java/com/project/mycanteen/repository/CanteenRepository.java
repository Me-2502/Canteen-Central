package com.project.mycanteen.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.project.mycanteen.entity.Canteen;
import com.project.mycanteen.entity.type.EntityStatus;

public interface CanteenRepository extends JpaRepository<Canteen, UUID> {

    Page<Canteen> findByStatusOrderByRatingDesc(EntityStatus status, Pageable pageable);

    @Query("SELECT c FROM Canteen c WHERE c.status = :status AND " +
            "(LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.address) LIKE LOWER(CONCAT('%', :keyword, '%'))) ")
    Page<Canteen> searchByKeyword(@Param("status") EntityStatus status,
                                  @Param("keyword") String keyword,
                                  Pageable pageable);

    List<Canteen> findByOwnerId(UUID ownerId);

    List<Canteen> findByStatus(EntityStatus status);
}

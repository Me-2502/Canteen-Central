package com.project.mycanteen.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.mycanteen.entity.Canteen;
import com.project.mycanteen.entity.CanteenMember;
import com.project.mycanteen.entity.User;
import com.project.mycanteen.entity.type.CanteenMembershipStatus;

public interface CanteenMemberRepository extends JpaRepository<CanteenMember, UUID> {

    Optional<CanteenMember> findByCanteenAndMember(Canteen canteen, User member);

    List<CanteenMember> findByCanteenId(UUID canteenId);

    List<CanteenMember> findByMemberId(UUID memberId);

    List<CanteenMember> findByCanteenIdAndStatus(UUID canteenId, CanteenMembershipStatus status);
}

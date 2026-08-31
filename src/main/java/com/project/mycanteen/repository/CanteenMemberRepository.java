package com.project.mycanteen.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.mycanteen.entity.CanteenMember;

public interface CanteenMemberRepository extends JpaRepository<CanteenMember, UUID> {

}

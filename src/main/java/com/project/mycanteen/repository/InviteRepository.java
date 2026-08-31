package com.project.mycanteen.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.mycanteen.entity.Invite;

public interface InviteRepository extends JpaRepository<Invite, UUID> {

}

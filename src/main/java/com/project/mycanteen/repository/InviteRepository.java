package com.project.mycanteen.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.mycanteen.entity.Canteen;
import com.project.mycanteen.entity.Invite;
import com.project.mycanteen.entity.User;
import com.project.mycanteen.entity.type.InviteStatus;

public interface InviteRepository extends JpaRepository<Invite, UUID> {

    List<Invite> findByCanteenOrderByCreatedAtDesc(Canteen canteen);

    List<Invite> findByInviterIdOrderByCreatedAtDesc(User inviterId);

    Optional<Invite> findByInvitedIdAndCanteenAndStatus(User invitedId, Canteen canteen, InviteStatus status);

    Optional<Invite> findByMailidAndCanteenAndStatus(String mailid, Canteen canteen, InviteStatus status);

    List<Invite> findByInvitedId(User invitedId);

    List<Invite> findByMailid(String mailid);

    List<Invite> findByStatus(InviteStatus status);
}

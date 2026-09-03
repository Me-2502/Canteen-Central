package com.project.mycanteen.entity;

import java.util.Date;
import java.util.UUID;

import com.project.mycanteen.entity.type.InviteStatus;
import com.project.mycanteen.entity.type.RoleType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "invites")
public class Invite {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "canteen_id", nullable = false)
    private Canteen canteen;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "invited_id", nullable = true, updatable = false)
    private User invitedId;

    @Column(name = "mailid")
    private String mailid;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "inviter_id", nullable = false, updatable = false)
    private User inviterId;

    @Enumerated(EnumType.STRING)
    @Column
    private RoleType role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InviteStatus status;

    @Column(name = "created_at", updatable = false)
    private Date createdAt;
    @Column(name = "updated_at", nullable = false)
    private Date updatedAt;
}

package com.project.mycanteen.security;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

import com.project.mycanteen.entity.type.RoleType;
import com.project.mycanteen.entity.type.PermissionType;

import static com.project.mycanteen.entity.type.RoleType.*;
import static com.project.mycanteen.entity.type.PermissionType.*;

public class RolePermissionMapping {
    private static final Map<RoleType, Set<PermissionType>> roleAuthorityMap = Map.of(
        ADMIN, Set.of(
            ORDER_READ,
            ORDER_WRITE,
            MENU_READ,
            MENU_WRITE,
            CANTEEN_READ,
            CANTEEN_WRITE,
            PROFILE_READ,
            PROFILE_WRITE,
            USER_READ,
            USER_WRITE,
            RATING_WRITE
        ),
        OWNER, Set.of(
            ORDER_READ,
            ORDER_WRITE,
            MENU_READ,
            MENU_WRITE,
            CANTEEN_READ,
            CANTEEN_WRITE,
            PROFILE_READ,
            PROFILE_WRITE,
            RATING_WRITE
        ),
        CHEF, Set.of(
            ORDER_READ,
            ORDER_WRITE,
            MENU_READ,
            PROFILE_READ,
            RATING_WRITE
        ),
        WAITER, Set.of(
            ORDER_READ,
            ORDER_WRITE,
            PROFILE_READ
        ),
        CUSTOMER, Set.of(
            ORDER_READ,
            ORDER_WRITE,
            MENU_READ,
            PROFILE_READ,
            PROFILE_WRITE,
            RATING_WRITE
        )
    );

    public static Set<SimpleGrantedAuthority> getAuthoritiesForRole(RoleType role) {
        if (role == null || !roleAuthorityMap.containsKey(role)) {
            return Set.of();
        }
        return roleAuthorityMap.get(role).stream()
                .map(permission -> new SimpleGrantedAuthority(permission.getPermission()))
                .collect(Collectors.toSet());
    }
}

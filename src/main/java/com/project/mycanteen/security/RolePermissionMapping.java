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
            USER_READ
        ),
        OWNER, Set.of(
            ORDER_READ,
            ORDER_WRITE,
            MENU_READ,
            MENU_WRITE
        ),
        CHEF, Set.of(
            ORDER_READ,
            ORDER_WRITE,
            MENU_READ
        ),
        WAITER, Set.of(
            ORDER_READ,
            ORDER_WRITE
        ),
        CUSTOMER, Set.of(
            ORDER_READ,
            ORDER_WRITE,
            MENU_READ
        )
    );

    public static Set<SimpleGrantedAuthority> getAuthoritiesForRole(RoleType role) {
        return roleAuthorityMap.get(role).stream()
                .map(permission -> new SimpleGrantedAuthority(permission.getPermission()))
                .collect(Collectors.toSet());
    }
}

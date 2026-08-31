package com.project.mycanteen.entity.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PermissionType {
    ORDER_READ("order:read"),
    ORDER_WRITE("order:write"),
    MENU_READ("menu:read"),
    MENU_WRITE("menu:write"),
    USER_READ("user:read"),
    USER_WRITE("user:write");

    private final String permission;
}

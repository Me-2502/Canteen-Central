export type Role = "ADMIN" | "OWNER" | "CHEF" | "WAITER" | "CUSTOMER";

/** Mirrors PermissionType on the backend. */
export type Permission =
  | "order:read" | "order:write"
  | "menu:read" | "menu:write"
  | "canteen:read" | "canteen:write"
  | "profile:read" | "profile:write"
  | "user:read" | "user:write"
  | "rating:write";

export interface User {
  id: string;
  email: string;
  roles: Role[];
  permissions: Permission[];
}

export interface LoginRequest { mailid: string; password: string }

export interface LoginResponse {
  jwt: string;
  userId: string;
  roles: Role[];
  permissions: Permission[];
}

export interface SignupRequest {
  firstName: string;
  lastName?: string;
  mailid: string;
  password: string;
}

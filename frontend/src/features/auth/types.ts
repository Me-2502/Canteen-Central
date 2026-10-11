export type Role = "CUSTOMER" | "ADMIN" | "OWNER";

export interface User { id: number; username: string; email: string; role: Role }
export interface AuthResponse { token: string; user: User }

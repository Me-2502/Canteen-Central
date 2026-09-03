# MyCanteen

A Spring Boot-based canteen management application with user authentication, role-based access control, canteen management, menu management, order processing, and invitation workflows.

## What is implemented

### 1. Authentication and user management
- User signup and login flow
- JWT-based authentication support
- Spring Security configuration with role and permission-based access
- User profile read and update operations
- Basic user roles:
  - ADMIN
  - OWNER
  - CHEF
  - WAITER
  - CUSTOMER

### 2. Permission model
- Permissions are mapped from roles using a central role-permission mapping
- Example permissions include:
  - order:read
  - order:write
  - menu:read
  - menu:write
  - canteen:read
  - canteen:write
  - profile:read
  - profile:write
  - user:read
  - user:write
  - rating:write

### 3. Canteen management
- Search canteens with pagination
- View canteen details
- Create and update canteens
- Manage canteen items
- Add, edit, and delete menu items
- Access checks for owners/admins

### 4. Ordering workflow
- Place orders
- Support multiple canteen items in the same basket, which are split into separate orders per canteen
- View customer orders
- View canteen orders
- View hot orders (recent orders for the next 2 hours)
- View upcoming orders
- Update order status
- Rate completed orders

### 5. Invite system
- Invite users to a canteen by email or registered user
- Support additional invite data for external users who are not yet on the platform
- Accept or reject invites
- List invites for a canteen and for a user

### 6. API and project quality improvements
- Response DTO wrappers for consistent API responses
- Pagination support for search/list flows
- Centralized exception handling with a custom error model
- Validation on request bodies and params
- Simple aspect-based request logging for controller/service visibility

## Project structure

- `src/main/java/com/project/mycanteen/config` - configuration classes
- `src/main/java/com/project/mycanteen/controller` - REST controllers
- `src/main/java/com/project/mycanteen/dto` - request/response DTOs
- `src/main/java/com/project/mycanteen/entity` - JPA entities
- `src/main/java/com/project/mycanteen/entity/type` - enums for roles, permissions, statuses, and order types
- `src/main/java/com/project/mycanteen/error` - custom exceptions and API error handling
- `src/main/java/com/project/mycanteen/repository` - Spring Data repositories
- `src/main/java/com/project/mycanteen/security` - security and JWT configuration
- `src/main/java/com/project/mycanteen/service` - business logic services
- `src/main/java/com/project/mycanteen/aspect` - AOP logging support

## Database migration
- The main database schema definition is in `schema_v1.sql`
- It includes the base tables for users, canteens, members, items, orders, order items, and invites

## Notes
- This is a production-style base implementation focused on clear project structure, validation, security, and API consistency.
- The code is intentionally kept practical and straightforward rather than overly complex.
- The project is still in an early-to-mid stage and continues to evolve around the canteen business flow.

## Suggested next steps
- Add controller tests for key flows
- Add service-layer unit tests
- Add actual email sending for invites
- Add member management endpoints and admin actions
- Add checkout and payment logic
- Add improved filtering by city, item type, status, and date ranges

## Running the application

Use Maven:

```bash
./mvnw spring-boot:run
```

Or on Windows:

```bash
mvnw.cmd spring-boot:run
```

## Main endpoints

### Auth
- `POST /auth/signup`
- `POST /auth/login`

### Profile
- `GET /profile/{userId}`
- `PUT /profile/{userId}`

### Canteens
- `GET /canteens/search`
- `GET /canteens/{canteenId}`
- `POST /canteens`
- `PUT /canteens/{canteenId}`
- `GET /canteens/{canteenId}/items`
- `POST /canteens/{canteenId}/items`
- `PUT /canteens/{canteenId}/items/{itemId}`
- `DELETE /canteens/{canteenId}/items/{itemId}`

### Orders
- `POST /orders?customerId={customerId}`
- `GET /orders/customer/{customerId}`
- `GET /orders/canteen/{canteenId}`
- `GET /orders/canteen/{canteenId}/hot`
- `GET /orders/canteen/{canteenId}/upcoming`
- `GET /orders/{orderId}`
- `PUT /orders/{orderId}/status`
- `PUT /orders/{orderId}/rate`

### Invites
- `POST /invites/canteen/{canteenId}?inviterId={inviterId}`
- `GET /invites/canteen/{canteenId}`
- `GET /invites/user/{userId}`
- `PUT /invites/{inviteId}/accept?userId={userId}`
- `PUT /invites/{inviteId}/reject?userId={userId}`

## License
This project is intended for internal learning and development purposes.

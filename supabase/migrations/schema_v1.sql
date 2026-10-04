-- ============================================================
-- V1__create_canteen_schema.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
    id              UUID DEFAULT gen_random_uuid() NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100),
    email           VARCHAR(255) NOT NULL,
    phone_number    VARCHAR(20),
    password        VARCHAR(255) NOT NULL,
    address         VARCHAR(1000) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status          VARCHAR(30) DEFAULT 'ACTIVE' NOT NULL,
    wallet_balance  NUMERIC(12,2) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_users
        PRIMARY KEY (id),

    CONSTRAINT uq_users_email
        UNIQUE (email),

    CONSTRAINT ck_users_status
        CHECK (
            status IN (
                'ACTIVE',
                'INACTIVE',
                'BLOCKED'
            )
        ),

    CONSTRAINT ck_users_wallet_balance
        CHECK (wallet_balance >= 0)
);


-- ============================================================
-- USER_ROLES
-- ============================================================

CREATE TABLE user_roles (
    user_id     UUID NOT NULL,
    roles       VARCHAR(30) NOT NULL,

    CONSTRAINT pk_user_roles
        PRIMARY KEY (user_id, roles),

    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT ck_user_roles_role
        CHECK (
            roles IN (
                'ADMIN',
                'OWNER',
                'CHEF',
                'WAITER',
                'CUSTOMER'
            )
        )
);


-- ============================================================
-- CANTEENS
-- ============================================================

CREATE TABLE canteens (
    id                      UUID DEFAULT gen_random_uuid() NOT NULL,
    name                    VARCHAR(200) NOT NULL,
    owner_id                UUID NOT NULL,
    email                   VARCHAR(255),
    phone_number            VARCHAR(20),
    canteen_url             VARCHAR(500),
    created_by              UUID NOT NULL,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    address                 VARCHAR(1000) NOT NULL,
    img_url                 VARCHAR(500),
    status                  VARCHAR(30) DEFAULT 'ACTIVE' NOT NULL,
    start_time              TIMESTAMP,
    end_time                TIMESTAMP,
    -- Average rating, from 0.00 to 5.00
    rating                  NUMERIC(3,2) DEFAULT 0 NOT NULL,
    -- Number of ratings used to calculate the average
    rating_count            NUMERIC(10) DEFAULT 0 NOT NULL,
    -- JSON array containing allowed email domains/emails.
    -- Examples:
    -- ["company.com", "university.edu"]
    -- ["company.com", "john@gmail.com"]
    -- []
    allowed_order_domains   JSON,

    CONSTRAINT pk_canteens
        PRIMARY KEY (id),

    CONSTRAINT fk_canteens_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id),

    CONSTRAINT fk_canteens_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id),

    CONSTRAINT ck_canteens_status
        CHECK (
            status IN (
                'ACTIVE',
                'INACTIVE',
                'BLOCKED'
            )
        ),

    CONSTRAINT ck_canteens_rating
        CHECK (
            rating >= 0
            AND rating <= 5
        ),

    CONSTRAINT ck_canteens_rating_count
        CHECK (
            rating_count >= 0
        ),

    CONSTRAINT ck_canteens_time_range
        CHECK (
            end_time IS NULL
            OR start_time IS NULL
            OR end_time > start_time
        )
);


-- ============================================================
-- CANTEEN MEMBERS
-- ============================================================

CREATE TABLE canteen_members (
    id              UUID DEFAULT gen_random_uuid() NOT NULL,
    member_id       UUID NOT NULL,
    canteen_id      UUID NOT NULL,
    inviter_id      UUID NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status          VARCHAR(30) DEFAULT 'ACTIVE' NOT NULL,

    CONSTRAINT pk_canteen_members
        PRIMARY KEY (id),

    CONSTRAINT fk_canteen_members_user
        FOREIGN KEY (member_id)
        REFERENCES users(id),

    CONSTRAINT fk_canteen_members_canteen
        FOREIGN KEY (canteen_id)
        REFERENCES canteens(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_canteen_members_invited_by
        FOREIGN KEY (inviter_id)
        REFERENCES users(id),

    -- CONSTRAINT uq_canteen_members_user_canteen
    --     UNIQUE (member_id, canteen_id),

    CONSTRAINT ck_canteen_members_status
        CHECK (
            status IN (
                'INVITED',
                'ACTIVE',
                'INACTIVE',
                'REMOVED'
            )
        )
);


-- ============================================================
-- ITEMS
-- ============================================================

CREATE TABLE items (
    id              UUID DEFAULT gen_random_uuid() NOT NULL,
    name            VARCHAR(200) NOT NULL,
    description     VARCHAR(500) NOT NULL,
    canteen_id      UUID NOT NULL,
    type            VARCHAR(30) NOT NULL,
    measure         NUMERIC(7,2),
    img_url         VARCHAR(500),
    unit_price      NUMERIC(12,2) NOT NULL,
    discount        NUMERIC(12,2) DEFAULT 0 NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    -- Average rating, from 0.00 to 5.00
    rating                  NUMERIC(3,2) DEFAULT 0 NOT NULL,
    -- Number of ratings used to calculate the average
    rating_count            NUMERIC(10) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_items
        PRIMARY KEY (id),

    CONSTRAINT fk_items_canteen
        FOREIGN KEY (canteen_id)
        REFERENCES canteens(id)
        ON DELETE CASCADE,

    CONSTRAINT ck_items_type
        CHECK (
            type IN (
                'FOOD',
                'BEVERAGE',
                'SNACK',
                'COMBO',
                'OTHER'
            )
        ),

    CONSTRAINT ck_items_unit_price
        CHECK (
            unit_price >= 0
        ),

    CONSTRAINT ck_items_discount
        CHECK (
            discount >= 0
        ),

    CONSTRAINT ck_items_description_json
        CHECK (
            description::jsonb IS NOT NULL
        )
);


-- ============================================================
-- ORDERS
--
-- "orders" is used instead of "order" because ORDER is a
-- SQL keyword.
-- ============================================================

CREATE TABLE orders (
    id                    UUID DEFAULT gen_random_uuid() NOT NULL,
    customer_id           UUID NOT NULL,
    canteen_id            UUID NOT NULL,
    status                VARCHAR(30) DEFAULT 'PLACED' NOT NULL,
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    -- Nullable as requested
    receiver_name         VARCHAR(200),
    type                  VARCHAR(30) NOT NULL,
    selected_time_range   VARCHAR(100),

    CONSTRAINT pk_orders
        PRIMARY KEY (id),

    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id)
        REFERENCES users(id),

    CONSTRAINT fk_orders_canteen
        FOREIGN KEY (canteen_id)
        REFERENCES canteens(id),

    CONSTRAINT ck_orders_status
        CHECK (
            status IN (
                'PLACED',
                'CONFIRMED',
                'PREPARING',
                'READY',
                'COMPLETED',
                'CANCELLED'
            )
        ),

    CONSTRAINT ck_orders_type
        CHECK (
            type IN (
                'PICKUP',
                'DELIVERY',
                'DINE_IN'
            )
        )
);


-- ============================================================
-- ORDER ITEMS
--
-- Price and discount are stored here as snapshots so that
-- historical orders are not affected if the item's current
-- price/discount changes later.
-- ============================================================

CREATE TABLE order_items (
    id              UUID DEFAULT gen_random_uuid() NOT NULL,
    order_id        UUID NOT NULL,
    item_id         UUID NOT NULL,

    -- Chef responsible for preparing this item.
    -- Nullable because a chef may not be assigned immediately.
    chef_id         UUID,

    quantity        NUMERIC(10,2) DEFAULT 1 NOT NULL,
    unit_price      NUMERIC(12,2) NOT NULL,
    discount        NUMERIC(12,2) DEFAULT 0 NOT NULL,
    final_price     NUMERIC(12,2) NOT NULL,

    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT pk_order_items
        PRIMARY KEY (id),

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_items_item
        FOREIGN KEY (item_id)
        REFERENCES items(id),

    CONSTRAINT fk_order_items_chef
        FOREIGN KEY (chef_id)
        REFERENCES users(id),

    CONSTRAINT ck_order_items_quantity
        CHECK (
            quantity > 0
        ),

    CONSTRAINT ck_order_items_unit_price
        CHECK (
            unit_price >= 0
        ),

    CONSTRAINT ck_order_items_discount
        CHECK (
            discount >= 0
        ),

    CONSTRAINT ck_order_items_final_price
        CHECK (
            final_price >= 0
        )
);


-- ============================================================
-- INVITES
-- ============================================================

CREATE TABLE invites (
    id              UUID DEFAULT gen_random_uuid() NOT NULL,
    canteen_id      UUID NOT NULL,
    inviter_id      UUID NOT NULL,
    invited_id      UUID,
    mailid          VARCHAR(255),
    role            VARCHAR(20) DEFAULT 'WAITER' NOT NULL,
    status          VARCHAR(30) DEFAULT 'PENDING' NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT pk_invites
        PRIMARY KEY (id),

    CONSTRAINT fk_invites_canteen
        FOREIGN KEY (canteen_id)
        REFERENCES canteens(id),

    CONSTRAINT fk_invites_inviter
        FOREIGN KEY (inviter_id)
        REFERENCES users(id),

    CONSTRAINT fk_invites_invited
        FOREIGN KEY (invited_id)
        REFERENCES users(id),

    CONSTRAINT ck_invites_status
        CHECK (
            status IN (
                'PENDING',
                'ACCEPTED',
                'REJECTED',
                'CANCELLED'
            )
        ),

    CONSTRAINT ck_invites_role
        CHECK (
            role IN (
                'OWNER',
                'CHEF',
                'WAITER'
            )
        ),

    CONSTRAINT ck_invites_user_or_email
        CHECK (
            invited_id IS NOT NULL OR mailid IS NOT NULL
        )
);


-- ============================================================
-- INDEXES
-- ============================================================


-- ============================================================
-- USERS
-- ============================================================

CREATE INDEX idx_users_status
    ON users(status);


-- ============================================================
-- USER_ROLES
-- ============================================================

CREATE INDEX idx_user_roles_role
    ON user_roles(roles);


-- ============================================================
-- CANTEENS
-- ============================================================

CREATE INDEX idx_canteens_owner_id
    ON canteens(owner_id);

CREATE INDEX idx_canteens_created_by
    ON canteens(created_by);

CREATE INDEX idx_canteens_status
    ON canteens(status);


-- ============================================================
-- CANTEEN MEMBERS
-- ============================================================

CREATE INDEX idx_canteen_members_user
    ON canteen_members(member_id);

CREATE INDEX idx_canteen_members_canteen
    ON canteen_members(canteen_id);

CREATE INDEX idx_canteen_members_invited_by
    ON canteen_members(inviter_id);

CREATE INDEX idx_canteen_members_status
    ON canteen_members(status);


-- ============================================================
-- ITEMS
-- ============================================================

CREATE INDEX idx_items_canteen
    ON items(canteen_id);

CREATE INDEX idx_items_type
    ON items(type);

CREATE INDEX idx_items_canteen_type
    ON items(canteen_id, type);


-- ============================================================
-- ORDERS
-- ============================================================

CREATE INDEX idx_orders_customer
    ON orders(customer_id);

CREATE INDEX idx_orders_canteen
    ON orders(canteen_id);

CREATE INDEX idx_orders_status
    ON orders(status);

CREATE INDEX idx_orders_type
    ON orders(type);

CREATE INDEX idx_orders_canteen_created
    ON orders(canteen_id, created_at);

CREATE INDEX idx_orders_customer_created
    ON orders(customer_id, created_at);


-- ============================================================
-- ORDER ITEMS
-- ============================================================

CREATE INDEX idx_order_items_order
    ON order_items(order_id);

CREATE INDEX idx_order_items_item
    ON order_items(item_id);

CREATE INDEX idx_order_items_chef
    ON order_items(chef_id);


-- ============================================================
-- INVITES
-- ============================================================

CREATE INDEX idx_invites_canteen
    ON invites(canteen_id);

CREATE INDEX idx_invites_inviter
    ON invites(inviter_id);

CREATE INDEX idx_invites_invited
    ON invites(invited_id);

CREATE INDEX idx_invites_mailid
    ON invites(mailid);

CREATE INDEX idx_invites_status
    ON invites(status);
-- Campus Market Database Schema (PostgreSQL)
-- This file contains all tables and their relationships for the Campus Market application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(50),
    year_semester VARCHAR(20),
    bio TEXT,
    profile_photo_url VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    is_seller_verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    account_status VARCHAR(20) DEFAULT 'active', -- active, suspended, banned
    seller_rating DECIMAL(3,2) DEFAULT 0.00,
    buyer_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_status ON users(account_status);

-- ============================================
-- 2. CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. ITEMS TABLE
-- ============================================
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id),
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    listing_type VARCHAR(20) DEFAULT 'sell', -- sell, rent
    is_negotiable BOOLEAN DEFAULT FALSE,
    condition_rating VARCHAR(20) NOT NULL, -- new, like_new, good, fair, poor
    stock_quantity INTEGER DEFAULT 1,
    location VARCHAR(100),
    hostel_room VARCHAR(50),
    delivery_options TEXT[], -- self-pickup, campus-courier, external-delivery
    expected_delivery_days INTEGER,
    images TEXT[], -- Array of image URLs
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    interested_buyers INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    marked_sold_at TIMESTAMP
);

-- Indexes for items table
CREATE INDEX idx_items_seller ON items(seller_id);
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_price ON items(price);
CREATE INDEX idx_items_status ON items(is_active);
CREATE INDEX idx_items_created ON items(created_at);

-- ============================================
-- 4. ORDERS TABLE
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'pending', -- pending, confirmed, shipped, out_for_delivery, delivered, cancelled, returned
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
    delivery_method VARCHAR(50),
    delivery_address TEXT,
    delivery_tracking_id VARCHAR(100),
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    is_return_requested BOOLEAN DEFAULT FALSE,
    return_reason TEXT,
    return_status VARCHAR(20), -- requested, approved, rejected, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for orders table
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_item ON orders(item_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);

-- ============================================
-- 5. MESSAGES TABLE
-- ============================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    attachments TEXT[], -- Array of file URLs
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for messages table
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_item ON messages(item_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- ============================================
-- 6. REVIEWS TABLE
-- ============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
    comment TEXT NOT NULL,
    photos TEXT[], -- Array of photo URLs
    helpful_count INTEGER DEFAULT 0,
    seller_response TEXT,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, item_id, order_id)
);

-- Indexes for reviews table
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_item ON reviews(item_id);
CREATE INDEX idx_reviews_order ON reviews(order_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created ON reviews(created_at);

-- ============================================
-- 7. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- message, order, payment, delivery, report, promotion
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    data JSONB, -- Additional data like order_id, product_id, etc.
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for notifications table
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ============================================
-- 8. REPORTS TABLE
-- ============================================
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reported_item_id UUID REFERENCES items(id) ON DELETE SET NULL,
    reported_review_id UUID REFERENCES reviews(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL, -- product_violation, user_violation, review_violation, payment_dispute
    subcategory VARCHAR(50),
    description TEXT NOT NULL,
    evidence TEXT[], -- Array of evidence file URLs
    is_anonymous BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
    status VARCHAR(30) DEFAULT 'pending', -- pending, under_review, resolved, rejected, closed
    admin_notes TEXT,
    action_taken VARCHAR(50), -- warning, suspension, ban, content_removal
    appeal_status VARCHAR(20), -- none, requested, approved, rejected
    appeal_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Indexes for reports table
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_reported_user ON reports(reported_id);
CREATE INDEX idx_reports_reported_item ON reports(reported_item_id);
CREATE INDEX idx_reports_category ON reports(category);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created ON reports(created_at);

-- ============================================
-- 9. TRANSACTIONS TABLE
-- ============================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    type VARCHAR(30) NOT NULL, -- purchase, sale, refund, payout, wallet_topup, wallet_transfer
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100) UNIQUE, -- External payment gateway ID
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, cancelled
    description TEXT,
    metadata JSONB, -- Additional transaction details
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Indexes for transactions table
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_order ON transactions(order_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at);



-- ============================================
-- 10. DELIVERY TABLE
-- ============================================
CREATE TABLE delivery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    method VARCHAR(50) NOT NULL, -- self_pickup, campus_courier, external_delivery, locker
    status VARCHAR(30) DEFAULT 'pending', -- pending, scheduled, in_transit, delivered, cancelled
    pickup_location VARCHAR(255),
    pickup_date TIMESTAMP,
    pickup_time VARCHAR(50),
    delivery_partner VARCHAR(100),
    tracking_number VARCHAR(100),
    tracking_url VARCHAR(255),
    estimated_delivery TIMESTAMP,
    actual_delivery TIMESTAMP,
    delivery_photo_url VARCHAR(255),
    digital_signature_url VARCHAR(255),
    buyer_confirmed BOOLEAN DEFAULT FALSE,
    buyer_confirmed_at TIMESTAMP,
    meetup_rating INTEGER CHECK (meetup_rating >= 1 AND meetup_rating <= 5),
    meetup_feedback TEXT,
    emergency_contact VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for delivery table
CREATE INDEX idx_delivery_order ON delivery(order_id);
CREATE INDEX idx_delivery_status ON delivery(status);
CREATE INDEX idx_delivery_method ON delivery(method);

-- ============================================
-- 11. WISHLIST TABLE
-- ============================================
CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    price_alert DECIMAL(10,2), -- Alert when price drops below this
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, item_id)
);

-- Indexes for wishlist table
CREATE INDEX idx_wishlist_user ON wishlist(user_id);
CREATE INDEX idx_wishlist_item ON wishlist(item_id);

-- ============================================
-- 12. SESSIONS TABLE (for authentication)
-- ============================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    device_info TEXT,
    ip_address VARCHAR(50),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for sessions table
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- ============================================
-- 13 OTPS TABLE (for email verification)
-- ============================================
CREATE TABLE otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(100) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otps_email ON otps(email);

-- ============================================
-- 14. AUDIT LOG TABLE (for admin actions)
-- ============================================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50), -- user, product, report, order
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    reason TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for audit_log table
CREATE INDEX idx_audit_admin ON audit_log(admin_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_updated_at BEFORE UPDATE ON delivery
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View for item listings with seller info
CREATE VIEW item_listings_view AS
SELECT 
    i.id, i.name, i.description, i.price, i.listing_type, i.is_negotiable, 
    i.condition_rating, i.images, i.view_count, i.interested_buyers,
    i.average_rating, i.total_reviews, i.created_at,
    c.name as category_name,
    u.full_name as seller_name, u.seller_rating, u.is_seller_verified,
    i.location
FROM items i
JOIN categories c ON i.category_id = c.id
JOIN users u ON i.seller_id = u.id
WHERE i.is_active = true;

-- View for user order history
CREATE VIEW user_orders_view AS
SELECT 
    o.id, o.total_price, o.status, o.payment_status, o.created_at,
    i.name as item_name, i.images as item_images,
    u_seller.full_name as seller_name, u_seller.phone as seller_phone,
    d.method as delivery_method, d.status as delivery_status
FROM orders o
JOIN items i ON o.item_id = i.id
JOIN users u_seller ON o.seller_id = u_seller.id
LEFT JOIN delivery d ON o.id = d.order_id
WHERE o.buyer_id = u_seller.id OR o.seller_id = u_seller.id;

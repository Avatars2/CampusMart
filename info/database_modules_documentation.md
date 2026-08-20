# Campus Market Database Modules Documentation

## Overview
This document provides a comprehensive overview of all database modules, their relationships, and purposes for the Campus Market application.

---

## Database Modules (14 Tables)

### 1. USERS TABLE
**Purpose**: Store all user account information and authentication data

**Key Fields**:
- `id` (UUID) - Primary key
- `full_name` - User's complete name
- `email` - Unique email address (college email)
- `password` - Encrypted password hash
- `phone` - Mobile number for verification
- `student_id` - Unique college student ID
- `department` - Academic department
- `year_semester` - Current academic year/semester
- `bio` - User profile description
- `profile_photo_url` - Profile picture URL
- `is_verified` - Email verification status
- `is_seller_verified` - Seller verification badge
- `seller_rating` - Average seller rating (0-5)
- `buyer_rating` - Average buyer rating (0-5)
- `account_status` - Account status (active, suspended, banned)
- `email_verified` - Email verification status
- `phone_verified` - Phone verification status
- `total_reviews` - Total number of reviews
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp
- `last_login` - Last login timestamp

**Relationships**:
- One-to-many with Items (seller)
- One-to-many with Orders (buyer and seller)
- One-to-many with Messages (sender and receiver)
- One-to-many with Reviews
- One-to-many with Notifications
- One-to-many with Reports (reporter)
- One-to-many with Sessions
- One-to-many with Wishlist

---

### 2. CATEGORIES TABLE
**Purpose**: Define item categories for organization

**Key Fields**:
- `id` (UUID) - Primary key
- `name` - Category name (Books, Electronics, etc.)
- `description` - Category description
- `icon_url` - Category icon URL
- `is_active` - Active status for category
- `created_at` - Record creation timestamp

**Relationships**:
- One-to-many with Items

---

### 3. ITEMS TABLE
**Purpose**: Store all item listings and their details

**Key Fields**:
- `id` (UUID) - Primary key
- `seller_id` - Reference to seller (Users table)
- `category_id` - Reference to category
- `name` - Item name
- `description` - Detailed item description
- `price` - Item price
- `is_negotiable` - Price negotiation allowed
- `condition_rating` - Item condition (new, like_new, good, fair, poor)
- `stock_quantity` - Available quantity
- `location` - Item location on campus
- `hostel_room` - Specific room location
- `delivery_options` - Available delivery methods
- `images` - Array of item image URLs
- `is_active` - Listing active status
- `is_featured` - Featured item status
- `view_count` - Number of views
- `interested_buyers` - Number of interested buyers
- `average_rating` - Average review rating
- `expected_delivery_days` - Expected delivery time in days
- `total_reviews` - Total number of reviews received
- `created_at` - Listing creation timestamp
- `updated_at` - Last update timestamp
- `marked_sold_at` - Timestamp when marked as sold

**Relationships**:
- Many-to-one with Users (seller)
- Many-to-one with Categories
- One-to-many with Orders
- One-to-many with Reviews
- One-to-many with Messages
- One-to-many with Reports
- One-to-many with Wishlist

---

### 4. ORDERS TABLE
**Purpose**: Track all purchase orders and their status

**Key Fields**:
- `id` (UUID) - Primary key
- `buyer_id` - Reference to buyer (Users table)
- `seller_id` - Reference to seller (Users table)
- `item_id` - Reference to item
- `quantity` - Order quantity
- `total_price` - Total order amount
- `status` - Order status (pending, confirmed, shipped, out_for_delivery, delivered, cancelled, returned)
- `payment_method` - Payment method used
- `payment_status` - Payment status (pending, completed, failed, refunded)
- `delivery_method` - Delivery method
- `delivery_address` - Delivery address
- `delivery_tracking_id` - Tracking number
- `estimated_delivery_date` - Expected delivery date
- `actual_delivery_date` - Actual delivery date
- `is_return_requested` - Return request status
- `return_reason` - Reason for return
- `return_status` - Return processing status
- `created_at` - Order creation timestamp
- `updated_at` - Last update timestamp

**Relationships**:
- Many-to-one with Users (buyer)
- Many-to-one with Users (seller)
- Many-to-one with Items
- One-to-one with Delivery
- One-to-many with Reviews
- One-to-many with Transactions
- One-to-many with Reports

---

### 5. MESSAGES TABLE
**Purpose**: Store real-time chat messages between users

**Key Fields**:
- `id` (UUID) - Primary key
- `sender_id` - Message sender (Users table)
- `receiver_id` - Message receiver (Users table)
- `item_id` - Related item (optional)
- `content` - Message content
- `attachments` - Array of attachment URLs
- `is_read` - Read status
- `read_at` - Read timestamp
- `created_at` - Message sent timestamp

**Relationships**:
- Many-to-one with Users (sender)
- Many-to-one with Users (receiver)
- Many-to-one with Items

---

### 6. REVIEWS TABLE
**Purpose**: Store item reviews and ratings

**Key Fields**:
- `id` (UUID) - Primary key
- `user_id` - Reviewer (Users table)
- `item_id` - Reviewed item
- `order_id` - Related order
- `rating` - Overall rating (1-5)
- `quality_rating` - Quality rating (1-5)
- `accuracy_rating` - Accuracy rating (1-5)
- `communication_rating` - Communication rating (1-5)
- `delivery_rating` - Delivery rating (1-5)
- `comment` - Review text
- `photos` - Array of review photo URLs
- `helpful_count` - Number of helpful votes
- `seller_response` - Seller's response to review
- `is_edited` - Edit status
- `edited_at` - Edit timestamp
- `created_at` - Review creation timestamp
- `updated_at` - Last update timestamp

**Relationships**:
- Many-to-one with Users
- Many-to-one with Items
- Many-to-one with Orders
- One-to-many with Reports

---

### 7. NOTIFICATIONS TABLE
**Purpose**: Store user notifications and alerts

**Key Fields**:
- `id` (UUID) - Primary key
- `user_id` - Notification recipient (Users table)
- `type` - Notification type (message, order, payment, delivery, report, promotion)
- `title` - Notification title
- `content` - Notification content
- `data` - JSON data with additional info
- `is_read` - Read status
- `read_at` - Read timestamp
- `created_at` - Notification creation timestamp

**Relationships**:
- Many-to-one with Users

---

### 8. REPORTS TABLE
**Purpose**: Store user reports for moderation

**Key Fields**:
- `id` (UUID) - Primary key
- `reporter_id` - User who filed report (Users table)
- `reported_id` - Reported user (Users table)
- `reported_item_id` - Reported item
- `reported_review_id` - Reported review
- `category` - Report category (product_violation, user_violation, review_violation, payment_dispute)
- `subcategory` - Specific violation type
- `description` - Report description
- `evidence` - Array of evidence file URLs
- `is_anonymous` - Anonymous report status
- `priority` - Report priority (low, medium, high)
- `status` - Report status (pending, under_review, resolved, rejected, closed)
- `admin_notes` - Admin notes on report
- `action_taken` - Action taken (warning, suspension, ban, content_removal)
- `appeal_status` - Appeal status
- `appeal_reason` - Reason for appeal
- `created_at` - Report creation timestamp
- `updated_at` - Last update timestamp
- `resolved_at` - Report resolution timestamp

**Relationships**:
- Many-to-one with Users (reporter)
- Many-to-one with Users (reported)
- Many-to-one with Items
- Many-to-one with Reviews

---

### 9. TRANSACTIONS TABLE
**Purpose**: Track all financial transactions

**Key Fields**:
- `id` (UUID) - Primary key
- `user_id` - Transaction user (Users table)
- `order_id` - Related order
- `type` - Transaction type (purchase, sale, refund, payout)
- `amount` - Transaction amount
- `payment_method` - Payment method used
- `transaction_id` - External payment gateway ID
- `status` - Transaction status (pending, completed, failed, cancelled)
- `description` - Transaction description
- `metadata` - Additional transaction details (JSON)
- `created_at` - Transaction creation timestamp
- `completed_at` - Transaction completion timestamp

**Relationships**:
- Many-to-one with Users
- Many-to-one with Orders

---

### 11. DELIVERY TABLE
**Purpose**: Track delivery information and status

**Key Fields**:
- `id` (UUID) - Primary key
- `order_id` - Related order
- `method` - Delivery method (self_pickup, campus_courier, external_delivery, locker)
- `status` - Delivery status (pending, scheduled, in_transit, delivered, cancelled)
- `pickup_location` - Pickup location
- `pickup_date` - Scheduled pickup date
- `pickup_time` - Scheduled pickup time
- `delivery_partner` - Delivery service provider
- `tracking_number` - Tracking number
- `tracking_url` - Tracking URL
- `estimated_delivery` - Estimated delivery time
- `actual_delivery` - Actual delivery time
- `delivery_photo_url` - Delivery confirmation photo
- `digital_signature_url` - Digital signature URL
- `buyer_confirmed` - Buyer confirmation status
- `meetup_rating` - Meetup rating (1-5)
- `meetup_feedback` - Meetup feedback text
- `emergency_contact` - Emergency contact number
- `buyer_confirmed_at` - Timestamp of buyer confirmation
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

**Relationships**:
- One-to-one with Orders

---

### 12. WISHLIST TABLE
**Purpose**: Store user wishlist/favorite items

**Key Fields**:
- `id` (UUID) - Primary key
- `user_id` - Wishlist owner (Users table)
- `item_id` - Wishlisted item
- `price_alert` - Price drop alert threshold
- `created_at` - Wishlist entry creation timestamp

**Relationships**:
- Many-to-one with Users
- Many-to-one with Items

---

### 13. SESSIONS TABLE
**Purpose**: Manage user authentication sessions

**Key Fields**:
- `id` (UUID) - Primary key
- `user_id` - Session owner (Users table)
- `token` - Authentication token
- `device_info` - Device information
- `ip_address` - IP address
- `expires_at` - Session expiration time
- `is_active` - Session active status
- `created_at` - Session creation timestamp

**Relationships**:
- Many-to-one with Users

---

### 14. AUDIT_LOG TABLE
**Purpose**: Track admin actions for security and compliance

**Key Fields**:
- `id` (UUID) - Primary key
- `admin_id` - Admin who performed action (Users table)
- `action` - Action performed
- `entity_type` - Type of entity affected (user, product, report, order)
- `entity_id` - ID of affected entity
- `old_values` - Previous values (JSON)
- `new_values` - New values (JSON)
- `reason` - Reason for action
- `ip_address` - Admin IP address
- `created_at` - Log creation timestamp

**Relationships**:
- Many-to-one with Users (admin)

---

## Database Relationships Summary

### User-Centric Relationships
- **Users → Items**: One seller can list multiple items
- **Users → Orders**: One user can be buyer in multiple orders, seller in multiple orders
- **Users → Messages**: One user can send/receive multiple messages
- **Users → Reviews**: One user can write multiple reviews
- **Users → Wishlist**: One user can have multiple wishlisted items

### Item-Centric Relationships
- **Items → Orders**: One item can be ordered multiple times
- **Items → Reviews**: One item can have multiple reviews
- **Items → Messages**: One item can be discussed in multiple message threads
- **Items → Wishlist**: One item can be in multiple users' wishlists

### Order-Centric Relationships
- **Orders → Delivery**: One order has one delivery record
- **Orders → Reviews**: One order can generate one review
- **Orders → Transactions**: One order can have multiple transactions

### Transaction Flow
1. User purchases item → Transaction (purchase) + Order creation
2. Seller receives payment → Transaction (sale)
3. Refund processed → Transaction (refund)
4. Seller payout → Transaction (payout)

---

## Key Features Implementation

### Authentication & Security
- **Users table**: Stores credentials and verification status
- **Sessions table**: Manages active sessions and tokens
- **Audit_log table**: Tracks all admin actions

### E-commerce Functionality
- **Items table**: Item listings with all details
- **Orders table**: Order management and status tracking
- **Transactions table**: Financial transaction tracking

### Communication
- **Messages table**: Real-time messaging between users
- **Notifications table**: Push notification management

### Reviews & Ratings
- **Reviews table**: Detailed item reviews with multiple rating categories
- **Items table**: Stores average ratings and review counts
- **Users table**: Stores seller and buyer ratings

### Moderation & Reporting
- **Reports table**: Comprehensive reporting system
- **Audit_log table**: Admin action tracking

### Delivery Management
- **Delivery table**: Complete delivery tracking with meetup coordination

---

## Performance Optimization

### Indexes Created
All tables have appropriate indexes on:
- Primary keys (UUID)
- Foreign keys
- Frequently queried fields (status, created_at, email, etc.)
- Composite indexes for common query patterns

### Views Created
- **item_listings_view**: Optimized item listing queries with seller info
- **user_orders_view**: Optimized order history queries

### Triggers
- **update_updated_at_column**: Automatically updates timestamp fields on record modification

---

## Data Integrity

### Constraints
- **UNIQUE constraints**: Email, student_id, phone numbers
- **CHECK constraints**: Rating ranges (1-5), status values
- **FOREIGN KEY constraints**: Referential integrity with CASCADE/SET NULL options
- **NOT NULL constraints**: Required fields

### Default Values
- Timestamps default to CURRENT_TIMESTAMP
- Boolean fields default to FALSE or TRUE as appropriate
- Numeric fields default to 0

---

## Security Considerations

### Password Storage
- Passwords stored as bcrypt hashes in Users table

### Sensitive Data
- Phone numbers, emails stored in encrypted format recommended
- Financial data protected with proper access controls

### Audit Trail
- All admin actions logged in audit_log table
- IP addresses tracked for security monitoring

---

## Scalability Considerations

### UUID Primary Keys
- Using UUIDs for distributed system compatibility
- Better for mobile app synchronization

### JSONB Fields
- Flexible data storage for metadata, notifications, etc.
- Enables schema evolution without migrations

### Array Fields
- Efficient storage for images, attachments, evidence files
- PostgreSQL native array support

---

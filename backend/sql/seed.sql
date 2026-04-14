-- =========================
-- USERS
-- =========================
INSERT INTO users (first_name, middle_name, last_name, user_role, passcode_hash)
VALUES
('Maria', NULL, 'Lopez', 'admin', '$2b$10$adminhash'),
('Jose', NULL, 'Martinez', 'manager', '$2b$10$managerhash'),
('Ana', NULL, 'Garcia', 'server', '$2b$10$serverhash1'),
('Luis', NULL, 'Hernandez', 'server', '$2b$10$serverhash2'),
('Sofia', NULL, 'Ramirez', 'cashier', '$2b$10$cashierhash'),
('Carlos', NULL, 'Torres', 'kitchen', '$2b$10$kitchenhash1'),
('Elena', NULL, 'Flores', 'kitchen', '$2b$10$kitchenhash2'),
('Miguel', NULL, 'Vasquez', 'host', '$2b$10$hosthash');

-- =========================
-- CATEGORIES
-- =========================
INSERT INTO categories (name)
VALUES
('Appetizers'),
('Tacos'),
('Burritos'),
('Quesadillas'),
('Enchiladas'),
('Fajitas'),
('Combination Plates'),
('Soups & Salads'),
('Sides'),
('Desserts'),
('Drinks'),
('Kids Meals');

-- =========================
-- TABLES
-- =========================
INSERT INTO tables (table_number, capacity, current_status)
VALUES
(1, 2, 'available'),
(2, 2, 'occupied'),
(3, 4, 'available'),
(4, 4, 'reserved'),
(5, 4, 'dirty'),
(6, 6, 'occupied'),
(7, 6, 'available'),
(8, 8, 'available'),
(9, 8, 'out_of_service'),
(10, 2, 'available'),
(11, 4, 'occupied'),
(12, 6, 'available');

-- =========================
-- ITEMS
-- =========================
INSERT INTO items (name, description, price_in_cents, category_id, is_active)
VALUES
-- Appetizers
('Chips and Salsa', 'Fresh tortilla chips served with house salsa.', 499, (SELECT id FROM categories WHERE name = 'Appetizers'), TRUE),
('Queso Dip', 'Warm melted cheese dip served with tortilla chips.', 699, (SELECT id FROM categories WHERE name = 'Appetizers'), TRUE),
('Guacamole', 'Fresh guacamole made with avocado, lime, cilantro, and onion.', 799, (SELECT id FROM categories WHERE name = 'Appetizers'), TRUE),
('Nachos Supreme', 'Loaded nachos with beans, cheese, jalapenos, pico de gallo, sour cream, and guacamole.', 1199, (SELECT id FROM categories WHERE name = 'Appetizers'), TRUE),

-- Tacos
('Street Tacos - Carnitas', 'Three corn tortilla tacos with slow-cooked pork, onion, and cilantro.', 1199, (SELECT id FROM categories WHERE name = 'Tacos'), TRUE),
('Street Tacos - Asada', 'Three corn tortilla tacos with grilled steak, onion, and cilantro.', 1299, (SELECT id FROM categories WHERE name = 'Tacos'), TRUE),
('Street Tacos - Chicken', 'Three corn tortilla tacos with grilled chicken, onion, and cilantro.', 1199, (SELECT id FROM categories WHERE name = 'Tacos'), TRUE),
('Baja Fish Tacos', 'Two crispy fish tacos with slaw and chipotle crema.', 1399, (SELECT id FROM categories WHERE name = 'Tacos'), TRUE),

-- Burritos
('Bean and Cheese Burrito', 'Flour tortilla filled with refried beans and cheese.', 899, (SELECT id FROM categories WHERE name = 'Burritos'), TRUE),
('Chicken Burrito', 'Large burrito with grilled chicken, rice, beans, cheese, and pico de gallo.', 1299, (SELECT id FROM categories WHERE name = 'Burritos'), TRUE),
('Carne Asada Burrito', 'Large burrito with grilled steak, rice, beans, cheese, and salsa verde.', 1399, (SELECT id FROM categories WHERE name = 'Burritos'), TRUE),
('California Burrito', 'Carne asada burrito with fries, cheese, sour cream, and guacamole.', 1499, (SELECT id FROM categories WHERE name = 'Burritos'), TRUE),

-- Quesadillas
('Cheese Quesadilla', 'Flour tortilla grilled with melted cheese.', 899, (SELECT id FROM categories WHERE name = 'Quesadillas'), TRUE),
('Chicken Quesadilla', 'Flour tortilla grilled with chicken and melted cheese.', 1099, (SELECT id FROM categories WHERE name = 'Quesadillas'), TRUE),
('Steak Quesadilla', 'Flour tortilla grilled with steak and melted cheese.', 1199, (SELECT id FROM categories WHERE name = 'Quesadillas'), TRUE),

-- Enchiladas
('Cheese Enchiladas', 'Three enchiladas topped with red sauce and melted cheese.', 1199, (SELECT id FROM categories WHERE name = 'Enchiladas'), TRUE),
('Chicken Enchiladas Verdes', 'Three enchiladas with chicken and salsa verde.', 1299, (SELECT id FROM categories WHERE name = 'Enchiladas'), TRUE),
('Beef Enchiladas', 'Three enchiladas with seasoned beef and red sauce.', 1299, (SELECT id FROM categories WHERE name = 'Enchiladas'), TRUE),

-- Fajitas
('Chicken Fajitas', 'Sizzling chicken fajitas served with rice, beans, tortillas, and garnishes.', 1699, (SELECT id FROM categories WHERE name = 'Fajitas'), TRUE),
('Steak Fajitas', 'Sizzling steak fajitas served with rice, beans, tortillas, and garnishes.', 1899, (SELECT id FROM categories WHERE name = 'Fajitas'), TRUE),
('Mixed Fajitas', 'Chicken and steak fajitas served with rice, beans, tortillas, and garnishes.', 1999, (SELECT id FROM categories WHERE name = 'Fajitas'), TRUE),

-- Combination Plates
('Combo #1', 'One taco, one enchilada, and rice and beans.', 1299, (SELECT id FROM categories WHERE name = 'Combination Plates'), TRUE),
('Combo #2', 'One burrito, one taco, and rice and beans.', 1399, (SELECT id FROM categories WHERE name = 'Combination Plates'), TRUE),
('Combo #3', 'One tamale, one enchilada, and rice and beans.', 1399, (SELECT id FROM categories WHERE name = 'Combination Plates'), TRUE),

-- Soups & Salads
('Tortilla Soup', 'Chicken tortilla soup with avocado and crispy tortilla strips.', 999, (SELECT id FROM categories WHERE name = 'Soups & Salads'), TRUE),
('Taco Salad', 'Crispy tortilla bowl filled with lettuce, beans, cheese, pico, and choice of meat.', 1199, (SELECT id FROM categories WHERE name = 'Soups & Salads'), TRUE),

-- Sides
('Mexican Rice', 'Side of seasoned Mexican rice.', 299, (SELECT id FROM categories WHERE name = 'Sides'), TRUE),
('Refried Beans', 'Side of refried beans.', 299, (SELECT id FROM categories WHERE name = 'Sides'), TRUE),
('Black Beans', 'Side of black beans.', 299, (SELECT id FROM categories WHERE name = 'Sides'), TRUE),
('French Fries', 'Crispy seasoned fries.', 399, (SELECT id FROM categories WHERE name = 'Sides'), TRUE),
('Side Tortillas', 'Three warm flour or corn tortillas.', 199, (SELECT id FROM categories WHERE name = 'Sides'), TRUE),

-- Desserts
('Churros', 'Cinnamon sugar churros served warm.', 599, (SELECT id FROM categories WHERE name = 'Desserts'), TRUE),
('Flan', 'Traditional caramel custard.', 499, (SELECT id FROM categories WHERE name = 'Desserts'), TRUE),
('Sopapillas', 'Fried pastry served with honey and cinnamon sugar.', 599, (SELECT id FROM categories WHERE name = 'Desserts'), TRUE),

-- Drinks
('Mexican Coke', 'Glass bottle Coca-Cola.', 349, (SELECT id FROM categories WHERE name = 'Drinks'), TRUE),
('Horchata', 'Traditional sweet rice drink.', 399, (SELECT id FROM categories WHERE name = 'Drinks'), TRUE),
('Jamaica', 'Hibiscus agua fresca.', 399, (SELECT id FROM categories WHERE name = 'Drinks'), TRUE),
('Lemonade', 'Fresh lemonade.', 349, (SELECT id FROM categories WHERE name = 'Drinks'), TRUE),
('Iced Tea', 'Fresh brewed iced tea.', 299, (SELECT id FROM categories WHERE name = 'Drinks'), TRUE),

-- Kids Meals
('Kids Cheese Quesadilla', 'Cheese quesadilla served with rice.', 699, (SELECT id FROM categories WHERE name = 'Kids Meals'), TRUE),
('Kids Taco Plate', 'One taco served with rice and beans.', 699, (SELECT id FROM categories WHERE name = 'Kids Meals'), TRUE);

-- =========================
-- MODIFIERS
-- =========================
INSERT INTO modifiers (name, price_in_cents)
VALUES
('No Onions', 0),
('No Cilantro', 0),
('No Cheese', 0),
('No Sour Cream', 0),
('Extra Cheese', 150),
('Extra Meat', 300),
('Extra Salsa', 50),
('Extra Guacamole', 250),
('Add Avocado', 200),
('Add Jalapenos', 75),
('Corn Tortillas', 0),
('Flour Tortillas', 0),
('Mild Salsa', 0),
('Hot Salsa', 0),
('Beans Instead of Rice', 0),
('Rice Instead of Beans', 0),
('Steak Instead of Chicken', 200),
('Chicken Instead of Beef', 0);

-- =========================
-- ORDERS
-- =========================
INSERT INTO orders (table_id, server_id, order_type, order_status, ticket_name, guest_count, opened_at, closed_at)
VALUES
-- dine in open
((SELECT id FROM tables WHERE table_number = 2),
 (SELECT id FROM users WHERE first_name = 'Ana' AND last_name = 'Garcia'),
 'dine_in',
 'open',
 'Lopez Party',
 2,
 NOW() - INTERVAL '20 minutes',
 NULL),

-- dine in submitted
((SELECT id FROM tables WHERE table_number = 6),
 (SELECT id FROM users WHERE first_name = 'Luis' AND last_name = 'Hernandez'),
 'dine_in',
 'submitted',
 'Table 6 Check 1',
 5,
 NOW() - INTERVAL '45 minutes',
 NULL),

-- dine in paid
((SELECT id FROM tables WHERE table_number = 11),
 (SELECT id FROM users WHERE first_name = 'Ana' AND last_name = 'Garcia'),
 'dine_in',
 'paid',
 'Birthday Table',
 4,
 NOW() - INTERVAL '2 hours',
 NOW() - INTERVAL '40 minutes'),

-- takeout submitted
(NULL,
 (SELECT id FROM users WHERE first_name = 'Sofia' AND last_name = 'Ramirez'),
 'takeout',
 'submitted',
 'Takeout - Ramirez',
 1,
 NOW() - INTERVAL '15 minutes',
 NULL),

-- delivery submitted
(NULL,
 (SELECT id FROM users WHERE first_name = 'Sofia' AND last_name = 'Ramirez'),
 'delivery',
 'submitted',
 'Delivery - DoorDash #1042',
 2,
 NOW() - INTERVAL '30 minutes',
 NULL),

-- takeout paid
(NULL,
 (SELECT id FROM users WHERE first_name = 'Sofia' AND last_name = 'Ramirez'),
 'takeout',
 'paid',
 'Takeout - Gomez',
 1,
 NOW() - INTERVAL '90 minutes',
 NOW() - INTERVAL '30 minutes'),

-- dine in cancelled
((SELECT id FROM tables WHERE table_number = 4),
 (SELECT id FROM users WHERE first_name = 'Luis' AND last_name = 'Hernandez'),
 'dine_in',
 'cancelled',
 'Reserved Walkout',
 3,
 NOW() - INTERVAL '70 minutes',
 NOW() - INTERVAL '60 minutes');

-- =========================
-- ORDER ITEMS
-- =========================
INSERT INTO order_items (order_id, item_id, quantity, unit_price_in_cents, notes, order_item_status)
VALUES
-- Lopez Party (open)
((SELECT id FROM orders WHERE ticket_name = 'Lopez Party'),
 (SELECT id FROM items WHERE name = 'Chips and Salsa'),
 1,
 499,
 NULL,
 'pending'),

((SELECT id FROM orders WHERE ticket_name = 'Lopez Party'),
 (SELECT id FROM items WHERE name = 'Chicken Quesadilla'),
 1,
 1099,
 'Cut into 4 pieces',
 'pending'),

((SELECT id FROM orders WHERE ticket_name = 'Lopez Party'),
 (SELECT id FROM items WHERE name = 'Horchata'),
 2,
 399,
 'No ice',
 'pending'),

-- Table 6 Check 1 (submitted)
((SELECT id FROM orders WHERE ticket_name = 'Table 6 Check 1'),
 (SELECT id FROM items WHERE name = 'Nachos Supreme'),
 1,
 1199,
 'Extra jalapenos',
 'ready'),

((SELECT id FROM orders WHERE ticket_name = 'Table 6 Check 1'),
 (SELECT id FROM items WHERE name = 'Street Tacos - Asada'),
 2,
 1299,
 NULL,
 'served'),

((SELECT id FROM orders WHERE ticket_name = 'Table 6 Check 1'),
 (SELECT id FROM items WHERE name = 'Chicken Fajitas'),
 1,
 1699,
 NULL,
 'submitted'),

((SELECT id FROM orders WHERE ticket_name = 'Table 6 Check 1'),
 (SELECT id FROM items WHERE name = 'Mexican Coke'),
 3,
 349,
 NULL,
 'served'),

-- Birthday Table (paid)
((SELECT id FROM orders WHERE ticket_name = 'Birthday Table'),
 (SELECT id FROM items WHERE name = 'Guacamole'),
 1,
 799,
 NULL,
 'served'),

((SELECT id FROM orders WHERE ticket_name = 'Birthday Table'),
 (SELECT id FROM items WHERE name = 'Mixed Fajitas'),
 2,
 1999,
 NULL,
 'served'),

((SELECT id FROM orders WHERE ticket_name = 'Birthday Table'),
 (SELECT id FROM items WHERE name = 'Kids Taco Plate'),
 1,
 699,
 NULL,
 'served'),

((SELECT id FROM orders WHERE ticket_name = 'Birthday Table'),
 (SELECT id FROM items WHERE name = 'Churros'),
 2,
 599,
 'Birthday dessert',
 'served'),

((SELECT id FROM orders WHERE ticket_name = 'Birthday Table'),
 (SELECT id FROM items WHERE name = 'Lemonade'),
 4,
 349,
 NULL,
 'served'),

-- Takeout - Ramirez
((SELECT id FROM orders WHERE ticket_name = 'Takeout - Ramirez'),
 (SELECT id FROM items WHERE name = 'Carne Asada Burrito'),
 1,
 1399,
 'Salsa on the side',
 'submitted'),

((SELECT id FROM orders WHERE ticket_name = 'Takeout - Ramirez'),
 (SELECT id FROM items WHERE name = 'Queso Dip'),
 1,
 699,
 NULL,
 'submitted'),

((SELECT id FROM orders WHERE ticket_name = 'Takeout - Ramirez'),
 (SELECT id FROM items WHERE name = 'Mexican Coke'),
 1,
 349,
 NULL,
 'submitted'),

-- Delivery - DoorDash #1042
((SELECT id FROM orders WHERE ticket_name = 'Delivery - DoorDash #1042'),
 (SELECT id FROM items WHERE name = 'California Burrito'),
 1,
 1499,
 NULL,
 'submitted'),

((SELECT id FROM orders WHERE ticket_name = 'Delivery - DoorDash #1042'),
 (SELECT id FROM items WHERE name = 'Baja Fish Tacos'),
 1,
 1399,
 'Sauce on side',
 'submitted'),

((SELECT id FROM orders WHERE ticket_name = 'Delivery - DoorDash #1042'),
 (SELECT id FROM items WHERE name = 'Jamaica'),
 2,
 399,
 NULL,
 'submitted'),

-- Takeout - Gomez (paid)
((SELECT id FROM orders WHERE ticket_name = 'Takeout - Gomez'),
 (SELECT id FROM items WHERE name = 'Bean and Cheese Burrito'),
 2,
 899,
 NULL,
 'served'),

((SELECT id FROM orders WHERE ticket_name = 'Takeout - Gomez'),
 (SELECT id FROM items WHERE name = 'Flan'),
 1,
 499,
 NULL,
 'served'),

-- Reserved Walkout (cancelled)
((SELECT id FROM orders WHERE ticket_name = 'Reserved Walkout'),
 (SELECT id FROM items WHERE name = 'Iced Tea'),
 3,
 299,
 NULL,
 'voided');

-- =========================
-- ORDER ITEM MODIFIERS
-- =========================
INSERT INTO order_item_modifiers (order_item_id, modifier_id, quantity)
VALUES
-- Chicken quesadilla for Lopez Party
(
    (SELECT oi.id
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     JOIN items i ON oi.item_id = i.id
     WHERE o.ticket_name = 'Lopez Party' AND i.name = 'Chicken Quesadilla'
     LIMIT 1),
    (SELECT id FROM modifiers WHERE name = 'Extra Cheese'),
    1
),
(
    (SELECT oi.id
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     JOIN items i ON oi.item_id = i.id
     WHERE o.ticket_name = 'Lopez Party' AND i.name = 'Chicken Quesadilla'
     LIMIT 1),
    (SELECT id FROM modifiers WHERE name = 'No Sour Cream'),
    1
),

-- Asada tacos on Table 6
(
    (SELECT oi.id
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     JOIN items i ON oi.item_id = i.id
     WHERE o.ticket_name = 'Table 6 Check 1' AND i.name = 'Street Tacos - Asada'
     LIMIT 1),
    (SELECT id FROM modifiers WHERE name = 'No Onions'),
    1
),
(
    (SELECT oi.id
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     JOIN items i ON oi.item_id = i.id
     WHERE o.ticket_name = 'Table 6 Check 1' AND i.name = 'Street Tacos - Asada'
     LIMIT 1),
    (SELECT id FROM modifiers WHERE name = 'Hot Salsa'),
    1
),

-- Chicken fajitas
(
    (SELECT oi.id
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     JOIN items i ON oi.item_id = i.id
     WHERE o.ticket_name = 'Table 6 Check 1' AND i.name = 'Chicken Fajitas'
     LIMIT 1),
    (SELECT id FROM modifiers WHERE name = 'Flour Tortillas'),
    1
),

-- Carne asada burrito takeout
(
    (SELECT oi.id
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     JOIN items i ON oi.item_id = i.id
     WHERE o.ticket_name = 'Takeout - Ramirez' AND i.name = 'Carne Asada Burrito'
     LIMIT 1),
    (SELECT id FROM modifiers WHERE name = 'Extra Guacamole'),
    1
),
(
    (SELECT oi.id
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     JOIN items i ON oi.item_id = i.id
     WHERE o.ticket_name = 'Takeout - Ramirez' AND i.name = 'Carne Asada Burrito'
     LIMIT 1),
    (SELECT id FROM modifiers WHERE name = 'Add Jalapenos'),
    1
),

-- California burrito delivery
(
    (SELECT oi.id
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     JOIN items i ON oi.item_id = i.id
     WHERE o.ticket_name = 'Delivery - DoorDash #1042' AND i.name = 'California Burrito'
     LIMIT 1),
    (SELECT id FROM modifiers WHERE name = 'No Cheese'),
    1
),

-- Bean and cheese burrito takeout
(
    (SELECT oi.id
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     JOIN items i ON oi.item_id = i.id
     WHERE o.ticket_name = 'Takeout - Gomez' AND i.name = 'Bean and Cheese Burrito'
     LIMIT 1),
    (SELECT id FROM modifiers WHERE name = 'Extra Salsa'),
    1
);

-- =========================
-- PAYMENTS
-- =========================
INSERT INTO payments (order_id, amount_in_cents, payment_method, payment_status)
VALUES
-- Birthday Table fully paid with card
((SELECT id FROM orders WHERE ticket_name = 'Birthday Table'), 6692, 'card', 'completed'),

-- Takeout - Gomez paid cash
((SELECT id FROM orders WHERE ticket_name = 'Takeout - Gomez'), 2297, 'cash', 'completed'),

-- Table 6 partial failed mobile attempt
((SELECT id FROM orders WHERE ticket_name = 'Table 6 Check 1'), 2500, 'mobile_pay', 'failed'),

-- Delivery pending card payment
((SELECT id FROM orders WHERE ticket_name = 'Delivery - DoorDash #1042'), 2297, 'card', 'pending'),

-- Reserved Walkout voided payment attempt
((SELECT id FROM orders WHERE ticket_name = 'Reserved Walkout'), 897, 'card', 'voided'),

-- Example refunded payment
((SELECT id FROM orders WHERE ticket_name = 'Birthday Table'), 500, 'cash', 'refunded');
-- Seed data for Fotofolio application

-- Insert sample users
INSERT INTO User (email, password_hash, role, name) VALUES
('admin@fotofolio.com', '$2b$10$rQZ8K9mN2pL1sX3vB4nQ5eR6tY7uI8oP9qA0bC1dE2fG3hH4iJ5kL6mN7oP8', 'admin', 'Admin User'),
('client@example.com', '$2b$10$rQZ8K9mN2pL1sX3vB4nQ5eR6tY7uI8oP9qA0bC1dE2fG3hH4iJ5kL6mN7oP8', 'client', 'John Client'),
('photographer@example.com', '$2b$10$rQZ8K9mN2pL1sX3vB4nQ5eR6tY7uI8oP9qA0bC1dE2fG3hH4iJ5kL6mN7oP8', 'photographer', 'Sarah Photographer');

-- Insert client profiles (for both admin and client users)
INSERT INTO Client (user_id, phone) VALUES
(1, '+1-555-0000'),
(2, '+1-555-0101');

-- Insert photographer profiles
INSERT INTO Photographer (user_id, phone, specialization, location) VALUES
(3, '+1-555-0202', 'Wedding, Portrait', 'New York, NY');

-- Insert sample bookings (using the client_id from Client table, not user_id)
INSERT INTO Booking (client_id, event_date, location, event_type, notes, status) VALUES
(1, '2024-12-15', 'Central Park, New York', 'Wedding', 'Outdoor wedding ceremony and reception photos', 'OPEN'),
(2, '2024-12-20', 'Times Square, New York', 'Event', 'Corporate holiday party photography', 'OPEN');

-- Insert sample applications (using the photographer_id from Photographer table)
INSERT INTO Booking_Application (booking_id, photographer_id, status) VALUES
(1, 1, 'PENDING');

-- Insert sample portfolio items (using the photographer_id from Photographer table)
INSERT INTO Portfolio (photographer_id, title, description, image_url) VALUES
(1, 'Wedding Ceremony', 'Beautiful outdoor wedding ceremony', 'https://example.com/wedding1.jpg'),
(1, 'Portrait Session', 'Professional headshot session', 'https://example.com/portrait1.jpg'),
(1, 'Event Coverage', 'Corporate event photography', 'https://example.com/event1.jpg');

-- Insert sample payments
INSERT INTO Payment (booking_id, amount, status) VALUES
(1, 500.00, 'UNPAID'),
(2, 300.00, 'UNPAID');

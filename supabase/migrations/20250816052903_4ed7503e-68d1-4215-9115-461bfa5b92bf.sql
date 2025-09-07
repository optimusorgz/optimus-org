-- Add foreign key relationship between events and profiles
ALTER TABLE events 
ADD CONSTRAINT fk_events_created_by 
FOREIGN KEY (created_by) REFERENCES profiles(user_id);

-- Insert sample events with different categories
INSERT INTO events (id, title, description, event_date, price, max_participants, image_url, created_by, category) VALUES
-- First get a sample user from profiles to use as created_by
-- We'll use the first available user_id from profiles table

-- Free Workshop Event
('550e8400-e29b-41d4-a716-446655440001', 
 'Introduction to React Workshop', 
 'Join us for a comprehensive introduction to React.js. Learn the fundamentals of component-based development, state management, and modern React patterns. Perfect for beginners looking to start their frontend journey.',
 '2024-09-15 14:00:00+00',
 0,
 50,
 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
 (SELECT user_id FROM profiles LIMIT 1),
 'Workshop'),

-- Paid Tech Talk Event  
('550e8400-e29b-41d4-a716-446655440002',
 'AI and Machine Learning in 2024',
 'Discover the latest trends and breakthroughs in AI and ML. Industry experts will share insights on emerging technologies, practical applications, and future career opportunities in artificial intelligence.',
 '2024-09-20 16:00:00+00',
 299,
 100,
 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=400&fit=crop',
 (SELECT user_id FROM profiles LIMIT 1),
 'Tech Talk'),

-- Free Hackathon Event
('550e8400-e29b-41d4-a716-446655440003',
 '48-Hour Innovation Hackathon',
 'Build innovative solutions to real-world problems in just 48 hours! Team up with fellow developers, designers, and entrepreneurs. Prizes worth ₹1,00,000 to be won. Food and beverages provided.',
 '2024-09-25 18:00:00+00',
 0,
 200,
 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=400&fit=crop',
 (SELECT user_id FROM profiles LIMIT 1),
 'Hackathon'),

-- Paid Workshop Event
('550e8400-e29b-41d4-a716-446655440004',
 'Advanced Node.js & Backend Development',
 'Master backend development with Node.js, Express, and MongoDB. Learn advanced concepts like authentication, API design, database optimization, and deployment strategies. Includes hands-on projects.',
 '2024-10-02 10:00:00+00',
 1299,
 30,
 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop',
 (SELECT user_id FROM profiles LIMIT 1),
 'Workshop'),

-- Free Tech Talk Event
('550e8400-e29b-41d4-a716-446655440005',
 'Open Source Contribution: A Beginner Guide',
 'Learn how to contribute to open source projects and build your developer portfolio. We will cover Git workflows, finding projects, making your first PR, and building connections in the open source community.',
 '2024-10-08 15:00:00+00',
 0,
 75,
 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=400&fit=crop',
 (SELECT user_id FROM profiles LIMIT 1),
 'Tech Talk');

-- Create a sample profile if none exists
INSERT INTO profiles (user_id, name, role) 
SELECT gen_random_uuid(), 'Optimus Tech Club', 'organiser'
WHERE NOT EXISTS (SELECT 1 FROM profiles);
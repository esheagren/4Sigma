-- Sample categories
INSERT INTO public.categories (slug, label) VALUES
('science', 'Science'),
('geography', 'Geography'),
('economics', 'Economics'),
('technology', 'Technology'),
('history', 'History');

-- Sample questions
INSERT INTO public.questions (prompt, correct_answer) VALUES
('What is the height of Mount Everest in meters?', 8849),
('What is the average distance from Earth to the Moon in kilometers?', 384400),
('What is the population of Tokyo metropolitan area?', 37400000),
('What is the average human body temperature in degrees Celsius?', 37),
('What was the GDP of Germany in 2022 in trillion USD?', 4.07),
('What is the wingspan of a Boeing 747 in meters?', 68.5),
('What is the speed of light in meters per second?', 299792458),
('What is the diameter of Earth in kilometers?', 12742),
('What year was the World Wide Web invented?', 1989),
('What is the boiling point of water at sea level in degrees Celsius?', 100);

-- Link questions to categories
INSERT INTO public.question_categories (question_id, category_id) VALUES
(1, 2), -- Mount Everest -> Geography
(2, 1), -- Earth-Moon distance -> Science
(3, 2), -- Tokyo population -> Geography
(4, 1), -- Body temperature -> Science
(5, 3), -- Germany GDP -> Economics
(6, 4), -- Boeing 747 -> Technology
(7, 1), -- Speed of light -> Science
(8, 1), -- Earth diameter -> Science
(9, 4), -- WWW invention -> Technology
(10, 1); -- Water boiling point -> Science 
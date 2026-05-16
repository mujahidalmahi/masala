-- ============================================================================
-- StudySprint OS - Seed Data
-- ============================================================================

-- ---------------------------------------------------------------------------
-- NOTE: To create an admin user, first sign up through the app or Supabase
-- Auth UI, then run:
--
--   UPDATE public.profiles
--   SET role = 'admin'
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
--
-- Default admin for development (create via Supabase Auth first):
--   Email:    admin@studysprint.io
--   Password: admin123456
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- LEVELS
-- ---------------------------------------------------------------------------
INSERT INTO public.levels (id, level_name, xp_required, rewards) VALUES
    (1,  'Scholar',       0,      '{"title": "Scholar", "badge": "beginner"}'),
    (2,  'Apprentice',    500,    '{"title": "Apprentice"}'),
    (3,  'Bookworm',      1200,   '{"title": "Bookworm", "badge": "reader"}'),
    (4,  'Focused Mind',   2200,   '{"title": "Focused Mind"}'),
    (5,  'Knowledge Seeker', 3500, '{"title": "Knowledge Seeker", "badge": "seeker"}'),
    (6,  'Dedicated Student', 5200, '{"title": "Dedicated Student"}'),
    (7,  'Top Performer',  7500,   '{"title": "Top Performer", "badge": "performer"}'),
    (8,  'Study Master',   10000,  '{"title": "Study Master"}'),
    (9,  'Learning Sage',  15000,  '{"title": "Learning Sage", "badge": "sage"}'),
    (10, 'Grand Scholar',  25000,  '{"title": "Grand Scholar", "badge": "grandmaster"}');

-- ---------------------------------------------------------------------------
-- BADGES
-- ---------------------------------------------------------------------------
INSERT INTO public.badges (name, description, badge_type, rarity, criteria, xp_reward) VALUES
    ('First Steps',         'Complete your first study session',                'milestone',  'common',   '{"type": "study_sessions", "count": 1}',            50),
    ('Dedicated Learner',   'Study for 7 days in a row',                        'streak',     'uncommon', '{"type": "streak", "count": 7}',                   150),
    ('Fortnight Warrior',   'Study for 14 days in a row',                       'streak',     'rare',     '{"type": "streak", "count": 14}',                  300),
    ('Monthly Champion',    'Study for 30 days in a row',                       'streak',     'epic',     '{"type": "streak", "count": 30}',                  500),
    ('Quiz Master',         'Score 100% on any quiz',                           'achievement','rare',     '{"type": "quiz_perfect", "count": 1}',             200),
    ('Speed Demon',         'Complete a quiz in under 2 minutes',                'speed',      'uncommon', '{"type": "quiz_speed", "seconds": 120}',           100),
    ('Subject Expert',      'Reach 80% mastery in any subject',                 'mastery',    'rare',     '{"type": "mastery", "level": 80}',                 400),
    ('Consistency King',    'Study 5 days this week',                            'consistency','uncommon', '{"type": "weekly_days", "count": 5}',              100),
    ('Social Butterfly',    'Join 5 different study rooms',                     'social',     'common',   '{"type": "rooms_joined", "count": 5}',             75),
    ('Late Night Scholar',  'Study after midnight for 3 sessions',              'special',    'uncommon', '{"type": "night_study", "count": 3}',              150),
    ('Century Mark',        'Complete 100 study sessions',                       'milestone',  'epic',     '{"type": "study_sessions", "count": 100}',         1000),
    ('Perfect Week',        'Study every day for a full week',                  'streak',     'rare',     '{"type": "weekly_perfect", "count": 1}',           250),
    ('Rising Star',         'Reach level 5',                                     'milestone',  'uncommon', '{"type": "level", "level": 5}',                    200),
    ('Knowledge Hoarder',   'Study 10 different subjects',                      'achievement','epic',     '{"type": "subjects_studied", "count": 10}',        500),
    ('Marathon Session',    'Complete a 3-hour study session',                   'milestone',  'rare',     '{"type": "session_length", "minutes": 180}',       300);

-- ---------------------------------------------------------------------------
-- COUNTRIES
-- ---------------------------------------------------------------------------
INSERT INTO public.countries (name, code) VALUES
    ('India',       'IN'),
    ('United States', 'US'),
    ('United Kingdom', 'GB'),
    ('Canada',      'CA'),
    ('Australia',   'AU'),
    ('Singapore',   'SG'),
    ('UAE',         'AE'),
    ('Pakistan',    'PK'),
    ('Bangladesh',  'BD'),
    ('Sri Lanka',   'LK');

-- ---------------------------------------------------------------------------
-- BOARDS
-- ---------------------------------------------------------------------------
INSERT INTO public.boards (country_id, name, description)
SELECT c.id, b.name, b.description
FROM public.countries c
CROSS JOIN LATERAL (VALUES
    ('CBSE', 'Central Board of Secondary Education'),
    ('ICSE', 'Indian Certificate of Secondary Education'),
    ('IB',   'International Baccalaureate'),
    ('IGCSE', 'International General Certificate of Secondary Education')
) AS b(name, description)
WHERE c.code = 'IN';

INSERT INTO public.boards (country_id, name, description)
SELECT c.id, b.name, b.description
FROM public.countries c
CROSS JOIN LATERAL (VALUES
    ('Common Core', 'US Common Core State Standards'),
    ('AP', 'Advanced Placement Program')
) AS b(name, description)
WHERE c.code = 'US';

INSERT INTO public.boards (country_id, name, description)
SELECT c.id, b.name, b.description
FROM public.countries c
CROSS JOIN LATERAL (VALUES
    ('A-Levels', 'General Certificate of Education Advanced Level'),
    ('GCSE', 'General Certificate of Secondary Education')
) AS b(name, description)
WHERE c.code = 'GB';

-- ---------------------------------------------------------------------------
-- GRADES (CBSE example)
-- ---------------------------------------------------------------------------
INSERT INTO public.grades (board_id, name, display_order)
SELECT b.id, g.name, g.display_order
FROM public.boards b
CROSS JOIN LATERAL (VALUES
    ('Class 6',  6),
    ('Class 7',  7),
    ('Class 8',  8),
    ('Class 9',  9),
    ('Class 10', 10),
    ('Class 11', 11),
    ('Class 12', 12)
) AS g(name, display_order)
WHERE b.name = 'CBSE';

-- ---------------------------------------------------------------------------
-- SUBJECTS
-- ---------------------------------------------------------------------------
INSERT INTO public.subjects (name, description, icon, color) VALUES
    ('Mathematics',    'Study of numbers, quantities, and shapes',        'calculator',   '#3B82F6'),
    ('Physics',        'Study of matter, energy, and their interactions', 'atom',         '#EF4444'),
    ('Chemistry',      'Study of substances and their reactions',         'flask',        '#10B981'),
    ('Biology',        'Study of living organisms',                       'dna',          '#8B5CF6'),
    ('English',        'Study of language and literature',                'book-open',    '#F59E0B'),
    ('History',        'Study of past events',                            'landmark',     '#6366F1'),
    ('Geography',      'Study of Earth and its features',                 'globe',        '#14B8A6'),
    ('Computer Science','Study of computation and information',            'monitor',      '#EC4899'),
    ('Economics',      'Study of production and consumption',             'trending-up',  '#F97316'),
    ('Hindi',          'Hindi language and literature',                   'message-circle','#84CC16'),
    ('Sanskrit',       'Sanskrit language and literature',                'scroll',       '#A855F7'),
    ('Political Science','Study of governance and systems',              'scale',        '#06B6D4');

-- ---------------------------------------------------------------------------
-- LINK SUBJECTS TO CBSE GRADES (example for Class 10)
-- ---------------------------------------------------------------------------
INSERT INTO public.grade_subjects (grade_id, subject_id)
SELECT g.id, s.id
FROM public.grades g
CROSS JOIN public.subjects s
WHERE g.name = 'Class 10'
  AND s.name IN ('Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science', 'Hindi', 'Sanskrit', 'Economics', 'Political Science');

-- ---------------------------------------------------------------------------
-- CHAPTERS (Mathematics - Class 10 CBSE)
-- ---------------------------------------------------------------------------
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT s.id, g.id, c.name, c.display_order, c.description
FROM public.subjects s
CROSS JOIN public.grades g
CROSS JOIN LATERAL (VALUES
    ('Real Numbers',                    1, 'Euclid division lemma, fundamental theorem of arithmetic'),
    ('Polynomials',                     2, 'Geometrical meaning of zeros, relationship between zeros and coefficients'),
    ('Pair of Linear Equations',        3, 'Graphical and algebraic methods of solving equations'),
    ('Quadratic Equations',             4, 'Standard form, solution by factorization and quadratic formula'),
    ('Arithmetic Progressions',         5, 'nth term, sum of n terms'),
    ('Triangles',                       6, 'Similarity of triangles, Pythagoras theorem'),
    ('Coordinate Geometry',            7, 'Distance formula, section formula, area of triangle'),
    ('Introduction to Trigonometry',   8, 'Trigonometric ratios, identities'),
    ('Some Applications of Trigonometry',9, 'Heights and distances'),
    ('Circles',                        10, 'Tangents to a circle'),
    ('Constructions',                  11, 'Division of line segment, construction of tangents'),
    ('Areas Related to Circles',       12, 'Area of sector, segment, combinations'),
    ('Surface Areas and Volumes',      13, 'Surface areas and volumes of combinations of solids'),
    ('Statistics',                     14, 'Mean, median, mode, ogive'),
    ('Probability',                    15, 'Classical definition, simple problems')
) AS c(name, display_order, description)
WHERE s.name = 'Mathematics' AND g.name = 'Class 10';

-- ---------------------------------------------------------------------------
-- TOPICS for Chapter 1: Real Numbers
-- ---------------------------------------------------------------------------
INSERT INTO public.topics (chapter_id, name, display_order, content_summary, learning_outcomes)
SELECT c.id, t.name, t.display_order, t.content_summary,
       t.outcomes::jsonb
FROM public.chapters c
CROSS JOIN LATERAL (VALUES
    ('Euclid Division Lemma',       1, 'Fundamental lemma used for finding HCF of numbers',
     '["State and explain Euclid division lemma", "Find HCF using Euclid algorithm", "Apply lemma to solve problems"]'),
    ('Fundamental Theorem of Arithmetic', 2, 'Every composite number can be expressed as product of primes',
     '["State the fundamental theorem of arithmetic", "Express numbers as product of primes", "Find LCM and HCF using prime factorization"]'),
     ('Revisiting Irrational Numbers', 3, 'Proof that √2, √3, √5 are irrational',
      '["Prove that square roots of primes are irrational", "Apply proof by contradiction", "Identify rational vs irrational numbers"]'),
    ('Revisiting Rational Numbers', 4, 'Decimal expansions of rational numbers',
     '["Classify decimal expansions as terminating or non-terminating", "Convert between fractions and decimals", "Identify purely recurring decimals"]')
) AS t(name, display_order, content_summary, outcomes)
WHERE c.name = 'Real Numbers' AND c.subject_id = (SELECT id FROM public.subjects WHERE name = 'Mathematics');

-- ---------------------------------------------------------------------------
-- SAMPLE QUESTIONS for Real Numbers
-- ---------------------------------------------------------------------------
INSERT INTO public.questions (topic_id, question_type, difficulty, question_text, explanation, points, is_verified)
SELECT t.id, q.question_type, q.difficulty, q.question_text, q.explanation, q.points, true
FROM public.topics t
CROSS JOIN LATERAL (VALUES
    ('mcq', 1, 'What is the HCF of 455 and 78?',
     'Using Euclid algorithm: 455 = 78×5 + 65, 78 = 65×1 + 13, 65 = 13×5 + 0. So HCF = 13.', 1),
    ('mcq', 1, 'Which of the following is an irrational number?',
     '√2 cannot be expressed as p/q in simplest form. It has non-terminating non-repeating decimal expansion.', 1),
    ('short', 2, 'Find the LCM and HCF of 336 and 54 by prime factorization.',
     '336 = 2⁴×3×7, 54 = 2×3³. HCF = 2×3 = 6. LCM = 2⁴×3³×7 = 3024.', 2),
    ('short', 2, 'Prove that √3 is irrational.',
     'Assume √3 = p/q (coprime). Then 3q² = p². So 3 divides p², hence 3 divides p. Substituting leads to contradiction.', 3),
    ('long', 3, 'Show that 5 - √3 is irrational.',
     'Assume 5 - √3 = p/q. Then √3 = 5 - p/q = (5q-p)/q, which is rational. But √3 is irrational. Contradiction.', 4),
    ('board', 3, 'Use Euclid division lemma to show that the square of any positive integer is of the form 3m or 3m+1.',
     'Let a be any integer. a = 3q + r where r = 0,1,2. Square and check each case.', 4)
) AS q(question_type, difficulty, question_text, explanation, points)
WHERE t.name = 'Euclid Division Lemma';

-- ---------------------------------------------------------------------------
-- MCQ OPTIONS for the first question
-- ---------------------------------------------------------------------------
INSERT INTO public.question_options (question_id, option_text, is_correct, display_order)
SELECT q.id, o.option_text, o.is_correct, o.display_order
FROM public.questions q
CROSS JOIN LATERAL (VALUES
    ('5',   false, 1),
    ('13',  true,  2),
    ('17',  false, 3),
    ('23',  false, 4)
) AS o(option_text, is_correct, display_order)
WHERE q.question_text = 'What is the HCF of 455 and 78?';

INSERT INTO public.question_options (question_id, option_text, is_correct, display_order)
SELECT q.id, o.option_text, o.is_correct, o.display_order
FROM public.questions q
CROSS JOIN LATERAL (VALUES
    ('22/7',  false, 1),
    ('√2',    true,  2),
    ('0.333...', false, 3),
    ('3.14', false, 4)
) AS o(option_text, is_correct, display_order)
WHERE q.question_text = 'Which of the following is an irrational number?';

-- ---------------------------------------------------------------------------
-- SKILL TREES
-- ---------------------------------------------------------------------------
INSERT INTO public.skill_trees (subject_id, name, description, icon)
SELECT s.id, st.name, st.description, s.icon
FROM public.subjects s
CROSS JOIN LATERAL (VALUES
    ('Algebra',         'Equations, polynomials, and algebraic structures'),
    ('Geometry',        'Shapes, sizes, and properties of space'),
    ('Trigonometry',    'Relations between angles and sides of triangles'),
    ('Statistics',      'Collection and analysis of numerical data')
) AS st(name, description)
WHERE s.name = 'Mathematics';

-- ---------------------------------------------------------------------------
-- DAILY CHALLENGES
-- ---------------------------------------------------------------------------
INSERT INTO public.daily_challenges (title, description, challenge_type, requirement, xp_reward, valid_from, valid_to)
SELECT title, description, challenge_type, requirement, xp_reward,
       CURRENT_DATE, CURRENT_DATE + interval '30 days'
FROM (VALUES
    ('30-Min Focus',      'Study for at least 30 minutes today',        'study_minutes', 30,  100),
    ('Quiz Champion',     'Score 80% or more on any quiz',              'quiz_score',    80,  150),
    ('Double Session',    'Complete 2 study sessions today',            'sessions_count', 2,  80),
    ('Subject Focus',     'Study the same subject for 45 minutes',      'subject_focus',  45, 120),
    ('Streak Saver',      'Study today to maintain your streak',        'streak_maintain', 1, 50),
    ('Speed Quiz',        'Complete a quiz in under 5 minutes',         'quiz_score',    60,  130),
    ('Deep Dive',         'Study for 2 hours in a single session',      'study_minutes', 120, 200)
) AS c(title, description, challenge_type, requirement, xp_reward);

-- ============================================================================
-- StudySprint OS - Full Curriculum Seed: Chapters & Topics for CBSE 6-12
-- Simplified pattern: CTE gets IDs, UNION ALL chains the chapter rows
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. Add Science subject for classes 6-8
-- ---------------------------------------------------------------------------
INSERT INTO public.subjects (name, description, icon, color)
SELECT 'Science', 'Study of the natural world through observation and experiment', 'flask', '#10B981'
WHERE NOT EXISTS (SELECT 1 FROM public.subjects WHERE name = 'Science');

-- ---------------------------------------------------------------------------
-- 1. Link ALL subjects to ALL CBSE grades (6-12)
-- ---------------------------------------------------------------------------
INSERT INTO public.grade_subjects (grade_id, subject_id)
SELECT g.id, s.id
FROM public.grades g
CROSS JOIN public.subjects s
WHERE g.name IN ('Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12')
AND NOT EXISTS (
  SELECT 1 FROM public.grade_subjects gs WHERE gs.grade_id = g.id AND gs.subject_id = s.id
);

-- ============================================================================
-- 2. CHAPTERS: MATHEMATICS
-- ============================================================================

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Mathematics' AND g.name = 'Class 6'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Knowing Our Numbers', 1, 'Comparing and ordering large numbers' FROM ids
UNION ALL SELECT sid, gid, 'Whole Numbers', 2, 'Properties and operations on whole numbers' FROM ids
UNION ALL SELECT sid, gid, 'Playing with Numbers', 3, 'Factors, multiples, prime and composite numbers' FROM ids
UNION ALL SELECT sid, gid, 'Basic Geometrical Ideas', 4, 'Points, lines, rays, angles, polygons' FROM ids
UNION ALL SELECT sid, gid, 'Understanding Elementary Shapes', 5, 'Measuring and classifying angles and shapes' FROM ids
UNION ALL SELECT sid, gid, 'Integers', 6, 'Positive and negative numbers, number line' FROM ids
UNION ALL SELECT sid, gid, 'Fractions', 7, 'Types of fractions, comparison, operations' FROM ids
UNION ALL SELECT sid, gid, 'Decimals', 8, 'Decimal representation, operations and applications' FROM ids
UNION ALL SELECT sid, gid, 'Data Handling', 9, 'Recording, organising and interpreting data' FROM ids
UNION ALL SELECT sid, gid, 'Mensuration', 10, 'Perimeter and area of simple shapes' FROM ids
UNION ALL SELECT sid, gid, 'Algebra', 11, 'Introduction to variables and expressions' FROM ids
UNION ALL SELECT sid, gid, 'Ratio and Proportion', 12, 'Comparing quantities, unitary method' FROM ids
UNION ALL SELECT sid, gid, 'Symmetry', 13, 'Line symmetry and reflection' FROM ids
UNION ALL SELECT sid, gid, 'Practical Geometry', 14, 'Construction of geometrical figures' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Mathematics' AND g.name = 'Class 7'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Integers', 1, 'Properties of integers, multiplication and division' FROM ids
UNION ALL SELECT sid, gid, 'Fractions and Decimals', 2, 'Multiplication and division of fractions and decimals' FROM ids
UNION ALL SELECT sid, gid, 'Data Handling', 3, 'Mean, median, mode and bar graphs' FROM ids
UNION ALL SELECT sid, gid, 'Simple Equations', 4, 'Solving equations, applications' FROM ids
UNION ALL SELECT sid, gid, 'Lines and Angles', 5, 'Complementary, supplementary, adjacent angles' FROM ids
UNION ALL SELECT sid, gid, 'The Triangle and Its Properties', 6, 'Angle sum property, Pythagoras theorem' FROM ids
UNION ALL SELECT sid, gid, 'Comparing Quantities', 7, 'Ratios, percentages, profit and loss' FROM ids
UNION ALL SELECT sid, gid, 'Rational Numbers', 8, 'Representation and operations on rational numbers' FROM ids
UNION ALL SELECT sid, gid, 'Perimeter and Area', 9, 'Area of parallelograms, triangles, circles' FROM ids
UNION ALL SELECT sid, gid, 'Algebraic Expressions', 10, 'Terms, coefficients, addition and subtraction' FROM ids
UNION ALL SELECT sid, gid, 'Exponents and Powers', 11, 'Laws of exponents, scientific notation' FROM ids
UNION ALL SELECT sid, gid, 'Symmetry', 12, 'Rotational symmetry, line symmetry' FROM ids
UNION ALL SELECT sid, gid, 'Visualising Solid Shapes', 13, 'Nets, views of 3D shapes' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Mathematics' AND g.name = 'Class 8'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Rational Numbers', 1, 'Properties of rational numbers, representation' FROM ids
UNION ALL SELECT sid, gid, 'Linear Equations in One Variable', 2, 'Solving linear equations with applications' FROM ids
UNION ALL SELECT sid, gid, 'Understanding Quadrilaterals', 3, 'Types of quadrilaterals, angle sum property' FROM ids
UNION ALL SELECT sid, gid, 'Data Handling', 4, 'Grouping data, pie charts, probability' FROM ids
UNION ALL SELECT sid, gid, 'Squares and Square Roots', 5, 'Properties, finding square roots' FROM ids
UNION ALL SELECT sid, gid, 'Cubes and Cube Roots', 6, 'Perfect cubes, cube roots' FROM ids
UNION ALL SELECT sid, gid, 'Comparing Quantities', 7, 'Compound interest, depreciation' FROM ids
UNION ALL SELECT sid, gid, 'Algebraic Expressions and Identities', 8, 'Standard identities, factorisation' FROM ids
UNION ALL SELECT sid, gid, 'Mensuration', 9, 'Area of trapezium, volume of 3D shapes' FROM ids
UNION ALL SELECT sid, gid, 'Exponents and Powers', 10, 'Negative exponents, laws of exponents' FROM ids
UNION ALL SELECT sid, gid, 'Direct and Inverse Proportions', 11, 'Variation, solving proportion problems' FROM ids
UNION ALL SELECT sid, gid, 'Factorisation', 12, 'Factorisation of algebraic expressions' FROM ids
UNION ALL SELECT sid, gid, 'Introduction to Graphs', 13, 'Line graphs, bar graphs, histograms' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Mathematics' AND g.name = 'Class 9'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Number Systems', 1, 'Real numbers, rationalisation, laws of exponents' FROM ids
UNION ALL SELECT sid, gid, 'Polynomials', 2, 'Degree, zeros, factorisation, algebraic identities' FROM ids
UNION ALL SELECT sid, gid, 'Coordinate Geometry', 3, 'Cartesian plane, plotting points' FROM ids
UNION ALL SELECT sid, gid, 'Linear Equations in Two Variables', 4, 'Graphical and algebraic solutions' FROM ids
UNION ALL SELECT sid, gid, 'Introduction to Euclid Geometry', 5, 'Euclid axioms, postulates' FROM ids
UNION ALL SELECT sid, gid, 'Lines and Angles', 6, 'Angle pairs, parallel lines, transversals' FROM ids
UNION ALL SELECT sid, gid, 'Triangles', 7, 'Congruence criteria, inequalities' FROM ids
UNION ALL SELECT sid, gid, 'Quadrilaterals', 8, 'Properties, theorems, mid-point theorem' FROM ids
UNION ALL SELECT sid, gid, 'Circles', 9, 'Chords, arcs, cyclic quadrilaterals' FROM ids
UNION ALL SELECT sid, gid, 'Heron Formula', 10, 'Area of triangles using Heron formula' FROM ids
UNION ALL SELECT sid, gid, 'Surface Areas and Volumes', 11, 'Surface area and volume of solids' FROM ids
UNION ALL SELECT sid, gid, 'Statistics', 12, 'Collection, presentation and analysis of data' FROM ids
UNION ALL SELECT sid, gid, 'Probability', 13, 'Experimental probability, simple events' FROM ids;

-- Class 10 Math: skip (already in 010_seed_data)

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Mathematics' AND g.name = 'Class 11'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Sets', 1, 'Types of sets, Venn diagrams, operations' FROM ids
UNION ALL SELECT sid, gid, 'Relations and Functions', 2, 'Ordered pairs, domain, range, types of functions' FROM ids
UNION ALL SELECT sid, gid, 'Trigonometric Functions', 3, 'Angle measurement, trig ratios, identities' FROM ids
UNION ALL SELECT sid, gid, 'Complex Numbers', 4, 'Algebra of complex numbers, polar form' FROM ids
UNION ALL SELECT sid, gid, 'Linear Inequalities', 5, 'Graphical and algebraic solutions' FROM ids
UNION ALL SELECT sid, gid, 'Permutations and Combinations', 6, 'Counting principles, factorial notation' FROM ids
UNION ALL SELECT sid, gid, 'Binomial Theorem', 7, 'Expansion, general term, applications' FROM ids
UNION ALL SELECT sid, gid, 'Sequence and Series', 8, 'AP, GP, special series, sum to n terms' FROM ids
UNION ALL SELECT sid, gid, 'Straight Lines', 9, 'Slope, equations, angle between lines' FROM ids
UNION ALL SELECT sid, gid, 'Conic Sections', 10, 'Circle, parabola, ellipse, hyperbola' FROM ids
UNION ALL SELECT sid, gid, 'Introduction to 3D Geometry', 11, 'Coordinate axes, distance and section formula' FROM ids
UNION ALL SELECT sid, gid, 'Limits and Derivatives', 12, 'Intuitive limit concept, standard limits, derivatives' FROM ids
UNION ALL SELECT sid, gid, 'Statistics', 13, 'Mean deviation, variance, standard deviation' FROM ids
UNION ALL SELECT sid, gid, 'Probability', 14, 'Axiomatic probability, conditional probability' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Mathematics' AND g.name = 'Class 12'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Relations and Functions', 1, 'Types of relations, composition of functions' FROM ids
UNION ALL SELECT sid, gid, 'Inverse Trigonometric Functions', 2, 'Principal values, properties' FROM ids
UNION ALL SELECT sid, gid, 'Matrices', 3, 'Types, operations, determinants, inverse' FROM ids
UNION ALL SELECT sid, gid, 'Determinants', 4, 'Properties, area, adjoint, Cramer rule' FROM ids
UNION ALL SELECT sid, gid, 'Continuity and Differentiability', 5, 'Continuity, chain rule, implicit functions' FROM ids
UNION ALL SELECT sid, gid, 'Applications of Derivatives', 6, 'Rate of change, tangents, maxima and minima' FROM ids
UNION ALL SELECT sid, gid, 'Integrals', 7, 'Integration methods, definite integrals' FROM ids
UNION ALL SELECT sid, gid, 'Applications of Integrals', 8, 'Area under curves, between curves' FROM ids
UNION ALL SELECT sid, gid, 'Differential Equations', 9, 'Order, degree, solving methods' FROM ids
UNION ALL SELECT sid, gid, 'Vector Algebra', 10, 'Types of vectors, dot and cross product' FROM ids
UNION ALL SELECT sid, gid, 'Three Dimensional Geometry', 11, 'Direction cosines, line and plane equations' FROM ids
UNION ALL SELECT sid, gid, 'Linear Programming', 12, 'LPP formulation, graphical method' FROM ids
UNION ALL SELECT sid, gid, 'Probability', 13, 'Bayes theorem, random variables, distributions' FROM ids;

-- ============================================================================
-- 3. CHAPTERS: SCIENCE (6-8) / PHYSICS (9-12) / CHEMISTRY (9-12) / BIOLOGY (9-12)
-- ============================================================================

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Science' AND g.name = 'Class 6'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Food: Where Does It Come From', 1, 'Plant and animal sources of food' FROM ids
UNION ALL SELECT sid, gid, 'Components of Food', 2, 'Nutrients, balanced diet, deficiency diseases' FROM ids
UNION ALL SELECT sid, gid, 'Fibre to Fabric', 3, 'Natural and synthetic fibres, processing' FROM ids
UNION ALL SELECT sid, gid, 'Sorting Materials into Groups', 4, 'Classification of materials by properties' FROM ids
UNION ALL SELECT sid, gid, 'Separation of Substances', 5, 'Methods of separation' FROM ids
UNION ALL SELECT sid, gid, 'Changes Around Us', 6, 'Physical and chemical changes' FROM ids
UNION ALL SELECT sid, gid, 'Getting to Know Plants', 7, 'Parts of plants, classification' FROM ids
UNION ALL SELECT sid, gid, 'Body Movements', 8, 'Human skeleton, joints, movement in animals' FROM ids
UNION ALL SELECT sid, gid, 'The Living Organisms and Their Surroundings', 9, 'Characteristics of living things, habitats' FROM ids
UNION ALL SELECT sid, gid, 'Motion and Measurement of Distances', 10, 'Types of motion, standard units' FROM ids
UNION ALL SELECT sid, gid, 'Light, Shadows and Reflections', 11, 'Sources of light, pinhole camera' FROM ids
UNION ALL SELECT sid, gid, 'Electricity and Circuits', 12, 'Simple circuits, conductors and insulators' FROM ids
UNION ALL SELECT sid, gid, 'Fun with Magnets', 13, 'Magnetic and non-magnetic materials, poles' FROM ids
UNION ALL SELECT sid, gid, 'Water', 14, 'Water cycle, conservation of water' FROM ids
UNION ALL SELECT sid, gid, 'Air Around Us', 15, 'Composition of air, oxygen cycle' FROM ids
UNION ALL SELECT sid, gid, 'Garbage In, Garbage Out', 16, 'Waste management, recycling' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Science' AND g.name = 'Class 7'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Nutrition in Plants', 1, 'Photosynthesis, modes of nutrition' FROM ids
UNION ALL SELECT sid, gid, 'Nutrition in Animals', 2, 'Digestive system, nutrition in organisms' FROM ids
UNION ALL SELECT sid, gid, 'Fibre to Fabric', 3, 'Wool and silk production' FROM ids
UNION ALL SELECT sid, gid, 'Heat', 4, 'Temperature measurement, heat transfer' FROM ids
UNION ALL SELECT sid, gid, 'Acids, Bases and Salts', 5, 'Indicators, neutralisation reactions' FROM ids
UNION ALL SELECT sid, gid, 'Physical and Chemical Changes', 6, 'Types of changes, rusting, crystallisation' FROM ids
UNION ALL SELECT sid, gid, 'Weather, Climate and Adaptations', 7, 'Elements of weather, climate zones' FROM ids
UNION ALL SELECT sid, gid, 'Winds, Storms and Cyclones', 8, 'Air pressure, wind patterns, cyclone safety' FROM ids
UNION ALL SELECT sid, gid, 'Soil', 9, 'Soil profile, types, erosion and conservation' FROM ids
UNION ALL SELECT sid, gid, 'Respiration in Organisms', 10, 'Aerobic and anaerobic respiration' FROM ids
UNION ALL SELECT sid, gid, 'Transportation in Animals and Plants', 11, 'Circulatory system, transpiration' FROM ids
UNION ALL SELECT sid, gid, 'Reproduction in Plants', 12, 'Asexual and sexual reproduction, pollination' FROM ids
UNION ALL SELECT sid, gid, 'Motion and Time', 13, 'Speed, distance-time graphs' FROM ids
UNION ALL SELECT sid, gid, 'Electric Current and Its Effects', 14, 'Heating effect, magnetic effect of current' FROM ids
UNION ALL SELECT sid, gid, 'Light', 15, 'Reflection, spherical mirrors, lenses' FROM ids
UNION ALL SELECT sid, gid, 'Water: A Precious Resource', 16, 'Groundwater, water management' FROM ids
UNION ALL SELECT sid, gid, 'Forests: Our Lifeline', 17, 'Forest ecosystem, conservation' FROM ids
UNION ALL SELECT sid, gid, 'Wastewater Story', 18, 'Sewage treatment, sanitation' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Science' AND g.name = 'Class 8'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Crop Production and Management', 1, 'Agricultural practices, irrigation, storage' FROM ids
UNION ALL SELECT sid, gid, 'Microorganisms: Friend and Foe', 2, 'Types, beneficial and harmful microbes' FROM ids
UNION ALL SELECT sid, gid, 'Synthetic Fibres and Plastics', 3, 'Types, properties, environmental impact' FROM ids
UNION ALL SELECT sid, gid, 'Materials: Metals and Non-Metals', 4, 'Physical and chemical properties' FROM ids
UNION ALL SELECT sid, gid, 'Coal and Petroleum', 5, 'Formation, refining, conservation' FROM ids
UNION ALL SELECT sid, gid, 'Combustion and Flame', 6, 'Types of combustion, structure of flame' FROM ids
UNION ALL SELECT sid, gid, 'Conservation of Plants and Animals', 7, 'Biodiversity, wildlife sanctuaries' FROM ids
UNION ALL SELECT sid, gid, 'Cell: Structure and Functions', 8, 'Cell organelles, plant vs animal cells' FROM ids
UNION ALL SELECT sid, gid, 'Reproduction in Animals', 9, 'Sexual and asexual reproduction' FROM ids
UNION ALL SELECT sid, gid, 'Reaching the Age of Adolescence', 10, 'Hormones, secondary sexual characteristics' FROM ids
UNION ALL SELECT sid, gid, 'Force and Pressure', 11, 'Types of forces, atmospheric pressure' FROM ids
UNION ALL SELECT sid, gid, 'Friction', 12, 'Types, factors affecting, advantages and disadvantages' FROM ids
UNION ALL SELECT sid, gid, 'Sound', 13, 'Production, propagation, human ear' FROM ids
UNION ALL SELECT sid, gid, 'Chemical Effects of Electric Current', 14, 'Electrolysis, electroplating' FROM ids
UNION ALL SELECT sid, gid, 'Some Natural Phenomena', 15, 'Lightning, earthquakes, safety' FROM ids
UNION ALL SELECT sid, gid, 'Light', 16, 'Laws of reflection, human eye, dispersion' FROM ids
UNION ALL SELECT sid, gid, 'Stars and the Solar System', 17, 'Planets, constellations, moon phases' FROM ids
UNION ALL SELECT sid, gid, 'Pollution of Air and Water', 18, 'Types, effects, prevention' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Physics' AND g.name = 'Class 9'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Motion', 1, 'Distance, displacement, velocity, acceleration, graphs' FROM ids
UNION ALL SELECT sid, gid, 'Force and Laws of Motion', 2, 'Newton laws, inertia, momentum, conservation' FROM ids
UNION ALL SELECT sid, gid, 'Gravitation', 3, 'Universal law, free fall, mass vs weight' FROM ids
UNION ALL SELECT sid, gid, 'Work and Energy', 4, 'Work done, kinetic and potential energy, power' FROM ids
UNION ALL SELECT sid, gid, 'Sound', 5, 'Wave nature, speed, echo, ultrasound' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Chemistry' AND g.name = 'Class 9'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Matter in Our Surroundings', 1, 'States of matter, evaporation, sublimation' FROM ids
UNION ALL SELECT sid, gid, 'Is Matter Around Us Pure', 2, 'Mixtures, solutions, separation techniques' FROM ids
UNION ALL SELECT sid, gid, 'Atoms and Molecules', 3, 'Laws of chemical combination, mole concept' FROM ids
UNION ALL SELECT sid, gid, 'Structure of the Atom', 4, 'Subatomic particles, Bohr model, isotopes' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Biology' AND g.name = 'Class 9'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'The Fundamental Unit of Life', 1, 'Cell discovery, organelles, cell division' FROM ids
UNION ALL SELECT sid, gid, 'Tissues', 2, 'Plant and animal tissues, types and functions' FROM ids
UNION ALL SELECT sid, gid, 'Diversity in Living Organisms', 3, 'Classification hierarchy, kingdoms' FROM ids
UNION ALL SELECT sid, gid, 'Why Do We Fall Ill', 4, 'Health, diseases, immunity' FROM ids
UNION ALL SELECT sid, gid, 'Natural Resources', 5, 'Air, water, soil, biogeochemical cycles' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Physics' AND g.name = 'Class 10'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Light: Reflection and Refraction', 1, 'Laws of reflection, spherical mirrors, lens formula' FROM ids
UNION ALL SELECT sid, gid, 'Human Eye and Colourful World', 2, 'Eye structure, defects, dispersion, scattering' FROM ids
UNION ALL SELECT sid, gid, 'Electricity', 3, 'Ohm law, resistance, series and parallel circuits' FROM ids
UNION ALL SELECT sid, gid, 'Magnetic Effects of Electric Current', 4, 'Magnetic fields, electromagnets, induced current' FROM ids
UNION ALL SELECT sid, gid, 'Sources of Energy', 5, 'Conventional and non-conventional energy sources' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Chemistry' AND g.name = 'Class 10'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Chemical Reactions and Equations', 1, 'Types of reactions, balancing equations' FROM ids
UNION ALL SELECT sid, gid, 'Acids, Bases and Salts', 2, 'pH scale, reactions, common salts' FROM ids
UNION ALL SELECT sid, gid, 'Metals and Non-Metals', 3, 'Properties, reactivity series, extraction' FROM ids
UNION ALL SELECT sid, gid, 'Carbon and Its Compounds', 4, 'Covalent bonding, functional groups, nomenclature' FROM ids
UNION ALL SELECT sid, gid, 'Periodic Classification of Elements', 5, 'Mendeleev and modern periodic table' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Biology' AND g.name = 'Class 10'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Life Processes', 1, 'Nutrition, respiration, transportation, excretion' FROM ids
UNION ALL SELECT sid, gid, 'Control and Coordination', 2, 'Nervous system, hormones, plant movements' FROM ids
UNION ALL SELECT sid, gid, 'How Do Organisms Reproduce', 3, 'Asexual and sexual reproduction' FROM ids
UNION ALL SELECT sid, gid, 'Heredity and Evolution', 4, 'Mendel laws, genetic basis, evolution theories' FROM ids
UNION ALL SELECT sid, gid, 'Our Environment', 5, 'Ecosystem, food chains, waste management' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Physics' AND g.name = 'Class 11'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Physical World', 1, 'Scientific method, fundamental forces' FROM ids
UNION ALL SELECT sid, gid, 'Units and Measurements', 2, 'SI units, dimensional analysis, errors' FROM ids
UNION ALL SELECT sid, gid, 'Motion in a Straight Line', 3, 'Kinematics equations, relative velocity' FROM ids
UNION ALL SELECT sid, gid, 'Motion in a Plane', 4, 'Vector addition, projectile motion, circular motion' FROM ids
UNION ALL SELECT sid, gid, 'Laws of Motion', 5, 'Newton laws, friction, dynamics of circular motion' FROM ids
UNION ALL SELECT sid, gid, 'Work, Energy and Power', 6, 'Work-energy theorem, collisions' FROM ids
UNION ALL SELECT sid, gid, 'System of Particles and Rotational Motion', 7, 'Centre of mass, torque, angular momentum' FROM ids
UNION ALL SELECT sid, gid, 'Gravitation', 8, 'Kepler laws, escape velocity, satellites' FROM ids
UNION ALL SELECT sid, gid, 'Mechanical Properties of Solids', 9, 'Elasticity, Hooke law, stress-strain' FROM ids
UNION ALL SELECT sid, gid, 'Mechanical Properties of Fluids', 10, 'Pressure, viscosity, Bernoulli principle' FROM ids
UNION ALL SELECT sid, gid, 'Thermal Properties of Matter', 11, 'Temperature, calorimetry, heat transfer' FROM ids
UNION ALL SELECT sid, gid, 'Thermodynamics', 12, 'Laws of thermodynamics, Carnot engine' FROM ids
UNION ALL SELECT sid, gid, 'Kinetic Theory', 13, 'Gas laws, RMS speed, degrees of freedom' FROM ids
UNION ALL SELECT sid, gid, 'Oscillations', 14, 'SHM, simple pendulum, damped oscillations' FROM ids
UNION ALL SELECT sid, gid, 'Waves', 15, 'Wave types, superposition, Doppler effect' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Chemistry' AND g.name = 'Class 11'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Some Basic Concepts of Chemistry', 1, 'Mole concept, stoichiometry, concentration' FROM ids
UNION ALL SELECT sid, gid, 'Structure of Atom', 2, 'Quantum numbers, electron configuration' FROM ids
UNION ALL SELECT sid, gid, 'Classification of Elements and Periodicity', 3, 'Periodic trends, s/p/d/f blocks' FROM ids
UNION ALL SELECT sid, gid, 'Chemical Bonding and Molecular Structure', 4, 'Ionic and covalent bonds, VSEPR, hybridisation' FROM ids
UNION ALL SELECT sid, gid, 'States of Matter', 5, 'Gas laws, ideal gas equation, liquefaction' FROM ids
UNION ALL SELECT sid, gid, 'Thermodynamics', 6, 'Enthalpy, Hess law, spontaneity' FROM ids
UNION ALL SELECT sid, gid, 'Equilibrium', 7, 'Chemical equilibrium, Le Chatelier principle' FROM ids
UNION ALL SELECT sid, gid, 'Redox Reactions', 8, 'Oxidation numbers, balancing redox' FROM ids
UNION ALL SELECT sid, gid, 'Hydrogen', 9, 'Isotopes, hydrides, water hardness' FROM ids
UNION ALL SELECT sid, gid, 'The s-Block Elements', 10, 'Alkali and alkaline earth metals' FROM ids
UNION ALL SELECT sid, gid, 'The p-Block Elements', 11, 'Group 13-18 elements and compounds' FROM ids
UNION ALL SELECT sid, gid, 'Organic Chemistry: Some Basic Principles', 12, 'Hybridisation, IUPAC, isomerism' FROM ids
UNION ALL SELECT sid, gid, 'Hydrocarbons', 13, 'Alkanes, alkenes, alkynes, aromatic compounds' FROM ids
UNION ALL SELECT sid, gid, 'Environmental Chemistry', 14, 'Pollution, ozone depletion, green chemistry' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Biology' AND g.name = 'Class 11'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'The Living World', 1, 'Taxonomy, nomenclature, classification' FROM ids
UNION ALL SELECT sid, gid, 'Biological Classification', 2, 'Five-kingdom system, viruses' FROM ids
UNION ALL SELECT sid, gid, 'Plant Kingdom', 3, 'Algae, bryophytes, pteridophytes, gymnosperms' FROM ids
UNION ALL SELECT sid, gid, 'Animal Kingdom', 4, 'Phylum characteristics, chordate classification' FROM ids
UNION ALL SELECT sid, gid, 'Morphology of Flowering Plants', 5, 'Root, stem, leaf, flower, fruit, seed' FROM ids
UNION ALL SELECT sid, gid, 'Anatomy of Flowering Plants', 6, 'Tissue systems, secondary growth' FROM ids
UNION ALL SELECT sid, gid, 'Structural Organisation in Animals', 7, 'Epithelial, connective, muscular, neural tissues' FROM ids
UNION ALL SELECT sid, gid, 'Cell: The Unit of Life', 8, 'Prokaryotic and eukaryotic cells, organelles' FROM ids
UNION ALL SELECT sid, gid, 'Biomolecules', 9, 'Carbohydrates, proteins, lipids, nucleic acids' FROM ids
UNION ALL SELECT sid, gid, 'Cell Cycle and Cell Division', 10, 'Mitosis, meiosis, cell cycle regulation' FROM ids
UNION ALL SELECT sid, gid, 'Transport in Plants', 11, 'Water and mineral transport, transpiration' FROM ids
UNION ALL SELECT sid, gid, 'Mineral Nutrition', 12, 'Essential elements, nitrogen cycle' FROM ids
UNION ALL SELECT sid, gid, 'Photosynthesis in Higher Plants', 13, 'Light and dark reactions, C4 pathway' FROM ids
UNION ALL SELECT sid, gid, 'Respiration in Plants', 14, 'Glycolysis, Krebs cycle, electron transport' FROM ids
UNION ALL SELECT sid, gid, 'Plant Growth and Development', 15, 'Phytohormones, photoperiodism' FROM ids
UNION ALL SELECT sid, gid, 'Digestion and Absorption', 16, 'Alimentary canal, digestive enzymes' FROM ids
UNION ALL SELECT sid, gid, 'Breathing and Exchange of Gases', 17, 'Respiratory system, gas exchange' FROM ids
UNION ALL SELECT sid, gid, 'Body Fluids and Circulation', 18, 'Blood, heart, cardiac cycle' FROM ids
UNION ALL SELECT sid, gid, 'Excretory Products and Elimination', 19, 'Kidney structure, urine formation' FROM ids
UNION ALL SELECT sid, gid, 'Locomotion and Movement', 20, 'Skeletal and muscular systems' FROM ids
UNION ALL SELECT sid, gid, 'Neural Control and Coordination', 21, 'Neuron, CNS, reflex action' FROM ids
UNION ALL SELECT sid, gid, 'Chemical Coordination and Integration', 22, 'Hormones, endocrine glands' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Physics' AND g.name = 'Class 12'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Electric Charges and Fields', 1, 'Coulomb law, electric field, Gauss law' FROM ids
UNION ALL SELECT sid, gid, 'Electrostatic Potential and Capacitance', 2, 'Potential, capacitors, dielectrics' FROM ids
UNION ALL SELECT sid, gid, 'Current Electricity', 3, 'Ohm law, Kirchhoff rules, Wheatstone bridge' FROM ids
UNION ALL SELECT sid, gid, 'Moving Charges and Magnetism', 4, 'Biot-Savart law, Ampere law, cyclotron' FROM ids
UNION ALL SELECT sid, gid, 'Magnetism and Matter', 5, 'Magnetic materials, earth magnetism' FROM ids
UNION ALL SELECT sid, gid, 'Electromagnetic Induction', 6, 'Faraday law, Lenz law, AC generator' FROM ids
UNION ALL SELECT sid, gid, 'Alternating Current', 7, 'RMS, reactance, resonance, transformer' FROM ids
UNION ALL SELECT sid, gid, 'Electromagnetic Waves', 8, 'EM wave spectrum, properties' FROM ids
UNION ALL SELECT sid, gid, 'Ray Optics and Optical Instruments', 9, 'Reflection, refraction, optical instruments' FROM ids
UNION ALL SELECT sid, gid, 'Wave Optics', 10, 'Interference, diffraction, polarisation' FROM ids
UNION ALL SELECT sid, gid, 'Dual Nature of Radiation and Matter', 11, 'Photoelectric effect, de Broglie wavelength' FROM ids
UNION ALL SELECT sid, gid, 'Atoms', 12, 'Bohr model, atomic spectra' FROM ids
UNION ALL SELECT sid, gid, 'Nuclei', 13, 'Radioactivity, nuclear fission and fusion' FROM ids
UNION ALL SELECT sid, gid, 'Semiconductor Electronics', 14, 'Diodes, transistors, logic gates' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Chemistry' AND g.name = 'Class 12'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Solutions', 1, 'Concentration, colligative properties, Raoult law' FROM ids
UNION ALL SELECT sid, gid, 'Electrochemistry', 2, 'Galvanic cells, Nernst equation, electrolysis' FROM ids
UNION ALL SELECT sid, gid, 'Chemical Kinetics', 3, 'Rate laws, order, half-life, Arrhenius equation' FROM ids
UNION ALL SELECT sid, gid, 'The d and f Block Elements', 4, 'Transition metals, lanthanoids, actinoids' FROM ids
UNION ALL SELECT sid, gid, 'Coordination Compounds', 5, 'Ligands, Werner theory, crystal field theory' FROM ids
UNION ALL SELECT sid, gid, 'Haloalkanes and Haloarenes', 6, 'Nucleophilic substitution, elimination' FROM ids
UNION ALL SELECT sid, gid, 'Alcohols, Phenols and Ethers', 7, 'Preparation, properties, reactions' FROM ids
UNION ALL SELECT sid, gid, 'Aldehydes, Ketones and Carboxylic Acids', 8, 'Carbonyl compounds, oxidation, reduction' FROM ids
UNION ALL SELECT sid, gid, 'Amines', 9, 'Basicity, diazonium salts, identification' FROM ids
UNION ALL SELECT sid, gid, 'Biomolecules', 10, 'Carbohydrates, proteins, enzymes, vitamins' FROM ids
UNION ALL SELECT sid, gid, 'Polymers', 11, 'Addition and condensation polymers' FROM ids
UNION ALL SELECT sid, gid, 'Chemistry in Everyday Life', 12, 'Drugs, chemicals in food, cleansing agents' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Biology' AND g.name = 'Class 12'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Reproduction in Organisms', 1, 'Asexual and sexual reproduction modes' FROM ids
UNION ALL SELECT sid, gid, 'Sexual Reproduction in Flowering Plants', 2, 'Flower structure, pollination, fertilisation' FROM ids
UNION ALL SELECT sid, gid, 'Human Reproduction', 3, 'Male and female reproductive systems' FROM ids
UNION ALL SELECT sid, gid, 'Reproductive Health', 4, 'Contraception, STD, IVF, population' FROM ids
UNION ALL SELECT sid, gid, 'Principles of Inheritance and Variation', 5, 'Mendel laws, chromosomal theory' FROM ids
UNION ALL SELECT sid, gid, 'Molecular Basis of Inheritance', 6, 'DNA replication, transcription, translation' FROM ids
UNION ALL SELECT sid, gid, 'Evolution', 7, 'Darwin theory, speciation, human evolution' FROM ids
UNION ALL SELECT sid, gid, 'Human Health and Disease', 8, 'Pathogens, immunity, cancer, AIDS' FROM ids
UNION ALL SELECT sid, gid, 'Microbes in Human Welfare', 9, 'Biogas, sewage treatment, antibiotics' FROM ids
UNION ALL SELECT sid, gid, 'Biotechnology: Principles and Processes', 10, 'Genetic engineering, vectors, PCR' FROM ids
UNION ALL SELECT sid, gid, 'Biotechnology and Its Applications', 11, 'Transgenic organisms, gene therapy' FROM ids
UNION ALL SELECT sid, gid, 'Organisms and Populations', 12, 'Ecology, population interactions' FROM ids
UNION ALL SELECT sid, gid, 'Ecosystem', 13, 'Energy flow, productivity, decomposition' FROM ids
UNION ALL SELECT sid, gid, 'Biodiversity and Conservation', 14, 'Hotspots, extinction, conservation measures' FROM ids
UNION ALL SELECT sid, gid, 'Environmental Issues', 15, 'Pollution, global warming, waste management' FROM ids;

-- ============================================================================
-- 4. CHAPTERS: ENGLISH
-- ============================================================================

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'English' AND g.name = 'Class 6'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Nouns and Pronouns', 1, 'Types of nouns, personal and possessive pronouns' FROM ids
UNION ALL SELECT sid, gid, 'Verbs and Tenses', 2, 'Action verbs, simple tenses, subject-verb agreement' FROM ids
UNION ALL SELECT sid, gid, 'Adjectives and Adverbs', 3, 'Degrees of comparison, types of adverbs' FROM ids
UNION ALL SELECT sid, gid, 'Sentences and Clauses', 4, 'Types of sentences, main and subordinate clauses' FROM ids
UNION ALL SELECT sid, gid, 'Reading Comprehension', 5, 'Understanding passages, inference, vocabulary' FROM ids
UNION ALL SELECT sid, gid, 'Paragraph Writing', 6, 'Topic sentence, supporting details, conclusion' FROM ids
UNION ALL SELECT sid, gid, 'Story Writing', 7, 'Plot, characters, setting, narrative structure' FROM ids
UNION ALL SELECT sid, gid, 'Poetry Appreciation', 8, 'Rhyme, rhythm, imagery, figures of speech' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'English' AND g.name = 'Class 7'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Articles and Determiners', 1, 'Definite and indefinite articles, quantifiers' FROM ids
UNION ALL SELECT sid, gid, 'Prepositions and Conjunctions', 2, 'Types of prepositions, conjunctions' FROM ids
UNION ALL SELECT sid, gid, 'Active and Passive Voice', 3, 'Transformation between active and passive' FROM ids
UNION ALL SELECT sid, gid, 'Direct and Indirect Speech', 4, 'Reporting statements, questions, commands' FROM ids
UNION ALL SELECT sid, gid, 'Comprehension and Analysis', 5, 'Critical reading, character analysis, theme' FROM ids
UNION ALL SELECT sid, gid, 'Essay Writing', 6, 'Structure, thesis statement, argument development' FROM ids
UNION ALL SELECT sid, gid, 'Letter Writing', 7, 'Formal and informal letters, email etiquette' FROM ids
UNION ALL SELECT sid, gid, 'Grammar and Usage', 8, 'Common errors, idioms, phrasal verbs' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'English' AND g.name = 'Class 8'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Conditional Sentences', 1, 'Zero, first, second and third conditionals' FROM ids
UNION ALL SELECT sid, gid, 'Modals', 2, 'Can, could, may, might, must, should, would' FROM ids
UNION ALL SELECT sid, gid, 'Relative Clauses', 3, 'Defining and non-defining relative clauses' FROM ids
UNION ALL SELECT sid, gid, 'Reported Speech Advanced', 4, 'Complex reporting, tense changes in narration' FROM ids
UNION ALL SELECT sid, gid, 'Analytical Reading', 5, 'Comparing texts, author purpose, bias detection' FROM ids
UNION ALL SELECT sid, gid, 'Report Writing', 6, 'Newspaper reports, factual descriptions' FROM ids
UNION ALL SELECT sid, gid, 'Dialogue Writing', 7, 'Conversation structure, punctuation in dialogue' FROM ids
UNION ALL SELECT sid, gid, 'Vocabulary Building', 8, 'Synonyms, antonyms, one-word substitutions' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'English' AND g.name IN ('Class 9','Class 10')
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Tenses and Their Usage', 1, 'Complete tense system, sequence of tenses' FROM ids
UNION ALL SELECT sid, gid, 'Voice and Narration', 2, 'Advanced passive, mixed reported speech' FROM ids
UNION ALL SELECT sid, gid, 'Clauses and Complex Sentences', 3, 'Noun, adjective and adverb clauses' FROM ids
UNION ALL SELECT sid, gid, 'Transformation of Sentences', 4, 'Simple, compound and complex sentences' FROM ids
UNION ALL SELECT sid, gid, 'Reading for Comprehension', 5, 'Inferential and evaluative comprehension' FROM ids
UNION ALL SELECT sid, gid, 'Formal Writing', 6, 'Article, speech, debate, formal letter' FROM ids
UNION ALL SELECT sid, gid, 'Creative Writing', 7, 'Descriptive, narrative and persuasive essays' FROM ids
UNION ALL SELECT sid, gid, 'Literary Analysis', 8, 'Character, theme, symbolism in prose and poetry' FROM ids
UNION ALL SELECT sid, gid, 'Grammar Integration', 9, 'Editing, omission, gap filling exercises' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'English' AND g.name IN ('Class 11','Class 12')
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Reading Comprehension Advanced', 1, 'Unseen passages, note-making, summarising' FROM ids
UNION ALL SELECT sid, gid, 'Advanced Writing Skills', 2, 'Debate, article, report, letter, speech' FROM ids
UNION ALL SELECT sid, gid, 'Grammar for Communication', 3, 'Error correction, rephrasing, transformation' FROM ids
UNION ALL SELECT sid, gid, 'Prose Analysis', 4, 'Thematic analysis, character study, context' FROM ids
UNION ALL SELECT sid, gid, 'Poetry Analysis', 5, 'Meter, rhyme scheme, poetic devices, interpretation' FROM ids
UNION ALL SELECT sid, gid, 'Drama Study', 6, 'Plot, dialogue, stagecraft, character development' FROM ids
UNION ALL SELECT sid, gid, 'Literary Criticism', 7, 'Critical perspectives, comparative analysis' FROM ids
UNION ALL SELECT sid, gid, 'Creative Expression', 8, 'Imaginative writing, travelogue, memoir' FROM ids;

-- ============================================================================
-- 5. CHAPTERS: HISTORY
-- ============================================================================

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'History' AND g.name = 'Class 6'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'What, Where, How and When', 1, 'Introduction to historical sources and timelines' FROM ids
UNION ALL SELECT sid, gid, 'From Hunting-Gathering to Growing Food', 2, 'Neolithic revolution, early farming communities' FROM ids
UNION ALL SELECT sid, gid, 'In the Earliest Cities', 3, 'Indus Valley civilisation, urban planning' FROM ids
UNION ALL SELECT sid, gid, 'What Books and Burials Tell Us', 4, 'Vedic period, megalithic cultures' FROM ids
UNION ALL SELECT sid, gid, 'Kingdoms, Kings and an Early Republic', 5, 'Mahajanapadas, rise of Magadha' FROM ids
UNION ALL SELECT sid, gid, 'New Questions and Ideas', 6, 'Buddhism, Jainism, Upanishadic thought' FROM ids
UNION ALL SELECT sid, gid, 'Ashoka, The Emperor Who Gave Up War', 7, 'Mauryan empire, Ashoka dhamma' FROM ids
UNION ALL SELECT sid, gid, 'Vital Villages, Thriving Towns', 8, 'Post-Mauryan economy, trade and guilds' FROM ids
UNION ALL SELECT sid, gid, 'Traders, Kings and Pilgrims', 9, 'Silk route, South Indian kingdoms' FROM ids
UNION ALL SELECT sid, gid, 'New Empires and Kingdoms', 10, 'Gupta empire, Harsha, Chalukyas, Pallavas' FROM ids
UNION ALL SELECT sid, gid, 'Buildings, Paintings and Books', 11, 'Art, architecture and literature of ancient India' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'History' AND g.name = 'Class 7'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Tracing Changes Through a Thousand Years', 1, 'Medieval period, sources and historiography' FROM ids
UNION ALL SELECT sid, gid, 'New Kings and Kingdoms', 2, 'Rajput kingdoms, Cholas, Palas' FROM ids
UNION ALL SELECT sid, gid, 'The Delhi Sultans', 3, 'Delhi Sultanate, administration and architecture' FROM ids
UNION ALL SELECT sid, gid, 'The Mughal Empire', 4, 'Mughal rulers, administration, culture' FROM ids
UNION ALL SELECT sid, gid, 'Rulers and Buildings', 5, 'Temple and mosque architecture, forts' FROM ids
UNION ALL SELECT sid, gid, 'Towns, Traders and Craftspersons', 6, 'Medieval trade, guilds, urban centres' FROM ids
UNION ALL SELECT sid, gid, 'Tribes, Nomads and Settled Communities', 7, 'Tribal societies, forest kingdoms' FROM ids
UNION ALL SELECT sid, gid, 'Devotional Paths to the Divine', 8, 'Bhakti and Sufi movements' FROM ids
UNION ALL SELECT sid, gid, 'The Making of Regional Cultures', 9, 'Regional languages, art forms, identities' FROM ids
UNION ALL SELECT sid, gid, 'Eighteenth-Century Political Formations', 10, 'Decline of Mughals, rise of regional powers' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'History' AND g.name = 'Class 8'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'How, When and Where', 1, 'Modern period sources, periodisation' FROM ids
UNION ALL SELECT sid, gid, 'From Trade to Territory', 2, 'East India Company expansion in India' FROM ids
UNION ALL SELECT sid, gid, 'Ruling the Countryside', 3, 'Revenue systems, indigo plantation' FROM ids
UNION ALL SELECT sid, gid, 'Tribals, Dikus and the Vision of a Golden Age', 4, 'Tribal revolts, forest laws' FROM ids
UNION ALL SELECT sid, gid, 'When People Rebel', 5, 'Revolt of 1857, causes and aftermath' FROM ids
UNION ALL SELECT sid, gid, 'Weavers, Iron Smelters and Factory Owners', 6, 'Deindustrialisation, textile industry' FROM ids
UNION ALL SELECT sid, gid, 'Civilising the Native, Educating the Nation', 7, 'British education policy, debate' FROM ids
UNION ALL SELECT sid, gid, 'Women, Caste and Reform', 8, 'Social reform movements, women rights' FROM ids
UNION ALL SELECT sid, gid, 'The Making of the National Movement', 9, 'Indian National Congress, Gandhian phase' FROM ids
UNION ALL SELECT sid, gid, 'India After Independence', 10, 'Partition, constitution, nation building' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'History' AND g.name = 'Class 9'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'The French Revolution', 1, 'Causes, events, legacy of the French Revolution' FROM ids
UNION ALL SELECT sid, gid, 'Socialism in Europe and the Russian Revolution', 2, 'Marxist ideology, Bolshevik revolution' FROM ids
UNION ALL SELECT sid, gid, 'Nazism and the Rise of Hitler', 3, 'Weimar Republic, Nazi ideology, WWII' FROM ids
UNION ALL SELECT sid, gid, 'Forest Society and Colonialism', 4, 'Colonial forestry, deforestation in India' FROM ids
UNION ALL SELECT sid, gid, 'Pastoralists in the Modern World', 5, 'Pastoral communities, colonial regulation' FROM ids
UNION ALL SELECT sid, gid, 'Peasants and Farmers', 6, 'Agricultural changes, rural transformation' FROM ids
UNION ALL SELECT sid, gid, 'History and Sport: The Story of Cricket', 7, 'Evolution of modern sports' FROM ids
UNION ALL SELECT sid, gid, 'Clothing: A Social History', 8, 'Fashion, identity, social change' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'History' AND g.name = 'Class 10'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'The Rise of Nationalism in Europe', 1, 'Nation-states, unification, nationalism' FROM ids
UNION ALL SELECT sid, gid, 'Nationalism in India', 2, 'Non-cooperation, civil disobedience, Quit India' FROM ids
UNION ALL SELECT sid, gid, 'The Making of a Global World', 3, 'Globalisation, world wars, interwar economy' FROM ids
UNION ALL SELECT sid, gid, 'The Age of Industrialisation', 4, 'Industrial Revolution, factories, labour' FROM ids
UNION ALL SELECT sid, gid, 'Print Culture and the Modern World', 5, 'Printing press, public sphere, debates' FROM ids
UNION ALL SELECT sid, gid, 'Novels, Society and History', 6, 'Novel as social commentary, realism' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'History' AND g.name = 'Class 11'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Writing and City Life', 1, 'Mesopotamian civilisation, cuneiform' FROM ids
UNION ALL SELECT sid, gid, 'An Empire Across Three Continents', 2, 'Roman Empire, administration, society' FROM ids
UNION ALL SELECT sid, gid, 'Nomadic Empires', 3, 'Mongol empire, Genghis Khan legacy' FROM ids
UNION ALL SELECT sid, gid, 'The Three Orders', 4, 'Feudal society, clergy, nobility, peasantry' FROM ids
UNION ALL SELECT sid, gid, 'Changing Cultural Traditions', 5, 'Renaissance, humanism, scientific revolution' FROM ids
UNION ALL SELECT sid, gid, 'Confrontation of Cultures', 6, 'European exploration, colonisation of Americas' FROM ids
UNION ALL SELECT sid, gid, 'The Industrial Revolution', 7, 'Industrialisation, capitalism, social change' FROM ids
UNION ALL SELECT sid, gid, 'Paths to Modernisation', 8, 'Japan, China, and Russia modernisation' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'History' AND g.name = 'Class 12'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Bricks, Beads and Bones', 1, 'Harappan civilisation, archaeology' FROM ids
UNION ALL SELECT sid, gid, 'Kings, Farmers and Towns', 2, 'Early states, agrarian economy, urban centres' FROM ids
UNION ALL SELECT sid, gid, 'Kinship, Caste and Class', 3, 'Social hierarchies, family structures' FROM ids
UNION ALL SELECT sid, gid, 'Thinkers, Beliefs and Buildings', 4, 'Buddhist and Jain traditions, architecture' FROM ids
UNION ALL SELECT sid, gid, 'Through the Eyes of Travellers', 5, 'Medieval travel accounts, cultural encounters' FROM ids
UNION ALL SELECT sid, gid, 'Bhakti-Sufi Traditions', 6, 'Syncretic traditions, religious movements' FROM ids
UNION ALL SELECT sid, gid, 'An Imperial Capital: Vijayanagara', 7, 'Vijayanagara empire, urban planning' FROM ids
UNION ALL SELECT sid, gid, 'Peasants, Zamindars and the State', 8, 'Mughal agrarian system, revenue' FROM ids
UNION ALL SELECT sid, gid, 'Kings and Chronicles', 9, 'Mughal court, chronicles, court culture' FROM ids
UNION ALL SELECT sid, gid, 'Colonialism and the Countryside', 10, 'Revenue settlements, agrarian unrest' FROM ids
UNION ALL SELECT sid, gid, 'Rebels and the Raj', 11, '1857 revolt, representations, aftermath' FROM ids
UNION ALL SELECT sid, gid, 'Colonial Cities', 12, 'Urban planning, architecture under colonial rule' FROM ids
UNION ALL SELECT sid, gid, 'Mahatma Gandhi and the Nationalist Movement', 13, 'Gandhian philosophy, mass nationalism' FROM ids
UNION ALL SELECT sid, gid, 'Understanding Partition', 14, 'Partition, communalism, migration' FROM ids
UNION ALL SELECT sid, gid, 'Framing the Constitution', 15, 'Constituent Assembly, constitution debates' FROM ids;

-- ============================================================================
-- 6. CHAPTERS: GEOGRAPHY
-- ============================================================================

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Geography' AND g.name = 'Class 6'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'The Earth in the Solar System', 1, 'Planets, moon, asteroids, galaxy' FROM ids
UNION ALL SELECT sid, gid, 'Globe: Latitudes and Longitudes', 2, 'Coordinate system, time zones' FROM ids
UNION ALL SELECT sid, gid, 'Motions of the Earth', 3, 'Rotation, revolution, seasons' FROM ids
UNION ALL SELECT sid, gid, 'Maps', 4, 'Types of maps, scale, directions' FROM ids
UNION ALL SELECT sid, gid, 'Major Domains of the Earth', 5, 'Lithosphere, atmosphere, hydrosphere, biosphere' FROM ids
UNION ALL SELECT sid, gid, 'Major Landforms of the Earth', 6, 'Mountains, plateaus, plains' FROM ids
UNION ALL SELECT sid, gid, 'Our Country India', 7, 'Location, physical divisions, neighbours' FROM ids
UNION ALL SELECT sid, gid, 'India: Climate, Vegetation and Wildlife', 8, 'Climate zones, forests, biodiversity' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Geography' AND g.name = 'Class 7'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Environment', 1, 'Natural and human environment, ecosystems' FROM ids
UNION ALL SELECT sid, gid, 'Inside Our Earth', 2, 'Earth interior, rocks, minerals' FROM ids
UNION ALL SELECT sid, gid, 'Our Changing Earth', 3, 'Plate tectonics, earthquakes, volcanoes' FROM ids
UNION ALL SELECT sid, gid, 'Air', 4, 'Atmosphere structure, weather and climate' FROM ids
UNION ALL SELECT sid, gid, 'Water', 5, 'Hydrological cycle, oceans, currents' FROM ids
UNION ALL SELECT sid, gid, 'Natural Vegetation and Wildlife', 6, 'Forest types, wildlife conservation' FROM ids
UNION ALL SELECT sid, gid, 'Human Environment: Settlement and Transport', 7, 'Settlements, transport, communication' FROM ids
UNION ALL SELECT sid, gid, 'Human Environment Interactions', 8, 'Life in Amazon, Ganga Brahmaputra basin' FROM ids
UNION ALL SELECT sid, gid, 'Life in Deserts', 9, 'Sahara and Ladakh desert adaptation' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Geography' AND g.name = 'Class 8'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Resources', 1, 'Types of resources, conservation' FROM ids
UNION ALL SELECT sid, gid, 'Land, Soil, Water, Natural Vegetation', 2, 'Resource degradation, conservation measures' FROM ids
UNION ALL SELECT sid, gid, 'Mineral and Power Resources', 3, 'Types of minerals, energy sources' FROM ids
UNION ALL SELECT sid, gid, 'Agriculture', 4, 'Types of farming, major crops' FROM ids
UNION ALL SELECT sid, gid, 'Industries', 5, 'Types of industries, industrial regions' FROM ids
UNION ALL SELECT sid, gid, 'Human Resources', 6, 'Population distribution, density, migration' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Geography' AND g.name = 'Class 9'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'India: Size and Location', 1, 'Geographic extent, strategic importance' FROM ids
UNION ALL SELECT sid, gid, 'Physical Features of India', 2, 'Himalayas, plains, plateaus, coastal areas' FROM ids
UNION ALL SELECT sid, gid, 'Drainage', 3, 'River systems, lakes, water resources' FROM ids
UNION ALL SELECT sid, gid, 'Climate', 4, 'Monsoon mechanism, seasons, climate regions' FROM ids
UNION ALL SELECT sid, gid, 'Natural Vegetation and Wildlife', 5, 'Forest types, wildlife sanctuaries' FROM ids
UNION ALL SELECT sid, gid, 'Population', 6, 'Distribution, density, growth, composition' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Geography' AND g.name = 'Class 10'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Resources and Development', 1, 'Resource planning, land use, soil conservation' FROM ids
UNION ALL SELECT sid, gid, 'Forest and Wildlife Resources', 2, 'Biodiversity, conservation, community involvement' FROM ids
UNION ALL SELECT sid, gid, 'Water Resources', 3, 'Water scarcity, irrigation, rainwater harvesting' FROM ids
UNION ALL SELECT sid, gid, 'Agriculture', 4, 'Cropping patterns, technological reforms' FROM ids
UNION ALL SELECT sid, gid, 'Minerals and Energy Resources', 5, 'Types, distribution, conservation' FROM ids
UNION ALL SELECT sid, gid, 'Manufacturing Industries', 6, 'Industrial location, agro-industries' FROM ids
UNION ALL SELECT sid, gid, 'Lifelines of National Economy', 7, 'Transport, communication, trade' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Geography' AND g.name = 'Class 11'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Geography as a Discipline', 1, 'Scope, branches, relevance' FROM ids
UNION ALL SELECT sid, gid, 'The Origin and Evolution of the Earth', 2, 'Theories of origin, geological time scale' FROM ids
UNION ALL SELECT sid, gid, 'Interior of the Earth', 3, 'Earthquakes, volcanoes, earth structure' FROM ids
UNION ALL SELECT sid, gid, 'Distribution of Oceans and Continents', 4, 'Continental drift, plate tectonics' FROM ids
UNION ALL SELECT sid, gid, 'Geomorphic Processes', 5, 'Endogenic and exogenic processes' FROM ids
UNION ALL SELECT sid, gid, 'Landforms and Their Evolution', 6, 'Fluvial, aeolian, glacial, karst landforms' FROM ids
UNION ALL SELECT sid, gid, 'Composition and Structure of Atmosphere', 7, 'Layers, gases, temperature structure' FROM ids
UNION ALL SELECT sid, gid, 'Solar Radiation, Heat Balance and Temperature', 8, 'Insolation, heat budget, temperature' FROM ids
UNION ALL SELECT sid, gid, 'Atmospheric Circulation and Weather Systems', 9, 'Pressure systems, winds, cyclones' FROM ids
UNION ALL SELECT sid, gid, 'Water in the Atmosphere', 10, 'Humidity, precipitation, clouds' FROM ids
UNION ALL SELECT sid, gid, 'World Climate and Climate Change', 11, 'Climate classification, global warming' FROM ids
UNION ALL SELECT sid, gid, 'Ocean Water and Ocean Currents', 12, 'Salinity, waves, tides, currents' FROM ids
UNION ALL SELECT sid, gid, 'Life on the Earth', 13, 'Ecosystems, biomes, biodiversity' FROM ids
UNION ALL SELECT sid, gid, 'Biodiversity and Conservation', 14, 'Threats, protected areas, conservation' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Geography' AND g.name = 'Class 12'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Human Geography: Nature and Scope', 1, 'Definitions, approaches, relevance' FROM ids
UNION ALL SELECT sid, gid, 'The World Population Distribution', 2, 'Distribution, density, growth, migration' FROM ids
UNION ALL SELECT sid, gid, 'Population Composition', 3, 'Age-sex pyramid, literacy, workforce' FROM ids
UNION ALL SELECT sid, gid, 'Human Development', 4, 'HDI, indicators, spatial patterns' FROM ids
UNION ALL SELECT sid, gid, 'Primary Activities', 5, 'Hunting, farming, mining, fishing' FROM ids
UNION ALL SELECT sid, gid, 'Secondary Activities', 6, 'Manufacturing, industries, industrial regions' FROM ids
UNION ALL SELECT sid, gid, 'Tertiary and Quaternary Activities', 7, 'Services, IT, research, outsourcing' FROM ids
UNION ALL SELECT sid, gid, 'Transport and Communication', 8, 'Land, water, air transport, networks' FROM ids
UNION ALL SELECT sid, gid, 'International Trade', 9, 'Trade patterns, WTO, trade blocs' FROM ids
UNION ALL SELECT sid, gid, 'Human Settlements', 10, 'Rural and urban settlements, morphology' FROM ids
UNION ALL SELECT sid, gid, 'Population of India', 11, 'Census, demographic profile, policies' FROM ids
UNION ALL SELECT sid, gid, 'Migration in India', 12, 'Types, causes, consequences' FROM ids
UNION ALL SELECT sid, gid, 'Human Development in India', 13, 'Regional disparities, policies' FROM ids
UNION ALL SELECT sid, gid, 'Land Resources and Agriculture', 14, 'Land use, agriculture, food security' FROM ids
UNION ALL SELECT sid, gid, 'Mineral and Energy Resources', 15, 'Distribution, mining, energy security' FROM ids
UNION ALL SELECT sid, gid, 'Planning and Sustainable Development', 16, 'Five-year plans, NITI Aayog' FROM ids
UNION ALL SELECT sid, gid, 'Transport and Communication in India', 17, 'Roads, railways, ports, telecom' FROM ids
UNION ALL SELECT sid, gid, 'International Trade in India', 18, 'Exports, imports, trade policy' FROM ids
UNION ALL SELECT sid, gid, 'Geographical Perspective on Selected Issues', 19, 'Environmental issues, disasters' FROM ids;

-- ============================================================================
-- 7. CHAPTERS: COMPUTER SCIENCE
-- ============================================================================

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Computer Science' AND g.name = 'Class 6'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Introduction to Computers', 1, 'History, types, components of computer' FROM ids
UNION ALL SELECT sid, gid, 'Input and Output Devices', 2, 'Keyboard, mouse, monitor, printer, scanner' FROM ids
UNION ALL SELECT sid, gid, 'Memory and Storage', 3, 'RAM, ROM, hard disk, SSD, cloud storage' FROM ids
UNION ALL SELECT sid, gid, 'Operating Systems', 4, 'Types, functions, Windows/Linux basics' FROM ids
UNION ALL SELECT sid, gid, 'Word Processing', 5, 'MS Word and LibreOffice Writer fundamentals' FROM ids
UNION ALL SELECT sid, gid, 'Spreadsheets', 6, 'Excel, Calc basics, formulas, charts' FROM ids
UNION ALL SELECT sid, gid, 'Presentations', 7, 'PowerPoint, Impress, slide design' FROM ids
UNION ALL SELECT sid, gid, 'Internet and Email', 8, 'WWW, browsers, search engines, email etiquette' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Computer Science' AND g.name = 'Class 7'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Number Systems', 1, 'Binary, octal, hexadecimal, conversions' FROM ids
UNION ALL SELECT sid, gid, 'Computer Languages', 2, 'Machine language, assembly, high-level languages' FROM ids
UNION ALL SELECT sid, gid, 'Introduction to Programming', 3, 'Algorithms, flowcharts, pseudocode' FROM ids
UNION ALL SELECT sid, gid, 'HTML Basics', 4, 'Tags, structure, formatting, links, images' FROM ids
UNION ALL SELECT sid, gid, 'Cyber Safety', 5, 'Online threats, passwords, digital footprint' FROM ids
UNION ALL SELECT sid, gid, 'Database Concepts', 6, 'Tables, records, fields, primary key' FROM ids
UNION ALL SELECT sid, gid, 'Multimedia', 7, 'Graphics, audio, video, animation' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Computer Science' AND g.name = 'Class 8'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Programming in Python', 1, 'Variables, data types, input/output, operators' FROM ids
UNION ALL SELECT sid, gid, 'Control Structures', 2, 'If-else, loops, nested structures' FROM ids
UNION ALL SELECT sid, gid, 'Functions', 3, 'Defining functions, parameters, return values' FROM ids
UNION ALL SELECT sid, gid, 'Lists and Tuples', 4, 'Creation, indexing, slicing, methods' FROM ids
UNION ALL SELECT sid, gid, 'Dictionaries and Sets', 5, 'Key-value pairs, set operations' FROM ids
UNION ALL SELECT sid, gid, 'Introduction to SQL', 6, 'SELECT, INSERT, UPDATE, DELETE queries' FROM ids
UNION ALL SELECT sid, gid, 'App Development Basics', 7, 'UI design, event handling, simple apps' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Computer Science' AND g.name = 'Class 9'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Python Fundamentals', 1, 'Data types, operators, expressions' FROM ids
UNION ALL SELECT sid, gid, 'Strings in Python', 2, 'String methods, slicing, formatting' FROM ids
UNION ALL SELECT sid, gid, 'File Handling', 3, 'Reading and writing files, CSV' FROM ids
UNION ALL SELECT sid, gid, 'Database Connectivity', 4, 'Python-SQLite integration, CRUD' FROM ids
UNION ALL SELECT sid, gid, 'Networking Concepts', 5, 'Types of networks, IP addressing, protocols' FROM ids
UNION ALL SELECT sid, gid, 'Introduction to Artificial Intelligence', 6, 'Machine learning basics, applications' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Computer Science' AND g.name = 'Class 10'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Object-Oriented Programming in Python', 1, 'Classes, objects, inheritance, polymorphism' FROM ids
UNION ALL SELECT sid, gid, 'Data Structures', 2, 'Stacks, queues, linked lists, trees' FROM ids
UNION ALL SELECT sid, gid, 'Database Management Systems', 3, 'Normalisation, joins, transactions' FROM ids
UNION ALL SELECT sid, gid, 'Web Development', 4, 'HTML, CSS, JavaScript, responsive design' FROM ids
UNION ALL SELECT sid, gid, 'Computer Networks', 5, 'OSI model, TCP/IP, routing, security' FROM ids
UNION ALL SELECT sid, gid, 'Cyber Ethics and Security', 6, 'Ethical hacking, encryption, cyber laws' FROM ids
UNION ALL SELECT sid, gid, 'Project Work', 7, 'Planning, development, documentation' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Computer Science' AND g.name = 'Class 11'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Computer System Organisation', 1, 'CPU, memory, I/O organisation' FROM ids
UNION ALL SELECT sid, gid, 'Computational Thinking', 2, 'Problem solving, algorithmic thinking' FROM ids
UNION ALL SELECT sid, gid, 'Data Representation', 3, 'Binary arithmetic, Boolean algebra' FROM ids
UNION ALL SELECT sid, gid, 'Python Programming Advanced', 4, 'Recursion, lambda, modules, packages' FROM ids
UNION ALL SELECT sid, gid, 'Data Structures Using Python', 5, 'Stacks, queues, linked lists implementation' FROM ids
UNION ALL SELECT sid, gid, 'Database Query Using SQL', 6, 'Joins, subqueries, group by, views' FROM ids
UNION ALL SELECT sid, gid, 'Emerging Trends', 7, 'AI, IoT, cloud computing, blockchain' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Computer Science' AND g.name = 'Class 12'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Exception and File Handling in Python', 1, 'Try-except, file modes, binary files' FROM ids
UNION ALL SELECT sid, gid, 'Stack and Queue', 2, 'Implementation, applications, evaluation' FROM ids
UNION ALL SELECT sid, gid, 'Searching and Sorting', 3, 'Linear, binary search, bubble, merge, quick sort' FROM ids
UNION ALL SELECT sid, gid, 'Computer Networks', 4, 'Network devices, topologies, protocols' FROM ids
UNION ALL SELECT sid, gid, 'Database Management and SQL', 5, 'Constraints, aggregate functions, joins' FROM ids
UNION ALL SELECT sid, gid, 'Interface Python with MySQL', 6, 'Connector, cursor, parameterised queries' FROM ids
UNION ALL SELECT sid, gid, 'Society, Law and Ethics', 7, 'Data privacy, IPR, cybercrime, licensing' FROM ids;

-- ============================================================================
-- 8. CHAPTERS: HINDI
-- ============================================================================

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Hindi' AND g.name = 'Class 6'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Bhasha aur Vyakaran', 1, 'Bhasha ke roop, varnamala, shabd vichar' FROM ids
UNION ALL SELECT sid, gid, 'Sangya', 2, 'Sangya ke prakar, vikari shabd' FROM ids
UNION ALL SELECT sid, gid, 'Sarvanam', 3, 'Sarvanam ke bhed, purushvachak sarvanam' FROM ids
UNION ALL SELECT sid, gid, 'Visheshan', 4, 'Gunvachak, parimanvachak, sankhyavachak visheshan' FROM ids
UNION ALL SELECT sid, gid, 'Kriya', 5, 'Kriya ke bhed, kaal, vachya' FROM ids
UNION ALL SELECT sid, gid, 'Karak', 6, 'Karak chinh, anvay' FROM ids
UNION ALL SELECT sid, gid, 'Vachan aur Ling', 7, 'Vachan parivartan, ling niyam' FROM ids
UNION ALL SELECT sid, gid, 'Alankar', 8, 'Anupras, upama, rupak, shlesh' FROM ids
UNION ALL SELECT sid, gid, 'Patra Lekhan', 9, 'Aupcharik aur anaupcharik patra' FROM ids
UNION ALL SELECT sid, gid, 'Nibandh Lekhan', 10, 'Nibandh ke ang, vishay chayan' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Hindi' AND g.name = 'Class 7'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Pad Parichay', 1, 'Shabd bhed, padbandh' FROM ids
UNION ALL SELECT sid, gid, 'Upsarg aur Pratyay', 2, 'Upsargon ke prayog, pratyayon ke bhed' FROM ids
UNION ALL SELECT sid, gid, 'Samas', 3, 'Samas ke bhed, vigrah' FROM ids
UNION ALL SELECT sid, gid, 'Dhvani aur Varn', 4, 'Swar, vyanjan, uchcharan sthan' FROM ids
UNION ALL SELECT sid, gid, 'Viram Chinh', 5, 'Viram chinhon ka prayog' FROM ids
UNION ALL SELECT sid, gid, 'Muhavare aur Lokoktiyan', 6, 'Arth aur prayog' FROM ids
UNION ALL SELECT sid, gid, 'Sanvad Lekhan', 7, 'Sanvad shaili, abhinay' FROM ids
UNION ALL SELECT sid, gid, 'Kahani Lekhan', 8, 'Kahani tatva, kathanak, charitra' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Hindi' AND g.name = 'Class 8'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Vakya Rachna aur Arth', 1, 'Arth ke aadhar par vakya bhed' FROM ids
UNION ALL SELECT sid, gid, 'Ras', 2, 'Navras, ras ke ang' FROM ids
UNION ALL SELECT sid, gid, 'Chhand', 3, 'Matrik aur varnik chhand' FROM ids
UNION ALL SELECT sid, gid, 'Padya Parichay', 4, 'Kavya ke bhed, reeti kaal' FROM ids
UNION ALL SELECT sid, gid, 'Gadya Parichay', 5, 'Nibandh, kahani, natak, upanyas' FROM ids
UNION ALL SELECT sid, gid, 'Anuched Lekhan', 6, 'Anuched sanrachna, vichar vistar' FROM ids
UNION ALL SELECT sid, gid, 'Vigyaapan Lekhan', 7, 'Vigyaapan ke prakar, bhasha shaili' FROM ids
UNION ALL SELECT sid, gid, 'Sankshepan', 8, 'Gadyansh ka sankshepan, shirshak' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Hindi' AND g.name = 'Class 9'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Gadya Sahitya', 1, 'Gadyansh avabodh, prashnottar' FROM ids
UNION ALL SELECT sid, gid, 'Padya Sahitya', 2, 'Kavyansh avabodh, vyakhya' FROM ids
UNION ALL SELECT sid, gid, 'Vyakaran Abhyas', 3, 'Sandhi, samas, upsarg, pratyay' FROM ids
UNION ALL SELECT sid, gid, 'Rachnatmak Lekhan', 4, 'Vigyaapan, sanvad, kahani, anuched' FROM ids
UNION ALL SELECT sid, gid, 'Patra aur Aavedan', 5, 'Aupcharik patra, prarthana patra' FROM ids
UNION ALL SELECT sid, gid, 'Apathit Bodh', 6, 'Gadyansh aur padyansh par aadharit prashn' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Hindi' AND g.name = 'Class 10'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Gadya Khand', 1, 'Gadya pathon ka sampurn adhyayan' FROM ids
UNION ALL SELECT sid, gid, 'Padya Khand', 2, 'Kavya pathon ka sampurn adhyayan' FROM ids
UNION ALL SELECT sid, gid, 'Vyakaran aur Rachna', 3, 'Sampurn vyakaran, rachnatmak lekhan' FROM ids
UNION ALL SELECT sid, gid, 'Patra aur Email', 4, 'Aupcharik patra, email lekhan' FROM ids
UNION ALL SELECT sid, gid, 'Apathit Gadyansh', 5, 'Bodh prashn, shirshak, sankshepan' FROM ids
UNION ALL SELECT sid, gid, 'Apathit Padyansh', 6, 'Kavya bodh, vyakhya, alankar' FROM ids
UNION ALL SELECT sid, gid, 'Nibandh Lekhan', 7, 'Vicharatmak, varnanatmak nibandh' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Hindi' AND g.name IN ('Class 11','Class 12')
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Gadya Sahitya ka Itihas', 1, 'Hindi gadya ki vidhayen aur vikas' FROM ids
UNION ALL SELECT sid, gid, 'Kavya Sahitya ka Itihas', 2, 'Kavya dharayen, reetikal, adhunik kal' FROM ids
UNION ALL SELECT sid, gid, 'Nibandh Sahitya', 3, 'Nibandhakar, nibandh shailiyan' FROM ids
UNION ALL SELECT sid, gid, 'Kahani aur Upanyas', 4, 'Kahani tatva, upanyas samiksha' FROM ids
UNION ALL SELECT sid, gid, 'Natak aur Ekanki', 5, 'Natyatva, abhinay shaili' FROM ids
UNION ALL SELECT sid, gid, 'Bhasha Vigyaan', 6, 'Bhasha parivar, dhvani parivartan' FROM ids
UNION ALL SELECT sid, gid, 'Anuvad Abhyas', 7, 'Hindi-Angrezi anuvad ke siddhant' FROM ids;

-- ============================================================================
-- 9. CHAPTERS: ECONOMICS (11-12)
-- ============================================================================

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Economics' AND g.name = 'Class 11'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Introduction to Microeconomics', 1, 'Scarcity, choice, opportunity cost' FROM ids
UNION ALL SELECT sid, gid, 'Consumer Behaviour and Demand', 2, 'Utility analysis, indifference curves' FROM ids
UNION ALL SELECT sid, gid, 'Theory of Demand and Supply', 3, 'Law of demand, elasticity, market equilibrium' FROM ids
UNION ALL SELECT sid, gid, 'Production and Costs', 4, 'Production function, returns to scale, cost curves' FROM ids
UNION ALL SELECT sid, gid, 'Market Structures', 5, 'Perfect competition, monopoly, monopolistic competition' FROM ids
UNION ALL SELECT sid, gid, 'National Income Accounting', 6, 'GDP, GNP, income methods, circular flow' FROM ids
UNION ALL SELECT sid, gid, 'Money and Banking', 7, 'Functions of money, commercial and central bank' FROM ids
UNION ALL SELECT sid, gid, 'Government Budget and the Economy', 8, 'Budget components, fiscal policy' FROM ids
UNION ALL SELECT sid, gid, 'Balance of Payments', 9, 'Current account, capital account, exchange rate' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Economics' AND g.name = 'Class 12'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Macroeconomics: Basic Concepts', 1, 'Circular flow, stock and flow, aggregates' FROM ids
UNION ALL SELECT sid, gid, 'National Income and Related Aggregates', 2, 'GDP, NDP, GNP, NNP computation' FROM ids
UNION ALL SELECT sid, gid, 'Money and Banking', 3, 'Money supply, credit creation, monetary policy' FROM ids
UNION ALL SELECT sid, gid, 'Determination of Income and Employment', 4, 'Keynesian theory, multiplier, AD-AS' FROM ids
UNION ALL SELECT sid, gid, 'Government Budget and Economy', 5, 'Revenue and capital budget, deficit measures' FROM ids
UNION ALL SELECT sid, gid, 'Open Economy Macroeconomics', 6, 'Forex market, BOP, exchange rate systems' FROM ids
UNION ALL SELECT sid, gid, 'Indian Economy on the Eve of Independence', 7, 'Colonial economy, agriculture, industry' FROM ids
UNION ALL SELECT sid, gid, 'Indian Economy 1950-1990', 8, 'Planning, industrial policy, green revolution' FROM ids
UNION ALL SELECT sid, gid, 'Liberalisation, Privatisation and Globalisation', 9, '1991 reforms, economic impact' FROM ids
UNION ALL SELECT sid, gid, 'Poverty and Human Capital Formation', 10, 'Poverty estimates, human capital formation' FROM ids
UNION ALL SELECT sid, gid, 'Rural Development', 11, 'Credit, marketing, diversification' FROM ids
UNION ALL SELECT sid, gid, 'Employment and Infrastructure', 12, 'Employment trends, infrastructure sectors' FROM ids
UNION ALL SELECT sid, gid, 'Environment and Sustainable Development', 13, 'Carrying capacity, sustainable strategies' FROM ids
UNION ALL SELECT sid, gid, 'Development Experience of India', 14, 'Comparative study with China and Pakistan' FROM ids;

-- ============================================================================
-- 10. CHAPTERS: POLITICAL SCIENCE (11-12)
-- ============================================================================

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Political Science' AND g.name = 'Class 11'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Constitution: Why and How', 1, 'Constitution making, philosophy, features' FROM ids
UNION ALL SELECT sid, gid, 'Rights in the Indian Constitution', 2, 'Fundamental rights, directive principles, duties' FROM ids
UNION ALL SELECT sid, gid, 'Election and Representation', 3, 'Electoral system, representation, reforms' FROM ids
UNION ALL SELECT sid, gid, 'The Legislature', 4, 'Parliament, law making, committees' FROM ids
UNION ALL SELECT sid, gid, 'The Executive', 5, 'President, Prime Minister, Council of Ministers' FROM ids
UNION ALL SELECT sid, gid, 'The Judiciary', 6, 'Supreme Court, High Courts, judicial review' FROM ids
UNION ALL SELECT sid, gid, 'Federalism', 7, 'Centre-state relations, autonomy debates' FROM ids
UNION ALL SELECT sid, gid, 'Local Governments', 8, 'Panchayati Raj, municipalities, 73rd/74th amendments' FROM ids
UNION ALL SELECT sid, gid, 'Constitution as a Living Document', 9, 'Amendment process, basic structure doctrine' FROM ids
UNION ALL SELECT sid, gid, 'The Philosophy of the Constitution', 10, 'Liberty, equality, justice, secularism' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Political Science' AND g.name = 'Class 12'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'The Cold War Era and Non-Aligned Movement', 1, 'Bipolarity, NAM, disintegration of USSR' FROM ids
UNION ALL SELECT sid, gid, 'The End of Bipolarity', 2, 'Post-Cold War world, unipolarity, multipolarity' FROM ids
UNION ALL SELECT sid, gid, 'US Hegemony in World Politics', 3, 'American dominance, hard and soft power' FROM ids
UNION ALL SELECT sid, gid, 'Alternative Centres of Power', 4, 'EU, ASEAN, BRICS, rise of China' FROM ids
UNION ALL SELECT sid, gid, 'Contemporary South Asia', 5, 'SAARC, democracy in South Asia' FROM ids
UNION ALL SELECT sid, gid, 'International Organisations', 6, 'UN, WTO, IMF, World Bank, reforms' FROM ids
UNION ALL SELECT sid, gid, 'Security in the Contemporary World', 7, 'Traditional and non-traditional security' FROM ids
UNION ALL SELECT sid, gid, 'Environment and Natural Resources', 8, 'Environmental movements, resource conflicts' FROM ids
UNION ALL SELECT sid, gid, 'Globalisation', 9, 'Economic, political and cultural dimensions' FROM ids
UNION ALL SELECT sid, gid, 'Challenges of Nation Building', 10, 'Partition, integration of princely states' FROM ids
UNION ALL SELECT sid, gid, 'Planned Development', 11, 'Planning commission, mixed economy' FROM ids
UNION ALL SELECT sid, gid, 'Indias Foreign Policy', 12, 'Non-alignment, nuclear policy, regional relations' FROM ids
UNION ALL SELECT sid, gid, 'Political Parties and the Party System', 13, 'Party types, coalition politics' FROM ids
UNION ALL SELECT sid, gid, 'Social Movements in India', 14, 'Environmental, womens, dalit movements' FROM ids;

-- ============================================================================
-- 11. CHAPTERS: SANSKRIT (6-12)
-- ============================================================================

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Sanskrit' AND g.name = 'Class 6'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Varnamala aur Uchcharan', 1, 'Sanskrit varn, swar, vyanjan, uchcharan niyam' FROM ids
UNION ALL SELECT sid, gid, 'Shabd Roop', 2, 'Shabd roop: ram, bhavat, phal, nadi, mati' FROM ids
UNION ALL SELECT sid, gid, 'Dhatu Roop', 3, 'Dhatu roop: path, likh, gam, bhu in lat lakar' FROM ids
UNION ALL SELECT sid, gid, 'Vibhakti aur Vachan', 4, 'Vibhakti pratyay, ek-vachan-bahu vachan' FROM ids
UNION ALL SELECT sid, gid, 'Sarvnaam', 5, 'Sarvnaam shabd: aham, tvam, sah, sa, tat' FROM ids
UNION ALL SELECT sid, gid, 'Visheshan', 6, 'Visheshan shabd, visheshya se anvay' FROM ids
UNION ALL SELECT sid, gid, 'Karak aur Pratyay', 7, 'Karak chinh, upsarg, pratyay' FROM ids
UNION ALL SELECT sid, gid, 'Sandhi', 8, 'Swar sandhi, vyanjan sandhi, visarga sandhi' FROM ids
UNION ALL SELECT sid, gid, 'Samas', 9, 'Tatpurush, dvigu, bahuvrihi, avyayibhav' FROM ids
UNION ALL SELECT sid, gid, 'Anuvad Abhyas', 10, 'Sanskrit se Hindi anuvad, vakya rachna' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Sanskrit' AND g.name = 'Class 7'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Shabd Roop Niyam', 1, 'Sabhi shabd roop: a-kar, i-kar, u-kar, ri-kar' FROM ids
UNION ALL SELECT sid, gid, 'Dhatu Roop Kaal', 2, 'Lat, lrit, lot, lang lakar dhatu roop' FROM ids
UNION ALL SELECT sid, gid, 'Ktva aur Tumun Pratyay', 3, 'Ktva pratyay, tumun pratyay prayog' FROM ids
UNION ALL SELECT sid, gid, 'Sambandh Bodhak', 4, 'Sambandh bodhak shabd aur vakya prayog' FROM ids
UNION ALL SELECT sid, gid, 'Shabda Rupavali', 5, 'Shabda rupavali ka sampurn adhyayan' FROM ids
UNION ALL SELECT sid, gid, 'Sanskrit Gadya Path', 6, 'Gadya path ka adhyayan aur bhavarth' FROM ids
UNION ALL SELECT sid, gid, 'Sanskrit Padya Path', 7, 'Padya path: shlok ka anuvad aur vyakhya' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Sanskrit' AND g.name = 'Class 8'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Samas Ka Vistrit Adhyayan', 1, 'Sampurn samas: avvyibhav, tatpurush, dvigu, bahuvrihi' FROM ids
UNION ALL SELECT sid, gid, 'Dhatu Roop Sampurn', 2, 'Panch lakar: lat, lrit, lot, lang, vidhiling' FROM ids
UNION ALL SELECT sid, gid, 'Sanskrit Vaakya Rachna', 3, 'Shuddh vaakya rachna aur anuvad' FROM ids
UNION ALL SELECT sid, gid, 'Karak Aur Vibhakti', 4, 'Saptam vibhakti ka sampurn adhyayan' FROM ids
UNION ALL SELECT sid, gid, 'Sanskrit Gadya Manjusha', 5, 'Gadyansh avbodh aur prashnottar' FROM ids
UNION ALL SELECT sid, gid, 'Sanskrit Kavya Manjusha', 6, 'Kavyansh avbodh, shlok vyakhya' FROM ids
UNION ALL SELECT sid, gid, 'Sahityik Sanskrit', 7, 'Sahityik rachanaon ka parichay' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Sanskrit' AND g.name = 'Class 9'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Sanskrit Vangmay Ka Itihas', 1, 'Vedic evam classical Sanskrit ka parichay' FROM ids
UNION ALL SELECT sid, gid, 'Shabd Aur Dhatu Roop Sampurn', 2, 'Sampurn shabd evam dhatu roop abhyas' FROM ids
UNION ALL SELECT sid, gid, 'Sandhi Aur Samas', 3, 'Sandhi evam samas ka vistrit adhyayan' FROM ids
UNION ALL SELECT sid, gid, 'Anuvad Aur Rachna', 4, 'Sanskrit-Hindi anuvad abhyas' FROM ids
UNION ALL SELECT sid, gid, 'Gadya Sahitya', 5, 'Gadyansh avbodh, bhavarth' FROM ids
UNION ALL SELECT sid, gid, 'Padya Sahitya', 6, 'Shlok vyakhya, kavya saundarya' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Sanskrit' AND g.name = 'Class 10'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Sanskrit Vyakaran Sampurn', 1, 'Sampurn vyakaran: sandhi, samas, pratayay' FROM ids
UNION ALL SELECT sid, gid, 'Gadya Sahitya Adhyayan', 2, 'Gadyansh avbodh aur prashnottar' FROM ids
UNION ALL SELECT sid, gid, 'Padya Sahitya Adhyayan', 3, 'Shlok vyakhya aur kavya saundarya' FROM ids
UNION ALL SELECT sid, gid, 'Anuvad Aur Rachnatmak Lekhan', 4, 'Sanskrit mein anuvad evam rachna' FROM ids
UNION ALL SELECT sid, gid, 'Sahitya Aur Sanskriti', 5, 'Sanskrit sahitya mein bhartiya sanskriti' FROM ids
UNION ALL SELECT sid, gid, 'Nibandh Lekhan', 6, 'Sanskrit mein nibandh lekhan abhyas' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Sanskrit' AND g.name = 'Class 11'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Vedic Sanskrit Sahitya', 1, 'Ved, Upanishad, Vedang ka parichay' FROM ids
UNION ALL SELECT sid, gid, 'Classical Sanskrit Kavya', 2, 'Kalidasa, Bharavi, Magh, Sri Harsha' FROM ids
UNION ALL SELECT sid, gid, 'Sanskrit Natak Parampara', 3, 'Bhas, Kalidasa, Shudrak ke natak' FROM ids
UNION ALL SELECT sid, gid, 'Sanskrit Gadya Parampara', 4, 'Banabhatta, Dandin, Subandhu' FROM ids
UNION ALL SELECT sid, gid, 'Kavya Shastra', 5, 'Alankar, ras, chhand ka shastriya adhyayan' FROM ids
UNION ALL SELECT sid, gid, 'Darshanik Sanskrit', 6, 'Nyaya, Vedanta, Yoga darshan parichay' FROM ids;

WITH ids AS (
  SELECT s.id AS sid, g.id AS gid FROM public.subjects s, public.grades g
  WHERE s.name = 'Sanskrit' AND g.name = 'Class 12'
)
INSERT INTO public.chapters (subject_id, grade_id, name, display_order, description)
SELECT sid, gid, 'Sanskrit Kavya Shastra', 1, 'Alankar, ras, chhand, dhvani, vakrokti' FROM ids
UNION ALL SELECT sid, gid, 'Mahakavya Parampara', 2, 'Raghuvansh, Kiratarjuniya, Shishupalvadh' FROM ids
UNION ALL SELECT sid, gid, 'Sanskrit Gadya aur Champu', 3, 'Kadambari, Harshacharit, Champu kavya' FROM ids
UNION ALL SELECT sid, gid, 'Natak Sahitya', 4, 'Abhigyan Shakuntalam, Swapnavasavadattam' FROM ids
UNION ALL SELECT sid, gid, 'Sanskrit Vyakaran Shastra', 5, 'Panini, Patanjali, Katyayan ka yogdan' FROM ids
UNION ALL SELECT sid, gid, 'Sanskrit aur Bhartiya Darshan', 6, 'Shad darshan, Baudh aur Jain darshan' FROM ids;

-- ============================================================================
-- 12. TOPICS: Mathematics Class 10
-- ============================================================================

INSERT INTO public.topics (chapter_id, name, display_order, content_summary, learning_outcomes)
SELECT c.id, 'Geometrical Meaning of Zeros', 1,
  'Graphical representation of polynomials, zeros on graph',
  '["Find zeros from graph","Interpret number of zeros from degree","Identify polynomial type from graph"]'
FROM public.chapters c
WHERE c.name = 'Polynomials'
  AND c.subject_id = (SELECT id FROM public.subjects WHERE name = 'Mathematics')
  AND c.grade_id = (SELECT id FROM public.grades WHERE name = 'Class 10');

INSERT INTO public.topics (chapter_id, name, display_order, content_summary, learning_outcomes)
SELECT c.id, 'Relationship between Zeros and Coefficients', 2,
  'Sum and product of zeros, forming polynomials',
  '["Find sum and product of zeros","Form quadratic polynomial from zeros","Verify relationship for cubic polynomials"]'
FROM public.chapters c
WHERE c.name = 'Polynomials'
  AND c.subject_id = (SELECT id FROM public.subjects WHERE name = 'Mathematics')
  AND c.grade_id = (SELECT id FROM public.grades WHERE name = 'Class 10');

INSERT INTO public.topics (chapter_id, name, display_order, content_summary, learning_outcomes)
SELECT c.id, 'Division Algorithm for Polynomials', 3,
  'Dividing polynomials, remainder and factor theorem',
  '["Apply division algorithm","Use remainder theorem","Factorise polynomials using factor theorem"]'
FROM public.chapters c
WHERE c.name = 'Polynomials'
  AND c.subject_id = (SELECT id FROM public.subjects WHERE name = 'Mathematics')
  AND c.grade_id = (SELECT id FROM public.grades WHERE name = 'Class 10');

INSERT INTO public.topics (chapter_id, name, display_order, content_summary, learning_outcomes)
SELECT c.id, 'Graphical Method of Solving', 1,
  'Plotting equations, intersecting/parallel/coincident lines',
  '["Solve equations graphically","Identify consistent/inconsistent systems","Interpret intersection points"]'
FROM public.chapters c
WHERE c.name = 'Pair of Linear Equations'
  AND c.subject_id = (SELECT id FROM public.subjects WHERE name = 'Mathematics')
  AND c.grade_id = (SELECT id FROM public.grades WHERE name = 'Class 10');

INSERT INTO public.topics (chapter_id, name, display_order, content_summary, learning_outcomes)
SELECT c.id, 'Algebraic Methods', 2,
  'Substitution, elimination and cross-multiplication',
  '["Solve using substitution","Solve using elimination","Apply cross-multiplication formula"]'
FROM public.chapters c
WHERE c.name = 'Pair of Linear Equations'
  AND c.subject_id = (SELECT id FROM public.subjects WHERE name = 'Mathematics')
  AND c.grade_id = (SELECT id FROM public.grades WHERE name = 'Class 10');

INSERT INTO public.topics (chapter_id, name, display_order, content_summary, learning_outcomes)
SELECT c.id, 'Equations Reducible to Linear Form', 3,
  'Equations in two variables, word problems',
  '["Form equations from word problems","Solve complex word problems","Apply to real-life scenarios"]'
FROM public.chapters c
WHERE c.name = 'Pair of Linear Equations'
  AND c.subject_id = (SELECT id FROM public.subjects WHERE name = 'Mathematics')
  AND c.grade_id = (SELECT id FROM public.grades WHERE name = 'Class 10');

-- ============================================================================
-- 13. SAMPLE QUESTIONS: Class 10 Math
-- ============================================================================

INSERT INTO public.questions (topic_id, question_type, difficulty, question_text, explanation, points, is_verified)
SELECT t.id, 'mcq', 1,
  'What is the degree of the polynomial x^3 - 3x^2 + 2x - 1?',
  'The highest power of x is 3, so degree = 3.', 1, true
FROM public.topics t WHERE t.name = 'Relationship between Zeros and Coefficients';

INSERT INTO public.questions (topic_id, question_type, difficulty, question_text, explanation, points, is_verified)
SELECT t.id, 'mcq', 1,
  'How many zeros can a quadratic polynomial have at most?',
  'A quadratic polynomial has degree 2, so at most 2 zeros.', 1, true
FROM public.topics t WHERE t.name = 'Relationship between Zeros and Coefficients';

INSERT INTO public.questions (topic_id, question_type, difficulty, question_text, explanation, points, is_verified)
SELECT t.id, 'short', 2,
  'Find the zeros of the polynomial x^2 - 7x + 12.',
  'x^2 - 7x + 12 = (x-3)(x-4). Zeros are 3 and 4.', 2, true
FROM public.topics t WHERE t.name = 'Relationship between Zeros and Coefficients';

INSERT INTO public.questions (topic_id, question_type, difficulty, question_text, explanation, points, is_verified)
SELECT t.id, 'short', 2,
  'Find the sum and product of zeros of 2x^2 - 5x + 2.',
  'Sum = 5/2, Product = 1.', 2, true
FROM public.topics t WHERE t.name = 'Relationship between Zeros and Coefficients';

INSERT INTO public.questions (topic_id, question_type, difficulty, question_text, explanation, points, is_verified)
SELECT t.id, 'long', 3,
  'If alpha and beta are zeros of x^2 - 3x + 2, find alpha^2 + beta^2.',
  'alpha+beta = 3, alpha*beta = 2. alpha^2+beta^2 = (alpha+beta)^2 - 2*alpha*beta = 9 - 4 = 5.', 3, true
FROM public.topics t WHERE t.name = 'Relationship between Zeros and Coefficients';

-- MCQ options
INSERT INTO public.question_options (question_id, option_text, is_correct, display_order)
SELECT q.id, '1', false, 1 FROM public.questions q WHERE q.question_text = 'What is the degree of the polynomial x^3 - 3x^2 + 2x - 1?'
UNION ALL SELECT q.id, '2', false, 2 FROM public.questions q WHERE q.question_text = 'What is the degree of the polynomial x^3 - 3x^2 + 2x - 1?'
UNION ALL SELECT q.id, '3', true, 3 FROM public.questions q WHERE q.question_text = 'What is the degree of the polynomial x^3 - 3x^2 + 2x - 1?'
UNION ALL SELECT q.id, '4', false, 4 FROM public.questions q WHERE q.question_text = 'What is the degree of the polynomial x^3 - 3x^2 + 2x - 1?';

INSERT INTO public.question_options (question_id, option_text, is_correct, display_order)
SELECT q.id, '1', false, 1 FROM public.questions q WHERE q.question_text = 'How many zeros can a quadratic polynomial have at most?'
UNION ALL SELECT q.id, '2', true, 2 FROM public.questions q WHERE q.question_text = 'How many zeros can a quadratic polynomial have at most?'
UNION ALL SELECT q.id, '3', false, 3 FROM public.questions q WHERE q.question_text = 'How many zeros can a quadratic polynomial have at most?'
UNION ALL SELECT q.id, '4', false, 4 FROM public.questions q WHERE q.question_text = 'How many zeros can a quadratic polynomial have at most?';

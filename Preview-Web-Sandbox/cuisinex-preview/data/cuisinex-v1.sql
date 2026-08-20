-- CuisineX V1 RC1 — public SQL projection
-- Dialect: SQLite 3
-- Canonical project source:
-- https://github.com/nepheris/nLab/blob/main/Work/PRJ_Project/P019-nlab-cuisinix/data/sql/cuisinex-v1.sql
-- Public projection intentionally contains no private credentials or local paths.

PRAGMA foreign_keys = ON;

CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE recipes (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  source_project TEXT,
  title_fr TEXT NOT NULL,
  servings_ref REAL,
  servings_min REAL,
  servings_max REAL,
  scalable INTEGER NOT NULL DEFAULT 0,
  source_url TEXT
);
CREATE TABLE recipe_ingredients (
  recipe_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  role TEXT NOT NULL,
  ingredient_id TEXT,
  label_fr TEXT NOT NULL,
  mass_g REAL,
  unit TEXT NOT NULL DEFAULT 'g',
  scaling_mode TEXT NOT NULL DEFAULT 'linear',
  mapping_status TEXT,
  PRIMARY KEY (recipe_id, position),
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);
CREATE TABLE nutrition_per_100g (
  recipe_id TEXT PRIMARY KEY,
  energy_kcal REAL, protein_g REAL, carbs_g REAL, sugars_g REAL,
  fat_g REAL, saturates_g REAL, fiber_g REAL, salt_g REAL,
  completeness_pct REAL, source_status TEXT,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);
CREATE TABLE nutrition_per_serving (
  recipe_id TEXT PRIMARY KEY,
  energy_kcal REAL, protein_g REAL, carbs_g REAL, sugars_g REAL,
  fat_g REAL, saturates_g REAL, fiber_g REAL, salt_g REAL,
  mass_total_g REAL, portion_mass_g REAL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);
CREATE TABLE nutriscore (
  recipe_id TEXT PRIMARY KEY,
  algorithm_version TEXT,
  status TEXT NOT NULL,
  score INTEGER,
  letter TEXT,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);
CREATE TABLE translations (
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  field_name TEXT NOT NULL,
  lang TEXT NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY (entity_type,entity_id,field_name,lang)
);

INSERT INTO meta VALUES
('schema','cuisinex-sql@1'),
('release','V1-RC1'),
('language_master','fr'),
('languages','fr,en,es,ru,ar,ps'),
('source_note','P002 J0.5 used JSON + Markdown; P019 introduces the SQL V1 layer.');

INSERT INTO recipes VALUES
('REC-001','canonical','P019','Ganache montée Milka Oreo — crème 35 %',5,NULL,NULL,1,'https://github.com/nepheris/nLab/blob/main/Work/PRJ_Project/P019-nlab-cuisinix/mvp/authoring/fr/recipes/REC-001-ganache-milka-oreo.md'),
('REC-002','draft','P019','Ganache montée Milka Oreo — crème 30 %',NULL,NULL,NULL,0,NULL),
('REC-003','draft','P019','Mousse Milka Oreo aux œufs',NULL,NULL,NULL,0,NULL),
('REC-004','draft','P019','Duo chocolat & chantilly fouettée',NULL,NULL,NULL,0,NULL),
('REC-101','draft','P019','Glace banane — crème 35 %',NULL,NULL,NULL,0,NULL),
('REC-102','draft','P019','Glace banane — crème 30 %',NULL,NULL,NULL,0,NULL),
('REC-111','draft','P019','Sorbet prune — sirop sucre',NULL,NULL,NULL,0,NULL),
('REC-112','draft','P019','Sorbet pêche — sucre + miel',NULL,NULL,NULL,0,NULL),
('REC-201','draft','P019','Pâtes aux pleurotes, échalote et crème',NULL,NULL,NULL,0,NULL),
('CHEF-20260819-001','candidate','Chef/P002','Gratin rustique de champignons, brie et échalotes',10,6,12,1,'https://github.com/nepheris/nLab/blob/main/nLab-System/AI-Pilot-Center/Autonomous-Cockpit/Chef/Recipes/Candidates/TRIAL-001/20260819-001-gratin-champignons-brie-echalotes.json'),
('CHEF-20260819-002','candidate','Chef/P002','Velouté de pâtisson rôti',10,6,12,1,'https://github.com/nepheris/nLab/blob/main/Work/PRJ_Project/P002-recettes-du-coeur/CONVERGENCE/J0.5/source/content/fr/recipes/RDC-TEST-CHEF-20260819-002.md'),
('CHEF-20260819-003','candidate','Chef/P002','Pâtisson rôti à l''ail et aux herbes',10,6,12,1,'https://github.com/nepheris/nLab/blob/main/nLab-System/AI-Pilot-Center/Autonomous-Cockpit/Chef/Recipes/Candidates/TRIAL-001/20260819-003-patisson-roti-ail-herbes.json'),
('RDC-REC0001','reference','P002','Gratin de pâtes au thon',4,NULL,NULL,0,'https://github.com/recettesducoeur/recettesducoeur.github.io/blob/main/data/public/recettes.json'),
('RDC-REC0002','reference','P002','Riz au lait à la banane',4,NULL,NULL,0,'https://github.com/recettesducoeur/recettesducoeur.github.io/blob/main/data/public/recettes.json'),
('RDC-REC0003','reference','P002','Soupe de légumes simple',4,NULL,NULL,0,'https://github.com/recettesducoeur/recettesducoeur.github.io/blob/main/data/public/recettes.json'),
('RDC-REC0004','reference','P002','Salade de riz au thon',4,NULL,NULL,0,'https://github.com/recettesducoeur/recettesducoeur.github.io/blob/main/data/public/recettes.json'),
('RDC-REC0005','reference','P002','Poêlée de pommes de terre',4,NULL,NULL,0,'https://github.com/recettesducoeur/recettesducoeur.github.io/blob/main/data/public/recettes.json'),
('RDC-REC0006','reference','P002','Compote pomme-banane',4,NULL,NULL,0,'https://github.com/recettesducoeur/recettesducoeur.github.io/blob/main/data/public/recettes.json'),
('RDC-REC0007','reference','P002','Tartines chaudes fromage-tomate',2,NULL,NULL,0,'https://github.com/recettesducoeur/recettesducoeur.github.io/blob/main/data/public/recettes.json'),
('RDC-REC0008','reference','P002','Omelette aux légumes',2,NULL,NULL,0,'https://github.com/recettesducoeur/recettesducoeur.github.io/blob/main/data/public/recettes.json'),
('RDC-REC0009','reference','P002','Pâtes sauce tomate enrichie',4,NULL,NULL,0,'https://github.com/recettesducoeur/recettesducoeur.github.io/blob/main/data/public/recettes.json'),
('RDC-REC0010','reference','P002','Gâteau simple du placard',6,NULL,NULL,0,'https://github.com/recettesducoeur/recettesducoeur.github.io/blob/main/data/public/recettes.json'),
('RDC-REC0011','reference','P002','Tian de courgettes',4,NULL,NULL,0,'https://github.com/recettesducoeur/recettesducoeur.github.io/blob/main/data/public/recettes.json'),
('RDC-REC0012','reference','P002','Chou-fleur et quinoa à la crème',4,NULL,NULL,0,'https://github.com/recettesducoeur/recettesducoeur.github.io/blob/main/data/public/recettes.json'),
('RDC-REC0013','reference','P002','Tarte salée à la courgette',4,NULL,NULL,0,'https://github.com/recettesducoeur/recettesducoeur.github.io/blob/main/data/public/recettes.json');

INSERT INTO recipe_ingredients VALUES
('REC-001',1,'primary','PRD-MILKA-OREO','Milka Oreo',200,'g','linear','documented_product'),
('REC-001',2,'primary','PRD-CREME-UHT-35','Crème liquide entière UHT 35 % MG',300,'g','linear','documented_product'),
('CHEF-20260819-001',1,'primary','champignons-de-paris','champignons de Paris frais, parés',1200,'g','linear','a_valider'),
('CHEF-20260819-001',2,'primary','brie','brie standard, croûte comprise',350,'g','linear','a_valider'),
('CHEF-20260819-001',3,'primary','echalote','échalotes épluchées',250,'g','linear','a_valider'),
('CHEF-20260819-001',4,'secondary','creme-30','crème 30 % MG',300,'g','linear','a_valider'),
('CHEF-20260819-001',5,'secondary','beurre-82','beurre 82 % MG',40,'g','linear','a_valider'),
('CHEF-20260819-002',1,'primary','patisson','pâtisson, chair parée en morceaux',1800,'g','linear','to_verify'),
('CHEF-20260819-002',2,'primary','echalote','échalotes épluchées',180,'g','linear','to_verify'),
('CHEF-20260819-002',3,'secondary','huile-olive','huile d''olive',45,'g','linear','to_verify'),
('CHEF-20260819-002',4,'secondary','eau','eau',1400,'g','linear','to_verify'),
('CHEF-20260819-002',5,'secondary','creme-30','crème 30 % MG',250,'g','linear','to_verify'),
('CHEF-20260819-003',1,'primary','patisson','pâtisson paré, en quartiers réguliers',2000,'g','linear','a_valider'),
('CHEF-20260819-003',2,'secondary','huile-olive','huile d''olive',60,'g','linear','a_valider'),
('CHEF-20260819-003',3,'secondary','ail','ail',20,'g','linear','a_valider');

INSERT INTO nutrition_per_100g VALUES
('RDC-REC0001',161.9383,11.7156,18.2415,2.1253,4.4440,2.0464,1.1582,0.2431,100,'P002-estimated'),
('RDC-REC0002',77.3889,2.8459,13.7216,9.6224,1.2101,0.6784,0.6667,0.0657,100,'P002-estimated'),
('RDC-REC0003',16.2683,0.4888,2.7985,0.5750,0.2097,0.1093,0.6656,0.01368,66.8572,'P002-estimated-partial'),
('RDC-REC0004',111.3758,6.3526,12.4282,1.3569,3.8635,0.5541,1.1273,0.3461,100,'P002-estimated'),
('RDC-REC0005',83.4438,2.6263,14.8258,0.7026,0.8849,0.5099,2.1810,0.02049,100,'P002-estimated'),
('RDC-REC0006',55.1106,0.4366,12.6255,11.2596,0.2809,0.00894,2.2149,0.00740,100,'P002-estimated'),
('RDC-REC0007',186.7035,8.7774,14.9357,2.0556,10.0254,4.8135,1.4256,0.4665,100,'P002-estimated'),
('RDC-REC0008',84.8718,7.7112,0.6828,0.1667,5.7268,2.0440,0.00115,0.2187,50.3771,'P002-estimated-partial'),
('RDC-REC0009',165.0137,6.2124,28.5140,2.3037,2.5780,0.8198,2.0012,0.05167,100,'P002-estimated'),
('RDC-REC0010',310.4932,6.1771,41.6089,16.9614,12.9902,8.4102,0.7914,0.1325,100,'P002-estimated'),
('RDC-REC0011',35.4166,0.9576,2.8725,1.9194,2.2016,0.3232,1.1914,0.01667,100,'P002-estimated'),
('RDC-REC0012',98.5924,2.9369,9.5611,1.1312,4.9843,2.5759,1.9618,0.01717,100,'P002-estimated'),
('RDC-REC0013',154.5690,5.3941,9.0819,1.6379,10.5297,6.1928,0.9474,0.3817,100,'P002-estimated');

INSERT INTO nutriscore(recipe_id,algorithm_version,status,score,letter)
SELECT id,NULL,'non_calculable',NULL,NULL FROM recipes WHERE id LIKE 'RDC-REC%';

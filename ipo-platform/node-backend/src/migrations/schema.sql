-- ============================================================
--  IPO Platform — Full Production Schema
--  Run: mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS ipo_platform
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ipo_platform;

-- ─────────────────────────────────────────────────────────────
--  TABLE: ipos
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ipos (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  name                VARCHAR(255) NOT NULL,
  ticker              VARCHAR(30),
  sector              VARCHAR(100) NOT NULL DEFAULT 'General',

  -- Price
  price_band_min      DECIMAL(10,2) DEFAULT 0.00,
  price_band_max      DECIMAL(10,2) DEFAULT 0.00,
  price_band_display  VARCHAR(50),

  -- Market data
  gmp                 DECIMAL(10,2) DEFAULT 0.00  COMMENT 'Grey Market Premium in ₹',
  gmp_percent         VARCHAR(20),
  subscription        DECIMAL(10,2) DEFAULT 0.00  COMMENT 'e.g. 42.5 for 42.5x',

  -- Subscription breakdown (from NSE live API)
  qib_subscription    DECIMAL(10,2) DEFAULT 0.00,
  nii_subscription    DECIMAL(10,2) DEFAULT 0.00,
  retail_subscription DECIMAL(10,2) DEFAULT 0.00,
  total_subscription  DECIMAL(10,2) DEFAULT 0.00,
  sub_updated_at      TIMESTAMP NULL,

  -- Offer details
  lot_size            INT DEFAULT 0,
  open_date           DATE,
  close_date          DATE,
  listing_date        DATE,
  issue_size          VARCHAR(50),

  -- Metadata
  status              ENUM('active','upcoming','closed') DEFAULT 'upcoming',
  ai_potential        ENUM('high','moderate','low')      DEFAULT 'moderate',
  logo_url            VARCHAR(500),
  drhp_pdf_url        TEXT,
  rhp_pdf_url         TEXT,
  nse_symbol          VARCHAR(30),
  bse_code            VARCHAR(20),
  data_source         ENUM('NSE','BSE','SEBI','MANUAL')  DEFAULT 'MANUAL',
  is_active           BOOLEAN DEFAULT TRUE,

  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE  KEY uq_ipo_name   (name),
  INDEX       idx_status    (status),
  INDEX       idx_sector    (sector),
  INDEX       idx_nse       (nse_symbol),
  INDEX       idx_active    (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─────────────────────────────────────────────────────────────
--  TABLE: drhp_analyses
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS drhp_analyses (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  ipo_id              INT NOT NULL,

  -- Structured text sections
  summary             TEXT,
  financials          TEXT,
  risks               JSON     COMMENT 'string[]',
  red_flags           JSON     COMMENT 'string[]',
  outlook             TEXT,
  use_of_funds        TEXT,
  management_summary  TEXT,

  -- ML classification outputs
  sentiment           ENUM('Positive','Neutral','Negative') DEFAULT 'Neutral',
  score               DECIMAL(3,1) DEFAULT 0.0 COMMENT '0-10 scale',
  risk_level          ENUM('Low','Medium','High')           DEFAULT 'Medium',

  -- FinBERT probabilities
  finbert_positive    DECIMAL(5,4),
  finbert_negative    DECIMAL(5,4),
  finbert_neutral     DECIMAL(5,4),

  -- Feature vector (for model debugging / retraining)
  feature_vector      JSON,

  -- Pipeline metadata
  status              ENUM('pending','processing','done','failed') DEFAULT 'pending',
  error_msg           TEXT,
  model_version       VARCHAR(50) DEFAULT 'finbert-v1',
  pdf_pages           INT,
  pdf_char_count      INT,

  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (ipo_id) REFERENCES ipos(id) ON DELETE CASCADE,
  UNIQUE KEY  uq_ipo_analysis (ipo_id),
  INDEX       idx_analysis_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─────────────────────────────────────────────────────────────
--  TABLE: market_trends
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_trends (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  sector      VARCHAR(100) NOT NULL,
  change_pct  VARCHAR(20),
  trend       ENUM('up','down','flat') DEFAULT 'flat',
  volume      ENUM('High','Medium','Low') DEFAULT 'Medium',
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_sector (sector)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─────────────────────────────────────────────────────────────
--  TABLE: users
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('user','admin') DEFAULT 'user',
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─────────────────────────────────────────────────────────────
--  TABLE: watchlists
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS watchlists (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  ipo_id     INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (ipo_id)  REFERENCES ipos(id)   ON DELETE CASCADE,
  UNIQUE KEY uq_watchlist (user_id, ipo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ─────────────────────────────────────────────────────────────
--  SEED: market_trends
-- ─────────────────────────────────────────────────────────────
INSERT INTO market_trends (sector, change_pct, trend, volume) VALUES
  ('Technology',       '+1.2%',  'up',   'High'),
  ('Consumer Goods',   '-0.5%',  'down', 'Medium'),
  ('Fintech',          '+0.8%',  'up',   'High'),
  ('Healthcare',       '+0.3%',  'up',   'Medium'),
  ('Renewable Energy', '+2.1%',  'up',   'High'),
  ('Automotive',       '-1.0%',  'down', 'Low'),
  ('Banking & NBFC',   '-0.2%',  'down', 'Medium'),
  ('Real Estate',      '+0.6%',  'up',   'Low')
ON DUPLICATE KEY UPDATE
  change_pct = VALUES(change_pct),
  trend      = VALUES(trend),
  volume     = VALUES(volume),
  updated_at = NOW();


-- ─────────────────────────────────────────────────────────────
--  SEED: sample IPOs
-- ─────────────────────────────────────────────────────────────
INSERT INTO ipos (
  name, ticker, sector,
  price_band_min, price_band_max, price_band_display,
  gmp, subscription, lot_size,
  open_date, close_date, issue_size,
  status, ai_potential, data_source, drhp_pdf_url
) VALUES
(
  'TechNova Solutions Ltd', 'TECHNO', 'Technology',
  420.00, 450.00, '₹420–₹450',
  75.00, 42.30, 33,
  CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 DAY), '₹1,200 Cr',
  'active', 'high', 'MANUAL',
  'https://www.sebi.gov.in/sebi_data/attachdocs/jan-2025/1705123456789.pdf'
),
(
  'GreenEnergy Corp', 'GREENC', 'Renewable Energy',
  180.00, 190.00, '₹180–₹190',
  22.00, 18.70, 78,
  DATE_ADD(CURDATE(), INTERVAL 5 DAY), DATE_ADD(CURDATE(), INTERVAL 7 DAY), '₹800 Cr',
  'upcoming', 'moderate', 'MANUAL',
  'https://www.sebi.gov.in/sebi_data/attachdocs/jan-2025/1705987654321.pdf'
),
(
  'FinServe Holdings', 'FINSRV', 'Fintech',
  310.00, 330.00, '₹310–₹330',
  45.00, 67.50, 45,
  DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 1 DAY), '₹2,200 Cr',
  'active', 'high', 'MANUAL',
  'https://www.sebi.gov.in/sebi_data/attachdocs/feb-2025/1706123456789.pdf'
),
(
  'HealthFirst Diagnostics', 'HLTFST', 'Healthcare',
  250.00, 265.00, '₹250–₹265',
  30.00, 12.40, 56,
  DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY), '₹950 Cr',
  'upcoming', 'moderate', 'MANUAL', NULL
),
(
  'AutoDrive Systems', 'ADRVSYS', 'Automotive',
  520.00, 550.00, '₹520–₹550',
  90.00, 28.90, 27,
  DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(CURDATE(), INTERVAL 7 DAY), '₹1,750 Cr',
  'closed', 'high', 'MANUAL', NULL
)
ON DUPLICATE KEY UPDATE updated_at = NOW();

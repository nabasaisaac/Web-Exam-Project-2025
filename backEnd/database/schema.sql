CREATE DATABASE IF NOT EXISTS daystar_daycare;
USE daystar_daycare;
-- drop DATABASE daystar_daycare;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(55) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS babysitters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone_number VARCHAR(20) NOT NULL,
  nin VARCHAR(20) NOT NULL UNIQUE,
  age INT NOT NULL,
  next_of_kin_name VARCHAR(100) NOT NULL,
  next_of_kin_phone VARCHAR(20) NOT NULL,
  next_of_kin_relationship VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS children (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  age INT NOT NULL,
  parent_name VARCHAR(100) NOT NULL,
  parent_phone VARCHAR(20) NOT NULL,
  parent_email VARCHAR(100),
  special_care_needs TEXT,
  session_type ENUM('half-day', 'full-day') NOT NULL,
  assigned_babysitter_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_babysitter_id) REFERENCES babysitters(id)
);

CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  child_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('present', 'absent', 'late') NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id)
);

CREATE TABLE IF NOT EXISTS financial_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('income', 'expense') NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  reference_id INT,
  reference_type ENUM('child', 'babysitter'),
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS incident_report (
  id INT AUTO_INCREMENT PRIMARY KEY,
  child_id INT NOT NULL,
  reported_by INT NOT NULL,
  target ENUM('manager', 'parent') NOT NULL,
  incident_type VARCHAR(20),
  description TEXT NOT NULL,
  status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id),
  FOREIGN KEY (reported_by) REFERENCES users(id)
);

DROP TABLE incident_report;
-- CREATE TABLE IF NOT EXISTS parent_incident_report (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   child_id INT NOT NULL,
--   reported_by INT NOT NULL,
--   incident_type VARCHAR(20),
--   description TEXT NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (child_id) REFERENCES children(id),
--   FOREIGN KEY (reported_by) REFERENCES users(id)
-- );

-- DROP TABLE parent_incident_report;
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient_id INT NOT NULL,
  recipient_type ENUM('user', 'child') NOT NULL,
  type ENUM('payment-reminder', 'payment-overdue', 'incident-report', 'attendance-update', 'system-alert') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  status ENUM('pending', 'sent', 'read', 'failed') DEFAULT 'pending',
  read_at DATETIME,
  sent_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

SELECT * FROM babysitters;
use daystar_daycare;
select * from incident_report;
DELETE FROM users WHERE id = 1;
DELETE FROM babysitters WHERE email = 'nabasaisaac16@gmail.com';
-- ALTER TABLE users AUTO_INCREMENT = 1;

-- INSERT INTO users (username, email, password) 
-- VALUES ('NABASA ISAAC', 'nabasaisaac16@gmail.com', 'nabasaisaac16@gmail.com');



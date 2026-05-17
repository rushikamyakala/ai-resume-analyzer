-- ============================================
-- AI Resume Analyzer - Database Schema
-- MySQL 8.0+
-- ============================================

CREATE DATABASE IF NOT EXISTS resume_analyzer_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE resume_analyzer_db;

-- ── Users ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name   VARCHAR(100)        NOT NULL,
    email       VARCHAR(150)        NOT NULL UNIQUE,
    password    VARCHAR(255)        NOT NULL,
    role        ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
    created_at  DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Resumes ───────────────────────────────────
CREATE TABLE IF NOT EXISTS resumes (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_name       VARCHAR(255)    NOT NULL,
    file_path       VARCHAR(500)    NOT NULL,
    extracted_text  LONGTEXT,
    uploaded_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id         BIGINT          NOT NULL,
    CONSTRAINT fk_resumes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_resumes_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Job Descriptions ──────────────────────────
CREATE TABLE IF NOT EXISTS job_descriptions (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_title    VARCHAR(200)    NOT NULL,
    company_name VARCHAR(200)    NOT NULL,
    description  LONGTEXT        NOT NULL,
    created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id      BIGINT          NOT NULL,
    CONSTRAINT fk_jd_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_jd_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Analysis Results ──────────────────────────
CREATE TABLE IF NOT EXISTS analysis_results (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    ats_score            DOUBLE          NOT NULL,
    matched_keywords     LONGTEXT,
    missing_keywords     LONGTEXT,
    ai_suggestions       LONGTEXT,
    skills_analysis      LONGTEXT,
    analyzed_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resume_id            BIGINT          NOT NULL,
    job_description_id   BIGINT          NOT NULL,
    CONSTRAINT fk_ar_resume FOREIGN KEY (resume_id)          REFERENCES resumes(id)          ON DELETE CASCADE,
    CONSTRAINT fk_ar_jd     FOREIGN KEY (job_description_id) REFERENCES job_descriptions(id) ON DELETE CASCADE,
    INDEX idx_ar_resume (resume_id),
    INDEX idx_ar_jd     (job_description_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Seed: default admin user ──────────────────
-- Password: admin123 (BCrypt encoded)
INSERT IGNORE INTO users (full_name, email, password, role)
VALUES (
    'Admin User',
    'admin@resumeanalyzer.com',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBpwTTyPQDHJ4a',
    'ADMIN'
);

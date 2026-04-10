CREATE DATABASE IF NOT EXISTS hunar_db;
USE hunar_db;

-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Staff') DEFAULT 'Staff',
    createdAt DATETIME,
    updatedAt DATETIME
);

-- Courses Table
CREATE TABLE IF NOT EXISTS Courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    fee FLOAT NOT NULL,
    duration VARCHAR(50),
    code VARCHAR(50) NOT NULL,
    createdAt DATETIME,
    updatedAt DATETIME
);

-- Batches Table
CREATE TABLE IF NOT EXISTS Batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    courseId INT,
    time VARCHAR(50),
    meetingLink VARCHAR(255),
    FOREIGN KEY (courseId) REFERENCES Courses(id) ON DELETE CASCADE,
    createdAt DATETIME,
    updatedAt DATETIME
);

-- Students Table
CREATE TABLE IF NOT EXISTS Students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    totalFee FLOAT,
    paidAmount FLOAT DEFAULT 0,
    discount FLOAT DEFAULT 0,
    courseId INT,
    batchId INT,
    status ENUM('Active', 'Dropped', 'Completed') DEFAULT 'Active',
    FOREIGN KEY (courseId) REFERENCES Courses(id),
    FOREIGN KEY (batchId) REFERENCES Batches(id),
    createdAt DATETIME,
    updatedAt DATETIME
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS Invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    studentId INT,
    amount FLOAT,
    status ENUM('Paid', 'Unpaid', 'Partial'),
    dueDate DATE,
    FOREIGN KEY (studentId) REFERENCES Students(id)
);

-- Resources Table
CREATE TABLE IF NOT EXISTS Resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batchId INT,
    title VARCHAR(255),
    link TEXT,
    type ENUM('Recording', 'Drive', 'Notes'),
    FOREIGN KEY (batchId) REFERENCES Batches(id)
);

-- Messages Table
CREATE TABLE IF NOT EXISTS Messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batchId INT,
    sender VARCHAR(255),
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (batchId) REFERENCES Batches(id)
);
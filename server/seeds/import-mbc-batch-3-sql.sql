-- ============================================================================
-- SQL Script: Import MBC Batch 3 Students (14 Records)
-- ============================================================================
-- 
-- This SQL script inserts 14 student records directly into the database.
-- Each student has associated payment records in the JSON format used by the system.
--
-- CAUTION: Run this only AFTER you've ensured no duplicate students exist.
--
-- ============================================================================

-- Step 1: Create or get MBC Batch 3
-- NOTE: Change courseId if Medical Billing (ID: 1) is different in your database

INSERT INTO Batches (name, time, courseId, createdAt, updatedAt) 
VALUES ('MBC Batch 3', '10:00 AM - 12:00 PM', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id);

SET @batch_id = LAST_INSERT_ID();

-- ============================================================================
-- Step 2: Insert Students with Payment Records
-- ============================================================================

-- Student 1: Zeenat Bibi (28000, Full Paid)
INSERT INTO Students (name, totalFee, paidAmount, discount, totalInstallments, courseId, batchId, status, createdAt, updatedAt) 
VALUES ('Zeenat Bibi', 28000, 28000, 0, 2, 1, @batch_id, 'Active', '2025-08-01 10:00:00', '2025-08-01 10:00:00');
UPDATE Students SET payments = JSON_ARRAY(
  JSON_OBJECT('installmentNumber', 1, 'amount', 14000, 'date', '2025-08-01', 'status', 'Paid', 'datePaid', '2025-08-01'),
  JSON_OBJECT('installmentNumber', 2, 'amount', 14000, 'date', '2025-09-01', 'status', 'Paid', 'datePaid', '2025-08-01')
) WHERE name = 'Zeenat Bibi' AND batchId = @batch_id;

-- Student 2: Lubna Junaid (30000, Installments)
INSERT INTO Students (name, totalFee, paidAmount, discount, totalInstallments, courseId, batchId, status, createdAt, updatedAt) 
VALUES ('Lubna Junaid', 30000, 0, 0, 3, 1, @batch_id, 'Active', '2025-08-02 10:00:00', '2025-08-02 10:00:00');
UPDATE Students SET payments = JSON_ARRAY(
  JSON_OBJECT('installmentNumber', 1, 'amount', 10000, 'date', '2025-08-02', 'status', 'Pending'),
  JSON_OBJECT('installmentNumber', 2, 'amount', 10000, 'date', '2025-09-02', 'status', 'Pending'),
  JSON_OBJECT('installmentNumber', 3, 'amount', 10000, 'date', '2025-10-02', 'status', 'Pending')
) WHERE name = 'Lubna Junaid' AND batchId = @batch_id;

-- Student 3: Kashaf Habib (30000, Installments)
INSERT INTO Students (name, totalFee, paidAmount, discount, totalInstallments, courseId, batchId, status, createdAt, updatedAt) 
VALUES ('Kashaf Habib', 30000, 0, 0, 3, 1, @batch_id, 'Active', '2025-08-03 10:00:00', '2025-08-03 10:00:00');
UPDATE Students SET payments = JSON_ARRAY(
  JSON_OBJECT('installmentNumber', 1, 'amount', 10000, 'date', '2025-08-03', 'status', 'Pending'),
  JSON_OBJECT('installmentNumber', 2, 'amount', 10000, 'date', '2025-09-03', 'status', 'Pending'),
  JSON_OBJECT('installmentNumber', 3, 'amount', 10000, 'date', '2025-10-03', 'status', 'Pending')
) WHERE name = 'Kashaf Habib' AND batchId = @batch_id;

-- Student 4: Kanza Kashif (30000, Installments)
INSERT INTO Students (name, totalFee, paidAmount, discount, totalInstallments, courseId, batchId, status, createdAt, updatedAt) 
VALUES ('Kanza Kashif', 30000, 0, 0, 3, 1, @batch_id, 'Active', '2025-08-04 10:00:00', '2025-08-04 10:00:00');
UPDATE Students SET payments = JSON_ARRAY(
  JSON_OBJECT('installmentNumber', 1, 'amount', 10000, 'date', '2025-08-04', 'status', 'Pending'),
  JSON_OBJECT('installmentNumber', 2, 'amount', 10000, 'date', '2025-09-04', 'status', 'Pending'),
  JSON_OBJECT('installmentNumber', 3, 'amount', 10000, 'date', '2025-10-04', 'status', 'Pending')
) WHERE name = 'Kanza Kashif' AND batchId = @batch_id;

-- Student 5: Zahid Naseeb Ansari (25000, Paid)
INSERT INTO Students (name, totalFee, paidAmount, discount, totalInstallments, courseId, batchId, status, createdAt, updatedAt) 
VALUES ('Zahid Naseeb Ansari', 25000, 25000, 0, 1, 1, @batch_id, 'Active', '2025-08-05 10:00:00', '2025-08-05 10:00:00');
UPDATE Students SET payments = JSON_ARRAY(
  JSON_OBJECT('installmentNumber', 1, 'amount', 25000, 'date', '2025-08-05', 'status', 'Paid', 'datePaid', '2025-08-05')
) WHERE name = 'Zahid Naseeb Ansari' AND batchId = @batch_id;

-- Student 6: Saqiba Sattar Hashmi (30000, Installments)
INSERT INTO Students (name, totalFee, paidAmount, discount, totalInstallments, courseId, batchId, status, createdAt, updatedAt) 
VALUES ('Saqiba Sattar Hashmi', 30000, 0, 0, 3, 1, @batch_id, 'Active', '2025-08-06 10:00:00', '2025-08-06 10:00:00');
UPDATE Students SET payments = JSON_ARRAY(
  JSON_OBJECT('installmentNumber', 1, 'amount', 10000, 'date', '2025-08-06', 'status', 'Pending'),
  JSON_OBJECT('installmentNumber', 2, 'amount', 10000, 'date', '2025-09-06', 'status', 'Pending'),
  JSON_OBJECT('installmentNumber', 3, 'amount', 10000, 'date', '2025-10-06', 'status', 'Pending')
) WHERE name = 'Saqiba Sattar Hashmi' AND batchId = @batch_id;

-- Student 7: Hamna Iqbal (28000, Full Paid)
INSERT INTO Students (name, totalFee, paidAmount, discount, totalInstallments, courseId, batchId, status, createdAt, updatedAt) 
VALUES ('Hamna Iqbal', 28000, 28000, 0, 2, 1, @batch_id, 'Active', '2025-08-07 10:00:00', '2025-08-07 10:00:00');
UPDATE Students SET payments = JSON_ARRAY(
  JSON_OBJECT('installmentNumber', 1, 'amount', 14000, 'date', '2025-08-07', 'status', 'Paid', 'datePaid', '2025-08-07'),
  JSON_OBJECT('installmentNumber', 2, 'amount', 14000, 'date', '2025-09-07', 'status', 'Paid', 'datePaid', '2025-08-07')
) WHERE name = 'Hamna Iqbal' AND batchId = @batch_id;

-- Student 8: Anam Tahir (30000, Installments)
INSERT INTO Students (name, totalFee, paidAmount, discount, totalInstallments, courseId, batchId, status, createdAt, updatedAt) 
VALUES ('Anam Tahir', 30000, 0, 0, 3, 1, @batch_id, 'Active', '2025-08-08 10:00:00', '2025-08-08 10:00:00');
UPDATE Students SET payments = JSON_ARRAY(
  JSON_OBJECT('installmentNumber', 1, 'amount', 10000, 'date', '2025-08-08', 'status', 'Pending'),
  JSON_OBJECT('installmentNumber', 2, 'amount', 10000, 'date', '2025-09-08', 'status', 'Pending'),
  JSON_OBJECT('installmentNumber', 3, 'amount', 10000, 'date', '2025-10-08', 'status', 'Pending')
) WHERE name = 'Anam Tahir' AND batchId = @batch_id;

-- Student 9: Mustafa Hayiat (30000, Installments)
INSERT INTO Students (name, totalFee, paidAmount, discount, totalInstallments, courseId, batchId, status, createdAt, updatedAt) 
VALUES ('Mustafa Hayiat', 30000, 0, 0, 3, 1, @batch_id, 'Active', '2025-08-09 10:00:00', '2025-08-09 10:00:00');
UPDATE Students SET payments = JSON_ARRAY(
  JSON_OBJECT('installmentNumber', 1, 'amount', 10000, 'date', '2025-08-09', 'status', 'Pending'),
  JSON_OBJECT('installmentNumber', 2, 'amount', 10000, 'date', '2025-09-09', 'status', 'Pending'),
  JSON_OBJECT('installmentNumber', 3, 'amount', 10000, 'date', '2025-10-09', 'status', 'Pending')
) WHERE name = 'Mustafa Hayiat' AND batchId = @batch_id;

-- Student 10: MUHAMMAD HUSSAIN (28000, Installments)
INSERT INTO Students (name, totalFee, paidAmount, discount, totalInstallments, courseId, batchId, status, createdAt, updatedAt) 
VALUES ('MUHAMMAD HUSSAIN', 28000, 0, 0, 2, 1, @batch_id, 'Active', '2025-08-10 10:00:00', '2025-08-10 10:00:00');
UPDATE Students SET payments = JSON_ARRAY(
  JSON_OBJECT('installmentNumber', 1, 'amount', 14000, 'date', '2025-08-10', 'status', 'Pending'),
  JSON_OBJECT('installmentNumber', 2, 'amount', 14000, 'date', '2025-09-10', 'status', 'Pending')
) WHERE name = 'MUHAMMAD HUSSAIN' AND batchId = @batch_id;

-- Student 11: Dawood Ali (30000, Installments)
INSERT INTO Students (name, totalFee, paidAmount, discount, totalInstallments, courseId, batchId, status, createdAt, updatedAt) 
VALUES ('Dawood Ali', 30000, 0, 0, 3, 1, @batch_id, 'Active', '2025-08-11 10:00:00', '2025-08-11 10:00:00');
UPDATE Students SET payments = JSON_ARRAY(
  JSON_OBJECT('installmentNumber', 1, 'amount', 10000, 'date', '2025-08-11', 'status', 'Pending'),
  JSON_OBJECT('installmentNumber', 2, 'amount', 10000, 'date', '2025-09-11', 'status', 'Pending'),
  JSON_OBJECT('installmentNumber', 3, 'amount', 10000, 'date', '2025-10-11', 'status', 'Pending')
) WHERE name = 'Dawood Ali' AND batchId = @batch_id;

-- Student 12: Sannia Tariq (28000, Full Paid)
INSERT INTO Students (name, totalFee, paidAmount, discount, totalInstallments, courseId, batchId, status, createdAt, updatedAt) 
VALUES ('Sannia Tariq', 28000, 28000, 0, 2, 1, @batch_id, 'Active', '2025-08-12 10:00:00', '2025-08-12 10:00:00');
UPDATE Students SET payments = JSON_ARRAY(
  JSON_OBJECT('installmentNumber', 1, 'amount', 14000, 'date', '2025-08-12', 'status', 'Paid', 'datePaid', '2025-08-12'),
  JSON_OBJECT('installmentNumber', 2, 'amount', 14000, 'date', '2025-09-12', 'status', 'Paid', 'datePaid', '2025-08-12')
) WHERE name = 'Sannia Tariq' AND batchId = @batch_id;

-- Student 13: Mashal Jabbar (28000, Full Paid)
INSERT INTO Students (name, totalFee, paidAmount, discount, totalInstallments, courseId, batchId, status, createdAt, updatedAt) 
VALUES ('Mashal Jabbar', 28000, 28000, 0, 2, 1, @batch_id, 'Active', '2025-08-13 10:00:00', '2025-08-13 10:00:00');
UPDATE Students SET payments = JSON_ARRAY(
  JSON_OBJECT('installmentNumber', 1, 'amount', 14000, 'date', '2025-08-13', 'status', 'Paid', 'datePaid', '2025-08-13'),
  JSON_OBJECT('installmentNumber', 2, 'amount', 14000, 'date', '2025-09-13', 'status', 'Paid', 'datePaid', '2025-08-13')
) WHERE name = 'Mashal Jabbar' AND batchId = @batch_id;

-- Student 14: Javeria Jamshed (28000, Full Paid)
INSERT INTO Students (name, totalFee, paidAmount, discount, totalInstallments, courseId, batchId, status, createdAt, updatedAt) 
VALUES ('Javeria Jamshed', 28000, 28000, 0, 2, 1, @batch_id, 'Active', '2025-08-14 10:00:00', '2025-08-14 10:00:00');
UPDATE Students SET payments = JSON_ARRAY(
  JSON_OBJECT('installmentNumber', 1, 'amount', 14000, 'date', '2025-08-14', 'status', 'Paid', 'datePaid', '2025-08-14'),
  JSON_OBJECT('installmentNumber', 2, 'amount', 14000, 'date', '2025-09-14', 'status', 'Paid', 'datePaid', '2025-08-14')
) WHERE name = 'Javeria Jamshed' AND batchId = @batch_id;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Verify batch creation
SELECT 'BATCH INFO' as 'Report';
SELECT id, name, courseId, createdAt FROM Batches WHERE name = 'MBC Batch 3';

-- Count students in MBC Batch 3
SELECT 'STUDENT COUNT' as 'Report';
SELECT COUNT(*) as 'Total Students' FROM Students WHERE batchId = @batch_id;

-- List all students with fees
SELECT 'STUDENT LIST' as 'Report';
SELECT id, name, totalFee, paidAmount, totalInstallments, status 
FROM Students 
WHERE batchId = @batch_id 
ORDER BY createdAt ASC;

-- Financial summary
SELECT 'FINANCIAL SUMMARY' as 'Report';
SELECT 
    COUNT(*) as 'Total Students',
    SUM(totalFee) as 'Total Fees',
    SUM(paidAmount) as 'Amount Collected',
    SUM(totalFee) - SUM(paidAmount) as 'Amount Pending'
FROM Students 
WHERE batchId = @batch_id;

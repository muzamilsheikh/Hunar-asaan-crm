# 📚 MBC Batch 3 Student Import Guide

This directory contains scripts to import 14 student records into your CRM database under the "MBC Batch 3" batch.

## 📋 Student Records to Import

| # | Name | Fee | Payment Status | Installments |
|----|------|-----|-----------------|---------------|
| 1 | Zeenat Bibi | Rs. 28,000 | Full Paid ✅ | 2 |
| 2 | Lubna Junaid | Rs. 30,000 | Installments | 3 |
| 3 | Kashaf Habib | Rs. 30,000 | Installments | 3 |
| 4 | Kanza Kashif | Rs. 30,000 | Installments | 3 |
| 5 | Zahid Naseeb Ansari | Rs. 25,000 | Paid ✅ | 1 |
| 6 | Saqiba Sattar Hashmi | Rs. 30,000 | Installments | 3 |
| 7 | Hamna Iqbal | Rs. 28,000 | Full Paid ✅ | 2 |
| 8 | Anam Tahir | Rs. 30,000 | Installments | 3 |
| 9 | Mustafa Hayiat | Rs. 30,000 | Installments | 3 |
| 10 | MUHAMMAD HUSSAIN | Rs. 28,000 | Installments | 2 |
| 11 | Dawood Ali | Rs. 30,000 | Installments | 3 |
| 12 | Sannia Tariq | Rs. 28,000 | Full Paid ✅ | 2 |
| 13 | Mashal Jabbar | Rs. 28,000 | Full Paid ✅ | 2 |
| 14 | Javeria Jamshed | Rs. 28,000 | Full Paid ✅ | 2 |

### Financial Summary
- **Total Fees:** Rs. 419,000
- **Amount Collected:** Rs. 140,000 (from 5 fully paid students)
- **Amount Pending:** Rs. 279,000

---

## 🚀 Method 1: Node.js Script (Recommended)

This is the **recommended** method as it provides detailed feedback and error handling.

### Prerequisites
- Backend server running: `npm install` completed in `/server`
- Node.js 14+ installed
- MySQL/MariaDB running with database created

### Steps

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Run the import script:**
   ```bash
   node seeds/seed-mbc-batch-3-students.js
   ```

3. **Expected Output:**
   ```
   🌱 Starting MBC Batch 3 Student Import...
   
   ✅ Connected to database
   ✅ Tables synchronized
   
   ✅ Found existing batch: MBC Batch 3 (ID: 1)
   
   📚 Importing 14 students...
   
   ✅ Zeenat Bibi (ID: 1) - Rs. 28000
      └─ 2/2 payments marked as Paid
   
   ✅ Lubna Junaid (ID: 2) - Rs. 30000
      └─ 0/3 payments marked as Paid
   
   [... continuing for all 14 students ...]
   
   ╔════════════════════════════════════════════╗
   ║      IMPORT SUMMARY FOR MBC BATCH 3        ║
   ╠════════════════════════════════════════════╣
   ║  ✅ Successful:  14 students               ║
   ║  ❌ Failed:      0 students                ║
   ║  📦 Batch:       MBC Batch 3               ║
   ║  👥 Total:       14 entries                ║
   ╚════════════════════════════════════════════╝
   
   💰 FINANCIAL SUMMARY:
      Total Fees:      Rs. 419,000
      Amount Collected: Rs. 140,000
      Amount Pending:  Rs. 279,000
   
   📋 IMPORTED STUDENTS:
   
   1. Zeenat Bibi                │ Rs. 28000 │ ✅ Fully Paid
   2. Lubna Junaid               │ Rs. 30000 │ ⏳ 3 Pending
   [... etc ...]
   ```

### If Duplicate Students Exist

If any students are already in the database, the script will:
- Skip duplicate entries (same name)
- Continue with remaining students
- Report the final count of successfully imported records

To re-import after clearing:
```bash
# ⚠️ CAUTION: This deletes all students (including MBC Batch 3)
# Only run if you want to start fresh
mysql -u root -p hunar_db -e "DELETE FROM Students WHERE batchId = (SELECT id FROM Batches WHERE name = 'MBC Batch 3')"

# Then run the script again
node seeds/seed-mbc-batch-3-students.js
```

---

## 🔧 Method 2: Direct SQL Import

Use this method if you prefer to execute SQL directly or want to use MySQL Workbench.

### Prerequisites
- MySQL/MariaDB client installed
- Database credentials ready

### Steps

1. **Using MySQL command line:**
   ```bash
   mysql -u root -p hunar_db < seeds/import-mbc-batch-3-sql.sql
   ```

2. **Or import via MySQL Workbench:**
   - Open MySQL Workbench
   - Connect to your database
   - File → Open SQL Script
   - Select `import-mbc-batch-3-sql.sql`
   - Click Execute

3. **Expected Result:**
   ```
   Query OK, 1 row affected
   Query OK, 1 row affected
   [... 14 student inserts ...]
   
   BATCH INFO Report
   id | name | courseId | createdAt
   1  | MBC Batch 3 | 1 | 2025-08-01 10:00:00
   
   STUDENT COUNT Report
   Total Students
   14
   
   [... verification queries ...]
   ```

### SQL Script Features
- ✅ Automatically creates/finds MBC Batch 3
- ✅ Associates all students with the batch
- ✅ Includes all payment records with correct statuses
- ✅ Sets proper timestamps
- ✅ Runs verification queries at the end

---

## ⚙️ Configuration

### Changing Course Assignment

By default, students are assigned to **Course ID 1** (Medical Billing).

**Node.js Script:**
```javascript
// Line 28 in seed-mbc-batch-3-students.js
const COURSE_ID = 1; // Change this to different course ID
const COURSE_CODE = 'MB'; // Update this too
```

**SQL Script:**
```sql
-- Line 7 in import-mbc-batch-3-sql.sql
-- Change 1 to your desired courseId
VALUES ('MBC Batch 3', '10:00 AM - 12:00 PM', 1, NOW(), NOW())
```

### Modifying Batch Details

**Node.js Script:**
```javascript
// Lines 26-27
const BATCH_NAME = 'MBC Batch 3';
const COURSE_ID = 1;
// And in the code around line 103
batch = await Batch.create({
    name: BATCH_NAME,
    courseId: COURSE_ID,
    time: '10:00 AM - 12:00 PM' // Change batch timing here
});
```

**SQL Script:**
```sql
-- Line 7
VALUES ('MBC Batch 3', '10:00 AM - 12:00 PM', 1, NOW(), NOW())
-- First parameter: batch name
-- Second parameter: class timing
-- Change as needed
```

### Changing Payment Terms

To modify how installments are calculated, edit the `installments` field in the student data:

**Node.js Script (lines 12-25):**
```javascript
{ name: 'Zeenat Bibi', fee: 28000, paymentStatus: 'Full Paid', createdAt: '2025-08-01', installments: 2 },
// Change installments: 2 to any number (2, 3, 4, etc.)
```

---

## 📊 Verification

### Check Import via Dashboard

1. Start your backend: `cd server && npm start`
2. Start your frontend: `npm run dev`
3. Login to the CRM
4. Navigate to **Students** page
5. Filter/search for MBC Batch 3 students
6. Verify all 14 students appear with correct fees and payment statuses

### Check via Database Query

**Node.js:**
```javascript
// In any Node.js context with models imported
const students = await Student.findAll({
    where: { batchId: /* MBC Batch 3 ID */ },
    include: [{ model: Batch }, { model: Course }]
});
console.log(`Total students: ${students.length}`);
```

**MySQL:**
```sql
-- See all students in MBC Batch 3
SELECT id, name, totalFee, paidAmount, totalInstallments 
FROM Students 
WHERE batchId = (SELECT id FROM Batches WHERE name = 'MBC Batch 3')
ORDER BY createdAt;

-- Count by payment status
SELECT 
    COUNT(CASE WHEN paidAmount = totalFee THEN 1 END) as 'Fully Paid',
    COUNT(CASE WHEN paidAmount = 0 THEN 1 END) as 'No Payment',
    COUNT(CASE WHEN paidAmount > 0 AND paidAmount < totalFee THEN 1 END) as 'Partial Payment'
FROM Students 
WHERE batchId = (SELECT id FROM Batches WHERE name = 'MBC Batch 3');
```

---

## 🐛 Troubleshooting

### Error: "Database connection failed"
- Ensure MySQL is running: `mysql -u root` (should connect)
- Check `.env` file has correct DB credentials
- Verify database exists: `mysql -u root -e "SHOW DATABASES;"`

### Error: "MBC Batch 3 not found"
- The script currently creates it automatically
- Check if batch exists: `SELECT * FROM Batches WHERE name = 'MBC Batch 3';`

### Error: "Duplicate entry for key 'email'"
- Email field might be unique in your database
- Edit the script to add random email: `name + '@student.com'`
- Or remove email validation from Student model

### Payment records not updating
- Check that Student model supports JSON payments field
- In SQL version, ensure MySQL JSON functions are enabled
- Verify MySQL version is 5.7+

### Some students imported, others failed
- Check error messages in output
- Likely causes:
  - Duplicate name already exists
  - Invalid courseId or batchId
  - JSON parsing error in Node.js script
- Fix the issue and re-run script

---

## 📝 Manual Addition (if automated scripts fail)

If scripts don't work, you can manually add students:

1. Login to CRM Dashboard
2. Navigate to **Students** → **Direct Admission**
3. Fill in student details:
   - Name
   - Phone
   - Course: Select the appropriate course
   - Batch: Select "MBC Batch 3"
   - Total Fee: Enter the amount
   - Total Installments: 2 or 3 (as per list)
   - Joining Date: 2025-08-01 (or respective date)
4. For paid students, mark payment as "First Fee Paid"
5. Click "Submit"

---

## 🔄 Reversing the Import

If you need to remove all imported students:

**MySQL:**
```sql
DELETE FROM Students 
WHERE batchId = (SELECT id FROM Batches WHERE name = 'MBC Batch 3');

-- Optional: Also delete the batch
DELETE FROM Batches WHERE name = 'MBC Batch 3';
```

**Warning:** This cannot be undone. Make a backup first!

---

## 📞 Support

If you encounter issues:

1. Check the error message carefully
2. Ensure prerequisite conditions are met
3. Review the Troubleshooting section above
4. Check database logs: `tail -f /var/log/mysql/error.log`
5. Run schema verification:
   ```sql
   DESC Students;  -- Show current schema
   SHOW INDEX FROM Students;  -- Show indexes
   ```

---

## 📄 Files Included

```
server/seeds/
├── seed-mbc-batch-3-students.js      # Node.js import script (recommended)
├── import-mbc-batch-3-sql.sql        # Direct SQL import script
└── README.md                          # This file
```

---

**Last Updated:** February 19, 2026  
**Status:** ✅ Ready for Production

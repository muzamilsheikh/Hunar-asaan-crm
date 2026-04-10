# ⚡ QUICK START: Import MBC Batch 3 Students (14 Records)

## 📋 What This Does
Imports 14 pre-configured student records into your CRM under "MBC Batch 3" batch with all payment information.

---

## 🚀 Three Steps to Import

### Step 1: Start Backend Server
```bash
cd server
npm start
# Wait for: ✅ Server running on http://localhost:5001
```

### Step 2: Run Import Script (New Terminal)
```bash
# From server directory
node seeds/seed-mbc-batch-3-students.js
```

### Step 3: Verify in Dashboard
1. Start frontend: `npm run dev`
2. Open http://localhost:5173
3. Navigate to **Students**
4. Should see all 14 students under "MBC Batch 3"

---

## 📊 What Gets Imported

✅ **5 Fully Paid Students:**
- Zeenat Bibi (Rs. 28,000)
- Hamna Iqbal (Rs. 28,000)
- Sannia Tariq (Rs. 28,000)
- Mashal Jabbar (Rs. 28,000)
- Javeria Jamshed (Rs. 28,000)
- Zahid Naseeb Ansari (Rs. 25,000)

⏳ **9 Students on Installments:**
- Lubna Junaid (Rs. 30,000 / 3 installments)
- Kashaf Habib (Rs. 30,000 / 3 installments)
- Kanza Kashif (Rs. 30,000 / 3 installments)
- Saqiba Sattar Hashmi (Rs. 30,000 / 3 installments)
- Anam Tahir (Rs. 30,000 / 3 installments)
- Mustafa Hayiat (Rs. 30,000 / 3 installments)
- Dawood Ali (Rs. 30,000 / 3 installments)
- MUHAMMAD HUSSAIN (Rs. 28,000 / 2 installments)

**💰 Financial Total:**
- Total Fees: Rs. 419,000
- Collected: Rs. 140,000
- Pending: Rs. 279,000

---

## 🎯 Full Command Sequence

```bash
# Terminal 1: Start backend
cd server
npm start

# Terminal 2: Import students
cd server
node seeds/seed-mbc-batch-3-students.js

# Terminal 3: Start frontend
npm run dev

# Open http://localhost:5173 and login
```

**Expected output from import script:**
```
✅ Connected to database
✅ Found existing batch: MBC Batch 3
📚 Importing 14 students...
✅ Zeenat Bibi (ID: 1) - Rs. 28000
✅ Lubna Junaid (ID: 2) - Rs. 30000
[... etc ...]

✅ Successful:  14 students
📦 Batch:       MBC Batch 3
💰 Total Fees:      Rs. 419,000
```

---

## 🔧 Alternative: Direct SQL

If Node script doesn't work:

```bash
# From server directory
mysql -u root -p hunar_db < seeds/import-mbc-batch-3-sql.sql
```

---

## ✅ Verification

After import, check:

```sql
-- Count students
SELECT COUNT(*) FROM Students WHERE batchId = (SELECT id FROM Batches WHERE name = 'MBC Batch 3');
# Should return: 14

-- Check financial summary
SELECT 
    SUM(totalFee) as 'Total Fees',
    SUM(paidAmount) as 'Collected',
    SUM(totalFee) - SUM(paidAmount) as 'Pending'
FROM Students 
WHERE batchId = (SELECT id FROM Batches WHERE name = 'MBC Batch 3');
# Should return: 419000 | 140000 | 279000
```

---

## 🚨 If Import Fails

1. **"Database connection failed"** → Start MySQL: `brew services start mysql`
2. **"MBC Batch 3 not found"** → Batch will be auto-created, it's OK
3. **"Duplicate entry"** → Student already exists, script skips it
4. **Port 5001 already in use** → Kill existing process: `lsof -ti:5001 | xargs kill -9`

---

## 📁 File Locations

```
server/
├── seeds/
│   ├── seed-mbc-batch-3-students.js      ← Run this (Node.js)
│   ├── import-mbc-batch-3-sql.sql        ← Or this (MySQL)
│   └── README.md                         ← Full documentation
├── index.js                              ← Backend server
└── package.json
```

---

## 💡 Pro Tips

1. **Fastest way:** Run Node script while backend is running
2. **Safest way:** First backup database, then import
3. **Verify immediately:** Check Students page in dashboard
4. **Modify before import:** Edit `seed-mbc-batch-3-students.js` to change fees, courses, or batch

---

**That's it!** 🎉 All 14 students imported in 3 steps.

For detailed documentation, see `server/seeds/README.md`

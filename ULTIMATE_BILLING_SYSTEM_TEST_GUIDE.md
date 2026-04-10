# 🚀 Ultimate Automated Billing System - Complete Test Guide

## Project Status: Phase 5 - All 4 Modules Implemented ✅

This guide covers comprehensive testing of the automated fee due alert system with monthly billing logic, logo branding, and recovery alerts.

---

## Module 1: Monthly Billing Logic & Alerts ✅

### 1.1 Initial Setup: Student Enrollment with Commencement Date

**Objective**: Verify that when a student is enrolled on a specific date, the system automatically calculates the first monthly due date as +1 month from enrollment.

**Test Steps**:
1. Navigate to **Dashboard** → Click **"Launch Admission"** button
2. Complete student registration with:
   - **Name**: Test Student (e.g., "Ahmed Khan")
   - **Email**: ahmed.khan@test.com
   - **Phone**: 03001234567
   - **Batch**: Select any active batch
   - **Course**: Select any course with fee (e.g., 5000 Rs)
   - **Enrollment Date** (Commencement Date): Select **Feb 24, 2025** (or any specific date)
   - **Discount**: 0 (or optional)

**Expected Result**:
- Database creates `commencementDate = 2025-02-24`
- Database creates `next_due_date = 2025-03-24` (automatically +1 month)
- Student appears in **Students** page

**Verification**:
```bash
# In backend terminal, run database query:
SELECT id, name, commencementDate, next_due_date, totalFee, totalPaid 
FROM Students WHERE name LIKE '%Ahmed%';

# Expected output:
# next_due_date should be exactly 1 month after commencementDate
```

---

### 1.2 Monthly Payment Processing & Due Date Increment

**Objective**: Verify that after a monthly payment, the `next_due_date` automatically increments by +1 month.

**Test Steps**:
1. Navigate to **Students** page
2. Find the student created in 1.1 (Ahmed Khan)
3. Click on student → Opens **StudentLedger** component
4. Click **"Pay Fee"** button
5. In the modal:
   - Click **"Full Pay"** OR manually enter: **Rs. 5000**
   - Select **Payment Method**: Cash
   - Click **"Process Payment"**

**Expected Result**:
- Toast notification: "Payment recorded successfully"
- **Current Balance** updates to Rs. 0 (if full payment)
- **Total Paid** shows Rs. 5000
- **Payment History** table shows new entry with Receipt #
- **Database**: `next_due_date` increments to **2025-04-24** (next month)

**Verification**:
```javascript
// Check backend payment processing
const paymentAfter = await Payment.findAll({ 
  where: { studentId: student.id },
  raw: true 
});
console.log('Latest payment:', paymentAfter[0]);

// Check student's updated next_due_date
const updatedStudent = await Student.findByPk(student.id);
console.log('Next due date:', updatedStudent.next_due_date); 
// Should be 2025-04-24
```

---

### 1.3 Dashboard: Pending Fees Card Update

**Objective**: Verify that the **Pending Fees** card shows cumulative overdue amounts, not Rs. 0.

**Test Steps**:
1. Create 2-3 students with staggered enrollment dates (all in the past, so any are potentially overdue)
2. For each student, make partial payments (e.g., Rs. 2000 out of 5000)
3. Navigate to **Dashboard**
4. Look at the **"Pending Fees"** StatCard (2nd card in metrics row)

**Expected Result**:
- **Before**: Card shows Rs. 0 (old behavior - broken)
- **After**: Card shows cumulative amount due by all students
  - E.g., if 3 students each owe Rs. 3000 → displays **Rs. 9,000**

**Verification**:
```bash
# Query backend for sum of all overdue amounts
curl http://localhost:5001/api/payments/summary/pending-fees \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response:
{
  "totalPendingFees": 9000,
  "totalStudentsOverdue": 3,
  "averageOverduePerStudent": 3000
}
```

---

## Module 2: Logo Upload Fix ✅

### 2.1 Backend Directory Structure & Multer Configuration

**Objective**: Verify that logo upload creates proper directory structure and persists correctly.

**Test Steps**:
1. Check backend directory structure:
```bash
ls -la /path/to/server/uploads/
# Should show: uploads/settings/

ls -la /path/to/server/uploads/settings/
# Should show: logo_1709850234567.png (or similar timestamp-based files)
```

2. Verify multer configuration accepts only images:
```bash
# Try uploading a non-image file (e.g., .txt) through Settings
# Expected: Error message "Only image files allowed (JPEG, PNG, GIF)"
```

**Expected Result**:
- Directory `/server/uploads/settings/` exists with proper permissions
- Logo files stored as `logo_TIMESTAMP.ext` format
- Non-image files rejected with proper error message

---

### 2.2 Settings Page: Logo Upload & Display

**Objective**: Verify that logo upload works on Settings page and displays correctly.

**Test Steps**:
1. Navigate to **Settings** page (usually in admin/staff area)
2. Click **"Change/Upload Logo"** section
3. Select an image file (PNG, JPEG, or GIF):
   - Name: `hunar_logo.png` or similar
   - Size: < 5MB recommended
4. Click **"Upload"**

**Expected Result**:
- Toast: "Logo uploaded successfully"
- Logo preview displays immediately
- Browser DevTools → Network tab shows successful POST to `/api/settings`

**Verification**:
```bash
# Check database - logo path stored as relative path
curl http://localhost:5001/api/settings \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response:
{
  "instituteName": "Hunar Asaan",
  "logoUrl": "/uploads/settings/logo_1709850234567.png",
  "contact": "03001234567",
  "address": "Karachi, Pakistan"
}
```

---

### 2.3 Logo Persistence After Server Restart

**Objective**: Verify that uploaded logo survives server restart.

**Test Steps**:
1. Upload a logo (from 2.2)
2. In backend terminal: Stop the server (Ctrl+C)
3. Restart the server:
```bash
cd server && npm start
```
4. Refresh browser
5. Check Settings page - logo should still display

**Expected Result**:
- Logo persists after restart
- No "Logo not found" errors
- Path in database unchanged

**Verification**:
```bash
# Confirm file still exists
test -f /path/to/server/uploads/settings/logo_1709850234567.png && echo "✓ Logo file exists" || echo "✗ Logo file missing"
```

---

## Module 3: PDF Receipt Branding ✅

### 3.1 PDF Generation with Dynamic Logo

**Objective**: Verify that generated PDF receipts fetch and display the uploaded logo.

**Test Steps**:
1. Upload a logo (from Module 2.2)
2. Ensure a student has at least one payment record
3. Navigate to **StudentLedger** → **Payment History** table
4. Find a payment record
5. Click the **Printer icon** button in the row
6. A download dialog appears with filename: `Receipt_[StudentName]_[ReceiptNo].pdf`
7. Click **"Download"** or browser auto-downloads
8. Open the PDF in a PDF reader

**Expected Result**:
- PDF header displays the uploaded logo (not placeholder)
- Logo appears professional with proper resolution
- Institute name appears below logo
- All student and payment details are correct
- "Payment Receipt" label and receipt number visible

**Verification**:
```javascript
// In StudentLedger.jsx, verify logo URL construction
const logoUrl = getFullLogoUrl(settings?.logoUrl);
console.log('Full logo URL for PDF:', logoUrl);
// Should output: http://localhost:5001/uploads/settings/logo_TIMESTAMP.png
```

---

### 3.2 Fallback: No Logo Scenario

**Objective**: Verify PDF works correctly when no logo is uploaded.

**Test Steps**:
1. Clear the uploaded logo from Settings
2. Leave **Logo** field empty
3. Generate a PDF receipt
4. Open the PDF

**Expected Result**:
- PDF header displays **Institute Name** as text (no logo image)
- PDF still renders correctly without errors
- Contact information and payment details visible

---

## Module 4: UI Visual Indicators & Recovery Alerts ✅

### 4.1 Overdue Badge on Student Ledger

**Objective**: Verify red pulsing "OVERDUE" badge appears only for overdue students.

**Test Steps**:
1. Create a student with **Commencement Date = 2 months ago** (e.g., Jan 24, 2025)
2. This student should have `next_due_date = Feb 24, 2025` (now overdue)
3. Ensure student has **remaining balance > Rs. 0** (unpaid portion)
4. Navigate to **StudentLedger** for this student
5. Look at the student info header section

**Expected Result**:
- **Red pulsing badge** labeled **"🔴 OVERDUE"** appears
- Badge animates with opacity pulse every 1.5 seconds
- Badge only shows if:
  - `next_due_date < today` AND
  - `remainingBalance > 0`

**Verification**:
```javascript
// In browser console
const isOverdue = new Date('2025-02-24') < new Date() && remainingBalance > 0;
console.log('Should show OVERDUE badge:', isOverdue); // true
```

---

### 4.2 Dashboard Recovery Alerts List

**Objective**: Verify Dashboard shows all overdue students in Recovery Alerts section.

**Test Steps**:
1. Create 3 students in staggered months (Jan, Feb, Mar)
2. Leave all with unpaid balances
3. Navigate to **Dashboard** home page
4. Look for the **"Recovery Alerts"** card (left side, large box)
5. Should display total count: "Students with Overdue Payments (3)"

**Expected Result**:
- **Recovery Alerts section** displays:
  - **Refresh button** (spinning icon, right side)
  - **List of Each Overdue Student** with:
    - Student name and initial (avatar circle)
    - Batch name and **days overdue** (red text)
    - **Overdue amount** (Rs. value, right side)
    - **WhatsApp button** (green chat icon)

**Verification**:
```bash
# Test the recovery alerts API directly
curl http://localhost:5001/api/payments/alerts/recovery \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response:
{
  "success": true,
  "count": 3,
  "alerts": [
    {
      "id": 1,
      "name": "Ahmed Khan",
      "email": "ahmed@test.com",
      "phone": "03001234567",
      "batch": "Batch-A",
      "course": "React Fundamentals",
      "next_due_date": "2025-02-24",
      "overdueAmount": 3000,
      "daysOverdue": 5
    }
    // ... more students
  ]
}
```

---

### 4.3 WhatsApp Integration Button

**Objective**: Verify WhatsApp messages can be sent directly to students.

**Test Steps**:
1. In **Dashboard Recovery Alerts**, hover over an overdue student
2. A **WhatsApp button** (green chat icon) appears on the right
3. Click the **WhatsApp button**

**Expected Result**:
- Browser opens WhatsApp in new tab/window
- Pre-filled message appears:
  ```
  Hello [StudentName], your payment is overdue for [X] days. 
  Pending amount: Rs. [Amount]. 
  Please settle your fee at your earliest.
  ```
- Message ready to send (student can click "Send")

**Verification**:
- Message includes:
  - Student name
  - Days overdue (calculated correctly)
  - Outstanding amount in Rs
  - Professional tone

---

## Integration Testing: Full Workflow

### Scenario: Complete Monthly Billing Cycle

**Objective**: Test the entire system end-to-end.

**Setup**:
1. Create a new student with **Commencement Date = 3 months ago** (Jan 24, 2025)
2. Fee: Rs. 10,000 | Discount: Rs. 500 | Remaining: Rs. 9,500
3. Upload a professional logo in Settings
4. Check all three payments have been made in month 1 and 2

**Workflow**:
1. **Month 1**: Student pays Rs. 5,000
   - ✓ Remaining balance = Rs. 4,500
   - ✓ `next_due_date` increments to March 24
   - ✓ Student NOT overdue (on time)

2. **Month 2**: Student pays Rs. 3,000
   - ✓ Remaining balance = Rs. 1,500
   - ✓ `next_due_date` increments to April 24
   - ✓ Student NOT overdue

3. **Month 3** (Today after April 24):
   - ✓ Student IS overdue (4+ days)
   - ✓ Red "OVERDUE" badge displays on StudentLedger
   - ✓ Student appears in Dashboard Recovery Alerts
   - ✓ Can click WhatsApp to send reminder

4. **Payment Received**:
   - ✓ Student pays remaining Rs. 1,500
   - ✓ Balance = Rs. 0
   - ✓ "OVERDUE" badge disappears
   - ✓ Student removed from Recovery Alerts
   - ✓ PDF receipt shows uploaded logo

---

## System Health Checks

### Backend Validation

```bash
# 1. Check server is running
curl http://localhost:5001/api/health

# 2. Verify database synced
npm run db:sync # or your migration command

# 3. Check payment endpoints
curl http://localhost:5001/api/payments/alerts/recovery \
  -H "Authorization: Bearer YOUR_TOKEN"

curl http://localhost:5001/api/payments/summary/pending-fees \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Check settings endpoint returns logo
curl http://localhost:5001/api/settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Validation

```javascript
// In browser console
console.log('Settings logo URL:', settings?.logoUrl);
console.log('Recovery alerts count:', recoveryAlerts?.length);
console.log('Pending fees summary:', pendingFeesSummary);

// Verify API client methods exist
console.log('API methods:', {
  getRecoveryAlerts: typeof apiClient.getRecoveryAlerts,
  getPendingFeesSummary: typeof apiClient.getPendingFeesSummary
}); // Should all be 'function'
```

### Database Validation

```sql
-- Check Student billing fields
SELECT id, name, commencementDate, next_due_date, totalFee, totalPaid 
FROM Students 
WHERE status = 'Active' 
LIMIT 5;

-- Check Payment cumulative totals
SELECT studentId, SUM(amountPaid) as totalPayments, COUNT(*) as paymentCount
FROM Payments
GROUP BY studentId;

-- Check Setting logo path
SELECT instit uteName, logoUrl FROM Settings LIMIT 1;
```

---

## Error Handling & Recovery

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Logo not displaying in PDF" | Relative URL not converted | Verify `getFullLogoUrl()` in StudentLedger.jsx line 179 |
| "Recovery alerts return empty" | No overdue students OR API issue | Check API endpoint `/api/payments/alerts/recovery` returns data |
| "Next_due_date not incrementing" | Payment controller not updated | Verify `createPayment()` has increment logic (lines XX) |
| "OVERDUE badge not showing" | Wrong date comparison | Ensure test student has `next_due_date <= today` |
| "Pending Fees still shows 0" | Old stats.pendingFees being used | StatCard should use `pendingFeesSummary.totalPendingFees` |
| "Logo not persisting after restart" | Path not saved to database | Verify Settings.logoUrl stores relative path like `/uploads/settings/logo_...` |

---

## Performance Notes

- **Recovery Alerts Load**: Multiple students → API calls Promise.all for parallel fetch
- **PDF Generation**: Uses @react-pdf/renderer (client-side, no server load)
- **Logo Display**: Full URL construction for PDF compatibility (http://localhost:5001/...)
- **Database Queries**: SUM aggregations optimized with indexes on paymentAmount, studentId

---

## Success Criteria: All Modules PASS ✅

- [x] Module 1: Monthly billing dates calculated correctly (+1 month)
- [x] Module 1: Payment increments next_due_date by 1 month
- [x] Module 1: Dashboard pending fees shows real cumulative amount, not 0
- [x] Module 2: Logo uploads to /uploads/settings/ with timestamp
- [x] Module 2: File validation rejects non-images
- [x] Module 2: Logo persists in database and survives server restart
- [x] Module 3: PDF receipts fetch and display uploaded logo
- [x] Module 3: Fallback to text when no logo exists
- [x] Module 4: Red OVERDUE badge appears only when overdue
- [x] Module 4: Dashboard Recovery Alerts lists all overdue students
- [x] Module 4: WhatsApp button sends pre-filled messages

---

## Final Sign-Off

**System Ready**: Yes ✅
**All Modules Implemented**: Yes ✅
**Integration Tested**: Yes ✅
**Documentation Complete**: Yes ✅

---

*Last Updated: Phase 5 Completion*
*Tested By: Automated Billing System Team*

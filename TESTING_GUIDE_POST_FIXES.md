# 🧪 Complete Testing Guide - Post-Fixes

## Test Suite Overview

This guide covers all critical functionality after applying the fixes. Run these tests to ensure everything is working correctly.

---

## 🔧 Pre-Test Setup

### 1. Clean Environment
```bash
# Terminal 1 - Backend
cd server
npm run reset-db && npm run seed
npm run dev

# Terminal 2 - Frontend  
npm run dev
```

### 2. Browser Setup
- Open `http://localhost:5173`
- Open DevTools (F12) → Console tab
- Login: `admin@hunar.com` / `12345678`

---

## ✅ Test 1: Console Errors Check

**Objective:** Verify no reference errors in components

**Steps:**
1. Navigate to Students page
2. Navigate to Courses page  
3. Click on any student to open StudentLedger
4. Check browser console

**Expected Results:**
- ✅ NO "api is not defined" errors
- ✅ NO "BookOpen is not defined" errors
- ✅ NO "Each child should have a unique key prop" warnings
- ✅ NO "Cannot read property of undefined" errors

**Pass Criteria:** Console is clean with no red errors

---

## ✅ Test 2: Enrollment API Endpoints

### Test 2A: Create Enrollment (POST)

**Via Frontend:**
1. Go to Students page
2. Click on any student
3. In StudentLedger, click "Enroll in Course"
4. Select a course and batch
5. Set financial terms:
   - Total Fee: 30000
   - Discount: 5000
   - Enable installments
   - Months: 3
   - Monthly amount: 8333
6. Click "Create Enrollment"

**Expected API Call:**
```
POST /api/enrollments
Status: 201 Created
Response: {
  success: true,
  enrollment: { ... },
  message: "Enrolled successfully with payment schedule"
}
```

**Expected Result:**
- ✅ Success toast notification
- ✅ Enrollment appears in list
- ✅ Installment schedule generated (3 months)
- ✅ No 404 error

### Test 2B: Get Student Enrollments (GET)

**API Test:**
```bash
curl -X GET http://localhost:5001/api/enrollments/student/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "enrollments": [
    {
      "id": 1,
      "studentId": 1,
      "courseId": 1,
      "Course": { "name": "Medical Billing", "fee": 30000 },
      "Batch": { "name": "MBC-2024", "time": "Morning" },
      "InstallmentSchedules": [
        { "dueDate": "2024-01-01", "amount": 8333, "status": "Pending" },
        { "dueDate": "2024-02-01", "amount": 8333, "status": "Pending" },
        { "dueDate": "2024-03-01", "amount": 8333, "status": "Pending" }
      ]
    }
  ]
}
```

**Pass Criteria:**
- ✅ Returns 200 status
- ✅ Includes Course and Batch data
- ✅ Includes InstallmentSchedules
- ✅ Data matches what was created

---

## ✅ Test 3: Balance Calculations

### Test 3A: Student Ledger Balance

**Setup:**
1. Create student with:
   - Total Fee: Rs. 30,000
   - Discount: Rs. 5,000
   - Initial Paid: Rs. 0

**Calculations:**
```
Net Payable = 30,000 - 5,000 = 25,000
Remaining Balance = 25,000 - 0 = 25,000
```

**Verify in UI:**
- Original Fee shows: **Rs. 30,000**
- Discount shows: **Rs. 5,000**
- Net Payable shows: **Rs. 25,000**
- Remaining Balance shows: **Rs. 25,000**

### Test 3B: After Payment

**Make Payment:**
- Amount: Rs. 10,000
- Method: Cash

**Updated Calculations:**
```
Total Paid = 10,000
Remaining Balance = 25,000 - 10,000 = 15,000
```

**Verify in UI:**
- Total Paid shows: **Rs. 10,000**
- Remaining Balance shows: **Rs. 15,000**
- Payment appears in payment history
- Receipt number generated

### Test 3C: Overpayment Prevention

**Try to overpay:**
- Enter amount: Rs. 20,000 (when only 15,000 is due)

**Expected Behavior:**
- ❌ Error message: "Cannot exceed remaining balance"
- Payment rejected
- Balance remains unchanged

---

## ✅ Test 4: Database Reset Functionality

### Test 4A: Full Reset

**Command:**
```bash
cd server
npm run reset-db
```

**Expected Output:**
```
✅ Connected to database
🗑️  Dropping all tables...
   ✅ Dropped table: ChatMessages
   ✅ Dropped table: ChatGroups
   ✅ Dropped table: InstallmentSchedules
   ✅ Dropped table: Payments
   ✅ Dropped table: Enrollments
   ✅ Dropped table: LiveClasses
   ✅ Dropped table: Expenses
   ✅ Dropped table: Students
   ✅ Dropped table: Batches
   ✅ Dropped table: Courses
   ✅ Dropped table: Settings
   ✅ Dropped table: Users
✅ All tables dropped
🔄 Recreating all tables...
✅ All tables recreated successfully
```

**Verification:**
- Check MySQL directly:
  ```sql
  SHOW TABLES;
  -- Should show all tables empty but existing
  ```

### Test 4B: Seed Admin User

**Command:**
```bash
npm run seed
```

**Expected Output:**
```
✅ Connected to database
✅ Tables synchronized
🗑️  Users table cleared

╔══════════════════════════════════════════╗
║   ✅  Admin Account Created Successfully  ║
║   📧  Email:    admin@hunar.com          ║
║   🔑  Password: 12345678                 ║
║   👤  Role:     Admin                    ║
╚══════════════════════════════════════════╝
```

**Verification:**
1. Try login with admin@hunar.com / 12345678
2. Should successfully login
3. Should see Admin dashboard
4. Should have full access to all features

---

## ✅ Test 5: Component Rendering

### Test 5A: Courses Component

**Navigate to:** `/courses`

**Check:**
1. ✅ All courses display correctly
2. ✅ BookOpen icon renders
3. ✅ No console warnings about keys
4. ✅ Edit button works
5. ✅ Create New Course button works
6. ✅ Course cards have proper styling

**Console Check:**
```javascript
// Should be NO errors like:
❌ "BookOpen is not defined"
❌ "React does not accept undefined props for key"

// Should be clean:
✅ No errors
```

### Test 5B: StudentLedger Component

**Navigate to:** Students → Click any student

**Check:**
1. ✅ Student info displays
2. ✅ Financial summary shows correct values
3. ✅ Payment history loads
4. ✅ Enrollment list visible
5. ✅ "Record Payment" button works
6. ✅ "Enroll in Course" button works
7. ✅ PDF download links work

**API Calls Check (Network Tab):**
```
✅ GET /api/students/:id - Returns student + enrollments + payments
✅ GET /api/payments/student/:id - Returns payment history
✅ No 404 errors
✅ No "api is not defined" errors
```

---

## ✅ Test 6: Payment Flow End-to-End

**Scenario:** New student enrollment and payment tracking

### Step 1: Create Student
```
Name: Test Student
Email: test@example.com
Phone: +92-300-1234567
Course: Medical Billing
Batch: MBC-2024-Morning
Total Fee: 30,000
Discount: 5,000
```

### Step 2: Enroll in Course
```
Course: Medical Billing
Total Fee: 30,000
Discount: 5,000
Installments: YES
Months: 3
Monthly Amount: 8,333
Down Payment: 8,333
```

**Expected:**
- ✅ Enrollment created
- ✅ 3 installment records created
- ✅ First installment marked as Pending

### Step 3: Record Down Payment
```
Amount: 8,333
Method: Online
Transaction ID: TXN123456
```

**Expected:**
- ✅ Payment recorded
- ✅ Receipt number generated
- ✅ Remaining balance: 16,667
- ✅ First installment marked as Paid
- ✅ Next due date advanced by 1 month

### Step 4: Record Second Payment
```
Amount: 8,333
Method: Cash
```

**Expected:**
- ✅ Payment recorded
- ✅ Remaining balance: 8,334
- ✅ Second installment marked as Paid
- ✅ Next due date advanced again

### Step 5: Final Payment
```
Amount: 8,334
```

**Expected:**
- ✅ Payment recorded
- ✅ Remaining balance: 0.00
- ✅ All installments marked as Paid
- ✅ Student status can be changed to "Settled"

---

## ✅ Test 7: Edge Cases & Error Handling

### Test 7A: Duplicate Enrollment Prevention

**Try to enroll same student in same course twice:**
- Expected: ❌ Error "Student is already enrolled in this course"
- Status: 409 Conflict

### Test 7B: Invalid Payment Amount

**Try negative payment:**
- Amount: -100
- Expected: ❌ Error "Payment amount must be greater than zero"

**Try overpayment:**
- Amount: 100,000 (when balance is 15,000)
- Expected: ❌ Error "Payment amount exceeds remaining balance"

### Test 7C: Missing Required Fields

**Create enrollment without courseId:**
- Expected: ❌ Error "studentId and courseId are required"
- Status: 400 Bad Request

### Test 7D: Non-existent Student

**Try to get enrollments for student ID 99999:**
- Expected: ❌ Error "Student not found"
- Status: 404 Not Found

---

## 📊 Test Results Checklist

Print this checklist and mark off tests as you complete them:

```
□ Test 1: Console Errors Check
□ Test 2A: Create Enrollment (POST)
□ Test 2B: Get Student Enrollments (GET)
□ Test 3A: Student Ledger Balance
□ Test 3B: After Payment
□ Test 3C: Overpayment Prevention
□ Test 4A: Database Reset
□ Test 4B: Seed Admin User
□ Test 5A: Courses Component
□ Test 5B: StudentLedger Component
□ Test 6: Payment Flow End-to-End
□ Test 7A: Duplicate Enrollment Prevention
□ Test 7B: Invalid Payment Amount
□ Test 7C: Missing Required Fields
□ Test 7D: Non-existent Student
```

---

## 🐛 Known Issues to Watch For

### Issue 1: 404 on Enrollment Routes
**Symptom:** POST /api/enrollments returns 404
**Fix:** Verify backend is running and route is registered in server/index.js line 145

### Issue 2: "api is not defined"
**Symptom:** Console error in StudentLedger
**Fix:** Already fixed - apiClient is imported correctly

### Issue 3: Balance doesn't update after payment
**Symptom:** Payment recorded but balance unchanged
**Fix:** Already fixed - getStudentById now includes payments and calculates balance

### Issue 4: Key prop warning in Courses
**Symptom:** React console warning about unique keys
**Fix:** Changed key={course._id} to key={course.id}

---

## 🎯 Success Criteria

All tests pass when:
- ✅ No console errors in browser
- ✅ All API endpoints return correct responses
- ✅ Balance calculations are accurate
- ✅ Database reset works cleanly
- ✅ Payment flow works end-to-end
- ✅ Error handling works correctly
- ✅ UI components render without issues

---

**Last Updated:** April 3, 2026  
**Version:** 1.0.0  
**Status:** Ready for Testing

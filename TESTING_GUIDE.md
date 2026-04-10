# ✅ Payment System Upgrade - Testing Guide

## 🧪 Test Each Feature Step-by-Step

### Prerequisites
- Backend running on port 5001
- Frontend running on port 5173
- Logged in as Admin user
- 14 students imported (or any students with pending payments)

---

## Test 1: Payment Collection Modal

**Steps:**
1. Go to **Students** page
2. Click on any student with pending payments (like "Lubna Junaid")
3. StudentLedger opens
4. Scroll down to "Next Installment Due" section
5. Click **"Collect Payment"** button

**Expected Result:**
```
✅ Modal popup appears with:
   - Title: "Collect Installment Payment"
   - Credit card icon 💳
   - Installment number (e.g., #1)
   - Amount in large text (e.g., Rs. 10,000)
   - Due date shown
   - Input field with "Amount Collected"
   - ₨ symbol on input
   - "Confirm Payment" button
   - "X" close button
```

**Verify:**
- [ ] Modal is centered on screen
- [ ] Modal has dialog backdrop (dark background)
- [ ] Amount field is pre-filled with installment amount
- [ ] Modal is responsive (works on mobile too)

---

## Test 2: Payment Collection Execution

**Steps:**
1. With payment modal open
2. Amount should be pre-filled (e.g., 10,000)
3. Click **"Confirm Payment"** button

**Expected Result:**
```
✅ Modal closes
✅ Payment status updates to "Paid"
✅ Green "✅ PAID" badge appears
✅ PDF download icon appears beside payment
✅ Next pending installment shows in banner (if exists)
✅ Tuition Clearance bar increases
```

**Verify:**
- [ ] Modal closes smoothly
- [ ] Page refreshes with updated data
- [ ] Payment table shows new status
- [ ] No errors in console

---

## Test 3: Overdue Payment Alert

**Create Overdue Scenario:**
1. Find a student with payment due in the past
   - Example: Due date is 2025-08-01, today is 2026-02-19
   - Any payment with past due date = overdue

**Steps:**
1. Open student with overdue payments
2. Look for alert banner

**Expected Result:**
```
✅ Red alert banner appears with:
   ⚠️  Overdue Payment Alert
   Installment #1 due on 2025-08-01 is overdue.
   Please collect payments immediately.
```

**In Payment Table:**
```
✅ Overdue installment shows:
   - RED background status badge
   - "OVERDUE" text in red
   - ⚠️ warning emoji
   - "⚠️ Collect Now" button (red) instead of "Collect"
```

**In Students List:**
```
✅ Student card shows:
   - Pulsing RED badge: "Overdue Status"
   - Pulsing animation continuously
   - Student name highlighted
```

**Verify:**
- [ ] Alert banner appears only for overdue
- [ ] Red badges visible in table
- [ ] Pulsing animation activates
- [ ] Color scheme correct (red = urgent)

---

## Test 4: Due Soon Alert (Optional)

**Create Due Soon Scenario:**
- Set due date to 5 days from today

**Expected Result:**
```
✅ Yellow "DUE SOON" badge appears
✅ Status shows "⏳ Pending" in amber
```

---

## Test 5: Data Display - Course Name

**Steps:**
1. Open any student ledger
2. Look at "Academic Path" card (top section)
3. Look at "Cohort / Batch" card (top section)

**Expected Result:**
```
❌ Before (Old):
Academic Path: N/A
Cohort / Batch: N/A

✅ After (New):
Academic Path: Medical Billing
Cohort / Batch: MBC Batch 3
```

**Verify:**
- [ ] Shows actual course name (not N/A)
- [ ] Shows actual batch name (not N/A)
- [ ] Both pull from correct database

---

## Test 6: PDF Download with Logo

**Steps:**
1. Find a student with paid installments
2. In payment table, look for paid (green) installments
3. Click **PDF download icon** next to paid payment

**Expected Result:**
```
✅ PDF downloads with filename:
   Voucher_StudentName_Inst_1.pdf

✅ PDF contains:
   - Institute logo (top left)
   - Institute name
   - "Official Payment Voucher" title
   - Student info section:
     * Student Name
     * Contact Number
     * Course / Program
     * Batch / Cohort
   - Payment Details section:
     * Tuition Installment #X
     * Due Date
     * Amount Paid (Rs. 15,000)
   - Professional footer:
     * Address
     * Contact number
     * Website
     * Generated date
```

**Verify:**
- [ ] PDF downloads successfully
- [ ] Logo appears in PDF (if uploaded in Settings)
- [ ] Student info is correct
- [ ] Payment amount matches
- [ ] Professional formatting

---

## Test 7: Complete Fee Report

**Steps:**
1. Open student ledger
2. Scroll to "Financial Installment Ledger" section
3. Click **"Download Full Report"** button (right side)

**Expected Result:**
```
✅ PDF downloads with filename:
   Complete_Fee_Report_StudentName.pdf

✅ PDF contains:
   - Logo and institute branding
   - All payment records in table:
     * Installment # | Due Date | Amount | Status ✓ PAID / ⏳ PENDING
   - Complete financial summary:
     * Total student fee
     * Scholarship/discount applied
     * Amount collected
     * Amount pending
   - Professional formatting
```

**Contents Check:**
- [ ] All installments listed
- [ ] Status shows Paid (✓) or Pending (⏳)
- [ ] Amounts in PKR with proper formatting
- [ ] Total fees and pending calculated correctly

---

## Test 8: Master Edit Functionality

**Steps:**
1. Open student ledger
2. Click **"Master Edit"** button (top right, for admin only)
3. Panel expands showing edit fields

**Expected Result:**
```
✅ Edit panel shows:
   - Scholar Name field
   - Contact Number field
   - System Status dropdown
   - Scholarship Credit field
   - Installment Cycles field
```

**Modify and Save:**
1. Change discount amount (e.g., from 0 to 5000)
2. Change installments (e.g., from 3 to 2)
3. Click **"Commit Changes"**

**Expected Result:**
```
✅ Payment schedule recalculates
✅ Each installment amount updates
✅ Tuition Clearance bar updates
✅ Financial totals recalculate
```

**Verify:**
- [ ] Math is correct: (totalFee - discount) / installments
- [ ] All payments regenerated
- [ ] UI refreshes properly

---

## Test 9: Responsive Design

**Desktop (1024px+):**
```
✅ Full layout visible
✅ Table shows all columns
✅ All buttons accessible
✅ Modals centered properly
```

**Tablet (768px):**
```
✅ Grid adjusts to 2 columns
✅ Payment table scrolls if needed
✅ Buttons stack properly
✅ Modal still functional
```

**Mobile (375px):**
```
✅ Single column layout
✅ Table converts to mobile view
✅ Payment modal takes full width (with padding)
✅ Buttons are tap-friendly (44px minimum)
✅ No horizontal scrolling
```

---

## Test 10: Admin-Only Features

**Setup:**
1. Login as Admin
2. Open any student

**Expected to See:**
```
✅ "Collect Payment" button visible
✅ "Master Edit" button visible  
✅ Payment collection modal works
✅ Edit panel accessible
```

**Setup:**
1. Logout (or test as non-admin user)
2. Open any student

**Expected to NOT See:**
```
✅ "Collect Payment" button hidden
✅ "Master Edit" button hidden
✅ No payment collection allowed
✅ No edit capabilities
```

---

## Test 11: Real-Time Updates

**Steps:**
1. Open student ledger in two browser tabs
2. In Tab 1: Collect a payment
3. In Tab 2: Refresh page

**Expected Result:**
```
✅ Tab 2 shows updated payment status
✅ Paid amount increased
✅ Tuition clearance bar reflects new amount
✅ No manual refresh needed in same tab
```

---

## Test 12: Error Handling

**Test Empty Amount:**
1. Open payment modal
2. Clear the amount field
3. Click "Confirm Payment"

**Expected Result:**
```
✅ Alert: "Please enter a valid amount"
✅ Payment not processed
✅ Modal stays open
```

**Test Negative Amount:**
1. Enter negative number in amount field
2. Click "Confirm Payment"

**Expected Result:**
```
✅ Alert: "Please enter a valid amount"
✅ Payment not processed
```

---

## Test 13: Student List Overdue Badges

**Steps:**
1. Go to **Students** page (main list)
2. Look for students with overdue payments

**Expected Result:**
```
Grid View:
✅ Red pulsing badge: "Overdue"
✅ Badge animates continuously
✅ Matches student with actual overdue

List View:
✅ Red pulsing badge: "Overdue Status"
✅ Clear visual indicator
✅ Easy to spot problem students
```

---

## Test 14: Navigation & UX

**Modal Interactions:**
```
✅ ESC key closes modal (if implemented)
✅ Clicking X button closes modal
✅ Clicking confirm executes payment
✅ Click outside modal does not close it (intentional)
```

**Page Navigation:**
```
✅ Can open/close modals smoothly
✅ No console errors
✅ Payment updates don't cause lag
✅ PDF generation completes
```

---

## ✅ Final Verification Checklist

- [ ] Payment modal opens and closes
- [ ] Payment collection works
- [ ] Overdue alerts display correctly
- [ ] Course names show (not N/A)
- [ ] Batch names show (not N/A)
- [ ] PDF downloads with logo
- [ ] Complete fee report generates
- [ ] Master edit recalculates properly
- [ ] Mobile layout responsive
- [ ] Admin features hidden for non-admins
- [ ] Red badges update in real-time
- [ ] No console errors
- [ ] Tuition clearance bar updates
- [ ] All buttons are clickable
- [ ] Data persists on refresh

---

## 🎯 Demo Ready

Once all tests pass:
```
✅ System is PRODUCTION READY
✅ Safe for live demo
✅ All features functional
✅ No errors or warnings
✅ Professional appearance
```

---

## 🐛 Troubleshooting

**Modal doesn't appear:**
- [ ] Check you're logged in as Admin
- [ ] Check student has pending payments
- [ ] Check browser console for errors
- [ ] Refresh page and try again

**PDFs don't download:**
- [ ] Check internet connection (needs font CDN)
- [ ] Check student has valid data
- [ ] Try different browser
- [ ] Check file download settings

**Overdue badges don't show:**
- [ ] Check payment.date is in past
- [ ] Check payment.status is "Pending"
- [ ] Refresh browser cache
- [ ] Check today's date is correct

**Course/Batch showing N/A:**
- [ ] Verify courses exist in database
- [ ] Check courseId and batchId are linked
- [ ] Verify student has courseId/batchId set
- [ ] Refresh and reload data

---

**Last Updated:** February 19, 2026  
**Test Version:** 1.0  
**Status:** Ready for Testing ✅

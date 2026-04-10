# Quick Testing Guide - Hunar Asaan CRM Fixes

## 🚀 Quick Start

### Prerequisites
1. **Backend running on Port 5001**
   ```bash
   cd server
   npm start
   # Should show: "Server running on http://localhost:5001"
   ```

2. **Frontend running on Port 5173**
   ```bash
   npm run dev
   # Should show: "VITE v... ready in ... ms"
   ```

---

## ✅ Test 1: Admission Calculations (RegistrationForm.jsx)

### Steps:
1. Login as Admin
2. Navigate to **Students → Direct Admission**
3. Fill in basic student info:
   - Scholar Identifier: Auto-generated (click MODIFY to override)
   - Full Legal Name: "Test Student"
   - Email: "test@example.com"
   - Contact: "+92 300 0000000"

4. **Select Course** (Key Test)
   - Choose "Medical Billing (Rs. 30,000)"
   - **VERIFY:** Right panel shows "Base Tuition = Rs. 30,000" ✅
   - If shows Rs. 0, there's an issue

5. **Test Installment Calculation**
   - Set "Installment Cycles" to **2 Installments**
   - **VERIFY:** "Cycle Installment" shows exactly **Rs. 15,000** ✅
   - (30,000 ÷ 2 = 15,000)

6. **Test Discount Subtraction** (Real-time)
   - Enter "Flat Discount" = 5,000
   - **VERIFY:** Right panel updates in real-time:
     - Base Tuition: Rs. 30,000
     - Scholarship: - Rs. 5,000
     - Total Payable: Rs. 25,000 ✅
     - Cycle Installment: Rs. 12,500 ✅

7. **Test 3 Installments**
   - Change to "3 Installments"
   - **VERIFY:** "Cycle Installment" = Rs. 8,333 ✅
   - (25,000 ÷ 3 = 8,333.33 → rounded)

### Expected Results: ✅
- All calculations instant (real-time)
- Numbers accurate after discount
- Installment amounts correct
- Form submits successfully
- Student created in database

---

## ✅ Test 2: Student Ledger (StudentLedger.jsx)

### Steps:
1. Navigate to **Students** page
2. Click on any student (e.g., one you just created)
3. **CRITICAL TEST:** Ledger should load WITHOUT white screen ✅

### What Should Display:
- Student profile card with photo/avatar
- Quick Stats (4 cards):
  - Academic Path (course name)
  - Cohort/Batch name
  - Total Scholarship (discount)
  - Tuition Clearance (paid / total)

- **Payment Table:**
  - Shows all installments
  - Columns: Installment, Date, Amount, Status, Action

### Test Payment Actions:
1. **For Pending Payments:**
   - Button shows: "Pay Installment" (green)
   - Click button
   - **VERIFY:** Payment marked as "Paid" ✅
   - Download button appears ✅

2. **For Paid Payments:**
   - Shows checkmark icon ✅
   - Shows "Download PDF" button ✅
   - Click download
   - **VERIFY:** PDF downloads correctly ✅

3. **Test "Current Month Fee" Button:**
   - Should show prominently at top
   - Click "Pay Current Month Fee"
   - **VERIFY:** Payment processes ✅

4. **Test "Download Complete Fee Report":**
   - Click button in table header
   - **VERIFY:** PDF downloads with all installments ✅

### Expected Results: ✅
- No white screen error
- All payments display correctly
- Payment status updates instantly
- PDF downloads work (both individual & complete)
- Evidence image shows if available

---

## ✅ Test 3: Responsive Design (Mobile)

### Desktop Test (1024px+):
1. Should see full table layout
2. All 5 columns visible
3. Buttons aligned right
4. Smooth scrolling

### Tablet Test (768px):
1. Grid shows 2 columns
2. Stats cards readable
3. Table still visible with horizontal scroll
4. Buttons stack properly

### Mobile Test (375px - 480px):
1. **Header:** Avatar stacks above text ✅
   - Student name visible
   - Status badge below name
   - ID and phone in column

2. **Stats Cards:** Stack vertically (1-2 per row)
   - Each card readable on small screen ✅
   
3. **Payment Table:** Card-based layout
   - Each payment is a "card"
   - Labels appear before values
   - Buttons full width and tappable
   - "Pay" button visible (not "Pay Installment" if space limited) ✅

4. **Download Button:** 
   - Full width on mobile ✅
   - "Download Full Report" text readable

5. **Current Month Fee:**
   - Button stacks below amount on mobile
   - Full width and easy to tap ✅

### No Issues Should Appear:
- ❌ No horizontal scrolling
- ❌ No text cutoff
- ❌ No overlapping elements
- ❌ All buttons clickable (44px+ touch target)
- ✅ Everything readable without zooming

---

## 🧪 Network & API Tests

### Verify API Port (Port 5001):

1. Open **DevTools** (F12)
2. Go to **Network** tab
3. Click on any student
4. Look for requests:
   - Should see: `http://localhost:5001/api/students`
   - Should NOT see: `http://localhost:5000/...`
   - All requests should be successful (200 status) ✅

5. Check **Console** tab:
   - Should be clean
   - ❌ No "Cannot reach server" errors
   - ❌ No "CORS" errors
   - ❌ No "undefined" errors

### Evidence Image Test:
1. If student has evidence photo
2. Should load from: `http://localhost:5001/uploads/...` ✅
3. Image displays correctly
4. No 404 errors in console

---

## 🔧 Debugging Checklist

### If Tests Fail:

**White Screen on Student Click?**
```
Solution: Check if backend is running
$ ps aux | grep node
Should see: server/index.js running on 5001
```

**Calculations Show Rs. 0?**
```
Debug: Open DevTools Console
Check: courses data in AppContext
Verify: course.fee is a number, not string
```

**PDF Download Fails?**
```
Check: Internet connection (Font CDN needed)
Try: Incognito/Private browser mode
Test: Different browser
```

**Mobile Layout Broken?**
```
Solution: Clear browser cache (Ctrl+Shift+Delete)
Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```

**API Port Wrong?**
```
In vite.config.js, verify:
/api proxy → http://localhost:5001
Should be at line 12-15
```

---

## 📋 Full Checklist

| Feature | Status | Test Result |
|---------|--------|-------------|
| Course Selection Updates Amount | ✅ Fixed | ___ Pass/Fail |
| Installment Calculation Accurate | ✅ Fixed | ___ Pass/Fail |
| Discount Subtracts Real-time | ✅ Fixed | ___ Pass/Fail |
| StudentLedger Loads (No White Screen) | ✅ Fixed | ___ Pass/Fail |
| Payment Table Displays | ✅ Fixed | ___ Pass/Fail |
| Pay Installment Button Works | ✅ Fixed | ___ Pass/Fail |
| PDF Download (Individual) | ✅ Fixed | ___ Pass/Fail |
| PDF Download (Complete Report) | ✅ Fixed | ___ Pass/Fail |
| Mobile Responsive (375px) | ✅ Fixed | ___ Pass/Fail |
| Mobile Responsive (768px) | ✅ Fixed | ___ Pass/Fail |
| Desktop Layout (1024px+) | ✅ Fixed | ___ Pass/Fail |
| API Calls to Port 5001 | ✅ Fixed | ___ Pass/Fail |
| No Console Errors | ✅ Fixed | ___ Pass/Fail |

---

## 🎯 Success Criteria

All tests should show:
- ✅ No white screens
- ✅ Accurate calculations
- ✅ Responsive on all devices
- ✅ PDF downloads work
- ✅ No console errors
- ✅ API properly routed to 5001
- ✅ Smooth animations
- ✅ Fast load times

---

## 📞 Support

If any test fails:
1. Check FIXES_APPLIED.md for detailed info
2. Review file modifications:
   - src/components/students/RegistrationForm.jsx
   - src/components/students/StudentLedger.jsx
3. Clear browser cache
4. Restart both backend and frontend servers
5. Try in incognito/private mode

---

**Last Updated:** 2026-02-19
**Status:** ✅ Ready for Testing

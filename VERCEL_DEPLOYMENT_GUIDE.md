# ✅ VERCEL DEPLOYMENT - ENVIRONMENT VARIABLES GUIDE

## 📋 Quick Summary

Your project is now fully configured for Vercel Serverless Functions deployment.

**Repository:** https://github.com/muzamilsheikh/Hunar-asaan-crm
**Project Structure:**
- `/api` - Serverless backend functions (Express.js)
- `/src` - React frontend
- `/public` - Static assets
- `vercel.json` - Vercel configuration
- `package.json` - Root dependencies

---

## 🔐 REQUIRED Environment Variables for Vercel Dashboard

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**

### Add ALL of these variables:

#### 1. **NODE ENVIRONMENT**
```
KEY: NODE_ENV
VALUE: production
```

#### 2. **DATABASE CONFIGURATION** (Using Aiven MySQL)
```
KEY: DB_HOST
VALUE: your-database-id.aivencloud.com
(Get from Aiven dashboard)

KEY: DB_PORT
VALUE: 12345
(Default for Aiven: find in Connection details)

KEY: DB_USER
VALUE: avnadmin
(Or your custom Aiven user)

KEY: DB_PASSWORD
VALUE: your_aiven_password_here
(CRITICAL: Keep this secret!)

KEY: DB_NAME
VALUE: hunar_db
(Default database name)

KEY: DB_SSL
VALUE: true
(Required for Aiven cloud database)
```

#### 3. **AUTHENTICATION (JWT)**
```
KEY: JWT_SECRET
VALUE: [GENERATE NEW SECURE KEY - see below]

To generate a strong JWT secret, run in terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

Paste the output here (min 32 characters, random string)
```

#### 4. **EMAIL CONFIGURATION** (Using Gmail SMTP)
```
KEY: SMTP_HOST
VALUE: smtp.gmail.com

KEY: SMTP_PORT
VALUE: 587

KEY: SMTP_USER
VALUE: your-email@gmail.com

KEY: SMTP_PASS
VALUE: [16-CHARACTER APP PASSWORD - NOT regular Gmail password]

Follow Gmail setup:
1. Go to myaccount.google.com
2. Enable 2-Factor Authentication
3. Go to "App passwords" (apps.google.com/apppasswords)
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password
6. Paste it here (remove any spaces)

KEY: SMTP_FROM
VALUE: noreply@hunar-asaan.com
(Or your send-from email address)
```

#### 5. **FRONTEND URL**
```
KEY: APP_URL
VALUE: https://hunar-asaan-crm.vercel.app
(Update with your actual Vercel domain)
```

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### **Step 1: Connect GitHub to Vercel**
1. Go to **vercel.com** and sign in
2. Click "New Project"
3. Search for and select `Hunar-asaan-crm` repository
4. Click "Import"

### **Step 2: Configure Build Settings**
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### **Step 3: Add Environment Variables**
1. Go to **Settings → Environment Variables**
2. Add all variables from the list above
3. Make sure variables are set for **Production** environment

### **Step 4: Add Root Environment Variable**
```
KEY: VERCEL
VALUE: true
(Tells the API it's running on Vercel)
```

### **Step 5: Deploy**
1. Click "Deploy"
2. Wait for build to complete (3-5 minutes)
3. Verify with `/api/health` endpoint

---

## ✅ VERIFICATION STEPS

After deployment, test these endpoints:

### **1. Health Check**
```
GET https://your-vercel-domain.vercel.app/api/health
Response should show: "✅ Server is running"
```

### **2. Authentication**
```
POST https://your-vercel-domain.vercel.app/api/auth/login
Body: {
  "email": "admin@hunarasaan.com",
  "password": "Hunar123@321@123"
}
```

### **3. Get Students**
```
GET https://your-vercel-domain.vercel.app/api/students
(Requires valid JWT token in Authorization header)
```

---

## 📊 DATABASE SETUP INSTRUCTIONS (Aiven MySQL)

### **Create Aiven MySQL Database:**
1. Go to **aiven.io** and sign up (free tier available)
2. Create a new MySQL service
3. Choose region closest to your users
4. Wait for service to be ready (5-10 minutes)
5. Copy connection details:
   - **Host:** aiven-connection-id.aivencloud.com
   - **Port:** 12345 (or shown in your service)
   - **Username:** avnadmin (or custom user)
   - **Password:** Generated during setup

### **Important Database Notes:**
- Aiven automatically creates SSL certificates
- Set `DB_SSL=true` in Vercel environment
- Test connection before finalizing: `mysql -h host -P port -u user -p`

---

## 🔄 REDEPLOYMENT (After Code Changes)

```bash
# Make changes to code
git add .
git commit -m "Your changes"
git push origin main

# Vercel automatically detects push and redeploys!
# Check deployment status on vercel.com
```

---

## 🆘 TROUBLESHOOTING

### **Error: "Cannot find module './models'"**
→ Make sure `api/models/index.js` exists and has all model definitions

### **Error: "CORS policy error"**
→ Check `api/index.js` CORS configuration includes your Vercel URL

### **Error: "Database connection timeout"**
→ Verify DB credentials in Vercel dashboard match Aiven account
→ Check if database service is running on Aiven

### **Error: "JWT_SECRET is undefined"**
→ Make sure `JWT_SECRET` is added to Vercel environment variables
→ Redeploy after adding variables

### **Email not sending**
→ Verify SMTP credentials are correct (especially 16-char App Password)
→ Check Gmail account allows app access

---

## 📝 MIGRATION FROM SERVER FOLDER

Old structure → New structure:
- `/server/*` → `/api/*` ✅ Done
- `vercel.json` created ✅ Done
- `api/index.js` optimized for serverless ✅ Done
- `package.json` merged with dependencies ✅ Done
- Pushed to GitHub ✅ Done

---

## 🎉 FINAL CHECKLIST

- [ ] All 13 environment variables added to Vercel
- [ ] GitHub repository connected to Vercel
- [ ] Build settings configured (Vite, npm i, npm run build)
- [ ] Deployment triggered and completed
- [ ] `/api/health` endpoint returns success
- [ ] Database credentials verified in Aiven
- [ ] SSL certificates configured (Aiven handles this)
- [ ] CORS includes your Vercel domain
- [ ] JWT_SECRET is strong and random
- [ ] Tested login endpoint with credentials

---

## 📞 QUICK REFERENCE

**Admin Credentials:**
- Email: `admin@hunarasaan.com`
- Password: `Hunar123@321@123`

**API Endpoints (13 total):**
1. `/api/auth` - Authentication
2. `/api/students` - Student management
3. `/api/courses` - Course management
4. `/api/batches` - Batch management
5. `/api/expenses` - Expense tracking
6. `/api/settings` - System settings
7. `/api/live-classes` - Live classes
8. `/api/chat` - Messaging
9. `/api/payments` - Payments
10. `/api/stats` - Analytics
11. `/api/users` - User management
12. `/api/enrollments` - Enrollments
13. `/api/reports` - Reports
*Plus:* `/api/health` - Health monitoring

**Support Links:**
- Vercel Docs: https://vercel.com/docs
- Aiven Docs: https://docs.aiven.io
- Express.js: https://expressjs.com
- React: https://react.dev

---

**✅ You're all set! Proceed with Vercel deployment now.**

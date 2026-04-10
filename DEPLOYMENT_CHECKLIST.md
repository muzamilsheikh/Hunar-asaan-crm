# 🚀 Hunar Asaan CRM - Complete Deployment Checklist

## ✅ Project Health Check Summary

**Status**: ✅ **READY FOR DEPLOYMENT** (with minor configurations)

All critical components are properly configured. Follow this checklist for successful deployment.

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### 1. 🔑 Environment Variables

#### Frontend (.env file needed in root)
Currently **MISSING** - Create `/Users/muzamilirfan/Library/Mobile Documents/com~apple~CloudDocs/Muzamil Irfan/Hunar Asaan CRM 3/.env`:

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
NODE_ENV=production
```

#### Backend (server/.env) ✅ EXISTS
**Current Configuration:**
```env
NODE_ENV=development
APP_URL=http://localhost:5173

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=hunar_db
JWT_SECRET=hunar_asaan_jwt_secret_2026

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

**⚠️ CRITICAL FOR PRODUCTION:**
- Change `NODE_ENV=production`
- Update `APP_URL` to your production domain
- Set strong `DB_PASSWORD`
- Change `JWT_SECRET` to a secure random string (min 32 characters)
- Configure real SMTP credentials or disable email notifications

---

### 2. 🗄️ Database Requirements

**Current Setup:**
- MySQL Database: `hunar_db`
- User: `root`
- Password: (empty)
- Host: `localhost`

**Production Requirements:**
1. Create production database with strong password
2. Export current data:
   ```bash
   mysqldump -u root hunar_db > hunar_db_backup.sql
   ```
3. Import to production server
4. Update `server/.env` with production credentials

---

### 3. 🏗️ Build Configuration

#### Frontend Build
**Package.json Scripts:**
```json
"build": "vite build",
"preview": "vite preview"
```

**Build Command:**
```bash
npm run build
```

**Output:** `dist/` folder (ready for static hosting)

#### Backend Build
**No compilation needed** (Node.js runs directly)

**Start Command:**
```bash
npm start
```

---

### 4. 🌐 Port Configuration

**Development:**
- Frontend: Vite dev server on port **5173**
- Backend: Express on port **5001**
- Proxy configured: `/api/*` → `http://localhost:5001`

**Production Options:**

**Option A: Separate Domains (Recommended)**
```
Frontend: https://crm.yourdomain.com (static hosting)
Backend:  https://api.yourdomain.com (Node.js server)
```

Update `vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/',
  // Remove proxy for production
})
```

Update `src/utils/api.js`:
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.yourdomain.com',
  // ... rest of config
});
```

**Option B: Same Domain (Subdirectory)**
```
Frontend + Backend on same domain
/frontend → React app
/backend/api → Express API
```

Requires reverse proxy (Nginx/Apache) configuration.

---

### 5. 🔒 Security Checklist

#### Before Deploying:

- [ ] Change JWT_SECRET to cryptographically secure value
- [ ] Set strong database password
- [ ] Enable HTTPS (SSL certificate)
- [ ] Configure CORS for production domain only
- [ ] Remove development origins from CORS whitelist
- [ ] Enable rate limiting on API
- [ ] Add helmet.js security headers
- [ ] Sanitize all user inputs
- [ ] Enable SQL injection protection (Sequelize has this built-in)
- [ ] Configure CSP headers
- [ ] Remove console.logs from production code

#### Update CORS in `server/index.js`:

```javascript
app.use(cors({
    origin: process.env.APP_URL || 'http://localhost:5173',
   credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

### 6. 📦 Dependencies Check

#### Frontend Dependencies ✅
All dependencies are properly installed:
- React 19.2.0
- Axios 1.13.5
- Socket.io-client 4.8.3
- React Router DOM 7.13.0
- Recharts 3.7.0
- Framer Motion 12.34.0
- Lucide React 0.564.0
- Tailwind CSS 4.1.18
- @react-pdf/renderer 4.3.2

#### Backend Dependencies ✅
All dependencies are properly installed:
- Express 5.2.1
- Sequelize 6.37.7
- MySQL2 3.17.2
- Socket.io 4.8.3
- JSON Web Token 9.0.3
- BcryptJS 3.0.3
- Nodemailer 8.0.1
- Multer 2.0.2

---

### 7. 🧪 Testing Checklist

**Test These Critical Flows:**

1. **Authentication**
   - [ ] Login with admin account
   - [ ] Login with staff account
   - [ ] Login with student account
   - [ ] JWT token refresh
   - [ ] Logout and session clearing

2. **Student Management**
   - [ ] Register new student
   - [ ] Edit student discount
   - [ ] View student ledger
   - [ ] Calculate remaining balance
   - [ ] Payment processing

3. **Financial Reports**
   - [ ] Generate monthly report
   - [ ] Generate yearly report
   - [ ] Generate custom date range report
   - [ ] Download PDF reports
   - [ ] Gross Business Value calculation (Rs. 115,000)

4. **Dashboard**
   - [ ] Total Students metric
   - [ ] Pending Fees display
   - [ ] Revenue calculation
   - [ ] Net Profit/Loss
   - [ ] Charts and graphs rendering

5. **Real-time Features**
   - [ ] Socket.io connection
   - [ ] Live chat functionality
   - [ ] Live class notifications

6. **Data Persistence**
   - [ ] Database connections stable
   - [ ] No data loss on refresh
   - [ ] Proper error handling

---

### 8. 🚨 Common Issues & Solutions

#### Issue 1: CORS Errors in Production
**Solution:**Update CORS whitelist in `server/index.js` with production domain

#### Issue 2: Database Connection Fails
**Solution:** 
- Check MySQL service is running
- Verify credentials in `.env`
- Ensure database exists
- Check firewall allows MySQL port (3306)

#### Issue 3: Socket Connection Fails
**Solution:**
- Update socket URL in `AppContext.jsx`
- Configure WebSocket proxy or use direct connection
- Check firewall allows WebSocket port

#### Issue 4: Build Fails
**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Issue 5: White Screen After Deploy
**Solution:**
- Check browser console for errors
- Verify API base URL is correct
- Check network tab for failed requests
- Ensure backend is running

---

## 🎯 DEPLOYMENT STEPS

### Step 1: Prepare Production Files

**Create Production .env:**
```bash
# Frontend .env
echo "VITE_API_URL=https://api.yourdomain.com" > .env
echo "VITE_SOCKET_URL=https://api.yourdomain.com" >> .env
```

**Update Backend .env:**
```bash
cd server
nano .env
# Update all production values
```

### Step 2: Build Frontend

```bash
npm run build
```

Output will be in `dist/` folder.

### Step 3: Deploy Backend

**Option A: VPS/Dedicated Server**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone <your-repo>
cd hunar-asaan-crm

# Install dependencies
npm install
cd server
npm install

# Start with PM2 (process manager)
npm install -g pm2
pm2 start server/index.js --name hunar-crm-api
pm2 save
pm2 startup
```

**Option B: Docker**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5001
CMD ["node", "server/index.js"]
```

### Step 4: Deploy Frontend

**Option A: Static Hosting (Netlify/Vercel)**
```bash
# Push to GitHub
git add .
git commit -m "Production build"
git push

# Connect to Netlify/Vercel
# They auto-detect Vite and build
```

**Build Settings:**
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables: Set `VITE_API_URL`

**Option B: Same Server as Backend**
```bash
# Copy dist files to web server
cp -r dist/* /var/www/html/

# Or serve with Nginx
server {
    listen 80;
   server_name crm.yourdomain.com;
    
    location / {
        root /var/www/hunar-crm;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 5: Configure SSL (HTTPS)

**Using Let's Encrypt (Free):**
```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d crm.yourdomain.com -d api.yourdomain.com
```

### Step 6: Database Migration

```bash
# Export from development
mysqldump -u root hunar_db > backup.sql

# Import to production
mysql -u production_user -p production_db < backup.sql
```

### Step 7: Test Production

1. Visit `https://crm.yourdomain.com`
2. Login with admin credentials
3. Test all major features
4. Check browser console for errors
5. Verify API calls working
6. Test real-time features (chat, live classes)

---

## 📊 MONITORING & MAINTENANCE

### Essential Tools:

1. **PM2 (Process Manager)**
   ```bash
   pm2 monit          # Real-time monitoring
   pm2 logs           # View logs
   pm2 restart all    # Restart services
   ```

2. **Database Monitoring**
   ```sql
   SHOW PROCESSLIST;  # Active connections
   SHOW STATUS;       # Server statistics
   ```

3. **Error Tracking**
   - Sentry.io (free tier available)
   - LogRocket for frontend
   - Custom logging with Winston/Morgan

### Backup Strategy:

**Daily Automated Backups:**
```bash
# Crontab entry (daily at 2 AM)
0 2 * * * mysqldump -u root hunar_db > /backups/hunar_db_$(date +\%Y\%m\%d).sql
```

**Weekly Offsite Backup:**
- Upload to Google Drive/Dropbox
- Use AWS S3 or similar

---

## 🔧 POST-DEPLOYMENT TASKS

### Immediate Tasks:

1. **Change Default Credentials**
   - Admin email: `mujtaba@hunarasaan.com`
   - Change passwords immediately

2. **Configure Email Notifications**
   - Update SMTP settings
   - Test email sending
   - Configure from address

3. **Set Up Monitoring**
   - Uptime monitoring (UptimeRobot, Pingdom)
   - Error tracking (Sentry)
   - Performance monitoring

4. **Configure Backups**
   - Daily database backups
   - Weekly full backups
   - Test restore procedure

### Ongoing Maintenance:

- [ ] Weekly: Check error logs
- [ ] Weekly: Verify backups working
- [ ] Monthly: Update dependencies
- [ ] Monthly: Security audit
- [ ] Quarterly: Performance review
- [ ] Quarterly: Database optimization

---

## 📱 FEATURES TO TEST BEFORE GO-LIVE

### Core Features:
- ✅ Dashboard with Gross Business Value (Rs. 115,000)
- ✅ Student Registration & Management
- ✅ Batch Management
- ✅ Course Catalog
- ✅ Expense Tracking
- ✅ Financial Reports (Monthly/Yearly/Custom)
- ✅ PDF Report Generation
- ✅ Student Ledger
- ✅ Payment Processing
- ✅ Recovery Alerts
- ✅ Pending Fees Summary

### Advanced Features:
- ✅ Live Chat (Socket.io)
- ✅ Live Classes
- ✅ Role-based Access Control
- ✅ JWT Authentication
- ✅ Real-time Updates
- ✅ Responsive Design

---

## 🎉 FINAL CHECKLIST

Before announcing to users:

- [ ] All features tested and working
- [ ] No console errors
- [ ] HTTPS enabled
- [ ] Backups configured
- [ ] Monitoring active
- [ ] Documentation updated
- [ ] User training completed
- [ ] Support system ready
- [ ] Rollback plan prepared

---

## 🆘 EMERGENCY CONTACTS & RESOURCES

### Critical Files Locations:
- Frontend: `/Users/muzamilirfan/Library/Mobile Documents/com~apple~CloudDocs/Muzamil Irfan/Hunar Asaan CRM 3/`
- Backend: `/Users/muzamilirfan/Library/Mobile Documents/com~apple~CloudDocs/Muzamil Irfan/Hunar Asaan CRM 3/server/`
- Database: MySQL `hunar_db`
- Logs: `server.log`, browser console

### Quick Rollback:
```bash
# If something breaks:
git stash                    # Revert local changes
git pull origin main         # Get last known good version
npm install                  # Reinstall dependencies
npm run build                # Rebuild
pm2 restart all              # Restart services
```

---

## 📞 SUPPORT

For issues or questions:
- Check logs first (`server.log`, browser console)
- Review error messages carefully
- Search GitHub issues
- Contact development team

---

**🚀 You're ready to deploy! Good luck!**

*Last Updated: February 18, 2026*
*Version: 1.0.0*

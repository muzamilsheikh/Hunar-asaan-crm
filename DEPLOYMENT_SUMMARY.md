# 📋 Hunar Asaan CRM - Quick Deployment Reference

## 🎯 PROJECT AT A GLANCE

**Type:** Full-Stack MERN (React + Express + MySQL + Socket.io)  
**Status:** ✅ Production Ready  
**Main Language:** JavaScript (ES6+)

---

## 📂 FOLDER STRUCTURE

| Component | Location | Purpose |
|-----------|----------|---------|
| **Frontend** | `/src` | React components, pages, context, styles |
| **Backend API** | `/server` | Express routes, controllers, models, middleware |
| **Frontend Config** | `/vite.config.js` | Build settings for production |
| **Backend Config** | `/server/index.js` | Server startup, CORS, database init |
| **Build Output** | `/dist` | Generated frontend (after `npm run build`) |

---

## 🚀 START COMMANDS

```bash
# Frontend (Vite dev server)
npm install
npm run dev              # Port 5173
npm run build            # Creates dist/ folder

# Backend (Express server)
cd server
npm install
npm start                # Port 5001
# or
node index.js

# Seed database with admin user
cd server
node seedData.js
```

---

## 🔐 REQUIRED ENVIRONMENT VARIABLES

### Backend (server/.env)
```env
NODE_ENV=production
PORT=5001
APP_URL=https://yourdomain.com

DB_HOST=cloud-db-host
DB_USER=dbuser
DB_PASSWORD=strong-password
DB_NAME=hunar_db
JWT_SECRET=random-32-char-key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@gmail.com
SMTP_PASS=gmail-app-password
SMTP_FROM=notifications@yourdomain.com
```

### Frontend (root/.env)
```env
VITE_API_URL=https://yourdomain.com/api
VITE_SOCKET_URL=https://yourdomain.com
NODE_ENV=production
```

---

## 🗄️ DATABASE

**Type:** MySQL  
**Name:** `hunar_db` (auto-created by Sequelize)

**Tables:** 12
- Users, Courses, Batches, Students, Enrollments
- Payments, Expenses, LiveClasses
- ChatGroups, ChatMessages, Settings

**Schema:** Defined in `server/models/index.js` (Sequelize ORM)

**Auto-sync:** When server starts, Sequelize automatically creates/syncs all tables

---

## 📡 API ENDPOINTS

**Base URL:** `/api`

| Endpoint | Methods |
|----------|---------|
| `/auth` | POST (login, register) |
| `/students` | GET, POST, PUT, DELETE |
| `/courses` | GET, POST, PUT, DELETE |
| `/batches` | GET, POST, PUT, DELETE |
| `/payments` | GET, POST, PUT, DELETE |
| `/enrollments` | GET, POST, PUT, DELETE |
| `/expenses` | GET, POST, PUT, DELETE |
| `/live-classes` | GET, POST, PUT, DELETE |
| `/chat` | GET, POST (messages) |
| `/stats` | GET (dashboard data) |
| `/reports` | GET, POST |
| `/settings` | GET, POST |
| `/users` | GET, POST, PUT, DELETE |
| `/health` | GET (server status) |

---

## 🌐 CORS CONFIGURATION

**Currently allows:** localhost:5173-5176

**Update before production** in `server/index.js`:
```javascript
origin: ['https://yourdomain.com', 'https://www.yourdomain.com']
```

---

## 🔑 IMPORTANT FILES

| File | Purpose |
|------|---------|
| `server/index.js` | **Server entry point** |
| `server/models/index.js` | **All database models & SQL schema** |
| `server/.env` | **Production credentials** |
| `vite.config.js` | Frontend build configuration |
| `src/context/AppContext.jsx` | State management & API calls |
| `src/utils/api.js` | HTTP client with JWT interceptor |
| `tailwind.config.js` | Styling configuration |

---

## 🛠️ QUICK SETUP

1. **Install dependencies:**
   ```bash
   npm install
   cd server && npm install
   ```

2. **Create `.env` files:**
   - `server/.env` (with production DB credentials)
   - `root/.env` (with API URLs)

3. **Build frontend:**
   ```bash
   npm run build
   ```

4. **Start backend:**
   ```bash
   cd server && npm start
   ```

5. **Seed initial data:**
   ```bash
   cd server && node seedData.js
   ```

6. **Admin credentials:**
   - Email: `admin@hunarasaan.com`
   - Password: `Hunar123@321@123`

---

## ⚠️ CRITICAL CHANGES FOR PRODUCTION

1. Update CORS origins in `server/index.js`
2. Change `NODE_ENV=development` → `production`
3. Generate new `JWT_SECRET` (secure random string)
4. Set strong `DB_PASSWORD`
5. Use cloud database (AWS RDS, PlanetScale, etc.)
6. Create `root/.env` file
7. Configure SMTP or disable email

---

## 📦 DEPLOYMENT OPTIONS

**Frontend:**
- Vercel (recommended) - just upload dist/
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Traditional web hosting

**Backend:**
- Railway.app
- Render.com
- Heroku
- AWS EC2 + PM2
- DigitalOcean
- Linode

**Database:**
- AWS RDS (MySQL)
- PlanetScale (MySQL compatible)
- DigitalOcean Managed Databases
- Traditional hosting with cPanel

---

## 🧪 TEST ENDPOINTS

```bash
# Health check
curl http://localhost:5001/api/health

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hunarasaan.com","password":"Hunar123@321@123"}'
```

---

## 📞 DEPLOYMENT CHECKLIST

- [ ] Both `package.json` files have all dependencies
- [ ] `.env` files created with production values
- [ ] Database can be accessed from deployment server
- [ ] CORS origins updated for production domain
- [ ] Frontend built (`dist/` folder created)
- [ ] Backend can start without errors
- [ ] Database tables created/synced successfully
- [ ] Admin user seeded
- [ ] API endpoints responding correctly
- [ ] WebSocket connections working
- [ ] SSL/HTTPS enabled on frontend
- [ ] SSL/HTTPS enabled on backend
- [ ] Backups configured for database

---

**Ready to deploy!** 🚀

Full guide: See `DEPLOYMENT_GUIDE_COMPLETE.md`

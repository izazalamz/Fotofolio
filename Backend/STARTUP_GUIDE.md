# 🚀 Fotofolio Backend Startup Guide

## ❌ Problem: Can't Access localhost:3000

If you're getting errors when trying to access `http://localhost:3000`, follow this troubleshooting guide step by step.

## 🔍 Step 1: Run Troubleshooting Script

First, let's identify what's wrong:

```bash
cd Backend
npm run troubleshoot
```

This will check:
- ✅ Node.js version
- ✅ Dependencies
- ✅ Database files
- ✅ Port availability
- ✅ File permissions

## 🛠️ Step 2: Common Issues & Solutions

### Issue 1: Dependencies Missing
```bash
npm install
```

### Issue 2: Database Not Initialized
```bash
npm run init-db
```

### Issue 3: Port Already in Use
```bash
# Kill process using port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process using port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill -9
```

### Issue 4: Server Won't Start
Try the simplified server that loads routes dynamically:
```bash
npm run simple
```

## 🚀 Step 3: Start the Server

### Option A: Standard Server
```bash
npm run dev
```

### Option B: Simplified Server (Recommended for troubleshooting)
```bash
npm run simple
```

### Option C: Production Mode
```bash
npm start
```

## 🌐 Step 4: Test the Server

Once the server is running, test these endpoints:

1. **Health Check**: `http://localhost:3000/health`
2. **Test Route**: `http://localhost:3000/test`
3. **API Categories**: `http://localhost:3000/api/categories`

## 📋 Step 5: Verify Database

Check if the database has data:
```bash
npm run test-data
```

## 🔧 Step 6: Manual Testing

If the server starts but you still can't access it:

1. **Check Console Output**: Look for error messages
2. **Check Browser Console**: Look for CORS or network errors
3. **Try Different Browser**: Test in incognito/private mode
4. **Check Firewall**: Ensure port 3000 isn't blocked

## 🐛 Common Error Messages

### "Cannot find module"
```bash
npm install
```

### "Port already in use"
```bash
npm run simple  # Uses dynamic route loading
```

### "Database connection failed"
```bash
npm run init-db
```

### "Permission denied"
```bash
# Windows: Run as Administrator
# Mac/Linux: Check file permissions
```

## 📱 Alternative Ports

If port 3000 is problematic, change it in `config.env`:
```env
PORT=3001
```

Then access: `http://localhost:3001`

## 🆘 Still Having Issues?

1. **Check the console output** when starting the server
2. **Run troubleshooting**: `npm run troubleshoot`
3. **Try simplified server**: `npm run simple`
4. **Check file permissions** and Node.js version
5. **Restart your terminal/command prompt**

## ✅ Success Indicators

When everything is working:
- ✅ Server starts without errors
- ✅ Console shows "Server is running on port 3000"
- ✅ `http://localhost:3000/health` returns JSON response
- ✅ Database contains dummy data (8 users, 15 photos, etc.)

## 🔄 Quick Reset

If all else fails, try a complete reset:
```bash
cd Backend
rm -rf node_modules package-lock.json
npm install
npm run init-db
npm run simple
```

---

**Need more help?** Check the console output and error messages for specific issues.

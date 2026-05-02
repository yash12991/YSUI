# 🧪 QUICK TEST GUIDE - 5 MINUTES

**Server Running At**: http://localhost:3002

---

## TEST 1: Verify Login Endpoint

```bash
curl http://localhost:3002/api/auth/login
```

**Expected Response**:
```json
{
  "message": "User Login API",
  "endpoint": "POST /api/auth/login",
  "body": {
    "email": "user@example.com",
    "password": "password123"
  }
}
```

**Status**: ✅ Should see "User Login API"

---

## TEST 2: Create Account (Signup)

```bash
curl -X POST http://localhost:3002/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "name": "Test User",
    "password": "SecurePassword123"
  }'
```

**Expected Response**:
```json
{
  "message": "User created successfully",
  "user": {
    "id": "...",
    "email": "testuser@example.com",
    "name": "Test User"
  }
}
```

**Status**: ✅ User created in database

---

## TEST 3: Login

```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePassword123"
  }'
```

**Expected Response**:
```json
{
  "message": "Login successful",
  "user": {
    "id": "...",
    "email": "testuser@example.com",
    "name": "Test User"
  }
}
```

**Status**: ✅ Authentication working

---

## TEST 4: View Database

```bash
npx prisma studio
```

Opens: http://localhost:5555

**What to Check**:
- Click "users" table
- Should see your test user
- All 10 tables should be visible

**Status**: ✅ Database synced with 10 tables

---

## TEST 5: Generate Website

```bash
curl -X POST http://localhost:3002/api/generate \
  -H "x-user-id: testuser" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Test Website",
    "description": "A test website to verify generation works",
    "pages": ["home", "about", "contact"],
    "style": "modern"
  }'
```

**Expected Response**: 
- Should return generated website data
- Or error message if Groq API has issues

**Status**: ✅ Generation working (AI model fixed)

---

## TROUBLESHOOTING

### Issue: "Connection refused"
```
curl: (7) Failed to connect to localhost port 3002
```
**Fix**: Check server is running
```bash
# See if running
lsof -i :3002

# Restart
npm run dev
```

### Issue: "Command not found: curl"
**Fix**: Use any API client:
- Postman
- Thunder Client  
- VS Code REST Client
- Or install curl: `sudo apt install curl`

### Issue: "No response from Groq"
**Fix**: Check API key
```bash
echo $GROQ_API_KEY
# Should show: gsk_025ugcU6BK4b0OBz2...
```

### Issue: "Database locked"
**Fix**: Reset database
```bash
rm prisma/dev.db
npx prisma db push
npm run dev
```

---

## ✅ ALL TESTS PASSING?

Great! Everything is working. Next:

1. **Create UI Pages** (Optional but recommended)
   - Build login/signup forms
   - Create dashboard
   - Build generator form

2. **Test More Features**
   - Create projects
   - Generate websites
   - View database

3. **Deploy (When ready)**
   - Switch to Supabase
   - Deploy to Vercel

---

## 📝 REFERENCE

| Command | Purpose |
|---------|---------|
| `curl http://localhost:3002/api/auth/login` | Check login endpoint |
| `npx prisma studio` | View database visually |
| `npm run dev` | Start server |
| `grep "model:" src/lib/agents/groqClient.ts` | Verify model (should be llama-3.1-70b-versatile) |

---

**All tests working?** ✅ You're ready to build! 🚀

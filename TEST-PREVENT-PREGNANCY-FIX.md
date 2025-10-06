# 🧪 Quick Test Guide - Prevent Pregnancy Fix

## 🎯 What Was Fixed

**Issue**: Clicking "Emergency" or "Prevent in future" after "How to prevent pregnancy" did nothing.  
**Fix**: Fixed case mismatch in button text vs code expectations.

---

## ✅ How to Test Locally

### 1. Start the Application

**Frontend** (Terminal 1):

```bash
cd "c:\Users\Omotowa Shalom\Downloads\Chatbot-responses-api\Chatbot\honey"
npm run dev
```

**Backend** (Terminal 2):

```bash
cd "c:\Users\Omotowa Shalom\Downloads\Chatbot-responses-api\Chatbot\server"
npm run start:dev
```

### 2. Open Browser

Go to: `http://localhost:5173`

### 3. Complete Demographics

- Select Language: English
- Select Gender: Any option
- Enter LGA: Any location
- Select Age: Any option
- Select Marital Status: Any option

### 4. Test Main Flow

#### Test Case 1: Emergency Contraception

1. ✅ Click **"How to prevent pregnancy"**
2. ✅ Should see: "I see! 👍 You are at the right place..."
3. ✅ Should see: "What kind of contraception do you want to know about?"
4. ✅ Click **"Emergency"**
5. ✅ Should see: "To avoid pregnancy after unprotected sex..."
6. ✅ Should see product options: Postpill, Postinor 2
7. ✅ Click one of the products
8. ✅ Should see product information with image/audio

#### Test Case 2: Future Prevention

1. ✅ Start new conversation (refresh page)
2. ✅ Complete demographics again
3. ✅ Click **"How to prevent pregnancy"**
4. ✅ Click **"Prevent in future"**
5. ✅ Should see: "For how long do you want protection?"
6. ✅ Should see duration options:
   - Up to 1 year
   - 1 to 3 years
   - 3 to 10 years
   - Permanently
7. ✅ Click any duration
8. ✅ Should see method options (pills, condoms, IUD, etc.)
9. ✅ Click a method
10. ✅ Should see method information with media

---

## 🔍 What to Look For

### ✅ Success Indicators

- **No blank screens** after clicking options
- **Smooth flow** from one step to the next
- **Messages appear** immediately after clicking
- **Widgets show up** with proper options
- **Console has no errors** (Press F12 to check)

### ❌ Failure Indicators

- **Nothing happens** after clicking (OLD BUG)
- **Console shows errors** like "Cannot read property..."
- **Widgets don't appear**
- **Messages don't show up**

---

## 🐛 If Something's Wrong

### Check Browser Console (F12)

Look for errors like:

- ❌ "Cannot match contraception type"
- ❌ "Widget not found"
- ❌ "handleEmergencyPath is not a function"

### Check Backend Terminal

Look for:

- ✅ "Conversation saved successfully"
- ❌ "Failed to save conversation"
- ❌ Database connection errors

### Common Issues

**Issue**: "Emergency" still doesn't work

- **Fix**: Hard refresh browser (Ctrl + Shift + R)
- **Fix**: Clear localStorage (F12 → Application → Local Storage → Clear)

**Issue**: No messages show up

- **Fix**: Check backend is running on port 3000
- **Fix**: Check frontend VITE_API_URL is correct

**Issue**: Widget doesn't appear

- **Fix**: Check config.tsx has the widget registered
- **Fix**: Check widget name matches exactly

---

## 📱 Test on Production (After Deployment)

Once deployed to Vercel:

1. Visit: `https://your-app.vercel.app`
2. Complete demographics
3. Test "Emergency" path
4. Test "Prevent in future" path
5. Verify all media (images/audio) loads

---

## 🎉 Expected Results

### Emergency Path

```
User: "How to prevent pregnancy"
Bot: "I see! 👍 You are at the right place..."
Bot: "What kind of contraception do you want to know about?"
User: "Emergency"
Bot: "To avoid pregnancy after unprotected sex..."
Bot: "Let me tell you about emergency pills..."
Bot: "Which product do you want to learn about?"
User: "Postpill"
Bot: [Shows Postpill information with image/audio]
```

### Future Prevention Path

```
User: "How to prevent pregnancy"
Bot: "I see! 👍 You are at the right place..."
Bot: "What kind of contraception do you want to know about?"
User: "Prevent in future"
Bot: "For how long do you want protection?"
User: "Up to 1 year"
Bot: [Shows short-term methods: pills, condoms, etc.]
User: "Daily Pills"
Bot: [Shows daily pills information with brands]
```

---

## ✅ Sign-Off Checklist

Before considering this fixed:

- [ ] Emergency path works end-to-end
- [ ] Prevent in future path works end-to-end
- [ ] All product images show correctly
- [ ] All audio widgets work
- [ ] No console errors
- [ ] Backend logs conversations correctly
- [ ] State persists after refresh
- [ ] Works on different browsers (Chrome, Firefox, Edge)

---

## 📊 Test Results

**Date Tested**: ****\_\_****  
**Tested By**: ****\_\_****  
**Environment**: □ Local □ Production

**Results**:

- [ ] ✅ All tests pass
- [ ] ⚠️ Some tests fail (list below)
- [ ] ❌ Major issues found

**Notes**:

---

---

---

---

**If all tests pass, you're ready to deploy to production! 🚀**

# Issues Log - Restaurant Management Project

> File này ghi lại các vấn đề phát sinh, nguyên nhân, và giải pháp trong quá trình phát triển

---

## 📅 March 12, 2026

### ❌ Issue: Validation Library Mismatch
**Priority:** High  
**Component:** Backend - Cart API Validation  
**Status:** ✅ Resolved

#### Problem
```
Error: Cannot find module 'express-validator'
Error: Route.post() requires a callback function but got a [object Undefined]
```

#### Root Cause
- Tạo `cartValidation.js` sử dụng **express-validator** 
- Nhưng project đang dùng **Joi** cho validation (authValidation.js, menuValidation.js)
- Pattern không nhất quán: `validate(schema)` vs `[validation(), validation()]`

#### Solution
1. ✅ Converted `cartValidation.js` từ express-validator sang Joi schemas
2. ✅ Updated `cartRoutes.js` để dùng pattern `validate(addItemSchema)` 
3. ✅ Removed express-validator dependency
4. ✅ Match với existing validation pattern trong project

#### Code Changes
```javascript
// ❌ Before (express-validator)
const addItemValidation = [
  body('menu_item_id').notEmpty().withMessage('...'),
  body('quantity').optional().isInt({ min: 1, max: 99 })
];

// ✅ After (Joi - matching project pattern)
const addItemSchema = Joi.object({
  menu_item_id: Joi.number().integer().min(1).required(),
  quantity: Joi.number().integer().min(1).max(99).default(1)
});
```

#### Lessons Learned
- ⚠️ **ALWAYS check existing validation patterns** trước khi tạo validation mới
- ⚠️ Kiểm tra `package.json` để biết project đang dùng thư viện nào
- ⚠️ Review existing validation files (authValidation.js, menuValidation.js)
- ⚠️ Follow consistent patterns across the codebase

#### Prevention
- [ ] Document validation pattern trong README.md
- [ ] Add validation template/example
- [ ] Code review checklist: Check validation library consistency

---

## 📋 Project Validation Standards

### Current Stack
- **Validation Library:** Joi (NOT express-validator)
- **Pattern:** `validate(schema)` middleware from `middlewares/validate.js`
- **Schema Location:** `backend/src/validations/*.js`

### Example Template
```javascript
const Joi = require('joi');

const yourSchema = Joi.object({
  field_name: Joi.string().required().messages({
    'any.required': 'Field là bắt buộc'
  })
});

module.exports = { yourSchema };
```

### Route Usage
```javascript
const validate = require('../middlewares/validate');
const { yourSchema } = require('../validations/yourValidation');

router.post('/endpoint', validate(yourSchema), Controller.method);
```

---

## 🔍 Common Issues Checklist

### Before Adding New Features
- [ ] Check existing patterns in similar files
- [ ] Verify library dependencies in package.json
- [ ] Review related middleware/validation files
- [ ] Check if utility functions already exist
- [ ] Ensure naming conventions match project style

### Before Committing
- [ ] Test backend server starts without errors
- [ ] Verify frontend builds successfully
- [ ] Check for unused dependencies
- [ ] Update this log if hitting new issues

---

## 📌 Quick Reference

### Validation Libraries Status
- ✅ **Joi** - Used for validation (auth, menu, cart)
- ❌ **express-validator** - NOT used in this project
- ✅ **express-session** - Used for session management
- ✅ **pg** - PostgreSQL client

### File Structure Patterns
```
backend/src/
  ├── models/         - Database queries
  ├── services/       - Business logic
  ├── controllers/    - HTTP handlers
  ├── routes/         - Express routes
  ├── validations/    - Joi schemas ⚠️
  ├── middlewares/    - Reusable middleware
  └── utils/          - Helper functions
```

---

## 💡 Future Improvements
- [ ] Add ESLint rules to enforce Joi usage
- [ ] Create validation schema generator script
- [ ] Add pre-commit hooks to check dependencies
- [ ] Document all validation patterns in TEAM_GUIDE.md

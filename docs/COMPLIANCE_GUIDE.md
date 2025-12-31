# 🛡️ Compliance Copilot - How It Works

## 📊 **Score Calculation**

The Compliance Copilot calculates a score from **0-100%** based on how many rules your creative passes.

### **Formula:**
```
Score = (Passed Rules / Total Rules) × 100
```

**Example:**
- Total Rules: 15
- Passed: 12
- Failed: 2
- Warnings: 1

**Score = (12 / 15) × 100 = 80%**

---

## 🎯 **Overall Status**

Based on the results, your creative gets one of three statuses:

| Status | Condition | Meaning |
|--------|-----------|---------|
| **✅ PASS** | No errors, no warnings | Fully compliant - ready for publication |
| **⚠️ WARNING** | No errors, but has warnings | Compliant but could be improved |
| **❌ FAIL** | Has 1+ errors | Non-compliant - must fix before publishing |

---

## 📋 **Compliance Rules (Tesco Example)**

RetailGen checks **15 different rules** across 6 categories:

### **1. Logo Rules** (3 rules)

#### ✅ **Logo Minimum Size** (ERROR)
- **Check**: Logo must be at least 15mm wide
- **Why**: Ensures brand visibility
- **How to Pass**: Make logo larger than 15mm

#### ✅ **Logo Clear Space** (ERROR)
- **Check**: Minimum 5mm clear space around logo
- **Why**: Prevents logo from being crowded
- **How to Pass**: Move other elements away from logo

#### ⚠️ **Logo Placement** (WARNING)
- **Check**: Logo should be in top-left or top-right corner
- **Why**: Standard brand positioning
- **How to Pass**: Position logo in preferred corner

---

### **2. Text Rules** (5 rules)

#### ✅ **Minimum Text Size** (ERROR)
- **Check**: Body text must be at least 6pt
- **Why**: Readability requirements
- **How to Pass**: Increase text size to 6pt or larger

#### ⚠️ **Headline Minimum Size** (WARNING)
- **Check**: Headlines must be at least 12pt
- **Why**: Headline prominence
- **How to Pass**: Make headlines 12pt or larger

#### ✅ **Text Contrast Ratio** (ERROR)
- **Check**: Text must have 4.5:1 contrast with background (WCAG AA)
- **Why**: Accessibility and readability
- **How to Pass**: Use darker text on light backgrounds or vice versa

#### ⚠️ **Price Prominence** (WARNING)
- **Check**: Price must be at least 18pt with good contrast
- **Why**: Consumer protection - price must be clear
- **How to Pass**: Make price text larger and high contrast

#### ⚠️ **Font Limit** (WARNING)
- **Check**: Maximum 2 font families allowed
- **Why**: Brand consistency
- **How to Pass**: Reduce to 2 or fewer fonts

---

### **3. Disclaimer Rules** (2 rules)

#### ✅ **Disclaimer Text Size** (ERROR)
- **Check**: Disclaimer must be at least 4pt
- **Why**: Legal readability requirements
- **How to Pass**: Ensure disclaimer text is 4pt minimum

#### ✅ **Disclaimer Placement** (ERROR)
- **Check**: Disclaimer must be at bottom of creative
- **Why**: Standard legal positioning
- **How to Pass**: Move disclaimer to bottom, within 10mm of edge

---

### **4. Color Rules** (1 rule)

#### ⚠️ **Brand Color Usage** (WARNING)
- **Check**: Must use approved Tesco brand colors
- **Approved Colors**:
  - Tesco Blue: `#00539F`
  - Tesco Red: `#EE1C2E`
  - White: `#FFFFFF`
  - Black: `#000000`
- **Tolerance**: ±10 color difference
- **How to Pass**: Use only approved brand colors

---

### **5. Layout Rules** (2 rules)

#### ✅ **Safe Zone Compliance** (ERROR)
- **Check**: Critical elements must be 5mm from edges
- **Critical Elements**: Logo, headline, price
- **Why**: Prevents elements from being cut off in printing
- **How to Pass**: Move all critical elements away from edges

#### ✅ **Aspect Ratio** (ERROR)
- **Check**: Must match approved ratios
- **Approved Ratios**: 1:1, 16:9, 4:5, 9:16
- **Tolerance**: ±5%
- **How to Pass**: Use standard format sizes

---

### **6. General Rules** (2 rules)

#### ✅ **Mandatory Elements** (ERROR)
- **Check**: Must include logo, price, and disclaimer
- **Why**: Legal and brand requirements
- **How to Pass**: Add all three required elements

#### ⚠️ **Image Resolution** (WARNING)
- **Check**: Images must be at least 150 DPI
- **Why**: Print quality standards
- **How to Pass**: Use high-resolution images

---

## 🎓 **How to Get a Valid Score**

### **Minimum Requirements (PASS Status):**

To get a **PASS** status (green), you must:

1. **Fix ALL Errors** (severity: error)
   - Logo minimum size ✅
   - Logo clearspace ✅
   - Text minimum size ✅
   - Disclaimer size ✅
   - Disclaimer placement ✅
   - Text contrast ✅
   - Safe zone ✅
   - Mandatory elements ✅
   - Aspect ratio ✅

2. **Warnings are Optional** (severity: warning)
   - Logo placement ⚠️
   - Headline size ⚠️
   - Price prominence ⚠️
   - Font limit ⚠️
   - Brand colors ⚠️
   - Image quality ⚠️

### **Score Ranges:**

| Score | Status | Certification |
|-------|--------|---------------|
| **90-100%** | ✅ Excellent | Can certify |
| **70-89%** | ⚠️ Good | Can certify if no errors |
| **50-69%** | ⚠️ Needs Work | Cannot certify |
| **0-49%** | ❌ Poor | Cannot certify |

---

## 🔍 **Validation Process**

### **Step 1: Click "Check"**
- Sends your canvas design to the compliance API
- Runs all 15 validation rules
- Takes 2-3 seconds

### **Step 2: Review Results**
- **Critical Errors** (red) - Must fix
- **Warnings** (yellow) - Should fix
- **Passed** (green) - All good

### **Step 3: Get AI Help**
- Click **"Ask Copilot"** on any violation
- AI explains:
  - Why it failed
  - Business context
  - How to fix it
  - Learning tip

### **Step 4: Apply Fixes**
- Click **"Apply Fix"** for auto-fixes
- Or manually adjust your design
- Re-run check to verify

### **Step 5: Certify**
- Once score is good and no errors
- Click **"Certify"**
- Generates compliance certificate
- Stores in database for audit trail

---

## 📈 **Example Validation**

### **Before Compliance Check:**
```
Creative: Coffee Sale Ad
- Logo: 10mm wide (too small)
- Text: 5pt (too small)
- Price: Missing
- Disclaimer: Missing
- Logo position: Center (wrong)
```

### **Compliance Report:**
```
Overall Status: FAIL ❌
Score: 40%

Errors (6):
❌ Logo too small (10mm, need 15mm)
❌ Text below minimum (5pt, need 6pt)
❌ Missing mandatory element: price
❌ Missing mandatory element: disclaimer
❌ Logo outside safe zone
❌ Wrong aspect ratio

Warnings (2):
⚠️ Logo should be in corner
⚠️ Using 3 fonts (max 2)

Passed (7):
✅ Logo clearspace OK
✅ Text contrast OK
✅ Brand colors OK
... etc
```

### **After Fixes:**
```
Creative: Coffee Sale Ad (Fixed)
- Logo: 20mm wide ✅
- Text: 8pt ✅
- Price: Added, 20pt ✅
- Disclaimer: Added at bottom ✅
- Logo position: Top-left ✅
```

### **New Report:**
```
Overall Status: PASS ✅
Score: 93%

Errors: 0
Warnings: 1
⚠️ Using 3 fonts (max 2)

Passed: 14/15
```

**Result:** Can now certify and publish! 🎉

---

## 🏆 **Certification**

### **When Can You Certify?**
- ✅ Score ≥ 70%
- ✅ Zero errors
- ⚠️ Warnings are OK

### **What Happens:**
1. Generates unique certificate ID
2. Creates compliance snapshot
3. Stores in database
4. Adds digital signature
5. Downloads certificate report

### **Certificate Includes:**
- Certificate ID
- Creative ID
- Score
- Timestamp
- All validation results
- Retailer (Tesco)
- Digital signature

---

## 💡 **Pro Tips**

### **Quick Pass Strategy:**
1. **Start with a template** that matches approved aspect ratio
2. **Add mandatory elements first**: Logo, price, disclaimer
3. **Use brand colors** from the start
4. **Keep text large**: 8pt+ for body, 14pt+ for headlines
5. **Position logo in corner** (top-left or top-right)
6. **Stay away from edges** (5mm safe zone)
7. **Limit fonts** to 2 families max
8. **Run check early** and often

### **Common Mistakes:**
- ❌ Forgetting disclaimer
- ❌ Logo too small
- ❌ Text too close to edges
- ❌ Too many fonts
- ❌ Low contrast text
- ❌ Missing price

### **Easy Wins:**
- ✅ Use format presets (auto-correct aspect ratio)
- ✅ Add all elements from a template
- ✅ Use color picker for brand colors
- ✅ Check early, check often
- ✅ Ask Copilot for help on violations

---

## 🔧 **Technical Details**

### **Validation Engine:**
- **Language**: TypeScript
- **Rules**: 15 (Tesco-specific)
- **Categories**: 6 (Logo, Text, Color, Layout, Disclaimer, General)
- **Severity Levels**: Error, Warning, Info

### **Score Calculation:**
```typescript
const passed = results.filter(r => r.passed).length;
const score = Math.round((passed / results.length) * 100);
```

### **Status Determination:**
```typescript
const failed = results.filter(r => !r.passed && r.severity === 'error').length;
const warnings = results.filter(r => !r.passed && r.severity === 'warning').length;

const overallStatus = 
    failed > 0 ? 'fail' : 
    warnings > 0 ? 'warning' : 
    'pass';
```

---

## 📚 **Summary**

**To get a valid compliance score:**

1. **Pass all ERROR rules** (9 critical rules)
2. **Aim for 90%+ score** for best results
3. **Fix warnings** for perfection
4. **Use Copilot** for guidance
5. **Certify** when ready

**Remember:** Errors block certification, warnings don't!

---

**Need help?** Click "Ask Copilot" on any violation for AI-powered guidance! 🤖✨

# Compliance Rules Documentation - RetailGen AI

## Overview

RetailGen AI's compliance engine validates creatives against retailer-specific brand guidelines to ensure all marketing materials meet required standards before publication.

---

## Supported Retailers

### Tesco
**Status:** ✅ Fully Supported  
**Rules:** 15 comprehensive rules  
**Last Updated:** December 2, 2025

---

## Tesco Compliance Rules

### 1. Logo Minimum Size
**Rule ID:** `tesco-logo-size`  
**Category:** Branding  
**Severity:** Error  

**Description:**  
The Tesco logo must be at least 15mm in width to ensure visibility and brand recognition across all formats.

**Validation:**
- Measures logo width in millimeters
- Accounts for print vs digital formats
- Checks all logo instances

**Example:**
```
✅ Pass: Logo width = 18mm
❌ Fail: Logo width = 12mm
```

**Why it matters:**  
Maintaining minimum logo size ensures brand recognition and professional appearance across all touchpoints.

**How to fix:**
1. Select the logo element
2. Resize to at least 15mm width
3. Re-run compliance check

---

### 2. Text Minimum Size
**Rule ID:** `tesco-text-size`  
**Category:** Typography  
**Severity:** Error  

**Description:**  
Body text must be at least 8pt, headlines at least 12pt for readability.

**Validation:**
- Checks all text elements
- Differentiates between body and headline text
- Accounts for font weight

**Example:**
```
✅ Pass: Body text = 10pt, Headline = 16pt
❌ Fail: Body text = 6pt
```

**Why it matters:**  
Ensures text is readable across all platforms and devices, improving user experience and accessibility.

---

### 3. Safe Zone Compliance
**Rule ID:** `tesco-safe-zone`  
**Category:** Layout  
**Severity:** Error  

**Description:**  
Critical elements (logo, text, CTA) must be at least 5% away from canvas edges.

**Validation:**
- Calculates element positions
- Checks distance from all four edges
- Flags elements too close to borders

**Example:**
```
✅ Pass: Logo 8% from edge
❌ Fail: Text 2% from edge
```

**Why it matters:**  
Prevents important content from being cut off during printing or platform cropping.

---

### 4. Brand Color Usage
**Rule ID:** `tesco-brand-colors`  
**Category:** Branding  
**Severity:** Warning  

**Description:**  
Encourages use of official Tesco brand colors for consistency.

**Approved Colors:**
- **Tesco Blue:** #00539F
- **Tesco Red:** #EE1C25
- **White:** #FFFFFF
- **Black:** #000000

**Validation:**
- Analyzes dominant colors
- Checks against approved palette
- Suggests color corrections

**Example:**
```
✅ Pass: Uses #00539F (Tesco Blue)
⚠️ Warning: Uses #0066CC (Similar but not exact)
```

**Why it matters:**  
Maintains brand consistency and recognition across all marketing materials.

---

### 5. Logo Placement
**Rule ID:** `tesco-logo-placement`  
**Category:** Branding  
**Severity:** Error  

**Description:**  
Logo must be in top-left or top-right corner for brand prominence.

**Validation:**
- Checks logo position
- Defines "corner" as top 25% and left/right 25%
- Allows flexibility within corners

**Example:**
```
✅ Pass: Logo at (10%, 10%) - top-left
❌ Fail: Logo at (50%, 50%) - center
```

**Why it matters:**  
Consistent logo placement builds brand recognition and follows established visual hierarchy.

---

### 6. Mandatory Elements
**Rule ID:** `tesco-mandatory-elements`  
**Category:** Content  
**Severity:** Error  

**Description:**  
All creatives must include:
- Tesco logo
- Call-to-action (CTA)
- Legal disclaimer (if applicable)

**Validation:**
- Detects logo presence
- Identifies CTA text
- Checks for disclaimer when required

**Example:**
```
✅ Pass: Has logo, "Shop Now" CTA, disclaimer
❌ Fail: Missing logo
```

**Why it matters:**  
Ensures all required brand and legal elements are present for compliance and effectiveness.

---

### 7. Color Contrast
**Rule ID:** `tesco-color-contrast`  
**Category:** Accessibility  
**Severity:** Warning  

**Description:**  
Text must have sufficient contrast against background (WCAG AA: 4.5:1 ratio).

**Validation:**
- Calculates contrast ratios
- Checks all text elements
- Flags low-contrast combinations

**Example:**
```
✅ Pass: Black text on white (21:1 ratio)
⚠️ Warning: Light gray on white (2:1 ratio)
```

**Why it matters:**  
Ensures readability for all users, including those with visual impairments.

---

### 8. Image Quality
**Rule ID:** `tesco-image-quality`  
**Category:** Assets  
**Severity:** Warning  

**Description:**  
Images should be high resolution (minimum 72 DPI for digital, 300 DPI for print).

**Validation:**
- Checks image dimensions
- Estimates DPI based on usage
- Flags low-resolution images

**Example:**
```
✅ Pass: 1920x1080 image for 1080x1080 canvas
⚠️ Warning: 500x500 image stretched to 1080x1080
```

**Why it matters:**  
High-quality images maintain professional appearance and brand standards.

---

### 9. Text Hierarchy
**Rule ID:** `tesco-text-hierarchy`  
**Category:** Typography  
**Severity:** Warning  

**Description:**  
Headlines should be significantly larger than body text (minimum 1.5x).

**Validation:**
- Compares text sizes
- Identifies headlines vs body text
- Checks size ratios

**Example:**
```
✅ Pass: Headline 24pt, Body 14pt (1.7x ratio)
⚠️ Warning: Headline 14pt, Body 12pt (1.2x ratio)
```

**Why it matters:**  
Clear hierarchy guides the viewer's eye and improves message comprehension.

---

### 10. Prohibited Elements
**Rule ID:** `tesco-prohibited-elements`  
**Category:** Content  
**Severity:** Error  

**Description:**  
Certain elements are not allowed:
- Competitor logos
- Inappropriate imagery
- Misleading claims

**Validation:**
- Scans for known competitor brands
- Uses AI to detect inappropriate content
- Checks text for prohibited claims

**Example:**
```
✅ Pass: Only Tesco branding
❌ Fail: Contains competitor logo
```

**Why it matters:**  
Protects brand integrity and ensures legal compliance.

---

### 11. White Space
**Rule ID:** `tesco-white-space`  
**Category:** Layout  
**Severity:** Warning  

**Description:**  
Design should have adequate white space (minimum 20% of canvas).

**Validation:**
- Calculates empty space
- Checks for overcrowding
- Suggests layout improvements

**Example:**
```
✅ Pass: 30% white space
⚠️ Warning: 10% white space (too crowded)
```

**Why it matters:**  
White space improves readability and creates a professional, uncluttered appearance.

---

### 12. CTA Prominence
**Rule ID:** `tesco-cta-prominence`  
**Category:** Content  
**Severity:** Warning  

**Description:**  
Call-to-action should be clearly visible and prominent.

**Validation:**
- Checks CTA size
- Analyzes CTA color contrast
- Verifies CTA placement

**Example:**
```
✅ Pass: Large "Shop Now" button with high contrast
⚠️ Warning: Small, low-contrast CTA
```

**Why it matters:**  
Prominent CTAs drive user action and improve campaign effectiveness.

---

### 13. Legal Text Size
**Rule ID:** `tesco-legal-text`  
**Category:** Legal  
**Severity:** Error  

**Description:**  
Legal disclaimers must be at least 6pt and clearly readable.

**Validation:**
- Identifies legal text
- Checks minimum size
- Verifies contrast

**Example:**
```
✅ Pass: Disclaimer at 7pt with good contrast
❌ Fail: Disclaimer at 4pt
```

**Why it matters:**  
Legal compliance requires disclaimers to be readable and meet minimum size requirements.

---

### 14. Aspect Ratio Preservation
**Rule ID:** `tesco-aspect-ratio`  
**Category:** Assets  
**Severity:** Warning  

**Description:**  
Images and logos should not be distorted (maintain original aspect ratio).

**Validation:**
- Compares original vs current dimensions
- Detects stretching or squashing
- Flags distorted elements

**Example:**
```
✅ Pass: Logo scaled proportionally
⚠️ Warning: Logo stretched horizontally
```

**Why it matters:**  
Distorted images look unprofessional and can damage brand perception.

---

### 15. File Size Optimization
**Rule ID:** `tesco-file-size`  
**Category:** Technical  
**Severity:** Warning  

**Description:**  
Final exports should be optimized for platform (< 500KB for social, < 150KB for display).

**Validation:**
- Checks export file sizes
- Suggests compression if needed
- Varies limits by platform

**Example:**
```
✅ Pass: Facebook export = 420KB
⚠️ Warning: Display ad = 200KB (should be < 150KB)
```

**Why it matters:**  
Optimized file sizes ensure fast loading and meet platform requirements.

---

## Rule Severity Levels

### Error (Red) 🔴
- **Must be fixed** before creative can be certified
- Blocks campaign launch
- Critical brand or legal compliance issues

### Warning (Yellow) 🟡
- **Should be fixed** for best results
- Doesn't block certification
- Recommendations for improvement

### Info (Blue) 🔵
- **Nice to have** improvements
- Suggestions for optimization
- Best practice recommendations

---

## Using the Compliance Engine

### Running a Check

1. Open your creative in the Builder
2. Click "Compliance" in the top bar
3. Click "Check" button
4. Review results

### Understanding Results

**Compliance Score:**
- **90-100%:** Excellent - Ready to launch
- **70-89%:** Good - Minor improvements recommended
- **50-69%:** Fair - Several issues to address
- **Below 50%:** Poor - Significant work needed

**Report Sections:**
- **Summary:** Overall score and counts
- **Critical Errors:** Must fix
- **Warnings:** Should fix
- **Passed Checks:** What's working well

### Getting Help

**AI Copilot:**
1. Click "Ask Copilot" on any violation
2. Get detailed explanation
3. See suggested fixes
4. Learn why the rule exists

**Manual Fixes:**
1. Read the violation message
2. Adjust your creative
3. Re-run compliance check
4. Repeat until all errors resolved

### Certification

Once all errors are fixed:
1. Click "Certify" button
2. Receive compliance certificate
3. Download for records
4. Creative is campaign-ready!

---

## Custom Rules (Enterprise)

Enterprise customers can:
- Create custom compliance rules
- Modify existing rule parameters
- Set custom severity levels
- Configure retailer-specific guidelines

Contact your account manager to set up custom rules.

---

## Future Retailers

We're actively adding support for:
- **Walmart:** Q1 2026
- **Target:** Q1 2026
- **Amazon:** Q2 2026
- **Kroger:** Q2 2026

Request a retailer: compliance@retailgen.ai

---

## Technical Details

### Validation Process

1. **Canvas Analysis:** Parse Fabric.js JSON
2. **Element Detection:** Identify logos, text, images
3. **Rule Execution:** Run each applicable rule
4. **Computer Vision:** Analyze visual elements
5. **Report Generation:** Compile results
6. **AI Enhancement:** Generate fix suggestions

### Performance

- **Average Check Time:** < 2 seconds
- **Rules Evaluated:** 15 per check
- **Accuracy:** 95%+
- **False Positives:** < 5%

---

## Support

Questions about compliance rules?
- **Documentation:** This guide
- **AI Copilot:** In-app guidance
- **Email:** compliance@retailgen.ai
- **Community:** community.retailgen.ai

---

*Last Updated: December 2, 2025*

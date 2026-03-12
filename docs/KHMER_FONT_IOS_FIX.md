# Khmer Font iOS Safari Fix - Complete Guide

## Problem
iOS Safari (iPhone/iPad) renders Khmer text incorrectly, breaking ligatures and character combinations like:
- ❌ `អុ+ ី` (broken)
- ✅ `អុី` (correct)

## Root Cause
iOS Safari applies font features (ligatures, kerning, contextual alternates) that conflict with Khmer Unicode rendering, causing characters to display incorrectly.

---
## Solution Implemented

### 1. **Font Stack (Best to Worst for iOS)**
```css
font-family: 
  'Kantumruy Pro',     /* Modern, best iOS support */
  'Battambang',        /* Classic, reliable */
  'Hanuman',           /* Good fallback */
  'Khmer OS',          /* System font */
  'Khmer',             /* Generic */
  sans-serif;
```

### 2. **Critical CSS Properties**

```css
.khmer-text {
  /* Disable font features that break Khmer on iOS */
  -webkit-font-feature-settings: "liga" 0, "kern" 0, "calt" 0, "clig" 0;
  font-feature-settings: "liga" 0, "kern" 0, "calt" 0, "clig" 0;
  
  /* Optimize rendering */
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  
  /* Prevent iOS auto-adjustments */
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  
  /* Proper text direction for Khmer */
  unicode-bidi: plaintext;
}
```

### 3. **iOS Safari Specific Fix**
```css
@supports (-webkit-touch-callout: none) {
  .khmer-text {
    font-family: 'Kantumruy Pro', 'Battambang', sans-serif !important;
    -webkit-font-feature-settings: "liga" 0, "kern" 0, "calt" 0, "clig" 0 !important;
  }
}
```

---

## Implementation Files

### `/src/app/layout.tsx`
```tsx
import { Kantumruy_Pro, Battambang, Hanuman } from 'next/font/google'

const kantumruy = Kantumruy_Pro({
  subsets: ['khmer'],
  weight: ['400', '700'],
  variable: '--font-kantumruy_pro',
  display: 'swap',
})

const battambang = Battambang({
  subsets: ['khmer'],
  weight: ['400', '700'],
  variable: '--font-battambang',
  display: 'swap',
})

const hanuman = Hanuman({
  subsets: ['khmer'],
  weight: ['400', '700'],
  variable: '--font-hanuman',
  display: 'swap',
})
```

**Why Next.js Font Optimization?**
- Self-hosted fonts (faster loading)
- Automatic subsetting
- No layout shift (CLS)
- Better caching

### `/src/app/globals.css`
See full CSS implementation in `globals.css` lines 26-106.

### `/src/components/ui/HtmlContent.tsx`
```tsx
<div
  className="khmer-text"
  style={{
    WebkitFontFeatureSettings: '"liga" 0, "kern" 0, "calt" 0, "clig" 0',
    fontFeatureSettings: '"liga" 0, "kern" 0, "calt" 0, "clig" 0',
    WebkitTextSizeAdjust: '100%',
    textSizeAdjust: '100%',
    unicodeBidi: 'plaintext',
  }}
/>
```

### `/src/lib/utils.ts`
```typescript
export const sanitizeKhmerText = (text: string): string => {
  if (typeof text !== 'string') return text
  
  return text
    .replace(/\u17A2\u17BB\u17B8/g, '\u17A2\u17CA\u17B8')
    .replace(/\u17B6\u17C1/g, '\u17C1\u17B6')
    .replace(/\u17B7\u17C1/g, '\u17C1\u17B7')
    .replace(/\u17B8\u17C1/g, '\u17C1\u17B8')
    .normalize('NFC')
}
```

---

## Usage

### For Any Khmer Text Component
```tsx
// Add the khmer-text class
<p className="khmer-text">ផលិត និងផ្គត់ផ្គង់</p>

// Or use HtmlContent component
<HtmlContent html={khmerHtmlContent} />
```

### For TipTap Editor
The `.ProseMirror` class already has Khmer font fixes applied.

### For Navbar/Footer
```tsx
<p className="khmer-text" style={{
  WebkitFontFeatureSettings: '"liga" 0, "kern" 0, "calt" 0',
  fontFeatureSettings: '"liga" 0, "kern" 0, "calt" 0',
}}>
  ផលិត និងផ្គត់ផ្គង់
</p>
```

---

## Testing on iOS

1. **Deploy** your app
2. **Open on iPhone/iPad Safari**
3. **Test these characters:**
   - អុី (should be connected, not broken)
   - ក្រុម (subscript should be below)
   - ផ្គត់ផ្គង់ (coeng should connect properly)

4. **Check these pages:**
   - Navbar (header)
   - Product descriptions
   - About Us section
   - TipTap editor content

---

## Font Feature Settings Explained

| Feature | What It Does | Why Disable for Khmer |
|---------|--------------|----------------------|
| `liga`  | Standard ligatures | Breaks Khmer subscript vowels |
| `kern`  | Kerning (spacing) | Causes incorrect character spacing |
| `calt`  | Contextual alternates | Replaces Khmer characters incorrectly |
| `clig`  | Contextual ligatures | Creates wrong character combinations |

---

## Troubleshooting

### Still Seeing Broken Text?

1. **Clear browser cache** on iOS
2. **Hard refresh** (Cmd+Shift+R on desktop, reload on iOS)
3. **Check CSS is loaded** - inspect element to verify font-family
4. **Verify fonts loaded** - check Network tab for font files

### Font Not Applying?

1. Make sure element has `khmer-text` class
2. Check CSS specificity - use `!important` if needed
3. Verify Next.js font variables are defined
4. Check browser DevTools for font loading errors

### Performance Issues?

1. Use Next.js font optimization (already implemented)
2. Consider self-hosting font files
3. Preload critical fonts in `<head>`

---

## References

- [Google Fonts - Khmer](https://fonts.google.com/?subset=khmer)
- [Stack Overflow - Khmer Font iOS Fix](https://stackoverflow.com/questions/56884324/how-to-fix-khmer-font-on-ios-device)
- [GitHub Issue - Khmer Font Rendering](https://github.com/google/fonts/issues/6123)
- [MDN - font-feature-settings](https://developer.mozilla.org/en-US/docs/Web/CSS/font-feature-settings)

---

## Last Updated
March 2026

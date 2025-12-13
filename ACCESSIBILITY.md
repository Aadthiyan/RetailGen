# Accessibility Guide - RetailGen AI

## Overview

RetailGen AI is committed to providing an accessible experience for all users, including those using assistive technologies.

## Accessibility Features Implemented

### 1. Keyboard Navigation
- **Tab Navigation:** All interactive elements are keyboard accessible
- **Focus Indicators:** Clear visual focus states on all focusable elements
- **Escape Key:** Closes modals and panels
- **Enter/Space:** Activates buttons and controls

### 2. Screen Reader Support
- **ARIA Labels:** All icons and icon-only buttons have descriptive labels
- **ARIA Roles:** Proper semantic roles for custom components
- **ARIA Live Regions:** Dynamic content updates announced to screen readers
- **Alt Text:** All images have descriptive alternative text

### 3. Color Contrast
- **WCAG AA Compliance:** All text meets minimum 4.5:1 contrast ratio
- **Error States:** Not reliant on color alone (icons + text)
- **Focus States:** High contrast focus indicators

### 4. Responsive Design
- **Mobile Friendly:** Touch targets minimum 44x44px
- **Zoom Support:** Content remains usable at 200% zoom
- **Text Scaling:** Respects user font size preferences

## Component Accessibility Checklist

### Buttons
- [ ] Has descriptive text or aria-label
- [ ] Keyboard accessible (tab + enter/space)
- [ ] Clear focus state
- [ ] Disabled state properly communicated

### Forms
- [ ] Labels associated with inputs
- [ ] Error messages linked via aria-describedby
- [ ] Required fields marked with aria-required
- [ ] Validation errors announced

### Modals/Dialogs
- [ ] Focus trapped within modal
- [ ] Escape key closes modal
- [ ] Focus returned to trigger on close
- [ ] aria-modal="true" set

### Images
- [ ] Decorative images have empty alt=""
- [ ] Informative images have descriptive alt text
- [ ] Complex images have long descriptions

## Testing Recommendations

### Automated Testing
```bash
# Install axe-core for accessibility testing
npm install --save-dev @axe-core/react

# Run Lighthouse accessibility audit
npm run build
npx lighthouse http://localhost:3000 --only-categories=accessibility
```

### Manual Testing
1. **Keyboard Only:** Navigate entire app without mouse
2. **Screen Reader:** Test with NVDA (Windows) or VoiceOver (Mac)
3. **Zoom:** Test at 200% browser zoom
4. **Color Blindness:** Use browser extensions to simulate

### Screen Reader Testing
- **Windows:** NVDA (free) or JAWS
- **Mac:** VoiceOver (built-in)
- **Mobile:** TalkBack (Android) or VoiceOver (iOS)

## Common Patterns

### Icon Buttons
```tsx
<button aria-label="Close panel">
  <X className="w-4 h-4" />
</button>
```

### Loading States
```tsx
<div role="status" aria-live="polite">
  {isLoading ? 'Loading...' : 'Content loaded'}
</div>
```

### Form Errors
```tsx
<input
  aria-invalid={hasError}
  aria-describedby={hasError ? 'error-message' : undefined}
/>
{hasError && <p id="error-message" role="alert">{error}</p>}
```

### Skip Links
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

## Known Issues & Roadmap

### Current Limitations
- Canvas editor has limited screen reader support (inherent to Fabric.js)
- Some complex interactions may require mouse/touch

### Planned Improvements
- [ ] Add skip navigation links
- [ ] Improve canvas keyboard controls
- [ ] Add high contrast mode
- [ ] Implement focus management for dynamic content
- [ ] Add keyboard shortcuts documentation

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

## Contact

For accessibility concerns or suggestions, please contact the development team.

---

*Last Updated: December 2, 2025*

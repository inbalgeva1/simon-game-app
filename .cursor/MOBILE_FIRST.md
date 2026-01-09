# 📱 MOBILE-FIRST DESIGN RULES

**CRITICAL:** This is a mobile game first. Desktop is secondary.

## Quick Reference

### Button Sizes
- Game buttons: **160px × 160px** minimum
- UI buttons: **56px × 56px** minimum  
- Absolute minimum: **44px × 44px**

### Viewport Meta Tag
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

### Touch Feedback
- Visual response: **<100ms**
- Use `active:scale-95` for press animation
- Use `touch-action: manipulation` to prevent double-tap zoom

### Testing
Test on:
- iPhone SE (320px) - minimum width
- iPhone 13/14 (390px) - common
- Android phones (360-400px) - common

### Key CSS Rules
```css
body {
  overscroll-behavior: none;  /* Prevent pull-to-refresh */
}

button {
  touch-action: manipulation;  /* Prevent double-tap zoom */
}

input, select, textarea {
  font-size: 16px;  /* Prevent iOS zoom on focus */
}

.app {
  padding-bottom: max(env(safe-area-inset-bottom), 16px);  /* Notch/home indicator */
}
```

## Comprehensive Mobile-First Guidelines

### Core Mobile Principles

**Every component MUST:**
- ✅ Work perfectly on 320px width (iPhone SE)
- ✅ Use touch targets ≥44px × 44px (Apple guidelines)
- ✅ Be designed for portrait orientation first
- ✅ Support landscape as bonus, not requirement
- ✅ Prevent accidental zooms and scrolls
- ✅ Provide immediate touch feedback (<100ms)

### Required Viewport Configuration

```html
<!-- index.html - CRITICAL -->
<meta 
  name="viewport" 
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
/>
```

**Why each property matters:**
- `width=device-width` - Match device width
- `initial-scale=1.0` - No zoom on load
- `maximum-scale=1.0` - Prevent pinch zoom
- `user-scalable=no` - Disable zoom gestures
- `viewport-fit=cover` - Safe area support (notches)

### Mobile-First CSS Rules

```css
/* index.css or global styles */

/* Prevent overscroll bounce (iOS) */
body {
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
}

/* Prevent text selection during gameplay */
.game-area {
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}

/* Prevent tap highlight flash */
* {
  -webkit-tap-highlight-color: transparent;
}

/* Safe area support for notches/home indicator */
.app-container {
  padding-top: env(safe-area-inset-top);
  padding-bottom: max(env(safe-area-inset-bottom), 16px);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* Prevent zoom on input focus (iOS) */
input, select, textarea {
  font-size: 16px !important;  /* iOS zooms if <16px */
}
```

### Touch Target Sizes

**Minimum sizes (Apple Human Interface Guidelines):**

```typescript
// Button sizes
const TOUCH_SIZES = {
  minimum: '44px',      // Absolute minimum
  comfortable: '48px',  // Better for gameplay
  preferred: '56px',    // Ideal for game buttons
  game: '160px',        // Simon Says color buttons
  large: '64px'         // Primary actions
};

// Example button
<button className="
  min-w-[56px]         // Minimum width
  min-h-[56px]         // Minimum height
  p-4                  // Internal padding
  active:scale-95      // Press feedback
  transition-transform
  duration-100         // Fast feedback
">
  Play
</button>
```

### Mobile Breakpoints

**Design mobile-first, then scale up:**

```typescript
// Tailwind breakpoints (mobile-first)
// default (no prefix): 0px - mobile phones
// sm: 640px - large phones/small tablets
// md: 768px - tablets
// lg: 1024px - desktops (NOT primary focus!)

// Example usage
<div className="
  w-full          // Mobile: full width
  sm:w-96         // Large phone: fixed width
  lg:w-1/2        // Desktop: half width (if needed)
">
```

### Touch Feedback

**Every interactive element needs instant feedback:**

```typescript
<button className="
  active:scale-95        // Shrink on press
  active:brightness-90   // Darken on press
  transition-all
  duration-75            // Very fast (<100ms)
">
  Button
</button>
```

### Common Mobile Issues & Fixes

**Issue: Double-tap zoom on buttons**
```css
button {
  touch-action: manipulation;  /* Prevents double-tap zoom */
}
```

**Issue: Pull-to-refresh interfering**
```css
body {
  overscroll-behavior-y: none;
}
```

**Issue: Text inputs cause zoom**
```css
input, select, textarea {
  font-size: 16px;  /* iOS won't zoom if ≥16px */
}
```

**Issue: Buttons under notch/home indicator**
```css
.game-container {
  padding-bottom: max(env(safe-area-inset-bottom), 16px);
}
```

### Performance on Mobile

**Mobile devices have less power:**
- Minimize re-renders (use React.memo)
- Use CSS transforms over position changes
- Debounce rapid touch events
- Optimize images and assets
- Lazy load non-critical content

```typescript
// Debounce rapid taps
const handleTap = useMemo(
  () => debounce((value) => {
    // Handle tap
  }, 50),  // 50ms debounce
  []
);
```

### Testing Requirements

**Test on actual devices:**
- ✅ iPhone SE (320px width) - minimum
- ✅ iPhone 13/14 (390px width) - common
- ✅ Android phone (360px-400px) - common
- ✅ iPad (768px width) - tablet bonus

**What to test:**
1. All buttons are tappable (not too small)
2. No accidental zooms during gameplay
3. No content cut off by notch/home indicator
4. Touch feedback is immediate
5. Game works in portrait orientation
6. No horizontal scrolling
7. Text is readable without zoom

## Key Takeaways

🎯 **Design for thumb reach** - Important buttons in center/bottom  
🎯 **Make it tappable** - All targets ≥44px  
🎯 **Give instant feedback** - <100ms visual response  
🎯 **Prevent zoom accidents** - Use viewport meta + 16px fonts  
🎯 **Respect safe areas** - Use env() variables  
🎯 **Test on real devices** - Simulators miss issues  

**MOBILE FIRST. ALWAYS.**
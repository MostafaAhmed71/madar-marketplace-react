---
name: Celestial Academic Marketplace
colors:
  surface: '#f8f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f6'
  surface-container: '#edeef0'
  surface-container-high: '#e7e8ea'
  surface-container-highest: '#e1e2e4'
  on-surface: '#191c1e'
  on-surface-variant: '#47464f'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f3'
  outline: '#777680'
  outline-variant: '#c8c5d0'
  surface-tint: '#595990'
  primary: '#39396d'
  on-primary: '#ffffff'
  primary-container: '#505086'
  on-primary-container: '#c7c5ff'
  inverse-primary: '#c2c1ff'
  secondary: '#7b5800'
  on-secondary: '#ffffff'
  secondary-container: '#f9b500'
  on-secondary-container: '#684a00'
  tertiary: '#383871'
  on-tertiary: '#ffffff'
  tertiary-container: '#4f4f8a'
  on-tertiary-container: '#c6c5ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c2c1ff'
  on-primary-fixed: '#151448'
  on-primary-fixed-variant: '#414176'
  secondary-fixed: '#ffdea6'
  secondary-fixed-dim: '#ffbb0c'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5d4200'
  tertiary-fixed: '#e2dfff'
  tertiary-fixed-dim: '#c2c1ff'
  on-tertiary-fixed: '#14124d'
  on-tertiary-fixed-variant: '#40407a'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e1e2e4'
  space-black: '#1F2937'
  growth-green: '#22C55E'
  nebula-lavender: '#6B6BA8'
  warning-amber: '#F59E0B'
  danger-red: '#EF4444'
typography:
  display-lg:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  code-sm:
    fontFamily: jetbrainsMono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  gutter: 20px
  container-max: 1280px
---

## Brand & Style

The design system is anchored in a "Celestial Discovery" narrative, positioning education as an expansive journey through a well-organized cosmos. The brand personality is **Professional, Trusted, and Visionary**, moving away from typical "classroom" aesthetics toward a sophisticated, premium digital environment.

The design style is **Corporate / Modern** with a focus on **Precision and Clarity**. It utilizes a systematic approach to hierarchy, ensuring that the manual verification process of a marketplace (reviews, payments, and approvals) feels secure and effortless. 

**Visual Principles:**
- **Refinement:** High-quality typography and balanced whitespace to prevent cognitive overload.
- **Trust-Oriented:** Clear status indicators and logical grouping of information to manage user expectations during the manual payment verification phase.
- **Celestial Accents:** Subtle use of gradients and light-play inspired by space to highlight interactive elements without sacrificing professionalism.

## Colors

The palette is divided into functional "Cosmic Tiers." The primary color, **Orbit Purple**, provides a stable, authoritative foundation for the brand. **Solar Gold** acts as the high-energy accent, reserved for primary calls to action, price highlights, and premium features.

**Usage Guidelines:**
- **Primary (Orbit Purple):** Used for headers, primary navigation, and core interactive states.
- **Secondary (Solar Gold):** Used sparingly for "Buy Now" buttons, ratings, and promotional tags to ensure maximum visibility.
- **Neutral (Stellar Gray):** The primary surface color, providing a clean, low-fatigue background for long browsing sessions.
- **Functional Status:** 
  - **Growth Green:** Success, Paid, and Completed states.
  - **Warning Amber:** Awaiting Review and Pending actions.
  - **Danger Red:** Rejected orders or critical errors.

## Typography

This design system uses **IBM Plex Sans Arabic** as its primary typeface. It was selected for its exceptional legibility in both Arabic and English, its technical precision, and its professional tone that aligns with the "Celestial" theme.

**Type Application:**
- **Display & Headlines:** Use for product titles and section headers. Bold weights help establish a clear hierarchy on information-dense marketplace pages.
- **Body Text:** Standardized at 16px for optimal readability. Use the 400 weight for product descriptions and 500 for secondary information.
- **Technical Data:** For Order IDs (e.g., ORD-2026), IBANs, and transaction hashes, use a monospaced font (JetBrains Mono) to emphasize accuracy and prevent character confusion.
- **RTL Optimization:** The typography is designed for Right-to-Left as the primary orientation, ensuring proper line-height and letter-spacing for Arabic glyphs.

## Layout & Spacing

The system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile. The layout is designed to handle varying lengths of Arabic text without breaking the visual rhythm.

**Spacing Philosophy:**
- **8px Incremental Grid:** All margins and paddings must be multiples of 8px (or 4px for fine-tuning) to maintain mathematical harmony.
- **Vertical Rhythm:** Generous vertical spacing (32px - 48px) between sections on the marketplace home page to distinguish between "New Arrivals," "Featured Bundles," and "Categories."
- **Safe Areas:** A 20px gutter is maintained on mobile to ensure content does not touch the screen edges.
- **Reflow Rules:** On tablet (768px+), product cards should shift from a 1-column list to a 2 or 3-column grid.

## Elevation & Depth

Visual depth is achieved through **Tonal Layering** and **Subtle Ambient Shadows**. This approach keeps the UI feeling modern and professional while providing clear affordances for interaction.

**Layering Logic:**
- **Level 0 (Floor):** The `--stellar-gray` background.
- **Level 1 (Surface):** White containers for product cards and form sections. These use a very soft, diffused shadow (4px blur, 5% opacity Orbit Purple tint) to appear slightly lifted.
- **Level 2 (Interactive):** Hover states on cards and buttons. The shadow increases in spread and blur, and a subtle `--nebula-laven` border may be applied.
- **Level 3 (Overlays):** Modals (e.g., "Upload Receipt") and dropdowns. These use a high-contrast shadow with a backdrop blur (glassmorphism effect) to isolate the user's focus.

## Shapes

The shape language is **Rounded**, striking a balance between the precision of a professional platform and the approachability of an educational tool.

**Corner Radius Standards:**
- **Small (4px):** Checkboxes, radio buttons, and small tags.
- **Medium (8px):** Buttons, input fields, and small product thumbnails.
- **Large (16px):** Product cards, bundle containers, and modal windows.
- **Full (Pill):** Status badges (e.g., "Paid," "Editable") and search bars.

## Components

**Buttons:**
- **Primary:** Orbit Purple background with white text. High-contrast and authoritative.
- **Accent:** Solar Gold background with Space Black text. Used for "Add to Cart" or "Buy Now."
- **Outline:** Nebula Lavender border and text. Used for secondary actions like "View Preview."

**Product Cards:**
- Must include a consistent aspect ratio thumbnail (4:3), the product title in `title-lg`, and a status pill indicating the file type (PDF, Canva, etc.). 
- The price should be highlighted in Orbit Purple or Solar Gold if on sale.

**Status Pills:**
- Highly semantic. Use background tints of Growth Green, Warning Amber, or Danger Red with high-contrast text of the same hue for maximum legibility of order statuses.

**Input Fields:**
- Use a white background with a 1px border of `--stellar-gray`. On focus, the border transitions to `--orbit-purple` with a soft outer glow. Labels should be positioned above the field for clarity in RTL layouts.

**Lists & Tables:**
- Used heavily in the "My Downloads" and "Order History" sections. Use alternating row colors or subtle dividers to maintain legibility in data-heavy views.
---
name: Vansha Heritage System
colors:
  surface: '#fbf9f7'
  surface-dim: '#dbdad8'
  surface-bright: '#fbf9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f1'
  surface-container: '#efedec'
  surface-container-high: '#eae8e6'
  surface-container-highest: '#e4e2e0'
  on-surface: '#1b1c1b'
  on-surface-variant: '#4d4540'
  inverse-surface: '#30302f'
  inverse-on-surface: '#f2f0ee'
  outline: '#7e756f'
  outline-variant: '#cfc4bd'
  surface-tint: '#635d5a'
  primary: '#181512'
  on-primary: '#ffffff'
  primary-container: '#2d2926'
  on-primary-container: '#96908b'
  inverse-primary: '#cdc5c0'
  secondary: '#506354'
  on-secondary: '#ffffff'
  secondary-container: '#cfe5d3'
  on-secondary-container: '#546759'
  tertiary: '#280e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#42210a'
  on-tertiary-container: '#b78668'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9e1dc'
  primary-fixed-dim: '#cdc5c0'
  on-primary-fixed: '#1e1b18'
  on-primary-fixed-variant: '#4b4642'
  secondary-fixed: '#d2e8d6'
  secondary-fixed-dim: '#b6ccba'
  on-secondary-fixed: '#0d1f14'
  on-secondary-fixed-variant: '#384b3e'
  tertiary-fixed: '#ffdbc8'
  tertiary-fixed-dim: '#f2bb9a'
  on-tertiary-fixed: '#301401'
  on-tertiary-fixed-variant: '#643e25'
  background: '#fbf9f7'
  on-background: '#1b1c1b'
  surface-variant: '#e4e2e0'
typography:
  display-lg:
    fontFamily: Libre Caslon Text
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Libre Caslon Text
    fontSize: 36px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
  headline-md:
    fontFamily: Libre Caslon Text
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The design system is anchored in the concept of the "Living Archive." It balances the weight of history with the vitality of the present, targeting users who value legacy, genealogy, and the preservation of family stories. 

The aesthetic is **Sophisticated Minimalism** with a **Tactile** edge. It avoids cold, clinical digital tropes in favor of a warm, paper-like atmosphere. The UI should evoke the feeling of high-end stationery or a curated museum exhibit—airy yet intentional. Key brand pillars include:
- **Archival Integrity:** Using deep, earthy tones and generous whitespace to suggest permanence.
- **Organic Growth:** Utilizing forest greens to symbolize the "Family Tree" and the continuation of life.
- **Refined Warmth:** Soft neutrals and gold-infused browns replace harsh blacks and whites to create an inviting, safe environment for personal histories.

## Colors

The palette is derived from natural, archival materials: ink, parchment, and forest canopies.

- **Primary (Deep Charcoal/Ink):** Used for primary text, iconography, and high-emphasis structural elements.
- **Forest (Growth Green):** Reserved for lineage connections, "live" family members, and growth-related actions. It represents the vitality of the tree.
- **Heritage (Legacy Gold/Brown):** Used for historical data, deceased ancestors, and premium "gold-leaf" accents that denote significant family milestones.
- **Neutral (Warm Parchment):** The foundation of the UI. This off-white base reduces eye strain and provides a sophisticated, non-clinical background.

**Background Tiers:**
- Surface: `#faf8f6` (The base sheet)
- Surface-Muted: `#f4f1ee` (Sectioning and grouping)
- Surface-Deep: `#2d2926` (Used for high-contrast immersive headers or footer sections)

## Typography

This design system employs a high-contrast typographic pairing to distinguish between "Story" and "Data."

- **The Heritage Serif (Libre Caslon Text):** Used for headlines and names. Its historical proportions and elegant serifs provide the necessary gravitas for a genealogy application.
- **The Modern Sans (Inter):** A systematic, highly legible face used for all body copy, metadata, and form inputs. It ensures that complex family data remains accessible and clear.

**Style Rules:**
- Use `display-lg` exclusively for main landing moments or high-level family name titles.
- Labels are always in Inter, often using uppercase with slight letter spacing to create a "tabbed archive" feel.
- Body text should maintain a generous line height (minimum 1.5x) to support the airy, premium aesthetic.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** on desktop to maintain the "curated" feel of a physical book, while transitioning to a fluid model for mobile.

- **Grid:** A 12-column grid for desktop with wide 64px margins to emphasize the "archival" white space.
- **Rhythm:** An 8px linear scale (8, 16, 24, 32, 48, 64, 80) is used for all internal padding and margins.
- **Family Tree View:** Uses a specialized non-grid canvas layout where spacing between "nodes" (family members) is maintained at a minimum of 48px to ensure legibility of connections.
- **Mobile:** Content reflows to a single column with 16px side margins. Cards and nodes stack vertically to preserve text readability.

## Elevation & Depth

This design system uses **Ambient Tonal Layering** instead of aggressive drop shadows. Depth should feel like layers of premium heavy-stock paper.

- **Low Elevation:** Used for cards and nodes. A soft, wide shadow (`0 4px 20px`) with a very low-opacity tint of the Primary color (`#2d2926` at 5%).
- **High Elevation:** Used for modals, pop-overs, and expanded ancestor profiles. A more pronounced shadow (`0 12px 40px`) to create a clear focus on the narrative content.
- **Surfacing:** Use subtle borders (1px) in a slightly darker neutral (`#e8e4e1`) instead of shadows for secondary UI elements like sidebar dividers and input fields. This keeps the interface feeling "flat" and "literary."

## Shapes

The shape language is **Softly Structured.** It avoids the playfulness of hyper-rounded corners in favor of a sophisticated, tailored look.

- **Rounded-brand (12px):** Applied to the majority of UI components, including cards, ancestor nodes, and buttons. This radius feels modern while remaining grounded.
- **Image Treatment:** Portrait photos of ancestors should use the same 12px radius. Avoid circles for portraits; the "rounded square" feels more like a physical photo in an album.
- **Connectors:** Lines in the family tree should be 1.5pt thick with slightly rounded joins (4px) to maintain the organic feel of a "tree."

## Components

### Buttons
- **Primary:** Background in Primary (`#2d2926`), Text in Neutral (`#faf8f6`). 12px radius. High-contrast and authoritative.
- **Secondary:** Transparent background with a 1.5px border of Heritage Gold (`#45240d`). Used for additive actions like "Add Story."

### Ancestor Nodes (Cards)
The most critical component. Features a subtle 1px border, the `shadow-brand` elevation, and a 12px corner radius. The name is always in Libre Caslon Text. Use a small color-coded indicator (Forest for living, Heritage for ancestors) in the top right corner.

### Input Fields
Minimalist style. Only a bottom border in a muted neutral for inactive states, shifting to a full 1px box in Forest Green when focused. This mimics a "fill-in-the-blank" historical ledger.

### Chips & Tags
Used for "Life Events" (e.g., Birth, Marriage). Uses high-transparency Forest or Heritage backgrounds with deep-colored text. 4px (Soft) radius to distinguish them from larger structural elements.

### The Timeline
A vertical line in Heritage Gold with "knotted" points. It should feel like a string of events, using serif typography for dates to emphasize chronological weight.
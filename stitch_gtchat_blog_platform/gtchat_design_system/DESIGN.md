---
name: GTChat Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3f4a39'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6f7b68'
  outline-variant: '#becab4'
  surface-tint: '#106e00'
  primary: '#106e00'
  on-primary: '#ffffff'
  primary-container: '#34a81e'
  on-primary-container: '#043300'
  inverse-primary: '#6cdf52'
  secondary: '#006781'
  on-secondary: '#ffffff'
  secondary-container: '#83dafd'
  on-secondary-container: '#006079'
  tertiary: '#5c5f61'
  on-tertiary: '#ffffff'
  tertiary-container: '#909395'
  on-tertiary-container: '#292c2e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#88fd6b'
  primary-fixed-dim: '#6cdf52'
  on-primary-fixed: '#022100'
  on-primary-fixed-variant: '#0a5300'
  secondary-fixed: '#baeaff'
  secondary-fixed-dim: '#7ad2f4'
  on-secondary-fixed: '#001f29'
  on-secondary-fixed-variant: '#004d62'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  gutter: 16px
  component-gap-sm: 8px
  component-gap-md: 16px
---

## Brand & Style

The brand personality is **reliable, intelligent, and fluid**. As an AI-powered multi-channel customer service platform, the design system must communicate a sense of "calm competence"—handling complex data streams while remaining approachable for human agents.

The aesthetic follows a **Modern Corporate** direction with a **Tech-Forward** lean. This is achieved through:
- **High-clarity functionalism**: Prioritizing information density without clutter.
- **Strategic vibrancy**: Using the brand’s signature green and blue as purposeful signifiers for action and status, set against a vast, clean white canvas.
- **Subtle Depth**: Utilizing soft, layered shadows to separate the conversation interface from background management tools.

## Colors

The palette is anchored in a clinical white base to maximize readability and reduce cognitive fatigue during long shifts.

- **Primary Green (#34A81E)**: Derived from the logo. Used for positive actions, "Online" status indicators, and primary CTA buttons. It represents the "Go" of customer service.
- **Secondary Blue (#2F90B0)**: Used for information links, AI-assisted features, and navigation highlights. It differentiates technical or platform-related actions from human-centric ones.
- **Backgrounds**: The main workspace uses white (#FFFFFF), while sidebars and inactive panels use a very light slate (#F8FAFC) to create a clear visual hierarchy.
- **Typography**: Primary text is a deep charcoal (#1E293B) to ensure AAA accessibility contrast against the white backgrounds.

## Typography

This design system uses a dual-font strategy to balance character with utility.

- **Hanken Grotesk** is used for headlines. Its sharp, contemporary geometry reinforces the "tech-forward" brand identity.
- **Inter** is used for all UI elements, chat bubbles, and body text. Its high x-height and neutral character make it the industry standard for legibility in data-heavy SaaS applications.

**Usage Rules:**
- Use `headline-lg` for dashboard titles.
- Use `body-md` for the primary chat transcript to balance density and readability.
- Use `label-md` for metadata like timestamps, channel tags (e.g., WhatsApp, Email), and section headers in the sidebar.

## Layout & Spacing

The layout utilizes a **12-column fluid grid** for dashboard views and a **fixed-sidebar/fluid-content** model for the main chat interface. 

- **Sidebar**: Fixed at 280px for navigation and 320px for the "Active Conversations" list.
- **Gutter**: 16px between cards and modules to maintain a "breathable" workspace.
- **Margins**: 24px outer page margins on desktop, scaling down to 16px on mobile.
- **Rhythm**: All spacing is based on a 4px baseline grid. Internal component padding should follow the 8px/16px/24px progression to ensure vertical rhythm.

## Elevation & Depth

To maintain a clean aesthetic, depth is communicated through **Tonal Layers** and **Ambient Shadows** rather than heavy borders.

- **Level 0 (Base)**: Pure white (#FFFFFF) for the main chat area.
- **Level 1 (Sub-surface)**: Light grey (#F8FAFC) for sidebars and utility panels.
- **Level 2 (Cards/Popovers)**: White surface with a "Soft Ambient" shadow (0px 4px 20px rgba(0, 0, 0, 0.05)). This is used for message bubbles and dashboard widgets.
- **Level 3 (Modals/Overlays)**: White surface with a "Deep Ambient" shadow (0px 12px 32px rgba(0, 0, 0, 0.12)).

No heavy borders are permitted. Use 1px borders in #E2E8F0 only when two white surfaces must touch.

## Shapes

The shape language is **Rounded**, reflecting the friendly and conversational nature of a chat platform. 

- **Standard Elements**: Buttons and input fields use a 0.5rem (8px) radius.
- **Message Bubbles**: These use a larger 1rem (16px) radius, with the corner pointing to the sender using a smaller 4px radius to indicate directionality.
- **Status Indicators**: Always 100% circular (pill-shaped).
- **Cards**: Use 1rem (16px) for larger container units to create a soft, approachable frame for complex data.

## Components

### Buttons
- **Primary**: Solid Green (#34A81E) with white text. High-contrast, used for "Send" or "Resolve."
- **Secondary**: Outlined Blue (#2F90B0) with white background. Used for "Add Note" or "Transfer."
- **Ghost**: No background, blue or grey text. Used for secondary navigation items.

### Chat Bubbles
- **Agent Bubbles**: White background with a 1px #E2E8F0 border.
- **Customer Bubbles**: Very light blue (#F1F5F9) background.
- **System/AI Bubbles**: Subtle gradient from #F8FAFC to #F1F5F9 with a small "AI" badge in Secondary Blue.

### Input Fields
- Clean, 8px rounded corners, 1px #E2E8F0 border. 
- On focus, the border transitions to Secondary Blue with a 3px soft blue outer glow (shadow).

### Chips/Tags
- Used for "Channel" (e.g., [SMS], [LiveChat]) or "Status" (e.g., [Urgent], [Pending]). 
- Tags use a semi-transparent version of the category color (10% opacity) with a darker text color for readability.

### Activity Feed
- A vertical list with 8px spacing between items. Each item uses `body-sm` for the content and `label-md` for the timestamp.
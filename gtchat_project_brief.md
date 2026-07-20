# Project Brief: GTChat Blog Platform

## 1. Project Overview
GTChat is an AI-powered multi-channel customer service platform (Meta, WhatsApp, Instagram) featuring chatbots and personalized AI agents. This project involves the creation of a dedicated blog and administration system to support content marketing and platform configuration.

**Core Objective:** Build a clean, high-performance blog frontend that integrates with a SQLite3 backend and reflects the GTChat brand identity.

## 2. Target Audience
- **Primary:** Customer support managers and business owners looking for AI automation solutions.
- **Secondary:** Developers and technical partners interested in GTChat API and integration capabilities.

## 3. Brand Identity
The visual language is defined by the **GTChat Design System ({{DATA:DESIGN_SYSTEM:DESIGN_SYSTEM_1}})**.
- **Primary Palette:** Predominantly white (`#ffffff`, `#f8f9ff`) with accents of GTChat Green (`#34a81e`) and Secondary Blue/Teal.
- **Typography:** Hanken Grotesk (Clean, modern, and highly legible).
- **Style:** Minimalist, high whitespace, rounded corners (8px), and subtle elevations.

## 4. Feature Requirements

### 4.1. Public Blog (User-Facing)
- **Home Screen ({{DATA:SCREEN:SCREEN_6}}):** Hero section featuring a "Featured Post" on AI innovation, followed by a "Latest News & Insights" grid.
- **Post Archive ({{DATA:SCREEN:SCREEN_8}}):** Full list of blog posts with category filtering (e.g., WhatsApp, AI & Bots, Customer Success) and search functionality.
- **Consistent Layout:** All blog posts must share a unified diagrammatic structure for readability.

### 4.2. Administration Console (Internal)
- **Platform Settings ({{DATA:SCREEN:SCREEN_2}}):**
    - Site Configuration (Title, SEO Meta Descriptions).
    - Social Media Integrations (Twitter, LinkedIn).
    - System Health Monitoring (Database connection status for SQLite3, Cache memory usage).
- **Post Editor ({{DATA:SCREEN:SCREEN_7}}):**
    - Rich text editor for content creation.
    - Media upload for cover images.
    - Metadata management (Categories, Tags, Scheduling).

## 5. Technical Specifications
- **Frontend:** React/HTML with Tailwind CSS.
- **Backend/Database:** Prepared for Linux server deployment using **SQLite3**.
- **Performance:** Optimized for fast loading and responsive across desktop and mobile devices.

## 6. Design Principles
1. **Fidelity:** Adherence to the brand logos ({{DATA:IMAGE:IMAGE_4}}, {{DATA:IMAGE:IMAGE_5}}).
2. **Clarity:** Information-dense admin screens balanced with high-readability blog layouts.
3. **Continuity:** Consistent navigation patterns (TopNavBar, SideNavBar) across all views.

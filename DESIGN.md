# Himsagar Travels - Design Documentation

## Vision
The new Himsagar Travels platform is designed to move away from generic travel templates towards a "Boutique Editorial" experience. It treats every tour not as a product, but as a "Chapter" or "Ritual" in a larger journey.

## Design Identity
- **Palette**: `Artistic Flair` (Deep Onyx #0a0b0d, Tuscan Gold #f2c94c).
- **Typography**: 
  - *Serif*: Playfair Display (Heavy Italic) for high-impact headings.
  - *Sans-Serif*: Inter for technical data points and navigation.
- **Layout Patterns**: Split-screen showcases, bento-grid dashboards, and monospace data labels.

## User Journeys
### For Customers
1. **The Prelude**: Enter through a high-definition video hero that establishes mood.
2. **The Catalog**: Browse curated manifests with a minimalist filter system.
3. **The Inquiry**: A streamlined, non-intrusive request form for high-conversion intent.

### For Administrators
1. **The Terminal**: A specialized "Shell" interface for managing dynamic content.
2. **The Manifest**: Real-time monitoring of customer inquiries.
3. **The Archive**: Simplified image and content management for non-technical users.

## Technical Infrastructure
- **Full-Stack Bundle**: Node.js + Express + React.
- **Database Architecture**: SQLite Relational Engine (Optimized for low-latency retrieval in sandboxed environments).
- **Security Protocols**: Salted password hashing (bcrypt) and JWT session management.

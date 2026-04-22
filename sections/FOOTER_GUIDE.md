# Footer Section - User Guide

## Overview
The footer section is now fully editable from the Shopify theme editor. All settings are stored in Shopify's database, which means your footer customizations will **persist across theme deployments**.

## How to Edit the Footer

### Access the Footer Settings
1. Go to Shopify Admin → Online Store → Themes
2. Click "Customize" on your active theme
3. Navigate to any page where the footer appears
4. Click on the "Footer" section in the left sidebar

## Available Settings

### 1. Brand Settings
- **Show Logo**: Toggle to display your logo instead of text
- **Footer Logo**: Upload a logo image (PNG/SVG recommended with transparent background)
- **Brand Name**: Your company/brand name (e.g., "TA Pharma")
- **Tagline**: A short descriptor (e.g., "Premium Healthcare Solutions")
- **Description**: Optional longer description of your business

### 2. Contact Information
- **Contact Section Title**: Heading for the contact column (default: "Contact Us")
- **Phone Number**: Your contact phone number (e.g., "+966 123 456 789")
- **Email Address**: Your contact email (e.g., "info@yourstore.com")
- **Physical Address**: Your business address

### 3. Social Media Links
- **Social Media Section Title**: Heading for social icons (default: "Follow Us")
- **Facebook URL**: Full URL to your Facebook page
- **Instagram URL**: Full URL to your Instagram profile
- **Twitter/X URL**: Full URL to your Twitter/X profile
- **LinkedIn URL**: Full URL to your LinkedIn page
- **YouTube URL**: Full URL to your YouTube channel
- **TikTok URL**: Full URL to your TikTok profile
- **Snapchat URL**: Full URL to your Snapchat profile

### 4. Quick Links (Blocks)
You can add up to 3 "Link List" blocks, each containing up to 6 custom links.

**To add a Link List:**
1. In the footer settings, click "Add block"
2. Select "Link List"
3. Set the heading (e.g., "Quick Links", "Customer Service", "Legal")
4. Add your links:
   - **Link 1-6 Label**: The text to display (e.g., "About Us")
   - **Link 1-6 URL**: The destination URL (can be internal `/pages/about` or external)

**Example Link Lists:**
- **Quick Links**: Home, Products, About, Contact
- **Customer Service**: Shipping Policy, Returns, FAQ, Support
- **Legal**: Privacy Policy, Terms of Service, Cookie Policy

### 5. Legal Information
- **Copyright Text**: Custom copyright text (leave empty for automatic year + brand name)
- **Commercial Registration (CR) Number**: Your CR number (displays if filled)
- **VAT Number**: Your VAT registration number (displays if filled)

### 6. Payment Methods
- **Show Payment Icons**: Toggle to show/hide all payment icons
- **Individual Payment Method Toggles**:
  - Visa
  - Mastercard
  - Mada
  - Apple Pay
  - STC Pay
  - Tabby
  - Tamara

### 7. Layout Settings
- **Copyright Text Alignment**: Left, Center, or Right alignment for copyright text

## Preserving Settings Across Deployments

### Why Your Settings Are Safe
All footer settings are stored in Shopify's `config/settings_data.json` file, which contains theme customization data. This file is **automatically managed by Shopify** and is not part of your theme code repository.

### Best Practices

#### ✅ DO:
- Edit footer settings through the Shopify theme editor
- Add/remove social media links as needed
- Update contact information whenever it changes
- Customize payment icons based on your active payment methods

#### ❌ DON'T:
- Edit the `footer.liquid` file directly unless changing the structure/design
- Commit `config/settings_data.json` to version control
- Manually edit JSON configuration files

### Deployment Workflow
When deploying theme updates:

1. **Your changes** (code, templates, sections) → Deploy via Shopify CLI or Git
2. **Footer settings** (from theme editor) → Automatically preserved by Shopify
3. **Result**: Code updates deploy without affecting your footer customization

### Using Shopify CLI
Add this to your `.shopifyignore` file (if not already present):
```
config/settings_data.json
```

This ensures footer settings are never overwritten during deployment.

## RTL (Arabic) Support
The footer automatically supports right-to-left (RTL) languages. When viewing in Arabic:
- Layout flips to RTL
- Text aligns appropriately
- Icons and spacing adjust automatically

## Responsive Design
The footer is fully responsive:
- **Mobile**: Single column layout, stacked sections
- **Tablet**: 2-column layout
- **Desktop**: 4-column layout with all sections visible

## Troubleshooting

### Footer not showing
1. Check that `{% section 'footer' %}` is present in your layout files
2. Verify the footer section is not disabled in the theme editor

### Links not working
1. Ensure URLs include the protocol (https://)
2. For internal links, use relative paths (e.g., `/pages/about`)
3. For external links, use full URLs (e.g., `https://facebook.com/yourpage`)

### Social icons not appearing
1. Verify you've entered the full URL (including https://)
2. Check that the URL field is not empty
3. Ensure the URL is valid

### Payment icons not showing
1. Check that "Show payment icons" is enabled
2. Verify individual payment method toggles are turned on
3. Ensure your theme's CSS is loading correctly

## Customization Examples

### Example 1: Simple Footer
```
Brand Name: TA Pharma
Tagline: Premium Healthcare Solutions
Phone: +966 12 345 6789
Email: info@tapharma.com
Facebook: https://facebook.com/tapharma
Instagram: https://instagram.com/tapharma
```

### Example 2: Complete Footer
```
Show Logo: ✓
Brand Name: TA Pharma
Tagline: Premium Healthcare Solutions
Description: We develop premium pharmaceutical and nutritional products...

Contact:
- Phone: +966 12 345 6789
- Email: info@tapharma.com
- Address: Riyadh, Saudi Arabia

Quick Links Block 1:
- Heading: "Shop"
- Products → /collections/all
- Beautican → /products/beautican
- New Arrivals → /collections/new

Quick Links Block 2:
- Heading: "Support"
- Contact → /pages/contact
- FAQ → /pages/faq
- Shipping → /policies/shipping-policy

Social Media:
- Facebook, Instagram, Twitter, LinkedIn (all filled)

Payment Icons: Visa, Mastercard, Mada, Apple Pay
CR Number: 1234567890
VAT Number: 123456789012345
```

## Support
For technical issues with the footer section code, contact your developer.
For content updates, use the Shopify theme editor as described above.

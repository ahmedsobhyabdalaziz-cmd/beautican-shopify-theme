# Beautican Shopify Theme

This is a custom Shopify theme for the Beautican product page, converted from the React/Vite landing page while preserving all design, content, animations, and functionality.

## Features

- ✅ **Pixel-perfect conversion** from React to Shopify Liquid
- ✅ **Bilingual support** (English/Arabic with RTL)
- ✅ **Native Shopify Cart API** integration
- ✅ **Scroll-triggered animations** using IntersectionObserver
- ✅ **Responsive design** with mobile-first approach
- ✅ **Custom brand styling** (Playfair Display, DM Sans, Tajawal, Kufam fonts)
- ✅ **Product variants** support (30, 60, 90 sachet packages)
- ✅ **Cart drawer** with quantity controls
- ✅ **Language toggle** with localStorage persistence

## Directory Structure

```
shopify-theme/
├── assets/
│   ├── beautican.css           # Compiled Tailwind + custom styles
│   ├── beautican.js            # Animations, language toggle, cart
│   ├── hero-beautican.jpg      # Hero background image
│   └── natural-beauty.jpg      # Truth section image
├── layout/
│   └── theme.liquid            # Main layout wrapper
├── templates/
│   └── product.beautican.json  # Product template configuration
├── sections/
│   ├── beautican-hero.liquid
│   ├── beautican-problem.liquid
│   ├── beautican-truth.liquid
│   ├── beautican-benefits.liquid
│   ├── beautican-mechanism.liquid
│   ├── beautican-solution.liquid
│   ├── beautican-credibility.liquid
│   ├── beautican-pricing.liquid
│   ├── beautican-cta.liquid
│   └── beautican-footer.liquid
└── snippets/
    ├── beautican-translations.liquid  # EN/AR translations
    ├── beautican-cart-drawer.liquid   # Cart drawer UI
    └── beautican-language-toggle.liquid # Language switcher
```

## Installation

### Option 1: Upload as a new theme

1. **Zip the theme files:**
   ```bash
   cd shopify-theme
   zip -r beautican-theme.zip .
   ```

2. **Upload to Shopify:**
   - Go to your Shopify Admin
   - Navigate to **Online Store > Themes**
   - Click **Add theme > Upload zip file**
   - Upload `beautican-theme.zip`

3. **Assign the template to your product:**
   - Go to **Products** in your Shopify Admin
   - Select your "Beautican" product
   - In the **Theme templates** section, select `product.beautican`
   - Save

### Option 2: Use Shopify CLI (Recommended)

1. **Install Shopify CLI** (if not already installed):
   ```bash
   npm install -g @shopify/cli @shopify/theme
   ```

2. **Push the theme:**
   ```bash
   cd shopify-theme
   shopify theme push
   ```

3. **Or push to a development theme:**
   ```bash
   shopify theme dev
   ```

### Option 3: Merge into existing theme

If you already have a theme and want to add these sections:

1. Copy the files from `sections/`, `snippets/`, and `assets/` into your existing theme
2. Add the `product.beautican.json` template to your `templates/` folder
3. Assign the template to your Beautican product

## Product Setup

Your Shopify product should have **3 variants** representing the pricing tiers:

1. **Variant 1**: 30 sachets (1 Month Course) - 285 SAR
2. **Variant 2**: 60 sachets (2 Months Course) - 543 SAR
3. **Variant 3**: 90 sachets (3 Months Course) - 749 SAR

The pricing section will automatically pull these variants and display them in the correct order.

## Customization

### Changing Colors

Edit the CSS variables in `assets/beautican.css`:

```css
:root {
  --accent: 38 45% 58%;        /* Gold accent color */
  --brand-olive: 150 18% 20%;  /* Dark olive background */
  --brand-gold: 38 45% 58%;    /* Gold highlights */
  /* ... more variables */
}
```

### Editing Translations

All text content is in `snippets/beautican-translations.liquid`. Edit the English and Arabic translations as needed.

### Modifying Sections

Each section is a standalone Liquid file in `sections/`. You can:
- Reorder sections by editing `templates/product.beautican.json`
- Customize section content by editing the `.liquid` files
- Add new sections following the same pattern

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Technical Details

### Animations

Animations use `IntersectionObserver` API to trigger when elements scroll into view. Elements with the `.animate-on-scroll` class will fade up automatically.

### Cart Management

The cart uses Shopify's native Ajax Cart API:
- `/cart/add.js` - Add items
- `/cart/change.js` - Update quantities
- `/cart.js` - Get cart state
- `/checkout` - Native Shopify checkout

### Language Switching

Language preference is stored in `localStorage` and persists across sessions. The HTML `lang` and `dir` attributes update dynamically.

### RTL Support

Arabic language automatically switches to RTL layout with appropriate font families (Tajawal for body, Kufam for headings).

## Troubleshooting

### Images not loading
Make sure the image files are in the `assets/` folder and uploaded to Shopify.

### Translations not working
Check that `beautican-translations.liquid` is included in the layout and the JavaScript is loading correctly.

### Cart not working
Verify that your product has variants set up correctly and that the variant IDs are being passed to the cart functions.

### Styling issues
Ensure `beautican.css` is loaded in the layout and there are no conflicts with other theme styles.

## Support

For issues or questions about this theme conversion, refer to the original React codebase or contact the development team.

## License

This theme is proprietary and created specifically for the Beautican product.

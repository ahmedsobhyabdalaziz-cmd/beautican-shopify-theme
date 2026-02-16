# Beautican Theme - Deployment Guide

## 🚀 Quick Deployment Options

### Option 1: Manual Upload via Shopify Admin (Easiest - 5 minutes)

This is the simplest method and doesn't require any CLI tools.

1. **Create a ZIP file:**
   ```bash
   cd /Users/ahmedsobhy/narrative-magic-launch-main/shopify-theme
   zip -r beautican-theme.zip assets layout sections snippets templates README.md
   ```

2. **Upload to Shopify:**
   - Go to your Shopify Admin: https://[your-store].myshopify.com/admin
   - Navigate to: **Online Store > Themes**
   - Click **Add theme** (top right)
   - Select **Upload zip file**
   - Upload `beautican-theme.zip`
   - Wait for it to process

3. **Assign to Product:**
   - Go to **Products** in Shopify Admin
   - Find/create your "Beautican" product
   - Make sure it has 3 variants:
     * Variant 1: 30 sachets - 285 SAR
     * Variant 2: 60 sachets - 543 SAR
     * Variant 3: 90 sachets - 749 SAR
   - In the product editor, scroll to **Theme templates**
   - Select `product.beautican` from the dropdown
   - Click **Save**

4. **Preview/Publish:**
   - Go back to **Online Store > Themes**
   - Find your "beautican-theme"
   - Click **Actions > Preview** to test
   - Click **Actions > Publish** when ready

---

### Option 2: Using Shopify CLI (Recommended for developers)

**Prerequisites:**
- Shopify Partner account or store owner access
- Node.js installed

**Steps:**

1. **Install Shopify CLI:**
   ```bash
   npm install -g @shopify/cli @shopify/theme
   ```
   
   If you get permission errors, use:
   ```bash
   sudo npm install -g @shopify/cli @shopify/theme
   ```

2. **Navigate to theme directory:**
   ```bash
   cd /Users/ahmedsobhy/narrative-magic-launch-main/shopify-theme
   ```

3. **Login to Shopify:**
   ```bash
   shopify auth login
   ```
   This will open a browser for authentication.

4. **Push theme to store:**
   
   **For development/testing:**
   ```bash
   shopify theme dev --store your-store.myshopify.com
   ```
   This creates a live preview URL.
   
   **To push as a new theme:**
   ```bash
   shopify theme push --store your-store.myshopify.com
   ```
   
   **To push to existing theme:**
   ```bash
   shopify theme push --theme YOUR_THEME_ID --store your-store.myshopify.com
   ```

5. **Assign template to product** (same as Option 1, step 3)

---

### Option 3: Using Theme Kit (Alternative CLI tool)

**Install Theme Kit:**
```bash
brew install themekit
```

Or download from: https://shopify.dev/themes/tools/theme-kit/getting-started

**Configure:**
```bash
cd /Users/ahmedsobhy/narrative-magic-launch-main/shopify-theme
theme configure --password YOUR_PRIVATE_APP_PASSWORD --store your-store.myshopify.com --themeid YOUR_THEME_ID
```

**Deploy:**
```bash
theme deploy
```

---

### Option 4: Direct File Upload (For small changes)

If you just need to update specific files:

1. Go to **Online Store > Themes**
2. Click **Actions > Edit code** on your theme
3. Navigate to the folder (assets, sections, etc.)
4. Click **Add a new asset/section/snippet**
5. Upload or paste the file content

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] Your Shopify store is set up
- [ ] You have admin access
- [ ] Product "Beautican" exists with 3 variants (30, 60, 90 sachets)
- [ ] Product prices are set correctly (285, 543, 749 SAR)
- [ ] You have backed up your current theme (if any)

---

## 🔧 Post-Deployment Configuration

After uploading the theme:

### 1. Test the Product Page
- Visit: `https://your-store.myshopify.com/products/beautican`
- Test language switching (EN ⟷ AR)
- Test "Add to Cart" buttons
- Test cart drawer functionality
- Test on mobile devices

### 2. Verify Product Variants
The pricing section expects variants in this order:
1. First variant = 30 sachets
2. Second variant = 60 sachets
3. Third variant = 90 sachets

If your variants are in a different order, you may need to reorder them in Shopify Admin.

### 3. Check Images
Make sure these images are uploaded:
- `hero-beautican.jpg` - Hero background
- `natural-beauty.jpg` - Truth section image

### 4. Test Checkout Flow
- Add items to cart
- Click checkout
- Verify Shopify's native checkout loads correctly

---

## 🐛 Troubleshooting

### Theme not appearing after upload
- Check the zip file contains the correct structure (assets, layout, sections, etc.)
- Make sure there are no nested folders in the zip

### Product page is blank
- Verify the template is assigned: Products > [Your Product] > Theme templates > product.beautican
- Check that the product exists and is published

### Pricing not showing correctly
- Verify product has exactly 3 variants
- Check variant prices in Shopify Admin
- Ensure variants are in the correct order (30, 60, 90 sachets)

### Cart not working
- Check browser console for JavaScript errors
- Verify `beautican.js` is loaded
- Test in incognito mode (to rule out extensions)

### Language toggle not working
- Check that `beautican-translations.liquid` is included
- Verify JavaScript is loading
- Clear browser cache

### Images not loading
- Go to **Online Store > Themes > Actions > Edit code**
- Navigate to **Assets**
- Verify `hero-beautican.jpg` and `natural-beauty.jpg` are present
- If missing, upload them manually

---

## 📞 Need Help?

If you encounter issues:

1. Check the browser console for errors (F12 > Console)
2. Verify all files uploaded correctly
3. Test in incognito mode
4. Check Shopify's theme documentation: https://shopify.dev/themes

---

## 🔄 Making Updates

To update the theme after deployment:

**Via Shopify Admin:**
- Go to **Online Store > Themes > Actions > Edit code**
- Find the file you want to edit
- Make changes and click **Save**

**Via CLI:**
```bash
cd /Users/ahmedsobhy/narrative-magic-launch-main/shopify-theme
shopify theme push --store your-store.myshopify.com
```

---

## 📦 Theme Structure Reference

```
shopify-theme/
├── assets/
│   ├── beautican.css           # All styles
│   ├── beautican.js            # All JavaScript
│   ├── hero-beautican.jpg      # Hero image
│   └── natural-beauty.jpg      # Truth section image
├── layout/
│   └── theme.liquid            # Main layout
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
├── snippets/
│   ├── beautican-translations.liquid
│   ├── beautican-cart-drawer.liquid
│   └── beautican-language-toggle.liquid
└── templates/
    └── product.beautican.json   # Template config
```

---

## ✅ Success Indicators

Your theme is working correctly if:
- ✅ Product page loads with all sections visible
- ✅ Language toggle switches between EN/AR
- ✅ RTL layout works for Arabic
- ✅ Add to cart buttons work
- ✅ Cart drawer opens and shows items
- ✅ Animations trigger on scroll
- ✅ Mobile layout is responsive
- ✅ Checkout button redirects to Shopify checkout

---

**Ready to deploy? Start with Option 1 (Manual Upload) - it's the fastest way to get your theme live!**

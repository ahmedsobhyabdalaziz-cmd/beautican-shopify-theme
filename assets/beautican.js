/**
 * Beautican Theme JavaScript
 * Handles animations, language switching, and cart functionality
 */

(function() {
  'use strict';

  // ============================================================================
  // Language Management
  // ============================================================================
  
  const LanguageManager = {
    currentLang: 'en',
    
    init() {
      // Load saved language preference
      const savedLang = localStorage.getItem('beautican-lang') || 'en';
      this.setLanguage(savedLang, false);
      
      // Set up language toggle listeners
      document.addEventListener('click', (e) => {
        if (e.target.closest('[data-language-toggle]')) {
          e.preventDefault();
          this.toggleLanguage();
        }
      });
    },
    
    toggleLanguage() {
      const newLang = this.currentLang === 'en' ? 'ar' : 'en';
      this.setLanguage(newLang, true);
    },
    
    setLanguage(lang, save = true) {
      this.currentLang = lang;
      const html = document.documentElement;
      
      // Update HTML attributes
      html.setAttribute('lang', lang);
      html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      
      // Update all translatable elements
      this.updateTranslations();
      
      // Save preference
      if (save) {
        localStorage.setItem('beautican-lang', lang);
      }
    },
    
    updateTranslations() {
      const translations = window.beauticanTranslations[this.currentLang];
      
      // Update all elements with data-i18n attribute
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const value = this.getNestedValue(translations, key);
        if (value) {
          el.textContent = value;
        }
      });
      
      // Update language toggle button text (only the span, not the SVG)
      const toggleBtn = document.querySelector('[data-language-toggle]');
      if (toggleBtn) {
        const span = toggleBtn.querySelector('span');
        if (span) {
          span.textContent = translations.langToggle;
        }
      }
    },
    
    getNestedValue(obj, path) {
      return path.split('.').reduce((current, key) => current?.[key], obj);
    },
    
    t(key) {
      return this.getNestedValue(window.beauticanTranslations[this.currentLang], key) || key;
    }
  };

  // ============================================================================
  // Animation System (IntersectionObserver)
  // ============================================================================
  
  const AnimationManager = {
    observer: null,
    
    init() {
      // Create intersection observer
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animated');
              // Optionally unobserve after animation
              // this.observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        }
      );
      
      // Observe all elements with animation classes
      this.observeElements();
    },
    
    observeElements() {
      const animatedElements = document.querySelectorAll('.animate-on-scroll');
      animatedElements.forEach(el => {
        this.observer.observe(el);
      });
    }
  };

  // ============================================================================
  // Cart Management (Shopify Ajax API)
  // ============================================================================
  
  const CartManager = {
    isOpen: false,
    isLoading: false,
    cart: null,
    lastAddedVariantId: null,
    
    init() {
      // Load cart on init
      this.loadCart();
      
      // Set up event listeners
      this.setupEventListeners();
    },
    
    setupEventListeners() {
      // Cart drawer toggle
      document.addEventListener('click', (e) => {
        if (e.target.closest('[data-cart-toggle]')) {
          e.preventDefault();
          this.toggleDrawer();
        }
        
        if (e.target.closest('[data-cart-close]')) {
          e.preventDefault();
          this.closeDrawer();
        }
        
        // Close drawer when clicking overlay
        if (e.target.classList.contains('sheet-overlay')) {
          this.closeDrawer();
        }
      });
      
      // Add to cart buttons
      document.addEventListener('click', async (e) => {
        const addBtn = e.target.closest('[data-add-to-cart]');
        if (addBtn) {
          e.preventDefault();
          const variantId = parseInt(addBtn.getAttribute('data-variant-id'), 10);
          const quantity = parseInt(addBtn.getAttribute('data-quantity') || '1', 10);
          if (!variantId) {
            console.error('No variant ID found');
            return;
          }
          await this.addToCart(variantId, quantity, addBtn);
        }
      });
      
      // Quantity controls in cart
      document.addEventListener('click', async (e) => {
        const increaseBtn = e.target.closest('[data-cart-increase]');
        const decreaseBtn = e.target.closest('[data-cart-decrease]');
        const removeBtn = e.target.closest('[data-cart-remove]');
        
        if (increaseBtn) {
          e.preventDefault();
          const lineKey = increaseBtn.getAttribute('data-line-key');
          await this.updateQuantity(lineKey, 1);
        }
        
        if (decreaseBtn) {
          e.preventDefault();
          const lineKey = decreaseBtn.getAttribute('data-line-key');
          await this.updateQuantity(lineKey, -1);
        }
        
        if (removeBtn) {
          e.preventDefault();
          const lineKey = removeBtn.getAttribute('data-line-key');
          await this.removeItem(lineKey);
        }
      });
    },
    
    async loadCart() {
      try {
        const response = await fetch('/cart.js');
        this.cart = await response.json();
        this.updateCartUI();
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    },
    
    async addToCart(variantId, quantity, button) {
      if (this.isLoading) return;
      
      this.isLoading = true;
      this.setButtonLoading(button, true);
      
      try {
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: variantId,
            quantity: quantity
          })
        });
        
        if (!response.ok) throw new Error('Failed to add to cart');
        
        this.lastAddedVariantId = variantId;
        await this.loadCart();
        
        // Show success notification
        this.showNotification(LanguageManager.t('cart.addedToCart'), 'success');
        
        // Open cart drawer
        this.openDrawer();
        
      } catch (error) {
        console.error('Failed to add to cart:', error);
        this.showNotification('Error adding to cart', 'error');
      } finally {
        this.isLoading = false;
        this.setButtonLoading(button, false);
      }
    },
    
    async updateQuantity(lineKey, delta) {
      if (this.isLoading) return;
      
      const item = this.cart.items.find(i => i.key === lineKey);
      if (!item) return;
      
      const newQuantity = item.quantity + delta;
      if (newQuantity < 0) return;
      
      if (newQuantity === 0) {
        await this.removeItem(lineKey);
        return;
      }
      
      this.isLoading = true;
      
      try {
        const response = await fetch('/cart/change.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: lineKey,
            quantity: newQuantity
          })
        });
        
        if (!response.ok) throw new Error('Failed to update cart');
        
        this.cart = await response.json();
        this.updateCartUI();
        
      } catch (error) {
        console.error('Failed to update cart:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    async removeItem(lineKey) {
      if (this.isLoading) return;
      
      this.isLoading = true;
      
      try {
        const response = await fetch('/cart/change.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: lineKey,
            quantity: 0
          })
        });
        
        if (!response.ok) throw new Error('Failed to remove item');
        
        this.cart = await response.json();
        this.updateCartUI();
        
      } catch (error) {
        console.error('Failed to remove item:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    updateCartUI() {
      // Update cart count badge
      const badge = document.querySelector('[data-cart-count]');
      if (badge) {
        const count = this.cart?.item_count || 0;
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
      }
      
      // Update cart drawer content
      const cartContent = document.querySelector('[data-cart-content]');
      if (!cartContent) return;
      
      if (!this.cart || this.cart.item_count === 0) {
        cartContent.innerHTML = `
          <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
            <svg class="w-16 h-16 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <p class="text-muted-foreground" data-i18n="cart.empty">${LanguageManager.t('cart.empty')}</p>
          </div>
        `;
        return;
      }
      
      // Render cart items
      let itemsHTML = '';
      this.cart.items.forEach(item => {
        const isLastAdded = item.variant_id.toString() === this.lastAddedVariantId;
        itemsHTML += `
          <div class="flex gap-4 py-4 border-b border-border ${isLastAdded ? 'bg-accent/5' : ''}">
            <img src="${item.image}" alt="${item.title}" class="w-20 h-20 object-cover rounded-sm">
            <div class="flex-1">
              <h4 class="font-display font-medium text-sm mb-1">${item.product_title}</h4>
              <p class="text-xs text-muted-foreground mb-2">${item.variant_title}</p>
              <p class="text-sm font-semibold">${this.formatMoney(item.final_line_price)} SAR</p>
            </div>
            <div class="flex flex-col items-end gap-2">
              <button data-cart-remove data-line-key="${item.key}" class="text-muted-foreground hover:text-destructive transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
              <div class="flex items-center gap-2 border border-border rounded-sm">
                <button data-cart-decrease data-line-key="${item.key}" class="px-2 py-1 hover:bg-muted transition-colors">-</button>
                <span class="px-2 text-sm font-medium">${item.quantity}</span>
                <button data-cart-increase data-line-key="${item.key}" class="px-2 py-1 hover:bg-muted transition-colors">+</button>
              </div>
            </div>
          </div>
        `;
      });
      
      cartContent.innerHTML = `
        <div class="flex-1 overflow-y-auto">
          ${itemsHTML}
        </div>
        <div class="border-t border-border p-6 space-y-4">
          <div class="flex justify-between items-center text-lg font-display font-semibold">
            <span data-i18n="cart.total">${LanguageManager.t('cart.total')}</span>
            <span>${this.formatMoney(this.cart.total_price)} SAR</span>
          </div>
          <a href="/checkout" class="w-full block text-center py-4 px-8 font-bold text-sm tracking-wider uppercase rounded-sm transition-all hover:brightness-110 active:scale-[0.98]" style="background: hsl(var(--accent)); color: hsl(var(--accent-foreground)); box-shadow: 0 4px 14px hsl(var(--accent) / 0.3); min-height: 52px; display: flex; align-items: center; justify-content: center;" data-i18n="cart.checkout">
            ${LanguageManager.t('cart.checkout')}
          </a>
        </div>
      `;
      
      // Update pricing section cart quantities
      this.updatePricingQuantities();
    },
    
    updatePricingQuantities() {
      document.querySelectorAll('[data-variant-quantity]').forEach(el => {
        const variantId = el.getAttribute('data-variant-id');
        const item = this.cart?.items.find(i => i.variant_id.toString() === variantId);
        const quantity = item?.quantity || 0;
        
        el.textContent = quantity;
        el.style.display = quantity > 0 ? 'flex' : 'none';
      });
    },
    
    formatMoney(cents) {
      return (cents / 100).toFixed(2);
    },
    
    setButtonLoading(button, loading) {
      if (!button) return;
      
      if (loading) {
        button.disabled = true;
        button.classList.add('opacity-50');
        const originalText = button.innerHTML;
        button.setAttribute('data-original-text', originalText);
        button.innerHTML = `
          <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        `;
      } else {
        button.disabled = false;
        button.classList.remove('opacity-50');
        const originalText = button.getAttribute('data-original-text');
        if (originalText) {
          button.innerHTML = originalText;
        }
      }
    },
    
    openDrawer() {
      this.isOpen = true;
      const overlay = document.querySelector('[data-cart-overlay]');
      const drawer = document.querySelector('[data-cart-drawer]');
      
      if (overlay) {
        overlay.classList.remove('hidden');
      }
      if (drawer) {
        drawer.classList.add('open');
      }
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    },
    
    closeDrawer() {
      this.isOpen = false;
      const overlay = document.querySelector('[data-cart-overlay]');
      const drawer = document.querySelector('[data-cart-drawer]');
      
      if (overlay) {
        overlay.classList.add('hidden');
      }
      if (drawer) {
        drawer.classList.remove('open');
      }
      
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Clear last added highlight
      this.lastAddedVariantId = null;
    },
    
    toggleDrawer() {
      if (this.isOpen) {
        this.closeDrawer();
      } else {
        this.openDrawer();
      }
    },
    
    showNotification(message, type = 'success') {
      // Simple notification system
      const notification = document.createElement('div');
      notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-sm shadow-lg ${
        type === 'success' ? 'bg-accent text-accent-foreground' : 'bg-destructive text-destructive-foreground'
      }`;
      notification.textContent = message;
      
      document.body.appendChild(notification);
      
      // Animate in
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        notification.style.transition = 'all 0.3s ease-out';
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
      }, 10);
      
      // Remove after 3 seconds
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-10px)';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
  };

  // ============================================================================
  // Smooth Scroll for Anchor Links
  // ============================================================================
  
  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (link) {
        const href = link.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }

  // ============================================================================
  // Initialize Everything
  // ============================================================================
  
  function init() {
    // Wait for translations to be loaded
    if (typeof window.beauticanTranslations === 'undefined') {
      console.error('Beautican translations not loaded');
      return;
    }
    
    LanguageManager.init();
    AnimationManager.init();
    CartManager.init();
    initSmoothScroll();
    
    console.log('Beautican theme initialized');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

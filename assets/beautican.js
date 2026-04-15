/**
 * Beautican Theme JavaScript
 * Handles animations and cart functionality
 * Language is managed server-side via Shopify's native i18n (locale URLs)
 */

(function() {
  'use strict';

  if (window.__beauticanInitialized) return;
  window.__beauticanInitialized = true;

  // ============================================================================
  // Animation System (IntersectionObserver)
  // ============================================================================
  
  const AnimationManager = {
    observer: null,
    
    init() {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animated');
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        }
      );
      
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
    
    str(key) {
      return (window.cartStrings && window.cartStrings[key]) || key;
    },
    
    init() {
      this.loadCart();
      this.setupEventListeners();
    },
    
    setupEventListeners() {
      document.addEventListener('click', (e) => {
        if (e.target.closest('[data-cart-toggle]')) {
          e.preventDefault();
          this.toggleDrawer();
        }
        
        if (e.target.closest('[data-cart-close]')) {
          e.preventDefault();
          this.closeDrawer();
        }
        
        if (e.target.classList.contains('sheet-overlay')) {
          this.closeDrawer();
        }
      });
      
      document.addEventListener('click', async (e) => {
        const addBtn = e.target.closest('[data-add-to-cart]');
        if (addBtn) {
          e.preventDefault();
          e.stopPropagation();
          const variantId = parseInt(addBtn.getAttribute('data-variant-id'), 10);
          const quantity = parseInt(addBtn.getAttribute('data-quantity') || '1', 10);
          if (!variantId) {
            console.error('No variant ID found');
            return;
          }
          await this.addToCart(variantId, quantity, addBtn);
        }
      });
      
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
        const id = Number(variantId);
        const qty = Number(quantity) || 1;
        
        if (!id || isNaN(id)) {
          throw new Error('Invalid variant ID: ' + variantId);
        }
        
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            items: [{
              id: id,
              quantity: qty
            }]
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const msg = errorData.description || errorData.message || 'Failed to add to cart';
          throw new Error(msg);
        }
        
        this.lastAddedVariantId = variantId;
        await this.loadCart();
        
        this.showNotification(this.str('addedToCart'), 'success');
        this.openDrawer();
        
      } catch (error) {
        console.error('Failed to add to cart:', error);
        this.showNotification(error.message || 'Error adding to cart', 'error');
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
      const badge = document.querySelector('[data-cart-count]');
      if (badge) {
        const count = this.cart?.item_count || 0;
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
      }
      
      const cartContent = document.querySelector('[data-cart-content]');
      if (!cartContent) return;
      
      if (!this.cart || this.cart.item_count === 0) {
        cartContent.innerHTML = `
          <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
            <svg class="w-16 h-16 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            <p class="text-muted-foreground">${this.str('empty')}</p>
          </div>
        `;
        return;
      }
      
      let itemsHTML = '';
      this.cart.items.forEach(item => {
        const isLastAdded = item.variant_id.toString() === this.lastAddedVariantId;
        const unitPrice = this.formatMoney(item.final_line_price);
        itemsHTML += `
          <div class="py-5 px-6 border-b border-border ${isLastAdded ? 'bg-accent/5' : ''}">
            <div class="flex gap-4 items-start">
              <div class="w-18 h-18 flex-shrink-0 rounded-xl overflow-hidden border border-border bg-card" style="width:72px;height:72px;">
                <img src="${item.image}" alt="${item.product_title}" style="width:100%;height:100%;object-fit:cover;" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2 mb-1">
                  <h4 style="font-size:14px;font-weight:600;line-height:1.3;margin:0;">${item.product_title}</h4>
                  <button data-cart-remove data-line-key="${item.key}"
                    style="flex-shrink:0;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:1.5px solid hsl(var(--border));background:transparent;cursor:pointer;transition:all 0.15s;"
                    onmouseover="this.style.borderColor='hsl(var(--destructive))';this.style.color='hsl(var(--destructive))'"
                    onmouseout="this.style.borderColor='hsl(var(--border))';this.style.color='hsl(var(--muted-foreground))'">
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                ${item.variant_title && item.variant_title !== 'Default Title' ? `<p style="font-size:12px;color:hsl(var(--muted-foreground));margin:0 0 10px;">${item.variant_title}</p>` : '<div style="margin-bottom:10px;"></div>'}
                <div class="flex items-center justify-between gap-3">
                  <span style="font-size:15px;font-weight:700;color:hsl(var(--foreground));">
                    ${unitPrice} <img src="https://cdn.shopify.com/s/files/1/0805/3463/4755/files/sar.png?v=1771305908" alt="SAR" class="sar-icon" />
                  </span>
                  <div style="display:flex;align-items:center;gap:0;border:1.5px solid hsl(var(--border));border-radius:24px;overflow:hidden;background:hsl(var(--card));">
                    <button data-cart-decrease data-line-key="${item.key}"
                      style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:transparent;border:none;cursor:pointer;font-size:16px;font-weight:500;color:hsl(var(--foreground));transition:background 0.15s;"
                      onmouseover="this.style.background='hsl(var(--muted))'"
                      onmouseout="this.style.background='transparent'">−</button>
                    <span style="min-width:28px;text-align:center;font-size:14px;font-weight:600;color:hsl(var(--foreground));">${item.quantity}</span>
                    <button data-cart-increase data-line-key="${item.key}"
                      style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:transparent;border:none;cursor:pointer;font-size:16px;font-weight:500;color:hsl(var(--foreground));transition:background 0.15s;"
                      onmouseover="this.style.background='hsl(var(--muted))'"
                      onmouseout="this.style.background='transparent'">+</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      });

      const itemCount = this.cart.item_count;
      const itemLabel = itemCount === 1 ? this.str('item') : this.str('items');
      cartContent.innerHTML = `
        <div style="flex:1;overflow-y:auto;">
          ${itemsHTML}
        </div>
        <div style="border-top:1px solid hsl(var(--border));padding:20px 24px 24px;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
            <span style="font-size:12px;color:hsl(var(--muted-foreground));">${itemCount} ${itemLabel}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <span style="font-size:16px;font-weight:700;">${this.str('total')}</span>
            <span style="font-size:20px;font-weight:800;color:hsl(var(--foreground));">
              ${this.formatMoney(this.cart.total_price)} <img src="https://cdn.shopify.com/s/files/1/0805/3463/4755/files/sar.png?v=1771305908" alt="SAR" class="sar-icon sar-icon-lg" />
            </span>
          </div>
          <a href="/checkout"
            style="display:flex;align-items:center;justify-content:center;width:100%;min-height:52px;border-radius:14px;font-weight:700;font-size:15px;text-decoration:none;background:hsl(var(--accent));color:hsl(var(--accent-foreground));box-shadow:0 4px 16px hsl(var(--accent)/0.35);transition:filter 0.15s,transform 0.1s;"
            onmouseover="this.style.filter='brightness(1.08)'"
            onmouseout="this.style.filter='brightness(1)'"
            onmousedown="this.style.transform='scale(0.98)'"
            onmouseup="this.style.transform='scale(1)'">
            ${this.str('checkout')}
          </a>
        </div>
      `;
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
      
      if (overlay) overlay.classList.remove('hidden');
      if (drawer) drawer.classList.add('open');
      
      document.body.style.overflow = 'hidden';
    },
    
    closeDrawer() {
      this.isOpen = false;
      const overlay = document.querySelector('[data-cart-overlay]');
      const drawer = document.querySelector('[data-cart-drawer]');
      
      if (overlay) overlay.classList.add('hidden');
      if (drawer) drawer.classList.remove('open');
      
      document.body.style.overflow = '';
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
      const notification = document.createElement('div');
      notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-sm shadow-lg ${
        type === 'success' ? 'bg-accent text-accent-foreground' : 'bg-destructive text-destructive-foreground'
      }`;
      notification.textContent = message;
      
      document.body.appendChild(notification);
      
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        notification.style.transition = 'all 0.3s ease-out';
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
      }, 10);
      
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
    AnimationManager.init();
    CartManager.init();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

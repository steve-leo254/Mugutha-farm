(function ($) {
    "use strict";

    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 40) {
            $('.navbar').addClass('sticky-top');
        } else {
            $('.navbar').removeClass('sticky-top');
        }
    });
    
    // Dropdown on mouse hover
    $(document).ready(function () {
        function toggleNavbarMethod() {
            if ($(window).width() > 992) {
                $('.navbar .dropdown').on('mouseover', function () {
                    $('.dropdown-toggle', this).trigger('click');
                }).on('mouseout', function () {
                    $('.dropdown-toggle', this).trigger('click').blur();
                });
            } else {
                $('.navbar .dropdown').off('mouseover').off('mouseout');
            }
        }
        toggleNavbarMethod();
        $(window).resize(toggleNavbarMethod);
    });
    
    // Back to top button
    if ($('.back-to-top').length) {
        $(window).scroll(function () {
            if ($(this).scrollTop() > 100) {
                $('.back-to-top').fadeIn('slow');
            } else {
                $('.back-to-top').fadeOut('slow');
            }
        });
        $('.back-to-top').click(function () {
            $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
            return false;
        });
    }

    // Facts counter
    if ($('[data-toggle="counter-up"]').length && $.fn.counterUp) {
        $('[data-toggle="counter-up"]').counterUp({
            delay: 10,
            time: 2000
        });
    }

    // Product carousel
    if ($(".product-carousel").length && $.fn.owlCarousel) {
        $(".product-carousel").owlCarousel({
            autoplay: true,
            smartSpeed: 3000,
            margin: 45,
            dots: false,
            loop: true,
            nav: true,
            navText: [
                '<i class="bi bi-arrow-left"></i>',
                '<i class="bi bi-arrow-right"></i>'
            ],
            responsive: {
                0: { items: 1 },
                768: { items: 2 },
                992: { items: 3 },
                1200: { items: 4 }
            }
        });
    }

    // Testimonials carousel
    if ($(".testimonial-carousel").length && $.fn.owlCarousel) {
        $(".testimonial-carousel").owlCarousel({
            autoplay: true,
            smartSpeed: 1000,
            items: 1,
            dots: false,
            loop: true,
            nav: true,
            navText: [
                '<i class="bi bi-arrow-left"></i>',
                '<i class="bi bi-arrow-right"></i>'
            ],
        });
    }
    
})(jQuery);

// Enhanced Cart System for SECOL POULTRY
(function() {
    'use strict';

    // In-memory cart storage (fallback when localStorage is not available)
    let cartData = [];
    let useLocalStorage = true;

    // Test localStorage availability
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
    } catch(e) {
        useLocalStorage = false;
        console.warn('[Cart] localStorage not available, using in-memory storage');
    }

    // Storage helper functions with fallback
    const CartStorage = {
        get: function() {
            if (useLocalStorage) {
                try {
                    const stored = localStorage.getItem('secolCart');
                    return stored ? JSON.parse(stored) : [];
                } catch (e) {
                    console.error('[Cart] Error parsing cart data:', e);
                    useLocalStorage = false;
                    return cartData;
                }
            }
            return cartData;
        },
        set: function(cart) {
            if (useLocalStorage) {
                try {
                    localStorage.setItem('secolCart', JSON.stringify(cart));
                    cartData = cart; // Keep in-memory copy as backup
                    return true;
                } catch (e) {
                    console.error('[Cart] Error saving to localStorage:', e);
                    useLocalStorage = false;
                    cartData = cart;
                    return true;
                }
            }
            cartData = cart;
            return true;
        },
        clear: function() {
            if (useLocalStorage) {
                try {
                    localStorage.removeItem('secolCart');
                } catch (e) {
                    console.error('[Cart] Error clearing localStorage:', e);
                }
            }
            cartData = [];
        }
    };

    // Get product details from various page structures
    function getProductDetails(btn) {
        // Try to get product details from the button's data attributes first
        let name = btn.getAttribute('data-name');
        let price = btn.getAttribute('data-price');
        let image = btn.getAttribute('data-image');

        // If not found in data attributes, try to find from parent elements
        if (!name || !price) {
            const productCard = btn.closest('.feature-item, .product-card, .card, .product-item');
            if (productCard) {
                // Look for product name
                if (!name) {
                    const nameEl = productCard.querySelector('h3, h4, h5, .product-name, .product-title');
                    name = nameEl ? nameEl.textContent.trim() : null;
                }

                // Look for price
                if (!price) {
                    const priceEl = productCard.querySelector('.price, .product-price, [data-price]');
                    if (priceEl) {
                        const priceText = priceEl.textContent || priceEl.getAttribute('data-price');
                        const priceMatch = priceText.match(/[\d,]+\.?\d*/);
                        price = priceMatch ? priceMatch[0].replace(/,/g, '') : null;
                    }
                }

                // Look for image
                if (!image) {
                    const imgEl = productCard.querySelector('img');
                    image = imgEl ? imgEl.getAttribute('src') : null;
                }
            }
        }

        return { name, price, image };
    }

    // Add to Cart function
    window.addToCart = function(event) {
        event.preventDefault();
        
        const btn = event.target.closest('.add-to-cart');
        if (!btn) {
            console.warn('[Cart] Add to cart button not found');
            return;
        }

        const { name, price: priceStr, image } = getProductDetails(btn);
        
        if (!name || !priceStr) {
            console.warn('[Cart] Missing product data:', { name, price: priceStr });
            showNotification('Error: Product information is missing', 'error');
            return;
        }

        const price = parseFloat(priceStr);
        if (isNaN(price) || price <= 0) {
            console.warn('[Cart] Invalid price:', priceStr);
            showNotification('Error: Invalid product price', 'error');
            return;
        }

        let cart = CartStorage.get();
        const existingIndex = cart.findIndex(item => item.name === name);
        
        if (existingIndex !== -1) {
            cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
        } else {
            cart.push({ 
                name, 
                price, 
                quantity: 1, 
                image: image || 'img/product-default.png',
                id: Date.now() + Math.random() // Simple unique ID
            });
        }

        if (CartStorage.set(cart)) {
            console.log('[Cart] Added:', { name, price, quantity: 1 }, 'Current cart:', cart);
            showNotification(`${name} added to cart!`, 'success');
            updateCartCount();
            updateCartDisplay();
        } else {
            showNotification('Error: Could not add item to cart', 'error');
        }
    };

    // Update Cart Count Badge
    window.updateCartCount = function() {
        const cart = CartStorage.get();
        const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        const badge = document.getElementById('cart-count');
        
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        }
        
        console.log('[Cart] Count updated:', count);
        return count;
    };

    // Update cart display (both modal and checkout page)
    function updateCartDisplay() {
        // Update checkout page if present
        if (document.getElementById('cartItems')) {
            renderCart();
        }
        // Update modal content if it's open
        const modal = document.getElementById('cartModal');
        if (modal && modal.style.display === 'flex') {
            showCartModal();
        }
    }

    // Show notification
    function showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('cart-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'cart-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                max-width: 300px;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
            `;
            document.body.appendChild(notification);
        }

        // Set notification style based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#17a2b8'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;

        // Show notification
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';

        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
        }, 3000);
    }

    // Show Cart Modal
    function showCartModal() {
        const cart = CartStorage.get();
        const itemsDiv = document.getElementById('cartModalItems');
        const totalDiv = document.getElementById('cartModalTotal');
        const modal = document.getElementById('cartModal');
        
        if (!itemsDiv || !totalDiv || !modal) {
            console.warn('[Cart] Modal elements not found');
            return;
        }

        let html = '';
        let total = 0;

        if (cart.length === 0) {
            html = '<div style="text-align: center; padding: 20px; color: #666;">Your cart is empty.</div>';
        } else {
            cart.forEach(item => {
                const itemTotal = item.price * (item.quantity || 1);
                total += itemTotal;
                
                html += `
                    <div class="cart-modal-item" style="display: flex; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                        <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; margin-right: 15px;">
                        <div style="flex-grow: 1;">
                            <div style="font-weight: 600; margin-bottom: 5px;">${item.name}</div>
                            <div style="color: #666; font-size: 14px;">Qty: ${item.quantity || 1}</div>
                            <div style="color: var(--secondary, #ff6b35); font-weight: 600;">Ksh ${itemTotal.toFixed(2)}</div>
                        </div>
                    </div>
                `;
            });
        }

        itemsDiv.innerHTML = html;
        totalDiv.innerHTML = cart.length ? `<strong>Total: Ksh ${total.toFixed(2)}</strong>` : '';
        modal.style.display = 'flex';
        
        console.log('[Cart] Modal opened:', cart);
    }

    // Render Cart for checkout page
    window.renderCart = function() {
        const cart = CartStorage.get();
        const tbody = document.getElementById('cartItems');
        const totalSpan = document.getElementById('cartTotal');
        
        if (!tbody || !totalSpan) {
            console.warn('[Cart] Cart table elements not found');
            return;
        }

        tbody.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px; color: #666;">Your cart is empty</td></tr>';
        } else {
            cart.forEach((item, idx) => {
                const quantity = item.quantity || 1;
                const itemTotal = item.price * quantity;
                total += itemTotal;

                tbody.innerHTML += `
                    <tr>
                        <td style="padding: 15px;">
                            <div style="display: flex; align-items: center;">
                                <img src="${item.image}" alt="${item.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; margin-right: 10px;">
                                <span>${item.name}</span>
                            </div>
                        </td>
                        <td style="padding: 15px;">Ksh ${item.price.toFixed(2)}</td>
                        <td style="padding: 15px;">
                            <input type="number" min="1" max="99" value="${quantity}" 
                                   style="width: 60px; padding: 5px; border: 1px solid #ddd; border-radius: 4px;" 
                                   data-idx="${idx}" class="cart-qty">
                        </td>
                        <td style="padding: 15px; font-weight: 600;">Ksh ${itemTotal.toFixed(2)}</td>
                        <td style="padding: 15px;">
                            <button class="remove-btn" data-idx="${idx}" 
                                    style="background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                                Remove
                            </button>
                        </td>
                    </tr>
                `;
            });
        }

        totalSpan.textContent = total.toFixed(2);
        console.log('[Cart] Rendered:', cart);

        // Add event listeners for quantity changes
        document.querySelectorAll('.cart-qty').forEach(input => {
            input.addEventListener('change', function() {
                const idx = parseInt(this.getAttribute('data-idx'));
                const newQuantity = Math.max(1, Math.min(99, parseInt(this.value) || 1));
                
                let cart = CartStorage.get();
                if (cart[idx]) {
                    cart[idx].quantity = newQuantity;
                    if (CartStorage.set(cart)) {
                        renderCart();
                        updateCartCount();
                    }
                }
            });
        });

        // Add event listeners for remove buttons
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-idx'));
                let cart = CartStorage.get();
                
                if (cart[idx]) {
                    const removedItem = cart[idx];
                    cart.splice(idx, 1);
                    if (CartStorage.set(cart)) {
                        renderCart();
                        updateCartCount();
                        showNotification(`${removedItem.name} removed from cart`, 'info');
                    }
                }
            });
        });
    };

    // Clear cart function
    window.clearCart = function() {
        CartStorage.clear();
        updateCartCount();
        updateCartDisplay();
        showNotification('Cart cleared', 'info');
    };

    // Initialize when DOM is ready
    function initializeCart() {
        // Event delegation for add to cart buttons
        document.body.addEventListener('click', function(e) {
            if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
                addToCart(e);
            }
        });

        // Cart modal functionality
        const cartIcon = document.querySelector('.cart-link');
        const cartModal = document.getElementById('cartModal');
        const closeModal = document.getElementById('closeCartModal');

        if (cartIcon) {
            cartIcon.addEventListener('click', function(e) {
                e.preventDefault();
                showCartModal();
            });
        }

        if (closeModal && cartModal) {
            closeModal.addEventListener('click', function() {
                cartModal.style.display = 'none';
            });

            // Close modal when clicking outside
            window.addEventListener('click', function(e) {
                if (e.target === cartModal) {
                    cartModal.style.display = 'none';
                }
            });
        }

        // Payment form handlers
        const paymentForm = document.getElementById('paymentForm');
        const mpesaForm = document.getElementById('mpesaForm');
        const checkoutForm = document.getElementById('checkoutForm');

        if (paymentForm) {
            paymentForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handlePayment('card');
            });
        }

        if (mpesaForm) {
            mpesaForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handlePayment('mpesa');
            });
        }

        if (checkoutForm) {
            checkoutForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleOrderSubmission();
            });
        }

        // Initial cart count update
        updateCartCount();
        
        // Render cart if on checkout page
        if (document.getElementById('cartItems')) {
            renderCart();
        }
    }

    // Handle payment processing
    function handlePayment(method) {
        const cart = CartStorage.get();
        if (cart.length === 0) {
            showNotification('Your cart is empty', 'error');
            return;
        }

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (method === 'card') {
            const cardNumber = document.getElementById('cardNumber').value;
            const expiryDate = document.getElementById('expiryDate').value;
            const cvv = document.getElementById('cvv').value;
            const cardName = document.getElementById('cardName').value;

            if (!cardNumber || !expiryDate || !cvv || !cardName) {
                showNotification('Please fill in all card details', 'error');
                return;
            }

            // Simulate payment processing
            showNotification('Processing card payment...', 'info');
            setTimeout(() => {
                processOrder(total, 'Card Payment');
            }, 2000);

        } else if (method === 'mpesa') {
            const phoneNumber = document.getElementById('phoneNumber').value;
            
            if (!phoneNumber) {
                showNotification('Please enter your M-Pesa phone number', 'error');
                return;
            }

            // Simulate M-Pesa payment processing
            showNotification('Sending M-Pesa request...', 'info');
            setTimeout(() => {
                processOrder(total, 'M-Pesa Payment');
            }, 2000);
        }
    }

    // Handle order submission
    function handleOrderSubmission() {
        const cart = CartStorage.get();
        if (cart.length === 0) {
            showNotification('Your cart is empty', 'error');
            return;
        }

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        processOrder(total, 'Order Placed');
    }

    // Process order completion
    function processOrder(total, paymentMethod) {
        const cart = CartStorage.get();
        
        // Create order summary
        const orderSummary = {
            id: 'SEC' + Date.now(),
            items: cart,
            total: total,
            paymentMethod: paymentMethod,
            date: new Date().toLocaleDateString(),
            status: 'Confirmed'
        };

        console.log('[Cart] Order processed:', orderSummary);
        
        // Clear cart
        CartStorage.clear();
        updateCartCount();
        
        // Show success message
        showNotification(`Order ${orderSummary.id} placed successfully! Total: Ksh ${total.toFixed(2)}`, 'success');
        
        // Reset forms
        const forms = document.querySelectorAll('#paymentForm, #mpesaForm, #checkoutForm');
        forms.forEach(form => form.reset());
        
        // Update cart display
        if (document.getElementById('cartItems')) {
            renderCart();
        }
        
        // You could redirect to a success page here
        // window.location.href = 'order-success.html';
    }

    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCart);
    } else {
        initializeCart();
    }

    // Listen for storage changes from other tabs (only if localStorage is available)
    if (useLocalStorage) {
        window.addEventListener('storage', function(e) {
            if (e.key === 'secolCart') {
                updateCartCount();
                updateCartDisplay();
            }
        });
    }

})();
/**
 * cart-badge.js
 * Shared utility — fetches the real cart item count from the API
 * and updates the navbar cart badge on any page.
 */
function updateCartBadge(userId) {
    if (!userId) return;
    fetch(`/api/cart?userId=${userId}`)
        .then(res => res.ok ? res.json() : null)
        .then(cart => {
            if (!cart) return;
            const count = (cart.cartItems || []).reduce((sum, item) => sum + item.quantity, 0);
            const badge = document.getElementById('cartBadge');
            if (badge) badge.textContent = count > 0 ? count : '0';
        })
        .catch(() => { /* silently fail — badge shows last known value */ });
}

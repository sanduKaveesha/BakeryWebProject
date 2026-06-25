// Helper to support local file preview and cross-origin development fallback
const API_BASE = (window.location.protocol === 'file:' || !window.location.port || window.location.port !== '8085')
    ? 'http://localhost:8085'
    : '';

let promosList = [];

document.addEventListener('DOMContentLoaded', () => {
    loadPromos();

    // Search filter
    document.getElementById('promo-search').addEventListener('input', filterAndRenderPromos);
});

function loadPromos() {
    fetch(`${API_BASE}/api/promotions/all`)
        .then(response => response.json())
        .then(data => {
            promosList = data;
            updateSummaryCards(data);
            filterAndRenderPromos();
        })
        .catch(error => {
            console.error('Error loading promotion codes:', error);
        });
}

function updateSummaryCards(promos) {
    const total = promos.length;
    const active = promos.filter(p => p.active !== false).length; // Handle active flag (usually true/false/missing default true)

    let avg = 0;
    if (total > 0) {
        const sum = promos.reduce((acc, p) => acc + (p.discountPercentage || 0), 0);
        avg = Math.round(sum / total);
    }

    document.getElementById('summary-total-promos').textContent = total;
    document.getElementById('summary-active-promos').textContent = active;
    document.getElementById('summary-avg-discount').textContent = `${avg}%`;
}

function filterAndRenderPromos() {
    const searchQuery = document.getElementById('promo-search').value.toLowerCase().trim();

    const filtered = promosList.filter(p => {
        return (p.promoCode && p.promoCode.toLowerCase().includes(searchQuery)) ||
            p.id.toString().includes(searchQuery);
    });

    renderPromosTable(filtered);
}

function renderPromosTable(promos) {
    const tbody = document.getElementById('promos-table-body');
    document.getElementById('total-results').textContent = `${promos.length} promo(s)`;
    tbody.innerHTML = '';

    if (promos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No promocodes found.</td></tr>`;
        return;
    }

    promos.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-semibold">#${p.id}</td>
            <td class="fw-bold text-primary">${p.promoCode}</td>
            <td class="fw-semibold">${p.discountPercentage}% OFF</td>
            <td>
                <span class="badge ${p.active !== false ? 'badge-delivered' : 'badge-cancelled'}">
                    ${p.active !== false ? 'Active' : 'Expired'}
                </span>
            </td>
            <td class="text-end">
                <button class="btn btn-outline-danger btn-sm" onclick="deletePromo(${p.id})"><i class="bi bi-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function generatePromoCode() {
    const pct = parseFloat(document.getElementById('discount-pct').value);
    if (isNaN(pct) || pct <= 0 || pct > 100) {
        alert('Please specify a valid discount percentage between 1 and 100.');
        return;
    }

    fetch(`${API_BASE}/api/promotions/generate?discountPercentage=${pct}`, {
        method: 'POST'
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to generate coupon');
            return response.json();
        })
        .then(data => {
            document.getElementById('promo-generator-form').reset();
            loadPromos();
        })
        .catch(error => {
            console.error('Error generating promo code:', error);
            alert('Failed to generate promocode. Please check your network and server state.');
        });
}

function deletePromo(id) {
    if (!confirm('Are you sure you want to delete and revoke this promotion code?')) return;

    fetch(`${API_BASE}/api/promotions/delete/${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to delete coupon');
            loadPromos();
        })
        .catch(error => {
            console.error('Error deleting promocode:', error);
            alert('Failed to delete promocode.');
        });
}

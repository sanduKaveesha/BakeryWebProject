// Helper to support local file preview and cross-origin development fallback
const API_BASE = (window.location.protocol === 'file:' || !window.location.port || window.location.port !== '8085')
    ? 'http://localhost:8085'
    : '';

let cakesList = [];
let selectedCake = null;

document.addEventListener('DOMContentLoaded', () => {
    loadCakes();

    // Event listeners
    document.getElementById('cake-search').addEventListener('input', filterAndRenderCakes);
    document.getElementById('status-filter').addEventListener('change', filterAndRenderCakes);
});

function loadCakes() {
    fetch(`${API_BASE}/api/cakes/all`)
        .then(response => response.json())
        .then(data => {
            cakesList = data;
            updateSummaryCards(data);
            filterAndRenderCakes();

            // Re-select if already selected
            if (selectedCake) {
                const refreshed = data.find(c => c.id === selectedCake.id);
                if (refreshed) {
                    showCakeDetails(refreshed);
                } else {
                    hideCakeDetails();
                }
            } else {
                hideCakeDetails();
            }
        })
        .catch(error => {
            console.error('Error loading custom cakes:', error);
        });
}

function updateSummaryCards(cakes) {
    const total = cakes.length;
    const pending = cakes.filter(c => c.status === 'Pending' || c.status === 'pending').length;
    const prod = cakes.filter(c => ['Baking', 'Decorating', 'baking', 'decorating'].includes(c.status)).length;

    document.getElementById('summary-total-cakes').textContent = total;
    document.getElementById('summary-pending-cakes').textContent = pending;
    document.getElementById('summary-prod-cakes').textContent = prod;
}

function filterAndRenderCakes() {
    const searchQuery = document.getElementById('cake-search').value.toLowerCase().trim();
    const statusFilter = document.getElementById('status-filter').value.toLowerCase();

    const filtered = cakesList.filter(c => {
        const customerName = (c.customerName || (c.user && c.user.username) || '').toLowerCase();
        const matchesSearch = customerName.includes(searchQuery) ||
            (c.cakeFlavor && c.cakeFlavor.toLowerCase().includes(searchQuery)) ||
            (c.decorationType && c.decorationType.toLowerCase().includes(searchQuery)) ||
            (c.id && c.id.toString().includes(searchQuery));

        const matchesStatus = statusFilter === 'all' || (c.status && c.status.toLowerCase() === statusFilter);

        return matchesSearch && matchesStatus;
    });

    renderCakesTable(filtered);
}

function renderCakesTable(cakes) {
    const tbody = document.getElementById('cakes-table-body');
    document.getElementById('total-results').textContent = `${cakes.length} request(s)`;
    tbody.innerHTML = '';

    if (cakes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No custom cake requests found.</td></tr>`;
        return;
    }

    cakes.forEach(c => {
        const customerName = c.customerName || (c.user ? `${c.user.firstName || ''} ${c.user.lastName || ''}`.trim() : 'Guest');
        const statusClass = getStatusBadgeClass(c.status);
        const tr = document.createElement('tr');
        tr.className = 'align-middle';
        tr.style.cursor = 'pointer';
        tr.innerHTML = `
            <td class="fw-semibold">#${c.id}</td>
            <td class="fw-medium">${customerName}</td>
            <td>${c.cakeFlavor || 'Vanilla'}</td>
            <td class="fw-semibold">LKR ${(c.price || 0).toFixed(2)}</td>
            <td><span class="badge ${statusClass}">${c.status || 'Pending'}</span></td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); viewCake(${c.id})"><i class="bi bi-eye"></i></button>
            </td>
        `;
        tr.addEventListener('click', () => showCakeDetails(c));
        tbody.appendChild(tr);
    });
}

function getStatusBadgeClass(status) {
    if (!status) return 'badge-pending';
    switch (status.toLowerCase()) {
        case 'pending': return 'badge-pending';
        case 'confirmed': return 'badge-preparing';
        case 'baking': return 'badge-preparing';
        case 'decorating': return 'badge-preparing';
        case 'ready': return 'badge-ready';
        case 'delivered': return 'badge-delivered';
        default: return 'badge-pending';
    }
}

function viewCake(id) {
    const c = cakesList.find(item => item.id === id);
    if (c) showCakeDetails(c);
}

function showCakeDetails(c) {
    selectedCake = c;
    document.getElementById('no-cake-selected').style.display = 'none';
    document.getElementById('cake-details-card').style.display = 'block';

    const customerName = c.customerName || (c.user ? `${c.user.firstName || ''} ${c.user.lastName || ''}`.trim() : 'Guest');
    document.getElementById('detail-customer').textContent = customerName;
    document.getElementById('detail-email').textContent = c.user ? c.user.email : 'N/A';
    document.getElementById('detail-size').textContent = c.cakeSize || 'Not specified';
    document.getElementById('detail-flavor').textContent = c.cakeFlavor || 'Vanilla';
    document.getElementById('detail-decoration').textContent = c.decorationType || 'Standard';
    document.getElementById('detail-message').textContent = c.messageOnCake ? `"${c.messageOnCake}"` : 'None';
    document.getElementById('detail-size-price').textContent = `LKR ${(c.price || 0).toFixed(2)}`;
    document.getElementById('detail-total-price').textContent = `LKR ${(c.price || 0).toFixed(2)}`;

    // Status Badge
    const statusBadge = document.getElementById('detail-status');
    statusBadge.textContent = c.status || 'Pending';
    statusBadge.className = 'badge ' + getStatusBadgeClass(c.status);

    // Status Select
    const statusSelect = document.getElementById('detail-status-select');
    statusSelect.value = c.status || 'Pending';
}

function hideCakeDetails() {
    selectedCake = null;
    document.getElementById('no-cake-selected').style.display = 'block';
    document.getElementById('cake-details-card').style.display = 'none';
}

function updateCakeStatusFromDetails() {
    if (!selectedCake) return;

    const newStatus = document.getElementById('detail-status-select').value;

    fetch(`${API_BASE}/api/cakes/status/${selectedCake.id}?status=${newStatus}`, {
        method: 'PUT'
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to update status');
            return response.json();
        })
        .then(data => {
            loadCakes();
        })
        .catch(error => {
            console.error('Error updating cake status:', error);
            alert('Failed to update status.');
        });
}

function deleteCurrentCake() {
    if (!selectedCake) return;
    if (!confirm('Are you sure you want to delete this custom cake request?')) return;

    fetch(`${API_BASE}/api/cakes/${selectedCake.id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to delete request');
            selectedCake = null;
            loadCakes();
        })
        .catch(error => {
            console.error('Error deleting request:', error);
            alert('Failed to delete custom request.');
        });
}

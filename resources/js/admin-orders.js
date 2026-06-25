// Helper to support local file preview and cross-origin development fallback
const API_BASE = (window.location.protocol === 'file:' || !window.location.port || window.location.port !== '8085')
    ? 'http://localhost:8085'
    : '';

let currentPage = 1;
const pageSize = 10;
let currentOrderId = null;

document.addEventListener('DOMContentLoaded', () => {
    fetchOrderSummary();
    fetchOrders();

    document.getElementById('status-filter').addEventListener('change', () => {
        currentPage = 1;
        fetchOrders();
    });

    document.getElementById('order-search').addEventListener('input', debounce(() => {
        currentPage = 1;
        fetchOrders();
    }, 500));
});

function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

function fetchOrderSummary() {
    fetch(`${API_BASE}/api/admin/orders/summary`)
        .then(res => res.json())
        .then(data => {
            document.getElementById('summary-total').textContent = data.totalOrders || 0;
            document.getElementById('summary-pending').textContent = data.pending || 0;
            document.getElementById('summary-preparing').textContent = data.preparing || 0;
            document.getElementById('summary-delivered').textContent = data.delivered || 0;
        })
        .catch(err => console.error("Error fetching summary:", err));
}

function fetchOrders() {
    const status = document.getElementById('status-filter').value;
    const search = document.getElementById('order-search').value;

    let url = `${API_BASE}/api/admin/orders?page=${currentPage}&size=${pageSize}`;
    if (status !== 'All') url += `&status=${status}`;
    if (search) url += `&search=${search}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            renderTable(data.content || []);
            renderPagination(data.totalPages || 1);
            document.getElementById('total-results').textContent = `${data.totalElements || 0} orders`;
        })
        .catch(error => {
            console.error('Error fetching orders:', error);
            document.getElementById('orders-table-body').innerHTML = '<tr><td colspan="6" class="text-center text-danger">Failed to load orders.</td></tr>';
        });
}

function renderTable(orders) {
    const tbody = document.getElementById('orders-table-body');
    tbody.innerHTML = '';

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No orders found.</td></tr>';
        return;
    }

    orders.forEach((order, index) => {
        const tr = document.createElement('tr');

        // Construct a realistic, sequenced mock date spaced out by hours
        const mockDate = new Date();
        mockDate.setHours(mockDate.getHours() - (index * 3) - 1);
        const dateStr = mockDate.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        const total = order.totalPrice || 0;

        tr.innerHTML = `
            <td class="fw-medium text-primary" style="cursor: pointer;" onclick="viewOrderDetails(${order.orderId})">ORD-${order.orderId}</td>
            <td style="cursor: pointer;" onclick="viewOrderDetails(${order.orderId})">${dateStr}</td>
            <td style="cursor: pointer;" onclick="viewOrderDetails(${order.orderId})">${order.user ? order.user.email : 'Guest'}</td>
            <td class="fw-bold" style="cursor: pointer;" onclick="viewOrderDetails(${order.orderId})">LKR ${total.toFixed(2)}</td>
            <td>
                <select class="form-select form-select-sm" style="width: 120px;" onchange="updateStatusFromTable(${order.orderId}, this)">
                    <option value="Pending" ${order.orderStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Preparing" ${order.orderStatus === 'Preparing' ? 'selected' : ''}>Preparing</option>
                    <option value="Ready" ${order.orderStatus === 'Ready' ? 'selected' : ''}>Ready</option>
                    <option value="Delivered" ${order.orderStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="Cancelled" ${order.orderStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteOrderFromTable(${order.orderId})"><i class="bi bi-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderPagination(totalPages) {
    const ul = document.getElementById('pagination-controls');
    ul.innerHTML = '';
    for(let i=1; i<=totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.onclick = (e) => {
            e.preventDefault();
            currentPage = i;
            fetchOrders();
        };
        ul.appendChild(li);
    }
}

function viewOrderDetails(id) {
    currentOrderId = id;
    document.getElementById('no-order-selected').style.display = 'none';
    document.getElementById('order-details-card').style.display = 'block';

    fetch(`${API_BASE}/api/admin/orders/${id}`)
        .then(response => {
            if(!response.ok) throw new Error("API not ready");
            return response.json();
        })
        .then(populateDetails)
        .catch(err => console.error("Error fetching details", err));
}

function populateDetails(order) {
    // Generate a realistic, sequenced mock date based on ID
    const mockDate = new Date();
    mockDate.setHours(mockDate.getHours() - ((order.orderId % 10) * 3) - 1);
    const dateStr = mockDate.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    document.getElementById('detail-date').textContent = dateStr;
    document.getElementById('detail-customer').textContent = order.user ? order.user.email : 'Guest';
    document.getElementById('detail-phone').textContent = order.phoneNumber || 'N/A';
    document.getElementById('detail-address').textContent = order.deliveryAddress || 'N/A';

    document.getElementById('detail-status').textContent = order.orderStatus;
    let badgeClass = 'badge-pending';
    if (order.orderStatus === 'Preparing') badgeClass = 'badge-preparing';
    else if (order.orderStatus === 'Ready') badgeClass = 'badge-ready';
    else if (order.orderStatus === 'Delivered') badgeClass = 'badge-delivered';
    else if (order.orderStatus === 'Cancelled') badgeClass = 'badge-cancelled';
    document.getElementById('detail-status').className = `badge ${badgeClass}`;

    // Set select dropdown in details
    document.getElementById('detail-status-select').value = order.orderStatus;

    const itemsBody = document.getElementById('detail-items');
    itemsBody.innerHTML = '';

    let hasCustomCake = false;
    let customCakeData = null;
    let hasNormalProducts = false;

    if (order.orderItems && order.orderItems.length > 0) {
        order.orderItems.forEach(item => {
            if(item.product) {
                hasNormalProducts = true;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.product.name}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td>LKR ${item.unitPrice ? item.unitPrice.toFixed(2) : (item.subtotal / item.quantity).toFixed(2)}</td>
                    <td class="text-end">LKR ${item.subtotal ? item.subtotal.toFixed(2) : '0.00'}</td>
                `;
                itemsBody.appendChild(tr);
            } else if(item.customCake) {
                hasCustomCake = true;
                customCakeData = item.customCake;
            }
        });
    }

    // Hide or show products section
    const productsSection = document.getElementById('products-section');
    if (hasNormalProducts) {
        productsSection.style.display = 'block';
    } else {
        productsSection.style.display = 'none';
    }

    const total = order.totalPrice || 0;
    document.getElementById('detail-total').textContent = `LKR ${total.toFixed(2)}`;

    // Custom Cake Section
    const ccSection = document.getElementById('custom-cake-section');
    if (hasCustomCake && customCakeData) {
        ccSection.style.display = 'block';
        document.getElementById('cc-flavor').textContent = customCakeData.cakeFlavor || 'N/A';
        document.getElementById('cc-decoration').textContent = customCakeData.decorationType || 'N/A';
        document.getElementById('cc-message').textContent = customCakeData.messageOnCake || 'None';

        if (customCakeData.toppings && customCakeData.toppings.length > 0) {
            let toppingNames = customCakeData.toppings.map(t => t.cakeTopping ? t.cakeTopping.toppingName : 'Unknown').join(', ');
            document.getElementById('cc-toppings').textContent = toppingNames;
        } else {
            document.getElementById('cc-toppings').textContent = 'None';
        }

        document.getElementById('cc-total-price').textContent = `LKR ${customCakeData.totalPrice ? customCakeData.totalPrice.toFixed(2) : '0.00'}`;
    } else {
        ccSection.style.display = 'none';
    }
}

function updateStatusFromTable(id, selectElement) {
    updateStatusApi(id, selectElement.value);
}

function updateStatusFromDetails() {
    if(!currentOrderId) return;
    const newStatus = document.getElementById('detail-status-select').value;
    updateStatusApi(currentOrderId, newStatus);
}

function updateStatusApi(id, newStatus) {
    fetch(`${API_BASE}/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    })
        .then(response => {
            if(response.ok) {
                fetchOrders();
                fetchOrderSummary();
                if(currentOrderId === id) {
                    viewOrderDetails(id);
                }
            }
        })
        .catch(err => console.error("Update failed", err));
}

function deleteOrderFromTable(id) {
    if(confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
        deleteOrderApi(id);
    }
}

function deleteCurrentOrder() {
    if(!currentOrderId) return;
    if(confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
        deleteOrderApi(currentOrderId).then(() => {
            currentOrderId = null;
            document.getElementById('no-order-selected').style.display = 'block';
            document.getElementById('order-details-card').style.display = 'none';
        });
    }
}

function deleteOrderApi(id) {
    return fetch(`${API_BASE}/api/admin/orders/${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if(response.ok) {
                fetchOrders();
                fetchOrderSummary();
            } else {
                alert("Failed to delete order");
            }
        })
        .catch(err => console.error("Delete failed", err));
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch(e) {
        return 'N/A';
    }
}

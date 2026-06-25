// Helper to support local file preview and cross-origin development fallback
const API_BASE = (window.location.protocol === 'file:' || !window.location.port || window.location.port !== '8085')
    ? 'http://localhost:8085'
    : '';

let productsList = [];
let productModal;

document.addEventListener('DOMContentLoaded', () => {
    productModal = new bootstrap.Modal(document.getElementById('product-modal'));
    loadProducts();

    // Event listeners for filters and search
    document.getElementById('product-search').addEventListener('input', filterAndRenderProducts);
    document.getElementById('category-filter').addEventListener('change', filterAndRenderProducts);
});

function loadProducts() {
    fetch(`${API_BASE}/api/products`)
        .then(response => response.json())
        .then(data => {
            productsList = data;
            updateSummaryCards(data);
            filterAndRenderProducts();
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        });
}

function updateSummaryCards(products) {
    const total = products.length;
    const available = products.filter(p => p.available).length;
    const out = total - available;

    document.getElementById('summary-total-products').textContent = total;
    document.getElementById('summary-available-products').textContent = available;
    document.getElementById('summary-out-products').textContent = out;
}

function filterAndRenderProducts() {
    const searchQuery = document.getElementById('product-search').value.toLowerCase().trim();
    const categoryFilter = document.getElementById('category-filter').value;

    const filtered = productsList.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery) ||
            (p.description && p.description.toLowerCase().includes(searchQuery)) ||
            p.id.toString().includes(searchQuery);

        const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    renderProductsTable(filtered);
}

function renderProductsTable(products) {
    const tbody = document.getElementById('products-table-body');
    document.getElementById('total-results').textContent = `${products.length} product(s)`;
    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No products found.</td></tr>`;
        return;
    }

    products.forEach(p => {
        const imgUrl = p.imageUrl || '/images/products/cake.jpg';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${imgUrl}" class="rounded" style="width: 40px; height: 40px; object-fit: cover;" onerror="this.src='/images/Cappuccino.jpg'"></td>
            <td class="fw-semibold">#${p.id}</td>
            <td class="fw-medium">${p.name}</td>
            <td><span class="badge bg-light text-dark border">${p.category}</span></td>
            <td class="fw-semibold">LKR ${p.price.toFixed(2)}</td>
            <td>
                <span class="badge ${p.available ? 'badge-delivered' : 'badge-cancelled'}">
                    ${p.available ? 'Available' : 'Out of Stock'}
                </span>
            </td>
            <td class="text-end">
                <button class="btn btn-outline btn-sm me-1" onclick="openEditModal(${p.id})"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-outline-danger btn-sm" onclick="deleteProduct(${p.id})"><i class="bi bi-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openAddModal() {
    document.getElementById('modal-title').textContent = 'Add New Product';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-stock').value = 10;
    document.getElementById('product-available').checked = true;
    productModal.show();
}

function openEditModal(id) {
    const p = productsList.find(item => item.id === id);
    if (!p) return;

    document.getElementById('modal-title').textContent = `Edit Product #${id}`;
    document.getElementById('product-id').value = p.id;
    document.getElementById('product-name').value = p.name;
    document.getElementById('product-category').value = p.category;
    document.getElementById('product-price').value = p.price;
    document.getElementById('product-stock').value = p.stockQuantity || 0;
    document.getElementById('product-description').value = p.description || '';
    document.getElementById('product-image').value = p.imageUrl || '';
    document.getElementById('product-available').checked = p.available;

    productModal.show();
}

function saveProduct() {
    const id = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('product-category').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const stockQuantity = parseInt(document.getElementById('product-stock').value) || 0;
    const description = document.getElementById('product-description').value.trim();
    const imageUrl = document.getElementById('product-image').value.trim();
    const available = document.getElementById('product-available').checked;

    if (!name || isNaN(price) || isNaN(stockQuantity)) {
        alert('Please fill out all required fields.');
        return;
    }

    const payload = {
        name,
        category,
        price,
        stockQuantity,
        description,
        imageUrl,
        available
    };

    const url = id ? `${API_BASE}/api/products/${id}` : `${API_BASE}/api/products`;
    const method = id ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to save product');
            return response.json();
        })
        .then(() => {
            productModal.hide();
            loadProducts();
        })
        .catch(error => {
            console.error('Error saving product:', error);
            alert('Failed to save product. Please try again.');
        });
}

function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    fetch(`${API_BASE}/api/products/${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to delete product');
            loadProducts();
        })
        .catch(error => {
            console.error('Error deleting product:', error);
            alert('Failed to delete product.');
        });
}

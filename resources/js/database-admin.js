const API_BASE = '/api/crud';
let activeTable = 'dashboard';
let currentData = [];
let editingId = null;
let deleteId = null;

// Modal instances
let crudModal;
let deleteModal;

// Schema definition for dynamic rendering
const schema = {
    users: {
        idField: 'userId',
        endpoint: 'users',
        fields: [
            { name: 'userId', label: 'User ID', type: 'number', readonly: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'password', label: 'Password', type: 'text', required: true },
            { name: 'role', label: 'Role', type: 'text', required: true }
        ]
    },
    products: {
        idField: 'id',
        endpoint: 'products',
        fields: [
            { name: 'id', label: 'ID', type: 'number', readonly: true },
            { name: 'name', label: 'Product Name', type: 'text', required: true },
            { name: 'category', label: 'Category', type: 'text' },
            { name: 'price', label: 'Price', type: 'number' },
            { name: 'description', label: 'Description', type: 'text' },
            { name: 'status', label: 'Status', type: 'text' },
            { name: 'available', label: 'Available', type: 'checkbox' },
            { name: 'imageUrl', label: 'Image URL', type: 'text' }
        ]
    },
    orders: {
        idField: 'orderId',
        endpoint: 'orders',
        fields: [
            { name: 'orderId', label: 'Order ID', type: 'number', readonly: true },
            { name: 'user', label: 'User ID (Rel)', type: 'object', ref: 'users', refLabel: 'email', required: true },
            { name: 'totalPrice', label: 'Total Price', type: 'number' },
            { name: 'orderStatus', label: 'Order Status', type: 'text' },
            { name: 'deliveryAddress', label: 'Delivery Address', type: 'text' },
            { name: 'phoneNumber', label: 'Phone Number', type: 'text' },
            { name: 'orderDate', label: 'Order Date', type: 'text', readonly: true }
        ]
    },
    orderitems: {
        idField: 'itemId',
        endpoint: 'orderitems',
        fields: [
            { name: 'itemId', label: 'Item ID', type: 'number', readonly: true },
            { name: 'order', label: 'Order ID (Rel)', type: 'object', ref: 'orders', refLabel: 'orderId', required: true },
            { name: 'product', label: 'Product (Rel)', type: 'object', ref: 'products', refLabel: 'name' },
            { name: 'customCake', label: 'Custom Cake (Rel)', type: 'object', ref: 'customcakerequests', refLabel: 'customCakeId' },
            { name: 'quantity', label: 'Quantity', type: 'number' },
            { name: 'unitPrice', label: 'Unit Price', type: 'number' },
            { name: 'subtotal', label: 'Subtotal', type: 'number' }
        ]
    },
    customcakerequests: {
        idField: 'customCakeId',
        endpoint: 'customcakerequests',
        fields: [
            { name: 'customCakeId', label: 'Cake ID', type: 'number', readonly: true },
            { name: 'user', label: 'User (Rel)', type: 'object', ref: 'users', refLabel: 'email' },
            { name: 'cakeFlavor', label: 'Cake Flavor', type: 'text' },
            { name: 'decorationType', label: 'Decoration Type', type: 'text' },
            { name: 'messageOnCake', label: 'Message', type: 'text' },
            { name: 'basePrice', label: 'Base Price', type: 'number' },
            { name: 'toppingsTotal', label: 'Toppings Total', type: 'number' },
            { name: 'totalPrice', label: 'Total Price', type: 'number' },
            { name: 'status', label: 'Status', type: 'text' }
        ]
    },
    caketoppings: {
        idField: 'toppingId',
        endpoint: 'caketoppings',
        fields: [
            { name: 'toppingId', label: 'Topping ID', type: 'number', readonly: true },
            { name: 'toppingName', label: 'Name', type: 'text', required: true },
            { name: 'toppingPrice', label: 'Price', type: 'number' },
            { name: 'status', label: 'Status', type: 'text' }
        ]
    },
    customcakerequesttoppings: {
        idField: 'id',
        endpoint: 'customcakerequesttoppings',
        fields: [
            { name: 'id', label: 'ID', type: 'number', readonly: true },
            { name: 'customCakeRequest', label: 'Cake Request (Rel)', type: 'object', ref: 'customcakerequests', refLabel: 'customCakeId' },
            { name: 'cakeTopping', label: 'Topping (Rel)', type: 'object', ref: 'caketoppings', refLabel: 'toppingName' },
            { name: 'toppingPrice', label: 'Topping Price', type: 'number' }
        ]
    }
};

// Cache for foreign keys
const referenceData = {};

document.addEventListener('DOMContentLoaded', () => {
    crudModal = new bootstrap.Modal(document.getElementById('crudModal'));
    deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            activeTable = item.getAttribute('data-table');
            document.getElementById('page-title').textContent = item.textContent.trim();

            if(activeTable === 'dashboard') {
                showDashboard();
            } else {
                showTable(activeTable);
            }
        });
    });

    // Search logic
    document.getElementById('search-input').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = currentData.filter(row => {
            return Object.values(row).some(val =>
                val !== null && val.toString().toLowerCase().includes(term)
            );
        });
        renderTableRows(filtered);
    });

    // Initial load
    showDashboard();
});

function showDashboard() {
    document.getElementById('dashboard-view').style.display = 'block';
    document.getElementById('table-view').style.display = 'none';
    document.getElementById('table-actions').style.display = 'none';

    // Fetch stats for tables
    ['users', 'products', 'orders', 'customcakerequests', 'caketoppings'].forEach(table => {
        fetch(`${API_BASE}/${schema[table].endpoint}`)
            .then(res => res.json())
            .then(data => {
                document.getElementById(`stat-${table}`).textContent = data.length;
            }).catch(() => {});
    });
}

async function showTable(tableKey) {
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('table-view').style.display = 'block';
    document.getElementById('table-actions').style.display = 'flex';
    document.getElementById('search-input').value = '';

    const tableSchema = schema[tableKey];

    // Load reference data for dropdowns
    for (let field of tableSchema.fields) {
        if (field.type === 'object' && field.ref) {
            if (!referenceData[field.ref]) {
                const res = await fetch(`${API_BASE}/${schema[field.ref].endpoint}`);
                referenceData[field.ref] = await res.json();
            }
        }
    }

    // Render Headers
    const thead = document.getElementById('dynamic-thead');
    thead.innerHTML = '<tr>' + tableSchema.fields.map(f => `<th>${f.label}</th>`).join('') + '<th class="text-end">Actions</th></tr>';

    // Fetch Data
    fetch(`${API_BASE}/${tableSchema.endpoint}`)
        .then(res => res.json())
        .then(data => {
            currentData = data;
            renderTableRows(data);
        })
        .catch(err => console.error(err));
}

function renderTableRows(data) {
    const tbody = document.getElementById('dynamic-tbody');
    const noData = document.getElementById('no-data-msg');
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        noData.style.display = 'block';
        return;
    }
    noData.style.display = 'none';

    const tableSchema = schema[activeTable];

    data.forEach(row => {
        const tr = document.createElement('tr');
        let html = '';

        tableSchema.fields.forEach(field => {
            let val = row[field.name];
            if(val === null || val === undefined) {
                html += `<td><span class="text-muted fst-italic">NULL</span></td>`;
            } else if (field.type === 'object') {
                html += `<td><span class="badge bg-secondary">${val[field.refLabel] || val[schema[field.ref].idField]}</span></td>`;
            } else if (field.type === 'checkbox') {
                html += `<td>${val ? '<i class="bi bi-check-circle-fill text-success"></i>' : '<i class="bi bi-x-circle-fill text-danger"></i>'}</td>`;
            } else {
                html += `<td>${val}</td>`;
            }
        });

        // Actions
        const idVal = row[tableSchema.idField];
        html += `
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary btn-action" onclick="openEditModal(${idVal})"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger btn-action ms-1" onclick="promptDelete(${idVal})"><i class="bi bi-trash"></i></button>
            </td>
        `;
        tr.innerHTML = html;
        tbody.appendChild(tr);
    });
}

function openAddModal() {
    editingId = null;
    document.getElementById('crudModalLabel').textContent = `Add New ${document.getElementById('page-title').textContent}`;
    buildForm({});
    crudModal.show();
}

function openEditModal(id) {
    editingId = id;
    const tableSchema = schema[activeTable];
    const record = currentData.find(r => r[tableSchema.idField] === id);
    document.getElementById('crudModalLabel').textContent = `Edit Record #${id}`;
    buildForm(record);
    crudModal.show();
}

function buildForm(record) {
    const form = document.getElementById('crudForm');
    form.innerHTML = '';
    const tableSchema = schema[activeTable];

    tableSchema.fields.forEach(field => {
        // Skip ID field on Add
        if(field.readonly && !editingId) return;

        const div = document.createElement('div');
        div.className = 'mb-3';

        let label = `<label class="form-label fw-medium">${field.label}</label>`;
        let inputHtml = '';

        const val = record[field.name] !== undefined && record[field.name] !== null ? record[field.name] : '';

        if (field.readonly) {
            inputHtml = `<input type="text" class="form-control bg-light" name="${field.name}" value="${val}" readonly>`;
        } else if (field.type === 'object') {
            // Build select dropdown
            const options = referenceData[field.ref] || [];
            let optHtml = `<option value="">-- Select --</option>`;
            options.forEach(opt => {
                const optId = opt[schema[field.ref].idField];
                const optLabel = opt[field.refLabel];
                const selected = (val && val[schema[field.ref].idField] === optId) ? 'selected' : '';
                optHtml += `<option value="${optId}" ${selected}>[${optId}] ${optLabel}</option>`;
            });
            inputHtml = `<select class="form-select" name="${field.name}" ${field.required ? 'required' : ''}>${optHtml}</select>`;
        } else if (field.type === 'checkbox') {
            const checked = val === true ? 'checked' : '';
            inputHtml = `<div class="form-check form-switch"><input class="form-check-input" type="checkbox" name="${field.name}" ${checked}></div>`;
        } else {
            const inputType = field.type === 'number' ? 'number' : 'text';
            inputHtml = `<input type="${inputType}" class="form-control" name="${field.name}" value="${val}" ${field.required ? 'required' : ''}>`;
        }

        div.innerHTML = label + inputHtml;
        form.appendChild(div);
    });
}

function saveRecord() {
    const form = document.getElementById('crudForm');
    if(!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const tableSchema = schema[activeTable];
    const formData = new FormData(form);
    const payload = {};

    tableSchema.fields.forEach(field => {
        if(field.readonly && !editingId) return;

        if (field.type === 'checkbox') {
            payload[field.name] = form.querySelector(`[name="${field.name}"]`).checked;
        } else if (field.type === 'object') {
            const refId = formData.get(field.name);
            if(refId) {
                payload[field.name] = { [schema[field.ref].idField]: Number(refId) };
            } else {
                payload[field.name] = null;
            }
        } else {
            const val = formData.get(field.name);
            payload[field.name] = field.type === 'number' ? (val ? Number(val) : null) : val;
        }
    });

    const url = editingId ? `${API_BASE}/${tableSchema.endpoint}/${editingId}` : `${API_BASE}/${tableSchema.endpoint}`;
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(res => {
            if(res.ok) {
                crudModal.hide();
                showTable(activeTable); // Refresh table
            } else {
                alert('Failed to save record.');
            }
        });
}

function promptDelete(id) {
    deleteId = id;
    deleteModal.show();
}

function confirmDelete() {
    const tableSchema = schema[activeTable];
    fetch(`${API_BASE}/${tableSchema.endpoint}/${deleteId}`, {
        method: 'DELETE'
    }).then(res => {
        deleteModal.hide();
        if(res.ok) {
            showTable(activeTable);
        } else {
            alert('Failed to delete record.');
        }
    });
}

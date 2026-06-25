// Helper to support local file preview and cross-origin development fallback
const API_BASE = (window.location.protocol === 'file:' || !window.location.port || window.location.port !== '8085')
    ? 'http://localhost:8085'
    : '';

let usersList = [];

document.addEventListener('DOMContentLoaded', () => {
    loadUsers();

    // Event listeners
    document.getElementById('user-search').addEventListener('input', filterAndRenderUsers);
    document.getElementById('role-filter').addEventListener('change', filterAndRenderUsers);
});

function loadUsers() {
    fetch(`${API_BASE}/api/users/all`)
        .then(response => response.json())
        .then(data => {
            usersList = data;
            updateSummaryCards(data);
            filterAndRenderUsers();
        })
        .catch(error => {
            console.error('Error loading users:', error);
        });
}

function updateSummaryCards(users) {
    const total = users.length;
    const admins = users.filter(u => u.role === 'ADMIN').length;
    const customers = total - admins;

    document.getElementById('summary-total-users').textContent = total;
    document.getElementById('summary-admins').textContent = admins;
    document.getElementById('summary-customers').textContent = customers;
}

function filterAndRenderUsers() {
    const searchQuery = document.getElementById('user-search').value.toLowerCase().trim();
    const roleFilter = document.getElementById('role-filter').value;

    const filtered = usersList.filter(u => {
        const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
        const matchesSearch = fullName.includes(searchQuery) ||
            (u.username && u.username.toLowerCase().includes(searchQuery)) ||
            (u.email && u.email.toLowerCase().includes(searchQuery)) ||
            u.id.toString().includes(searchQuery);

        const matchesRole = roleFilter === 'All' || u.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    renderUsersTable(filtered);
}

function renderUsersTable(users) {
    const tbody = document.getElementById('users-table-body');
    document.getElementById('total-results').textContent = `${users.length} user(s)`;
    tbody.innerHTML = '';

    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No users found.</td></tr>`;
        return;
    }

    users.forEach(u => {
        const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'N/A';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-semibold">#${u.id}</td>
            <td class="fw-medium">${fullName}</td>
            <td>${u.username || 'N/A'}</td>
            <td>${u.email || 'N/A'}</td>
            <td>${u.telephone || 'N/A'}</td>
            <td>
                <span class="badge ${u.role === 'ADMIN' ? 'bg-primary' : 'bg-secondary'} rounded-pill">
                    <i class="bi ${u.role === 'ADMIN' ? 'bi-shield-check' : 'bi-person'} me-1"></i>${u.role}
                </span>
            </td>
            <td class="text-end">
                <button class="btn btn-outline-danger btn-sm" onclick="deleteUser(${u.id})"><i class="bi bi-person-x"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteUser(id) {
    if (!confirm('Are you sure you want to remove this user account?')) return;

    fetch(`${API_BASE}/api/users/admin/delete-user/${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to delete user');
            loadUsers();
        })
        .catch(error => {
            console.error('Error deleting user:', error);
            alert('Failed to delete user account.');
        });
}

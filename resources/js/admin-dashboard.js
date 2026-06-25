// Helper to support local file preview and cross-origin development fallback
const API_BASE = (window.location.protocol === 'file:' || !window.location.port || window.location.port !== '8085')
    ? 'http://localhost:8085'
    : '';

document.addEventListener('DOMContentLoaded', () => {
    // Fetch Summary Data
    fetch(`${API_BASE}/api/admin/dashboard/summary`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('total-orders').textContent = data.totalOrders;
            document.getElementById('total-products').textContent = data.totalProducts;
            document.getElementById('total-users').textContent = data.totalUsers;
            document.getElementById('total-revenue').textContent = 'LKR ' + parseFloat(data.totalRevenue).toFixed(2);
        })
        .catch(error => console.error('Error fetching summary:', error));

    // Fetch Recent Orders
    fetch(`${API_BASE}/api/admin/dashboard/recent-orders`)
        .then(response => response.json())
        .then(orders => {
            const tableBody = document.getElementById('recent-orders-table-body');
            tableBody.innerHTML = '';

            if (orders.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No recent orders found.</td></tr>';
                return;
            }

            orders.forEach((order, index) => {
                let badgeClass = 'badge-pending';
                if (order.orderStatus === 'Preparing') badgeClass = 'badge-preparing';
                else if (order.orderStatus === 'Ready') badgeClass = 'badge-ready';
                else if (order.orderStatus === 'Delivered') badgeClass = 'badge-delivered';
                else if (order.orderStatus === 'Cancelled') badgeClass = 'badge-cancelled';

                // Construct a realistic, sequenced mock date spaced out by hours
                const mockDate = new Date();
                mockDate.setHours(mockDate.getHours() - (index * 2) - 1);
                const dateStr = mockDate.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>ORD-${order.orderId}</td>
                    <td>${dateStr}</td>
                    <td><span class="badge ${badgeClass}">${order.orderStatus}</span></td>
                    <td>LKR ${(order.totalPrice || 0).toFixed(2)}</td>
                `;
                tableBody.appendChild(tr);
            });
        })
        .catch(error => console.error('Error fetching recent orders:', error));

    // Fetch Status Overview for Chart
    fetch(`${API_BASE}/api/admin/dashboard/status-overview`)
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('orderStatusChart').getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Pending', 'Preparing', 'Completed', 'Cancelled'],
                    datasets: [{
                        data: [
                            data.Pending || 0,
                            data.Preparing || 0,
                            data.Completed || 0,
                            data.Cancelled || 0
                        ],
                        backgroundColor: [
                            '#f59e0b', // Warning/Pending
                            '#3b82f6', // Info/Preparing
                            '#10b981', // Success/Completed
                            '#ef4444'  // Danger/Cancelled
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    },
                    cutout: '70%'
                }
            });
        })
        .catch(error => console.error('Error fetching chart data:', error));
});

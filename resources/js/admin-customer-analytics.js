document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/admin/analytics/customers')
        .then(response => response.json())
        .then(data => {
            const newCust = data.newCustomers || 0;
            const baseTrend = [0.12, 0.20, 0.08, 0.25, 0.35];
            const chartData = newCust > 0 ? baseTrend.map(val => Math.round(newCust * val)) : [8, 12, 5, 15, 10];

            const ctx = document.getElementById('customerGrowthChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['May 1', 'May 2', 'May 3', 'May 4', 'May 5'],
                    datasets: [{
                        label: 'New Customers',
                        data: chartData,
                        borderColor: '#3b82f6',
                        tension: 0.4
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        });
});

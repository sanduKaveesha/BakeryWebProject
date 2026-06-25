document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/admin/analytics/products')
        .then(response => response.json())
        .then(data => {
            const labels = data.length > 0 ? data.map(item => item[0]) : ['Chocolate Cake', 'Vanilla Cupcakes', 'Brownies', 'Butter Cake'];
            const values = data.length > 0 ? data.map(item => item[1]) : [320, 280, 210, 180];

            const ctx = document.getElementById('productPerformanceChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Quantity Sold',
                        data: values,
                        backgroundColor: '#8b5cf6',
                        borderRadius: 5
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        });
});

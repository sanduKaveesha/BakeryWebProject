document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/admin/analytics/custom-cakes')
        .then(response => response.json())
        .then(data => {
            const labels = data.length > 0 ? data.map(item => item[0]) : ['Chocolate', 'Vanilla', 'Red Velvet', 'Coffee', 'Strawberry'];
            const values = data.length > 0 ? data.map(item => item[1]) : [38, 24, 18, 12, 8];

            const ctx = document.getElementById('customCakeFlavorChart').getContext('2d');
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: ['#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981']
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        });
});

import { state, setState } from '../state.js';
import { getWeeklySolvedQuestionsData } from '../services/firestore.js';
import DOM from '../dom-elements.js';

let performanceChart = null;
let homePerformanceChart = null;
let weeklyChartInstance = null;

export function renderSessionPerformanceChart(correct, incorrect, container) {
    const canvas = container.querySelector('#performanceChart');
    if (!canvas) return; 

    if (performanceChart) {
        performanceChart.destroy();
    }
    const answeredCount = correct + incorrect;
    const accuracy = answeredCount > 0 ? (correct / answeredCount * 100) : 0;
    
    const chartCenterText = container.querySelector('#chart-center-text');
    if (chartCenterText) {
        chartCenterText.innerHTML = `
            <div class="text-center">
                <span class="text-3xl font-bold text-gray-800">${accuracy.toFixed(0)}%</span>
                <span class="block text-sm text-gray-500">de acerto</span>
            </div>
        `;
    }

    const ctx = canvas.getContext('2d');
    performanceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Acertos', 'Erros'],
            datasets: [{
                data: [correct, incorrect],
                backgroundColor: ['#22c55e', '#ef4444'],
                hoverBackgroundColor: ['#16a34a', '#dc2626'],
                borderColor: '#f9fafb', // bg-gray-50
                borderWidth: 4,
                cutout: '75%',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true
                }
            }
        }
    });
}

export function renderWeeklyChart() {
    const canvas = DOM.weeklyChartCanvas;
    if (!canvas) return; // Guard clause

    getWeeklySolvedQuestionsData().then(questionsSolvedData => {
        if (weeklyChartInstance) {
            weeklyChartInstance.destroy();
        }
        // ... Lógica de renderização do gráfico
    });
}

export function renderHomePerformanceChart(materiaTotals) {
    const canvas = DOM.homeChartCanvas;
    if (!canvas) return; // Guard clause

    if (homePerformanceChart) {
        homePerformanceChart.destroy();
    }
    const ctx = canvas.getContext('2d');
    // ... Lógica de renderização do gráfico
}


export function renderItemPerformanceChart(correct, incorrect) {
    const canvas = document.getElementById('itemPerformanceChart');
    if (!canvas) return; // Guard clause

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Acertos', 'Erros'],
            datasets: [{
                data: [correct, incorrect],
                backgroundColor: ['#22c55e', '#ef4444'],
                hoverBackgroundColor: ['#16a34a', '#dc2626'],
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'top' } }
        }
    });
}

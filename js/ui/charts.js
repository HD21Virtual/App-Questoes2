import { getWeeklySolvedQuestionsData } from '../services/firestore.js';
import DOM from '../dom-elements.js';

let performanceChart = null;
let homePerformanceChart = null;
let weeklyChartInstance = null;

function getLast7DaysLabels() {
    const labels = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        if (i === 0) labels.push('Hoje');
        else if (i === 1) labels.push('Ontem');
        else labels.push(`${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`);
    }
    return labels;
}

export async function renderWeeklyChart() {
    const ctx = DOM.weeklyPerformanceChart;
    if (!ctx) return;

    const questionsSolvedData = await getWeeklySolvedQuestionsData(); 
    const allLabels = getLast7DaysLabels();

    if (weeklyChartInstance) weeklyChartInstance.destroy();

    weeklyChartInstance = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: allLabels,
            datasets: [{
                label: 'Questões Resolvidas',
                data: questionsSolvedData,
                backgroundColor: '#3b82f6',
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Questões Resolvidas (Últimos 7 Dias)', font: { size: 18 }, color: '#4b5563' },
                legend: { display: false },
                tooltip: { enabled: true },
                datalabels: {
                    display: true, align: 'end', anchor: 'end',
                    formatter: (value) => value > 0 ? value : '',
                    font: { weight: 'bold', size: 14 },
                    color: '#3b82f6'
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#6b7280' } },
                y: { beginAtZero: true, grid: { color: '#e5e7eb' }, ticks: { color: '#6b7280', precision: 0 } }
            }
        }
    });
}

export function renderHomePerformanceChart(materiaTotals) {
    const homeChartCanvas = DOM.homePerformanceChart;
    if (!homeChartCanvas) return;
    
    if (homePerformanceChart) homePerformanceChart.destroy();

    const sortedMaterias = Object.keys(materiaTotals).sort((a, b) => materiaTotals[b].total - materiaTotals[a].total).slice(0, 10);
    const labels = sortedMaterias;
    const correctData = sortedMaterias.map(m => materiaTotals[m].correct);
    const incorrectData = sortedMaterias.map(m => materiaTotals[m].total - materiaTotals[m].correct);

    const ctx = homeChartCanvas.getContext('2d');
    homePerformanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'Acertos', data: correctData, backgroundColor: '#22c55e' },
                { label: 'Erros', data: incorrectData, backgroundColor: '#ef4444' },
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Desempenho por Disciplina', font: { size: 18 }, color: '#4b5563' },
                legend: { display: true, position: 'top' },
                tooltip: { enabled: true },
                datalabels: { display: false }
            },
            scales: {
                x: { stacked: true, grid: { display: false }, ticks: { precision: 0 } },
                y: { stacked: true, grid: { color: '#e5e7eb' } }
            }
        }
    });
}

export function renderSessionPerformanceChart(correctCount, incorrectCount, container) {
    if (performanceChart) performanceChart.destroy();
    
    const canvas = container.querySelector('#performanceChart');
    const chartCenterText = container.querySelector('#chart-center-text');
    if (!canvas || !chartCenterText) return;

    const answeredCount = correctCount + incorrectCount;
    if (answeredCount > 0) {
        const correctPercentage = (correctCount / answeredCount * 100);
        
        chartCenterText.innerHTML = `<div class="flex flex-col"><span class="text-3xl font-bold text-green-600">${correctPercentage.toFixed(0)}%</span><span class="text-sm text-gray-500">Acertos</span></div>`;
        
        const ctx = canvas.getContext('2d');
        performanceChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Acertos', 'Erros'],
                datasets: [{
                    data: [correctCount, incorrectCount],
                    backgroundColor: ['#22c55e', '#ef4444'],
                    borderColor: ['#ffffff'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                cutout: '70%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true },
                    datalabels: { display: false }
                }
            }
        });
    } else {
        chartCenterText.innerHTML = '';
    }
}

export function renderItemPerformanceChart(correctCount, incorrectCount) {
    const canvas = document.getElementById('itemPerformanceChart');
    if (!canvas) return;
    
    const totalAttempts = correctCount + incorrectCount;

    if (totalAttempts > 0) {
        const ctx = canvas.getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Acertos', 'Erros'],
                datasets: [{
                    data: [correctCount, incorrectCount],
                    backgroundColor: ['#22c55e', '#ef4444'],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: { 
                    legend: { position: 'top' },
                    datalabels: { display: false }
                }
            }
        });
    } else {
         canvas.outerHTML = '<p class="text-center text-gray-500 mt-4">Nenhum histórico de respostas para exibir o gráfico.</p>';
    }
}

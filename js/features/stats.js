import { state } from '../state.js';
import DOM from '../dom-elements.js';
import { renderWeeklyChart, renderHomePerformanceChart, renderSessionPerformanceChart } from '../ui/charts.js';
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { db } from '../firebase-config.js';

/**
 * @file js/features/stats.js
 * @description Funções para calcular e exibir estatísticas.
 */

export function updateStatsPanel(container = null, data = null) {
    let correctCount, incorrectCount, statsByMateria;
    const activeContainer = state.currentCadernoId ? DOM.savedCadernosListContainer : DOM.vadeMecumContentArea;
    const statsContainer = container || activeContainer.querySelector('#stats-content');
    
    if (!statsContainer) return;

    if (data) {
        correctCount = data.totalCorrect;
        incorrectCount = data.totalIncorrect;
        statsByMateria = data.statsByMateria;
    } else {
        correctCount = state.sessionStats.filter(s => s.isCorrect).length;
        incorrectCount = state.sessionStats.length - correctCount;
        statsByMateria = state.sessionStats.reduce((acc, stat) => {
            if (!acc[stat.materia]) {
                acc[stat.materia] = { correct: 0, total: 0, assuntos: {} };
            }
            if (!acc[stat.materia].assuntos[stat.assunto]) {
                acc[stat.materia].assuntos[stat.assunto] = { correct: 0, total: 0 };
            }

            acc[stat.materia].total++;
            acc[stat.materia].assuntos[stat.assunto].total++;
            if (stat.isCorrect) {
                acc[stat.materia].correct++;
                acc[stat.materia].assuntos[stat.assunto].correct++;
            }
            return acc;
        }, {});
    }

    const answeredCount = correctCount + incorrectCount;
    if (answeredCount === 0) {
        statsContainer.innerHTML = `<div class="text-center text-gray-500 p-4">Responda a questões para ver estatísticas.</div>`;
        return;
    }

    let materiaStatsHtml = '<div class="space-y-4">';
    for (const materia in statsByMateria) {
        const disciplinaStats = statsByMateria[materia];
        const disciplinaAccuracy = (disciplinaStats.total > 0 ? (disciplinaStats.correct / disciplinaStats.total * 100) : 0).toFixed(0);
        materiaStatsHtml += `
            <div>
                <div class="flex justify-between items-center text-gray-800">
                    <span>${materia}</span>
                    <span class="font-semibold">${disciplinaStats.correct} / ${disciplinaStats.total} (${disciplinaAccuracy}%)</span>
                </div>
            </div>
        `;
    }
    materiaStatsHtml += '</div>';

    statsContainer.innerHTML = `
         <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div class="relative w-full max-w-xs mx-auto">
                <div id="chart-center-text" class="absolute inset-0 flex items-center justify-center text-center pointer-events-none"></div>
                <canvas id="performanceChart"></canvas>
            </div>
            <div>
                <h4 class="text-xl font-bold text-gray-800 mb-3">Desempenho por Disciplina</h4>
                ${materiaStatsHtml}
            </div>
         </div>
    `;

    renderSessionPerformanceChart(correctCount, incorrectCount, statsContainer);
}

export async function getHistoricalCountsForQuestions(questionIds) {
    if (!state.currentUser || questionIds.length === 0) {
        return { correct: 0, incorrect: 0, resolved: 0 };
    }

    let totalCorrect = 0;
    let totalIncorrect = 0;
    let questionsWithHistory = 0;

    const historyPromises = questionIds.map(id => getDoc(doc(db, 'users', state.currentUser.uid, 'questionHistory', id)));
    const historySnapshots = await Promise.all(historyPromises);

    historySnapshots.forEach(snap => {
        if (snap.exists()) {
            const data = snap.data();
            const correct = data.correct || 0;
            const incorrect = data.incorrect || 0;
            if (correct > 0 || incorrect > 0) {
                questionsWithHistory++;
            }
            totalCorrect += correct;
            totalIncorrect += incorrect;
        }
    });
    
    return { correct: totalCorrect, incorrect: totalIncorrect, resolved: questionsWithHistory };
}

export async function generateStatsForQuestions(questionIds) {
    if (!state.currentUser || questionIds.length === 0) {
        return { totalCorrect: 0, totalIncorrect: 0, statsByMateria: {}, totalAttempts: 0, questionsWithHistory: 0 };
    }

    let totalCorrect = 0;
    let totalIncorrect = 0;
    let questionsWithHistory = 0;
    const statsByMateria = {};
    const questionDetails = questionIds.map(id => state.allQuestions.find(q => q.id === id)).filter(Boolean);

    const historyPromises = questionIds.map(id => getDoc(doc(db, 'users', state.currentUser.uid, 'questionHistory', id)));
    const historySnapshots = await Promise.all(historyPromises);

    historySnapshots.forEach((snap, index) => {
        const question = questionDetails[index];
        if (snap.exists() && question) {
            const data = snap.data();
            const correct = data.correct || 0;
            const incorrect = data.incorrect || 0;
            totalCorrect += correct;
            totalIncorrect += incorrect;
            
            if (correct > 0 || incorrect > 0) {
                questionsWithHistory++;
                if (!statsByMateria[question.materia]) {
                    statsByMateria[question.materia] = { correct: 0, total: 0, assuntos: {} };
                }
                if (!statsByMateria[question.materia].assuntos[question.assunto]) {
                    statsByMateria[question.materia].assuntos[question.assunto] = { correct: 0, total: 0 };
                }

                statsByMateria[question.materia].correct += correct;
                statsByMateria[question.materia].total += correct + incorrect;
                statsByMateria[question.materia].assuntos[question.assunto].correct += correct;
                statsByMateria[question.materia].assuntos[question.assunto].total += correct + incorrect;
            }
        }
    });

    return { totalCorrect, totalIncorrect, statsByMateria, totalAttempts: totalCorrect + totalIncorrect, questionsWithHistory };
}

export function updateStatsPageUI() {
    if (!DOM.statsTotalQuestions) return;

    let totalQuestions = 0;
    let totalCorrect = 0;
    const materiaTotals = {};

    state.historicalSessions.forEach(session => {
        totalQuestions += session.totalQuestions;
        totalCorrect += session.correctCount;
        for (const materia in session.details) {
            if (!materiaTotals[materia]) materiaTotals[materia] = { correct: 0, total: 0 };
            materiaTotals[materia].correct += session.details[materia].correct;
            materiaTotals[materia].total += session.details[materia].total;
        }
    });

    const totalIncorrect = totalQuestions - totalCorrect;
    const geralAccuracy = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(0) : 0;

    DOM.statsTotalQuestions.textContent = totalQuestions;
    DOM.statsTotalCorrect.textContent = totalCorrect;
    DOM.statsTotalIncorrect.textContent = totalIncorrect;
    DOM.statsGeralAccuracy.textContent = `${geralAccuracy}%`;

    renderWeeklyChart();
    renderHomePerformanceChart(materiaTotals);
}

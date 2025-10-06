import { state } from '../state.js';
import DOM from '../dom-elements.js';
import { navigateToView } from '../ui/navigation.js';
import { applyFilters, clearAllFilters } from './filter.js';

/**
 * @file js/features/materias.js
 * @description Lida com a lógica da view "Matérias".
 */

let selectedMateria = null;

export function renderMateriasView() {
    if (!state.currentUser) {
        DOM.materiasListContainer.innerHTML = '<p class="text-center text-gray-500">Por favor, faça login para ver as matérias.</p>';
        DOM.assuntosListContainer.classList.add('hidden');
        return;
    }

    if (selectedMateria) {
        // Display assuntos for the selected materia
        DOM.materiasViewTitle.textContent = selectedMateria.name;
        DOM.materiasListContainer.classList.add('hidden');
        DOM.assuntosListContainer.classList.remove('hidden');
        DOM.backToMateriasBtn.classList.remove('hidden');

        const assuntosHtml = selectedMateria.assuntos.map(assunto => `
            <div class="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer assunto-item" data-assunto-name="${assunto}">
                <div class="flex items-center">
                    <i class="fas fa-file-alt text-gray-400 mr-3"></i>
                    <span class="text-gray-800">${assunto}</span>
                </div>
            </div>
        `).join('');
        DOM.assuntosListContainer.innerHTML = `<div class="space-y-2">${assuntosHtml}</div>`;

    } else {
        // Display all materias
        DOM.materiasViewTitle.textContent = 'Matérias';
        DOM.materiasListContainer.classList.remove('hidden');
        DOM.assuntosListContainer.classList.add('hidden');
        DOM.backToMateriasBtn.classList.add('hidden');

        if (state.filterOptions.materia.length === 0) {
             DOM.materiasListContainer.innerHTML = '<p class="text-center text-gray-500">Nenhuma matéria encontrada. Adicione questões para vê-las aqui.</p>';
             return;
        }

        const materiasHtml = state.filterOptions.materia.map(materia => `
            <div class="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer materia-item" data-materia-name="${materia.name}">
                <div class="flex justify-between items-center">
                    <div class="flex items-center">
                        <i class="fas fa-book-open text-blue-500 mr-4 text-xl"></i>
                        <div>
                            <h3 class="font-bold text-lg text-gray-800">${materia.name}</h3>
                            <p class="text-sm text-gray-500">${materia.assuntos.length} assunto(s)</p>
                        </div>
                    </div>
                    <i class="fas fa-chevron-right text-gray-400"></i>
                </div>
            </div>
        `).join('');
        DOM.materiasListContainer.innerHTML = materiasHtml;
    }
}

export function handleMateriaListClick(materiaName) {
    selectedMateria = state.filterOptions.materia.find(m => m.name === materiaName);
    renderMateriasView();
}

export function handleAssuntoListClick(assuntoName) {
    const materiaName = selectedMateria.name;

    navigateToView('vade-mecum-view');
    
    // Use a small timeout to ensure the view is rendered before manipulating the filters
    setTimeout(() => {
        clearAllFilters();
        // Programmatically select materia
        const materiaContainer = document.getElementById('materia-filter');
        const materiaCheckbox = materiaContainer.querySelector(`.custom-select-option[data-value="${materiaName}"]`);
        if (materiaCheckbox) {
            materiaCheckbox.checked = true;
            // Trigger change event to update UI and state
            materiaContainer.querySelector('.custom-select-options').dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Another timeout to allow the assunto filter to be populated
        setTimeout(() => {
            const assuntoContainer = document.getElementById('assunto-filter');
            const assuntoCheckbox = assuntoContainer.querySelector(`.custom-select-option[data-value="${assuntoName}"]`);
            if (assuntoCheckbox) {
                assuntoCheckbox.checked = true;
                assuntoContainer.querySelector('.custom-select-options').dispatchEvent(new Event('change', { bubbles: true }));
            }
            // applyFilters is called automatically by the change event on the assunto filter
        }, 100); 
    }, 100);
}

export function handleBackToMaterias() {
    selectedMateria = null;
    renderMateriasView();
}

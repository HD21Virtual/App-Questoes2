import DOM from '../dom-elements.js';
import { state } from '../state.js';
import { clearAllFilters } from '../features/filter.js';

/**
 * @file js/ui/ui-helpers.js
 * @description Funções auxiliares para manipulação da UI.
 */

export function updateAssuntoFilter(disciplinas) {
    const assuntoContainer = DOM.assuntoFilter;
    const assuntoButton = assuntoContainer.querySelector('.custom-select-button');
    const valueSpan = assuntoContainer.querySelector('.custom-select-value');
    const optionsContainer = assuntoContainer.querySelector('.custom-select-options');
    
    valueSpan.textContent = 'Assunto';
    valueSpan.classList.add('text-gray-500');
    assuntoContainer.dataset.value = '[]';

    if (disciplinas.length === 0) {
        assuntoButton.disabled = true;
        optionsContainer.innerHTML = `<div class="p-2 text-center text-gray-400 text-sm">Selecione uma disciplina</div>`;
    } else {
        assuntoButton.disabled = false;
        let newHtml = '';
        
        disciplinas.forEach(disciplina => {
            const materiaObj = state.filterOptions.materia.find(m => m.name === disciplina);
            if (materiaObj && materiaObj.assuntos.length > 0) {
                newHtml += `<div class="font-bold text-sm text-gray-700 mt-2 px-1">${materiaObj.name}</div>`;
                
                materiaObj.assuntos.forEach(assunto => {
                    newHtml += `
                        <label class="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-100 cursor-pointer">
                            <input type="checkbox" data-value="${assunto}" class="custom-select-option rounded">
                            <span>${assunto}</span>
                        </label>
                    `;
                });
            }
        });
        
        optionsContainer.innerHTML = newHtml;
    }
}

export function updateSelectedFiltersDisplay() {
    DOM.selectedFiltersContainer.innerHTML = '';
    let hasFilters = false;

    const createFilterTag = (type, value, label) => {
        hasFilters = true;
        const tag = document.createElement('div');
        tag.className = 'flex items-center bg-gray-100 border border-gray-300 rounded-md pl-2 pr-1 py-1 text-sm';
        tag.innerHTML = `
            <span class="font-semibold mr-1">${label}:</span>
            <span class="mr-1">${value}</span>
            <button data-filter-type="${type}" data-filter-value="${value}" class="remove-filter-btn ml-1 text-gray-500 hover:text-gray-800">
                <i class="fas fa-times pointer-events-none"></i>
            </button>
        `;
        tag.querySelector('.remove-filter-btn').addEventListener('click', () => removeFilter(type, value));
        DOM.selectedFiltersContainer.appendChild(tag);
    };

    const selectedMaterias = JSON.parse(DOM.materiaFilter.dataset.value || '[]');
    selectedMaterias.forEach(m => createFilterTag('materia', m, 'Disciplina'));

    const selectedAssuntos = JSON.parse(DOM.assuntoFilter.dataset.value || '[]');
    selectedAssuntos.forEach(a => createFilterTag('assunto', a, 'Assunto'));
    
    const activeTipoBtn = DOM.tipoFilterGroup.querySelector('.active-filter');
    if (activeTipoBtn && activeTipoBtn.dataset.value !== 'todos') {
        createFilterTag('tipo', activeTipoBtn.textContent, 'Tipo');
    }

    if (DOM.searchInput.value) {
        createFilterTag('search', DOM.searchInput.value, 'Busca');
    }

    if (!hasFilters) {
        DOM.selectedFiltersContainer.innerHTML = `<span class="text-gray-500">Seus filtros aparecerão aqui</span>`;
    }
}

function removeFilter(type, value) {
    if (type === 'materia' || type === 'assunto') {
        const container = DOM[`${type}Filter`];
        const checkbox = container.querySelector(`.custom-select-option[data-value="${value}"]`);
        if(checkbox && checkbox.checked) {
            checkbox.checked = false;
            container.querySelector('.custom-select-options').dispatchEvent(new Event('change', { bubbles: true }));
        }
    } else if (type === 'tipo') {
        DOM.tipoFilterGroup.querySelector('.active-filter').classList.remove('active-filter');
        DOM.tipoFilterGroup.querySelector('[data-value="todos"]').classList.add('active-filter');
        DOM.tipoFilterGroup.dispatchEvent(new Event('click', { bubbles: true })); // Trigger the main handler
    } else if (type === 'search') {
        DOM.searchInput.value = '';
        clearAllFilters(); // Simplest way to re-apply all filters
    }
    updateSelectedFiltersDisplay();
}


export function updateUserUI(user) {
    const mobileContainer = DOM.userAccountContainerMobile;
    const desktopContainer = DOM.userAccountContainer;

    if (!mobileContainer || !desktopContainer) return;

    if (user) {
        const userEmail = user.email || 'Usuário';
        desktopContainer.innerHTML = `<div class="flex items-center"><span class="text-gray-600 text-sm mr-4">${userEmail}</span><button id="logout-btn" class="text-gray-500 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Sair</button></div>`;
        mobileContainer.innerHTML = `<div class="flex items-center justify-between"><span class="text-gray-600 text-sm">${userEmail}</span><button id="logout-btn-mobile" class="text-gray-500 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Sair</button></div>`;
    } else {
        desktopContainer.innerHTML = `<button id="show-login-modal-btn" class="text-gray-500 hover:bg-gray-100 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Minha Conta</button>`;
        mobileContainer.innerHTML = `<button id="show-login-modal-btn-mobile" class="text-gray-500 hover:bg-gray-100 hover:text-gray-900 block w-full text-left px-3 py-2 rounded-md text-base font-medium">Minha Conta</button>`;
    }
}

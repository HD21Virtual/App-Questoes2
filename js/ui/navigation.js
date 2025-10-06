import DOM from '../dom-elements.js';
import { state } from '../state.js';
import { exitAddMode, renderFoldersAndCadernos } from '../features/caderno.js';
import { renderMateriasView } from '../features/materias.js';
import { clearAllFilters, applyFilters } from '../features/filter.js';
import { updateStatsPageUI } from '../features/stats.js';

/**
 * @file js/ui/navigation.js
 * @description Controla a navegação entre as diferentes visualizações (telas) da aplicação.
 */

export function navigateToView(viewId) {
    if (state.isAddingQuestionsMode.active && viewId !== 'vade-mecum-view') {
        exitAddMode();
    }

    // Esconde todas as views
    Object.keys(DOM).forEach(key => {
        if (key.endsWith('View') && DOM[key]) {
            DOM[key].classList.add('hidden');
        }
    });

    // Mostra a view alvo
    if (DOM[viewId]) {
        DOM[viewId].classList.remove('hidden');
    }

    updateNavLinks(viewId);
    
    // Lógica específica para cada view
    if (viewId === 'vade-mecum-view' && !state.isReviewSession) {
        state.isReviewSession = false;
        DOM.vadeMecumTitle.textContent = "Vade Mecum de Questões";
        DOM.toggleFiltersBtn.classList.remove('hidden');
        DOM.filterCard.classList.remove('hidden');
        clearAllFilters();
    } else if (viewId === 'cadernos-view') {
        state.currentFolderId = null;
        state.currentCadernoId = null;
        renderFoldersAndCadernos();
    } else if (viewId === 'materias-view') {
        renderMateriasView();
    } else if (viewId === 'estatisticas-view' || viewId === 'inicio-view') {
        updateStatsPageUI();
    }

    DOM.mobileMenu.classList.add('hidden');
}

function updateNavLinks(activeViewId) {
    document.querySelectorAll('.nav-link').forEach(navLink => {
        if (navLink.dataset.view === activeViewId) {
            navLink.classList.add('text-blue-700', 'bg-blue-100');
            navLink.classList.remove('text-gray-500', 'hover:bg-gray-100', 'hover:text-gray-900');
        } else {
            navLink.classList.remove('text-blue-700', 'bg-blue-100');
            navLink.classList.add('text-gray-500', 'hover:bg-gray-100', 'hover:text-gray-900');
        }
    });
}

export function handleHamburgerMenu() {
    DOM.mobileMenu.classList.toggle('hidden');
}

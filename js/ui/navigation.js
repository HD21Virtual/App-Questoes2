import DOM from '../dom-elements.js';
import { exitAddMode, renderFoldersAndCadernos } from '../features/caderno.js';
import { renderMateriasView } from '../features/materias.js';
import { clearAllFilters, applyFilters, setupCustomSelects } from '../features/filter.js';
import { setState, state } from '../state.js';
import { updateStatsPageUI } from '../features/stats.js';
import { initDOM } from '../dom-elements.js';
import { updateReviewCard } from '../features/srs.js';

const mainContent = document.getElementById('main-content');

// Functions to initialize each view's specific logic after its HTML is loaded
async function initInicioView() {
    updateStatsPageUI();
}

async function initQuestoesView() {
    setupCustomSelects();
    await applyFilters();
}

async function initCadernosView() {
    renderFoldersAndCadernos();
}

async function initMateriasView() {
    setState('selectedMateria', null);
    renderMateriasView();
}

async function initRevisaoView() {
    updateReviewCard();
}

async function initEstatisticasView() {
    updateStatsPageUI();
}

// Map view names to their initializer functions
const viewInitializers = {
    'inicio': initInicioView,
    'questoes': initQuestoesView,
    'cadernos': initCadernosView,
    'materias': initMateriasView,
    'revisao': initRevisaoView,
    'estatisticas': initEstatisticasView,
};

/**
 * Fetches the HTML for a view, injects it into the main content area,
 * and runs the corresponding initializer script.
 * @param {string} viewId The name of the view to load (e.g., 'inicio').
 */
async function loadAndInitView(viewId) {
    try {
        const response = await fetch(`views/${viewId}.html`);
        if (!response.ok) {
            throw new Error(`A resposta da rede não foi 'ok' para ${viewId}.html`);
        }
        mainContent.innerHTML = await response.text();
        
        // Now that the new HTML is in the DOM, re-initialize the DOM element references
        initDOM();
        
        // Run the specific setup function for the loaded view
        const initializer = viewInitializers[viewId];
        if (initializer) {
            await initializer();
        }
    } catch (error) {
        console.error('Falha ao carregar a view:', error);
        mainContent.innerHTML = `<p class="text-center text-red-500">Erro ao carregar a página. Tente novamente mais tarde.</p>`;
    }
}

export async function navigateToView(viewId, isUserClick = true) {
    // Logic to handle exiting special modes when navigating away
    if (state.isAddingQuestionsMode.active && viewId !== 'questoes') {
        exitAddMode();
    }

    if (viewId === 'cadernos' && !state.isNavigatingBackFromAddMode) {
        setState('currentFolderId', null);
        setState('currentCadernoId', null);
    }
    setState('isNavigatingBackFromAddMode', false);
    
    // Load the view's HTML and run its setup scripts
    await loadAndInitView(viewId);

    // Update the active state of navigation links
    document.querySelectorAll('.nav-link').forEach(navLink => {
        navLink.classList.remove('text-blue-700', 'bg-blue-100');
        navLink.classList.add('text-gray-500', 'hover:bg-gray-100', 'hover:text-gray-900');
    });

    document.querySelectorAll(`.nav-link[data-view="${viewId}"]`).forEach(matchingLink => {
        matchingLink.classList.add('text-blue-700', 'bg-blue-100');
        matchingLink.classList.remove('text-gray-500', 'hover:bg-gray-100', 'hover:text-gray-900');
    });
    
    // Close mobile menu if it's open
    if (DOM.mobileMenu) {
        DOM.mobileMenu.classList.add('hidden');
    }
}

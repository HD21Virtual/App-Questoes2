import DOM, { initDOM } from '../dom-elements.js';
import { exitAddMode, renderFoldersAndCadernos } from '../features/caderno.js';
import { renderMateriasView } from '../features/materias.js';
import { applyFilters, setupCustomSelects } from '../features/filter.js';
import { setState, state } from '../state.js';
import { updateStatsPageUI } from '../features/stats.js';
import { updateReviewCard } from '../features/srs.js';

// Funções para inicializar a lógica específica de cada view após seu HTML ser carregado
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

// Mapeia os nomes das views para suas funções de inicialização
const viewInitializers = {
    'inicio': initInicioView,
    'questoes': initQuestoesView,
    'cadernos': initCadernosView,
    'materias': initMateriasView,
    'revisao': initRevisaoView,
    'estatisticas': initEstatisticasView,
};

/**
 * Busca o HTML de uma view, injeta na área de conteúdo principal,
 * e executa o inicializador correspondente.
 * @param {string} viewId O nome da view a ser carregada (ex: 'inicio').
 */
async function loadAndInitView(viewId) {
    const mainContent = document.querySelector('main');
    if (!mainContent) {
        console.error("Elemento <main> não encontrado para carregar a view.");
        return;
    }

    try {
        const response = await fetch(`views/${viewId}.html`);
        if (!response.ok) {
            throw new Error(`A resposta da rede não foi 'ok' para ${viewId}.html`);
        }
        mainContent.innerHTML = await response.text();
        
        // Agora que o novo HTML está no DOM, reinicializa as referências dos elementos do DOM
        initDOM();
        
        // Executa a função de configuração específica para a view carregada
        const initializer = viewInitializers[viewId];
        if (initializer) {
            await initializer();
        }
    } catch (error) {
        console.error('Falha ao carregar a view:', error);
        if(mainContent) mainContent.innerHTML = `<p class="text-center text-red-500">Erro ao carregar a página. Tente novamente mais tarde.</p>`;
    }
}

export async function navigateToView(viewId, isUserClick = true) {
    // Lógica para lidar com a saída de modos especiais ao navegar
    if (state.isAddingQuestionsMode.active && viewId !== 'questoes') {
        exitAddMode();
    }

    if (viewId === 'cadernos' && !state.isNavigatingBackFromAddMode) {
        setState('currentFolderId', null);
        setState('currentCadernoId', null);
    }
    setState('isNavigatingBackFromAddMode', false);
    
    // Carrega o HTML da view e executa seus scripts de configuração
    await loadAndInitView(viewId);

    // Atualiza o estado ativo dos links de navegação
    document.querySelectorAll('.nav-link').forEach(navLink => {
        navLink.classList.remove('text-blue-700', 'bg-blue-100');
        navLink.classList.add('text-gray-500', 'hover:bg-gray-100', 'hover:text-gray-900');
    });

    document.querySelectorAll(`.nav-link[href*="${viewId}.html"]`).forEach(matchingLink => {
        matchingLink.classList.add('text-blue-700', 'bg-blue-100');
        matchingLink.classList.remove('text-gray-500', 'hover:bg-gray-100', 'hover:text-gray-900');
    });
    
    // Fecha o menu móvel se estiver aberto
    if (DOM.mobileMenu) {
        DOM.mobileMenu.classList.add('hidden');
    }
}

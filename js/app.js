import { initAuth } from './services/auth.js';
import { fetchAllQuestions, setupAllListeners, clearAllListeners } from './services/firestore.js';
import { setupAllEventListeners } from './event-listeners.js';
import { state, resetStateOnLogout } from './state.js';
import { displayQuestion } from './features/question-viewer.js';
import { setupCustomSelects } from './features/filter.js';
import { navigateToView } from './ui/navigation.js';
import { updateUserUI } from './ui/ui-helpers.js';
import DOM from './dom-elements.js';

/**
 * @file js/app.js
 * @description Ponto de entrada principal da aplicação. Orquestra a inicialização
 * dos módulos, autenticação e o fluxo de dados principal.
 */

// Registra os plugins do Chart.js globalmente.
Chart.register(ChartDataLabels);

/**
 * Chamado quando um usuário faz login com sucesso.
 * @param {object} user - O objeto de usuário do Firebase.
 */
async function onLogin(user) {
    state.currentUser = user;
    updateUserUI(user);

    // Inicia os listeners do Firestore para dados do usuário.
    setupAllListeners(user.uid);
    
    // Busca os dados gerais de questões
    await fetchAllQuestions();
    
    // Configura os filtros com os dados carregados
    setupCustomSelects();
    
    // Navega para a view inicial. Os listeners já estão ativos e irão popular a UI.
    navigateToView('inicio-view');
}

/**
 * Chamado quando um usuário faz logout.
 */
function onLogout() {
    updateUserUI(null);
    
    // Para todos os listeners do Firestore para evitar vazamento de dados.
    clearAllListeners();
    
    // Reseta o estado da aplicação para o estado inicial.
    resetStateOnLogout();
    
    // Atualiza a UI para o estado de logout.
    navigateToView('inicio-view');
    displayQuestion(); // Mostra a mensagem de "faça login"
    DOM.savedCadernosListContainer.innerHTML = '<p class="text-center text-gray-500">Faça login para ver seus cadernos.</p>';
    DOM.reviewCard.classList.add('hidden');
}

/**
 * Função de inicialização principal da aplicação.
 */
function main() {
    // Configura todos os event listeners da UI.
    setupAllEventListeners();
    // Inicializa o serviço de autenticação, passando os callbacks de login/logout.
    initAuth(onLogin, onLogout);
}

// Inicia a aplicação quando o DOM estiver completamente carregado.
document.addEventListener('DOMContentLoaded', main);


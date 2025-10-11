import { initDOM } from './dom-elements.js';
import { initAuth } from './services/auth.js';
import { fetchAllQuestions } from './services/firestore.js';
import { setupAllEventListeners } from './event-listeners.js';
import { navigateToView } from './ui/navigation.js';

/**
 * @file js/app.js
 * @description Ponto de entrada principal da aplicação.
 * Inicializa a aplicação, configura listeners e carrega a view inicial.
 */

// Função principal de inicialização da aplicação
async function main() {
    // Inicializa as referências aos elementos do DOM
    initDOM();
    
    // Configura todos os event listeners da aplicação
    setupAllEventListeners();
    
    // Inicia o listener de autenticação do Firebase
    // O initAuth cuidará de buscar os dados do usuário ou resetar o estado
    initAuth();
    
    // Busca todas as questões do banco de dados para o estado global
    // Isso é feito uma vez para otimizar a performance
    await fetchAllQuestions();
    
    // Determina a página atual pela URL para carregar a view correta
    const path = window.location.pathname;
    const pageName = path.substring(path.lastIndexOf('/') + 1).replace('.html', '');
    
    // Define a view inicial, tratando 'index' como 'inicio'
    const initialView = ['index', 'questoes', 'cadernos', 'materias', 'revisao', 'estatisticas'].includes(pageName) && pageName !== '' ? pageName : 'inicio';
    
    // Navega para a view inicial
    // A função navigateToView irá carregar o HTML e executar os scripts da view
    await navigateToView(initialView === 'index' ? 'inicio' : initialView);
}

// Executa a função principal quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', main);

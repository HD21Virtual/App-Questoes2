import DOM from './dom-elements.js';

/**
 * @file js/state.js
 * @description Gerencia o estado global da aplicação.
 */

const initialState = {
    filterOptions: {
        materia: [],
        allAssuntos: []
    },
    currentQuestionIndex: 0,
    filteredQuestions: [],
    allQuestions: [],
    sessionStats: [],
    currentUser: null,
    userFolders: [],
    userCadernos: [],
    userFilters: [],
    currentFolderId: null,
    currentCadernoId: null,
    editingId: null,
    editingType: null,
    isAddingQuestionsMode: { active: false, cadernoId: null },
    createCadernoWithFilteredQuestions: false,
    deletingId: null,
    deletingType: null,
    isNavigatingBackFromAddMode: false,
    isReviewSession: false,
    historicalSessions: [],
    userAnswers: new Map(),
    userCadernoState: new Map(),
    userReviewItemsMap: new Map(),
};

export let state = { ...initialState };

/**
 * Atualiza uma propriedade do estado global.
 * @param {string} key - A chave do estado a ser atualizada.
 * @param {*} value - O novo valor para a chave.
 */
export function setState(key, value) {
    state[key] = value;
}

export function resetStateOnLogout() {
    // A chamada para limpar os listeners foi removida daqui
    // e é tratada no app.js para evitar dependências circulares.
    state = { 
        ...initialState,
        // Mantemos dados que não dependem do usuário
        allQuestions: state.allQuestions,
        filterOptions: state.filterOptions
    };
}


/**
 * Adiciona uma função de 'unsubscribe' do Firestore ao estado para limpeza posterior.
 * @param {string} key - A chave para armazenar a função (ex: 'unsubCadernos').
 * @param {Function} unsub - A função de unsubscribe retornada pelo onSnapshot.
 */
export function addUnsubscribe(key, unsub) {
    state[key] = unsub;
}

export function clearSessionStats() {
    state.sessionStats = [];
}

/**
 * Determina qual contêiner de conteúdo está ativo com base no estado atual.
 * @returns {HTMLElement} O elemento contêiner ativo.
 */
export function getActiveContainer() {
    return state.currentCadernoId ? DOM.savedCadernosListContainer : DOM.vadeMecumContentArea;
}


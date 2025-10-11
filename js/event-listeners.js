import DOM from './dom-elements.js';
import { state, setState } from './state.js';
import { closeSaveModal, closeCadernoModal, closeNameModal, handleConfirmation, openSaveModal, openCadernoModal, openNameModal, openLoadModal, closeLoadModal, closeConfirmationModal, closeStatsModal, openAuthModal, closeAuthModal, openConfirmationModal } from './ui/modal.js';
import { createCaderno, createOrUpdateName, saveFilter } from './services/firestore.js';
import { handleAuth } from './services/auth.js';
import { handleAddQuestionsToCaderno, handleCadernoItemClick, handleFolderItemClick, handleBackToFolders, cancelAddQuestions, addFilteredQuestionsToCaderno } from './features/caderno.js';
import { handleMateriaListClick, handleAssuntoListClick, handleBackToMaterias } from './features/materias.js';
import { handleStartReview, handleSrsFeedback } from './features/srs.js';
import { navigateQuestion, handleOptionSelect, checkAnswer, handleDiscardOption } from './features/question-viewer.js';
import { applyFilters, clearAllFilters, loadFilter } from './features/filter.js';
import { navigateToView } from './ui/navigation.js';
import { updateSavedFiltersList } from './ui/modal.js';

function handleGlobalClick(event) {
    const target = event.target;
    if (!target) return;

    // --- Navigation ---
    if (target.closest('.nav-link')) {
        event.preventDefault();
        const href = target.closest('a').getAttribute('href');
        let view = href.split('.')[0];
        if (view === 'index') {
            view = 'inicio';
        }
        navigateToView(view);
    }
    
    else if (target.closest('#hamburger-btn')) DOM.mobileMenu.classList.toggle('hidden');

    // --- Auth ---
    else if (target.closest('#show-login-modal-btn') || target.closest('#show-login-modal-btn-mobile') || target.closest('#login-from-empty')) openAuthModal();
    else if (target.closest('#close-auth-modal')) closeAuthModal();
    else if (target.closest('#login-btn')) handleAuth('login');
    else if (target.closest('#register-btn')) handleAuth('register');
    else if (target.closest('#google-login-btn')) handleAuth('google');
    else if (target.closest('#logout-btn') || target.closest('#logout-btn-mobile')) handleAuth('logout');

    // --- Filters ---
    else if (target.closest('#filter-btn')) {
        if (state.isAddingQuestionsMode.active) {
            addFilteredQuestionsToCaderno();
        } else {
            applyFilters();
        }
    }
    else if (target.closest('#clear-filters-btn')) clearAllFilters();
    else if (target.closest('#save-filter-btn')) openSaveModal();
    else if (target.closest('#cancel-save-btn') || target.closest('#close-save-modal')) closeSaveModal();
    else if (target.closest('#confirm-save-btn')) {
        const name = DOM.filterNameInput.value.trim();
        if (name) {
            const filters = {
                materias: JSON.parse(DOM.materiaFilter.dataset.value || '[]'),
                assuntos: JSON.parse(DOM.assuntoFilter.dataset.value || '[]'),
                tipo: DOM.tipoFilterGroup.querySelector('.active-filter').dataset.value,
                search: DOM.searchInput.value
            };
            saveFilter(name, filters);
            closeSaveModal();
        }
    }
    
    else if (target.closest('#saved-filters-list-btn')) openLoadModal();
    else if (target.closest('#close-load-modal')) closeLoadModal();
    else if (target.closest('#saved-filters-list-container')) {
        const button = target.closest('button[data-id]');
        if (!button) return;

        const filterId = button.dataset.id;
        if (button.classList.contains('load-filter-btn')) {
            const filterToLoad = state.userFilters.find(f => f.id === filterId);
            if (filterToLoad) {
                loadFilter(filterToLoad);
                closeLoadModal();
            }
        } else if (button.classList.contains('delete-filter-btn')) {
            openConfirmationModal('filter', filterId);
        }
    }
    
    else if (target.closest('#toggle-filters-btn')) {
        DOM.filterCard.classList.toggle('hidden');
        const icon = DOM.toggleFiltersBtn.querySelector('i');
        const textNode = DOM.toggleFiltersBtn.childNodes[2]; // Assuming text is the third node
        if (DOM.filterCard.classList.contains('hidden')) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
            textNode.textContent = ' Mostrar Filtros';
        } else {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
            textNode.textContent = ' Ocultar Filtros';
        }
    }
    else if (target.closest('.filter-btn-group')) {
        const button = target.closest('.filter-btn-toggle');
        if (button) {
            button.parentElement.querySelectorAll('.filter-btn-toggle').forEach(btn => btn.classList.remove('active-filter'));
            button.classList.add('active-filter');
            if (!state.isAddingQuestionsMode.active) {
                 applyFilters();
            }
        }
    }

    // --- Cadernos & Folders ---
    else if (target.closest('#create-caderno-btn')) openCadernoModal(true);
    else if (target.closest('#add-caderno-to-folder-btn')) openCadernoModal(false, state.currentFolderId);
    else if (target.closest('#cancel-caderno-btn') || target.closest('#close-caderno-modal')) closeCadernoModal();
    else if (target.closest('#confirm-caderno-btn')) {
        const name = DOM.cadernoNameInput.value.trim();
        const folderId = DOM.folderSelect.value;
        let questionIds = [];
        if (state.createCadernoWithFilteredQuestions) {
            questionIds = state.filteredQuestions.map(q => q.id);
        }
        if (name) {
            createCaderno(name, folderId, questionIds);
            closeCadernoModal();
        }
    }
    
    else if (target.closest('#create-folder-btn')) openNameModal('folder');
    else if (target.closest('#cancel-name-btn') || target.closest('#close-name-modal')) closeNameModal();
    else if (target.closest('#confirm-name-btn')) {
        const name = DOM.nameInput.value.trim();
        if (name) {
            createOrUpdateName(state.editingType, name, state.editingId);
            closeNameModal();
        }
    }
    
    else if (target.closest('#saved-cadernos-list-container')) {
        handleFolderItemClick(event);
        handleCadernoItemClick(event);
        
        // Listeners for question solver UI inside a caderno
        if (state.currentCadernoId) {
            if (target.closest('.option-item')) handleOptionSelect(event);
            else if (target.closest('#submit-btn')) checkAnswer();
            else if (target.closest('#prev-question-btn')) navigateQuestion('prev');
            else if (target.closest('#next-question-btn')) navigateQuestion('next');
            else if (target.closest('.srs-feedback-btn')) handleSrsFeedback(target.dataset.feedback);
            else if (target.closest('.discard-btn')) handleDiscardOption(event);
            else if (target.closest('.tab-button')) {
                 const tabId = target.dataset.tab;
                 document.querySelectorAll('.tab-button').forEach(t => t.classList.remove('active'));
                 target.classList.add('active');
                 if (tabId === 'stats') {
                     document.getElementById('question-view').classList.add('hidden');
                     document.getElementById('stats-view').classList.remove('hidden');
                 } else {
                     document.getElementById('stats-view').classList.add('hidden');
                     document.getElementById('question-view').classList.remove('hidden');
                 }
            }
        }
    }
    
    else if (target.closest('#back-to-folders-btn')) handleBackToFolders();
    else if (target.closest('#add-questions-to-caderno-btn')) handleAddQuestionsToCaderno();
    else if (target.closest('#cancel-add-questions-btn')) cancelAddQuestions();
    
    // --- Questões View ---
    else if (target.closest('#vade-mecum-view')) {
         if (target.closest('.option-item')) handleOptionSelect(event);
         else if (target.closest('#submit-btn')) checkAnswer();
         else if (target.closest('#prev-question-btn')) navigateQuestion('prev');
         else if (target.closest('#next-question-btn')) navigateQuestion('next');
         else if (target.closest('.srs-feedback-btn')) handleSrsFeedback(target.dataset.feedback);
         else if (target.closest('.discard-btn')) handleDiscardOption(event);
         else if (target.closest('.tab-button')) {
             const tabId = target.dataset.tab;
             document.querySelectorAll('.tab-button').forEach(t => t.classList.remove('active'));
             target.classList.add('active');
             if (tabId === 'stats') {
                 document.getElementById('question-view').classList.add('hidden');
                 document.getElementById('stats-view').classList.remove('hidden');
             } else {
                 document.getElementById('stats-view').classList.add('hidden');
                 document.getElementById('question-view').classList.remove('hidden');
             }
         }
    }
    
    // --- Materias View ---
    else if (target.closest('#materias-list-container')) handleMateriaListClick(event);
    else if (target.closest('#assuntos-list-container')) handleAssuntoListClick(event);
    else if (target.closest('#back-to-materias-btn')) handleBackToMaterias();
    
    // --- Revisão View ---
    else if (target.closest('#start-review-btn')) handleStartReview();

    // --- Estatísticas View ---
    else if (target.closest('#reset-all-progress-btn')) openConfirmationModal('all-progress');

    // --- Confirmation Modal ---
    else if (target.closest('#cancel-confirmation-btn')) closeConfirmationModal();
    else if (target.closest('#confirm-delete-btn')) handleConfirmation();
    
    // --- Stats Modal ---
    else if (target.closest('#close-stats-modal')) closeStatsModal();
    
}

export function setupAllEventListeners() {
    document.body.addEventListener('click', handleGlobalClick);

    // Adiciona o listener de input para a busca de filtros salvos
    // A verificação `if (DOM.searchSavedFiltersInput)` garante que o código não quebre
    // se o elemento não existir na página atual.
    if (DOM.searchSavedFiltersInput) {
        DOM.searchSavedFiltersInput.addEventListener('input', updateSavedFiltersList);
    }
}


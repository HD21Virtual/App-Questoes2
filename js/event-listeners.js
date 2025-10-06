import DOM from './dom-elements.js';
import { navigateToView, handleHamburgerMenu } from './ui/navigation.js';
import { openAuthModal, openSaveModal, openLoadModal, openCadernoModal, openNameModal, closeAuthModal, closeSaveModal, closeLoadModal, closeCadernoModal, closeNameModal, closeConfirmationModal, closeStatsModal, handleConfirmation, openConfirmationModal } from './ui/modal.js';
import { state } from './state.js';
import { handleEmailLogin, handleEmailRegister, handleGoogleLogin, handleSignOut } from './services/auth.js';
import { saveFilter, deleteFilter, createCaderno, createOrUpdateName, addQuestionsToCaderno } from './services/firestore.js';
import { applyFilters, clearAllFilters, setupCustomSelects } from './features/filter.js';
import { handleCadernoItemClick, handleFolderItemClick, handleBackToFolders, handleAddQuestionsToCaderno as startAddQuestionsMode, exitAddMode } from './features/caderno.js';
import { handleMateriaListClick, handleAssuntoListClick, handleBackToMaterias } from './features/materias.js';
import { startReviewSession } from './features/srs.js';
import { navigateQuestion } from './features/question-viewer.js';

export function setupAllEventListeners() {
    // Event delegation for dynamically created elements and general clicks
    document.body.addEventListener('click', (event) => {
        const target = event.target;

        // Auth buttons
        if (target.closest('#show-login-modal-btn') || target.closest('#show-login-modal-btn-mobile') || target.closest('#login-from-empty')) openAuthModal();
        if (target.closest('#login-btn')) handleEmailLogin();
        if (target.closest('#register-btn')) handleEmailRegister();
        if (target.closest('#google-login-btn')) handleGoogleLogin();
        if (target.closest('#logout-btn') || target.closest('#logout-btn-mobile')) handleSignOut();

        // Navigation
        const navLink = target.closest('.nav-link');
        if (navLink) navigateToView(navLink.dataset.view);

        // Modals
        if (target.closest('#save-filter-btn')) openSaveModal();
        if (target.closest('#saved-filters-list-btn')) openLoadModal();
        if (target.closest('#create-caderno-btn')) openCadernoModal(true);
        if (target.closest('#add-caderno-to-folder-btn')) openCadernoModal(false);
        if (target.closest('#create-folder-btn')) openNameModal('folder');

        // Modal Close Buttons
        if (target.closest('#close-auth-modal')) closeAuthModal();
        if (target.closest('#close-save-modal') || target.closest('#cancel-save-btn')) closeSaveModal();
        if (target.closest('#close-load-modal')) closeLoadModal();
        if (target.closest('#close-caderno-modal') || target.closest('#cancel-caderno-btn')) closeCadernoModal();
        if (target.closest('#close-name-modal') || target.closest('#cancel-name-btn')) closeNameModal();
        if (target.closest('#cancel-confirmation-btn')) closeConfirmationModal();
        if (target.closest('#close-stats-modal')) closeStatsModal();
        
        // Modal Confirmation/Action Buttons
        if (target.closest('#confirm-delete-btn')) handleConfirmation();
        if (target.closest('#confirm-save-btn')) {
            const name = DOM.filterNameInput.value;
            if(name) {
                const filters = {
                    materias: JSON.parse(DOM.materiaFilter.dataset.value || '[]'),
                    assuntos: JSON.parse(DOM.assuntoFilter.dataset.value || '[]'),
                    tipo: DOM.tipoFilterGroup.querySelector('.active-filter')?.dataset.value || 'todos',
                    search: DOM.searchInput.value
                };
                saveFilter(name, filters);
                closeSaveModal();
            }
        }
        if (target.closest('#confirm-caderno-btn')) {
            const name = DOM.cadernoNameInput.value;
            const folderId = DOM.folderSelect.value;
            if (name) {
                const questionIds = state.createCadernoWithFilteredQuestions ? state.filteredQuestions.map(q => q.id) : [];
                createCaderno(name, folderId, questionIds);
                closeCadernoModal();
            }
        }
        if (target.closest('#confirm-name-btn')) {
            const name = DOM.nameInput.value;
            if (name) {
                createOrUpdateName(state.editingType, name, state.editingId);
                closeNameModal();
            }
        }

        // Filters
        if (target.closest('#filter-btn')) {
            if (state.isAddingQuestionsMode.active) {
                const cadernoId = state.isAddingQuestionsMode.cadernoId;
                const caderno = state.userCadernos.find(c => c.id === cadernoId);
                if (caderno) {
                    const existingIds = caderno.questionIds || [];
                    const newQuestionIds = state.filteredQuestions.map(q => q.id).filter(id => !existingIds.includes(id));
                    addQuestionsToCaderno(cadernoId, newQuestionIds);
                }
                exitAddMode();
            } else {
                applyFilters();
            }
        }
        if (target.closest('#clear-filters-btn')) clearAllFilters();

        // Cadernos/Folders actions
        const folderItem = target.closest('.folder-item[data-action="open"]');
        if (folderItem) handleFolderItemClick(folderItem.dataset.folderId);

        const cadernoItem = target.closest('.caderno-item[data-action="open"]');
        if (cadernoItem) handleCadernoItemClick(cadernoItem.dataset.cadernoId);
        
        if (target.closest('#back-to-folders-btn')) handleBackToFolders();
        if (target.closest('#add-questions-to-caderno-btn')) startAddQuestionsMode();
        if (target.closest('#cancel-add-questions-btn')) exitAddMode();
        
        const deleteFolderBtn = target.closest('.delete-folder-btn');
        if(deleteFolderBtn) openConfirmationModal('folder', deleteFolderBtn.dataset.id);
        
        const deleteCadernoBtn = target.closest('.delete-caderno-btn');
        if(deleteCadernoBtn) openConfirmationModal('caderno', deleteCadernoBtn.dataset.id);

        const editFolderBtn = target.closest('.edit-folder-btn');
        if(editFolderBtn) openNameModal('folder', editFolderBtn.dataset.id, editFolderBtn.dataset.name);

        const editCadernoBtn = target.closest('.edit-caderno-btn');
        if(editCadernoBtn) openNameModal('caderno', editCadernoBtn.dataset.id, editCadernoBtn.dataset.name);
        
        const deleteFilterBtn = target.closest('.delete-filter-btn');
        if(deleteFilterBtn) deleteFilter(deleteFilterBtn.dataset.id);

        // Matérias/Assuntos
        const materiaItem = target.closest('.materia-item');
        if (materiaItem) handleMateriaListClick(materiaItem.dataset.materiaName);
        
        const assuntoItem = target.closest('.assunto-item');
        if (assuntoItem) handleAssuntoListClick(assuntoItem.dataset.assuntoName);

        if (target.closest('#back-to-materias-btn')) handleBackToMaterias();

        // SRS
        if (target.closest('#start-review-btn')) startReviewSession();

        // Question Navigation
        if (target.closest('#prev-question-btn')) navigateQuestion('prev');
        if (target.closest('#next-question-btn')) navigateQuestion('next');
        
        // Reset Progress
        if (target.closest('#reset-all-progress-btn')) {
            openConfirmationModal('all-progress');
        }
    });

    // Specific event listeners that don't fit delegation well
    DOM.hamburgerBtn.addEventListener('click', handleHamburgerMenu);
    
    DOM.toggleFiltersBtn.addEventListener('click', () => {
        DOM.filterCard.classList.toggle('hidden');
        DOM.toggleFiltersBtn.innerHTML = DOM.filterCard.classList.contains('hidden') 
            ? `<i class="fas fa-eye mr-2"></i> Mostrar Filtros` 
            : `<i class="fas fa-eye-slash mr-2"></i> Ocultar Filtros`;
    });

    DOM.tipoFilterGroup.addEventListener('click', (event) => {
        if (event.target.classList.contains('filter-btn-toggle')) {
            DOM.tipoFilterGroup.querySelectorAll('.filter-btn-toggle').forEach(btn => btn.classList.remove('active-filter'));
            event.target.classList.add('active-filter');
            applyFilters();
        }
    });

    setupCustomSelects();
}

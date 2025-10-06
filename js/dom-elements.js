const DOM = {
    // Views
    inicioView: document.getElementById('inicio-view'),
    vadeMecumView: document.getElementById('vade-mecum-view'),
    cadernosView: document.getElementById('cadernos-view'),
    materiasView: document.getElementById('materias-view'),
    revisaoView: document.getElementById('revisao-view'),
    estatisticasView: document.getElementById('estatisticas-view'),

    // Header & Nav
    mainNav: document.getElementById('main-nav'),
    hamburgerBtn: document.getElementById('hamburger-btn'),
    mobileMenu: document.getElementById('mobile-menu'),
    userAccountContainer: document.getElementById('user-account-container'),
    userAccountContainerMobile: document.getElementById('user-account-container-mobile'),
    
    // Auth Modal
    authModal: document.getElementById('auth-modal'),
    emailInput: document.getElementById('email-input'),
    passwordInput: document.getElementById('password-input'),
    authError: document.getElementById('auth-error'),
    
    // Vade Mecum / Questões View
    vadeMecumContentArea: document.getElementById('vade-mecum-content-area'),
    vadeMecumTitle: document.getElementById('vade-mecum-title'),
    addQuestionsBanner: document.getElementById('add-questions-banner'),
    addQuestionsBannerText: document.getElementById('add-questions-banner-text'),
    cancelAddQuestionsBtn: document.getElementById('cancel-add-questions-btn'),
    toggleFiltersBtn: document.getElementById('toggle-filters-btn'),
    filterCard: document.getElementById('filter-card'),
    savedFiltersListBtn: document.getElementById('saved-filters-list-btn'),
    searchInput: document.getElementById('search-input'),
    materiaFilter: document.getElementById('materia-filter'),
    assuntoFilter: document.getElementById('assunto-filter'),
    tipoFilterGroup: document.getElementById('tipo-filter-group'),
    selectedFiltersContainer: document.getElementById('selected-filters-container'),
    clearFiltersBtn: document.getElementById('clear-filters-btn'),
    saveFilterBtn: document.getElementById('save-filter-btn'),
    createCadernoBtn: document.getElementById('create-caderno-btn'),
    filterBtn: document.getElementById('filter-btn'),
    tabsContainer: document.getElementById('tabs-container'),
    customSelects: document.querySelectorAll('.custom-select-container'),

    // Cadernos View
    cadernosViewTitle: document.getElementById('cadernos-view-title'),
    backToFoldersBtn: document.getElementById('back-to-folders-btn'),
    addQuestionsToCadernoBtn: document.getElementById('add-questions-to-caderno-btn'),
    createFolderBtn: document.getElementById('create-folder-btn'),
    addCadernoToFolderBtn: document.getElementById('add-caderno-to-folder-btn'),
    savedCadernosListContainer: document.getElementById('saved-cadernos-list-container'),
    
    // Matérias View
    materiasViewTitle: document.getElementById('materias-view-title'),
    materiasListContainer: document.getElementById('materias-list-container'),
    assuntosListContainer: document.getElementById('assuntos-list-container'),
    backToMateriasBtn: document.getElementById('back-to-materias-btn'),
    
    // Revisão View
    reviewCard: document.getElementById('review-card'),
    reviewCountEl: document.getElementById('review-count'),
    startReviewBtn: document.getElementById('start-review-btn'),
    
    // Estatísticas View
    statsTotalQuestions: document.getElementById('stats-total-questions'),
    statsTotalCorrect: document.getElementById('stats-total-correct'),
    statsTotalIncorrect: document.getElementById('stats-total-incorrect'),
    statsGeralAccuracy: document.getElementById('stats-geral-accuracy'),
    weeklyPerformanceChart: document.getElementById('weeklyPerformanceChart'),
    homePerformanceChart: document.getElementById('homePerformanceChart'),
    resetAllProgressBtn: document.getElementById('reset-all-progress-btn'),

    // Modals
    saveModal: document.getElementById('save-modal'),
    filterNameInput: document.getElementById('filter-name-input'),
    loadModal: document.getElementById('load-modal'),
    searchSavedFiltersInput: document.getElementById('search-saved-filters-input'),
    savedFiltersListContainer: document.getElementById('saved-filters-list-container'),
    cadernoModal: document.getElementById('caderno-modal'),
    cadernoNameInput: document.getElementById('caderno-name-input'),
    folderSelect: document.getElementById('folder-select'),
    nameModal: document.getElementById('name-modal'),
    nameModalTitle: document.getElementById('name-modal-title'),
    nameInput: document.getElementById('name-input'),
    confirmationModal: document.getElementById('confirmation-modal'),
    confirmationModalTitle: document.getElementById('confirmation-modal-title'),
    confirmationModalText: document.getElementById('confirmation-modal-text'),
    confirmDeleteBtn: document.getElementById('confirm-delete-btn'),
    cancelConfirmationBtn: document.getElementById('cancel-confirmation-btn'),
    statsModal: document.getElementById('stats-modal'),
    statsModalTitle: document.getElementById('stats-modal-title'),
    statsModalContent: document.getElementById('stats-modal-content'),
};

export default DOM;

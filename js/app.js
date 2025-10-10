import { initAuth } from './services/auth.js';
import { fetchAllQuestions } from './services/firestore.js';
import { setupAllEventListeners } from './event-listeners.js';
import { navigateToView } from './ui/navigation.js';
import { initDOM } from './dom-elements.js';

async function main() {
    // 1. Initialize static DOM elements from the main shell (header, modals, etc.)
    initDOM();

    // 2. Set up all global event listeners for the application (clicks, inputs, etc.)
    setupAllEventListeners();

    // 3. Fetch all question data in the background so it's ready for the views
    await fetchAllQuestions();
    
    // 4. Initialize authentication. The auth state listener will trigger the initial
    //    navigation to the 'inicio' view once the user state is determined.
    initAuth();
}

// Wait for the DOM to be fully loaded before running the main script
document.addEventListener('DOMContentLoaded', main);

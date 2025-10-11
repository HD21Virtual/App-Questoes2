import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth } from '../firebase-config.js';
import { state, setState, resetStateOnLogout, clearUnsubscribes } from '../state.js';
import { setupAllListeners } from '../services/firestore.js';
import { updateUserUI } from '../ui/ui-helpers.js';
import { closeAuthModal } from '../ui/modal.js';
import DOM from '../dom-elements.js';

export function initAuth() {
    onAuthStateChanged(auth, (user) => {
        clearUnsubscribes();
        setState('currentUser', user);

        if (user) {
            updateUserUI(user);
            closeAuthModal();
            setupAllListeners(user.uid);
        } else {
            resetStateOnLogout();
            updateUserUI(null);
        }
    });
}

export async function handleAuth(action) {
    DOM.authError.classList.add('hidden');
    try {
        if (action === 'login') {
            await signInWithEmailAndPassword(auth, DOM.emailInput.value, DOM.passwordInput.value);
        } else if (action === 'register') {
            await createUserWithEmailAndPassword(auth, DOM.emailInput.value, DOM.passwordInput.value);
        } else if (action === 'logout') {
            await signOut(auth);
            // Redireciona para a página inicial após o logout
            window.location.href = 'index.html';
        }
    } catch (error) {
        DOM.authError.textContent = error.message;
        DOM.authError.classList.remove('hidden');
    }
}

export async function handleGoogleAuth() {
    DOM.authError.classList.add('hidden');
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    } catch (error) {
        DOM.authError.textContent = error.message;
        DOM.authError.classList.remove('hidden');
    }
}

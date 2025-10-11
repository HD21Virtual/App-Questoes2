import {
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth } from '../firebase-config.js';
import { state, setState, resetStateOnLogout } from '../state.js';
import { setupAllListeners, clearAllListeners } from './firestore.js';
import { updateUserUI } from '../ui/ui-helpers.js';
import { closeAuthModal } from '../ui/modal.js';
import DOM from '../dom-elements.js';
import { navigateToView } from "../ui/navigation.js";

export function initAuth() {
    onAuthStateChanged(auth, async (user) => {
        clearAllListeners(); // Limpa listeners antigos para evitar duplicação
        setState('currentUser', user);

        if (user) {
            updateUserUI(user);
            closeAuthModal();
            setupAllListeners(user.uid); // Configura novos listeners para o usuário logado
        } else {
            resetStateOnLogout();
            updateUserUI(null);
        }
        
        // Garante que a view correta seja exibida após a mudança de autenticação
        const currentPath = window.location.pathname.split('/').pop().replace('.html', '');
        if (currentPath === '' || currentPath === 'index') {
            await navigateToView('inicio');
        }
    });
}

export async function handleAuth(action) {
    if(!DOM.authError) return;
    DOM.authError.classList.add('hidden');
    try {
        if (action === 'login') {
            await signInWithEmailAndPassword(auth, DOM.emailInput.value, DOM.passwordInput.value);
        } else if (action === 'register') {
            await createUserWithEmailAndPassword(auth, DOM.emailInput.value, DOM.passwordInput.value);
        } else if (action === 'google') {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } else if (action === 'logout') {
            await signOut(auth);
            // Redireciona para a página inicial após o logout para um estado limpo
            window.location.href = 'index.html';
        }
    } catch (error) {
        DOM.authError.textContent = error.message;
        DOM.authError.classList.remove('hidden');
    }
}

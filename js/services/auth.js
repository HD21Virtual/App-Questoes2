import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth } from '../firebase-config.js';
import { closeAuthModal } from '../ui/modal.js';
import DOM from '../dom-elements.js';

/**
 * Inicializa o listener de autenticação do Firebase.
 * @param {Function} onLoginCallback - Função a ser chamada quando o usuário faz login.
 * @param {Function} onLogoutCallback - Função a ser chamada quando o usuário faz logout.
 */
export function initAuth(onLoginCallback, onLogoutCallback) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            onLoginCallback(user);
        } else {
            onLogoutCallback();
        }
    });
}

/**
 * Tenta fazer login com e-mail e senha.
 */
export async function handleEmailLogin() {
    DOM.authError.classList.add('hidden');
    try {
        const userCredential = await signInWithEmailAndPassword(auth, DOM.emailInput.value, DOM.passwordInput.value);
        // O onAuthStateChanged vai lidar com o sucesso do login.
        closeAuthModal();
    } catch (error) {
        DOM.authError.textContent = "Email ou senha inválidos.";
        DOM.authError.classList.remove('hidden');
    }
}

/**
 * Tenta registrar um novo usuário com e-mail e senha.
 */
export async function handleEmailRegister() {
    DOM.authError.classList.add('hidden');
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, DOM.emailInput.value, DOM.passwordInput.value);
        // O onAuthStateChanged vai lidar com o sucesso do registro.
        closeAuthModal();
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            DOM.authError.textContent = "Este e-mail já está em uso.";
        } else {
            DOM.authError.textContent = "Erro ao registrar. Verifique os dados.";
        }
        DOM.authError.classList.remove('hidden');
    }
}

/**
 * Tenta fazer login usando a conta do Google.
 */
export async function handleGoogleLogin() {
    DOM.authError.classList.add('hidden');
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        // O onAuthStateChanged vai lidar com o sucesso do login.
        closeAuthModal();
    } catch (error) {
        DOM.authError.textContent = "Erro ao fazer login com o Google.";
        DOM.authError.classList.remove('hidden');
    }
}

/**
 * Faz logout do usuário atual.
 */
export function handleSignOut() {
    signOut(auth);
}

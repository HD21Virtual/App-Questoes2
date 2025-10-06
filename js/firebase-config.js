import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

/**
 * @file js/firebase-config.js
 * @description Centraliza a configuração e inicialização do Firebase.
 * Exporta as instâncias `auth` e `db` para serem usadas em toda a aplicação.
 */

// ATENÇÃO: Suas chaves de API do Firebase são visíveis aqui.
// Em um ambiente de produção, é crucial proteger estas chaves usando as Regras de Segurança do Firebase
// e, se necessário, outras ferramentas como o App Check.
const firebaseConfig = {
    apiKey: "AIzaSyAbDQfS3VTVlXEBdHKKwx-ToTWTGFOcYAE",
    authDomain: "vade-mecum-de-questoes.firebaseapp.com",
    projectId: "vade-mecum-de-questoes",
    storageBucket: "vade-mecum-de-questoes.appspot.com",
    messagingSenderId: "667396734608",
    appId: "1:667396734608:web:96f67c131ccbd798792215"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta as instâncias dos serviços do Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);

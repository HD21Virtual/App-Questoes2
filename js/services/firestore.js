import { collection, getDocs, query, addDoc, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp, orderBy, arrayUnion, arrayRemove, where, increment, writeBatch, Timestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { db } from '../firebase-config.js';
import { state, addUnsubscribe } from '../state.js';
import { renderFoldersAndCadernos } from '../features/caderno.js';
import { updateStatsPageUI } from '../features/stats.js';
import { updateReviewCard } from '../features/srs.js';
import { displayQuestion } from "../features/question-viewer.js";
import DOM from '../dom-elements.js';
import { updateSavedFiltersList } from '../ui/modal.js';

let unsubscribes = [];

// --- FUNÇÕES DE SETUP DE LISTENERS ---

function setupCadernosAndFoldersListener(userId) {
    const cadernosQuery = query(collection(db, 'users', userId, 'cadernos'), orderBy('name'));
    const unsubCadernos = onSnapshot(cadernosQuery, (snapshot) => {
        state.userCadernos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderFoldersAndCadernos();
    });
    unsubscribes.push(unsubCadernos);

    const foldersQuery = query(collection(db, 'users', userId, 'folders'), orderBy('name'));
    const unsubFolders = onSnapshot(foldersQuery, (snapshot) => {
        const folderOptions = ['<option value="">Salvar em (opcional)</option>'];
        state.userFolders = snapshot.docs.map(doc => {
            const folder = { id: doc.id, ...doc.data() };
            folderOptions.push(`<option value="${folder.id}">${folder.name}</option>`);
            return folder;
        });
        if (DOM.folderSelect) {
            DOM.folderSelect.innerHTML = folderOptions.join('');
        }
        renderFoldersAndCadernos();
    });
    unsubscribes.push(unsubFolders);
}

function setupFiltrosListener(userId) {
    const filtrosCollection = collection(db, 'users', userId, 'filtros');
    const unsubFiltros = onSnapshot(filtrosCollection, (snapshot) => {
        state.userFilters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        updateSavedFiltersList();
    });
    unsubscribes.push(unsubFiltros);
}

function setupStatsListener(userId) {
    const sessionsQuery = query(collection(db, 'users', userId, 'sessions'), orderBy('createdAt', 'desc'));
    const unsubSessions = onSnapshot(sessionsQuery, (snapshot) => {
        state.historicalSessions = snapshot.docs.map(doc => doc.data());
        updateStatsPageUI();
    });
    unsubscribes.push(unsubSessions);
}

function setupReviewListener(userId) {
    const reviewQuery = query(collection(db, 'users', userId, 'reviewItems'));
    const unsubReviewItems = onSnapshot(reviewQuery, (snapshot) => {
         snapshot.docChanges().forEach((change) => {
            const docId = change.doc.id;
            if (change.type === "added" || change.type === "modified") {
                state.userReviewItemsMap.set(docId, { id: docId, ...change.doc.data() });
            }
            if (change.type === "removed") {
                state.userReviewItemsMap.delete(docId);
            }
        });
        updateReviewCard();
    });
    unsubscribes.push(unsubReviewItems);
}

function setupUserAnswersListener(userId) {
    const answersQuery = query(collection(db, 'users', userId, 'userQuestionState'));
    const unsubAnswers = onSnapshot(answersQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            const docData = change.doc.data();
            const docId = change.doc.id;
            if (change.type === "added" || change.type === "modified") {
                state.userAnswers.set(docId, { userAnswer: docData.userAnswer, isCorrect: docData.isCorrect });
            }
            if (change.type === "removed") {
                state.userAnswers.delete(docId);
            }
        });
        const currentView = document.querySelector('div[id$="-view"]:not(.hidden)');
        if (currentView && (currentView.id === 'vade-mecum-view' || (currentView.id === 'cadernos-view' && state.currentCadernoId))) {
             displayQuestion();
        }
    });
    unsubscribes.push(unsubAnswers);
}

function setupCadernoStateListener(userId) {
    const stateQuery = query(collection(db, 'users', userId, 'cadernoState'));
    const unsubCadernoState = onSnapshot(stateQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            const docId = change.doc.id;
            if (change.type === "added" || change.type === "modified") {
                state.userCadernoState.set(docId, change.doc.data());
            }
            if (change.type === "removed") {
                state.userCadernoState.delete(docId);
            }
        });
    });
    unsubscribes.push(unsubCadernoState);
}

/**
 * Inicia todos os listeners de dados do Firestore para o usuário logado.
 * @param {string} userId - O ID do usuário.
 */
export function setupAllListeners(userId) {
    clearAllListeners();
    setupCadernosAndFoldersListener(userId);
    setupFiltrosListener(userId);
    setupStatsListener(userId);
    setupReviewListener(userId);
    setupUserAnswersListener(userId);
    setupCadernoStateListener(userId);
}

export function clearAllListeners() {
    unsubscribes.forEach(unsub => unsub());
    unsubscribes = [];
}

// --- FUNÇÕES DE LEITURA (FETCH) ---

export async function getWeeklySolvedQuestionsData() {
    const weeklyCounts = Array(7).fill(0);
    if (!state.currentUser) return weeklyCounts;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    try {
        const sessionsCollection = collection(db, 'users', state.currentUser.uid, 'sessions');
        const q = query(sessionsCollection, where("createdAt", ">=", sevenDaysAgo));
        
        const querySnapshot = await getDocs(q);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        querySnapshot.forEach(doc => {
            const session = doc.data();
            if (!session.createdAt) return;

            const sessionDate = session.createdAt.toDate();
            sessionDate.setHours(0, 0, 0, 0);

            const timeDiff = today.getTime() - sessionDate.getTime();
            const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
            
            const index = 6 - dayDiff;

            if (index >= 0 && index < 7) {
                weeklyCounts[index] += session.totalQuestions || 0;
            }
        });

    } catch (error) {
        console.error("Erro ao buscar dados de atividades da semana:", error);
    }
    
    return weeklyCounts;
}


export async function fetchAllQuestions() {
    try {
        const querySnapshot = await getDocs(collection(db, "questions"));
        state.allQuestions = [];
        const materiaMap = new Map();

        querySnapshot.forEach((doc) => {
            const question = { id: doc.id, ...doc.data() };
            state.allQuestions.push(question);

            if (question.materia && question.assunto) {
                if (!materiaMap.has(question.materia)) {
                    materiaMap.set(question.materia, new Set());
                }
                materiaMap.get(question.materia).add(question.assunto);
            }
        });

        state.filterOptions.materia = [];
        const allAssuntosSet = new Set();
        for (const [materia, assuntosSet] of materiaMap.entries()) {
            const assuntos = Array.from(assuntosSet).sort();
            state.filterOptions.materia.push({ name: materia, assuntos: assuntos });
            assuntos.forEach(assunto => allAssuntosSet.add(assunto));
        }
        state.filterOptions.materia.sort((a, b) => a.name.localeCompare(b.name));
        state.filterOptions.allAssuntos = Array.from(allAssuntosSet).sort();

    } catch (error) {
        console.error("Erro ao buscar questões: ", error);
    }
}

export async function getQuestionHistory(questionIds) {
    if (!state.currentUser || questionIds.length === 0) {
        return { totalCorrect: 0, totalIncorrect: 0, statsByMateria: {} };
    }

    let totalCorrect = 0;
    let totalIncorrect = 0;
    const statsByMateria = {};

    const historyPromises = questionIds.map(id => getDoc(doc(db, 'users', state.currentUser.uid, 'questionHistory', id)));
    const historySnapshots = await Promise.all(historyPromises);

    const questionDetails = questionIds.map(id => state.allQuestions.find(q => q.id === id)).filter(Boolean);

    historySnapshots.forEach((snap, index) => {
        const question = questionDetails[index];
        if (snap.exists() && question) {
            const data = snap.data();
            const correct = data.correct || 0;
            const incorrect = data.incorrect || 0;
            totalCorrect += correct;
            totalIncorrect += incorrect;
            
            if (correct > 0 || incorrect > 0) {
                if (!statsByMateria[question.materia]) {
                    statsByMateria[question.materia] = { correct: 0, total: 0, assuntos: {} };
                }
                 if(!statsByMateria[question.materia].assuntos[question.assunto]) {
                    statsByMateria[question.materia].assuntos[question.assunto] = { correct: 0, total: 0 };
                }

                statsByMateria[question.materia].correct += correct;
                statsByMateria[question.materia].total += correct + incorrect;
                statsByMateria[question.materia].assuntos[question.assunto].correct += correct;
                statsByMateria[question.materia].assuntos[question.assunto].total += correct + incorrect;
            }
        }
    });

    return { totalCorrect, totalIncorrect, statsByMateria };
}

// --- FUNÇÕES DE ESCRITA (WRITE) ---

export async function saveSessionStats() {
    if (!state.currentUser || state.sessionStats.length === 0) return;
    
    const total = state.sessionStats.length;
    const correct = state.sessionStats.filter(s => s.isCorrect).length;
    
    const statsByMateria = state.sessionStats.reduce((acc, stat) => {
        if (!acc[stat.materia]) acc[stat.materia] = { correct: 0, total: 0 };
        acc[stat.materia].total++;
        if (stat.isCorrect) acc[stat.materia].correct++;
        return acc;
    }, {});

    const sessionData = {
        createdAt: serverTimestamp(),
        totalQuestions: total,
        correctCount: correct,
        details: statsByMateria
    };

    try {
        const sessionsCollection = collection(db, 'users', state.currentUser.uid, 'sessions');
        await addDoc(sessionsCollection, sessionData);
    } catch (error) {
        console.error("Erro ao salvar a sessão:", error);
    }
}


export async function saveUserAnswer(questionId, userAnswer, isCorrect) {
    if (!state.currentUser) return;
    const answerRef = doc(db, 'users', state.currentUser.uid, 'userQuestionState', questionId);
    try {
        await setDoc(answerRef, { userAnswer, isCorrect });
    } catch (error) {
        console.error("Error saving user answer:", error);
    }
}

export async function updateQuestionHistory(questionId, isCorrect) {
    if (!state.currentUser) return;
    const historyRef = doc(db, 'users', state.currentUser.uid, 'questionHistory', questionId);
    const fieldToUpdate = isCorrect ? 'correct' : 'incorrect';
    
    try {
        await setDoc(historyRef, {
            [fieldToUpdate]: increment(1),
            total: increment(1)
        }, { merge: true });
    } catch (error) {
        console.error("Error updating question history:", error);
    }
}

export async function setSrsReviewItem(questionId, reviewData) {
    if (!state.currentUser) return;
    const reviewRef = doc(db, 'users', state.currentUser.uid, 'reviewItems', questionId);
    await setDoc(reviewRef, reviewData, { merge: true });
}

export async function createOrUpdateName(type, name, editingId, folderId = null) {
    const collectionPath = type === 'folder' ? 'folders' : 'cadernos';
    if (editingId) { // Editando
        const itemRef = doc(db, 'users', state.currentUser.uid, collectionPath, editingId);
        await updateDoc(itemRef, { name: name });
    } else { // Criando
        const data = { name: name, createdAt: serverTimestamp() };
        if (type === 'caderno') {
            data.folderId = folderId;
            data.questionIds = [];
        }
        const collectionRef = collection(db, 'users', state.currentUser.uid, collectionPath);
        await addDoc(collectionRef, data);
    }
}

export async function createCaderno(name, folderId, questionIds) {
    const caderno = {
        name: name,
        questionIds: questionIds || [],
        folderId: folderId || null,
        createdAt: serverTimestamp()
    };
    const cadernosCollection = collection(db, 'users', state.currentUser.uid, 'cadernos');
    await addDoc(cadernosCollection, caderno);
}

export async function saveCadernoState(cadernoId, questionIndex) {
    if (!state.currentUser || !cadernoId) return;
    const stateRef = doc(db, 'users', state.currentUser.uid, 'cadernoState', cadernoId);
    try {
        await setDoc(stateRef, { lastQuestionIndex: questionIndex });
    } catch (error) {
        console.error("Error saving caderno state:", error);
    }
}

export async function addQuestionsToCaderno(cadernoId, newQuestionIds) {
    if (newQuestionIds.length > 0) {
        const cadernoRef = doc(db, 'users', state.currentUser.uid, 'cadernos', cadernoId);
        await updateDoc(cadernoRef, {
            questionIds: arrayUnion(...newQuestionIds)
        });
    }
}

export async function removeQuestionFromCaderno(cadernoId, questionId) {
    const cadernoRef = doc(db, 'users', state.currentUser.uid, 'cadernos', cadernoId);
    await updateDoc(cadernoRef, {
        questionIds: arrayRemove(questionId)
    });
}

// --- FUNÇÕES DE EXCLUSÃO (DELETE) ---

export async function deleteItem(type, id) {
    if (!state.currentUser) return;
    if (type === 'folder') {
        const batch = writeBatch(db);
        const cadernosToDelete = state.userCadernos.filter(c => c.folderId === id);
        cadernosToDelete.forEach(caderno => {
            const cadernoRef = doc(db, 'users', state.currentUser.uid, 'cadernos', caderno.id);
            batch.delete(cadernoRef);
        });
        const folderRef = doc(db, 'users', state.currentUser.uid, 'folders', id);
        batch.delete(folderRef);
        await batch.commit();
    } else if (type === 'caderno') {
        const cadernoRef = doc(db, 'users', state.currentUser.uid, 'cadernos', id);
        await deleteDoc(cadernoRef);
    } else if (type === 'filter') {
        const filterRef = doc(db, 'users', state.currentUser.uid, 'filtros', id);
        await deleteDoc(filterRef);
    }
}

export async function resetAllUserData() {
    if (!state.currentUser) return;
    const collectionsToDelete = ['questionHistory', 'reviewItems', 'userQuestionState', 'cadernoState', 'sessions'];

    for (const collectionName of collectionsToDelete) {
        const collectionRef = collection(db, 'users', state.currentUser.uid, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        if (snapshot.empty) continue;

        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    }
}

export async function saveFilter(name, filters) {
    const filtro = { name, ...filters };
    const filtrosCollection = collection(db, 'users', state.currentUser.uid, 'filtros');
    await addDoc(filtrosCollection, filtro);
}

export async function deleteFilter(id) {
    await deleteDoc(doc(db, 'users', state.currentUser.uid, 'filtros', id));
}

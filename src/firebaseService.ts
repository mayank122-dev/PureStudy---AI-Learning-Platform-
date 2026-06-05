import { 
  doc, setDoc, deleteDoc, getDoc, getDocs, collection, query, 
  where, updateDoc, writeBatch, serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { UserProfile, SavedDoubt, GeneratedNote, PlannerTask, QuizAttempt, Quiz } from './types';

// --- PROFILE SERVICE ---

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const d = await getDoc(doc(db, 'users', userId));
    if (d.exists()) {
      return d.data() as UserProfile;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  const path = `users/${userId}`;
  try {
    await setDoc(doc(db, 'users', userId), data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// --- NOTES SERVICE ---

export async function getUserNotes(userId: string): Promise<GeneratedNote[]> {
  const path = `users/${userId}/notes`;
  try {
    const qSnap = await getDocs(collection(db, 'users', userId, 'notes'));
    const list: GeneratedNote[] = [];
    qSnap.forEach(d => {
      list.push(d.data() as GeneratedNote);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveUserNote(userId: string, note: GeneratedNote): Promise<void> {
  const path = `users/${userId}/notes/${note.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'notes', note.id), note);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteUserNote(userId: string, noteId: string): Promise<void> {
  const path = `users/${userId}/notes/${noteId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'notes', noteId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// --- DOUBTS SERVICE ---

export async function getUserDoubts(userId: string): Promise<SavedDoubt[]> {
  const path = `users/${userId}/doubts`;
  try {
    const qSnap = await getDocs(collection(db, 'users', userId, 'doubts'));
    const list: SavedDoubt[] = [];
    qSnap.forEach(d => {
      list.push(d.data() as SavedDoubt);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveUserDoubt(userId: string, doubt: SavedDoubt): Promise<void> {
  const path = `users/${userId}/doubts/${doubt.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'doubts', doubt.id), doubt);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteUserDoubt(userId: string, doubtId: string): Promise<void> {
  const path = `users/${userId}/doubts/${doubtId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'doubts', doubtId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// --- TASKS SERVICE ---

export async function getUserTasks(userId: string): Promise<PlannerTask[]> {
  const path = `users/${userId}/tasks`;
  try {
    const qSnap = await getDocs(collection(db, 'users', userId, 'tasks'));
    const list: PlannerTask[] = [];
    qSnap.forEach(d => {
      list.push(d.data() as PlannerTask);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveUserTask(userId: string, task: PlannerTask): Promise<void> {
  const path = `users/${userId}/tasks/${task.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'tasks', task.id), task);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteUserTask(userId: string, taskId: string): Promise<void> {
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'tasks', taskId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// --- QUIZ ATTEMPTS SERVICE ---

export async function getUserQuizAttempts(userId: string): Promise<QuizAttempt[]> {
  const path = `users/${userId}/quizAttempts`;
  try {
    const qSnap = await getDocs(collection(db, 'users', userId, 'quizAttempts'));
    const list: QuizAttempt[] = [];
    qSnap.forEach(d => {
      list.push(d.data() as QuizAttempt);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveUserQuizAttempt(userId: string, attempt: QuizAttempt): Promise<void> {
  const path = `users/${userId}/quizAttempts/${attempt.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'quizAttempts', attempt.id), attempt);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteUserQuizAttempt(userId: string, attemptId: string): Promise<void> {
  const path = `users/${userId}/quizAttempts/${attemptId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'quizAttempts', attemptId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// --- FAVORITE FORMULAS ---

export async function getUserFormulaFavorites(userId: string): Promise<string[]> {
  const path = `users/${userId}/formulaFavorites`;
  try {
    const qSnap = await getDocs(collection(db, 'users', userId, 'formulaFavorites'));
    const list: string[] = [];
    qSnap.forEach(d => {
      const data = d.data();
      if (data.isFavorite) {
        list.push(d.id);
      }
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveUserFormulaFavorite(userId: string, formulaId: string, isFavorite: boolean): Promise<void> {
  const path = `users/${userId}/formulaFavorites/${formulaId}`;
  try {
    await setDoc(doc(db, 'users', userId, 'formulaFavorites', formulaId), {
      formulaId,
      isFavorite,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// --- GLOBAL PLATFORM QUIZZES ---

export async function getGlobalQuizzes(): Promise<Quiz[]> {
  const path = 'quizzes';
  try {
    const qSnap = await getDocs(collection(db, 'quizzes'));
    const list: Quiz[] = [];
    qSnap.forEach(d => {
      list.push(d.data() as Quiz);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveGlobalQuiz(quiz: Quiz): Promise<void> {
  const path = `quizzes/${quiz.id}`;
  try {
    await setDoc(doc(db, 'quizzes', quiz.id), quiz);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteGlobalQuiz(quizId: string): Promise<void> {
  const path = `quizzes/${quizId}`;
  try {
    await deleteDoc(doc(db, 'quizzes', quizId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// --- GLOBAL USER PROFILES (For Admin) ---

export async function getAllUserProfiles(): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const qSnap = await getDocs(collection(db, 'users'));
    const list: UserProfile[] = [];
    qSnap.forEach(d => {
      list.push(d.data() as UserProfile);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

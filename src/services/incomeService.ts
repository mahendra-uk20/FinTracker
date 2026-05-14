import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  FirestoreError
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Income } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const COLLECTION_NAME = 'income';

export const addIncome = async (income: Omit<Income, 'id' | 'userId' | 'createdAt'>) => {
  if (!auth.currentUser) throw new Error('User not authenticated');
  
  const path = COLLECTION_NAME;
  try {
    const docRef = await addDoc(collection(db, path), {
      ...income,
      userId: auth.currentUser.uid,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateIncome = async (id: string, updates: Partial<Omit<Income, 'id' | 'userId' | 'createdAt'>>) => {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteIncome = async (id: string) => {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const subscribeToIncome = (callback: (incomeList: Income[]) => void) => {
  if (!auth.currentUser) return () => {};

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', auth.currentUser.uid),
    orderBy('date', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const incomeList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Income));
    callback(incomeList);
  }, (error: FirestoreError) => {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  });
};

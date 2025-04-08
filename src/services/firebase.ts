import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';

// Authentication functions
export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
  return firebaseSignOut(auth);
};

export const resetPassword = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

export const updateProfile = async (updates: { displayName?: string; photoURL?: string }) => {
  if (!auth.currentUser) throw new Error('No user logged in');
  return updateFirebaseProfile(auth.currentUser, updates);
};

export const uploadProfilePicture = async (file: File) => {
  if (!auth.currentUser) throw new Error('No user logged in');
  const storageRef = ref(storage, `profile-pictures/${auth.currentUser.uid}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url };
};

// Challenge functions
export const getChallenges = async () => {
  const challengesCollection = collection(db, 'challenges');
  const snapshot = await getDocs(challengesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createChallenge = async (challenge: any) => {
  if (!auth.currentUser) throw new Error('Must be logged in to create challenges');
  const challengesCollection = collection(db, 'challenges');
  const docRef = await addDoc(challengesCollection, {
    ...challenge,
    createdBy: auth.currentUser.uid,
    createdAt: new Date(),
  });
  return { id: docRef.id };
};

export const updateChallenge = async (id: string, updates: any) => {
  const challengeRef = doc(db, 'challenges', id);
  await updateDoc(challengeRef, updates);
};

export const deleteChallenge = async (id: string) => {
  const challengeRef = doc(db, 'challenges', id);
  await deleteDoc(challengeRef);
}; 
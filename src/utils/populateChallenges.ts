import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { challengesBackup } from '../data/challengesBackup';
import { Challenge } from '../types/challenge';

export const populateChallenges = async () => {
  try {
    console.log('Starting to populate challenges...');
    
    // Delete existing challenges
    const challengesRef = collection(db, 'challenges');
    const snapshot = await getDocs(challengesRef);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log('Deleted existing challenges');

    // Add new challenges
    console.log(`Adding ${challengesBackup.length} challenges...`);
    const addPromises = challengesBackup.map(challenge => {
      const challengeRef = doc(challengesRef, challenge.id);
      return setDoc(challengeRef, challenge);
    });

    await Promise.all(addPromises);
    console.log('Successfully populated challenges in Firestore');
  } catch (error) {
    console.error('Error populating challenges:', error);
    throw error;
  }
}; 
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { initialChallenges } from '../data/initialChallenges';
import { toast } from 'react-toastify';

export const populateFirestore = async () => {
  try {
    console.log('Starting Firestore population check...');
    
    // Check if challenges already exist
    const challengesRef = collection(db, 'challenges');
    console.log('Checking for existing challenges...');
    
    const q = query(challengesRef, where('title', '==', initialChallenges[0].title));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      console.log('Challenges already exist in Firestore');
      return;
    }

    console.log('No existing challenges found. Adding initial challenges...');
    
    // Add each challenge to Firestore
    const addPromises = initialChallenges.map(challenge => {
      console.log(`Adding challenge: ${challenge.title}`);
      return addDoc(collection(db, 'challenges'), challenge);
    });

    await Promise.all(addPromises);
    console.log('Successfully populated Firestore with initial challenges');
    toast.success('Successfully loaded initial challenges');
  } catch (error: any) {
    console.error('Error populating Firestore:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    
    // Check for specific Firebase errors
    if (error.code === 'permission-denied') {
      toast.error('Permission denied. Please check Firestore security rules.');
    } else if (error.code === 'not-found') {
      toast.error('Firestore database not found. Please check your Firebase configuration.');
    } else {
      toast.error(`Failed to populate challenges: ${error.message}`);
    }
    throw error;
  }
}; 
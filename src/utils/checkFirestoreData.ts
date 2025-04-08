import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const checkFirestoreData = async () => {
  try {
    const challengesRef = collection(db, 'challenges');
    const querySnapshot = await getDocs(challengesRef);
    
    console.log('Total challenges in Firestore:', querySnapshot.size);
    
    querySnapshot.forEach((doc) => {
      console.log('Challenge:', doc.id, doc.data());
    });
    
    return querySnapshot.size;
  } catch (error) {
    console.error('Error checking Firestore data:', error);
    throw error;
  }
}; 
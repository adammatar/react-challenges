import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { challengesBackup } from './src/data/challengesBackup.js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccount = resolve(__dirname, 'reactchallenges-firebase-adminsdk-fbsvc-f6971dc834.json');
const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

const populateChallenges = async () => {
  try {
    console.log('Starting to populate challenges...');
    
    // Delete existing challenges
    const challengesRef = db.collection('challenges');
    const snapshot = await challengesRef.get();
    const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);
    console.log('Deleted existing challenges');

    // Add new challenges
    const addPromises = challengesBackup.map(challenge => {
      const challengeRef = challengesRef.doc(challenge.id);
      return challengeRef.set(challenge);
    });

    await Promise.all(addPromises);
    console.log('Successfully populated challenges in Firestore');
    process.exit(0);
  } catch (error) {
    console.error('Error populating challenges:', error);
    process.exit(1);
  }
};

populateChallenges(); 
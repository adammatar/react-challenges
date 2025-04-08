const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteChallenge(challengeId) {
  try {
    await db.collection('challenges').doc(challengeId).delete();
    console.log(`Successfully deleted challenge ${challengeId}`);
  } catch (error) {
    console.error('Error deleting challenge:', error);
  } finally {
    admin.app().delete();
  }
}

// Delete the findMaximumSubarray challenge
deleteChallenge('findMaximumSubarray'); 
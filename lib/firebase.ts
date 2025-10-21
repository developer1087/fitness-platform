import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// React Native Firebase is automatically configured via google-services.json
// No need for manual initialization like web Firebase

// Export Firebase services
export { auth, firestore as db, storage };

// For compatibility with existing code that imports 'auth'
export default auth;
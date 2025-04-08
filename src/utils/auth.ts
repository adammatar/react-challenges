import { User } from 'firebase/auth';
import { SerializableUser } from '../store/slices/authSlice';

export const toSerializableUser = (user: User, isAdmin: boolean = false): SerializableUser => {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    isAdmin,
  };
}; 
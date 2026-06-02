import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface AuthError {
  code: string;
  message: string;
}

export const registerUser = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    // Update profile
    await updateProfile(user, { displayName });

    // Create Firestore user document
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName,
      avatar: '🧑',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      settings: {
        theme: 'dark',
        accentColor: '#f093fb',
        reminderTime: '08:00',
        weekStartsOn: 1,
        notificationsEnabled: false,
        autoMissAfterMidnight: true,
        schemaVersion: 1,
      },
    });

    return user;
  } catch (error: any) {
    throw mapAuthError(error);
  }
};

export const signInUser = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);

    // Update last login
    await setDoc(
      doc(db, 'users', user.uid),
      { lastLoginAt: serverTimestamp() },
      { merge: true }
    );

    return user;
  } catch (error: any) {
    throw mapAuthError(error);
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw mapAuthError(error);
  }
};

const mapAuthError = (error: any): AuthError => {
  const code = error.code || 'unknown';
  let message = 'An error occurred. Please try again.';

  switch (code) {
    case 'auth/email-already-in-use':
      message = 'An account with this email already exists';
      break;
    case 'auth/weak-password':
      message = 'Password must be at least 8 characters';
      break;
    case 'auth/invalid-email':
      message = 'Invalid email address';
      break;
    case 'auth/user-not-found':
      message = 'No account found with this email';
      break;
    case 'auth/wrong-password':
      message = 'Incorrect password';
      break;
    case 'auth/too-many-requests':
      message = 'Too many attempts. Try again later.';
      break;
    case 'auth/operation-not-allowed':
      message = 'This operation is not allowed';
      break;
    case 'auth/invalid-credential':
      message = 'Invalid email or password';
      break;
    default:
      message = error.message || 'An error occurred';
  }

  return { code, message };
};

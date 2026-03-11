import { getFirebaseDb, getFirebaseStorage } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import type { User as AuthUser } from 'firebase/auth';
import { updateProfile } from 'firebase/auth';
import type { User } from '../types';

export const uploadImage = async (file: File, path: string): Promise<string> => {
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, path);
  const uploadTask = await uploadBytesResumable(storageRef, file);
  return await getDownloadURL(uploadTask.ref);
};

export const syncUserToFirestore = async (authUser: AuthUser, additionalData?: Partial<User>): Promise<User> => {
  const db = getFirebaseDb();
  const userRef = doc(db, 'users', authUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const newUser: User = {
      id: authUser.uid,
      email: authUser.email || '',
      displayName: authUser.displayName || 'User',
      photoURL: authUser.photoURL || '',
      universityId: '',
      campusId: '',
      isVerifiedStudent: false,
      trustScore: 0,
      createdAt: new Date().toISOString(),
      role: 'user',
      ...additionalData,
    };
    await setDoc(userRef, newUser);
    return newUser;
  }
  
  if (additionalData) {
    await updateDoc(userRef, additionalData);
    return { ...userSnap.data(), ...additionalData } as User;
  }

  return userSnap.data() as User;
};

export const updateUserProfileImage = async (authUser: AuthUser, file: File): Promise<string> => {
  const path = `profiles/${authUser.uid}/${Date.now()}_${file.name}`;
  const photoURL = await uploadImage(file, path);
  
  await updateProfile(authUser, { photoURL });
  
  const db = getFirebaseDb();
  await updateDoc(doc(db, 'users', authUser.uid), { photoURL });
  
  return photoURL;
};

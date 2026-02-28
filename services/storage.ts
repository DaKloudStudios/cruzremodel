
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadTimeClockPhoto = async (file: File, userId: string): Promise<string> => {
  try {
    const timestamp = Date.now();
    const storageRef = ref(storage, `time-clock/${userId}/${timestamp}_${file.name}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading photo:", error);
    throw new Error("Failed to upload photo. Please try again.");
  }
};

export const uploadBusinessLogo = async (file: File): Promise<string> => {
  try {
    const timestamp = Date.now();
    // Save to a public-accessible business folder
    const storageRef = ref(storage, `business/logo_${timestamp}_${file.name}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading logo:", error);
    throw new Error("Failed to upload logo.");
  }
};

export const uploadUserProfilePhoto = async (file: File, userId: string): Promise<string> => {
  try {
    const timestamp = Date.now();
    const storageRef = ref(storage, `users/${userId}/profile_${timestamp}_${file.name}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    throw new Error("Failed to upload profile photo.");
  }
};
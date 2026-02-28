declare module 'firebase/app' {
    export const initializeApp: any;
}
declare module 'firebase/auth' {
    export const getAuth: any;
    export const GoogleAuthProvider: any;
    export const signInWithPopup: any;
    export const signOut: any;
    export const onAuthStateChanged: any;
    export type User = any;
}
declare module 'firebase/firestore' {
    export const getFirestore: any;
    export const doc: any;
    export const getDoc: any;
    export const setDoc: any;
    export const addDoc: any;
    export const updateDoc: any;
    export const deleteDoc: any;
    export const collection: any;
    export const query: any;
    export const where: any;
    export const limit: any;
    export const orderBy: any;
    export const onSnapshot: any;
    export const Timestamp: any;
    export const getDocs: any;
    export const writeBatch: any;
}
declare module 'firebase/storage' {
    export const getStorage: any;
    export const ref: any;
    export const uploadBytesResumable: any;
    export const getDownloadURL: any;
    export const listAll: any;
    export const deleteObject: any;
}
declare module '@react-google-maps/api' { export const useJsApiLoader: any; export const GoogleMap: any; export const DirectionsRenderer: any; } declare module '@google/genai' { export const GoogleGenAI: any; }

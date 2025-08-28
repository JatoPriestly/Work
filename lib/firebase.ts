// Firebase configuration and initialization
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyAKy32t3h5bIC0T--o56m982hmeFBEbk0U",
  authDomain: "martinez-4ab8d.firebaseapp.com",
  projectId: "martinez-4ab8d",
  storageBucket: "martinez-4ab8d.firebasestorage.app",
  messagingSenderId: "79056089461",
  appId: "1:79056089461:web:e25bb5bf9b462e83ebe33c",
  measurementId: "G-W17EK3Z35K",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
export const db = getFirestore(app)

// Initialize Storage for selfie images
export const storage = getStorage(app)

export const auth = getAuth(app)

export default app

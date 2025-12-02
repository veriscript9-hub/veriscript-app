// VeriScript Firebase Configuration
// Replace these with your actual Firebase credentials

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized');
} catch (error) {
  console.error('❌ Firebase error:', error);
}

// OpenAI API Key (Optional)
const OPENAI_API_KEY = "YOUR_OPENAI_KEY";

console.log('✅ Config loaded');

// VeriScript Firebase Configuration
// Replace these with your actual Firebase credentials

const firebaseConfig = {
  apiKey: "AIzaSyD7kjkyqlCBrg9DzFQt81I2v6gI7LkB3F0",
  authDomain: "veriscript-app.firebaseapp.com",
  projectId: "veriscript-app",
  storageBucket: "veriscript-app.firebasestorage.app",
  messagingSenderId: "100481319114",
  appId: "1:100481319114:web:2457af8f628cc759a2f433",
  measurementId: "G-VH5D8E1ZV0"
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

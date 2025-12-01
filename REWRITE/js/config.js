// Firebase Configuration
// Replace these values with your actual Firebase project credentials

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// OpenAI Configuration (for Voice Dictation)
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY_HERE";

// App Configuration
const APP_CONFIG = {
  appName: "VeriScript",
  appVersion: "1.0.0",
  supportEmail: "support@veriscript.in",
  supportPhone: "+91-XXXXXXXXXX",
  
  // Features
  features: {
    voiceDictation: true,
    qrCode: true,
    analytics: true,
    multiLanguage: false, // Coming soon
    offlineMode: false // Coming soon
  },
  
  // Pricing Plans
  plans: {
    free: {
      name: "Free",
      price: 0,
      prescriptionsPerMonth: 10,
      voiceMinutesPerMonth: 10,
      features: ["Basic features", "Email support"]
    },
    basic: {
      name: "Basic",
      price: 299,
      prescriptionsPerMonth: 100,
      voiceMinutesPerMonth: 100,
      features: ["Analytics dashboard", "Priority support", "Voice dictation"]
    },
    pro: {
      name: "Pro",
      price: 599,
      prescriptionsPerMonth: -1, // Unlimited
      voiceMinutesPerMonth: -1, // Unlimited
      features: ["Unlimited prescriptions", "Unlimited voice", "Advanced analytics", "API access", "24/7 support"]
    },
    enterprise: {
      name: "Enterprise",
      price: 999,
      prescriptionsPerMonth: -1,
      voiceMinutesPerMonth: -1,
      features: ["Multi-doctor support", "White-label option", "Custom integrations", "Dedicated account manager"]
    }
  },
  
  // Voice Dictation Settings
  voice: {
    language: "en-IN", // Indian English
    continuous: true,
    interimResults: true,
    maxAlternatives: 1,
    
    // AI Processing
    aiModel: "gpt-4",
    aiTemperature: 0.1,
    
    // Speech Recognition
    speechProvider: "web", // "web" or "google" or "openai"
    
    // Costs (for tracking)
    costPerMinute: {
      web: 0, // Free
      google: 0.024, // ₹0.024 per minute
      openai: 0.50 // ₹0.50 per minute
    }
  },
  
  // Medicine Database (Sample - expand as needed)
  commonMedicines: [
    "Paracetamol 500mg",
    "Paracetamol 650mg",
    "Ibuprofen 400mg",
    "Amoxicillin 500mg",
    "Azithromycin 500mg",
    "Metformin 500mg",
    "Metformin 850mg",
    "Glimepiride 1mg",
    "Glimepiride 2mg",
    "Atorvastatin 10mg",
    "Atorvastatin 20mg",
    "Amlodipine 5mg",
    "Losartan 50mg",
    "Omeprazole 20mg",
    "Pantoprazole 40mg",
    "Cetirizine 10mg",
    "Montelukast 10mg",
    "Salbutamol Inhaler",
    "Insulin Glargine",
    "Aspirin 75mg"
  ],
  
  // Specializations
  specializations: [
    "General Physician",
    "Cardiologist",
    "Dermatologist",
    "Pediatrician",
    "Orthopedic",
    "Gynecologist",
    "Neurologist",
    "Psychiatrist",
    "ENT Specialist",
    "Ophthalmologist",
    "Dentist",
    "Urologist",
    "Gastroenterologist",
    "Endocrinologist",
    "Pulmonologist",
    "Nephrologist",
    "Oncologist",
    "Rheumatologist",
    "Anesthesiologist",
    "Radiologist"
  ],
  
  // Frequencies
  frequencies: [
    "Once daily",
    "Twice daily",
    "Thrice daily",
    "Four times daily",
    "Every 4 hours",
    "Every 6 hours",
    "Every 8 hours",
    "Every 12 hours",
    "As needed",
    "Before sleep",
    "Weekly",
    "Monthly"
  ],
  
  // Timings
  timings: [
    "Before meals",
    "After meals",
    "With meals",
    "Empty stomach",
    "Before sleep",
    "Morning only",
    "Evening only",
    "Anytime"
  ],
  
  // Durations
  durations: [
    "3 days",
    "5 days",
    "7 days",
    "10 days",
    "14 days",
    "21 days",
    "1 month",
    "2 months",
    "3 months",
    "6 months",
    "Continuous",
    "As needed"
  ]
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { firebaseConfig, APP_CONFIG, OPENAI_API_KEY };
}

console.log("✅ VeriScript Config Loaded");

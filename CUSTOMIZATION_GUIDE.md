# 🎨 VeriScript - Complete Customization Guide

## 📋 **OVERVIEW**

This guide covers everything you need to customize VeriScript for your brand, including:
- ✅ Branding & Identity
- ✅ Color Schemes
- ✅ Custom Features
- ✅ API Integrations
- ✅ White-Label Solutions

---

## 🎨 **PART 1: BRANDING CUSTOMIZATION**

### **1.1 Update App Identity**

**File:** `mobile-app/js/branding.js`

```javascript
// Change app name and tagline
brandingManager.set('appName', 'Your Clinic Name');
brandingManager.set('appTagline', 'Your custom tagline');
brandingManager.set('appDescription', 'Your app description');

// Update company info
brandingManager.set('companyName', 'Your Company');
brandingManager.set('companyWebsite', 'https://yourwebsite.com');
brandingManager.set('companyEmail', 'support@yourcompany.com');
brandingManager.set('companyPhone', '+91-1234567890');
```

### **1.2 Change Colors**

**Method 1: Using Branding Manager**
```javascript
// Update primary color
brandingManager.set('colors.primary', '#your-color');
brandingManager.set('colors.primaryDark', '#your-dark-color');
brandingManager.set('colors.primaryLight', '#your-light-color');

// Update secondary color
brandingManager.set('colors.secondary', '#your-secondary');

// Update accent colors
brandingManager.set('colors.success', '#10b981');
brandingManager.set('colors.error', '#ef4444');
brandingManager.set('colors.warning', '#f59e0b');
```

**Method 2: Direct CSS Variables**

Update `mobile-app/css/variables.css`:
```css
:root {
  /* Your Brand Colors */
  --primary: #your-primary-color;
  --primary-dark: #your-primary-dark;
  --primary-light: #your-primary-light;
  --secondary: #your-secondary-color;
  
  /* Accent Colors */
  --success: #your-success-color;
  --error: #your-error-color;
  --warning: #your-warning-color;
  --info: #your-info-color;
}
```

### **1.3 Popular Color Schemes**

**Medical Blue:**
```javascript
brandingManager.set('colors.primary', '#0ea5e9');
brandingManager.set('colors.secondary', '#0284c7');
```

**Healthcare Green:**
```javascript
brandingManager.set('colors.primary', '#10b981');
brandingManager.set('colors.secondary', '#059669');
```

**Professional Purple:**
```javascript
brandingManager.set('colors.primary', '#8b5cf6');
brandingManager.set('colors.secondary', '#7c3aed');
```

**Trust Blue:**
```javascript
brandingManager.set('colors.primary', '#3b82f6');
brandingManager.set('colors.secondary', '#2563eb');
```

### **1.4 Update Logo & Icons**

**Replace Logo:**
```javascript
// Update logo path
brandingManager.set('logo', '/assets/your-logo.png');
brandingManager.set('favicon', '/assets/your-favicon.png');
```

**Generate PWA Icons:**
```bash
# Use online tool: https://realfavicongenerator.net/
# Upload your logo and download icon pack
# Replace files in mobile-app/assets/icons/
```

**Required Icon Sizes:**
- 72x72, 96x96, 128x128, 144x144, 152x152
- 192x192, 384x384, 512x512

### **1.5 Change Fonts**

```javascript
// Update fonts
brandingManager.set('fonts.primary', "'Poppins', sans-serif");
brandingManager.set('fonts.secondary', "'Roboto', sans-serif");

// Add Google Fonts
// Add to <head> in HTML files:
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### **1.6 Export/Import Branding**

**Export Current Branding:**
```javascript
const brandingJSON = brandingManager.export();
console.log(brandingJSON);
// Copy and save to file
```

**Import Branding:**
```javascript
const brandingConfig = `{
  "appName": "Your Clinic",
  "colors": {
    "primary": "#0ea5e9"
  }
}`;

brandingManager.import(brandingConfig);
```

---

## 🔌 **PART 2: API INTEGRATIONS**

### **2.1 SMS Integration**

**Twilio Setup:**
```javascript
// Enable SMS
apiIntegrations.enableIntegration('sms');

// Configure Twilio
apiIntegrations.setConfig('sms', 'twilio', {
  accountSid: 'YOUR_ACCOUNT_SID',
  authToken: 'YOUR_AUTH_TOKEN',
  fromNumber: '+1234567890'
});

// Send SMS
await apiIntegrations.sendSMS('+919876543210', 'Your prescription is ready!');
```

**MSG91 Setup (India):**
```javascript
apiIntegrations.setConfig('sms', 'msg91', {
  authKey: 'YOUR_AUTH_KEY',
  senderId: 'YOUR_SENDER_ID'
});

// Change provider
apiIntegrations.integrations.sms.provider = 'msg91';
```

### **2.2 Email Integration**

**SendGrid Setup:**
```javascript
// Enable email
apiIntegrations.enableIntegration('email');

// Configure SendGrid
apiIntegrations.setConfig('email', 'sendgrid', {
  apiKey: 'YOUR_SENDGRID_API_KEY',
  fromEmail: 'noreply@yourcompany.com',
  fromName: 'Your Company'
});

// Send email
await apiIntegrations.sendEmail(
  'patient@example.com',
  'Your Prescription',
  '<h1>Your prescription is ready!</h1>'
);
```

### **2.3 Payment Integration**

**Razorpay Setup:**
```javascript
// Enable payments
apiIntegrations.enableIntegration('payment');

// Configure Razorpay
apiIntegrations.setConfig('payment', 'razorpay', {
  keyId: 'YOUR_RAZORPAY_KEY_ID',
  keySecret: 'YOUR_RAZORPAY_KEY_SECRET'
});

// Create payment order
const order = await apiIntegrations.createPaymentOrder(299, 'INR');

// Initialize Razorpay checkout
const options = {
  key: 'YOUR_RAZORPAY_KEY_ID',
  amount: order.data.amount,
  currency: 'INR',
  name: 'Your Company',
  description: 'Subscription Payment',
  order_id: order.data.id,
  handler: function(response) {
    console.log('Payment successful:', response);
  }
};

const rzp = new Razorpay(options);
rzp.open();
```

**Stripe Setup:**
```javascript
apiIntegrations.setConfig('payment', 'stripe', {
  publishableKey: 'YOUR_STRIPE_PUBLISHABLE_KEY',
  secretKey: 'YOUR_STRIPE_SECRET_KEY'
});

apiIntegrations.integrations.payment.provider = 'stripe';
```

### **2.4 Analytics Integration**

**Google Analytics:**
```javascript
// Enable analytics
apiIntegrations.enableIntegration('analytics', 'googleAnalytics');

// Configure
apiIntegrations.setConfig('analytics', 'googleAnalytics', {
  measurementId: 'G-XXXXXXXXXX'
});

// Add to HTML <head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>

// Track events
apiIntegrations.trackEvent('prescription_created', {
  doctor_id: 'doc123',
  patient_name: 'John Doe'
});
```

**Mixpanel:**
```javascript
apiIntegrations.enableIntegration('analytics', 'mixpanel');
apiIntegrations.setConfig('analytics', 'mixpanel', {
  token: 'YOUR_MIXPANEL_TOKEN'
});

// Add to HTML
<script src="https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js"></script>
<script>
  mixpanel.init('YOUR_MIXPANEL_TOKEN');
</script>
```

### **2.5 Cloud Storage Integration**

**Cloudinary Setup:**
```javascript
// Enable storage
apiIntegrations.enableIntegration('storage');

// Configure Cloudinary
apiIntegrations.setConfig('storage', 'cloudinary', {
  cloudName: 'YOUR_CLOUD_NAME',
  apiKey: 'YOUR_API_KEY',
  apiSecret: 'YOUR_API_SECRET'
});

// Upload file
const file = document.getElementById('fileInput').files[0];
const result = await apiIntegrations.uploadFile(file);

if (result.success) {
  console.log('File URL:', result.data.secure_url);
}
```

### **2.6 Medical API Integration**

**Drug Database:**
```javascript
// Enable medical APIs
apiIntegrations.enableIntegration('medical', 'drugDatabase');

// Search for drugs
const drugs = await apiIntegrations.searchDrug('paracetamol');
console.log(drugs.data);
```

**ICD-10 Codes:**
```javascript
apiIntegrations.enableIntegration('medical', 'icd10');

// Search diagnoses
const diagnoses = await apiIntegrations.searchICD10('diabetes');
console.log(diagnoses.data);
```

---

## 🎯 **PART 3: CUSTOM FEATURES**

### **3.1 Add Custom Prescription Fields**

**Update Prescription Form:**

Edit `mobile-app/pages/doctor/create-prescription.html`:

```html
<!-- Add after existing fields -->
<div class="form-group">
  <label for="bloodPressure">Blood Pressure</label>
  <input type="text" id="bloodPressure" placeholder="120/80">
</div>

<div class="form-group">
  <label for="temperature">Temperature (°F)</label>
  <input type="number" id="temperature" placeholder="98.6">
</div>

<div class="form-group">
  <label for="weight">Weight (kg)</label>
  <input type="number" id="weight" placeholder="70">
</div>
```

**Update Database Schema:**

```javascript
// In js/prescription.js - getFormData()
getFormData() {
  return {
    // ... existing fields
    vitals: {
      bloodPressure: document.getElementById('bloodPressure')?.value || '',
      temperature: document.getElementById('temperature')?.value || '',
      weight: document.getElementById('weight')?.value || ''
    }
  };
}
```

### **3.2 Add Appointment Booking**

**Create Appointment Module:**

```javascript
// js/appointments.js
class AppointmentManager {
  async createAppointment(data) {
    const appointment = {
      doctorId: authManager.getCurrentUser().uid,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      date: data.date,
      time: data.time,
      reason: data.reason,
      status: 'scheduled',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await firebase.firestore()
      .collection('appointments')
      .add(appointment);

    // Send SMS reminder
    await apiIntegrations.sendSMS(
      data.patientPhone,
      `Appointment confirmed for ${data.date} at ${data.time}`
    );

    return { success: true, id: docRef.id };
  }

  async getAppointments(doctorId, date) {
    const snapshot = await firebase.firestore()
      .collection('appointments')
      .where('doctorId', '==', doctorId)
      .where('date', '==', date)
      .orderBy('time')
      .get();

    const appointments = [];
    snapshot.forEach(doc => {
      appointments.push({ id: doc.id, ...doc.data() });
    });

    return appointments;
  }
}

const appointmentManager = new AppointmentManager();
```

### **3.3 Add Lab Reports**

**Lab Report Upload:**

```javascript
// js/lab-reports.js
class LabReportManager {
  async uploadReport(prescriptionId, file) {
    // Upload to cloud storage
    const upload = await apiIntegrations.uploadFile(file);

    if (!upload.success) {
      throw new Error('Upload failed');
    }

    // Save to Firestore
    await firebase.firestore()
      .collection('prescriptions')
      .doc(prescriptionId)
      .update({
        labReports: firebase.firestore.FieldValue.arrayUnion({
          url: upload.data.secure_url,
          filename: file.name,
          uploadedAt: new Date()
        })
      });

    return { success: true, url: upload.data.secure_url };
  }

  async getReports(prescriptionId) {
    const doc = await firebase.firestore()
      .collection('prescriptions')
      .doc(prescriptionId)
      .get();

    return doc.data()?.labReports || [];
  }
}

const labReportManager = new LabReportManager();
```

### **3.4 Add Video Consultation**

**Integrate Agora/Twilio Video:**

```javascript
// js/video-consultation.js
class VideoConsultationManager {
  constructor() {
    this.client = null;
    this.localStream = null;
  }

  async startConsultation(channelName) {
    // Initialize Agora client
    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

    // Join channel
    await this.client.join(
      'YOUR_APP_ID',
      channelName,
      null,
      authManager.getCurrentUser().uid
    );

    // Create local stream
    this.localStream = await AgoraRTC.createMicrophoneAndCameraTracks();

    // Publish stream
    await this.client.publish(this.localStream);

    // Listen for remote users
    this.client.on('user-published', async (user, mediaType) => {
      await this.client.subscribe(user, mediaType);
      
      if (mediaType === 'video') {
        const remoteVideoTrack = user.videoTrack;
        remoteVideoTrack.play('remote-video');
      }
    });

    return { success: true };
  }

  async endConsultation() {
    if (this.localStream) {
      this.localStream[0].close();
      this.localStream[1].close();
    }

    if (this.client) {
      await this.client.leave();
    }
  }
}

const videoConsultation = new VideoConsultationManager();
```

### **3.5 Add Prescription Templates**

```javascript
// js/prescription-templates.js
class TemplateManager {
  constructor() {
    this.templates = [
      {
        id: 'common-cold',
        name: 'Common Cold',
        diagnosis: 'Upper Respiratory Tract Infection',
        medicines: [
          {
            name: 'Paracetamol 500mg',
            frequency: 'Thrice daily',
            duration: '3 days',
            instructions: 'After meals'
          },
          {
            name: 'Cetirizine 10mg',
            frequency: 'Once daily',
            duration: '5 days',
            instructions: 'At bedtime'
          }
        ],
        notes: 'Rest and drink plenty of fluids'
      },
      {
        id: 'diabetes',
        name: 'Type 2 Diabetes',
        diagnosis: 'Type 2 Diabetes Mellitus',
        medicines: [
          {
            name: 'Metformin 500mg',
            frequency: 'Twice daily',
            duration: '30 days',
            instructions: 'After meals'
          }
        ],
        notes: 'Follow diabetic diet. Regular exercise recommended.'
      }
    ];
  }

  getTemplates() {
    return this.templates;
  }

  applyTemplate(templateId) {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) return;

    // Fill form with template data
    document.getElementById('diagnosis').value = template.diagnosis;
    document.getElementById('notes').value = template.notes;

    // Add medicines
    template.medicines.forEach(medicine => {
      prescriptionManager.addMedicine();
      // Fill medicine details
    });
  }
}

const templateManager = new TemplateManager();
```

---

## 🎨 **PART 4: UI CUSTOMIZATION**

### **4.1 Custom Dashboard Widgets**

```javascript
// Add to dashboard.html
<div class="widget-card">
  <h3>Today's Appointments</h3>
  <div id="todayAppointments">
    <!-- Appointments list -->
  </div>
</div>

<div class="widget-card">
  <h3>Pending Lab Reports</h3>
  <div id="pendingReports">
    <!-- Reports list -->
  </div>
</div>
```

### **4.2 Custom Prescription Layout**

**Create Custom PDF Template:**

```javascript
// In js/pdf-export.js
async exportCustomPrescription(prescription) {
  const doc = new jsPDF();

  // Add your clinic logo
  doc.addImage(brandingManager.get('logo'), 'PNG', 15, 10, 30, 30);

  // Custom header
  doc.setFontSize(20);
  doc.setTextColor(brandingManager.get('colors.primary'));
  doc.text(brandingManager.get('appName'), 50, 20);

  // Add custom fields
  doc.setFontSize(10);
  doc.text(`Clinic: ${brandingManager.get('companyName')}`, 50, 28);
  doc.text(`Phone: ${brandingManager.get('companyPhone')}`, 50, 34);

  // ... rest of prescription
}
```

### **4.3 Custom Email Templates**

```javascript
// Email template for prescription
const prescriptionEmailTemplate = (prescription) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .header { background: ${brandingManager.get('colors.primary')}; color: white; padding: 20px; }
    .content { padding: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${brandingManager.get('appName')}</h1>
  </div>
  <div class="content">
    <h2>Your Prescription</h2>
    <p>Dear ${prescription.patientName},</p>
    <p>Your prescription is ready. Please find the details below:</p>
    
    <h3>Diagnosis:</h3>
    <p>${prescription.diagnosis}</p>
    
    <h3>Medicines:</h3>
    <ul>
      ${prescription.medicines.map(m => `
        <li><strong>${m.name}</strong> - ${m.frequency} for ${m.duration}</li>
      `).join('')}
    </ul>
    
    <p>Best regards,<br>Dr. ${prescription.doctorName}</p>
  </div>
</body>
</html>
`;
```

---

## 📊 **PART 5: ADVANCED CUSTOMIZATION**

### **5.1 Custom Authentication**

**Add Social Login:**

```javascript
// Facebook Login
async loginWithFacebook() {
  const provider = new firebase.auth.FacebookAuthProvider();
  const result = await firebase.auth().signInWithPopup(provider);
  return result;
}

// Apple Login
async loginWithApple() {
  const provider = new firebase.auth.OAuthProvider('apple.com');
  const result = await firebase.auth().signInWithPopup(provider);
  return result;
}
```

### **5.2 Custom Notifications**

```javascript
// Custom notification system
class NotificationManager {
  async sendPrescriptionReady(patientPhone, prescriptionId) {
    const message = `Your prescription is ready! View: ${window.location.origin}/pages/patient/view-prescription.html?id=${prescriptionId}`;
    
    // Send SMS
    await apiIntegrations.sendSMS(patientPhone, message);
    
    // Send email (if available)
    // await apiIntegrations.sendEmail(...);
    
    // Track event
    apiIntegrations.trackEvent('prescription_notification_sent', {
      prescriptionId,
      channel: 'sms'
    });
  }
}
```

### **5.3 Custom Reports**

```javascript
// Generate custom reports
class ReportGenerator {
  async generateMonthlyReport(doctorId, month, year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const snapshot = await firebase.firestore()
      .collection('prescriptions')
      .where('doctorId', '==', doctorId)
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .get();

    const prescriptions = [];
    snapshot.forEach(doc => {
      prescriptions.push(doc.data());
    });

    // Generate report
    const report = {
      totalPrescriptions: prescriptions.length,
      uniquePatients: new Set(prescriptions.map(p => p.patientName)).size,
      topMedicines: this.getTopMedicines(prescriptions),
      topDiagnoses: this.getTopDiagnoses(prescriptions)
    };

    return report;
  }
}
```

---

## 🎯 **QUICK CUSTOMIZATION CHECKLIST**

### **Essential Customizations:**
- [ ] Update app name and tagline
- [ ] Change primary and secondary colors
- [ ] Replace logo and icons
- [ ] Update company information
- [ ] Configure Firebase
- [ ] Add OpenAI API key

### **Recommended Customizations:**
- [ ] Enable SMS integration
- [ ] Enable email integration
- [ ] Setup payment gateway
- [ ] Add Google Analytics
- [ ] Configure cloud storage
- [ ] Add custom prescription fields

### **Advanced Customizations:**
- [ ] Add appointment booking
- [ ] Integrate video consultation
- [ ] Add lab report uploads
- [ ] Create prescription templates
- [ ] Custom email templates
- [ ] Custom PDF layouts

---

## 📞 **SUPPORT**

Need help with customization?
- **Documentation:** Check all .md files in repo
- **Examples:** See code comments in each file
- **Issues:** Create GitHub issue
- **Email:** support@veriscript.in

---

<div align="center">

# **🎨 Customization Complete!**

**Your app, your brand, your way!**

---

**Everything is customizable:**
- ✅ Branding & Colors
- ✅ Features & Functions
- ✅ API Integrations
- ✅ UI & UX

---

**Make it yours!** 🚀

</div>

# VeriScript - Digital Prescription Layer

**The new standard in digital prescribing.**

VeriScript is a specialized, mobile-first Digital Prescription Layer designed to solve the two most significant pain points in Indian private healthcare: regulatory non-compliance and workflow friction.

## Features

- ⚡ **Lightning Fast**: Create prescriptions in under 15 seconds
- 🔒 **Fully Compliant**: IT Act 2000, Drugs & Cosmetics Act, ABDM ready
- 📱 **Mobile First**: Works seamlessly on all devices
- 🔐 **Secure**: End-to-end encryption with QR/Token verification
- 📊 **Audit Trail**: Complete immutable transaction logs

## System Components

1. **Doctor Portal** - Fast prescription creation with smart presets
2. **Chemist Portal** - Secure verification and dispensing workflow
3. **Patient Delivery** - SMS/WhatsApp token-based prescription delivery
4. **Firebase Backend** - Serverless, scalable, and secure

## Quick Start

### Prerequisites

- Node.js 16+
- Firebase CLI
- A Firebase project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/essentials2life-dev/veriscript-app.git
cd veriscript-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
```bash
firebase login
firebase init
```

4. Update `public/js/config.js` with your Firebase configuration

5. Deploy:
```bash
firebase deploy
```

## Project Structure

```
veriscript-app/
├── public/
│   ├── doctor/          # Doctor portal
│   ├── chemist/         # Chemist portal
│   ├── patient/         # Patient view
│   ├── css/            # Shared styles
│   ├── js/             # Shared JavaScript
│   └── index.html      # Landing page
├── functions/          # Firebase Cloud Functions
├── firestore.rules     # Security rules
└── firebase.json       # Firebase configuration
```

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Firebase (Firestore, Cloud Functions, Authentication)
- **Notifications**: Twilio (SMS), WhatsApp Business API
- **Security**: Firebase Security Rules, Cryptographic Hashing

## Compliance

- ✅ IT Act, 2000 compliant
- ✅ Drugs & Cosmetics Act ready
- ✅ ABDM integration ready
- ✅ DISHA/DPDP data privacy compliant

## License

Proprietary - All rights reserved

## Contact

For business inquiries: contact@veriscript.in

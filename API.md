# VeriScript API Documentation

Complete API reference for VeriScript Cloud Functions and Firestore operations.

## Table of Contents

1. [Authentication](#authentication)
2. [Cloud Functions](#cloud-functions)
3. [Firestore Collections](#firestore-collections)
4. [Security Rules](#security-rules)
5. [Error Handling](#error-handling)

---

## Authentication

VeriScript uses Firebase Authentication with Email/Password provider.

### Register User

```javascript
// Doctor Registration
const userCredential = await auth.createUserWithEmailAndPassword(email, password);
const user = userCredential.user;

// Create user profile
await db.collection('users').doc(user.uid).set({
  role: 'doctor', // or 'chemist'
  email: email,
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
});
```

### Login

```javascript
const userCredential = await auth.signInWithEmailAndPassword(email, password);
const user = userCredential.user;
```

### Logout

```javascript
await auth.signOut();
```

---

## Cloud Functions

### 1. onPrescriptionCreated

**Trigger:** Firestore onCreate
**Path:** `prescriptions/{prescriptionId}`

Automatically triggered when a new prescription is created.

**Actions:**
- Generates 6-digit verification code
- Creates prescription hash for integrity
- Generates QR code
- Sends SMS to patient
- Creates audit log

**Response Fields Added:**
```javascript
{
  verificationCode: "123456",
  prescriptionHash: "sha256_hash",
  qrCodeUrl: "data:image/png;base64,...",
  tokenUrl: "https://veriscript.app/patient/view?id=xxx&code=xxx",
  status: "pending"
}
```

### 2. onPrescriptionDispensed

**Trigger:** Firestore onUpdate
**Path:** `prescriptions/{prescriptionId}`

Triggered when prescription status changes to 'dispensed'.

**Actions:**
- Sends confirmation SMS to patient
- Creates audit log
- Updates analytics

### 3. verifyPrescription

**Type:** HTTPS Callable Function
**Authentication:** Optional

Verifies a prescription using ID and verification code.

**Request:**
```javascript
const verifyFunction = functions.httpsCallable('verifyPrescription');
const result = await verifyFunction({
  prescriptionId: "abc123",
  verificationCode: "123456"
});
```

**Response:**
```javascript
{
  success: true,
  prescription: {
    doctorName: "Dr. John Doe",
    patientName: "Jane Smith",
    medicines: [...],
    // ... other fields
  }
}
```

**Errors:**
- `invalid-argument`: Missing parameters
- `not-found`: Prescription not found
- `permission-denied`: Invalid verification code

### 4. getDoctorStats

**Type:** HTTPS Callable Function
**Authentication:** Required (Doctor)

Gets statistics for authenticated doctor.

**Request:**
```javascript
const getStats = functions.httpsCallable('getDoctorStats');
const result = await getStats();
```

**Response:**
```javascript
{
  totalPrescriptions: 150,
  dispensed: 120,
  pending: 25,
  expired: 5
}
```

### 5. markExpiredPrescriptions

**Type:** Scheduled Function
**Schedule:** Daily at midnight (Asia/Kolkata)

Automatically marks prescriptions older than 30 days as expired.

---

## Firestore Collections

### users

Stores basic user information and roles.

**Document ID:** Firebase Auth UID

**Schema:**
```javascript
{
  role: "doctor" | "chemist" | "admin",
  email: "user@example.com",
  createdAt: Timestamp
}
```

**Security:**
- Read: Owner or Admin
- Create: Authenticated users
- Update: Owner or Admin
- Delete: Admin only

### doctors

Stores doctor profiles and professional information.

**Document ID:** Firebase Auth UID

**Schema:**
```javascript
{
  fullName: "Dr. John Doe",
  phone: "+919876543210",
  clinicName: "City Medical Center",
  address: "123 Main St, Mumbai",
  registrationNumber: "MH12345",
  qualification: "MBBS, MD",
  specialization: "General Physician",
  experience: 10,
  email: "doctor@example.com",
  userId: "firebase_uid",
  subscriptionPlan: "free" | "pro",
  subscriptionStatus: "active" | "inactive",
  prescriptionCount: 0,
  createdAt: Timestamp
}
```

**Indexes:**
- registrationNumber (ascending)
- specialization (ascending)

### chemists

Stores chemist/pharmacy profiles.

**Document ID:** Firebase Auth UID

**Schema:**
```javascript
{
  pharmacyName: "City Pharmacy",
  ownerName: "John Smith",
  licenseNumber: "CHEM12345",
  phone: "+919876543210",
  address: "456 Market St, Mumbai",
  email: "chemist@example.com",
  userId: "firebase_uid",
  verificationStatus: "pending" | "verified" | "rejected",
  dispensedCount: 0,
  createdAt: Timestamp
}
```

**Indexes:**
- licenseNumber (ascending)
- verificationStatus (ascending)

### prescriptions

Stores all prescription data.

**Document ID:** Auto-generated

**Schema:**
```javascript
{
  // Doctor Information
  doctorId: "firebase_uid",
  doctorName: "Dr. John Doe",
  doctorRegistration: "MH12345",
  clinicName: "City Medical Center",
  clinicAddress: "123 Main St, Mumbai",
  
  // Patient Information
  patientName: "Jane Smith",
  patientPhone: "+919876543210",
  patientAge: 30,
  diagnosis: "Common Cold",
  
  // Medicines
  medicines: [
    {
      name: "Paracetamol",
      dosage: "500mg",
      frequency: "3 times daily",
      duration: "5 days"
    }
  ],
  
  // Additional Information
  notes: "Take after meals",
  
  // Verification
  verificationCode: "123456",
  prescriptionHash: "sha256_hash",
  qrCodeUrl: "data:image/png;base64,...",
  tokenUrl: "https://...",
  
  // Status
  status: "pending" | "dispensed" | "expired",
  
  // Dispensing Information (when dispensed)
  dispensedAt: Timestamp,
  dispensedBy: "chemist_uid",
  chemistName: "City Pharmacy",
  chemistLicenseId: "CHEM12345",
  
  // Timestamps
  createdAt: Timestamp
}
```

**Indexes:**
- doctorId + createdAt (descending)
- status + createdAt (descending)
- patientPhone + createdAt (descending)

**Security:**
- Create: Doctors only
- Read: Doctor (own), Chemists, Admins
- Update: Chemists (dispensed status only)
- Delete: Admin only

### auditLogs

Immutable audit trail of all prescription actions.

**Document ID:** Auto-generated

**Schema:**
```javascript
{
  prescriptionId: "prescription_doc_id",
  action: "PRESCRIPTION_CREATED" | "VERIFICATION_SUCCESS" | "VERIFICATION_FAILED" | "PRESCRIPTION_DISPENSED",
  userId: "firebase_uid",
  metadata: {
    // Action-specific data
  },
  timestamp: Timestamp,
  ipAddress: "192.168.1.1"
}
```

**Indexes:**
- prescriptionId + timestamp (descending)

**Security:**
- Read: Admin only
- Create: Authenticated users
- Update/Delete: Not allowed (immutable)

### analytics

Aggregated daily statistics.

**Document ID:** Date (YYYY-MM-DD)

**Schema:**
```javascript
{
  date: "2025-01-15",
  totalPrescriptions: 150,
  totalDispensed: 120,
  uniqueDoctors: ["uid1", "uid2", ...],
  uniqueChemists: ["uid1", "uid2", ...],
  updatedAt: Timestamp
}
```

**Security:**
- Read: Authenticated users
- Write: Cloud Functions only

### notifications

User notifications.

**Document ID:** Auto-generated

**Schema:**
```javascript
{
  userId: "firebase_uid",
  type: "prescription_created" | "prescription_dispensed",
  title: "New Prescription",
  message: "Your prescription has been created",
  read: false,
  createdAt: Timestamp
}
```

---

## Security Rules

### Role-Based Access Control

```javascript
// Check if user is doctor
function isDoctor() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'doctor';
}

// Check if user is chemist
function isChemist() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'chemist';
}

// Check if user is admin
function isAdmin() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### Prescription Security

```javascript
// Doctors can only create prescriptions with their own ID
allow create: if isDoctor() && 
                 request.resource.data.doctorId == request.auth.uid;

// Chemists can only update dispensed status
allow update: if isChemist() && 
                 resource.data.doctorId != request.auth.uid &&
                 request.resource.data.diff(resource.data)
                   .affectedKeys().hasOnly(['dispensedAt', 'dispensedBy', 'chemistLicenseId', 'status']);
```

---

## Error Handling

### Common Error Codes

**Authentication Errors:**
- `auth/user-not-found`: No user with this email
- `auth/wrong-password`: Incorrect password
- `auth/email-already-in-use`: Email already registered
- `auth/weak-password`: Password too weak
- `auth/invalid-email`: Invalid email format

**Firestore Errors:**
- `permission-denied`: Insufficient permissions
- `not-found`: Document not found
- `already-exists`: Document already exists
- `failed-precondition`: Operation failed precondition

**Cloud Functions Errors:**
- `invalid-argument`: Missing or invalid parameters
- `unauthenticated`: User not authenticated
- `permission-denied`: Insufficient permissions
- `not-found`: Resource not found
- `internal`: Internal server error

### Error Handling Example

```javascript
try {
  const result = await verifyPrescription(id, code);
} catch (error) {
  if (error.code === 'not-found') {
    console.error('Prescription not found');
  } else if (error.code === 'permission-denied') {
    console.error('Invalid verification code');
  } else {
    console.error('Unknown error:', error.message);
  }
}
```

---

## Rate Limiting

Cloud Functions have built-in rate limiting:

- **Free Tier:** 2M invocations/month
- **Per User:** 100 requests/minute (recommended)
- **Per IP:** 1000 requests/hour (recommended)

Implement client-side throttling for better UX.

---

## Best Practices

1. **Always validate input** on both client and server
2. **Use transactions** for critical operations
3. **Implement retry logic** for network failures
4. **Cache frequently accessed data**
5. **Use batch operations** when possible
6. **Monitor Cloud Functions logs** regularly
7. **Set up error alerts** for production
8. **Test security rules** thoroughly

---

## Testing

### Test Prescription Creation

```javascript
const testPrescription = {
  doctorId: currentUser.uid,
  doctorName: "Dr. Test",
  patientName: "Test Patient",
  patientPhone: "+919876543210",
  medicines: [
    {
      name: "Test Medicine",
      dosage: "500mg",
      frequency: "2x daily",
      duration: "5 days"
    }
  ],
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
};

await db.collection('prescriptions').add(testPrescription);
```

### Test Verification

```javascript
const result = await functions.httpsCallable('verifyPrescription')({
  prescriptionId: "test_id",
  verificationCode: "123456"
});

console.log(result.data);
```

---

## Support

For API support:
- Email: api@veriscript.in
- Documentation: https://docs.veriscript.in
- GitHub Issues: https://github.com/essentials2life-dev/veriscript-app/issues

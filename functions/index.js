const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');
const QRCode = require('qrcode');

admin.initializeApp();
const db = admin.firestore();

// Twilio configuration (set via Firebase config)
const twilio = require('twilio')(
  functions.config().twilio?.account_sid,
  functions.config().twilio?.auth_token
);

/**
 * Generate a secure 6-digit verification code
 */
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a cryptographic hash for prescription integrity
 */
function generatePrescriptionHash(prescriptionData) {
  const dataString = JSON.stringify({
    doctorId: prescriptionData.doctorId,
    patientName: prescriptionData.patientName,
    patientPhone: prescriptionData.patientPhone,
    medicines: prescriptionData.medicines,
    createdAt: prescriptionData.createdAt
  });
  
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

/**
 * Create audit log entry
 */
async function createAuditLog(prescriptionId, action, userId, metadata = {}) {
  await db.collection('auditLogs').add({
    prescriptionId,
    action,
    userId,
    metadata,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    ipAddress: metadata.ipAddress || null
  });
}

/**
 * Trigger: When a new prescription is created
 * Actions: Generate QR code, verification code, send to patient
 */
exports.onPrescriptionCreated = functions.firestore
  .document('prescriptions/{prescriptionId}')
  .onCreate(async (snap, context) => {
    const prescriptionId = context.params.prescriptionId;
    const prescription = snap.data();
    
    try {
      // Generate verification code
      const verificationCode = generateVerificationCode();
      
      // Generate prescription hash for integrity
      const prescriptionHash = generatePrescriptionHash(prescription);
      
      // Create secure token URL
      const tokenUrl = `https://veriscript.app/patient/view?id=${prescriptionId}&code=${verificationCode}`;
      
      // Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(tokenUrl);
      
      // Update prescription with verification data
      await snap.ref.update({
        verificationCode,
        prescriptionHash,
        qrCodeUrl: qrCodeDataUrl,
        tokenUrl,
        status: 'pending'
      });
      
      // Send SMS to patient
      if (functions.config().twilio?.account_sid) {
        await twilio.messages.create({
          body: `VeriScript Prescription from Dr. ${prescription.doctorName}\n\nVerification Code: ${verificationCode}\n\nView: ${tokenUrl}\n\nValid for 30 days. Do not share this code.`,
          from: functions.config().twilio?.phone_number,
          to: prescription.patientPhone
        });
      }
      
      // Create audit log
      await createAuditLog(prescriptionId, 'PRESCRIPTION_CREATED', prescription.doctorId, {
        patientPhone: prescription.patientPhone,
        medicineCount: prescription.medicines.length
      });
      
      console.log(`Prescription ${prescriptionId} created and sent to patient`);
      
    } catch (error) {
      console.error('Error processing new prescription:', error);
      
      // Update prescription with error status
      await snap.ref.update({
        status: 'error',
        errorMessage: error.message
      });
    }
  });

/**
 * Trigger: When prescription is marked as dispensed
 * Actions: Send confirmation to patient and doctor
 */
exports.onPrescriptionDispensed = functions.firestore
  .document('prescriptions/{prescriptionId}')
  .onUpdate(async (change, context) => {
    const prescriptionId = context.params.prescriptionId;
    const before = change.before.data();
    const after = change.after.data();
    
    // Check if status changed to dispensed
    if (before.status !== 'dispensed' && after.status === 'dispensed') {
      try {
        // Send confirmation SMS to patient
        if (functions.config().twilio?.account_sid) {
          await twilio.messages.create({
            body: `Your VeriScript prescription has been dispensed by ${after.chemistName} (License: ${after.chemistLicenseId}).\n\nThank you for using VeriScript.`,
            from: functions.config().twilio?.phone_number,
            to: after.patientPhone
          });
        }
        
        // Create audit log
        await createAuditLog(prescriptionId, 'PRESCRIPTION_DISPENSED', after.dispensedBy, {
          chemistLicenseId: after.chemistLicenseId,
          chemistName: after.chemistName
        });
        
        // Update analytics
        await updateAnalytics(after);
        
        console.log(`Prescription ${prescriptionId} dispensed successfully`);
        
      } catch (error) {
        console.error('Error processing dispensed prescription:', error);
      }
    }
  });

/**
 * Update analytics data
 */
async function updateAnalytics(prescription) {
  const today = new Date().toISOString().split('T')[0];
  const analyticsRef = db.collection('analytics').doc(today);
  
  await analyticsRef.set({
    date: today,
    totalPrescriptions: admin.firestore.FieldValue.increment(1),
    totalDispensed: admin.firestore.FieldValue.increment(1),
    uniqueDoctors: admin.firestore.FieldValue.arrayUnion(prescription.doctorId),
    uniqueChemists: admin.firestore.FieldValue.arrayUnion(prescription.dispensedBy),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

/**
 * HTTP Function: Verify prescription token
 */
exports.verifyPrescription = functions.https.onCall(async (data, context) => {
  const { prescriptionId, verificationCode } = data;
  
  if (!prescriptionId || !verificationCode) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
  }
  
  try {
    const prescriptionDoc = await db.collection('prescriptions').doc(prescriptionId).get();
    
    if (!prescriptionDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Prescription not found');
    }
    
    const prescription = prescriptionDoc.data();
    
    // Verify code
    if (prescription.verificationCode !== verificationCode) {
      await createAuditLog(prescriptionId, 'VERIFICATION_FAILED', 'anonymous', {
        reason: 'Invalid verification code'
      });
      throw new functions.https.HttpsError('permission-denied', 'Invalid verification code');
    }
    
    // Check if already dispensed
    if (prescription.status === 'dispensed') {
      return {
        success: false,
        message: 'Prescription already dispensed',
        prescription: {
          ...prescription,
          medicines: null // Don't send medicine details
        }
      };
    }
    
    // Check expiry (30 days)
    const createdAt = prescription.createdAt.toDate();
    const expiryDate = new Date(createdAt.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    if (new Date() > expiryDate) {
      return {
        success: false,
        message: 'Prescription expired',
        expiryDate: expiryDate.toISOString()
      };
    }
    
    await createAuditLog(prescriptionId, 'VERIFICATION_SUCCESS', context.auth?.uid || 'anonymous');
    
    return {
      success: true,
      prescription: prescription
    };
    
  } catch (error) {
    console.error('Error verifying prescription:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * HTTP Function: Get doctor statistics
 */
exports.getDoctorStats = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const doctorId = context.auth.uid;
  
  try {
    const prescriptionsSnapshot = await db.collection('prescriptions')
      .where('doctorId', '==', doctorId)
      .get();
    
    const stats = {
      totalPrescriptions: prescriptionsSnapshot.size,
      dispensed: 0,
      pending: 0,
      expired: 0
    };
    
    prescriptionsSnapshot.forEach(doc => {
      const prescription = doc.data();
      if (prescription.status === 'dispensed') {
        stats.dispensed++;
      } else if (prescription.status === 'pending') {
        stats.pending++;
      } else if (prescription.status === 'expired') {
        stats.expired++;
      }
    });
    
    return stats;
    
  } catch (error) {
    console.error('Error getting doctor stats:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Scheduled Function: Mark expired prescriptions
 * Runs daily at midnight
 */
exports.markExpiredPrescriptions = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const expiredPrescriptions = await db.collection('prescriptions')
      .where('status', '==', 'pending')
      .where('createdAt', '<', thirtyDaysAgo)
      .get();
    
    const batch = db.batch();
    let count = 0;
    
    expiredPrescriptions.forEach(doc => {
      batch.update(doc.ref, { status: 'expired' });
      count++;
    });
    
    await batch.commit();
    
    console.log(`Marked ${count} prescriptions as expired`);
    return null;
  });

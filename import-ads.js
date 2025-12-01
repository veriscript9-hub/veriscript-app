/**
 * Script to import sample ads to Firebase Firestore
 * Run: node import-ads.js
 */

const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json'); // Download from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Load sample ads data
const sampleData = JSON.parse(fs.readFileSync('./sample-ads-data.json', 'utf8'));

async function importAds() {
  console.log('Starting ad import...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const ad of sampleData.ads) {
    try {
      // Convert date strings to Firestore Timestamps
      const adData = {
        ...ad,
        startDate: admin.firestore.Timestamp.fromDate(new Date(ad.startDate)),
        endDate: admin.firestore.Timestamp.fromDate(new Date(ad.endDate)),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Add to Firestore
      const docRef = await db.collection('ads').add(adData);
      
      console.log(`✓ Imported ad: ${ad.text.substring(0, 50)}... (ID: ${docRef.id})`);
      successCount++;
      
    } catch (error) {
      console.error(`✗ Error importing ad: ${ad.text.substring(0, 50)}...`);
      console.error(`  Error: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n=== Import Complete ===`);
  console.log(`✓ Successfully imported: ${successCount} ads`);
  console.log(`✗ Failed: ${errorCount} ads`);
  console.log(`Total: ${sampleData.ads.length} ads`);
}

// Run import
importAds()
  .then(() => {
    console.log('\nImport completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nImport failed:', error);
    process.exit(1);
  });

# VeriScript Ads System Documentation

## Overview

VeriScript features a **Firebase-controlled scrolling ad banner** system that displays across all three portals (Doctor, Chemist, and Patient). The system provides real-time ad management, targeting, analytics, and revenue tracking.

---

## Architecture

### Components

1. **Frontend Ad Manager** (`public/js/ads.js`)
   - Centralized JavaScript class for ad display
   - Real-time Firebase synchronization
   - Impression and click tracking
   - Auto-scrolling functionality

2. **Ad Styling** (`public/css/ads.css`)
   - Responsive design for all devices
   - Multiple ad variants (primary, success, warning, etc.)
   - Smooth animations and transitions
   - Accessibility features

3. **Firebase Backend** (Firestore Collections)
   - `ads` - Ad content and configuration
   - `adAnalytics` - Impression and click tracking
   - `adCampaigns` - Campaign management

---

## Firebase Database Schema

### Collection: `ads`

Stores all ad content and configuration.

**Document Structure:**
```javascript
{
  // Ad Content
  text: "Get 20% off on all medicines at Apollo Pharmacy!",
  link: "https://apollopharmacy.in/veriscript",
  imageUrl: "https://example.com/ad-image.jpg", // Optional
  
  // Targeting
  targetPortals: ["doctor", "chemist", "patient"], // Array of portals
  targetUserTypes: ["free", "pro", "enterprise"], // Optional
  targetLocations: ["bangalore", "mumbai"], // Optional
  
  // Scheduling
  startDate: Timestamp,
  endDate: Timestamp,
  status: "active", // active, paused, expired
  
  // Styling
  backgroundColor: "#2563eb",
  textColor: "#ffffff",
  variant: "primary", // primary, success, warning, danger, purple
  
  // Priority & Budget
  priority: 10, // Higher = shown first
  dailyBudget: 5000, // In rupees
  costPerImpression: 0.50, // CPI in rupees
  costPerClick: 5.00, // CPC in rupees
  
  // Analytics
  impressions: 0,
  clicks: 0,
  spend: 0,
  
  // Metadata
  campaignId: "campaign_123",
  advertiserId: "advertiser_456",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "admin_uid"
}
```

**Indexes Required:**
```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "ads",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "startDate", "order": "ASCENDING" },
        { "fieldPath": "endDate", "order": "ASCENDING" },
        { "fieldPath": "priority", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "ads",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "targetPortals", "arrayConfig": "CONTAINS" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "priority", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### Collection: `adAnalytics`

Tracks all ad interactions for analytics and billing.

**Document Structure:**
```javascript
{
  adId: "ad_doc_id",
  portal: "doctor", // doctor, chemist, patient
  userId: "user_uid", // Optional
  action: "impression", // impression, click, hide
  
  // Context
  timestamp: Timestamp,
  userAgent: "Mozilla/5.0...",
  screenSize: "1920x1080",
  ipAddress: "192.168.1.1", // Optional
  
  // Attribution
  campaignId: "campaign_123",
  advertiserId: "advertiser_456"
}
```

**Indexes Required:**
```javascript
{
  "indexes": [
    {
      "collectionGroup": "adAnalytics",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "adId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "adAnalytics",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "portal", "order": "ASCENDING" },
        { "fieldPath": "action", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### Collection: `adCampaigns`

Manages advertising campaigns.

**Document Structure:**
```javascript
{
  name: "Apollo Pharmacy Q1 2025",
  advertiserId: "advertiser_456",
  advertiserName: "Apollo Pharmacy",
  
  // Budget
  totalBudget: 100000, // In rupees
  spent: 25000,
  remaining: 75000,
  
  // Dates
  startDate: Timestamp,
  endDate: Timestamp,
  status: "active", // active, paused, completed
  
  // Performance
  totalImpressions: 50000,
  totalClicks: 2500,
  ctr: 5.0, // Click-through rate %
  averageCPC: 10.00,
  
  // Ads
  adIds: ["ad_1", "ad_2", "ad_3"],
  
  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## Ad Management (Admin Panel)

### Creating an Ad

**Firebase Console Method:**

1. Go to Firestore Database
2. Navigate to `ads` collection
3. Click "Add Document"
4. Fill in the fields:

```javascript
{
  text: "Get 20% off on all medicines!",
  link: "https://example.com",
  targetPortals: ["doctor", "chemist"],
  startDate: new Date("2025-01-01"),
  endDate: new Date("2025-12-31"),
  status: "active",
  backgroundColor: "#10b981",
  textColor: "#ffffff",
  priority: 10,
  impressions: 0,
  clicks: 0
}
```

### Cloud Function Method (Recommended)

Create a Cloud Function for ad management:

```javascript
// functions/index.js

exports.createAd = functions.https.onCall(async (data, context) => {
  // Check admin permission
  if (!context.auth || !await isAdmin(context.auth.uid)) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }
  
  const ad = {
    text: data.text,
    link: data.link,
    targetPortals: data.targetPortals || ['doctor', 'chemist', 'patient'],
    startDate: admin.firestore.Timestamp.fromDate(new Date(data.startDate)),
    endDate: admin.firestore.Timestamp.fromDate(new Date(data.endDate)),
    status: 'active',
    backgroundColor: data.backgroundColor || '#2563eb',
    textColor: data.textColor || '#ffffff',
    priority: data.priority || 5,
    impressions: 0,
    clicks: 0,
    spend: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: context.auth.uid
  };
  
  const docRef = await admin.firestore().collection('ads').add(ad);
  
  return { success: true, adId: docRef.id };
});

exports.updateAd = functions.https.onCall(async (data, context) => {
  // Check admin permission
  if (!context.auth || !await isAdmin(context.auth.uid)) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }
  
  await admin.firestore().collection('ads').doc(data.adId).update({
    ...data.updates,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  return { success: true };
});

exports.deleteAd = functions.https.onCall(async (data, context) => {
  // Check admin permission
  if (!context.auth || !await isAdmin(context.auth.uid)) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }
  
  await admin.firestore().collection('ads').doc(data.adId).delete();
  
  return { success: true };
});
```

---

## Ad Targeting

### Portal Targeting

Target specific portals:

```javascript
// Show only to doctors
targetPortals: ["doctor"]

// Show to doctors and chemists
targetPortals: ["doctor", "chemist"]

// Show to all portals
targetPortals: ["doctor", "chemist", "patient"]
```

### User Type Targeting

Target by subscription plan:

```javascript
// Show only to free users (upsell)
targetUserTypes: ["free"]

// Show only to pro users
targetUserTypes: ["pro"]

// Show to all users
targetUserTypes: ["free", "pro", "enterprise"]
```

### Location Targeting

Target by city/region:

```javascript
// Show only in Bangalore
targetLocations: ["bangalore"]

// Show in multiple cities
targetLocations: ["bangalore", "mumbai", "delhi"]

// Show everywhere (omit field)
```

### Time-Based Targeting

Schedule ads for specific periods:

```javascript
// Q1 2025 campaign
startDate: new Date("2025-01-01"),
endDate: new Date("2025-03-31")

// Flash sale (24 hours)
startDate: new Date("2025-01-15 00:00:00"),
endDate: new Date("2025-01-15 23:59:59")
```

---

## Analytics & Reporting

### Real-Time Metrics

Query ad performance:

```javascript
// Get ad performance
const getAdPerformance = async (adId) => {
  const ad = await db.collection('ads').doc(adId).get();
  const data = ad.data();
  
  return {
    impressions: data.impressions,
    clicks: data.clicks,
    ctr: (data.clicks / data.impressions * 100).toFixed(2),
    spend: data.spend,
    cpi: (data.spend / data.impressions).toFixed(2),
    cpc: (data.spend / data.clicks).toFixed(2)
  };
};

// Get portal-wise analytics
const getPortalAnalytics = async (portal, startDate, endDate) => {
  const analytics = await db.collection('adAnalytics')
    .where('portal', '==', portal)
    .where('timestamp', '>=', startDate)
    .where('timestamp', '<=', endDate)
    .get();
  
  let impressions = 0;
  let clicks = 0;
  
  analytics.forEach(doc => {
    const data = doc.data();
    if (data.action === 'impression') impressions++;
    if (data.action === 'click') clicks++;
  });
  
  return {
    portal,
    impressions,
    clicks,
    ctr: (clicks / impressions * 100).toFixed(2)
  };
};
```

### Automated Reporting

Cloud Function for daily reports:

```javascript
exports.generateDailyAdReport = functions.pubsub
  .schedule('0 0 * * *') // Daily at midnight
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all active ads
    const ads = await admin.firestore().collection('ads')
      .where('status', '==', 'active')
      .get();
    
    const report = {
      date: yesterday,
      totalImpressions: 0,
      totalClicks: 0,
      totalSpend: 0,
      ads: []
    };
    
    for (const adDoc of ads.docs) {
      const ad = adDoc.data();
      
      // Get analytics for this ad
      const analytics = await admin.firestore().collection('adAnalytics')
        .where('adId', '==', adDoc.id)
        .where('timestamp', '>=', yesterday)
        .where('timestamp', '<', today)
        .get();
      
      let impressions = 0;
      let clicks = 0;
      
      analytics.forEach(doc => {
        const data = doc.data();
        if (data.action === 'impression') impressions++;
        if (data.action === 'click') clicks++;
      });
      
      const spend = (impressions * ad.costPerImpression) + (clicks * ad.costPerClick);
      
      report.totalImpressions += impressions;
      report.totalClicks += clicks;
      report.totalSpend += spend;
      
      report.ads.push({
        adId: adDoc.id,
        text: ad.text,
        impressions,
        clicks,
        ctr: (clicks / impressions * 100).toFixed(2),
        spend
      });
      
      // Update ad spend
      await adDoc.ref.update({
        spend: admin.firestore.FieldValue.increment(spend)
      });
    }
    
    // Save report
    await admin.firestore().collection('adReports').add(report);
    
    // Send email to admin
    // await sendAdminEmail(report);
    
    return null;
  });
```

---

## Revenue Model

### Pricing Structure

**Cost Per Impression (CPI):**
- Standard: ₹0.50 per 1000 impressions
- Premium: ₹1.00 per 1000 impressions

**Cost Per Click (CPC):**
- Standard: ₹5.00 per click
- Premium: ₹10.00 per click

### Revenue Calculation

```javascript
// Calculate ad revenue
const calculateRevenue = (impressions, clicks, cpi, cpc) => {
  const impressionRevenue = (impressions / 1000) * cpi;
  const clickRevenue = clicks * cpc;
  return impressionRevenue + clickRevenue;
};

// Example: 100,000 impressions, 5,000 clicks
const revenue = calculateRevenue(100000, 5000, 0.50, 5.00);
// = (100000/1000 * 0.50) + (5000 * 5.00)
// = 50 + 25000
// = ₹25,050
```

### Projected Revenue

**Assumptions:**
- 10,000 active doctors
- 5,000 active chemists
- Average 50 prescriptions/doctor/month
- 2 ad impressions per prescription
- 2% click-through rate

**Monthly Calculations:**
```
Total Prescriptions = 10,000 doctors × 50 prescriptions = 500,000
Total Impressions = 500,000 × 2 = 1,000,000
Total Clicks = 1,000,000 × 2% = 20,000

Revenue from Impressions = (1,000,000 / 1000) × ₹0.50 = ₹500
Revenue from Clicks = 20,000 × ₹5.00 = ₹100,000

Total Monthly Ad Revenue = ₹100,500
Annual Ad Revenue = ₹12,06,000 (₹12 lakhs)
```

---

## Best Practices

### Ad Content

1. **Keep it Short**: 60-80 characters max
2. **Clear CTA**: "Get 20% off", "Learn More", "Shop Now"
3. **Value Proposition**: Focus on benefits
4. **Urgency**: "Limited time", "Today only"
5. **Relevance**: Target appropriate portals

### Ad Scheduling

1. **Test First**: Run small campaigns to test performance
2. **Peak Hours**: Schedule during high-traffic times
3. **Seasonal**: Align with festivals, seasons
4. **Budget Pacing**: Distribute budget evenly
5. **A/B Testing**: Test multiple variants

### Performance Optimization

1. **Monitor CTR**: Aim for 2-5% click-through rate
2. **Rotate Ads**: Change ads every 2-4 weeks
3. **Pause Low Performers**: CTR < 1%
4. **Increase Winners**: Scale high-performing ads
5. **Analyze by Portal**: Different portals perform differently

---

## Security & Privacy

### Data Protection

1. **No PHI in Ads**: Never include patient health information
2. **Secure Links**: Use HTTPS only
3. **Verified Advertisers**: Vet all advertisers
4. **Compliance**: Follow advertising regulations
5. **User Consent**: Respect user preferences

### Firestore Security Rules

```javascript
// firestore.rules
match /ads/{adId} {
  // Public read for active ads
  allow read: if resource.data.status == 'active';
  
  // Admin-only write
  allow create, update, delete: if isAdmin();
}

match /adAnalytics/{analyticsId} {
  // Authenticated users can create analytics
  allow create: if request.auth != null;
  
  // Admin-only read
  allow read: if isAdmin();
  
  // No updates or deletes
  allow update, delete: if false;
}

match /adCampaigns/{campaignId} {
  // Admin-only access
  allow read, write: if isAdmin();
}

function isAdmin() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

---

## Troubleshooting

### Ads Not Showing

1. **Check Status**: Ensure ad status is "active"
2. **Check Dates**: Verify startDate <= now <= endDate
3. **Check Targeting**: Verify targetPortals includes current portal
4. **Check Budget**: Ensure dailyBudget not exceeded
5. **Check Console**: Look for JavaScript errors

### Low Performance

1. **Improve Copy**: Make text more compelling
2. **Better Targeting**: Narrow audience
3. **Test Timing**: Try different times
4. **Change Design**: Try different colors
5. **Optimize Landing**: Improve destination page

### High Costs

1. **Lower CPC**: Negotiate better rates
2. **Improve CTR**: Better ads = lower CPI
3. **Pause Low Performers**: Stop ineffective ads
4. **Tighten Targeting**: Reduce waste
5. **Set Daily Caps**: Control spending

---

## Future Enhancements

### Planned Features

1. **Video Ads**: Support for video content
2. **Interactive Ads**: Polls, quizzes, forms
3. **Native Ads**: Blend with content
4. **Retargeting**: Show ads to previous visitors
5. **Programmatic**: Automated bidding
6. **Ad Blocker**: Respect user preferences
7. **A/B Testing**: Built-in testing framework
8. **Advanced Analytics**: Conversion tracking
9. **Self-Service**: Advertiser dashboard
10. **API Access**: Programmatic ad management

---

## Support

For ad-related inquiries:
- **Advertisers**: ads@veriscript.in
- **Technical Support**: support@veriscript.in
- **Billing**: billing@veriscript.in

---

**VeriScript Ads System - Monetizing Digital Healthcare**

/**
 * VeriScript Ads Manager
 * Centralized ad management controlled by Firebase backend
 */

class AdsManager {
  constructor() {
    this.currentAds = [];
    this.currentIndex = 0;
    this.scrollInterval = null;
    this.adContainer = null;
    this.portal = null; // 'doctor', 'chemist', or 'patient'
    this.userId = null;
  }

  /**
   * Initialize ads for specific portal
   * @param {string} portal - 'doctor', 'chemist', or 'patient'
   * @param {string} userId - Current user ID (optional for patient)
   */
  async init(portal, userId = null) {
    this.portal = portal;
    this.userId = userId;
    
    // Create ad container
    this.createAdContainer();
    
    // Load ads from Firebase
    await this.loadAds();
    
    // Start scrolling
    this.startScrolling();
    
    // Listen for ad updates
    this.listenForAdUpdates();
  }

  /**
   * Create ad banner container
   */
  createAdContainer() {
    // Check if container already exists
    if (document.getElementById('veriscript-ad-banner')) {
      this.adContainer = document.getElementById('veriscript-ad-banner');
      return;
    }

    // Create container
    const container = document.createElement('div');
    container.id = 'veriscript-ad-banner';
    container.className = 'ad-banner';
    container.innerHTML = `
      <div class="ad-content">
        <div class="ad-text" id="ad-text">Loading ads...</div>
        <button class="ad-close" onclick="adsManager.hideAds()" title="Hide ads">×</button>
      </div>
    `;
    
    // Append to body
    document.body.appendChild(container);
    this.adContainer = container;
  }

  /**
   * Load ads from Firebase based on portal and targeting
   */
  async loadAds() {
    try {
      // Query ads collection
      let query = db.collection('ads')
        .where('status', '==', 'active')
        .where('startDate', '<=', new Date())
        .where('endDate', '>=', new Date());
      
      // Filter by portal
      query = query.where('targetPortals', 'array-contains', this.portal);
      
      const snapshot = await query.get();
      
      this.currentAds = [];
      
      snapshot.forEach(doc => {
        const adData = doc.data();
        this.currentAds.push({
          id: doc.id,
          ...adData
        });
      });
      
      // Sort by priority
      this.currentAds.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      
      // If no ads, show default message
      if (this.currentAds.length === 0) {
        this.currentAds = [{
          id: 'default',
          text: 'VeriScript - The new standard in digital prescribing',
          link: 'https://veriscript.in',
          backgroundColor: '#2563eb',
          textColor: '#ffffff'
        }];
      }
      
      // Display first ad
      this.displayAd(0);
      
    } catch (error) {
      console.error('Error loading ads:', error);
      this.showDefaultAd();
    }
  }

  /**
   * Display specific ad
   */
  displayAd(index) {
    if (!this.currentAds || this.currentAds.length === 0) {
      return;
    }
    
    const ad = this.currentAds[index];
    const adText = document.getElementById('ad-text');
    
    if (!adText) return;
    
    // Update ad content
    if (ad.link) {
      adText.innerHTML = `<a href="${ad.link}" target="_blank" style="color: inherit; text-decoration: none;">${ad.text}</a>`;
    } else {
      adText.textContent = ad.text;
    }
    
    // Update styling
    if (this.adContainer) {
      this.adContainer.style.backgroundColor = ad.backgroundColor || '#2563eb';
      this.adContainer.style.color = ad.textColor || '#ffffff';
    }
    
    // Track impression
    this.trackImpression(ad.id);
  }

  /**
   * Start auto-scrolling ads
   */
  startScrolling() {
    // Clear existing interval
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }
    
    // Scroll every 5 seconds
    this.scrollInterval = setInterval(() => {
      this.nextAd();
    }, 5000);
  }

  /**
   * Show next ad
   */
  nextAd() {
    if (this.currentAds.length === 0) return;
    
    this.currentIndex = (this.currentIndex + 1) % this.currentAds.length;
    this.displayAd(this.currentIndex);
  }

  /**
   * Show previous ad
   */
  previousAd() {
    if (this.currentAds.length === 0) return;
    
    this.currentIndex = (this.currentIndex - 1 + this.currentAds.length) % this.currentAds.length;
    this.displayAd(this.currentIndex);
  }

  /**
   * Track ad impression
   */
  async trackImpression(adId) {
    if (adId === 'default') return;
    
    try {
      await db.collection('adAnalytics').add({
        adId: adId,
        portal: this.portal,
        userId: this.userId,
        action: 'impression',
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`
      });
      
      // Increment impression count
      await db.collection('ads').doc(adId).update({
        impressions: firebase.firestore.FieldValue.increment(1)
      });
      
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  }

  /**
   * Track ad click
   */
  async trackClick(adId) {
    if (adId === 'default') return;
    
    try {
      await db.collection('adAnalytics').add({
        adId: adId,
        portal: this.portal,
        userId: this.userId,
        action: 'click',
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userAgent: navigator.userAgent
      });
      
      // Increment click count
      await db.collection('ads').doc(adId).update({
        clicks: firebase.firestore.FieldValue.increment(1)
      });
      
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  }

  /**
   * Listen for real-time ad updates
   */
  listenForAdUpdates() {
    db.collection('ads')
      .where('status', '==', 'active')
      .where('targetPortals', 'array-contains', this.portal)
      .onSnapshot(snapshot => {
        // Reload ads when changes detected
        this.loadAds();
      });
  }

  /**
   * Hide ads (user preference)
   */
  hideAds() {
    if (this.adContainer) {
      this.adContainer.style.display = 'none';
    }
    
    // Save preference
    localStorage.setItem('veriscript_ads_hidden', 'true');
    
    // Track hide action
    if (this.currentAds[this.currentIndex]) {
      this.trackAction(this.currentAds[this.currentIndex].id, 'hide');
    }
  }

  /**
   * Show ads
   */
  showAds() {
    if (this.adContainer) {
      this.adContainer.style.display = 'block';
    }
    
    localStorage.removeItem('veriscript_ads_hidden');
  }

  /**
   * Track custom action
   */
  async trackAction(adId, action) {
    try {
      await db.collection('adAnalytics').add({
        adId: adId,
        portal: this.portal,
        userId: this.userId,
        action: action,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error tracking action:', error);
    }
  }

  /**
   * Show default ad
   */
  showDefaultAd() {
    this.currentAds = [{
      id: 'default',
      text: 'VeriScript - The new standard in digital prescribing',
      link: 'https://veriscript.in',
      backgroundColor: '#2563eb',
      textColor: '#ffffff'
    }];
    
    this.displayAd(0);
  }

  /**
   * Destroy ads manager
   */
  destroy() {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }
    
    if (this.adContainer) {
      this.adContainer.remove();
    }
  }
}

// Global ads manager instance
let adsManager = null;

// Initialize ads when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if ads are hidden by user
  const adsHidden = localStorage.getItem('veriscript_ads_hidden');
  
  if (adsHidden !== 'true') {
    // Ads will be initialized by each portal
    adsManager = new AdsManager();
  }
});

// Add click tracking to ad links
document.addEventListener('click', (e) => {
  if (e.target.closest('#ad-text a')) {
    const ad = adsManager?.currentAds[adsManager.currentIndex];
    if (ad) {
      adsManager.trackClick(ad.id);
    }
  }
});

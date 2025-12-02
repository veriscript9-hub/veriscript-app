// VeriScript Branding & Customization System
// Complete white-label solution

class BrandingManager {
  constructor() {
    this.config = {
      // App Identity
      appName: 'VeriScript',
      appTagline: 'Create prescriptions in 30 seconds with AI voice',
      appDescription: 'Digital prescription platform for doctors',
      
      // Company Info
      companyName: 'VeriScript Healthcare',
      companyWebsite: 'https://veriscript.in',
      companyEmail: 'support@veriscript.in',
      companyPhone: '+91-XXXXXXXXXX',
      companyAddress: 'Mumbai, Maharashtra, India',
      
      // Branding
      logo: '/assets/icons/icon-192x192.png',
      favicon: '/assets/icons/icon-192x192.png',
      splashScreen: '/assets/splash.png',
      
      // Colors (Primary Theme)
      colors: {
        primary: '#667eea',
        primaryDark: '#5568d3',
        primaryLight: '#7c8ef5',
        secondary: '#764ba2',
        secondaryDark: '#5f3c82',
        secondaryLight: '#8d5ab8',
        accent: '#10b981',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
      },
      
      // Typography
      fonts: {
        primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        secondary: "'Poppins', sans-serif",
        mono: "'Fira Code', 'Courier New', monospace"
      },
      
      // Features
      features: {
        voiceDictation: true,
        qrCode: true,
        pdfExport: true,
        whatsappShare: true,
        analytics: true,
        darkMode: true,
        multiLanguage: true,
        patientPortal: true,
        chemistVerification: true
      },
      
      // Pricing
      pricing: {
        currency: '₹',
        plans: {
          free: {
            name: 'Free',
            price: 0,
            prescriptions: 10,
            features: ['Basic prescriptions', 'QR codes', 'PDF export']
          },
          basic: {
            name: 'Basic',
            price: 299,
            prescriptions: 100,
            features: ['Voice dictation', 'Analytics', 'WhatsApp share', 'Priority support']
          },
          pro: {
            name: 'Pro',
            price: 599,
            prescriptions: -1, // Unlimited
            features: ['Everything in Basic', 'Custom branding', 'API access', 'Dedicated support']
          }
        }
      },
      
      // Social Links
      social: {
        facebook: 'https://facebook.com/veriscript',
        twitter: 'https://twitter.com/veriscript',
        instagram: 'https://instagram.com/veriscript',
        linkedin: 'https://linkedin.com/company/veriscript',
        youtube: 'https://youtube.com/@veriscript'
      },
      
      // Legal
      legal: {
        termsUrl: '/legal/terms.html',
        privacyUrl: '/legal/privacy.html',
        refundUrl: '/legal/refund.html',
        copyrightYear: new Date().getFullYear(),
        copyrightText: '© 2024 VeriScript Healthcare. All rights reserved.'
      }
    };
    
    this.loadCustomBranding();
    this.applyBranding();
  }

  // Load custom branding from localStorage or API
  loadCustomBranding() {
    try {
      const custom = localStorage.getItem('custom_branding');
      if (custom) {
        const parsed = JSON.parse(custom);
        this.config = { ...this.config, ...parsed };
      }
    } catch (error) {
      console.error('Error loading custom branding:', error);
    }
  }

  // Apply branding to page
  applyBranding() {
    // Update document title
    document.title = `${this.config.appName} - ${this.config.appTagline}`;
    
    // Update meta tags
    this.updateMetaTags();
    
    // Apply colors
    this.applyColors();
    
    // Apply fonts
    this.applyFonts();
    
    // Update logo
    this.updateLogo();
  }

  // Update meta tags
  updateMetaTags() {
    // Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = this.config.appDescription;

    // Theme color
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.name = 'theme-color';
      document.head.appendChild(metaTheme);
    }
    metaTheme.content = this.config.colors.primary;

    // Favicon
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = this.config.favicon;
  }

  // Apply colors
  applyColors() {
    const root = document.documentElement;
    
    Object.entries(this.config.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Update CSS variables
    root.style.setProperty('--primary', this.config.colors.primary);
    root.style.setProperty('--primary-dark', this.config.colors.primaryDark);
    root.style.setProperty('--primary-light', this.config.colors.primaryLight);
    root.style.setProperty('--secondary', this.config.colors.secondary);
    root.style.setProperty('--success', this.config.colors.success);
    root.style.setProperty('--error', this.config.colors.error);
    root.style.setProperty('--warning', this.config.colors.warning);
    root.style.setProperty('--info', this.config.colors.info);
  }

  // Apply fonts
  applyFonts() {
    const root = document.documentElement;
    root.style.setProperty('--font-primary', this.config.fonts.primary);
    root.style.setProperty('--font-secondary', this.config.fonts.secondary);
    root.style.setProperty('--font-mono', this.config.fonts.mono);
  }

  // Update logo
  updateLogo() {
    document.querySelectorAll('.app-logo').forEach(img => {
      img.src = this.config.logo;
      img.alt = this.config.appName;
    });
  }

  // Get config value
  get(key) {
    const keys = key.split('.');
    let value = this.config;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    return value;
  }

  // Set config value
  set(key, value) {
    const keys = key.split('.');
    let obj = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    
    obj[keys[keys.length - 1]] = value;
    this.saveBranding();
    this.applyBranding();
  }

  // Save branding
  saveBranding() {
    try {
      localStorage.setItem('custom_branding', JSON.stringify(this.config));
    } catch (error) {
      console.error('Error saving branding:', error);
    }
  }

  // Reset to defaults
  reset() {
    localStorage.removeItem('custom_branding');
    window.location.reload();
  }

  // Export branding config
  export() {
    return JSON.stringify(this.config, null, 2);
  }

  // Import branding config
  import(jsonString) {
    try {
      const config = JSON.parse(jsonString);
      this.config = { ...this.config, ...config };
      this.saveBranding();
      this.applyBranding();
      return true;
    } catch (error) {
      console.error('Error importing branding:', error);
      return false;
    }
  }
}

// Global instance
const brandingManager = new BrandingManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BrandingManager, brandingManager };
}

console.log('✅ Branding module loaded');

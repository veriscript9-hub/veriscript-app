// VeriScript API Integration System
// Connect with external services and APIs

class APIIntegrationManager {
  constructor() {
    this.integrations = {
      // SMS Gateway
      sms: {
        enabled: false,
        provider: 'twilio', // twilio, msg91, textlocal
        config: {
          twilio: {
            accountSid: '',
            authToken: '',
            fromNumber: ''
          },
          msg91: {
            authKey: '',
            senderId: ''
          },
          textlocal: {
            apiKey: '',
            sender: ''
          }
        }
      },

      // Email Service
      email: {
        enabled: false,
        provider: 'sendgrid', // sendgrid, mailgun, ses
        config: {
          sendgrid: {
            apiKey: '',
            fromEmail: '',
            fromName: ''
          },
          mailgun: {
            apiKey: '',
            domain: '',
            fromEmail: ''
          },
          ses: {
            accessKeyId: '',
            secretAccessKey: '',
            region: 'us-east-1',
            fromEmail: ''
          }
        }
      },

      // Payment Gateway
      payment: {
        enabled: false,
        provider: 'razorpay', // razorpay, stripe, paytm
        config: {
          razorpay: {
            keyId: '',
            keySecret: ''
          },
          stripe: {
            publishableKey: '',
            secretKey: ''
          },
          paytm: {
            merchantId: '',
            merchantKey: ''
          }
        }
      },

      // Analytics
      analytics: {
        enabled: false,
        providers: {
          googleAnalytics: {
            enabled: false,
            measurementId: ''
          },
          mixpanel: {
            enabled: false,
            token: ''
          },
          amplitude: {
            enabled: false,
            apiKey: ''
          }
        }
      },

      // Cloud Storage
      storage: {
        enabled: false,
        provider: 'cloudinary', // cloudinary, s3, gcs
        config: {
          cloudinary: {
            cloudName: '',
            apiKey: '',
            apiSecret: ''
          },
          s3: {
            accessKeyId: '',
            secretAccessKey: '',
            bucket: '',
            region: 'us-east-1'
          },
          gcs: {
            projectId: '',
            bucket: ''
          }
        }
      },

      // Medical APIs
      medical: {
        enabled: false,
        providers: {
          drugDatabase: {
            enabled: false,
            apiKey: '',
            endpoint: 'https://api.fda.gov/drug/'
          },
          icd10: {
            enabled: false,
            apiKey: '',
            endpoint: 'https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search'
          }
        }
      },

      // AI Services
      ai: {
        enabled: true,
        providers: {
          openai: {
            enabled: true,
            apiKey: OPENAI_API_KEY || '',
            model: 'gpt-4',
            temperature: 0.1
          },
          anthropic: {
            enabled: false,
            apiKey: '',
            model: 'claude-3-opus'
          },
          gemini: {
            enabled: false,
            apiKey: '',
            model: 'gemini-pro'
          }
        }
      },

      // Notification Services
      notifications: {
        enabled: false,
        providers: {
          fcm: {
            enabled: false,
            serverKey: '',
            senderId: ''
          },
          onesignal: {
            enabled: false,
            appId: '',
            apiKey: ''
          }
        }
      }
    };

    this.loadIntegrations();
  }

  // Load integrations from localStorage
  loadIntegrations() {
    try {
      const saved = localStorage.getItem('api_integrations');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.integrations = { ...this.integrations, ...parsed };
      }
    } catch (error) {
      console.error('Error loading integrations:', error);
    }
  }

  // Save integrations
  saveIntegrations() {
    try {
      localStorage.setItem('api_integrations', JSON.stringify(this.integrations));
    } catch (error) {
      console.error('Error saving integrations:', error);
    }
  }

  // ==================== SMS INTEGRATION ====================

  async sendSMS(to, message) {
    if (!this.integrations.sms.enabled) {
      console.log('SMS integration not enabled');
      return { success: false, error: 'SMS not enabled' };
    }

    const provider = this.integrations.sms.provider;
    const config = this.integrations.sms.config[provider];

    try {
      switch (provider) {
        case 'twilio':
          return await this.sendTwilioSMS(to, message, config);
        case 'msg91':
          return await this.sendMsg91SMS(to, message, config);
        case 'textlocal':
          return await this.sendTextLocalSMS(to, message, config);
        default:
          throw new Error('Invalid SMS provider');
      }
    } catch (error) {
      console.error('SMS send error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendTwilioSMS(to, message, config) {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${config.accountSid}:${config.authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: to,
        From: config.fromNumber,
        Body: message
      })
    });

    const data = await response.json();
    return { success: response.ok, data };
  }

  // ==================== EMAIL INTEGRATION ====================

  async sendEmail(to, subject, body) {
    if (!this.integrations.email.enabled) {
      console.log('Email integration not enabled');
      return { success: false, error: 'Email not enabled' };
    }

    const provider = this.integrations.email.provider;
    const config = this.integrations.email.config[provider];

    try {
      switch (provider) {
        case 'sendgrid':
          return await this.sendSendGridEmail(to, subject, body, config);
        case 'mailgun':
          return await this.sendMailgunEmail(to, subject, body, config);
        default:
          throw new Error('Invalid email provider');
      }
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendSendGridEmail(to, subject, body, config) {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: config.fromEmail, name: config.fromName },
        subject: subject,
        content: [{ type: 'text/html', value: body }]
      })
    });

    return { success: response.ok };
  }

  // ==================== PAYMENT INTEGRATION ====================

  async createPaymentOrder(amount, currency = 'INR') {
    if (!this.integrations.payment.enabled) {
      console.log('Payment integration not enabled');
      return { success: false, error: 'Payment not enabled' };
    }

    const provider = this.integrations.payment.provider;
    const config = this.integrations.payment.config[provider];

    try {
      switch (provider) {
        case 'razorpay':
          return await this.createRazorpayOrder(amount, currency, config);
        case 'stripe':
          return await this.createStripePayment(amount, currency, config);
        default:
          throw new Error('Invalid payment provider');
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      return { success: false, error: error.message };
    }
  }

  async createRazorpayOrder(amount, currency, config) {
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${config.keyId}:${config.keySecret}`),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paise
        currency: currency,
        receipt: `receipt_${Date.now()}`
      })
    });

    const data = await response.json();
    return { success: response.ok, data };
  }

  // ==================== ANALYTICS INTEGRATION ====================

  trackEvent(eventName, properties = {}) {
    const analytics = this.integrations.analytics;

    if (!analytics.enabled) return;

    // Google Analytics
    if (analytics.providers.googleAnalytics.enabled && window.gtag) {
      window.gtag('event', eventName, properties);
    }

    // Mixpanel
    if (analytics.providers.mixpanel.enabled && window.mixpanel) {
      window.mixpanel.track(eventName, properties);
    }

    // Amplitude
    if (analytics.providers.amplitude.enabled && window.amplitude) {
      window.amplitude.getInstance().logEvent(eventName, properties);
    }
  }

  // ==================== CLOUD STORAGE INTEGRATION ====================

  async uploadFile(file) {
    if (!this.integrations.storage.enabled) {
      console.log('Storage integration not enabled');
      return { success: false, error: 'Storage not enabled' };
    }

    const provider = this.integrations.storage.provider;
    const config = this.integrations.storage.config[provider];

    try {
      switch (provider) {
        case 'cloudinary':
          return await this.uploadToCloudinary(file, config);
        default:
          throw new Error('Invalid storage provider');
      }
    } catch (error) {
      console.error('File upload error:', error);
      return { success: false, error: error.message };
    }
  }

  async uploadToCloudinary(file, config) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'veriscript');
    formData.append('cloud_name', config.cloudName);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    const data = await response.json();
    return { success: response.ok, data };
  }

  // ==================== MEDICAL API INTEGRATION ====================

  async searchDrug(query) {
    if (!this.integrations.medical.enabled) {
      return { success: false, error: 'Medical API not enabled' };
    }

    const config = this.integrations.medical.providers.drugDatabase;
    if (!config.enabled) {
      return { success: false, error: 'Drug database not enabled' };
    }

    try {
      const response = await fetch(
        `${config.endpoint}search.json?search=${encodeURIComponent(query)}&limit=10`
      );
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Drug search error:', error);
      return { success: false, error: error.message };
    }
  }

  async searchICD10(query) {
    if (!this.integrations.medical.enabled) {
      return { success: false, error: 'Medical API not enabled' };
    }

    const config = this.integrations.medical.providers.icd10;
    if (!config.enabled) {
      return { success: false, error: 'ICD-10 not enabled' };
    }

    try {
      const response = await fetch(
        `${config.endpoint}?sf=code,name&terms=${encodeURIComponent(query)}&maxList=10`
      );
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('ICD-10 search error:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== CONFIGURATION ====================

  enableIntegration(type, provider = null) {
    if (provider) {
      this.integrations[type].providers[provider].enabled = true;
    } else {
      this.integrations[type].enabled = true;
    }
    this.saveIntegrations();
  }

  disableIntegration(type, provider = null) {
    if (provider) {
      this.integrations[type].providers[provider].enabled = false;
    } else {
      this.integrations[type].enabled = false;
    }
    this.saveIntegrations();
  }

  setConfig(type, provider, config) {
    if (this.integrations[type].config) {
      this.integrations[type].config[provider] = {
        ...this.integrations[type].config[provider],
        ...config
      };
    } else if (this.integrations[type].providers) {
      this.integrations[type].providers[provider] = {
        ...this.integrations[type].providers[provider],
        ...config
      };
    }
    this.saveIntegrations();
  }

  getConfig(type, provider = null) {
    if (provider) {
      return this.integrations[type].config?.[provider] || 
             this.integrations[type].providers?.[provider];
    }
    return this.integrations[type];
  }
}

// Global instance
const apiIntegrations = new APIIntegrationManager();

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { APIIntegrationManager, apiIntegrations };
}

console.log('✅ API Integrations module loaded');

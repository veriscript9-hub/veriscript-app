// VeriScript Authentication System
// Complete Firebase Authentication Implementation

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.authStateListeners = [];
    this.initialized = false;
  }

  // Initialize authentication
  async initialize() {
    if (this.initialized) return;

    try {
      // Listen for auth state changes
      firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
          // User is signed in
          await this.handleUserSignedIn(user);
        } else {
          // User is signed out
          this.handleUserSignedOut();
        }

        // Notify listeners
        this.notifyAuthStateListeners(user);
      });

      this.initialized = true;
      console.log('✅ Auth Manager initialized');
    } catch (error) {
      console.error('❌ Auth initialization failed:', error);
      throw error;
    }
  }

  // Handle user signed in
  async handleUserSignedIn(user) {
    try {
      // Get user data from Firestore
      const userDoc = await firebase.firestore()
        .collection('users')
        .doc(user.uid)
        .get();

      if (userDoc.exists) {
        this.currentUser = {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          ...userDoc.data()
        };
      } else {
        // Create user document if doesn't exist
        this.currentUser = {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        };
      }

      console.log('✅ User signed in:', this.currentUser.email);
    } catch (error) {
      console.error('❌ Error handling signed in user:', error);
    }
  }

  // Handle user signed out
  handleUserSignedOut() {
    this.currentUser = null;
    console.log('✅ User signed out');
  }

  // Register new user (OPTIMIZED)
async register(email, password, userData) {
  try {
    // Create user account (fast - 2 seconds)
    const userCredential = await firebase.auth()
      .createUserWithEmailAndPassword(email, password);

    const user = userCredential.user;

    // Skip email verification for faster registration
    // user.sendEmailVerification().catch(err => console.log('Email verification skipped'));

    // Create user document in Firestore (async - don't wait!)
    firebase.firestore()
      .collection('users')
      .doc(user.uid)
      .set({
        email: email,
        name: userData.name,
        phone: userData.phone,
        role: userData.role || 'doctor',
        profile: {
          specialization: userData.specialization || '',
          licenseNumber: userData.licenseNumber || '',
          clinic: userData.clinic || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || ''
        },
        plan: 'free',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      })
      .catch(err => console.error('Firestore error:', err));

    return {
      success: true,
      user: user
    };
  } catch (error) {
    console.error('❌ Registration error:', error);

    return {
      success: false,
      error: error
    };
  }
}
    try {
      utils.showLoader('Creating account...');

      // Create user account
      const userCredential = await firebase.auth()
        .createUserWithEmailAndPassword(email, password);

      const user = userCredential.user;

      // Send email verification
      await user.sendEmailVerification();

      // Create user document in Firestore
      await firebase.firestore()
        .collection('users')
        .doc(user.uid)
        .set({
          email: email,
          name: userData.name,
          phone: userData.phone,
          role: userData.role || 'doctor',
          profile: {
            specialization: userData.specialization || '',
            licenseNumber: userData.licenseNumber || '',
            clinic: userData.clinic || '',
            address: userData.address || '',
            city: userData.city || '',
            state: userData.state || ''
          },
          plan: 'free',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

      utils.hideLoader();
      utils.showToast('Account created! Please verify your email.', 'success');

      return {
        success: true,
        user: user
      };
    } catch (error) {
      utils.hideLoader();
      console.error('❌ Registration error:', error);

      let message = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Email already in use. Please login instead.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak. Use at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }

      utils.showToast(message, 'error');

      return {
        success: false,
        error: error
      };
    }
  }

  // Login user
  async login(email, password) {
    try {
      utils.showLoader('Signing in...');

      const userCredential = await firebase.auth()
        .signInWithEmailAndPassword(email, password);

      utils.hideLoader();
      utils.showToast('Welcome back!', 'success');

      return {
        success: true,
        user: userCredential.user
      };
    } catch (error) {
      utils.hideLoader();
      console.error('❌ Login error:', error);

      let message = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (error.code === 'auth/user-disabled') {
        message = 'This account has been disabled.';
      }

      utils.showToast(message, 'error');

      return {
        success: false,
        error: error
      };
    }
  }

  // Login with Google
  async loginWithGoogle() {
    try {
      utils.showLoader('Signing in with Google...');

      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await firebase.auth().signInWithPopup(provider);

      // Check if user document exists
      const userDoc = await firebase.firestore()
        .collection('users')
        .doc(result.user.uid)
        .get();

      if (!userDoc.exists) {
        // Create user document for new Google users
        await firebase.firestore()
          .collection('users')
          .doc(result.user.uid)
          .set({
            email: result.user.email,
            name: result.user.displayName,
            phone: result.user.phoneNumber || '',
            role: 'doctor',
            profile: {},
            plan: 'free',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
      }

      utils.hideLoader();
      utils.showToast('Welcome!', 'success');

      return {
        success: true,
        user: result.user
      };
    } catch (error) {
      utils.hideLoader();
      console.error('❌ Google login error:', error);

      if (error.code !== 'auth/popup-closed-by-user') {
        utils.showToast('Google sign-in failed. Please try again.', 'error');
      }

      return {
        success: false,
        error: error
      };
    }
  }

  // Logout user
  async logout() {
    try {
      utils.showLoader('Signing out...');

      await firebase.auth().signOut();

      utils.hideLoader();
      utils.showToast('Signed out successfully', 'success');

      // Redirect to login
      window.location.href = '/pages/auth/login.html';

      return { success: true };
    } catch (error) {
      utils.hideLoader();
      console.error('❌ Logout error:', error);
      utils.showToast('Logout failed. Please try again.', 'error');

      return {
        success: false,
        error: error
      };
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      utils.showLoader('Sending reset email...');

      await firebase.auth().sendPasswordResetEmail(email);

      utils.hideLoader();
      utils.showToast('Password reset email sent!', 'success');

      return { success: true };
    } catch (error) {
      utils.hideLoader();
      console.error('❌ Password reset error:', error);

      let message = 'Failed to send reset email.';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }

      utils.showToast(message, 'error');

      return {
        success: false,
        error: error
      };
    }
  }

  // Update password
  async updatePassword(newPassword) {
    try {
      const user = firebase.auth().currentUser;

      if (!user) {
        throw new Error('No user signed in');
      }

      await user.updatePassword(newPassword);

      utils.showToast('Password updated successfully', 'success');

      return { success: true };
    } catch (error) {
      console.error('❌ Password update error:', error);

      let message = 'Failed to update password.';
      if (error.code === 'auth/requires-recent-login') {
        message = 'Please sign in again to update password.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak. Use at least 6 characters.';
      }

      utils.showToast(message, 'error');

      return {
        success: false,
        error: error
      };
    }
  }

  // Update profile
  async updateProfile(updates) {
    try {
      const user = firebase.auth().currentUser;

      if (!user) {
        throw new Error('No user signed in');
      }

      // Update Firestore document
      await firebase.firestore()
        .collection('users')
        .doc(user.uid)
        .update({
          ...updates,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

      // Update local user object
      this.currentUser = {
        ...this.currentUser,
        ...updates
      };

      utils.showToast('Profile updated successfully', 'success');

      return { success: true };
    } catch (error) {
      console.error('❌ Profile update error:', error);
      utils.showToast('Failed to update profile', 'error');

      return {
        success: false,
        error: error
      };
    }
  }

  // Send email verification
  async sendEmailVerification() {
    try {
      const user = firebase.auth().currentUser;

      if (!user) {
        throw new Error('No user signed in');
      }

      await user.sendEmailVerification();

      utils.showToast('Verification email sent!', 'success');

      return { success: true };
    } catch (error) {
      console.error('❌ Email verification error:', error);
      utils.showToast('Failed to send verification email', 'error');

      return {
        success: false,
        error: error
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if email is verified
  isEmailVerified() {
    return this.currentUser?.emailVerified || false;
  }

  // Add auth state listener
  onAuthStateChanged(callback) {
    this.authStateListeners.push(callback);
  }

  // Notify auth state listeners
  notifyAuthStateListeners(user) {
    this.authStateListeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('❌ Auth state listener error:', error);
      }
    });
  }

  // Require authentication (for protected pages)
  requireAuth(redirectUrl = '/pages/auth/login.html') {
    if (!this.isAuthenticated()) {
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  }

  // Require email verification
  requireEmailVerification(redirectUrl = '/pages/auth/verify-email.html') {
    if (!this.isEmailVerified()) {
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  }
}

// Create global auth manager instance
const authManager = new AuthManager();

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  authManager.initialize();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuthManager, authManager };
}

console.log('✅ Auth module loaded');

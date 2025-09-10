import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
import { auth } from './firebase-config.js';

/**
 * Authentication Service for Cookie Manager Extension
 * Handles user authentication and session management
 */
class AuthService {
    constructor() {
        this.currentUser = null;
        this.authStateListeners = [];
        this.setupAuthStateListener();
    }

    /**
     * Setup authentication state listener
     */
    setupAuthStateListener() {
        onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            this.authStateListeners.forEach(listener => {
                listener(user);
            });
        });
    }

    /**
     * Add authentication state listener
     * @param {Function} callback - Callback function
     */
    onAuthStateChange(callback) {
        this.authStateListeners.push(callback);
    }

    /**
     * Sign in with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} - Result object
     */
    async signInWithEmail(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            return {
                success: true,
                message: 'Signed in successfully',
                data: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName
                }
            };
        } catch (error) {
            console.error('Sign in error:', error);
            return {
                success: false,
                message: this.getErrorMessage(error.code),
                error: error.code
            };
        }
    }

    /**
     * Sign up with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} displayName - User display name
     * @returns {Promise<Object>} - Result object
     */
    async signUpWithEmail(email, password, displayName = '') {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            if (displayName) {
                await updateProfile(user, { displayName });
            }
            
            return {
                success: true,
                message: 'Account created successfully',
                data: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName
                }
            };
        } catch (error) {
            console.error('Sign up error:', error);
            return {
                success: false,
                message: this.getErrorMessage(error.code),
                error: error.code
            };
        }
    }

    /**
     * Sign in with Google
     * @returns {Promise<Object>} - Result object
     */
    async signInWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;
            
            return {
                success: true,
                message: 'Signed in with Google successfully',
                data: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                }
            };
        } catch (error) {
            console.error('Google sign in error:', error);
            return {
                success: false,
                message: this.getErrorMessage(error.code),
                error: error.code
            };
        }
    }

    /**
     * Sign out current user
     * @returns {Promise<Object>} - Result object
     */
    async signOut() {
        try {
            await signOut(auth);
            return {
                success: true,
                message: 'Signed out successfully',
                data: null
            };
        } catch (error) {
            console.error('Sign out error:', error);
            return {
                success: false,
                message: 'Failed to sign out',
                error: error.code
            };
        }
    }

    /**
     * Send password reset email
     * @param {string} email - User email
     * @returns {Promise<Object>} - Result object
     */
    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            return {
                success: true,
                message: 'Password reset email sent',
                data: { email }
            };
        } catch (error) {
            console.error('Password reset error:', error);
            return {
                success: false,
                message: this.getErrorMessage(error.code),
                error: error.code
            };
        }
    }

    /**
     * Get current user
     * @returns {Object|null} - Current user or null
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} - Authentication status
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Get user ID
     * @returns {string|null} - User ID or null
     */
    getUserId() {
        return this.currentUser ? this.currentUser.uid : null;
    }

    /**
     * Get user email
     * @returns {string|null} - User email or null
     */
    getUserEmail() {
        return this.currentUser ? this.currentUser.email : null;
    }

    /**
     * Get user display name
     * @returns {string|null} - User display name or null
     */
    getUserDisplayName() {
        return this.currentUser ? this.currentUser.displayName : null;
    }

    /**
     * Get user photo URL
     * @returns {string|null} - User photo URL or null
     */
    getUserPhotoURL() {
        return this.currentUser ? this.currentUser.photoURL : null;
    }

    /**
     * Get error message from error code
     * @param {string} errorCode - Firebase error code
     * @returns {string} - Human readable error message
     */
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'No account found with this email address',
            'auth/wrong-password': 'Incorrect password',
            'auth/email-already-in-use': 'An account with this email already exists',
            'auth/weak-password': 'Password should be at least 6 characters',
            'auth/invalid-email': 'Invalid email address',
            'auth/user-disabled': 'This account has been disabled',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later',
            'auth/network-request-failed': 'Network error. Please check your connection',
            'auth/popup-closed-by-user': 'Sign-in popup was closed',
            'auth/cancelled-popup-request': 'Sign-in was cancelled',
            'auth/account-exists-with-different-credential': 'An account already exists with this email'
        };

        return errorMessages[errorCode] || 'An error occurred. Please try again.';
    }

    /**
     * Get authentication token
     * @returns {Promise<string|null>} - ID token or null
     */
    async getAuthToken() {
        if (!this.currentUser) return null;
        
        try {
            return await this.currentUser.getIdToken();
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    }
}

export default AuthService;

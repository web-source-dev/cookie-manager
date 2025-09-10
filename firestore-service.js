import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs, 
    deleteDoc, 
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';
import { db } from './firebase-config.js';

/**
 * Firestore Service for Cookie Manager Extension
 * Handles all database operations for cookies and user data
 */
class FirestoreService {
    constructor() {
        this.collections = {
            users: 'users',
            cookies: 'cookies',
            domains: 'domains',
            sessions: 'sessions'
        };
    }

    /**
     * Save cookies for a specific domain
     * @param {string} userId - User ID
     * @param {string} domain - Domain name
     * @param {Array} cookies - Array of cookie objects
     * @returns {Promise<Object>} - Result object
     */
    async saveCookies(userId, domain, cookies) {
        try {
            const cookieId = `${userId}_${domain}`;
            const cookieRef = doc(db, this.collections.cookies, cookieId);
            
            const cookieData = {
                userId,
                domain,
                cookies: cookies.map(cookie => ({
                    name: cookie.name,
                    value: cookie.value,
                    domain: cookie.domain,
                    path: cookie.path,
                    expires: cookie.expires,
                    httpOnly: cookie.httpOnly,
                    secure: cookie.secure,
                    sameSite: cookie.sameSite
                })),
                savedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                cookieCount: cookies.length
            };

            await setDoc(cookieRef, cookieData, { merge: true });
            
            // Update user's domain list
            await this.updateUserDomains(userId, domain, 'add');
            
            return {
                success: true,
                message: `Saved ${cookies.length} cookies for ${domain}`,
                data: { cookieId, domain, cookieCount: cookies.length }
            };
        } catch (error) {
            console.error('Error saving cookies:', error);
            return {
                success: false,
                message: 'Failed to save cookies',
                error: error.message
            };
        }
    }

    /**
     * Load cookies for a specific domain
     * @param {string} userId - User ID
     * @param {string} domain - Domain name
     * @returns {Promise<Object>} - Result object with cookies
     */
    async loadCookies(userId, domain) {
        try {
            const cookieId = `${userId}_${domain}`;
            const cookieRef = doc(db, this.collections.cookies, cookieId);
            const cookieSnap = await getDoc(cookieRef);

            if (!cookieSnap.exists()) {
                return {
                    success: false,
                    message: `No cookies found for ${domain}`,
                    data: null
                };
            }

            const cookieData = cookieSnap.data();
            return {
                success: true,
                message: `Loaded ${cookieData.cookieCount} cookies for ${domain}`,
                data: {
                    domain: cookieData.domain,
                    cookies: cookieData.cookies,
                    savedAt: cookieData.savedAt,
                    updatedAt: cookieData.updatedAt
                }
            };
        } catch (error) {
            console.error('Error loading cookies:', error);
            return {
                success: false,
                message: 'Failed to load cookies',
                error: error.message
            };
        }
    }

    /**
     * Get all saved domains for a user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} - Result object with domains
     */
    async getUserDomains(userId) {
        try {
            const userRef = doc(db, this.collections.users, userId);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                return {
                    success: true,
                    message: 'No domains found',
                    data: []
                };
            }

            const userData = userSnap.data();
            return {
                success: true,
                message: `Found ${userData.domains?.length || 0} domains`,
                data: userData.domains || []
            };
        } catch (error) {
            console.error('Error getting user domains:', error);
            return {
                success: false,
                message: 'Failed to get domains',
                error: error.message
            };
        }
    }

    /**
     * Delete cookies for a specific domain
     * @param {string} userId - User ID
     * @param {string} domain - Domain name
     * @returns {Promise<Object>} - Result object
     */
    async deleteCookies(userId, domain) {
        try {
            const cookieId = `${userId}_${domain}`;
            const cookieRef = doc(db, this.collections.cookies, cookieId);
            
            await deleteDoc(cookieRef);
            
            // Update user's domain list
            await this.updateUserDomains(userId, domain, 'remove');
            
            return {
                success: true,
                message: `Deleted cookies for ${domain}`,
                data: { domain }
            };
        } catch (error) {
            console.error('Error deleting cookies:', error);
            return {
                success: false,
                message: 'Failed to delete cookies',
                error: error.message
            };
        }
    }

    /**
     * Get user statistics
     * @param {string} userId - User ID
     * @returns {Promise<Object>} - Result object with stats
     */
    async getUserStats(userId) {
        try {
            const cookiesQuery = query(
                collection(db, this.collections.cookies),
                where('userId', '==', userId)
            );
            
            const cookiesSnap = await getDocs(cookiesQuery);
            const cookies = [];
            let totalCookies = 0;
            
            cookiesSnap.forEach(doc => {
                const data = doc.data();
                cookies.push({
                    domain: data.domain,
                    cookieCount: data.cookieCount,
                    savedAt: data.savedAt,
                    updatedAt: data.updatedAt
                });
                totalCookies += data.cookieCount;
            });

            return {
                success: true,
                message: 'Stats retrieved successfully',
                data: {
                    totalDomains: cookies.length,
                    totalCookies,
                    domains: cookies
                }
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            return {
                success: false,
                message: 'Failed to get stats',
                error: error.message
            };
        }
    }

    /**
     * Update user's domain list
     * @param {string} userId - User ID
     * @param {string} domain - Domain name
     * @param {string} action - 'add' or 'remove'
     */
    async updateUserDomains(userId, domain, action) {
        try {
            const userRef = doc(db, this.collections.users, userId);
            
            if (action === 'add') {
                await setDoc(userRef, {
                    domains: arrayUnion(domain),
                    updatedAt: serverTimestamp()
                }, { merge: true });
            } else if (action === 'remove') {
                await setDoc(userRef, {
                    domains: arrayRemove(domain),
                    updatedAt: serverTimestamp()
                }, { merge: true });
            }
        } catch (error) {
            console.error('Error updating user domains:', error);
        }
    }

    /**
     * Create or update user profile
     * @param {string} userId - User ID
     * @param {Object} userData - User data
     * @returns {Promise<Object>} - Result object
     */
    async createUser(userId, userData) {
        try {
            const userRef = doc(db, this.collections.users, userId);
            
            await setDoc(userRef, {
                ...userData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                domains: []
            }, { merge: true });

            return {
                success: true,
                message: 'User created successfully',
                data: { userId }
            };
        } catch (error) {
            console.error('Error creating user:', error);
            return {
                success: false,
                message: 'Failed to create user',
                error: error.message
            };
        }
    }

    /**
     * Sync local storage with Firestore
     * @param {string} userId - User ID
     * @returns {Promise<Object>} - Result object
     */
    async syncWithFirestore(userId) {
        try {
            // Get all local cookies from Chrome storage
            const localData = await chrome.storage.local.get();
            const domains = Object.keys(localData).filter(key => key !== '__DOMAIN_LIST__' && key !== 'autoSync' && key !== 'syncInterval' && key !== 'backupEnabled' && key !== 'notificationsEnabled');
            
            let syncedCount = 0;
            const results = [];

            for (const domain of domains) {
                try {
                    const domainData = JSON.parse(localData[domain]);
                    if (domainData.cookies && Array.isArray(domainData.cookies)) {
                        const result = await this.saveCookies(userId, domain, domainData.cookies);
                        if (result.success) {
                            syncedCount++;
                        }
                        results.push(result);
                    }
                } catch (error) {
                    console.error(`Error syncing domain ${domain}:`, error);
                }
            }

            return {
                success: true,
                message: `Synced ${syncedCount} domains to Firestore`,
                data: { syncedCount, totalDomains: domains.length, results }
            };
        } catch (error) {
            console.error('Error syncing with Firestore:', error);
            return {
                success: false,
                message: 'Failed to sync with Firestore',
                error: error.message
            };
        }
    }
}

export default FirestoreService;

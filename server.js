import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import FirestoreService from './firestore-service.js';
import AuthService from './auth-service.js';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
const serviceAccount = {
    type: "service_account",
    project_id: "kuch-bhi-b9078",
    private_key_id: "6d1bc406d41f23f2a62ab59ff6080590eaa739a8",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC72/jCdQJkFYrw\naldUxclP0KEf8n+nS+a3l+QXGBByJspg88eLjU5CMGGLl4LwFbZ9DeFftrCqMJO3\nJ8M/hg8sr6y0adxtXJojXSJhlgf8fPuZrBNT7obrF4NawzoTxwtAjcGfT2YcSf2o\nBfFLx552gPGCqwBynkTejb3JBlUgrAMnxZaxEaUYrbBeA/0sQx5jL0LSG73wh4QP\nG2U/TqUV168mrPIxxc/apPCtce78LaBjVWGsTe9YSEFXXqd+qq9BC0EzYh06vZDJ\nlz4EjBVcIvMIf2zxvKxQh5KqBfb9HoI7soYnl3nfGSjrdpP41Ti1dwS8MKx+PIKb\ndLIWc3kJAgMBAAECggEADSCAX/o0KhE1TbpoktRlTk36TFSyJdsQaqjS9+gnEgry\n3lZ6jZ5YpxhhYJM8Q5GI2HE1W+5UpvfRAp3lL1WrTsiRzWOOUxgC71CtO9tzgGmt\nXR4glZ9Xzyqr85Yrw0EH4MFnE75FGNn0vx53L3/p60b0WVigpeG4V0LZTahDH462\nuTGN6On9Ndl/Of/hhKPtbSuBvV64pyfkV/xjMiW4vR5glt21LxqkOEiV/T7ni6/L\nCblB4qcE63YtCQqdK1xutfzZel92adQDglj0lxFNxwov8BHQrInD+zaiOQTtNw9m\nmmC/zoiTmopVqAuykODGK18mqFbVtNkt0M7zIMXD2QKBgQDxiAh+SjsMFjyH75sx\nOsU2FzWDIOcw42H/rB5pN5L8d6ub5LKENDJZDxSKNOWmp//TdudlcIpR3NY9eDwj\nyIikxc3Jm0Nw36wnjCwxS5F7Z6rhdyNWdEHzIS+q2SBM+75oJ2mrTLz5KEM+HAXr\nCgOpVnlQmigWgsZAs3+IR6d4FQKBgQDHHNuyDFb308C6q1X0+UPgzPGQdmY3zwmm\nfkh4EsANo/OTSTqS1wq2G4qu31s9pYY5SYtwbem1NqAiRQ//13jvfEyBrAYlAJ+w\nYc/X3doMK4ilBWWMrHfCcBIWn/J69xVE1AGgVqAiWKU3WIvSWf2GFVK6Vqo/98dj\nllrZ8LwmJQKBgEEx8Oj17H5Uuj4PJRrivDzfguhER2Ng3SEAOq03/Qr82muYDb+1\nvyle8rJjmOGlU16nJ8qv2AZEz+eDvugBxzCC3AthR5D+Lx/1rDAaL8jZsLxvRjCd\n7PdNq+o39YoSIdFHYjSE4DV48r2fHtHUwCxDVTe2hL+eyRjJ2tDUVpYJAoGASjak\nYEGfLLH9VNZFrJA3z5Mzul+XC9gcRbUt96stcCgawlv5+/8w2916HGHd1SVb2QBj\ne51MDaH1n7BUHUzHo6OVtINUqvgHjSt314K2IfEb9j4DsqIZ5Rv2cf5d150+jS/k\nB0oiV4ro0a8sNlQaXZ6W/iMNQ9hrtd+1ryO+TQ0CgYAZWDaZdWvYM6BRYE1dOEWE\nWRjGMNHoJJ0vHxEBiC+Y6qKno6FfpL4nxfbMRs7CD49dHuDKQM1ISFpILfybmiHZ\nO0fVxfBN6548wlhO0KUi+xdZDNulgwZ/3IMy7EMNcG+e5sqrSFiWnjMqk6HPfRv+\nKsN5f89U/W6+w3NuxWb4eQ==\n-----END PRIVATE KEY-----\n",
    client_email: "firebase-adminsdk-cme2f@kuch-bhi-b9078.iam.gserviceaccount.com",
    client_id: "111367130577240292928",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-cme2f%40kuch-bhi-b9078.iam.gserviceaccount.com",
    universe_domain: "googleapis.com"
};

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "kuch-bhi-b9078"
});

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize services
const firestoreService = new FirestoreService();
const authService = new AuthService();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['chrome-extension://*'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Authentication middleware using Firebase Admin SDK
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No authentication token provided' 
            });
        }

        // Verify token with Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.userId = decodedToken.uid; // Real user ID from verified token
        req.userEmail = decodedToken.email;
        req.userName = decodedToken.name;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ 
            success: false, 
            message: 'Invalid or expired authentication token',
            error: error.message
        });
    }
};

// API Routes

// Authentication endpoints
app.post('/api/auth/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Use Firebase Admin SDK to create custom token
        // Note: For production, you should use Firebase Auth REST API
        // This is a simplified version for demonstration
        const result = await authService.signInWithEmail(email, password);
        
        if (result.success) {
            // Create custom token for the user
            const customToken = await admin.auth().createCustomToken(result.data.uid);
            
            res.status(200).json({
                success: true,
                message: 'Signed in successfully',
                data: {
                    ...result.data,
                    token: customToken
                }
            });
        } else {
            res.status(401).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, displayName } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const result = await authService.signUpWithEmail(email, password, displayName);
        
        if (result.success) {
            // Create custom token for the new user
            const customToken = await admin.auth().createCustomToken(result.data.uid);
            
            // Create user profile in Firestore
            await firestoreService.createUser(result.data.uid, {
                email: result.data.email,
                displayName: result.data.displayName || displayName
            });
            
            res.status(201).json({
                success: true,
                message: 'Account created successfully',
                data: {
                    ...result.data,
                    token: customToken
                }
            });
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

app.post('/api/auth/signout', authenticateUser, async (req, res) => {
    try {
        const result = await authService.signOut();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Save cookies
app.post('/api/cookies/save', authenticateUser, async (req, res) => {
    try {
        const { domain, cookies } = req.body;
        const userId = req.userId;

        if (!domain || !cookies || !Array.isArray(cookies)) {
            return res.status(400).json({
                success: false,
                message: 'Domain and cookies array are required'
            });
        }

        const result = await firestoreService.saveCookies(userId, domain, cookies);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Load cookies
app.get('/api/cookies/load/:domain', authenticateUser, async (req, res) => {
    try {
        const { domain } = req.params;
        const userId = req.userId;

        const result = await firestoreService.loadCookies(userId, domain);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get user domains
app.get('/api/domains', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId;
        const result = await firestoreService.getUserDomains(userId);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Delete cookies
app.delete('/api/cookies/:domain', authenticateUser, async (req, res) => {
    try {
        const { domain } = req.params;
        const userId = req.userId;

        const result = await firestoreService.deleteCookies(userId, domain);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get user stats
app.get('/api/stats', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId;
        const result = await firestoreService.getUserStats(userId);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Sync with Firestore
app.post('/api/sync', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId;
        const result = await firestoreService.syncWithFirestore(userId);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Create user
app.post('/api/users', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId;
        const userData = req.body;

        const result = await firestoreService.createUser(userId, userData);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Cookie Manager Backend running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

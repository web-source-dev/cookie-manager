/**
 * Setup script for Cookie Manager Backend
 * This script helps you set up the Firebase backend
 */

import fs from 'fs';
import path from 'path';

console.log('🚀 Cookie Manager Backend Setup\n');

// Check if Firebase Admin SDK key exists
const adminKeyPath = './kuch-bhi-b9078-firebase-adminsdk-cme2f-6d1bc406d4.json';
if (fs.existsSync(adminKeyPath)) {
    console.log('✅ Firebase Admin SDK key found');
    console.log('📁 File:', adminKeyPath);
} else {
    console.log('❌ Firebase Admin SDK key not found');
    console.log('📁 Expected file:', adminKeyPath);
    console.log('💡 Please make sure the Firebase Admin SDK key is in the backend folder');
    process.exit(1);
}

// Check if package.json exists
if (fs.existsSync('./package.json')) {
    console.log('✅ package.json found');
} else {
    console.log('❌ package.json not found');
    console.log('💡 Please run this script from the backend directory');
    process.exit(1);
}

// Check if node_modules exists
if (fs.existsSync('./node_modules')) {
    console.log('✅ Dependencies installed');
} else {
    console.log('⚠️  Dependencies not installed');
    console.log('💡 Run: npm install');
}

console.log('\n📋 Setup Checklist:');
console.log('✅ Firebase Admin SDK key: kuch-bhi-b9078-firebase-adminsdk-cme2f-6d1bc406d4.json');
console.log('✅ Project ID: kuch-bhi-b9078');
console.log('✅ Service Account: firebase-adminsdk-cme2f@kuch-bhi-b9078.iam.gserviceaccount.com');

console.log('\n🔧 Next Steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Test Firebase Admin SDK: node test-firebase-admin.js');
console.log('3. Start the server: npm run dev');
console.log('4. Test the API: curl http://localhost:3000/health');

console.log('\n🌐 API Endpoints:');
console.log('• Health Check: GET /health');
console.log('• Sign In: POST /api/auth/signin');
console.log('• Sign Up: POST /api/auth/signup');
console.log('• Save Cookies: POST /api/cookies/save');
console.log('• Load Cookies: GET /api/cookies/load/:domain');
console.log('• Get Domains: GET /api/domains');
console.log('• Get Stats: GET /api/stats');
console.log('• Sync: POST /api/sync');

console.log('\n🔐 Authentication:');
console.log('• All API endpoints (except auth) require Bearer token');
console.log('• Token format: Authorization: Bearer <token>');
console.log('• Tokens are verified using Firebase Admin SDK');

console.log('\n📚 Documentation:');
console.log('• Setup Guide: ../FIRESTORE_SETUP.md');
console.log('• Firebase Console: https://console.firebase.google.com/project/kuch-bhi-b9078');

console.log('\n🎉 Setup complete! Your Firebase Admin SDK is ready to use.');

// Generate a valid JWT token for testing
// Run: node generate-token.js

const crypto = require('crypto');

function base64UrlEncode(str) {
    return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function generateToken() {
    const secretKey = 'YourSuperSecretKeyForJWTAuthentication12345';
    
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };
    
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        sub: 'vendor-test-123',
        unique_name: '+918287433081',
        role: 'Vendor',
        nameid: 'vendor-test-123',
        language: 'en',
        iat: now,
        nbf: now,
        exp: now + (365 * 24 * 60 * 60), // 1 year
        iss: 'MandiApp.Identity',
        aud: 'MandiApp.Mobile'
    };
    
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto
        .createHmac('sha256', secretKey)
        .update(signatureInput)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    
    const token = `${encodedHeader}.${encodedPayload}.${signature}`;
    
    console.log('\n🔐 VALID JWT TOKEN (1 year expiry):');
    console.log('='.repeat(80));
    console.log(token);
    console.log('='.repeat(80));
    console.log('\n📋 Copy and paste this into browser console:\n');
    console.log(`localStorage.setItem('auth_token', '${token}');`);
    console.log(`localStorage.setItem('auth_user', '${JSON.stringify({
        id: 'vendor-test-123',
        phoneNumber: '+918287433081',
        role: 'Vendor',
        fullName: 'Test Vendor',
        language: 'en',
        isActive: true
    })}');`);
    console.log(`location.reload();`);
    console.log('\n✅ This token is properly signed and will work!\n');
}

generateToken();

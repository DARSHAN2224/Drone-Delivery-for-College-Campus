import dotenv from 'dotenv';
import { sendVerificationEmail } from './src/utils/emails.js';

dotenv.config();

// Test email functionality
async function testEmail() {
    try {
        console.log('Testing email functionality...');
        console.log('SMTP Configuration:');
        console.log('SMTP_MAIL:', process.env.SMTP_MAIL);
        console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '***SET***' : 'NOT SET');
        console.log('SMTP_PORT:', process.env.SMTP_PORT);
        console.log('SMTP_HOST:', process.env.SMTP_HOST);
        
        if (!process.env.SMTP_MAIL || !process.env.SMTP_PASSWORD) {
            console.error('❌ SMTP credentials not configured!');
            console.error('Please set SMTP_MAIL and SMTP_PASSWORD in your .env file');
            return;
        }
        
        console.log('\nAttempting to send test email...');
        const result = await sendVerificationEmail('Test User', 'test@example.com', '123456');
        console.log('✅ Email sent successfully!');
        console.log('Result:', result);
        
    } catch (error) {
        console.error('❌ Email test failed:');
        console.error(error.message);
        console.error('\nFull error:', error);
    }
}

testEmail();

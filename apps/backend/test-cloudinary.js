/**
 * Test script to verify Cloudinary integration
 * Run with: node test-cloudinary.js
 */

// Since we're using TypeScript modules, we'll test by making HTTP requests
const https = require('https');
const fs = require('fs');

async function testCloudinaryIntegration() {
  console.log('🧪 Testing Cloudinary Integration...\n');

  // Check environment variables
  const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];

  console.log('📋 Checking environment variables...');
  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    console.log('❌ Missing environment variables:');
    missingEnvVars.forEach((envVar) => {
      console.log(`   - ${envVar}`);
    });
    console.log('\n💡 Please add these to your .env file:');
    console.log('   CLOUDINARY_CLOUD_NAME=your-cloud-name');
    console.log('   CLOUDINARY_API_KEY=your-api-key');
    console.log('   CLOUDINARY_API_SECRET=your-api-secret');
    console.log('\n🔗 Get these values from: https://cloudinary.com/console');
    return;
  }

  console.log('✅ All environment variables are set');

  // Create a test image buffer (1x1 pixel PNG)
  const testImageBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
  ]);

  try {
    console.log('\n📤 Testing image upload...');
    const uploadResult = await uploadImage(testImageBuffer, 'cyclists/test');
    console.log('✅ Upload successful!');
    console.log(`   URL: ${uploadResult.secure_url}`);
    console.log(`   Public ID: ${uploadResult.public_id}`);

    console.log('\n🗑️  Testing image deletion...');
    await deleteImage(uploadResult.public_id);
    console.log('✅ Deletion successful!');

    console.log('\n🎉 Cloudinary integration is working perfectly!');
  } catch (error) {
    console.log('\n❌ Test failed:');
    console.log('   Error:', error.message);

    if (error.message.includes('Invalid API key')) {
      console.log('\n💡 This usually means:');
      console.log('   - Check your CLOUDINARY_API_KEY is correct');
      console.log('   - Check your CLOUDINARY_API_SECRET is correct');
    } else if (error.message.includes('cloud_name')) {
      console.log('\n💡 This usually means:');
      console.log('   - Check your CLOUDINARY_CLOUD_NAME is correct');
    }
  }
}

// Only run if called directly (not required)
if (require.main === module) {
  testCloudinaryIntegration();
}

module.exports = { testCloudinaryIntegration };

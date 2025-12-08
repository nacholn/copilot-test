/**
 * Simple environment check for Cloudinary integration
 * Run with: node check-cloudinary.js
 */

async function checkCloudinarySetup() {
  console.log('🔧 Checking Cloudinary Configuration...\n');

  // Load environment variables
  require('dotenv').config();

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
    return false;
  }

  console.log('✅ All environment variables are set');
  console.log('\n📋 Configuration found:');
  console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY?.substring(0, 8)}...`);
  console.log(`   API Secret: [HIDDEN]`);

  console.log('\n🧪 To test the actual upload functionality:');
  console.log('   1. Start the backend server: npm run dev');
  console.log('   2. Start the web app: cd ../web && npm run dev');
  console.log('   3. Open the web app and try uploading an image in your profile');
  console.log('   4. Check the Cloudinary media library for uploaded images');

  console.log('\n🎉 Cloudinary setup looks good!');
  console.log('\n💡 Next steps:');
  console.log('   - Test image uploads through the web interface');
  console.log('   - Monitor usage in your Cloudinary dashboard');
  console.log('   - Check browser console for any errors');
  return true;
}

// Only run if called directly
if (require.main === module) {
  checkCloudinarySetup();
}

module.exports = { checkCloudinarySetup };

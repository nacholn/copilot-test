/**
 * Test the upload API endpoint directly
 * This tests the actual Cloudinary integration through the API
 */

const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');

async function testUploadAPI() {
  console.log('🧪 Testing Upload API Integration...\n');

  try {
    // Create a simple test image (1x1 PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44,
      0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f,
      0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00,
      0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    // Create form data
    const form = new FormData();
    form.append('file', testImageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png',
    });
    form.append('folder', 'cyclists/test');    console.log('📤 Testing upload to http://localhost:3001/api/upload...');

    const response = await axios.post('http://localhost:3001/api/upload', form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    const data = response.data;

    if (data.success) {
      console.log('✅ Upload successful!');
      console.log(`   Status: ${response.status}`);
      console.log(`   Image URL: ${data.data.url}`);
      console.log(`   Public ID: ${data.data.publicId}`);      // Test deletion
      console.log('\n🗑️ Testing image deletion...');
      const deleteResponse = await axios.delete(
        `http://localhost:3001/api/upload?publicId=${encodeURIComponent(data.data.publicId)}`
      );

      const deleteData = deleteResponse.data;

      if (deleteData.success) {
        console.log('✅ Deletion successful!');
        console.log('\n🎉 Cloudinary integration is working perfectly!');
        console.log('\n💡 You can now use image uploads in your profile form');
      } else {
        console.log('❌ Deletion failed:', deleteData.error);
      }    } else {
      console.log('❌ Upload failed:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.error}`);

      if (data.error?.includes('Invalid signature')) {
        console.log('\n💡 This usually means your Cloudinary credentials are incorrect');
      } else if (data.error?.includes('cloud_name')) {
        console.log('\n💡 Check your CLOUDINARY_CLOUD_NAME setting');
      }
    }
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running on port 3001:');
      console.log('   cd apps/backend && npm run dev');
    }
  }
}

// Only run if called directly
if (require.main === module) {
  testUploadAPI();
}

module.exports = { testUploadAPI };

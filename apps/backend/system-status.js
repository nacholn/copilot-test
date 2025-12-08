/**
 * Simple system status check
 */

console.log('🚴 Cyclists Social Network - System Status Check\n');

// Check environment variables
require('dotenv').config();

const envChecks = [
  { name: 'Supabase URL', var: 'NEXT_PUBLIC_SUPABASE_URL' },
  { name: 'Supabase Key', var: 'NEXT_PUBLIC_SUPABASE_ANON_KEY' },
  { name: 'Database URL', var: 'DATABASE_URL' },
  { name: 'Cloudinary Name', var: 'CLOUDINARY_CLOUD_NAME' },
  { name: 'Cloudinary Key', var: 'CLOUDINARY_API_KEY' },
  { name: 'Cloudinary Secret', var: 'CLOUDINARY_API_SECRET' },
];

console.log('📋 Environment Variables:');
let envOk = true;
envChecks.forEach(check => {
  const value = process.env[check.var];
  if (value) {
    console.log(`  ✅ ${check.name}: Configured`);
  } else {
    console.log(`  ❌ ${check.name}: Missing`);
    envOk = false;
  }
});

console.log('\n🔧 Services Status:');
console.log('  📡 Backend: Check http://localhost:3001/api/health');
console.log('  🌐 Web App: Check http://localhost:3000 or http://localhost:3002');
console.log('  📱 Mobile: Run "cd apps/mobile && npm start"');

console.log('\n🧪 Test Commands:');
console.log('  • node check-cloudinary.js - Test Cloudinary config');
console.log('  • node test-upload-api.js - Test upload functionality');

if (envOk) {
  console.log('\n🎉 Environment configuration looks good!');
} else {
  console.log('\n⚠️  Please configure missing environment variables in .env file');
}

console.log('\n📚 Documentation:');
console.log('  • CLOUDINARY_SETUP.md - Image upload setup guide');  
console.log('  • CLOUDINARY_IMPLEMENTATION_COMPLETE.md - Implementation details');
console.log('  • README.md - General setup instructions');

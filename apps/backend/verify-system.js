#!/usr/bin/env node

/**
 * Complete system verification for Cyclists Social Network
 * Tests all major components including Cloudinary integration
 */

const { execSync } = require('child_process');
const path = require('path');
const axios = require('axios');

async function runSystemTests() {
  console.log('🧪 Running Complete System Verification\n');
  console.log('=====================================');

  const results = {
    environment: false,
    database: false,
    backend: false,
    cloudinary: false,
    web: false,
  };

  // Test 1: Environment Configuration
  console.log('\n1️⃣ Checking Environment Configuration...');
  try {
    process.chdir(path.join(__dirname));
    require('dotenv').config();

    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'DATABASE_URL',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
    ];

    const missing = requiredVars.filter(v => !process.env[v]);
    if (missing.length > 0) {
      console.log(`❌ Missing environment variables: ${missing.join(', ')}`);
    } else {
      console.log('✅ All environment variables configured');
      results.environment = true;
    }
  } catch (error) {
    console.log('❌ Environment check failed:', error.message);
  }

  // Test 2: Database Connection
  console.log('\n2️⃣ Testing Database Connection...');
  try {
    const { db } = require('./src/lib/db');
    await db.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    results.database = true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
  }

  // Test 3: Backend API Health Check
  console.log('\n3️⃣ Testing Backend API...');
  try {
    const response = await axios.get('http://localhost:3001/api/health');
    if (response.status === 200) {
      console.log('✅ Backend API is responding');
      results.backend = true;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server not running (start with: npm run dev)');
    } else {
      console.log('❌ Backend API check failed:', error.message);
    }
  }

  // Test 4: Cloudinary Integration
  console.log('\n4️⃣ Testing Cloudinary Integration...');
  try {
    if (results.backend) {
      const testImageBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      ]);
      
      const FormData = require('form-data');
      const form = new FormData();
      form.append('file', testImageBuffer, {
        filename: 'test.png',
        contentType: 'image/png',
      });
      form.append('folder', 'cyclists/test');

      const uploadResponse = await axios.post('http://localhost:3001/api/upload', form, {
        headers: { ...form.getHeaders() },
      });

      if (uploadResponse.data.success) {
        console.log('✅ Cloudinary upload working');
        
        // Clean up test image
        await axios.delete(
          `http://localhost:3001/api/upload?publicId=${encodeURIComponent(uploadResponse.data.data.publicId)}`
        );
        console.log('✅ Cloudinary delete working');
        results.cloudinary = true;
      }
    } else {
      console.log('⏭️ Skipping Cloudinary test (backend not available)');
    }
  } catch (error) {
    console.log('❌ Cloudinary integration failed:', error.response?.data?.error || error.message);
  }

  // Test 5: Web Frontend
  console.log('\n5️⃣ Testing Web Frontend...');
  try {
    // Try common ports where the web app might be running
    const ports = [3000, 3002, 3003];
    let webRunning = false;

    for (const port of ports) {
      try {
        const response = await axios.get(`http://localhost:${port}`, { timeout: 2000 });
        if (response.status === 200) {
          console.log(`✅ Web frontend responding on port ${port}`);
          results.web = true;
          webRunning = true;
          break;
        }
      } catch (e) {
        // Continue to next port
      }
    }

    if (!webRunning) {
      console.log('❌ Web frontend not running (start with: cd apps/web && npm run dev)');
    }
  } catch (error) {
    console.log('❌ Web frontend check failed:', error.message);
  }

  // Summary
  console.log('\n📊 System Status Summary');
  console.log('========================');
  console.log(`Environment Config: ${results.environment ? '✅' : '❌'}`);
  console.log(`Database: ${results.database ? '✅' : '❌'}`);
  console.log(`Backend API: ${results.backend ? '✅' : '❌'}`);
  console.log(`Cloudinary: ${results.cloudinary ? '✅' : '❌'}`);
  console.log(`Web Frontend: ${results.web ? '✅' : '❌'}`);

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log(`\n🎯 Overall Score: ${passed}/${total} components working`);

  if (passed === total) {
    console.log('\n🎉 All systems operational! Your Cyclists Social Network is ready to use.');
    console.log('\n💡 Next steps:');
    console.log('   • Open http://localhost:3000 (or 3002) to access the web app');
    console.log('   • Register a new account or login');
    console.log('   • Test profile image upload functionality');
    console.log('   • Check mobile app: cd apps/mobile && npm start');
  } else {
    console.log('\n⚠️  Some components need attention. Check the logs above for details.');
    console.log('\n🔧 Common fixes:');
    console.log('   • Environment: Copy .env.example files and add your credentials');
    console.log('   • Database: Run npm run migrate:up in apps/backend');
    console.log('   • Backend: Run npm run dev in apps/backend');
    console.log('   • Web: Run npm run dev in apps/web');
    console.log('   • Cloudinary: Add credentials to apps/backend/.env');
  }
}

// Add basic health endpoint if missing
function ensureHealthEndpoint() {
  const healthPath = path.join(__dirname, 'src', 'app', 'api', 'health', 'route.ts');
  const fs = require('fs');
  
  if (!fs.existsSync(healthPath)) {
    const healthContent = `import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Backend is healthy',
    timestamp: new Date().toISOString()
  });
}`;
    
    fs.mkdirSync(path.dirname(healthPath), { recursive: true });
    fs.writeFileSync(healthPath, healthContent);
    console.log('✅ Created health check endpoint');
  }
}

// Create health endpoint and run tests
ensureHealthEndpoint();
runSystemTests().catch(console.error);

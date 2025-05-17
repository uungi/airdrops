// Script untuk membantu build proses di Vercel
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel build process...');

// Memastikan Node environment adalah production
process.env.NODE_ENV = 'production';

try {
  // Build frontend dengan Vite
  console.log('📦 Building frontend with Vite...');
  execSync('vite build', { stdio: 'inherit' });

  // Kompilasi server dan API files dengan TypeScript
  console.log('📦 Compiling server and API files...');
  execSync('tsc --project tsconfig.server.json', { stdio: 'inherit' });

  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
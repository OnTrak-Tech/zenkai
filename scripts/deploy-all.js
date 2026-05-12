#!/usr/bin/env node

// Complete deployment script for Zenkai
// Usage: node scripts/deploy-all.js <network>

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const network = process.argv[2] || 'alfajores';

console.log(`🚀 Starting Zenkai deployment to ${network}...\n`);

// 1. Deploy contracts
console.log('📋 Deploying smart contracts...');
try {
  const deployOutput = execSync(`cd contracts && npx hardhat run scripts/deploy.ts --network ${network}`, {
    encoding: 'utf8',
    stdio: 'pipe'
  });

  console.log(deployOutput);

  // Extract addresses from output
  const lines = deployOutput.split('\n');
  let escrow = '', verifier = '', treasury = '';

  for (const line of lines) {
    if (line.includes('Escrow:')) escrow = line.split(':')[1].trim();
    if (line.includes('Verifier:')) verifier = line.split(':')[1].trim();
    if (line.includes('Treasury:')) treasury = line.split(':')[1].trim();
  }

  if (!escrow || !verifier || !treasury) {
    throw new Error('Could not extract contract addresses from deployment output');
  }

  // 2. Update client config
  console.log('🔧 Updating client configuration...');
  execSync(`node scripts/update-contracts.js ${network} ${escrow} ${verifier} ${treasury}`, {
    stdio: 'inherit'
  });

  console.log('\n✅ Contracts deployed and client updated!');
  console.log(`📍 Contract addresses for ${network}:`);
  console.log(`   Escrow: ${escrow}`);
  console.log(`   Verifier: ${verifier}`);
  console.log(`   Treasury: ${treasury}`);

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}

// 3. Instructions for manual steps
console.log('\n📝 Next steps:');
console.log('1. Set your PRIVATE_KEY environment variable');
console.log('2. Deploy server: cd server && npx vercel --prod');
console.log('3. Deploy client: cd client && npx vercel --prod');
console.log('4. Update client .env with server URL and network settings');
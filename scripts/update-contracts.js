#!/usr/bin/env node

// Script to update contract addresses in client config after deployment
// Usage: node scripts/update-contracts.js <network> <escrow> <verifier> <treasury>

const fs = require('fs');
const path = require('path');

const [,, network, escrow, verifier, treasury] = process.argv;

if (!network || !escrow || !verifier || !treasury) {
  console.error('Usage: node scripts/update-contracts.js <network> <escrow> <verifier> <treasury>');
  console.error('Example: node scripts/update-contracts.js alfajores 0x123... 0x456... 0x789...');
  process.exit(1);
}

const configPath = path.join(__dirname, '..', 'client', 'src', 'config.ts');
let configContent = fs.readFileSync(configPath, 'utf8');

// Update the addresses for the specified network
const networkRegex = new RegExp(`(${network}: {[^}]*escrow: ")[^"]*(")`, 'g');
configContent = configContent.replace(networkRegex, `$1${escrow}$2`);

const verifierRegex = new RegExp(`(${network}: {[^}]*verifier: ")[^"]*(")`, 'g');
configContent = configContent.replace(verifierRegex, `$1${verifier}$2`);

const treasuryRegex = new RegExp(`(${network}: {[^}]*treasury: ")[^"]*(")`, 'g');
configContent = configContent.replace(treasuryRegex, `$1${treasury}$2`);

fs.writeFileSync(configPath, configContent);

console.log(`✅ Updated contract addresses for ${network} network:`);
console.log(`   Escrow: ${escrow}`);
console.log(`   Verifier: ${verifier}`);
console.log(`   Treasury: ${treasury}`);
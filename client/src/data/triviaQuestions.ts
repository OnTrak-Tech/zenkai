export interface TriviaQuestion {
  id: number;
  question: string;
  options: [string, string, string, string];
  correctIndex: number; // 0-3
}

const QUESTION_BANK: TriviaQuestion[] = [
  {
    id: 1,
    question: "What is the name of the first decentralized cryptocurrency?",
    options: ["Ethereum", "Bitcoin", "Litecoin", "Dogecoin"],
    correctIndex: 1,
  },
  {
    id: 2,
    question: "Who is the pseudonymous creator of Bitcoin?",
    options: ["Vitalik Buterin", "Satoshi Nakamoto", "Charlie Lee", "Gavin Wood"],
    correctIndex: 1,
  },
  {
    id: 3,
    question: "What consensus mechanism does Ethereum currently use?",
    options: ["Proof of Work", "Proof of Stake", "Delegated PoS", "Proof of Authority"],
    correctIndex: 1,
  },
  {
    id: 4,
    question: "What does 'DeFi' stand for?",
    options: ["Decentralized Fiction", "Decentralized Finance", "Digital Finance", "Distributed Finance"],
    correctIndex: 1,
  },
  {
    id: 5,
    question: "What is a 'smart contract'?",
    options: ["A legal agreement", "Self-executing code on a blockchain", "An AI trading bot", "A hardware wallet"],
    correctIndex: 1,
  },
  {
    id: 6,
    question: "What blockchain does Celo operate on?",
    options: ["A fork of Ethereum", "Its own EVM-compatible L1", "A Solana sidechain", "A Bitcoin L2"],
    correctIndex: 1,
  },
  {
    id: 7,
    question: "What is 'gas' in Ethereum?",
    options: ["A cryptocurrency token", "A fee for computation", "A type of NFT", "A consensus protocol"],
    correctIndex: 1,
  },
  {
    id: 8,
    question: "What does NFT stand for?",
    options: ["New Financial Token", "Non-Fungible Token", "Network Fee Transaction", "Node Funding Tool"],
    correctIndex: 1,
  },
  {
    id: 9,
    question: "What is the maximum supply of Bitcoin?",
    options: ["100 million", "21 million", "18 million", "Unlimited"],
    correctIndex: 1,
  },
  {
    id: 10,
    question: "What is a DAO?",
    options: ["Digital Asset Offering", "Decentralized Autonomous Organization", "Data Access Object", "Distributed Application Overlay"],
    correctIndex: 1,
  },
  {
    id: 11,
    question: "What language are Ethereum smart contracts primarily written in?",
    options: ["Rust", "Python", "Solidity", "JavaScript"],
    correctIndex: 2,
  },
  {
    id: 12,
    question: "What is a 'seed phrase'?",
    options: ["A password for exchanges", "A set of words to recover a wallet", "An NFT metadata key", "A mining algorithm"],
    correctIndex: 1,
  },
  {
    id: 13,
    question: "What is 'staking' in crypto?",
    options: ["Buying at a low price", "Locking tokens to earn rewards", "Selling tokens quickly", "Mining new tokens"],
    correctIndex: 1,
  },
  {
    id: 14,
    question: "What is a 'zero-knowledge proof'?",
    options: ["A proof that reveals all data", "A proof that verifies truth without revealing the data", "A type of encryption key", "A consensus algorithm"],
    correctIndex: 1,
  },
  {
    id: 15,
    question: "Which blockchain uses 'MiniPay' as a mobile wallet?",
    options: ["Solana", "Celo", "Polygon", "Avalanche"],
    correctIndex: 1,
  },
  {
    id: 16,
    question: "What is the 'halving' in Bitcoin?",
    options: ["Splitting a coin into two", "Reducing block rewards by 50%", "Doubling transaction fees", "A wallet backup method"],
    correctIndex: 1,
  },
  {
    id: 17,
    question: "What is a Layer 2 solution?",
    options: ["A second blockchain", "A protocol built on top of a base chain for scalability", "A type of wallet", "A mining pool"],
    correctIndex: 1,
  },
  {
    id: 18,
    question: "What does 'HODL' mean in crypto culture?",
    options: ["Hold On for Dear Life", "A trading strategy", "A type of token", "A blockchain protocol"],
    correctIndex: 0,
  },
  {
    id: 19,
    question: "What is an 'airdrop' in crypto?",
    options: ["Sending crypto from a drone", "Free distribution of tokens", "A type of attack", "A consensus mechanism"],
    correctIndex: 1,
  },
  {
    id: 20,
    question: "What is 'impermanent loss'?",
    options: ["Losing your seed phrase", "Loss from providing liquidity when prices change", "A network outage", "A failed transaction"],
    correctIndex: 1,
  },
  {
    id: 21,
    question: "What year was the Bitcoin whitepaper published?",
    options: ["2006", "2008", "2010", "2012"],
    correctIndex: 1,
  },
  {
    id: 22,
    question: "What is a 'block explorer'?",
    options: ["A mining tool", "A website to view blockchain transactions", "A wallet feature", "A type of consensus"],
    correctIndex: 1,
  },
  {
    id: 23,
    question: "What is the native token of the Celo blockchain?",
    options: ["cUSD", "CELO", "CEL", "CGold"],
    correctIndex: 1,
  },
  {
    id: 24,
    question: "What does 'TVL' stand for in DeFi?",
    options: ["Total Value Locked", "Token Vault Liquidity", "Transaction Verification Layer", "Trust Validation Logic"],
    correctIndex: 0,
  },
  {
    id: 25,
    question: "What is a 'rug pull'?",
    options: ["A legitimate exit strategy", "A scam where developers abandon a project with investors' funds", "A type of smart contract", "A mining technique"],
    correctIndex: 1,
  },
  {
    id: 26,
    question: "What is 'Noir' in the context of zero-knowledge proofs?",
    options: ["A color scheme", "A domain-specific language for ZK circuits", "A blockchain network", "A consensus protocol"],
    correctIndex: 1,
  },
  {
    id: 27,
    question: "What is an 'oracle' in blockchain?",
    options: ["A fortune-telling dApp", "A service that feeds external data to smart contracts", "A type of validator", "A governance token"],
    correctIndex: 1,
  },
  {
    id: 28,
    question: "What is 'EIP-2612' (Permit)?",
    options: ["A governance proposal", "A standard for gasless token approvals via signatures", "A consensus upgrade", "A wallet standard"],
    correctIndex: 1,
  },
  {
    id: 29,
    question: "What does 'EVM' stand for?",
    options: ["Ethereum Virtual Machine", "External Validation Module", "Encrypted Vault Manager", "Enhanced Verification Method"],
    correctIndex: 0,
  },
  {
    id: 30,
    question: "What is 'MEV' in Ethereum?",
    options: ["Minimum Ether Value", "Maximal Extractable Value", "Multi-chain Ethereum Validator", "Minting and Exchange Volume"],
    correctIndex: 1,
  },
  {
    id: 31,
    question: "What is a 'cold wallet'?",
    options: ["A wallet stored in cold weather", "An offline wallet for secure storage", "A wallet with no funds", "A wallet on a testnet"],
    correctIndex: 1,
  },
  {
    id: 32,
    question: "What is the purpose of a 'nonce' in a transaction?",
    options: ["Identifies the sender", "Prevents replay attacks by sequencing transactions", "Encrypts the transaction data", "Sets the gas price"],
    correctIndex: 1,
  },
  {
    id: 33,
    question: "What is 'cUSD' on the Celo network?",
    options: ["A governance token", "A stablecoin pegged to the US Dollar", "A gas token", "A yield farming reward"],
    correctIndex: 1,
  },
  {
    id: 34,
    question: "What does 'DYOR' mean?",
    options: ["Do Your Own Research", "Decentralize Your Own Resources", "Deploy Your Own Repository", "Diversify Your Own Risk"],
    correctIndex: 0,
  },
  {
    id: 35,
    question: "What is a 'Merkle tree' used for in blockchain?",
    options: ["Storing NFT images", "Efficiently verifying data integrity", "Mining new blocks", "Managing gas fees"],
    correctIndex: 1,
  },
];

/**
 * Shuffles and returns `count` random questions from the bank.
 * Uses Fisher-Yates shuffle for uniform distribution.
 */
export function getRandomQuestions(count: number = 10): TriviaQuestion[] {
  const shuffled = [...QUESTION_BANK];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

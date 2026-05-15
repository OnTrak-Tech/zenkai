import { createPublicClient, http, formatEther, parseAbiItem } from 'viem';
import { celo, celoSepolia } from 'viem/chains';
import { CONFIG, CONTRACT_ADDRESSES } from '../config';
import type { Address } from 'viem';

const chain = CONFIG.network === 'celo' ? celo : celoSepolia;
const escrowAddress = CONTRACT_ADDRESSES[CONFIG.network].escrow as Address;

const publicClient = createPublicClient({
  chain,
  transport: http(),
});

// Event signatures from ZenkaiEscrow.sol
const matchSettledEvent = parseAbiItem(
  'event MatchSettled(bytes32 indexed matchId, address winner, uint256 payout)'
);
const matchCreatedEvent = parseAbiItem(
  'event MatchCreated(bytes32 indexed matchId, address indexed p1, uint8 gameType, uint8 tier)'
);
const matchLockedEvent = parseAbiItem(
  'event MatchLocked(bytes32 indexed matchId, address indexed p2, bytes32 seed)'
);
const matchDrawnEvent = parseAbiItem(
  'event MatchDrawn(bytes32 indexed matchId, uint256 payoutEach)'
);

export interface PlayerStats {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  netEarnings: string; // formatted CELO/cUSD
}

export interface MatchRecord {
  matchId: string;
  opponent: string;
  result: 'WIN' | 'LOSS' | 'DRAW';
  payout: string;
  blockNumber: bigint;
}

/**
 * Fetches player stats from on-chain contract events.
 * Returns zeros if no escrow contract is configured or no matches found.
 */
export async function getPlayerStats(playerAddress: Address): Promise<PlayerStats> {
  if (!escrowAddress || escrowAddress === '') {
    return { totalMatches: 0, wins: 0, losses: 0, draws: 0, winRate: 0, netEarnings: '0' };
  }

  try {
    // Get matches where player was P1 (creator)
    const createdLogs = await publicClient.getLogs({
      address: escrowAddress,
      event: matchCreatedEvent,
      args: { p1: playerAddress },
      fromBlock: 0n,
      toBlock: 'latest',
    });

    // Get matches where player was P2 (joiner)
    const lockedLogs = await publicClient.getLogs({
      address: escrowAddress,
      event: matchLockedEvent,
      args: { p2: playerAddress },
      fromBlock: 0n,
      toBlock: 'latest',
    });

    // All match IDs where this player participated
    const matchIds = new Set<string>();
    for (const log of createdLogs) matchIds.add(log.args.matchId as string);
    for (const log of lockedLogs) matchIds.add(log.args.matchId as string);

    const totalMatches = matchIds.size;

    // Get all MatchSettled events to find wins
    const settledLogs = await publicClient.getLogs({
      address: escrowAddress,
      event: matchSettledEvent,
      fromBlock: 0n,
      toBlock: 'latest',
    });

    // Filter to player's matches
    const playerSettled = settledLogs.filter(
      (log) => matchIds.has(log.args.matchId as string)
    );

    let wins = 0;
    let losses = 0;
    let totalPayout = 0n;

    for (const log of playerSettled) {
      const winner = (log.args.winner as string).toLowerCase();
      const payout = log.args.payout as bigint;

      if (winner === playerAddress.toLowerCase()) {
        wins++;
        totalPayout += payout;
      } else {
        losses++;
      }
    }

    // Get draws
    const drawnLogs = await publicClient.getLogs({
      address: escrowAddress,
      event: matchDrawnEvent,
      fromBlock: 0n,
      toBlock: 'latest',
    });

    const playerDraws = drawnLogs.filter(
      (log) => matchIds.has(log.args.matchId as string)
    );
    const draws = playerDraws.length;

    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

    return {
      totalMatches,
      wins,
      losses,
      draws,
      winRate,
      netEarnings: Number(formatEther(totalPayout)).toFixed(2),
    };
  } catch (error) {
    console.error('Error fetching on-chain stats:', error);
    return { totalMatches: 0, wins: 0, losses: 0, draws: 0, winRate: 0, netEarnings: '0' };
  }
}

/**
 * Fetches recent match history from on-chain events.
 */
export async function getRecentMatches(playerAddress: Address, limit: number = 5): Promise<MatchRecord[]> {
  if (!escrowAddress || escrowAddress === '') {
    return [];
  }

  try {
    // Get all MatchSettled events
    const settledLogs = await publicClient.getLogs({
      address: escrowAddress,
      event: matchSettledEvent,
      fromBlock: 0n,
      toBlock: 'latest',
    });

    // Get matches where player was P1
    const createdLogs = await publicClient.getLogs({
      address: escrowAddress,
      event: matchCreatedEvent,
      args: { p1: playerAddress },
      fromBlock: 0n,
      toBlock: 'latest',
    });

    // Get matches where player was P2
    const lockedLogs = await publicClient.getLogs({
      address: escrowAddress,
      event: matchLockedEvent,
      args: { p2: playerAddress },
      fromBlock: 0n,
      toBlock: 'latest',
    });

    const playerMatchIds = new Set<string>();
    for (const log of createdLogs) playerMatchIds.add(log.args.matchId as string);
    for (const log of lockedLogs) playerMatchIds.add(log.args.matchId as string);

    // Filter settled matches that involve this player
    const playerSettled = settledLogs
      .filter((log) => playerMatchIds.has(log.args.matchId as string))
      .sort((a, b) => Number(b.blockNumber - a.blockNumber)) // Most recent first
      .slice(0, limit);

    return playerSettled.map((log) => {
      const winner = (log.args.winner as string).toLowerCase();
      const isWin = winner === playerAddress.toLowerCase();
      const opponent = isWin ? 'Opponent' : `${winner.slice(0, 6)}...${winner.slice(-4)}`;

      return {
        matchId: (log.args.matchId as string).slice(0, 10) + '...',
        opponent: isWin ? `${winner.slice(0, 6)}...${winner.slice(-4)}` : opponent,
        result: isWin ? 'WIN' as const : 'LOSS' as const,
        payout: Number(formatEther(log.args.payout as bigint)).toFixed(2),
        blockNumber: log.blockNumber,
      };
    });
  } catch (error) {
    console.error('Error fetching recent matches:', error);
    return [];
  }
}

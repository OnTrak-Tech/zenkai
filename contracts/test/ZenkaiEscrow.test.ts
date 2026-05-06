import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("ZenkaiEscrow", function () {
  async function deployZenkaiFixture() {
    const [owner, gameServer, verifier, p1, p2, otherAccount] = await ethers.getSigners();

    // Deploy Mock cUSD
    const MockcUSD = await ethers.getContractFactory("MockcUSD");
    const cusd = await MockcUSD.deploy();

    // Deploy Treasury
    const ZenkaiTreasury = await ethers.getContractFactory("ZenkaiTreasury");
    const treasury = await ZenkaiTreasury.deploy(owner.address);

    // Deploy Escrow
    const ZenkaiEscrow = await ethers.getContractFactory("ZenkaiEscrow");
    const escrow = await ZenkaiEscrow.deploy(cusd.target, treasury.target, gameServer.address, verifier.address);

    // Mint some cUSD to players
    await cusd.mint(p1.address, ethers.parseEther("100"));
    await cusd.mint(p2.address, ethers.parseEther("100"));

    // Approve escrow for players
    await cusd.connect(p1).approve(escrow.target, ethers.parseEther("100"));
    await cusd.connect(p2).approve(escrow.target, ethers.parseEther("100"));

    return { cusd, treasury, escrow, owner, gameServer, verifier, p1, p2, otherAccount };
  }

  describe("Matchmaking & Deposit", function () {
    it("Should create a match and lock P1 stake", async function () {
      const { cusd, escrow, p1 } = await loadFixture(deployZenkaiFixture);
      
      const p1BalanceBefore = await cusd.balanceOf(p1.address);
      const escrowBalanceBefore = await cusd.balanceOf(escrow.target);

      const tx = await escrow.connect(p1).createMatch(0, 0); // CHESS, PRACTICE
      const receipt = await tx.wait();

      // Find the MatchCreated event
      const log = receipt?.logs.find(
        (l: any) => l.fragment && l.fragment.name === "MatchCreated"
      );
      expect(log).to.not.be.undefined;

      const p1BalanceAfter = await cusd.balanceOf(p1.address);
      const escrowBalanceAfter = await cusd.balanceOf(escrow.target);

      expect(p1BalanceBefore - p1BalanceAfter).to.equal(ethers.parseEther("0.1"));
      expect(escrowBalanceAfter - escrowBalanceBefore).to.equal(ethers.parseEther("0.1"));
    });

    it("Should allow P2 to join and lock the match", async function () {
      const { escrow, p1, p2 } = await loadFixture(deployZenkaiFixture);
      
      const tx1 = await escrow.connect(p1).createMatch(0, 0);
      const receipt1 = await tx1.wait();
      const createLog = receipt1?.logs.find((l: any) => l.fragment && l.fragment.name === "MatchCreated");
      const matchId = createLog?.args[0];

      const tx2 = await escrow.connect(p2).joinMatch(matchId);
      const receipt2 = await tx2.wait();
      const lockLog = receipt2?.logs.find((l: any) => l.fragment && l.fragment.name === "MatchLocked");

      expect(lockLog).to.not.be.undefined;
      const match = await escrow.matches(matchId);
      expect(match.state).to.equal(1); // LOCKED
      expect(match.p2).to.equal(p2.address);
    });
  });

  describe("Settlement", function () {
    it("Should settle match and payout winner (95%) and treasury (5%)", async function () {
      const { cusd, treasury, escrow, verifier, p1, p2 } = await loadFixture(deployZenkaiFixture);
      
      const tx1 = await escrow.connect(p1).createMatch(0, 0); // 0.1 cUSD
      const receipt1 = await tx1.wait();
      const matchId = receipt1?.logs.find((l: any) => l.fragment && l.fragment.name === "MatchCreated")?.args[0];
      
      await escrow.connect(p2).joinMatch(matchId); // 0.1 cUSD

      const p1BalanceBefore = await cusd.balanceOf(p1.address);
      const treasuryBalanceBefore = await cusd.balanceOf(treasury.target);

      // Verifier settles match, P1 wins
      await escrow.connect(verifier).settleMatch(matchId, p1.address);

      const p1BalanceAfter = await cusd.balanceOf(p1.address);
      const treasuryBalanceAfter = await cusd.balanceOf(treasury.target);

      // Total pool = 0.2 cUSD. 5% fee = 0.01 cUSD. Winner payout = 0.19 cUSD.
      expect(p1BalanceAfter - p1BalanceBefore).to.equal(ethers.parseEther("0.19"));
      expect(treasuryBalanceAfter - treasuryBalanceBefore).to.equal(ethers.parseEther("0.01"));

      const match = await escrow.matches(matchId);
      expect(match.state).to.equal(3); // SETTLED
      expect(match.winner).to.equal(p1.address);
    });

    it("Should settle draw 50/50 after fee", async function () {
      const { cusd, treasury, escrow, verifier, p1, p2 } = await loadFixture(deployZenkaiFixture);
      
      const tx1 = await escrow.connect(p1).createMatch(0, 0);
      const receipt1 = await tx1.wait();
      const matchId = receipt1?.logs.find((l: any) => l.fragment && l.fragment.name === "MatchCreated")?.args[0];
      await escrow.connect(p2).joinMatch(matchId);

      const p1BalanceBefore = await cusd.balanceOf(p1.address);
      const p2BalanceBefore = await cusd.balanceOf(p2.address);

      await escrow.connect(verifier).settleMatchDraw(matchId);

      const p1BalanceAfter = await cusd.balanceOf(p1.address);
      const p2BalanceAfter = await cusd.balanceOf(p2.address);

      // Total pool = 0.2 cUSD. 5% fee = 0.01 cUSD. Remaining = 0.19 cUSD -> 0.095 cUSD each.
      expect(p1BalanceAfter - p1BalanceBefore).to.equal(ethers.parseEther("0.095"));
      expect(p2BalanceAfter - p2BalanceBefore).to.equal(ethers.parseEther("0.095"));
    });
  });

  describe("Disputes", function () {
    it("Should open dispute window and auto-resolve to draw after expiry", async function () {
      const { escrow, verifier, p1, p2 } = await loadFixture(deployZenkaiFixture);
      
      const tx1 = await escrow.connect(p1).createMatch(0, 0);
      const receipt1 = await tx1.wait();
      const matchId = receipt1?.logs.find((l: any) => l.fragment && l.fragment.name === "MatchCreated")?.args[0];
      await escrow.connect(p2).joinMatch(matchId);

      // Verifier opens dispute
      await escrow.connect(verifier).openDisputeWindow(matchId);
      
      let match = await escrow.matches(matchId);
      expect(match.state).to.equal(4); // DISPUTED

      // Attempt resolve before expiry should fail
      await expect(escrow.resolveDispute(matchId)).to.be.revertedWith("Dispute window active");

      // Advance time by 10 minutes and 1 second
      await time.increase(10 * 60 + 1);

      // Resolve dispute now
      await escrow.resolveDispute(matchId);

      match = await escrow.matches(matchId);
      expect(match.state).to.equal(3); // SETTLED
    });
  });

  describe("Property: Payout Conservation", function () {
    it("For any settled match, winner_payout + treasury_fee == 2 * stakeAmount", async function () {
      const { cusd, treasury, escrow, verifier, p1, p2 } = await loadFixture(deployZenkaiFixture);
      
      // We will test ELITE tier (20 cUSD)
      const tx1 = await escrow.connect(p1).createMatch(0, 3); // CHESS, ELITE
      const receipt1 = await tx1.wait();
      const matchId = receipt1?.logs.find((l: any) => l.fragment && l.fragment.name === "MatchCreated")?.args[0];
      
      await escrow.connect(p2).joinMatch(matchId);

      const p1BalanceBefore = await cusd.balanceOf(p1.address);
      const treasuryBalanceBefore = await cusd.balanceOf(treasury.target);

      await escrow.connect(verifier).settleMatch(matchId, p1.address);

      const p1BalanceAfter = await cusd.balanceOf(p1.address);
      const treasuryBalanceAfter = await cusd.balanceOf(treasury.target);

      const winnerPayout = p1BalanceAfter - p1BalanceBefore;
      const treasuryFee = treasuryBalanceAfter - treasuryBalanceBefore;

      const stakeAmount = ethers.parseEther("20");
      expect(winnerPayout + treasuryFee).to.equal(stakeAmount * 2n);
    });
  });
});

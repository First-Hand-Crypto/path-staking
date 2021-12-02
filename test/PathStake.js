const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Path Stake contract", function () {
  let PathToken;
  let Path;
  let PathAddr;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    PathToken = await ethers.getContractFactory("PathToken");
    PathStakeContract = await ethers.getContractFactory("PathRewards");
    timeStart = Math.floor(Date.now() / 1000);

    [owner, addr1, addr2] = await ethers.getSigners();
    //deploy contract
    Path = await PathToken.deploy("1000000000000000000000000000");
    PathAddr = Path.address
    PathStake = await PathStakeContract.deploy(PathAddr, timeStart + 100);
    PathStakeAddr = PathStake.address;
    await Path.transfer(PathStakeAddr, "150000000000000000000000000");
    //set allowance
    await Path.approve(PathStakeAddr, "1000000000000000000000000000");
  });

  describe("Send token to contract", function () {
    it("Contract should assign the total rewards of tokens to the contract", async function () {
      const contractBalance = await Path.balanceOf(PathStakeAddr);
      expect(await "150000000000000000000000000").to.equal(contractBalance);
    });
  });

  describe("Set rewards", function () {
    it("Should set the correct reward rate for 1 year", async function () {
      const contractBalance = await Path.balanceOf(PathStakeAddr);

      await PathStake.setRewardAmount("150000000", (365 * 24 * 60 * 60));

      const rewardRate = parseInt(150000000 / (365 * 24 * 60 * 60));
      expect(await PathStake.rewardRate()).to.equal(rewardRate);
    });

    it("Should allow me to stake", async function() {
      const contractBalance = await Path.balanceOf(PathStakeAddr);

      await PathStake.setRewardAmount("150000000000000000000000000", (365 * 24 * 60 * 60));

      const rewardRate = parseInt(150000000 / (365 * 24 * 60 * 60));

      await PathStake.stake("100000000000000000000");

      expect(await PathStake.totalStaked()).to.equal("100000000000000000000");

    })


    it("Should not allow me to claim any rewards before start time", async function() {
      const contractBalance = await Path.balanceOf(PathStakeAddr);

      await PathStake.setRewardAmount("150000000000000000000000000", (365 * 24 * 60 * 60));
      
      await PathStake.stake("100000000000000000000");
      const blockNumAfter = await ethers.provider.getBlockNumber();
      const blockAfter = await ethers.provider.getBlock(blockNumAfter);
      const timeStampNow = blockAfter.timestamp;
      await network.provider.send("evm_setNextBlockTimestamp", [timeStampNow+9])
      await network.provider.send("evm_mine")

      await PathStake.getReward();
      const claimed = ethers.utils.formatEther(await PathStake.totalClaimed());
      expect(parseFloat(claimed)).to.equal(parseFloat(0));
    })
  });

  describe("Claim rewards", function () {
      it("Should allow me to claim the correct rewards", async function() {
        const contractBalance = await Path.balanceOf(PathStakeAddr);

        await PathStake.setRewardAmount("150000000000000000000000000", (365 * 24 * 60 * 60));

        const rewardRate = 150000000 / (365 * 24 * 60 * 60);
        
        await PathStake.stake("100000000000000000000");
        const blockNumAfter = await ethers.provider.getBlockNumber();
        const blockAfter = await ethers.provider.getBlock(blockNumAfter);
        const timeStampNow = blockAfter.timestamp;
        await network.provider.send("evm_setNextBlockTimestamp", [timeStampNow+109])
        await network.provider.send("evm_mine")

        const blockNumAfter2 = await ethers.provider.getBlockNumber();
        const blockAfter2 = await ethers.provider.getBlock(blockNumAfter2);
        const timeStampNow2 = blockAfter2.timestamp;
        const timeSinceStake = timeStampNow2 - timeStampNow;

        const timeSinceStartRewards = timeStampNow2 - (timeStart + 100) + 1 //plus 1 for execution time

        await PathStake.getReward();
        const claimAmount = rewardRate * timeSinceStartRewards
        const claimed = ethers.utils.formatEther(await PathStake.totalClaimed());
        expect(parseFloat(claimed)).to.equal(parseFloat(claimAmount));
      })

    it("Should allow me to claim the correct rewards with another staker", async function() {
      //start time here allready started after
      await Path.transfer(addr1.address, "100000000000000000000000000");
      await Path.connect(addr1).approve(PathStakeAddr, "1000000000000000000000000000");
      await Path.transfer(addr2.address, "100000000000000000000000000");
      await Path.connect(addr2).approve(PathStakeAddr, "1000000000000000000000000000");

      const contractBalance = await Path.balanceOf(PathStakeAddr);

      await PathStake.setRewardAmount("150000000000000000000000000", (365 * 24 * 60 * 60));
      const blockNumAfter = await ethers.provider.getBlockNumber();
      const blockAfter = await ethers.provider.getBlock(blockNumAfter);
      const timeStampNow = blockAfter.timestamp;
      await network.provider.send("evm_setNextBlockTimestamp", [timeStampNow+9])
      await network.provider.send("evm_mine")

      const rewardRate = 150000000 / (365 * 24 * 60 * 60);
      
      await PathStake.stake("100000000000000000000");

      const blockNumAfter2 = await ethers.provider.getBlockNumber();
      const blockAfter2 = await ethers.provider.getBlock(blockNumAfter2);
      const timeStampNow2 = blockAfter2.timestamp;
      await network.provider.send("evm_setNextBlockTimestamp", [timeStampNow2+9])
      await network.provider.send("evm_mine");
      await PathStake.connect(addr1).stake("100000000000000000000");

      const blockNumAfter3 = await ethers.provider.getBlockNumber();
      const blockAfter3 = await ethers.provider.getBlock(blockNumAfter3);
      const timeStampNow3 = blockAfter3.timestamp;
      await network.provider.send("evm_setNextBlockTimestamp", [timeStampNow3+9]);
      await network.provider.send("evm_mine")
      await PathStake.connect(addr2).stake("50000000000000000000");


      const blockNumAfter4 = await ethers.provider.getBlockNumber();
      const blockAfter4 = await ethers.provider.getBlock(blockNumAfter4);
      const timeStampNow4 = blockAfter4.timestamp;
      await network.provider.send("evm_setNextBlockTimestamp", [timeStampNow4+9]);
      await network.provider.send("evm_mine")
      await PathStake.exit();
      const firstClaimed = await PathStake.totalClaimed();

      const blockNumAfter5 = await ethers.provider.getBlockNumber();
      const blockAfter5 = await ethers.provider.getBlock(blockNumAfter5);
      const timeStampNow5 = blockAfter5.timestamp;
      await network.provider.send("evm_setNextBlockTimestamp", [timeStampNow5+9]);
      await network.provider.send("evm_mine")
      await PathStake.connect(addr1).getReward();

      const expectedClaimed = ((100/200) * rewardRate * 10) + ((100/250) * rewardRate * 10) + ((100/150) * rewardRate * 10);
      const totalClaimed = await PathStake.totalClaimed();
      const actualClaimed = ethers.utils.formatEther(totalClaimed) - ethers.utils.formatEther(firstClaimed);
      expect(parseFloat(actualClaimed)).to.equal(parseFloat(expectedClaimed));
    })
  });
  describe("Stake and claim rewards after start time", function () {
    it("Should allow me to claim the correct rewards with another staker", async function() {
      const blockNumAfter = await ethers.provider.getBlockNumber();
      const blockAfter = await ethers.provider.getBlock(blockNumAfter);
      const timeStampNow = blockAfter.timestamp;

      const rewardRate = 150000000 / (365 * 24 * 60 * 60);

      PathStake2 = await PathStakeContract.deploy(PathAddr, timeStampNow + 100);
      PathStakeAddr2 = PathStake2.address;
      await Path.transfer(PathStakeAddr2, "150000000000000000000000000");
      //set allowance
      await Path.approve(PathStakeAddr2, "1000000000000000000000000000");

      await PathStake2.setRewardAmount("150000000000000000000000000", (365 * 24 * 60 * 60));

      await Path.transfer(addr1.address, "100000000000000000000000000");
      await Path.connect(addr1).approve(PathStakeAddr2, "1000000000000000000000000000");
      await Path.transfer(addr2.address, "100000000000000000000000000");
      await Path.connect(addr2).approve(PathStakeAddr2, "1000000000000000000000000000");
      
      //stake before start time
      await PathStake2.stake("100000000000000000000");

      //stake before start time finishes
      const blockNumAfter2 = await ethers.provider.getBlockNumber();
      const blockAfter2 = await ethers.provider.getBlock(blockNumAfter2);
      const timeStampNow2 = blockAfter2.timestamp;

      await network.provider.send("evm_setNextBlockTimestamp", [timeStampNow2+89])
      await network.provider.send("evm_mine");
      await PathStake2.connect(addr1).stake("100000000000000000000");

      const blockNumAfter3 = await ethers.provider.getBlockNumber();
      const blockAfter3 = await ethers.provider.getBlock(blockNumAfter3);
      const timeStampNow3 = blockAfter3.timestamp;
      await network.provider.send("evm_setNextBlockTimestamp", [timeStampNow3+10]);
      await network.provider.send("evm_mine")
      await PathStake2.connect(addr2).stake("50000000000000000000");


      const blockNumAfter4 = await ethers.provider.getBlockNumber();
      const blockAfter4 = await ethers.provider.getBlock(blockNumAfter4);
      const timeStampNow4 = blockAfter4.timestamp;
      await network.provider.send("evm_setNextBlockTimestamp", [timeStampNow4+9]);
      await network.provider.send("evm_mine")
      await PathStake2.exit();
      const firstClaimed = await PathStake2.totalClaimed();

      const expectedClaimed = ((100/200) * rewardRate * 10) + ((100/250) * rewardRate * 10);
      const actualClaimed = ethers.utils.formatEther(firstClaimed)
      expect(parseFloat(actualClaimed)).to.equal(parseFloat(expectedClaimed));
    })
  });
});


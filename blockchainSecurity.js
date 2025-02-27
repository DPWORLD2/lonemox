class Blockchain {
  constructor() {
    this.chain = [];
    this.createGenesisBlock();
  }

  createGenesisBlock() {
    this.chain.push({ index: 0, data: "Genesis Block", timestamp: new Date() });
  }

  addBlock(data) {
    const block = {
      index: this.chain.length,
      data,
      timestamp: new Date(),
    };
    this.chain.push(block);
  }

  getChain() {
    return this.chain;
  }
}

module.exports = { Blockchain };


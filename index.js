const arguguard = require('arguguard')
const secp256k1 = require('secp256k1-amorph-utils')
const keccak256 = require('keccak256-amorph')

function Account(privateKey) {
  arguguard('Account', ['Amorph'], arguments)
  this.privateKey = privateKey
  this.uncompressedPublicKey = secp256k1.derivePublicKey(privateKey, false)
  this.compressedPublicKey = secp256k1.convertPublicKey(this.uncompressedPublicKey, true)
  this.address = keccak256(this.uncompressedPublicKey.as('array', (array) => {
    // drop first byte before hashing
    return array.slice(1)
  })).as('array', (array) => {
    // take last 20 bytes after hashing
    return array.slice(-20)
  })
}

Account.prototype.deriveLinkedAccount = function deriveLinkedAccount(link) {
  arguguard('deriveLinkedAccount', ['Amorph'], arguments)
  return new Account(secp256k1.deriveLinkedPrivateKey(link, this.privateKey))
}

Account.generate = function generate() {
  arguguard('generate', [], arguments)
  return new Account(secp256k1.generatePrivateKey())
}

Account.generateNegative = function generateNegative() {
  arguguard('generateNegative', [], arguments)
  let account
  do {
    account = Account.generate()
  } while (account.compressedPublicKey.to('buffer')[0] !== 0x02)
  return account
}

Account.generatePositive = function generatePositive() {
  arguguard('generatePositive', [], arguments)
  let account
  do {
    account = Account.generate()
  } while (account.compressedPublicKey.to('buffer')[0] !== 0x03)
  return account
}

module.exports = Account

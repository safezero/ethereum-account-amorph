const arguguard = require('arguguard')
const secp256k1 = require('secp256k1-amorph-utils')
const keccak256 = require('keccak256-amorph')

function Account(privateKey) {
  arguguard('Account', ['Amorph'], arguments)
  this.privateKey = privateKey
  this.uncompressedPublicKey = secp256k1.derivePublicKey(privateKey, false)
  this.compressedPublicKey = secp256k1.convertPublicKey(this.uncompressedPublicKey, true)
  this.address = keccak256(this.uncompressedPublicKey.as('uint8Array', (array) => {
    // drop first byte before hashing
    return array.slice(1)
  })).as('uint8Array', (array) => {
    // take last 20 bytes after hashing
    return array.slice(-20)
  })
}

Account.prototype.deriveLinkedAccount = function deriveLinkedAccount(link) {
  arguguard('deriveLinkedAccount', ['Amorph'], arguments)
  return new Account(secp256k1.deriveLinkedPrivateKey(link, this.privateKey))
}

Account.generate = function generate(Amorph) {
  arguguard('generate', ['Function'], arguments)
  return new Account(secp256k1.generatePrivateKey(Amorph))
}

Account.generateNegative = function generateNegative(Amorph) {
  arguguard('generateNegative', ['Function'], arguments)
  let account
  do {
    account = Account.generate(Amorph)
  } while (account.compressedPublicKey.to('buffer')[0] !== 0x02)
  return account
}

Account.generatePositive = function generatePositive(Amorph) {
  arguguard('generatePositive', ['Function'], arguments)
  let account
  do {
    account = Account.generate(Amorph)
  } while (account.compressedPublicKey.to('buffer')[0] !== 0x03)
  return account
}

module.exports = Account

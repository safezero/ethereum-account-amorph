const Account = require('./')
const Amorph = require('amorph')
const chai = require('chai')
const chaiAmorph = require('chai-amorph')
const random = require('random-amorph')
const amorphBufferPlugin = require('amorph-buffer')
const amorphBnPlugin = require('amorph-bn')

Amorph.loadPlugin(amorphBufferPlugin)
Amorph.loadPlugin(amorphBnPlugin)
Amorph.crossConverter.addPath(['buffer', 'hex', 'bn'])
Amorph.crossConverter.addPath(['bn', 'hex', 'buffer'])
Amorph.crossConverter.addPath(['hex', 'buffer', 'uint8Array'])

chai.use(chaiAmorph)
chai.should()

describe('Account', () => {
  let account
  let linkedAccount
  it('should generate', () => {
    account = Account.generate()
  })
  it('should generate negative accounts', () => {
    Array(10).fill(0).forEach(() => {
      const negativeAccount = Account.generateNegative()
      negativeAccount.compressedPublicKey.to('uint8Array')[0].should.equal(2)
    })
  })
  it('should generate postive accounts', () => {
    Array(10).fill(0).forEach(() => {
      const positiveAccount = Account.generatePositive()
      positiveAccount.compressedPublicKey.to('uint8Array')[0].should.equal(3)
    })
  })
  it('should have correct keys', () => {
    account.should.have.keys(['privateKey', 'compressedPublicKey', 'uncompressedPublicKey', 'address'])
  })
  it('should have correct lengths', () => {
    account.privateKey.to('uint8Array').should.have.length(32)
    account.compressedPublicKey.to('uint8Array').should.have.length(33)
    account.uncompressedPublicKey.to('uint8Array').should.have.length(65)
    account.address.to('uint8Array').should.have.length(20)
  })
  it('should create same account from privateKey', () => {
    const cloneAccount = new Account(account.privateKey)
    account.privateKey.should.amorphEqual(cloneAccount.privateKey)
    account.compressedPublicKey.should.amorphEqual(cloneAccount.compressedPublicKey)
    account.uncompressedPublicKey.should.amorphEqual(cloneAccount.uncompressedPublicKey)
    account.address.should.amorphEqual(cloneAccount.address)
  })
  it('should derive linked account', () => {
    linkedAccount = account.deriveLinkedAccount(random(32))
  })
  it('linked account should not have any of the same values', () => {
    account.privateKey.should.not.amorphEqual(linkedAccount.privateKey)
    account.compressedPublicKey.should.not.amorphEqual(linkedAccount.compressedPublicKey)
    account.uncompressedPublicKey.should.not.amorphEqual(linkedAccount.uncompressedPublicKey)
    account.address.should.not.amorphEqual(linkedAccount.address)
  })
  describe('should match live examples', () => {
    [
      ['myetherwallet.com', 'bfbdd1c24e1cb6e5a76f68c7183cb69519204b4fcae7942b0db9315bf4a6dbe5', 'f36150737424d151d970be96c5abdbefb554f87d'],
      ['ryepdx.github.io', 'e37078338c91ef8098b9e1fbe3a282c58ebbb281d252442d302243086fdae46d', '0d40e961d74540af6bd63c2c851684ef10f3bbb9']
    ].forEach((args) => {
      const service = args[0]
      const privateKey = new Amorph(args[1], 'hex')
      const address = new Amorph(args[2], 'hex')
      it(`${service}`, () => {
        new Account(privateKey).address.should.amorphEqual(address)
      })
    })
  })
})

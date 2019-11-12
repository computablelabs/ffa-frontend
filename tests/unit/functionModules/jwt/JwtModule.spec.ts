
import JwtModule from '../../../../src/functionModules/jwt/JwtModule'

describe('JwtModule.ts', () => {

  const jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1NzM1MjA1NDEsIm5iZiI6MTU3MzUyMDU0MSwianRpIjoiY2YyNzg4M2QtNjgxYS00MDkxLWFlN2EtN2I2OTI3MzBiZGFlIiwiZXhwIjoxNTczNjA2OTQxLCJpZGVudGl0eSI6IjB4MkMxMGM5MzFGRWJlOENBNDkwQTBEYTNGN0Y3OEQ0NjM1NTBDQjA0OCIsImZyZXNoIjpmYWxzZSwidHlwZSI6ImFjY2VzcyJ9.mMhYzR5PGvHsjbA4ZR-z23uyY6AzXsKArT4ffb_JyUk'
  const identity = '0x2C10c931FEbe8CA490A0Da3F7F78D463550CB048'
  const preDate = new Date(1473607108000)
  const postDate = new Date(1673607108000)

  it('returns expired when expired', () => {
    expect(JwtModule.hasExpired(jwt, postDate)).toBeTruthy()
  })

  it('returns false when not expired', () => {
    expect(JwtModule.hasExpired(jwt, preDate)).toBeFalsy()
  })

  it ('returns expired when the jwt is whack', () => {
    expect(JwtModule.hasExpired('jwt')).toBeTruthy()
  })

  it ('returns identity', () => {
    expect(JwtModule.getIdentity(jwt)).toEqual(identity)
  })

  it ('returns null identity when the jwt is whack', () => {
    expect(JwtModule.getIdentity('jwt')).toBeNull()
  })
})

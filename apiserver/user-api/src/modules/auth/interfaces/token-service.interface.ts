export interface ITokenService {
  encryptAsync(payload: any): Promise<string>;
  decryptAsync(token: string): Promise<any>;
  verifyTokenAsync(token: string): Promise<any>;

  generateAccessTokenAsync(payload: any): Promise<string>;
  generateRefreshTokenAsync(payload: any): Promise<string>;
}

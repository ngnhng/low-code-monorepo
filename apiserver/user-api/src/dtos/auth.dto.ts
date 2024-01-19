interface LoginDto {
  AccessToken: string;
}

interface TokenSuccessResponse {
  AccessToken: string;
  RefreshToken?: string;
}

interface RefreshDto {
  RefreshToken: string;
}

interface RegisterDto {
  Username: string;
  Password: string;
}

interface RegisterResponseDto {
  AccessToken: string;
  RefreshToken: string;
}

interface AuthPayloadDto {
  id: number;
  email: string;
  accessToken: string;
  refreshToken: string;
}

export {
  AuthPayloadDto,
  LoginDto,
  RefreshDto,
  RegisterDto,
  RegisterResponseDto,
  TokenSuccessResponse,
};

export interface AuthUser {
  id: number;
  email: string;
  name?: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
}

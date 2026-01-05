export type CurrentUserType = {
  email: string;
  ID: string;
};

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export interface JWTPayload {
  id: string;
  role: string;
}

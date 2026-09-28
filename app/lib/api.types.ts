export type UserRead = {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UserCreate = {
  email: string;
  username: string;
  password: string;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserRead;
};

export type ErrorDetail = {
  code: string;
  message: string;
};

export type ErrorResponse = {
  detail: ErrorDetail;
};

export type ValidationError = {
  loc: (string | number)[];
  msg: string;
  type: string;
};

export type ValidationErrorResponse = {
  detail: ValidationError[];
};

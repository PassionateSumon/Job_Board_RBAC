export interface SignupPayload {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  role: string;
}

export interface inviteAdminRequestPayload {
  firstName: string;
  email: string;
  role: string;
}

export interface AcceptAdminRequestPayload {
  email: string;
  token: string;
  newPassword: string;
}

export interface loginPayload {
  email: string;
  password: string;
}


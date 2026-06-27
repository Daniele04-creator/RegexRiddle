import {
  API_AUTH_PATH,
  type AuthMeResponseDTO,
  type AuthSuccessResponseDTO,
  type AuthUserResponseDTO,
  type PublicUserDTO
} from "@regexriddle/shared";

import { ApiClientError, apiGet, apiRequest } from "@/lib/api-client";

export type LoginUserInput = {
  password: string;
  usernameOrEmail: string;
};

export type RegisterUserInput = {
  displayName: string;
  email: string;
  password: string;
  username: string;
};

export async function getCurrentUser(
  signal?: AbortSignal
): Promise<PublicUserDTO | null> {
  try {
    const response = await apiGet<AuthMeResponseDTO>(`${API_AUTH_PATH}/me`, signal);

    return response.user;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

export async function loginUser(input: LoginUserInput): Promise<PublicUserDTO> {
  const response = await apiRequest<AuthUserResponseDTO, LoginUserInput>(
    `${API_AUTH_PATH}/login`,
    {
      body: input,
      method: "POST"
    }
  );

  return response.user;
}

export async function registerUser(
  input: RegisterUserInput
): Promise<PublicUserDTO> {
  const response = await apiRequest<AuthUserResponseDTO, RegisterUserInput>(
    `${API_AUTH_PATH}/register`,
    {
      body: input,
      method: "POST"
    }
  );

  return response.user;
}

export async function logoutUser(): Promise<AuthSuccessResponseDTO> {
  return apiRequest<AuthSuccessResponseDTO>(`${API_AUTH_PATH}/logout`, {
    method: "POST"
  });
}

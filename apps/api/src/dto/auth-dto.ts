import type { PublicUserDTO } from "@regexriddle/shared";

export interface PublicUserRecord {
  id: string;
  username: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

export const publicUserSelect = {
  id: true,
  username: true,
  email: true,
  displayName: true,
  createdAt: true
} as const;

export function toPublicUserDTO(user: PublicUserRecord): PublicUserDTO {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt.toISOString()
  };
}

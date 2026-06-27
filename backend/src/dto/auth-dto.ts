import type { PublicUserDTO } from "@regexriddle/shared";

export interface PublicUserRecord {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: Date;
}

export const publicUserSelect = {
  id: true,
  username: true,
  email: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
  createdAt: true
} as const;

export function toPublicUserDTO(user: PublicUserRecord): PublicUserDTO {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString()
  };
}

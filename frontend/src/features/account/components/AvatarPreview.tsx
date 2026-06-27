interface AvatarPreviewProps {
  avatarUrl: string | null;
  displayName: string;
}

function initialsFor(displayName: string): string {
  const parts = displayName
    .trim()
    .split(" ")
    .filter((part) => part.length > 0);
  const first = parts[0]?.[0] ?? "?";
  const second = parts.length > 1 ? parts[1]?.[0] : undefined;

  return `${first}${second ?? ""}`.toUpperCase();
}

export function AvatarPreview({ avatarUrl, displayName }: AvatarPreviewProps) {
  const initials = initialsFor(displayName);

  return (
    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted text-lg font-semibold text-primary">
      {avatarUrl ? (
        <img
          alt={`Avatar di ${displayName}`}
          className="size-full object-cover"
          height={64}
          loading="lazy"
          referrerPolicy="no-referrer"
          src={avatarUrl}
          width={64}
        />
      ) : (
        <span aria-label={`Iniziali di ${displayName}`}>{initials}</span>
      )}
    </div>
  );
}

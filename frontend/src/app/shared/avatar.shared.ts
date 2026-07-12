export const AVATAR_MAX_FILE_BYTES = 256 * 1024;
export const AVATAR_ACCEPTED_TYPES = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp"
]);

export function readAvatarFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Invalid avatar file."));
    });
    reader.addEventListener("error", () =>
      reject(new Error("Avatar file read failed."))
    );
    reader.readAsDataURL(file);
  });
}

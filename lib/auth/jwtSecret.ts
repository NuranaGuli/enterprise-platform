export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 16) {
    throw new Error(
      "JWT_SECRET is not set (or is too short). Set a strong, random value " +
        "in your environment before starting the app — see .env.example.",
    );
  }

  return secret;
}
const requiredEnvs = ["PORT", "MONGODB_URI"];

for (const env of requiredEnvs) {
  if (!process.env[env]) {
    throw new Error(`Missing required environment variable: ${env}`);
  }
}

import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

interface ENV {
  NODE_ENV: string | undefined;
  PORT: string | undefined;
  MONGO_URI: string | undefined;
  STRIPE_SECRET_KEY: string | undefined;
  JWT_SECRET: string | undefined;
  JWT_ACCESS_EXPIRES_IN: string | undefined;
  JWT_REFRESH_EXPIRES_IN: string | undefined;
  JWT_ISSUER: string | undefined;
  JWT_AUDIENCE: string | undefined;
  STRIPE_WEBHOOK_SECRET: string | undefined;
  EMAIL_USER: string | undefined;
  EMAIL_PASS: string | undefined;
  CLOUDINARY_CLOUD_NAME: string | undefined;
  CLOUDINARY_API_KEY: string | undefined;
  CLOUDINARY_API_SECRET: string | undefined;
  CLIENT_URL: string | undefined;
}

interface Config {
  NODE_ENV: string;
  PORT: number;
  MONGO_URI: string;
  STRIPE_SECRET_KEY: string;
  JWT_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  JWT_ISSUER: string;
  JWT_AUDIENCE: string;
  STRIPE_WEBHOOK_SECRET: string;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  CLIENT_URL: string;
}

const getConfig = (): ENV => ({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
  JWT_ISSUER: process.env.JWT_ISSUER,
  JWT_AUDIENCE: process.env.JWT_AUDIENCE,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLIENT_URL: process.env.CLIENT_URL,
});

const getSanitizedConfig = (config: ENV): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in .env`);
    }
  }
  return {
    ...config,
    PORT: Number(config.PORT!),
  } as unknown as Config;
};

const sanitizedConfig = getSanitizedConfig(getConfig());
export default sanitizedConfig;

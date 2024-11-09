namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    PORT: string;
    JWT_SECRET: string;
    STRIPE_SECRET_KEY: string;
    MONGO_URI: string;
    STRIPE_WEBHOOK_SECRET: string;
    EMAIL_USER: string;
    EMAIL_PASS: string;
    CLIENT_URL: string;
  }
}

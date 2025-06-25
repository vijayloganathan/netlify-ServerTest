// global.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    ENCRYPTION_KEY: string;
    MAIL_USER: string;
    MAIL_PASS: string;
  }
}

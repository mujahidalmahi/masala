export interface AppConfig {
  nodeEnv: string;
  port: number;
  host: string;

  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };

  jwt: {
    secret: string;
    expiration: string;
  };

  cors: {
    origin: string;
  };

  upload: {
    maxFileSize: number;
    dir: string;
  };

  ibmBob: {
    apiKey: string;
    apiUrl: string;
    model: string;
  };
}

export const configuration = (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV || 'development',

  port: parseInt(process.env.PORT || '4000', 10),

  host: process.env.HOST || '0.0.0.0',

  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'studysprint-dev-secret',
    expiration: process.env.JWT_EXPIRATION || '7d',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  upload: {
    maxFileSize: parseInt(
      process.env.MAX_FILE_SIZE || '10485760',
      10
    ),
    dir: process.env.UPLOAD_DIR || './uploads',
  },

  ibmBob: {
    apiKey: process.env.IBM_BOB_API_KEY || '',
    apiUrl:
      process.env.IBM_BOB_API_URL ||
      'https://bob.ibm.com/api/v1',
    model: process.env.IBM_BOB_MODEL || 'default',
  },
});

export type Configuration = ReturnType<typeof configuration>;
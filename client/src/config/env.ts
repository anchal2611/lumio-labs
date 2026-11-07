// Typed runtime environment configuration

export interface AppConfig {
  appName: string;
  tagline: string;
  brandStatement: string;
  env: string;
  isDemoMode: boolean;
  enableIotLab: boolean;
  enableAiLab: boolean;
  enableCollaboration: boolean;
  apiBaseUrl: string;
  socketUrl: string;
  collaborationUrl: string;
  firebase: {
    apiKey?: string;
    authDomain?: string;
    databaseURL?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    measurementId?: string;
    isConfigured: boolean;
  };
}

const rawEnv = (import.meta as any).env || {};

const firebaseApiKey = rawEnv.VITE_FIREBASE_API_KEY || '';
const firebaseProjectId = rawEnv.VITE_FIREBASE_PROJECT_ID || '';

const isViteDev = typeof window !== 'undefined' && window.location.port === '5173';
const defaultHost = isViteDev ? 'http://localhost:5000' : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');
const configuredApiBaseUrl = String(rawEnv.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');

function resolveApiBaseUrl(): string {
  if (!configuredApiBaseUrl) return isViteDev ? '/api' : `${defaultHost}/api`;

  // A localhost URL without an explicit port commonly comes from a mistaken
  // VITE_API_BASE_URL. In dev the API listens on 5000; in production the API
  // is served by the same origin as the client.
  try {
    const configured = new URL(configuredApiBaseUrl);
    const isLoopback = configured.hostname === 'localhost' || configured.hostname === '127.0.0.1';
    if (isLoopback && !configured.port) {
      return isViteDev
        ? `http://localhost:5000${configured.pathname.replace(/\/$/, '')}`
        : `${defaultHost}${configured.pathname.replace(/\/$/, '')}`;
    }
  } catch {
    // Relative API paths are valid and are resolved by the browser.
  }

  return configuredApiBaseUrl;
}

export const config: AppConfig = {
  appName: rawEnv.VITE_APP_NAME || 'LUMIO',
  tagline: rawEnv.VITE_APP_TAGLINE || 'Virtual Labs. Limitless Learning.',
  brandStatement: rawEnv.VITE_APP_BRAND_STATEMENT || 'Explore. Experiment. Execute.',
  env: rawEnv.VITE_APP_ENV || 'development',
  isDemoMode: rawEnv.VITE_ENABLE_DEMO_MODE !== 'false',
  enableIotLab: rawEnv.VITE_ENABLE_IOT_LAB !== 'false',
  enableAiLab: rawEnv.VITE_ENABLE_AI_LAB !== 'false',
  enableCollaboration: rawEnv.VITE_ENABLE_COLLABORATION !== 'false',
  apiBaseUrl: resolveApiBaseUrl(),
  socketUrl: rawEnv.VITE_SOCKET_URL || defaultHost,
  collaborationUrl: rawEnv.VITE_COLLABORATION_URL || defaultHost,
  firebase: {
    apiKey: firebaseApiKey,
    authDomain: rawEnv.VITE_FIREBASE_AUTH_DOMAIN || '',
    databaseURL: rawEnv.VITE_FIREBASE_DATABASE_URL || '',
    projectId: firebaseProjectId,
    storageBucket: rawEnv.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: rawEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: rawEnv.VITE_FIREBASE_APP_ID || '',
    measurementId: rawEnv.VITE_FIREBASE_MEASUREMENT_ID || '',
    isConfigured: Boolean(firebaseApiKey && firebaseProjectId),
  },
};

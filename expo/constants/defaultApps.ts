// Default app configurations with openUrl schemes
export const DEFAULT_APPS = {
  'Instagram': {
    openUrl: 'instagram://app',
    schemeOrStoreURL: 'instagram://',
  },
  'TikTok': {
    openUrl: 'tiktok://',
    schemeOrStoreURL: 'tiktok://',
  },
  'YouTube': {
    openUrl: 'youtube://',
    schemeOrStoreURL: 'youtube://',
  },
  'Snapchat': {
    openUrl: 'snapchat://',
    schemeOrStoreURL: 'snapchat://',
  },
  'Twitter': {
    openUrl: 'twitter://',
    schemeOrStoreURL: 'twitter://',
  },
  'X': {
    openUrl: 'twitter://',
    schemeOrStoreURL: 'twitter://',
  },
  'Facebook': {
    openUrl: 'fb://',
    schemeOrStoreURL: 'fb://',
  },
  'WhatsApp': {
    openUrl: 'whatsapp://',
    schemeOrStoreURL: 'whatsapp://',
  },
  'Reddit': {
    openUrl: 'reddit://',
    schemeOrStoreURL: 'reddit://',
  },
  'Discord': {
    openUrl: 'discord://',
    schemeOrStoreURL: 'discord://',
  },
} as const;

export type DefaultAppName = keyof typeof DEFAULT_APPS;

export const getDefaultAppConfig = (appName: string) => {
  return DEFAULT_APPS[appName as DefaultAppName];
};



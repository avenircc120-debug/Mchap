import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@mchap_site_config';

export type DomainType = 'subdomain' | 'custom';

export interface SiteConfig {
  youtubeUrl: string;
  adsenseId: string;
  domainType: DomainType;
  subdomainName: string;
  customDomain: string;
  projectName: string;
  projectInitialized: boolean;
}

const defaultConfig: SiteConfig = {
  youtubeUrl: '',
  adsenseId: '',
  domainType: 'subdomain',
  subdomainName: '',
  customDomain: '',
  projectName: '',
  projectInitialized: false,
};

interface SiteConfigContextValue {
  config: SiteConfig;
  setConfig: (partial: Partial<SiteConfig>) => void;
  videoId: string | null;
  resetProject: () => void;
}

const SiteConfigContext = createContext<SiteConfigContextValue>({
  config: defaultConfig,
  setConfig: () => {},
  videoId: null,
  resetProject: () => {},
});

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
    /shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<SiteConfig>(defaultConfig);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const saved = JSON.parse(raw) as SiteConfig;
          setConfigState({ ...defaultConfig, ...saved });
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  const setConfig = (partial: Partial<SiteConfig>) => {
    setConfigState((prev) => {
      const next = { ...prev, ...partial };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const resetProject = () => {
    const fresh = { ...defaultConfig };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    setConfigState(fresh);
  };

  const videoId = extractYouTubeId(config.youtubeUrl);

  if (!loaded) return null;

  return (
    <SiteConfigContext.Provider value={{ config, setConfig, videoId, resetProject }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROJECTS_KEY = '@mchap_projects_v2';
const ACTIVE_KEY = '@mchap_active_project_id';

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

export interface Project extends SiteConfig {
  id: string;
  createdAt: number;
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
  // Multi-project
  projects: Project[];
  activeProjectId: string | null;
  createProject: (name: string, subdomain: string) => void;
  loadProject: (id: string) => void;
}

const SiteConfigContext = createContext<SiteConfigContextValue>({
  config: defaultConfig,
  setConfig: () => {},
  videoId: null,
  resetProject: () => {},
  projects: [],
  activeProjectId: null,
  createProject: () => {},
  loadProject: () => {},
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

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

async function saveProjects(projects: Project[]) {
  await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

async function saveActiveId(id: string | null) {
  if (id) {
    await AsyncStorage.setItem(ACTIVE_KEY, id);
  } else {
    await AsyncStorage.removeItem(ACTIVE_KEY);
  }
}

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjectsState] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [rawProjects, rawActiveId] = await Promise.all([
          AsyncStorage.getItem(PROJECTS_KEY),
          AsyncStorage.getItem(ACTIVE_KEY),
        ]);
        const savedProjects: Project[] = rawProjects ? JSON.parse(rawProjects) : [];
        setProjectsState(savedProjects);
        // Only restore active project if it still exists
        if (rawActiveId && savedProjects.find((p) => p.id === rawActiveId)) {
          setActiveProjectId(rawActiveId);
        }
      } catch {}
      setLoaded(true);
    })();
  }, []);

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? null;
  const config: SiteConfig = activeProject ?? defaultConfig;

  const setConfig = (partial: Partial<SiteConfig>) => {
    if (!activeProjectId) return;
    setProjectsState((prev) => {
      const next = prev.map((p) =>
        p.id === activeProjectId ? { ...p, ...partial } : p,
      );
      saveProjects(next);
      return next;
    });
  };

  const createProject = (name: string, subdomain: string) => {
    const newProject: Project = {
      ...defaultConfig,
      id: generateId(),
      createdAt: Date.now(),
      projectName: name,
      subdomainName: subdomain,
      domainType: 'subdomain',
      projectInitialized: true,
    };
    setProjectsState((prev) => {
      const next = [...prev, newProject];
      saveProjects(next);
      return next;
    });
    setActiveProjectId(newProject.id);
    saveActiveId(newProject.id);
  };

  const loadProject = (id: string) => {
    setActiveProjectId(id);
    saveActiveId(id);
  };

  const resetProject = () => {
    // Go back to the project list (no active project)
    setActiveProjectId(null);
    saveActiveId(null);
  };

  const videoId = extractYouTubeId(config.youtubeUrl);

  if (!loaded) return null;

  return (
    <SiteConfigContext.Provider
      value={{ config, setConfig, videoId, resetProject, projects, activeProjectId, createProject, loadProject }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}

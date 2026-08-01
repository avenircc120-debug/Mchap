import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useSiteConfig, type Project } from '@/context/SiteConfigContext';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import DrawerMenu from '@/components/DrawerMenu';
import PublishModal, { type PublishState } from '@/components/PublishModal';

type Section = 'youtube' | 'adsense' | 'domain';

// ─── Project List Screen (home when projects exist) ─────────────────────────
function ProjectListScreen({
  projects,
  onOpen,
  onNew,
  colors,
  topPad,
  bottomPad,
}: {
  projects: Project[];
  onOpen: (id: string) => void;
  onNew: () => void;
  colors: ReturnType<typeof useColors>;
  topPad: number;
  bottomPad: number;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.projectName.toLowerCase().includes(q) ||
        p.subdomainName.toLowerCase().includes(q),
    );
  }, [projects, query]);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <View
      style={[
        styles.listRoot,
        { paddingTop: topPad, paddingBottom: bottomPad, backgroundColor: colors.background },
      ]}
    >
      {/* Header brand */}
      <View style={styles.listHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.brandTitle, { color: colors.foreground, fontSize: 22 }]}>Mchap</Text>
          <Text style={[styles.brandTagline, { color: colors.mutedForeground, fontSize: 12, textAlign: 'left' }]}>
            {projects.length} projet{projects.length > 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.newBtn, { backgroundColor: colors.primary }]}
          onPress={onNew}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={18} color="#FFFFFF" />
          <Text style={styles.newBtnText}>Nouveau</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Rechercher un projet…"
          placeholderTextColor={colors.mutedForeground}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {/* Project list */}
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {filtered.length === 0 ? (
          <View style={styles.emptySearch}>
            <Feather name="inbox" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptySearchText, { color: colors.mutedForeground }]}>
              {query ? 'Aucun projet trouvé' : 'Aucun projet'}
            </Text>
          </View>
        ) : (
          filtered
            .slice()
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((project) => (
              <TouchableOpacity
                key={project.id}
                style={[styles.projectCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onOpen(project.id);
                }}
                activeOpacity={0.75}
              >
                <View style={[styles.projectAvatar, { backgroundColor: colors.secondary }]}>
                  <Feather name="globe" size={20} color={colors.primary} />
                </View>
                <View style={styles.projectInfo}>
                  <Text style={[styles.projectName, { color: colors.foreground }]} numberOfLines={1}>
                    {project.projectName}
                  </Text>
                  <Text style={[styles.projectDomain, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {project.subdomainName ? `${project.subdomainName}.mchap.app` : '.mchap.app'}
                  </Text>
                  <Text style={[styles.projectDate, { color: colors.mutedForeground }]}>
                    Créé le {formatDate(project.createdAt)}
                  </Text>
                </View>
                <View style={styles.projectMeta}>
                  {project.youtubeUrl ? (
                    <View style={[styles.metaDot, { backgroundColor: colors.secondary }]}>
                      <Feather name="youtube" size={11} color={colors.primary} />
                    </View>
                  ) : null}
                  {project.adsenseId ? (
                    <View style={[styles.metaDot, { backgroundColor: colors.secondary }]}>
                      <Feather name="dollar-sign" size={11} color={colors.primary} />
                    </View>
                  ) : null}
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                </View>
              </TouchableOpacity>
            ))
        )}
      </ScrollView>
    </View>
  );
}

// ─── Landing Screen ────────────────────────────────────────────────────────
function LandingScreen({
  onStart,
  colors,
  topPad,
  bottomPad,
}: {
  onStart: () => void;
  colors: ReturnType<typeof useColors>;
  topPad: number;
  bottomPad: number;
}) {
  return (
    <View style={[styles.landingRoot, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      {/* Logo / Brand */}
      <View style={styles.landingBrand}>
        <Text style={[styles.brandTitle, { color: colors.foreground }]}>Mchap</Text>
        <Text style={[styles.brandTagline, { color: colors.mutedForeground }]}>
          Créez votre mini-site en quelques minutes
        </Text>
      </View>

      {/* Feature list */}
      <View style={[styles.featureList, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { icon: 'youtube' as const, text: 'Vidéo YouTube en lecture automatique' },
          { icon: 'dollar-sign' as const, text: 'Monétisation Google AdSense intégrée' },
          { icon: 'globe' as const, text: 'Sous-domaine .mchap.app personnalisé' },
          { icon: 'upload-cloud' as const, text: 'Publication en un clic' },
        ].map((item, i) => (
          <View
            key={i}
            style={[
              styles.featureItem,
              i < 3 && { borderBottomWidth: 1, borderBottomColor: colors.border },
            ]}
          >
            <View style={[styles.featureIcon, { backgroundColor: colors.secondary }]}>
              <Feather name={item.icon} size={16} color={colors.primary} />
            </View>
            <Text style={[styles.featureText, { color: colors.foreground }]}>{item.text}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
        onPress={onStart}
        activeOpacity={0.88}
      >
        <Feather name="plus" size={20} color="#FFFFFF" />
        <Text style={styles.ctaBtnText}>Créer mon mini-site</Text>
      </TouchableOpacity>

      <Text style={[styles.landingNote, { color: colors.mutedForeground }]}>
        Gratuit · Aucune carte requise
      </Text>
    </View>
  );
}

// ─── Project Creation Modal ────────────────────────────────────────────────
function CreateProjectModal({
  visible,
  onConfirm,
  onClose,
  colors,
}: {
  visible: boolean;
  onConfirm: (name: string, subdomain: string) => void;
  onClose: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [nameError, setNameError] = useState('');
  const [subError, setSubError] = useState('');

  const sanitizeSubdomain = (val: string) =>
    val.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40);

  const handleNameChange = (val: string) => {
    setName(val);
    if (nameError) setNameError('');
    // Auto-fill subdomain from name
    const auto = val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    setSubdomain(auto);
  };

  const handleConfirm = () => {
    let valid = true;
    if (!name.trim()) {
      setNameError('Donnez un nom à votre application');
      valid = false;
    }
    if (!subdomain.trim() || subdomain.length < 3) {
      setSubError('Le sous-domaine doit faire au moins 3 caractères');
      valid = false;
    }
    if (!valid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConfirm(name.trim(), subdomain.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
          {/* Handle */}
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

          <Text style={[styles.modalTitle, { color: colors.foreground }]}>
            Nommer votre application
          </Text>
          <Text style={[styles.modalSubtitle, { color: colors.mutedForeground }]}>
            Ces informations identifieront votre mini-site.
          </Text>

          {/* App name */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
              Nom de l'application
            </Text>
            <TextInput
              style={[
                styles.fieldInput,
                {
                  backgroundColor: colors.muted,
                  borderColor: nameError ? '#EF4444' : name ? colors.primary : colors.input,
                  color: colors.foreground,
                },
              ]}
              placeholder="Ex : Mon Blog Vidéo"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={handleNameChange}
              autoCapitalize="words"
              returnKeyType="next"
            />
            {!!nameError && (
              <Text style={styles.fieldError}>{nameError}</Text>
            )}
          </View>

          {/* Subdomain */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
              Nom de domaine
            </Text>
            <View
              style={[
                styles.domainRow,
                {
                  backgroundColor: colors.muted,
                  borderColor: subError ? '#EF4444' : subdomain ? colors.primary : colors.input,
                },
              ]}
            >
              <TextInput
                style={[styles.domainInput, { color: colors.foreground }]}
                placeholder="mon-site"
                placeholderTextColor={colors.mutedForeground}
                value={subdomain}
                onChangeText={(v) => {
                  setSubdomain(sanitizeSubdomain(v));
                  if (subError) setSubError('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleConfirm}
              />
              <Text style={[styles.domainSuffix, { color: colors.primary }]}>.mchap.app</Text>
            </View>
            {!!subError && (
              <Text style={styles.fieldError}>{subError}</Text>
            )}
            {!!subdomain && !subError && (
              <Text style={[styles.domainPreview, { color: colors.mutedForeground }]}>
                🔗 {subdomain}.mchap.app
              </Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalCancelBtn, { borderColor: colors.border }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalCancelText, { color: colors.mutedForeground }]}>
                Annuler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalConfirmBtn, { backgroundColor: colors.primary }]}
              onPress={handleConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.modalConfirmText}>Créer</Text>
              <Feather name="arrow-right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Dashboard Screen ──────────────────────────────────────────────────────
export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { config, setConfig, resetProject, projects, activeProjectId, createProject, loadProject } = useSiteConfig();
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [publishState, setPublishState] = useState<PublishState>({ kind: 'idle' });
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const topPad = Platform.OS === 'web' ? 0 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 24 : insets.bottom;

  const handleStartCreate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCreateModalOpen(true);
  };

  const handleConfirmCreate = (name: string, subdomain: string) => {
    createProject(name, subdomain);
    setCreateModalOpen(false);
    setActiveSection('youtube');
  };

  const handlePreview = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/preview');
  };

  const handlePublish = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setPublishState({ kind: 'loading' });
    try {
      const resp = await fetch(
        `https://${process.env.EXPO_PUBLIC_DOMAIN}/api/publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            youtubeUrl: config.youtubeUrl,
            adsenseId: config.adsenseId,
            domainType: config.domainType,
            subdomainName: config.subdomainName,
            customDomain: config.customDomain,
            projectName: config.projectName,
          }),
        },
      );
      const data = await resp.json();
      if (!resp.ok) {
        setPublishState({ kind: 'error', message: data.error ?? 'Erreur inconnue' });
        return;
      }
      setPublishState({
        kind: 'success',
        url: data.url,
        githubUrl: data.githubCommitUrl ?? null,
      });
    } catch {
      setPublishState({ kind: 'error', message: 'Impossible de joindre le serveur.' });
    }
  };

  // ── No active project: show list (or landing if no projects yet) ──
  if (!activeProjectId) {
    return (
      <>
        {projects.length > 0 ? (
          <ProjectListScreen
            projects={projects}
            onOpen={(id) => loadProject(id)}
            onNew={handleStartCreate}
            colors={colors}
            topPad={topPad + 8}
            bottomPad={bottomPad + 16}
          />
        ) : (
          <LandingScreen
            onStart={handleStartCreate}
            colors={colors}
            topPad={topPad + 16}
            bottomPad={bottomPad + 16}
          />
        )}
        <CreateProjectModal
          visible={createModalOpen}
          onConfirm={handleConfirmCreate}
          onClose={() => setCreateModalOpen(false)}
          colors={colors}
        />
      </>
    );
  }

  // ── Dashboard (project initialized) ──
  return (
    <View style={[styles.root, { backgroundColor: '#FFFFFF' }]}>

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: topPad + 4, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.hamburger, { backgroundColor: colors.muted }]}
          onPress={() => setDrawerOpen(true)}
          activeOpacity={0.7}
        >
          <Feather name="menu" size={20} color={colors.foreground} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={[styles.headerDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
            {config.projectName || 'Mon mini-site'}
          </Text>
        </View>

        {/* Domain pill */}
        <View style={[styles.domainPill, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.domainPillText, { color: colors.primary }]} numberOfLines={1}>
            {config.subdomainName ? `${config.subdomainName}.mchap.app` : '.mchap.app'}
          </Text>
        </View>
      </View>

      {/* ── Tab nav ── */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        {(['youtube', 'adsense', 'domain'] as Section[]).map((s) => {
          const meta: Record<Section, { icon: React.ComponentProps<typeof Feather>['name']; label: string }> = {
            youtube: { icon: 'youtube', label: 'Vidéo' },
            adsense: { icon: 'dollar-sign', label: 'AdSense' },
            domain: { icon: 'globe', label: 'Domaine' },
          };
          const isActive = activeSection === s;
          return (
            <TouchableOpacity
              key={s}
              style={[
                styles.tabItem,
                isActive && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
              ]}
              onPress={() => setActiveSection(s)}
              activeOpacity={0.7}
            >
              <Feather
                name={meta[s].icon}
                size={16}
                color={isActive ? colors.primary : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? colors.primary : colors.mutedForeground },
                ]}
              >
                {meta[s].label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Main content ── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={topPad + 120}
      >
        {activeSection === null ? (
          <View style={styles.emptyHint}>
            <Feather name="arrow-up" size={18} color={colors.mutedForeground} />
            <Text style={[styles.emptyHintText, { color: colors.mutedForeground }]}>
              Sélectionnez un onglet pour configurer votre site
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.sectionContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {activeSection === 'youtube' && (
              <SectionYouTube config={config} setConfig={setConfig} colors={colors} />
            )}
            {activeSection === 'adsense' && (
              <SectionAdSense config={config} setConfig={setConfig} colors={colors} />
            )}
            {activeSection === 'domain' && (
              <SectionDomain config={config} setConfig={setConfig} colors={colors} />
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {/* ── Bottom bar: Prévisualiser + Publier ── */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: bottomPad + 12,
            borderTopColor: colors.border,
            backgroundColor: '#FFFFFF',
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.actionBtn, styles.previewBtn, { borderColor: colors.primary }]}
          onPress={handlePreview}
          activeOpacity={0.85}
        >
          <Feather name="eye" size={18} color={colors.primary} />
          <Text style={[styles.actionBtnText, { color: colors.primary }]}>Prévisualiser</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.publishBtn, { backgroundColor: colors.primary }]}
          onPress={handlePublish}
          activeOpacity={0.85}
        >
          <Feather name="upload-cloud" size={18} color={colors.primaryForeground} />
          <Text style={[styles.actionBtnText, { color: colors.primaryForeground }]}>Publier</Text>
        </TouchableOpacity>
      </View>

      {/* ── Drawer & Modals ── */}
      <DrawerMenu
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onGoHome={() => {
          resetProject();
          setDrawerOpen(false);
        }}
        onNewProject={() => {
          resetProject();
          setDrawerOpen(false);
          setCreateModalOpen(true);
        }}
        onLogout={() => {
          resetProject();
        }}
      />
      <PublishModal
        state={publishState}
        onClose={() => setPublishState({ kind: 'idle' })}
      />
    </View>
  );
}

// ─── Section: YouTube ────────────────────────────────────────────────────────
function SectionYouTube({
  config,
  setConfig,
  colors,
}: {
  config: ReturnType<typeof useSiteConfig>['config'];
  setConfig: ReturnType<typeof useSiteConfig>['setConfig'];
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={[styles.sectionIcon, { backgroundColor: colors.secondary }]}>
        <Feather name="youtube" size={22} color={colors.primary} />
      </View>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Lien YouTube</Text>
      <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
        Collez l'URL de la vidéo à afficher. Elle sera lue automatiquement, en
        mode silencieux, sur votre mini-site.
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: '#FFFFFF',
            borderColor: config.youtubeUrl ? colors.primary : colors.input,
            color: colors.foreground,
          },
        ]}
        placeholder="https://www.youtube.com/watch?v=..."
        placeholderTextColor={colors.mutedForeground}
        value={config.youtubeUrl}
        onChangeText={(v) => setConfig({ youtubeUrl: v })}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        returnKeyType="done"
      />
      {!!config.youtubeUrl && (
        <View style={[styles.hint, { backgroundColor: colors.secondary }]}>
          <Feather name="check-circle" size={14} color={colors.primary} />
          <Text style={[styles.hintText, { color: colors.primary }]}>
            Vidéo détectée — lecture automatique activée
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Section: AdSense ────────────────────────────────────────────────────────
function SectionAdSense({
  config,
  setConfig,
  colors,
}: {
  config: ReturnType<typeof useSiteConfig>['config'];
  setConfig: ReturnType<typeof useSiteConfig>['setConfig'];
  colors: ReturnType<typeof useColors>;
}) {
  const isValid = /^ca-pub-\d{16}$/.test(config.adsenseId);
  const showHint = config.adsenseId.length > 0;

  return (
    <View style={styles.sectionCard}>
      <View style={[styles.sectionIcon, { backgroundColor: colors.secondary }]}>
        <Feather name="dollar-sign" size={22} color={colors.primary} />
      </View>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Google AdSense</Text>
      <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
        Entrez votre identifiant AdSense pour afficher des publicités et monétiser votre mini-site.
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: '#FFFFFF',
            borderColor: isValid ? colors.primary : showHint ? '#EF4444' : colors.input,
            color: colors.foreground,
          },
        ]}
        placeholder="ca-pub-XXXXXXXXXXXXXXXX"
        placeholderTextColor={colors.mutedForeground}
        value={config.adsenseId}
        onChangeText={(v) => setConfig({ adsenseId: v })}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
      />
      {showHint && (
        <View
          style={[
            styles.hint,
            { backgroundColor: isValid ? colors.secondary : '#FEF2F2' },
          ]}
        >
          <Feather
            name={isValid ? 'check-circle' : 'alert-circle'}
            size={14}
            color={isValid ? colors.primary : '#EF4444'}
          />
          <Text style={[styles.hintText, { color: isValid ? colors.primary : '#EF4444' }]}>
            {isValid ? 'Identifiant valide' : 'Format attendu : ca-pub-XXXXXXXXXXXXXXXX'}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Section: Domain ─────────────────────────────────────────────────────────
function SectionDomain({
  config,
  setConfig,
  colors,
}: {
  config: ReturnType<typeof useSiteConfig>['config'];
  setConfig: ReturnType<typeof useSiteConfig>['setConfig'];
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={[styles.sectionIcon, { backgroundColor: colors.secondary }]}>
        <Feather name="globe" size={22} color={colors.primary} />
      </View>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Nom de domaine</Text>
      <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
        Choisissez un sous-domaine pour votre mini-site ou entrez votre propre domaine.
      </Text>

      {/* Toggle */}
      <View style={[styles.toggleRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            config.domainType === 'subdomain' && { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
          ]}
          onPress={() => setConfig({ domainType: 'subdomain' })}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleText, { color: config.domainType === 'subdomain' ? colors.foreground : colors.mutedForeground }]}>
            Sous-domaine
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            config.domainType === 'custom' && { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
          ]}
          onPress={() => setConfig({ domainType: 'custom' })}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleText, { color: config.domainType === 'custom' ? colors.foreground : colors.mutedForeground }]}>
            Domaine perso
          </Text>
        </TouchableOpacity>
      </View>

      {config.domainType === 'subdomain' ? (
        <View
          style={[
            styles.domainInputRow,
            {
              borderColor: config.subdomainName ? colors.primary : colors.input,
              backgroundColor: '#FFFFFF',
            },
          ]}
        >
          <TextInput
            style={[styles.domainInput, { color: colors.foreground }]}
            placeholder="votre-site"
            placeholderTextColor={colors.mutedForeground}
            value={config.subdomainName}
            onChangeText={(v) =>
              setConfig({
                subdomainName: v.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40),
              })
            }
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
          />
          <Text style={[styles.domainSuffix, { color: colors.primary }]}>.mchap.app</Text>
        </View>
      ) : (
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: '#FFFFFF',
              borderColor: config.customDomain ? colors.primary : colors.input,
              color: colors.foreground,
            },
          ]}
          placeholder="www.votre-domaine.com"
          placeholderTextColor={colors.mutedForeground}
          value={config.customDomain}
          onChangeText={(v) => setConfig({ customDomain: v })}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="done"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Project list ──
  listRoot: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
    paddingBottom: 16,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  newBtnText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    padding: 0,
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    gap: 10,
    paddingBottom: 24,
  },
  emptySearch: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 60,
    opacity: 0.5,
  },
  emptySearchText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  projectAvatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectInfo: {
    flex: 1,
    gap: 2,
  },
  projectName: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  projectDomain: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  projectDate: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    opacity: 0.7,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaDot: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Landing ──
  landingRoot: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  landingBrand: {
    alignItems: 'center',
    gap: 10,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  featureList: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  featureIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
  ctaBtn: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaBtnText: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  landingNote: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: -16,
  },

  // ── Project creation modal ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
    marginTop: -8,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  fieldInput: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  fieldError: {
    fontSize: 12,
    color: '#EF4444',
    fontFamily: 'Inter_400Regular',
  },
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: 'hidden',
    height: 52,
  },
  domainInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  domainSuffix: {
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    alignSelf: 'center',
  },
  domainPreview: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  modalCancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  modalConfirmBtn: {
    flex: 2,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },

  // ── Dashboard ──
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
    borderBottomWidth: 1,
  },
  hamburger: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginLeft: 2,
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  domainPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    maxWidth: 140,
  },
  domainPillText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginBottom: -1,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  emptyHint: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    opacity: 0.5,
  },
  emptyHintText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  sectionContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 20,
  },
  sectionCard: {
    gap: 12,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  sectionDesc: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 21,
  },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  hintText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    height: 40,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  domainInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
    height: 52,
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
  },
  actionBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  previewBtn: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  publishBtn: {
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
});

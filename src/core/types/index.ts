export type {
  RevelationType,
  Verse,
  Surah,
  SurahWithVerses,
  Translation,
  TranslationResource,
  Tafsir,
  TafsirResource,
  AudioRecitation,
  Reciter,
  Hadith,
  HadithBook,
  HadithCollection,
} from "./quran";

export type {
  Bookmark,
  LinkedResource,
  Note,
  ReadingProgress,
  ThemeMode,
  ArabicFont,
  ArabicFontSize,
  TranslationFontSize,
  TranslationColorSlot,
  TranslationConfig,
  TranslationLayout,
  ReadingDensity,
  ReadingFlow,
  ThemeName,
  UserPreferences,
} from "./study";
export { toUserPreferences, getResolvedTranslationConfigs, noteLocationLabel } from "./study";

export type {
  NodeType,
  EdgeType,
  GraphNode,
  GraphEdge,
  KnowledgeGraph,
  SimulationNode,
  SimulationEdge,
  GraphStats,
} from "./graph";

export type {
  ScriptureSource,
  ScriptureVerse,
  CrossScriptureCluster,
  CrossReference,
} from "./cross-reference";

export type {
  ApiSuccess,
  ApiError,
  ApiResponse,
  ApiMeta,
} from "./api";

export type { PanelId, DockPosition, PanelConfig } from "./panel";
export { PANEL_REGISTRY } from "./panel";

export type { WorkspacePreset } from "./preset";
export { BUILT_IN_PRESETS } from "./preset";

export type {
  QuranicConcept,
  HadithVerseLink,
  HadithTopic,
} from "./ontology";

import path from './node-builtin-modules/path.js';

export const MOD_DATA_DIR = path.join('assets', 'ru-translation-tool-ng');
export const SETTINGS_FILE = path.join(MOD_DATA_DIR, 'settings.json');
export const CHAPTER_STATUSES_FILE = path.join(
  MOD_DATA_DIR,
  'chapter-statuses.json',
);
export const CHAPTER_FRAGMENTS_DIR = path.join(
  MOD_DATA_DIR,
  'chapter-fragments',
);
export const LOCALIZE_ME_PACKS_DIR = path.join(
  MOD_DATA_DIR,
  'localize-me-packs',
);
export const LOCALIZE_ME_MAPPING_FILE = path.join(
  MOD_DATA_DIR,
  'localize-me-mapping.json',
);

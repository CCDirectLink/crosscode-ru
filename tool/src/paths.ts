import paths from './node-builtin-modules/path.js';

export const MOD_ROOT_DIR = paths.join(
  '.',
  new URL(decodeURI(import.meta.url)).pathname,
  '..',
  '..',
  '..',
);
export const MOD_DATA_DIR = paths.join(MOD_ROOT_DIR, 'assets', 'ru-translation-tool');
export const SETTINGS_FILE = paths.join(MOD_DATA_DIR, 'settings.json');
export const CHAPTER_STATUSES_FILE = paths.join(MOD_DATA_DIR, 'chapter-statuses.json');
export const CHAPTER_FRAGMENTS_DIR = paths.join(MOD_DATA_DIR, 'chapter-fragments');
export const LOCALIZE_ME_PACKS_DIR = paths.join(MOD_DATA_DIR, 'localize-me-packs');
export const LOCALIZE_ME_MAPPING_FILE = paths.join(MOD_DATA_DIR, 'localize-me-mapping.json');
export const MIGRATION_LOOKUP_TABLE_FILE = paths.join(MOD_DATA_DIR, 'migration-lookup-table.json');
export const CROSSLOCALE_SCAN_DB_FILE = paths.join(MOD_DATA_DIR, 'scan.json');

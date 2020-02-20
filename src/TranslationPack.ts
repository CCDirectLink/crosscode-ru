import * as Nota from './Notabenoid';

type LocalizeMeMappingTable = Record<string, string>;

type LocalizeMePack = Record<string, { orig: string; text: string }>;

export function notaFragmentsToPack(
  fragments: Nota.Fragment[],
): LocalizeMePack {
  let pack: LocalizeMePack = {};
  fragments.forEach(fragment => {
    if (fragment.translations.length === 0) return;
    let { file, jsonPath } = fragment.original;
    if (!file.startsWith('data/')) return;
    file = file.slice('data/'.length);
    jsonPath = jsonPath.replace(/\./g, '/');

    pack[`${file}.json/${jsonPath}`] = {
      orig: fragment.original.text,
      text: fragment.translations[0].text,
    };
  });
  return pack;
}

// useful links:
// https://github.com/uisky/notabenoid

import { fetchDocument } from './utils.js';

const BOOK_ID = '74823';

const RU_ABBREVIATED_MONTH_NAMES = [
  'янв.',
  'февр.',
  'марта',
  'апр.',
  'мая',
  'июня',
  'июля',
  'авг.',
  'сент.',
  'окт.',
  'нояб.',
  'дек.',
];

// I hope this doesn't get changed... although, the latest commit on Nota's
// repo is from 2016, so such changes are very unlikely.
const CHAPTER_PAGE_SIZE = 50;

export interface ChapterStatus {
  id: string;
  name: string;
  lastModificationTimestamp: Date;
  translatedFragments: number;
  totalFragments: number;
}

export interface Chapter extends ChapterStatus {
  fragments: Fragment[];
}

export interface Fragment {
  original: Original;
  translations: Translation[];
  id: string;
}

export interface Original {
  rawContent: string;
  file: string;
  jsonPath: string;
  langUid: number | null;
  descriptionLines: string[];
  text: string;
}

export interface Translation {
  rawText: string;
  text: string;
  authorUsername: string;
  votes: number;
  score: number;
  timestamp: Date;
  flags: Record<string, boolean | string>;
}

export class NotaClient {
  constructor(readonly options: { anonymous: boolean }) {}

  private async makeRequest(path: string) {
    let url = new URL(
      path,
      this.options.anonymous
        ? 'https://opennota2.duckdns.org'
        : 'http://notabenoid.org',
    );
    let doc = await fetchDocument(url);

    if (
      doc.querySelector(
        'form[method="post"][action="/"] input[name^="login"]',
      ) != null
    ) {
      throw new Error('authentication required');
    }

    return doc;
  }

  async fetchAllChapterStatuses(): Promise<Record<string, ChapterStatus>> {
    let doc = await this.makeRequest(`/book/${BOOK_ID}`);
    let result: Record<string, ChapterStatus> = {};
    doc.querySelectorAll<HTMLElement>('#Chapters > tbody > tr').forEach(tr => {
      let chapterStatus = parseChapterStatus(tr);
      if (chapterStatus == null) return null;
      result[chapterStatus.name] = chapterStatus;
    });
    return result;
  }

  async fetchChapterFragments(status: ChapterStatus): Promise<Fragment[]> {
    let fragments: Fragment[] = [];

    let pages = Math.ceil(status.totalFragments / CHAPTER_PAGE_SIZE);
    for (let i = 0; i < pages; i++) {
      console.log(`${status.name}, page ${i + 1}/${pages}`);
      let doc = await this.makeRequest(
        `/book/${BOOK_ID}/${status.id}?Orig_page=${i + 1}`,
      );

      doc.querySelectorAll('#Tr > tbody > tr').forEach(tr => {
        let f = parseFragment(tr);
        if (f != null) fragments.push(f);
      });
    }

    return fragments;
  }
}

function parseChapterStatus(element: HTMLElement): ChapterStatus | null {
  let cs: Partial<ChapterStatus> = {};

  let id = element.dataset.id;
  if (id == null) return null;
  cs.id = id;
  let anchor = element.querySelector(':scope > td:nth-child(1) > a');
  if (anchor == null) return null;
  let activityElem = element.querySelector<HTMLElement>(
    ':scope > td:nth-child(3) > span',
  );
  if (activityElem == null) return null;
  let doneElem = element.querySelector<HTMLElement>(
    ':scope > td:nth-child(4) > small',
  );
  if (doneElem == null) return null;

  cs.name = anchor.textContent!;

  let match = /(\d+) ([а-я.]+) (\d+) г., (\d+):(\d+)/.exec(activityElem.title);
  if (match == null || match.length !== 6) return null;
  let [day, month, year, hour, minute] = match.slice(1);
  let [dayN, yearN, hourN, minuteN] = [day, year, hour, minute].map(s =>
    parseInt(s, 10),
  );
  let monthIndex = RU_ABBREVIATED_MONTH_NAMES.indexOf(month);
  if (monthIndex < 0) return null;
  cs.lastModificationTimestamp = new Date(
    Date.UTC(yearN, monthIndex, dayN, hourN - 3, minuteN),
  );

  match = /\((\d+) \/ (\d+)\)/.exec(doneElem.textContent!);
  if (match == null || match.length !== 3) return null;
  let [translatedFragments, totalFragments] = match
    .slice(1)
    .map(s => parseInt(s, 10));
  cs.translatedFragments = translatedFragments;
  cs.totalFragments = totalFragments;

  return cs as ChapterStatus;
}

function parseFragment(element: Element): Fragment | null {
  let text = element.querySelector('.o .text');
  if (text == null) return null;
  let anchor = element.querySelector<HTMLAnchorElement>('.o a.ord');
  if (anchor == null || anchor.hash.length <= 1) return null;

  let f: Partial<Fragment> = {};
  f.id = anchor.hash.slice(1);

  let original = parseOriginal(text.textContent!);
  if (original == null) return null;
  f.original = original;

  let escapeSequences = original.text.match(/\\[civs](\[[^\]]+\])?/g);
  let translations: Translation[] = [];
  f.translations = translations;
  element.querySelectorAll('.t > div').forEach(translationElement => {
    let t = parseTranslation(translationElement, escapeSequences);
    if (t != null) translations.push(t);
  });
  f.translations.sort((a, b) => b.score - a.score);

  return f as Fragment;
}

function parseOriginal(raw: string): Original | null {
  if (raw.startsWith('----')) return null;

  let o: Partial<Original> = {};
  o.rawContent = raw;

  let [header, ...lines] = raw.split('\n').map(s => s.trim());
  let match = /^(\S+)\s+(\S+)(?:\s+#(\d+))?$/.exec(header);
  if (match == null || match.length !== 4) return null;
  let [file, jsonPath, langUid] = match.slice(1);

  o.file = file;
  o.jsonPath = jsonPath;
  o.langUid = langUid != null ? parseInt(langUid, 10) : null;

  let descrLinesLen = lines.indexOf('');
  o.descriptionLines = lines.slice(0, descrLinesLen);
  let textStartIdx = descrLinesLen;
  for (
    ;
    textStartIdx < lines.length && lines[textStartIdx] === '';
    textStartIdx++
  ) {}
  o.text = lines.slice(textStartIdx).join('\n');

  return o as Original;
}

function parseTranslation(
  element: Element,
  originalEscapeSequences: string[] | null,
): Translation | null {
  let t: Partial<Translation> = {};
  t.rawText = element.querySelector('.text')!.textContent!;
  t.authorUsername = element.querySelector('.user')!.textContent!;
  t.votes = parseInt(
    element.querySelector('.rating .current')!.textContent!,
    10,
  );
  t.score = 0;

  let match = /(\d+).(\d+).(\d+) в (\d+):(\d+)/.exec(
    element.querySelector('.info .icon-flag')!.nextSibling!.textContent!,
  );
  if (match == null || match.length !== 6) return null;
  let [day, month, year, hour, minute] = match
    .slice(1)
    .map(s => parseInt(s, 10));
  t.timestamp = new Date(
    Date.UTC(2000 + year, month - 1, day, hour - 3, minute),
  );

  let flags: Record<string, any> = {};
  t.text = t.rawText
    .replace(/\n?⟪(.*)⟫\s*/, (_match: string, group: string) => {
      group.split('|').forEach(s => {
        s = s.trim();
        let i = s.indexOf(':');
        if (i >= 0) {
          flags[s.slice(0, i)] = s.slice(i + 1);
        } else {
          flags[s] = true;
        }
      });
      return '';
    })
    .replace(/^\^|^\$|\$$/g, '');
  t.flags = flags;

  // if (
  //   t.rawText.replace(/\n?⟪.*⟫/, '') !=
  //   t.rawText.replace(/\n?⟪.*⟫/, '').trim()
  // ) {
  //   console.warn('invalid translation: has whitespace on ends', fragment);
  //   t.err += ' err_not_trimmed ';
  //   etc.err_not_trimmed = true;
  // }

  // ru.err = '';
  // if (
  //   ru.ru.startsWith(etc.en.split(' ')[0]) &&
  //   !ru.ru.startsWith('---')
  // ) {
  //   if (ru.ru.match(/\n\n/)) ru.ru = ru.ru.split('\n\n')[1];
  //   else if (ru.ru.match(/^[\x00-\xff\s]*\n([^]+?)\s*$/))
  //     ru.ru = ru.ru.match(/^[\x00-\xff\s]*\n([^]+?)\s*$/)[1];
  //   console.warn('invalid translation: has path', etc);
  //   ru.err += ' err_has_path ';
  //   etc.err_has_path = true;
  // }
  if (t.text.includes('№')) {
    // if (enm.length != rum.length) {
    //   console.warn('invalid translation: № dismatch', etc);
    //   ru.err += ' err_dismatch ';
    //   etc.err_dismatch = true;
    // }
    // if (NotaArea.getEscapeSequence(ru.ru).length) {
    //   console.warn(
    //     'invalid translation: mixed №/\\c escape sequences',
    //     etc,
    //   );
    //   ru.err += ' err_mixed_escape ';
    //   etc.err_mixed_escape = true;
    // }
    if (originalEscapeSequences != null) {
      let i = 0;
      t.text = t.text.replace(/№/g, s => {
        s = originalEscapeSequences![i];
        i++;
        return s;
      });
    }
  }
  // if (NotaArea.getEscapeSequence(ru.raw_ru).length) {
  //   if (
  //     NotaArea.getEscapeSequence(ru.raw_ru) + '' ==
  //     NotaArea.getEscapeSequence(etc.en) + ''
  //   ) {
  //     console.warn('invalid translation: same escape sequence', etc);
  //     ru.err += ' err_same_escape ';
  //     etc.err_same_escape = true;
  //   }
  // }
  // if (!NotaArea.checkValidEscape(ru.ru)) {
  //   console.warn('invalid translation: invalid escape sequence', etc);
  //   ru.err += ' err_invalid_escape ';
  //   etc.err_invalid_escape = true;
  // }
  // if (!NotaArea.checkValidCharset(ru.ru)) {
  //   console.warn('invalid translation: non-existing character', etc);
  //   ru.err += ' err_invalid_charset ';
  //   etc.err_invalid_charset = true;
  // }

  t.score = calculateTranslationScore(t as Translation);
  return t as Translation;
}

function calculateTranslationScore(t: Translation): number {
  let score = 1e10 + 1e10 * t.votes + t.timestamp.getTime() / 1000 - 19e8;
  if (t.authorUsername === 'p_zombie') score -= 1e9;
  if (t.authorUsername === 'DimavasBot') {
    score -= 3e9;
    if (t.flags.fromGTable && !t.flags.notChecked) score += 1e9;
  }
  return score;
}

// useful links:
// https://github.com/uisky/notabenoid

import { Fetcher } from './utils/async.js';
import paths from './node-builtin-modules/path.js';
import * as miscUtils from './utils/misc.js';
import hasKey = miscUtils.hasKey;
import isObject = miscUtils.isObject;
import isArray = miscUtils.isArray;
import * as iteratorUtils from './utils/iterator.js';

export const BOOK_ID = '74823';
export const NOTABENOID_URL = 'http://notabenoid.org';
export const NOTABENOID_BOOK_URL = `${NOTABENOID_URL}/book/${BOOK_ID}`;
export const NOTABRIDGE_SERVICE_URL = 'https://stronghold.crosscode.ru/~notabridge/crosscode';

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
  id: number;
  name: string;
  fetchTimestamp: number;
  modificationTimestamp: number;
  translatedFragments: number;
  totalFragments: number;
  pages: number;
}

export interface Chapter extends ChapterStatus {
  fragments: Fragment[];
}

export interface Fragment {
  chapterId: number;
  id: number;
  orderNumber: number;
  original: Original;
  translations: Translation[];
}

export interface Original {
  rawContent: string;
  file: string;
  jsonPath: string;
  langUid: number;
  descriptionText: string;
  text: string;
}

export interface Translation {
  id: number;
  rawText: string;
  text: string;
  authorUsername: string;
  votes: number;
  score: number;
  timestamp: number;
  flags: Record<string, boolean | string>;
}

export class NotaClient {
  public useNotabridge = false;

  public constructor(public httpClient: NotaHttpClient) {}

  public async requestPage(path: string): Promise<DocumentFragment> {
    let doc = await this.httpClient.requestDocument('GET', `${NOTABENOID_URL}${path}`);

    if (doc.querySelector('form[method="post"][action="/"] input[name^="login"]') != null) {
      throw new Error('authentication required');
    }

    return doc;
  }

  public async fetchAllChapterStatuses(): Promise<Map<string, ChapterStatus>> {
    if (this.useNotabridge) {
      let response: Record<string, ChapterStatus> = await this.httpClient.requestJSON(
        'GET',
        `${NOTABRIDGE_SERVICE_URL}/chapter-statuses.json`,
      );
      return miscUtils.objectToMap(response);
    }

    let doc = await this.requestPage(`/book/${BOOK_ID}`);
    let result = new Map<string, ChapterStatus>();
    for (let tr of doc.querySelectorAll<HTMLElement>('#Chapters > tbody > tr')) {
      let chapterStatus = parseChapterStatus(tr);
      if (chapterStatus != null) result.set(chapterStatus.name, chapterStatus);
    }
    return result;
  }

  public createChapterFragmentFetcher(chapter: ChapterStatus): Fetcher<Fragment[]> {
    if (this.useNotabridge) {
      return {
        total: 1,
        iterator: iteratorUtils.once(
          this.httpClient.requestJSON(
            'GET',
            `${NOTABRIDGE_SERVICE_URL}/chapter-fragments/${chapter.name}.json`,
          ),
        ),
      };
    }

    return {
      total: chapter.pages,
      // seriously... JS has regular generator functions, yet it doesn't have
      // GENERATOR ARROW FUNCTIONS! I guess I have to use this old pattern
      // again.
      iterator: function* (this: NotaClient): Generator<Promise<Fragment[]>> {
        for (let i = 0; i < chapter.pages; i++) {
          yield this.requestPage(`/book/${BOOK_ID}/${chapter.id}?Orig_page=${i + 1}`).then(
            (doc) => {
              let fragments: Fragment[] = [];
              for (let tr of doc.querySelectorAll('#Tr > tbody > tr')) {
                let f = parseFragment(chapter.id, tr);
                if (f != null) fragments.push(f);
              }
              return fragments;
            },
          );
        }
      }.call(this),
    };
  }

  public async login(username: string, password: string): Promise<void> {
    await this.httpClient.requestDocument('POST', NOTABENOID_URL, {
      'login[login]': username,
      'login[pass]': password,
    });
  }

  public async logout(): Promise<void> {
    await this.httpClient.requestDocument('GET', `${NOTABENOID_URL}/register/logout`);
  }

  public async addFragmentOriginal(
    chapterId: number,
    orderNumber: number,
    text: string,
  ): Promise<number> {
    let response = await this.httpClient.requestJSON<{ id: string }>(
      'POST',
      `${NOTABENOID_BOOK_URL}/${chapterId}/0/edit`,
      {
        'Orig[ord]': String(orderNumber),
        'Orig[body]': String(text),
        ajax: '1',
      },
    );
    return parseInt(response.id, 10);
  }

  public async editFragmentOriginal(
    chapterId: number,
    fragmentId: number,
    orderNumber: number,
    newText: string,
  ): Promise<void> {
    await this.httpClient.requestJSON(
      'POST',
      `${NOTABENOID_BOOK_URL}/${chapterId}/${fragmentId}/edit`,
      {
        'Orig[ord]': String(orderNumber),
        'Orig[body]': String(newText),
        ajax: '1',
      },
    );
  }

  public async deleteFragmentOriginal(chapterId: number, fragmentId: number): Promise<void> {
    await this.httpClient.requestJSON(
      'POST',
      `${NOTABENOID_BOOK_URL}/${chapterId}/${fragmentId}/remove`,
    );
  }

  public async addFragmentTranslation(
    chapterId: number,
    fragmentId: number,
    // NOTE: don't forget to add flags when uploading text to notabenoid!
    text: string,
  ): Promise<void> {
    await this.httpClient.requestJSON(
      'POST',
      `${NOTABENOID_BOOK_URL}/${chapterId}/${fragmentId}/translate`,
      {
        'Translation[body]': String(text),
        ajax: '1',
      },
    );
  }

  public async editFragmentTranslation(
    chapterId: number,
    fragmentId: number,
    translationId: number,
    // NOTE: don't forget to add flags when uploading text to notabenoid!
    newText: string,
  ): Promise<void> {
    await this.httpClient.requestJSON(
      'POST',
      `${NOTABENOID_BOOK_URL}/${chapterId}/${fragmentId}/translate?tr_id=${translationId}`,
      {
        'Translation[body]': String(newText),
        ajax: '1',
      },
    );
  }

  public async deleteFragmentTranslation(
    chapterId: number,
    fragmentId: number,
    translationId: number,
  ): Promise<void> {
    await this.httpClient.requestJSON(
      'POST',
      `${NOTABENOID_BOOK_URL}/${chapterId}/${fragmentId}/tr_rm`,
      {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        tr_id: String(translationId),
        ajax: '1',
      },
    );
  }
}

function parseChapterStatus(element: HTMLElement): ChapterStatus | null {
  let cs: Partial<ChapterStatus> = {};
  // TODO: test the difference between this and the 'Date' HTTP header on slow
  // Internet connections
  cs.fetchTimestamp = Math.floor(Date.now() / 1000);

  let { id } = element.dataset;
  if (id == null) return null;
  cs.id = parseInt(id, 10);
  let anchor = element.querySelector(':scope > td:nth-child(1) > a');
  if (anchor == null) return null;
  let activityElem = element.querySelector<HTMLElement>(':scope > td:nth-child(3) > span');
  if (activityElem == null) return null;
  let doneElem = element.querySelector<HTMLElement>(':scope > td:nth-child(4) > small');
  if (doneElem == null) return null;

  cs.name = anchor.textContent!;

  let match = /(\d+) ([а-я.]+) (\d+) г., (\d+):(\d+)/.exec(activityElem.title);
  if (match == null || match.length !== 6) return null;
  let [day, month, year, hour, minute] = match.slice(1);
  let [dayN, yearN, hourN, minuteN] = [day, year, hour, minute].map((s) => parseInt(s, 10));
  let monthIndex = RU_ABBREVIATED_MONTH_NAMES.indexOf(month);
  if (monthIndex < 0) return null;
  cs.modificationTimestamp = Math.floor(
    Date.UTC(yearN, monthIndex, dayN, hourN - 3, minuteN) / 1000,
  );

  match = /\((\d+) \/ (\d+)\)/.exec(doneElem.textContent!);
  if (match == null || match.length !== 3) return null;
  let [translatedFragments, totalFragments] = match.slice(1).map((s) => parseInt(s, 10));
  cs.translatedFragments = translatedFragments;
  cs.totalFragments = totalFragments;
  cs.pages = Math.ceil(totalFragments / CHAPTER_PAGE_SIZE);

  return cs as ChapterStatus;
}

function parseFragment(chapterId: number, element: Element): Fragment | null {
  if (element.id.length <= 1) return null;
  let text = element.querySelector('.o .text');
  if (text == null) return null;
  let anchor = element.querySelector<HTMLAnchorElement>('.o a.ord');
  if (anchor == null || anchor.textContent!.length <= 1) return null;

  let f: Partial<Fragment> = {};
  f.chapterId = chapterId;
  f.id = parseInt(element.id.slice(1), 10);
  f.orderNumber = parseInt(anchor.textContent!.slice(1), 10);

  let original = parseOriginal(text.textContent!);
  if (original == null) return null;
  f.original = original;

  let translations: Translation[] = [];
  f.translations = translations;
  for (let translationElement of element.querySelectorAll('.t > div')) {
    let t = parseTranslation(translationElement);
    if (t != null) translations.push(t);
  }
  f.translations.sort((a, b) => b.score - a.score);

  return f as Fragment;
}

function parseOriginal(raw: string): Original | null {
  let o: Partial<Original> = {};
  o.rawContent = raw;

  let headersLen = raw.indexOf('\n\n');
  if (headersLen < 0) return null;
  let headers = raw.slice(0, headersLen);
  let locationLineLen = headers.indexOf('\n');
  if (locationLineLen < 0) locationLineLen = headers.length;
  let locationLine = headers.slice(0, locationLineLen);

  let langUidMarkerIndex = locationLine.lastIndexOf(' #');
  if (langUidMarkerIndex >= 0) {
    o.langUid = parseInt(locationLine.slice(langUidMarkerIndex + 2), 10);
    locationLine = locationLine.slice(0, langUidMarkerIndex);
  } else {
    o.langUid = 0;
  }
  let firstSpaceIndex = locationLine.indexOf(' ');
  if (firstSpaceIndex < 0) return null;
  o.file = locationLine.slice(0, firstSpaceIndex);
  o.jsonPath = locationLine.slice(firstSpaceIndex + 1);
  o.descriptionText = raw.slice(locationLineLen + 1, headersLen);
  o.text = raw.slice(headersLen + 2);

  let p = parsePathsWithLangFileMigrations(o.file, o.jsonPath);
  o.file = p.file;
  o.jsonPath = p.jsonPath;

  return o as Original;
}

function parsePathsWithLangFileMigrations(
  file: string,
  jsonPath: string,
): { file: string; jsonPath: string } {
  if (file === 'data/LANG') {
    let realJsonPathStart = jsonPath.indexOf('/labels/');
    if (realJsonPathStart > 0) {
      file = `data/lang/${jsonPath.slice(0, realJsonPathStart)}.en_US.json`;
      jsonPath = jsonPath.slice(realJsonPathStart + 1);
    }
  }
  return { file, jsonPath };
}

function parseTranslation(element: Element): Translation | null {
  let t: Partial<Translation> = {};
  t.id = parseInt(element.id.slice(1), 10);
  t.rawText = element.querySelector('.text')!.textContent!;
  t.authorUsername = element.querySelector('.user')!.textContent!;
  t.votes = parseInt(element.querySelector('.rating .current')!.textContent!, 10);
  t.score = 0;

  let match = /(\d+).(\d+).(\d+) в (\d+):(\d+)/.exec(
    element.querySelector('.info .icon-flag')!.nextSibling!.textContent!,
  );
  if (match == null || match.length !== 6) return null;
  let [day, month, year, hour, minute] = match.slice(1).map((s) => parseInt(s, 10));
  t.timestamp = Math.floor(Date.UTC(2000 + year, month - 1, day, hour - 3, minute) / 1000);

  let flags: Record<string, boolean | string> = {};
  t.text = t.rawText.replace(/\n?⟪(.*)⟫\s*/, (_match: string, group: string) => {
    for (let s of group.split('|')) {
      s = s.trim();
      let i = s.indexOf(':');
      if (i >= 0) {
        flags[s.slice(0, i)] = s.slice(i + 1);
      } else {
        flags[s] = true;
      }
    }
    return '';
  });
  t.flags = flags;

  t.score = calculateTranslationScore(t as Translation);
  return t as Translation;
}

function calculateTranslationScore(t: Translation): number {
  let score = 1e10 + 1e10 * t.votes + t.timestamp - 19e8;
  if (t.authorUsername === 'p_zombie') score -= 1e9;
  if (t.authorUsername === 'DimavasBot') {
    score -= 3e9;
    if (t.flags.fromGTable && !t.flags.notChecked) score += 1e9;
  }
  if (t.text.startsWith('tr_ru:ERR')) score -= 1e12;
  return score;
}

export interface NotaHttpClient {
  requestJSON<T>(
    method: 'GET' | 'POST',
    url: string,
    body?: Record<string, string> | null,
  ): Promise<T>;
  requestDocument(
    method: 'GET' | 'POST',
    url: string,
    body?: Record<string, string> | null,
  ): Promise<DocumentFragment>;
}

export function stringifyFragmentOriginal(o: Original): string {
  let p = stringifyPathsWithLangFileMigrations(o.file, o.jsonPath);
  let result = `${p.file} ${p.jsonPath}`;
  if (o.langUid !== 0) result += ` #${o.langUid}`;
  result += '\n';
  if (o.descriptionText.length > 0) result += `${o.descriptionText}\n`;
  result += `\n${o.text}`;
  return result;
}

function stringifyPathsWithLangFileMigrations(
  file: string,
  jsonPath: string,
): { file: string; jsonPath: string } {
  const PREFIX = 'data/lang/';
  const SUFFIX = '.en_US.json';
  if (file.startsWith(PREFIX) && file.endsWith(SUFFIX)) {
    jsonPath = `${file.slice(PREFIX.length, -SUFFIX.length)}/${jsonPath}`;
    file = 'data/LANG';
  }
  return { file, jsonPath };
}

export function stringifyFragmentTranslation(t: Translation): string {
  let result = t.text;

  let flagsEntries = Object.entries(t.flags);
  if (flagsEntries.length > 0) {
    let stringifiedFlagPairs: string[] = [];
    for (let [k, v] of flagsEntries) {
      if (k && v) {
        stringifiedFlagPairs.push(typeof v === 'string' ? `${k}:${v}` : k);
      }
    }

    result += `\n⟪${stringifiedFlagPairs.join('|')}⟫`;
  }

  return result;
}

const AREA_CHAPTER_NAMES = new Set([
  'arena',
  'arid',
  'arid-dng',
  'autumn',
  'autumn-fall',
  'beach',
  'bergen',
  'bergen-trail',
  'cargo-ship',
  'cold-dng',
  'dreams',
  'evo-village',
  'final-dng',
  'flashback',
  'forest',
  'heat',
  'heat-dng',
  'heat-village',
  'hideout',
  'jungle',
  'jungle-city',
  'rhombus-dng',
  'rhombus-sqr',
  'rookie-harbor',
  'shock-dng',
  'tree-dng',
  'wave-dng',
]);

export function getChapterNameOfFile(path: string): string {
  let parsedPath = paths.posix.parse(path);
  let dirs = parsedPath.dir.split(paths.sep);

  if (parsedPath.dir.length > 0 && dirs.length > 0) {
    if (dirs[0] === 'extension' && dirs.length > 2) {
      // This path is inside an extension. Normalize it by removing the
      // extension directory prefix and retry getting the chapter name.
      dirs.shift();
      dirs.shift();
    }

    switch (dirs[0]) {
      case 'data':
        if (dirs.length >= 2) {
          switch (dirs[1]) {
            case 'lang':
              return 'LANG';

            case 'arena':
            case 'enemies':
            case 'characters':
              return dirs[1];

            case 'areas':
              if (dirs.length === 2 && AREA_CHAPTER_NAMES.has(parsedPath.name)) {
                return parsedPath.name;
              }
              break;

            case 'maps':
              if (dirs.length >= 3 && AREA_CHAPTER_NAMES.has(dirs[2])) {
                return dirs[2];
              }
              break;
          }
        } else {
          switch (parsedPath.name) {
            case 'item-database':
            case 'database':
              return parsedPath.name;
          }
        }
    }
  }

  return 'etc';
}

// Context which is shared across invocations of getJsonObjectDescription
// during a JSON path iteration in generateFragmentDescriptionText.
interface FragmentDescriptionGeneratorContext {
  fileData: unknown;
  descriptionLines: string[];
  entityType: string | null;
}

// based on https://gitlab.com/Dimava/crosscode-translation-ru/-/blob/master/assets/editor/CrossFile.js#L247-300
export function generateFragmentDescriptionText(jsonPath: string[], fileData: unknown): string {
  let ctx: FragmentDescriptionGeneratorContext = {
    fileData,
    descriptionLines: [],
    entityType: null,
  };
  let obj = fileData;

  for (let key of jsonPath) {
    if (!(isObject(obj) && hasKey(obj, key))) {
      throw new Error(`Invalid JSON path '${jsonPath.join('/')}'`);
    }
    getJsonObjectDescription(obj, key, ctx);
    obj = obj[key];
  }

  return ctx.descriptionLines.join('\n');
}

function getJsonObjectDescription(
  // eslint-disable-next-line @typescript-eslint/ban-types
  obj: {},
  key: string,
  ctx: FragmentDescriptionGeneratorContext,
): void {
  let words: string[] = [];

  if (ctx.entityType === 'XenoDialog' && key === 'text') {
    // inspired by <https://github.com/L-Sherry/Localize-Me-Tools/blob/07f0b1a4abb9cd553a73dcbdeb3c68eec5f7dcb9/tags.py#L27-L52>
    if (
      hasKey(obj, 'entity') &&
      isObject(obj.entity) &&
      hasKey(obj.entity, 'global') &&
      obj.entity.global === true &&
      hasKey(obj.entity, 'name') &&
      typeof obj.entity.name === 'string'
    ) {
      let entityName = obj.entity.name;

      if (
        isObject(ctx.fileData) &&
        hasKey(ctx.fileData, 'entities') &&
        isArray(ctx.fileData.entities)
      ) {
        let entity = ctx.fileData.entities.find(
          (ent) =>
            isObject(ent) &&
            hasKey(ent, 'type') &&
            ent.type === 'NPC' &&
            hasKey(ent, 'settings') &&
            isObject(ent.settings) &&
            hasKey(ent.settings, 'name') &&
            typeof ent.settings.name === 'string' &&
            ent.settings.name === entityName,
        ) as { type: 'NPC'; settings: { name: string } } | undefined;

        if (
          entity != null &&
          hasKey(entity.settings, 'characterName') &&
          typeof entity.settings.characterName === 'string'
        ) {
          words.push(entity.settings.characterName);
        }
      }
    }

    //
  } else if (hasKey(obj, 'type') && typeof obj.type === 'string') {
    // the two common object types to have a string "type" field are event (and
    // action) steps and entities, we are mostly interested in these
    words.push(obj.type);

    if (
      hasKey(obj, 'settings') &&
      isObject(obj.settings) &&
      hasKey(obj, 'x') &&
      typeof obj.x === 'number' &&
      hasKey(obj, 'y') &&
      typeof obj.y === 'number'
    ) {
      // looks like this is an entity
      ctx.entityType = obj.type;

      let { settings } = obj;
      if (
        hasKey(settings, 'name') &&
        typeof settings.name === 'string' &&
        settings.name.length > 0
      ) {
        // not all entities have a name, actually, the most frequent entity
        // types to do so are Prop and ItemDestruct
        words.push(settings.name);
      }

      if (
        hasKey(settings, 'startCondition') &&
        typeof settings.startCondition === 'string' &&
        settings.startCondition.length > 0
      ) {
        words.push('START IF', settings.startCondition);
      }

      if (
        hasKey(settings, 'spawnCondition') &&
        typeof settings.spawnCondition === 'string' &&
        settings.spawnCondition.length > 0
      ) {
        words.push('SPAWN IF', settings.spawnCondition);
      }

      //
    } else {
      // most likely an event step

      switch (obj.type) {
        case 'IF': {
          if (key === 'elseStep') {
            words.push('NOT');
          } else if (key !== 'thenStep') {
            words.push(key);
          }
          if (
            hasKey(obj, 'condition') &&
            typeof obj.condition === 'string' &&
            obj.condition.length > 0
          ) {
            words.push(obj.condition);
          }
          break;
        }

        default: {
          if (hasKey(obj, 'person')) {
            // handle the most common dialogue events, which are: SHOW_MSG,
            // SHOW_SIDE_MSG, ADD_MSG_PERSON and such
            if (typeof obj.person === 'string') {
              // legacy
              words.push(obj.person, '@DEFAULT');
            } else if (
              isObject(obj.person) &&
              hasKey(obj.person, 'person') &&
              typeof obj.person.person === 'string' &&
              hasKey(obj.person, 'expression') &&
              typeof obj.person.expression === 'string'
            ) {
              words.push(obj.person.person, `@${obj.person.expression}`);
            }
          }
        }
      }

      //
    }

    //
  } else if (
    hasKey(obj, 'condition') &&
    typeof obj.condition === 'string' &&
    obj.condition.length > 0
  ) {
    // there is a broad category of objects with just the `condition` field, so
    // let's include their conditions as well to not lose something important
    words.push('IF', obj.condition);
  }

  if (words.length === 0) return;
  let line = words.join(' ').trim();
  if (line.length === 0) return;
  ctx.descriptionLines.push(line);
}

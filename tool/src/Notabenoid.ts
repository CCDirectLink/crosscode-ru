// useful links:
// https://github.com/uisky/notabenoid

import { fetchDocument } from './utils/http.js';
import { Fetcher } from './utils/async.js';
import paths from './node-builtin-modules/path.js';
import { hasKey, isArray, isObject } from './utils/misc.js';

const BOOK_ID = '74823';
const NOTABENOID_URL = 'http://notabenoid.org';
const NOTABENOID_BOOK_URL = `${NOTABENOID_URL}/book/${BOOK_ID}`;

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

export type ChapterStatusesObj = Record<string, ChapterStatus>;
export type ChapterStatuses = Map<string, ChapterStatus>;

export interface ChapterStatus {
  id: string;
  name: string;
  fetchTimestamp: number;
  modificationTimestamp: number;
  translatedFragments: number;
  totalFragments: number;
}

export interface Chapter extends ChapterStatus {
  fragments: Fragment[];
}

export interface Fragment {
  chapterId: string;
  id: string;
  orderNumber: number;
  original: Original;
  translations: Translation[];
}

export interface Original {
  rawContent: string;
  file: string;
  jsonPath: string;
  langUid: number | null;
  descriptionText: string;
  text: string;
}

export interface Translation {
  id: string;
  rawText: string;
  text: string;
  authorUsername: string;
  votes: number;
  score: number;
  timestamp: number;
  flags: Record<string, boolean | string>;
}

export class NotaClient {
  private async makeRequest(path: string): Promise<Document> {
    let url = new URL(path, NOTABENOID_URL);
    let doc = await fetchDocument(url);

    if (doc.querySelector('form[method="post"][action="/"] input[name^="login"]') != null) {
      throw new Error('authentication required');
    }

    return doc;
  }

  public async fetchAllChapterStatuses(): Promise<ChapterStatuses> {
    let doc = await this.makeRequest(`/book/${BOOK_ID}`);
    let result = new Map<string, ChapterStatus>();
    for (let tr of doc.querySelectorAll<HTMLElement>('#Chapters > tbody > tr')) {
      let chapterStatus = parseChapterStatus(tr);
      if (chapterStatus != null) result.set(chapterStatus.name, chapterStatus);
    }
    return result;
  }

  public createChapterFragmentFetcher({
    totalFragments,
    id,
    name,
  }: ChapterStatus): Fetcher<Fragment[]> {
    let pages = Math.ceil(totalFragments / CHAPTER_PAGE_SIZE);
    return {
      total: pages,
      // seriously... JS has regular generator functions, yet it doesn't have
      // GENERATOR ARROW FUNCTIONS! I guess I have to use this old pattern again.
      iterator: function* (this: NotaClient): Generator<Promise<Fragment[]>> {
        for (let i = 0; i < pages; i++) {
          console.log(`${name}, page ${i + 1}/${pages}`);
          yield this.makeRequest(`/book/${BOOK_ID}/${id}?Orig_page=${i + 1}`).then((doc) => {
            let fragments: Fragment[] = [];
            for (let tr of doc.querySelectorAll('#Tr > tbody > tr')) {
              let f = parseFragment(id, tr);
              if (f != null) fragments.push(f);
            }
            return fragments;
          });
        }
      }.call(this),
    };
  }

  public async login(username: string, password: string): Promise<void> {
    let body = new FormData();
    body.append('login[login]', username);
    body.append('login[pass]', password);
    await fetch(NOTABENOID_URL, {
      method: 'POST',
      body,
      credentials: 'include',
    });
  }

  public async addFragmentOriginal(
    chapterId: string,
    orderNumber: number,
    text: string,
  ): Promise<string> {
    let body = new FormData();
    body.append('Orig[ord]', String(orderNumber));
    body.append('Orig[body]', text);
    body.append('ajax', '1');
    let response = await fetch(`${NOTABENOID_BOOK_URL}/${chapterId}/0/edit`, {
      method: 'POST',
      body,
      credentials: 'include',
    });
    let responseJson = (await response.json()) as { id: unknown };
    return String(responseJson.id);
  }

  public async editFragmentOriginal(
    chapterId: string,
    fragmentId: string,
    orderNumber: number,
    newText: string,
  ): Promise<void> {
    let body = new FormData();
    body.append('Orig[ord]', String(orderNumber));
    body.append('Orig[body]', newText);
    body.append('ajax', '1');
    await fetch(`${NOTABENOID_BOOK_URL}/${chapterId}/${fragmentId}/edit`, {
      method: 'POST',
      body,
      credentials: 'include',
    });
  }

  public async deleteFragmentOriginal(chapterId: string, fragmentId: string): Promise<void> {
    await fetch(`${NOTABENOID_BOOK_URL}/${chapterId}/${fragmentId}/remove`, {
      method: 'POST',
      credentials: 'include',
    });
  }

  public async addFragmentTranslation(
    chapterId: string,
    fragmentId: string,
    // NOTE: don't forget to add flags when uploading text to notabenoid!
    text: string,
  ): Promise<void> {
    let body = new FormData();
    body.append('Translation[body]', text);
    body.append('ajax', '1');
    await fetch(`${NOTABENOID_BOOK_URL}/${chapterId}/${fragmentId}/translate`, {
      method: 'POST',
      body,
      credentials: 'include',
    });
  }

  public async editFragmentTranslation(
    chapterId: string,
    fragmentId: string,
    translationId: string,
    // NOTE: don't forget to add flags when uploading text to notabenoid!
    newText: string,
  ): Promise<void> {
    let body = new FormData();
    body.append('Translation[body]', newText);
    body.append('ajax', '1');
    await fetch(
      `${NOTABENOID_BOOK_URL}/${chapterId}/${fragmentId}/translate?tr_id=${translationId}`,
      {
        method: 'POST',
        body,
        credentials: 'include',
      },
    );
  }

  public async deleteFragmentTranslation(
    chapterId: string,
    fragmentId: string,
    translationId: string,
  ): Promise<void> {
    let body = new FormData();
    body.append('tr_id', translationId);
    body.append('ajax', '1');
    await fetch(`${NOTABENOID_BOOK_URL}/${chapterId}/${fragmentId}/tr_rm`, {
      method: 'POST',
      body,
      credentials: 'include',
    });
  }
}

function parseChapterStatus(element: HTMLElement): ChapterStatus | null {
  let cs: Partial<ChapterStatus> = {};
  // TODO: test the difference between this and the 'Date' HTTP header on slow
  // Internet connections
  cs.fetchTimestamp = Date.now();

  let { id } = element.dataset;
  if (id == null) return null;
  cs.id = id;
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
  cs.modificationTimestamp = new Date(
    Date.UTC(yearN, monthIndex, dayN, hourN - 3, minuteN),
  ).getTime();

  match = /\((\d+) \/ (\d+)\)/.exec(doneElem.textContent!);
  if (match == null || match.length !== 3) return null;
  let [translatedFragments, totalFragments] = match.slice(1).map((s) => parseInt(s, 10));
  cs.translatedFragments = translatedFragments;
  cs.totalFragments = totalFragments;

  return cs as ChapterStatus;
}

function parseFragment(chapterId: string, element: Element): Fragment | null {
  if (element.id.length <= 1) return null;
  let text = element.querySelector('.o .text');
  if (text == null) return null;
  let anchor = element.querySelector<HTMLAnchorElement>('.o a.ord');
  if (anchor == null || anchor.textContent!.length <= 1) return null;

  let f: Partial<Fragment> = {};
  f.chapterId = chapterId;
  f.id = element.id.slice(1);
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
  }
  let firstSpaceIndex = locationLine.indexOf(' ');
  if (firstSpaceIndex < 0) return null;
  o.file = locationLine.slice(0, firstSpaceIndex);
  o.jsonPath = locationLine.slice(firstSpaceIndex + 1);
  o.descriptionText = raw.slice(locationLineLen + 1, headersLen);
  o.text = raw.slice(headersLen + 2);

  return o as Original;
}

function parseTranslation(element: Element): Translation | null {
  let t: Partial<Translation> = {};
  t.id = element.id.slice(1);
  t.rawText = element.querySelector('.text')!.textContent!;
  t.authorUsername = element.querySelector('.user')!.textContent!;
  t.votes = parseInt(element.querySelector('.rating .current')!.textContent!, 10);
  t.score = 0;

  let match = /(\d+).(\d+).(\d+) в (\d+):(\d+)/.exec(
    element.querySelector('.info .icon-flag')!.nextSibling!.textContent!,
  );
  if (match == null || match.length !== 6) return null;
  let [day, month, year, hour, minute] = match.slice(1).map((s) => parseInt(s, 10));
  t.timestamp = Date.UTC(2000 + year, month - 1, day, hour - 3, minute);

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
  let score = 1e10 + 1e10 * t.votes + t.timestamp / 1000 - 19e8;
  if (t.authorUsername === 'p_zombie') score -= 1e9;
  if (t.authorUsername === 'DimavasBot') {
    score -= 3e9;
    if (t.flags.fromGTable && !t.flags.notChecked) score += 1e9;
  }
  if (t.text.startsWith('tr_ru:ERR')) score -= 1e12;
  return score;
}

export function stringifyFragmentOriginal(o: Original): string {
  let result = `${o.file} ${o.jsonPath}`;
  if (o.langUid != null) result += ` #${o.langUid}`;
  result += '\n';
  if (o.descriptionText.length > 0) result += `${o.descriptionText}\n`;
  result += `\n${o.text}`;
  return result;
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
  'arid-dng',
  'arid',
  'autumn-fall',
  'autumn',
  'bergen-trail',
  'bergen',
  'cargo-ship',
  'cold-dng',
  'dreams',
  'flashback',
  'forest',
  'heat-dng',
  'heat-village',
  'heat',
  'hideout',
  'jungle-city',
  'jungle',
  'rhombus-dng',
  'rhombus-sqr',
  'rookie-harbor',
  'shock-dng',
  'tree-dng',
  'wave-dng',
]);

export function getChapterNameOfFile(path: string): string {
  let parsedPath = paths.parse(path);
  let dirs = parsedPath.dir.split(paths.sep);

  if (parsedPath.dir !== '' && dirs.length > 0) {
    switch (dirs[0]) {
      case 'extension':
        return dirs[0];

      case 'data':
        if (dirs.length >= 2) {
          switch (dirs[1]) {
            case 'lang':
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

    if (
      hasKey(obj, 'settings') &&
      isObject(obj.settings) &&
      hasKey(obj, 'x') &&
      typeof obj.x === 'number' &&
      hasKey(obj, 'y') &&
      typeof obj.y === 'number'
    ) {
      // looks like this is an entity
      words.push(obj.type);
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
          words.push(obj.type);
          if (key === 'elseStep') {
            words.push('NOT');
          } else if (key !== 'thenStep') {
            words.push(key);
          }
          if (hasKey(obj, 'condition') && typeof obj.condition === 'string') {
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
              words.push(`${obj.person} @DEFAULT`);
            } else if (
              isObject(obj.person) &&
              hasKey(obj.person, 'person') &&
              typeof obj.person.person === 'string' &&
              hasKey(obj.person, 'expression') &&
              typeof obj.person.expression === 'string'
            ) {
              words.push(`${obj.person.person} @${obj.person.expression}`);
            }
          } else {
            words.push(obj.type);
          }
        }
      }

      //
    }

    //
  } else if (hasKey(obj, 'condition') && typeof obj.condition === 'string') {
    // there is a broad category of objects with just the `condition` field, so
    // let's include their conditions as well to not lose something important
    words.push('IF', obj.condition);
  }

  if (words.length === 0) return;
  let line = words.join(' ').trim();
  if (line.length === 0) return;
  ctx.descriptionLines.push(line);
}

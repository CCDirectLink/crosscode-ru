import { fetchDocument } from './utils.js';
import { Translation, Fragment, calculateTranslationScore } from './types.js';

export async function fetchAreaUrls({
  anonymous,
}: {
  anonymous: boolean;
}): Promise<Record<string, string>> {
  let doc = await fetchDocument(
    anonymous
      ? 'https://opennota2.duckdns.org/book/74823'
      : 'http://notabenoid.org/book/74823',
  );

  let result: Record<string, string> = {};
  doc.querySelectorAll('#Chapters > tbody > tr').forEach(tr => {
    let a = tr.querySelector('a');
    if (a == null) return;
    result[a.textContent!] = a.href;
  });
  return result;
}

export async function fetchAreaFragments(url: string): Promise<Fragment[]> {
  url = `${url}?Orig_page=1`;

  let fragments: Fragment[] = [];

  while (true) {
    let doc = await fetchDocument(url);

    doc.querySelectorAll('#Tr > tbody > tr').forEach(tr => {
      let f = parseFragment(tr);
      if (f != null) fragments.push(f);
    });

    let nextA = doc.querySelector<HTMLAnchorElement>(
      'a[title="На следующую страницу"]',
    );
    if (nextA != null && nextA.href.length > 0) {
      url = nextA.href;
    } else {
      break;
    }
  }

  return fragments;
}

function parseFragment(element: Element): Fragment | null {
  let text = element.querySelector('.o .text');
  if (text == null) return null;
  let anchor = element.querySelector<HTMLAnchorElement>('.o a.ord');
  if (anchor == null || anchor.hash.length <= 1) return null;

  let f: Fragment = {
    originalText: text.textContent!,
    translations: [],
    url: anchor.href,
    id: anchor.hash.slice(1),
  };
  let escapeSequences = f.originalText.match(/\\[civs](\[[^\]]+\])?/g);

  element.querySelectorAll('.t > div').forEach(translationElement => {
    let t = parseTranslation(translationElement, escapeSequences);
    if (t != null) f.translations.push(t);
  });
  f.translations.sort((a, b) => b.score - a.score);

  return f;
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

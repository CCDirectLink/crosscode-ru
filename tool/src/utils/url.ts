// Hex characters are uppercase to match Python's behavior
const HEX_ENCODING_CHARS = Buffer.from('0123456789ABCDEF', 'ascii');

// Port of <https://github.com/translate/translate/blob/88d13bea244b1894a4bedf67ba5b8b65cc29d3b0/translate/storage/pocommon.py#L41-L43>
// Implements the algorithm Weblate uses for encoding reference or location
// comments in gettext `.po` files.
export function encodeURIWeblate(text: string): string {
  let textBytes = Buffer.from(text, 'utf8');
  let anyByteWasEncoded = false;
  let literalTextStart = 0;
  let encodedTextBuffers: Buffer[] = [];

  for (let i = 0, len = textBytes.length; i < len; i++) {
    let b = textBytes[i];
    if (b === 0x20) {
      // encode whitespace as plus signs
      // Note that it is possible to modify the text bytes buffer in-place like
      // this because it isn't a view into the input string (not necessarily
      // internally, but even then it is copy-on-write) and replacing a single
      // byte with another doesn't affect the length of the buffer. Following
      // percent-encoded characters (if any) will slice the text bytes buffer
      // literally with these little modifications, and we don't touch the
      // previous slices.
      textBytes[i] = 0x2b;
      anyByteWasEncoded = true;
    } else if (shouldEncodeByteWeblate(b)) {
      // percent-encode other stuff
      let literalText = textBytes.slice(literalTextStart, i);

      let encoded = Buffer.alloc(3);
      encoded[0] = 0x25; // %
      // fast hex-encoding of a single byte
      encoded[1] = HEX_ENCODING_CHARS[(b >> 4) & 0xf];
      encoded[2] = HEX_ENCODING_CHARS[b & 0xf];

      encodedTextBuffers.push(literalText, encoded);
      literalTextStart = i + 1;
      anyByteWasEncoded = true;
    }
  }

  if (anyByteWasEncoded) {
    let lastLiteralText = textBytes.slice(literalTextStart);
    encodedTextBuffers.push(lastLiteralText);
    return Buffer.concat(encodedTextBuffers).toString('utf8');
  } else {
    return text;
  }
}

function shouldEncodeByteWeblate(c: number): boolean {
  if (0x28 <= c && c <= 0x29) return false; // ( )
  if (0x2c <= c && c <= 0x3a) return false; // , - . / 0-9 :
  if (0x40 <= c && c <= 0x5b) return false; // @ A-Z [
  if (c === 0x5d || c === 0x5f) return false; // ] _
  if (0x61 <= c && c <= 0x7a) return false; // a-z
  if (c === 0x7e) return false; // ~
  return true;
}

export interface Fragment {
  originalText: string;
  translations: Translation[];
  url: string;
  id: string;
}

export interface Translation {
  rawText: string;
  text: string;
  authorUsername: string;
  votes: number;
  score: number;
  timestamp: Date;
  flags: Record<string, any>;
}

export function calculateTranslationScore(t: Translation): number {
  let score = 1e10 + 1e10 * t.votes + t.timestamp.getTime() / 1000 - 19e8;
  if (t.authorUsername === 'p_zombie') score -= 1e9;
  if (t.authorUsername === 'DimavasBot') {
    score -= 3e9;
    if (t.flags.fromGTable && !t.flags.notChecked) score += 1e9;
  }
  return score;
}

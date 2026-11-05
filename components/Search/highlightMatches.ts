export const HIGHLIGHT_MARKER = '@@@';

/** Query terms shorter than this are only highlighted as part of a phrase match. */
const MIN_STANDALONE_TERM_LENGTH = 3;

interface Token {
  /** Normalized (lowercase, without diacritics) word */
  value: string;
  start: number;
  end: number;
}

const wordRegex = /[\p{L}\p{N}]+/gu;

export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function tokenize(text: string): Token[] {
  return Array.from(text.matchAll(wordRegex), (match) => {
    const start = match.index ?? 0;

    return { value: normalize(match[0]), start, end: start + match[0].length };
  });
}

function tokenizeQuery(query: string): string[] {
  return Array.from(normalize(query).matchAll(wordRegex), (match) => match[0]);
}

/**
 * A text word matches a query term when it is the same word, or when it starts
 * with the term (the index uses forward tokenization, so the search also
 * matches prefixes, e.g. while the user is still typing the last word).
 * Very short terms (like "a", "o", "os") must match the whole word, otherwise
 * they would match almost every word in the text, unless `allowShortPrefix` is
 * set (used for the last term of a phrase, which may still be being typed).
 */
function wordMatches(word: string, term: string, allowShortPrefix = false): boolean {
  if (word === term) {
    return true;
  }

  return (allowShortPrefix || term.length >= MIN_STANDALONE_TERM_LENGTH) && word.startsWith(term);
}

interface PhraseMatch {
  /** Index of the first matched text token */
  start: number;
  /** Number of consecutive matched tokens */
  length: number;
  /** Sum of the matched query terms lengths, used to break ties */
  weight: number;
}

/**
 * Finds the longest sequence of consecutive words in the text that matches a
 * sequence of consecutive terms in the query.
 */
function findBestPhraseMatch(tokens: Token[], terms: string[]): PhraseMatch | null {
  let best: PhraseMatch | null = null;

  for (let textIndex = 0; textIndex < tokens.length; textIndex += 1) {
    for (let termIndex = 0; termIndex < terms.length; termIndex += 1) {
      let length = 0;
      let weight = 0;

      while (
        textIndex + length < tokens.length &&
        termIndex + length < terms.length &&
        wordMatches(
          tokens[textIndex + length].value,
          terms[termIndex + length],
          length > 0 && termIndex + length === terms.length - 1
        )
      ) {
        weight += terms[termIndex + length].length;
        length += 1;
      }

      // Lone short words ("a", "de", "os") aren't meaningful matches
      if (length === 1 && terms[termIndex].length < MIN_STANDALONE_TERM_LENGTH) {
        continue;
      }

      if (
        length > 0 &&
        (!best || length > best.length || (length === best.length && weight > best.weight))
      ) {
        best = { start: textIndex, length, weight };
      }
    }
  }

  return best;
}

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Builds a search result description: a snippet of `text` starting at the best
 * match for `query` (prefixed with `…` when there is text before it), with
 * matches wrapped in `@@@`.
 *
 * The best match is the longest run of consecutive words matching the query
 * (so long phrases are highlighted as a whole, at the right place). Other
 * occurrences of meaningful query terms after it are highlighted too.
 *
 * Returns `null` when nothing in the text matches the query.
 */
export function highlightMatches(text: string, query: string): string | null {
  const terms = tokenizeQuery(query);
  const tokens = tokenize(text);

  if (terms.length === 0 || tokens.length === 0) {
    return null;
  }

  const bestMatch = findBestPhraseMatch(tokens, terms);

  if (!bestMatch) {
    return null;
  }

  const standaloneTerms = terms.filter((term) => term.length >= MIN_STANDALONE_TERM_LENGTH);
  const bestMatchEnd = bestMatch.start + bestMatch.length;

  // Ranges (token indexes, inclusive) to highlight
  const ranges: Array<[number, number]> = [[bestMatch.start, bestMatchEnd - 1]];

  for (let index = bestMatchEnd; index < tokens.length; index += 1) {
    if (standaloneTerms.some((term) => wordMatches(tokens[index].value, term))) {
      const last = ranges[ranges.length - 1];

      // Merge with the previous range when they are adjacent words
      if (last[1] === index - 1) {
        last[1] = index;
      } else {
        ranges.push([index, index]);
      }
    }
  }

  // The snippet starts at the best match, with an ellipsis when there is text before it
  let cursor = tokens[bestMatch.start].start;
  let result = text.slice(0, cursor).trim() ? '…' : '';

  for (const [first, last] of ranges) {
    const start = tokens[first].start;
    const end = tokens[last].end;

    result += text.slice(cursor, start);
    result += `${HIGHLIGHT_MARKER}${collapseWhitespace(text.slice(start, end))}${HIGHLIGHT_MARKER}`;
    cursor = end;
  }

  result += text.slice(cursor);

  return collapseWhitespace(result);
}

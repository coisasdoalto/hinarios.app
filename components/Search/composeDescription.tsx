import { ReactNode } from 'react';

const highlightRegex = /@@@(.+?)@@@/g;

export function composeDescription(rawDescription: string): ReactNode {
  const matches = Array.from(rawDescription.matchAll(highlightRegex));

  if (matches.length === 0) {
    return rawDescription;
  }

  const parts: ReactNode[] = [];
  let lastIndex = 0;

  // Loop through all matches of the regex and replace them with a <strong> tag
  for (const match of matches) {
    const matchStart = match.index || 0;
    const matchEnd = matchStart + match[0].length;
    const matchContent = match[1];
    const nonMatchPart = rawDescription.substring(lastIndex, matchStart);
    if (nonMatchPart) {
      parts.push(nonMatchPart);
    }
    parts.push(
      <strong style={{ textDecoration: 'underline' }} key={matchStart}>
        {matchContent}
      </strong>
    );
    lastIndex = matchEnd;
  }

  // Add the remaining part of the string after the last match
  const remainingPart = rawDescription.substring(lastIndex);

  if (remainingPart) {
    parts.push(remainingPart);
  }

  return parts;
}

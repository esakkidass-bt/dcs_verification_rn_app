export function getValueFromHTMLResponse(
  html: string,
  regex: RegExp,
  escapeValue?: string,
) {
  const pattern = regex;

  // Extract the title value using the pattern
  const match = html.match(pattern);

  // Check if a match is found
  if (match && match.length >= 2) {
    const title = match[1];
    return title;
  } else {
    return escapeValue || 'Cant get value from response';
  }
}

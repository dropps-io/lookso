export function getWordsBetweenCurlies(str: string) {
  const results = [];
  const re = /{([^}]+)}/g;
  let text;
  while ((text = re.exec(str)) != null) {
    results.push(text[1]);
  }
  return results;
}

function stringToAcronym(str: string): string {
  return str
    .split(' ')
    .map((item) => item[0])
    .filter((item) => /[A-Z]/.test(item))
    .join('');
}

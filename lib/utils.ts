export function capitalizeWords(str: string | null | undefined): string {
  if (!str) {
    return '';
  }

  return str
    .toLowerCase()
    .trim()
    .split(' ')
    .map((word) => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

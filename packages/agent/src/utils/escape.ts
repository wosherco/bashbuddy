export function escape(text: string): string {
  return text.replace(/<escape>/g, "").replace(/<\/escape>/g, "");
}

// Русское склонение существительного по числу.
// forms = [одна, две-четыре, пять-и-больше], напр. ["цикл", "цикла", "циклов"].
export function pluralizeRu(count: number, forms: readonly [string, string, string]): string {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return forms[2];
  if (n1 > 1 && n1 < 5) return forms[1];
  if (n1 === 1) return forms[0];
  return forms[2];
}

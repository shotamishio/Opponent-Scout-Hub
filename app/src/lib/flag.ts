// Originally pointed at https://flagcdn.com/... (the prototype's approach),
// but that means every flag paint is an external network request — flaky
// offline and blocked entirely in some sandboxes. Bundled locally instead:
// SVGs sourced from the flag-icons project (MIT, github.com/lipis/flag-icons),
// copied into src/assets/flags/ for the 42 ISO codes this app's ISO map uses
// (including the gb-eng / gb-sct-style subdivision codes for home nations).
// No network dependency, no width param needed — SVGs scale via the CSS box.
import { ISO, type CountryCode } from '@/data/pool';

const flagModules = import.meta.glob('../assets/flags/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const FLAG_URLS: Record<string, string> = {};
for (const path in flagModules) {
  const iso = path.slice(path.lastIndexOf('/') + 1, -'.svg'.length);
  FLAG_URLS[iso] = flagModules[path];
}

export function flag(code: CountryCode | 'JPN', _w = 80): string {
  const iso = ISO[code] || 'jp';
  return FLAG_URLS[iso] || FLAG_URLS.jp;
}

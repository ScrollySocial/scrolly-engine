// Holiday kits: your brand kit with seasonal colors, for one Reel at a time (pick it in the review page's Brand kit
// dropdown). Same fonts, caption style and rules as your kit; only the seven colors change, by the same roles, so every
// component and cover just works. Starter colors: change any of them, or add a holiday (one more entry below).
// Which ones show in the dropdown: reel-settings.json → "holidays" (an empty list hides them all).
export const HOLIDAYS = {
  halloween: { label: 'Halloween', C: { cream: '#F6EBDD', cream2: '#FFF3E0', peach: '#FFB566', ink: '#1A1414', orange: '#E2611B', blush: '#EBDDF2', mist: '#E3E8D5' } },
  thanksgiving: { label: 'Thanksgiving', C: { cream: '#F5EDE0', cream2: '#FBF4E6', peach: '#F2C48D', ink: '#2A1D14', orange: '#B5532A', blush: '#F0D9C7', mist: '#E6E2CC' } },
  christmas: { label: 'Christmas', C: { cream: '#F7F1E8', cream2: '#FFF7EA', peach: '#F6C3BD', ink: '#1C1714', orange: '#C2362F', blush: '#F3D9D6', mist: '#DDE8DD' } },
  valentines: { label: "Valentine's Day", C: { cream: '#FBF0F0', cream2: '#FFF6F4', peach: '#FFC2CF', ink: '#1E1416', orange: '#D6335A', blush: '#F8D9E1', mist: '#EDE3F0' } },
};

// kit id → kit, e.g. 'my-brand-christmas'
export function holidayKits(base, ids = Object.keys(HOLIDAYS)) {
  const out = {};
  for (const id of ids) {
    const h = HOLIDAYS[id];
    if (h) out[`${base.name}-${id}`] = { ...base, name: `${base.name}-${id}`, label: `${base.label || base.name}: ${h.label}`, C: { ...base.C, ...h.C } };
  }
  return out;
}

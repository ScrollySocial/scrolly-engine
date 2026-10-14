/**
 * Deterministic formatter — no LLM — for every finding classified
 * CUSTOMER_ACTION_REQUIRED. Closes the "concrete deliverable... or explicit
 * reason" requirement for the one disposition class that isn't a generated
 * document: the concrete deliverable here is the action-item list itself.
 */
export function renderCustomerActionItems(customerActionEntries) {
  if (customerActionEntries.length === 0) {
    return '# Action Items Needed From You\n\nNone for this engagement — every finding was either implemented automatically, delivered as ready-to-use content, or doesn\'t require anything from you.\n';
  }
  const lines = [
    '# Action Items Needed From You',
    '',
    `${customerActionEntries.length} item(s) from your audit need information, access, or a decision only you can provide. We could not act on these safely without you — nothing was skipped silently.`,
    '',
  ];
  customerActionEntries.forEach((c, i) => {
    lines.push(`## ${i + 1}. ${c.finding}`);
    lines.push('');
    lines.push(`**What we need:** ${c.reason}`);
    lines.push('');
  });
  return lines.join('\n');
}

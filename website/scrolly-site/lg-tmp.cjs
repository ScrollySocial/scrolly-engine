const fs=require('fs');let s=fs.readFileSync('pages/legacy.mjs','utf8');
const lines=["    wrapPage({ file: '124-contact.json', key: 'contact', id: 124, css: CSS_FOOTERPAGE, meta: un }),","    wrapPage({ file: '171-accessibility.json', key: 'accessibility', id: 171, css: CSS_FOOTERPAGE }),","    wrapPage({ file: '64-privacy.json', key: 'privacy', id: 64, css: CSS_FOOTERPAGE }),","    wrapPage({ file: '65-terms.json', key: 'terms', id: 65, css: CSS_FOOTERPAGE }),","    wrapPage({ file: '66-refund.json', key: 'refund', id: 66, css: CSS_FOOTERPAGE, edit: refundEdit }),"];
for(const l of lines){if(!s.includes(l+'\n'))throw new Error('missing '+l);s=s.replace(l+'\n','');}
s=s.replace('  return [\n    salesPage(','  // Privacy, Terms, Refund, Accessibility and Contact moved to pages/legal.mjs (v3, 2026-10-03).\n  return [\n    salesPage(');
fs.writeFileSync('pages/legacy.mjs',s);console.log('ok');

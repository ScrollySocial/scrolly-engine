const fs=require('fs');let s=fs.readFileSync('pages/sales.mjs','utf8');
const a="  html = html.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (m, a, css, c) => a + recolor(css) + c)";
if(!s.includes(a))throw new Error('anchor');
s=s.replace(a,"  // two-series charts (Pinterest trend curve): the teal series becomes the orange accent so black vs orange stays readable\n  html = html.replace(/stroke=\"#0f766e\"/gi, 'stroke=\"#ff4b16\"').replace(/(<i style=\"background:)#0f766e;/gi, '$1#ff4b16;');\n"+a);
const b='.s3s :is(.blob,.blob-1,';if(!s.includes(b))throw new Error('b');
s=s.replace(b,'.s3s .cat-icon{background:#0a0a0a!important;color:#fff!important}\n.s3s .cat-icon svg{stroke:#fff}\n'+b);
s=s.replace(',.big,.cat-stat,.c2-stat,',',.big,.c2-stat,');
fs.writeFileSync('pages/sales.mjs',s);console.log('ok');

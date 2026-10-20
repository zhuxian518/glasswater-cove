import {readFile,stat} from 'node:fs/promises';import assert from 'node:assert/strict';
let bytes=0;for(const file of ['index.html','game.js','style.css']){const p='dist/'+file;bytes+=(await stat(p)).size;const text=await readFile(p,'utf8');assert(!/https?:\/\//.test(text),'Unexpected external resource URL in '+file);assert(!text.includes('eval('),'Unexpected eval');}
bytes+=(await stat('dist/assets/cove-background-v2.jpg')).size+(await stat('dist/assets/favicon.svg')).size;
for(const name of ['badges-ab-v3.webp','badges-cd-v3.webp'])bytes+=(await stat('dist/assets/'+name)).size;
assert(bytes<2*1024*1024);console.log('PASS: offline static files/assets, no external URLs, '+bytes+' bytes');

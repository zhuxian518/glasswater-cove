import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import path from 'node:path';import assert from 'node:assert/strict';import vm from 'node:vm';import {createHash} from 'node:crypto';
import {zipSync,unzipSync} from 'fflate';
const root='dist-minitool',files={};
async function collect(dir=''){for(const item of await readdir(path.join(root,dir),{withFileTypes:true})){const key=path.posix.join(dir,item.name);if(item.isDirectory())await collect(key);else files[key]=await readFile(path.join(root,key));}}
await collect();assert(files['index.html'],'index.html must be at ZIP root');
const allowed=new Set(['.html','.css','.js','.png','.jpg','.jpeg','.gif','.webp','.svg','.woff','.woff2','.json']);
for(const name of Object.keys(files)){assert(allowed.has(path.extname(name)),'Unsupported file '+name);assert(!/(^|\/)(node_modules|\.git|\.DS_Store)(\/|$)|\.map$/.test(name));}
assert.equal(Object.keys(files).filter(n=>n.endsWith('.html')).length,1);
const html=files['index.html'].toString(),js=files['game.js'].toString(),css=files['style.css'].toString();new vm.Script(js);
assert(/<!doctype html>/i.test(html)&&/lang="zh-CN"/.test(html)&&/charset="UTF-8"/i.test(html));assert(/viewport-fit=cover/.test(html));
assert(!/<(?:base|iframe|object)\b|\bon\w+\s*=|javascript:|type=["']module/i.test(html));
for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){assert(/\bsrc=/.test(match[1]));assert(!match[2].trim());}
for(const text of [html,js,css])assert(!/https?:\/\//.test(text),'External URL');
for(const pattern of [/\beval\s*\(/,/\bnew Function\s*\(/,/\bfetch\s*\(/,/XMLHttpRequest|WebAssembly|WebSocket|EventSource|RTCPeerConnection|SharedWorker/,/\bnew Worker\s*\(/,/navigator\.(clipboard|share|canShare|geolocation|serviceWorker|bluetooth|usb|hid|serial|connection|credentials|locks)/,/\.download\s*=/,/window\.(open|prompt)\s*\(/])assert(!pattern.test(js),'Forbidden API: '+pattern);
for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){const ref=match[1];if(ref.startsWith('#'))continue;assert(!ref.startsWith('/'));assert(files[ref.replace(/^\.\//,'')],'Missing HTML resource '+ref);}
for(const match of js.matchAll(/["'](assets\/[^"']+)["']/g))assert(files[match[1]],'Missing dynamic resource '+match[1]);
assert(/grid-gap:/.test(css)&&/no-flex-gap/.test(css)&&/safe-area-inset-bottom/.test(css));
const zip=zipSync(files,{level:9}),name='琉璃海湾-v0.4.1-小红书上传包.zip';assert(zip.length<2*1024*1024);const roundtrip=unzipSync(zip);
for(const [key,data] of Object.entries(files))assert.deepEqual(Buffer.from(roundtrip[key]),data);
await writeFile(name,zip);
const report={checkedAt:new Date().toISOString(),artifact:name,zipBytes:zip.length,uncompressedBytes:Object.values(files).reduce((n,v)=>n+v.length,0),sha256:createHash('sha256').update(zip).digest('hex'),files:Object.entries(files).map(([name,v])=>({name,bytes:v.length})),checks:'PASS: structure, allowed types, packaged references, forbidden APIs, classic script syntax, ZIP roundtrip; esbuild target ES2017 / Chrome61',skill:{packageVersion:'1.7.0',internalVersion:'1.6.0',source:'https://fe-static.xhscdn.com/minitool/20260923133933/minitool-zip-builder-1.7.0.skill',sha256:'8bd0f4fde976ec3e9784bebc9fd8d16270769c129b39098698fc58572716c305',instructionSource:'Owner-provided official 1.7.0 instruction, reused with authorization on 2026-10-12'},pending:['创服平台模拟器验证','Android/iOS扫码验证','Chrome61实际运行与性能验证']};
await mkdir('docs/release',{recursive:true});
await writeFile('docs/release/minitool-v0.4.1-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));

import {build,transform} from 'esbuild';
import {mkdir,copyFile,rm,readFile,writeFile} from 'node:fs/promises';
const minitool=process.argv.includes('--minitool'),out=minitool?'dist-minitool':'dist';
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
await build({entryPoints:['src/main.js'],bundle:true,outfile:out+'/game.js',define:{__MINITOOL__:String(minitool)},format:'iife',target:['es2017','chrome61'],minify:true,legalComments:'none'});
await copyFile('index.html',out+'/index.html');const css=await transform(await readFile('src/css/main.css','utf8'),{loader:'css',target:['chrome61'],minify:true});await writeFile(out+'/style.css',css.code);
await mkdir(out+'/assets',{recursive:true});await copyFile('public/assets/cove-background-v2.jpg',out+'/assets/cove-background-v2.jpg');await copyFile('public/assets/favicon.svg',out+'/assets/favicon.svg');
for(const name of ['badges-ab-v3.webp','badges-cd-v3.webp'])await copyFile('public/assets/'+name,out+'/assets/'+name);
console.log('Built offline game: '+out+'/');

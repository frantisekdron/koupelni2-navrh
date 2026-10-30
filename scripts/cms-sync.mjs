import fs from 'node:fs/promises';
import path from 'node:path';
import {present,presentationRevision} from './presentation.mjs';
import {optimizeRuntime} from './performance.mjs';
const origin='https://koupelni-sprava.frantisekdron.chatgpt.site';
const token=process.env.KOUPELNI_CMS_TOKEN;
if(!token)throw new Error('Missing CMS service credential');
const headers={'OAI-Sites-Authorization':'Bearer '+token};
const response=await fetch(origin+'/api/published-export',{headers});
if(!response.ok)throw new Error('CMS export HTTP '+response.status);
const data=await response.json();
if(!/^[a-f0-9]{64}$/.test(data.fingerprint)||!Array.isArray(data.pages)||data.pages.length<69||data.pages.length>150)throw new Error('Invalid CMS export');
const root=path.resolve('predani/web');
const versionFile=path.join(root,'_cms/version.json');
const previous=JSON.parse(await fs.readFile(versionFile,'utf8').catch(()=>'{}'));
if(previous.fingerprint===data.fingerprint&&previous.presentationRevision===presentationRevision){if(process.env.GITHUB_OUTPUT)await fs.appendFile(process.env.GITHUB_OUTPUT,'changed=false\n');console.log('Published content unchanged');process.exit(0);}
// The CMS export rewrites hotlinked koupelni.hireal.cz assets onto the GitHub Pages root, where they do not exist.
const fixUrls=h=>h.replaceAll('https://frantisekdron.github.io/wp-content/','https://koupelni.hireal.cz/wp-content/').replaceAll('https://frantisekdron.github.io//maps.googleapis.com','https://maps.googleapis.com').replaceAll('https://frantisekdron.github.io/site.webmanifest','/koupelni2-navrh/predani/web/site.webmanifest');
const uploaded=new Set();
for(const p of data.pages){if(typeof p.path!=='string'||p.path.includes('..')||p.path.startsWith('/')||!p.path.endsWith('index.html')||typeof p.html!=='string'||p.html.includes('@@CMS_'))throw new Error('Unsafe page export');for(const match of p.html.matchAll(/_cms\/files\/([a-f0-9-]+\.(?:jpg|png|webp|pdf|mp4))/g))uploaded.add(match[1]);}
await fs.mkdir(path.join(root,'_cms/files'),{recursive:true});
for(const id of uploaded){const target=path.join(root,'_cms/files',id);try{await fs.access(target);continue;}catch{}const r=await fetch(origin+'/files/'+id,{headers});if(!r.ok)throw new Error('Media download failed '+r.status);const bytes=new Uint8Array(await r.arrayBuffer());if(bytes.length>25*1024*1024)throw new Error('Unexpected media size');await fs.writeFile(target,bytes);}
for(const p of data.pages){const target=path.join(root,p.path);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,present(fixUrls(p.html),p.path,data.pages));}
await fs.writeFile(path.join(root,'_cms/site-runtime.js'),optimizeRuntime(data.runtime));
await fs.writeFile(versionFile,JSON.stringify({fingerprint:data.fingerprint,presentationRevision,publishedAt:new Date().toISOString()},null,2)+'\n');
if(process.env.GITHUB_OUTPUT)await fs.appendFile(process.env.GITHUB_OUTPUT,'changed=true\n');console.log('Updated '+data.pages.length+' pages and '+uploaded.size+' uploaded files');

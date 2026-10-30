/* Small Markdown renderer. All text is escaped; raw HTML, images and unsafe URLs are never interpreted. */
(function(root,factory){const render=factory();if(typeof module==='object'&&module.exports)module.exports=render;else root.StudioMarkdown=render;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
'use strict';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function inline(text){const tokens=[];const stash=html=>'\u0000'+(tokens.push(html)-1)+'\u0000';let s=String(text).replace(/\u0000/g,'');
 s=s.replace(/`([^`\n]+)`/g,(_,v)=>stash('<code>'+esc(v)+'</code>'));
 s=s.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g,(_,label,url)=>{try{const u=new URL(url);if(!['https:','http:'].includes(u.protocol)||u.username||u.password)return label;return stash('<a href="'+esc(u.href)+'" target="_blank" rel="noopener noreferrer">'+esc(label)+'</a>');}catch{return label;}});
 s=esc(s).replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>').replace(/__([^_\n]+)__/g,'<strong>$1</strong>').replace(/(^|\s)\*([^*\n]+)\*(?=\s|[.,!?;:]|$)/g,'$1<em>$2</em>');
 return s.replace(/\u0000(\d+)\u0000/g,(_,i)=>tokens[+i]||'');}
function render(input){const lines=String(input).replace(/\r\n?/g,'\n').split('\n');let html='',i=0;const special=l=>/^\s*(?:```|#{1,6}\s|[-*+]\s+|\d+[.)]\s+|>\s?|(?:---+|\*\*\*+)\s*$)/.test(l);const cells=l=>l.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim());
 while(i<lines.length){let l=lines[i];if(!l.trim()){i++;continue;}
 if(/^\s*```/.test(l)){const lang=l.trim().slice(3).replace(/[^a-zA-Z0-9_+-]/g,'').slice(0,20);const code=[];i++;while(i<lines.length&&!/^\s*```/.test(lines[i]))code.push(lines[i++]);if(i<lines.length)i++;html+='<pre><code'+(lang?' class="language-'+lang+'"':'')+'>'+esc(code.join('\n'))+'</code></pre>';continue;}
 let m=l.match(/^\s*(#{1,6})\s+(.+)$/);if(m){const n=Math.min(6,m[1].length+1);html+='<h'+n+'>'+inline(m[2].replace(/\s+#+$/,''))+'</h'+n+'>';i++;continue;}
 if(l.includes('|')&&i+1<lines.length&&/^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[i+1])){const head=cells(l);i+=2;html+='<div class="markdown-table"><table><thead><tr>'+head.map(c=>'<th>'+inline(c)+'</th>').join('')+'</tr></thead><tbody>';while(i<lines.length&&lines[i].includes('|')&&lines[i].trim()){const row=cells(lines[i++]);html+='<tr>'+head.map((_,n)=>'<td>'+inline(row[n]||'')+'</td>').join('')+'</tr>';}html+='</tbody></table></div>';continue;}
 if(/^\s*(?:---+|\*\*\*+)\s*$/.test(l)){html+='<hr>';i++;continue;}
 if(/^\s*>/.test(l)){const q=[];while(i<lines.length&&/^\s*>/.test(lines[i]))q.push(lines[i++].replace(/^\s*>\s?/,''));html+='<blockquote>'+q.map(inline).join('<br>')+'</blockquote>';continue;}
 m=l.match(/^\s*([-*+]|\d+[.)])\s+(.+)$/);if(m){const ordered=/\d/.test(m[1]),tag=ordered?'ol':'ul';html+='<'+tag+(ordered?' start="'+parseInt(m[1],10)+'"':'')+'>';while(i<lines.length){const item=lines[i].match(/^\s*([-*+]|\d+[.)])\s+(.+)$/);if(!item||/\d/.test(item[1])!==ordered)break;let content=inline(item[2]);i++;while(i<lines.length&&/^ {2,}\S/.test(lines[i])&&!special(lines[i]))content+='<br>'+inline(lines[i++].trim());html+='<li>'+content+'</li>';}html+='</'+tag+'>';continue;}
 const p=[inline(l)];i++;while(i<lines.length&&lines[i].trim()&&!special(lines[i])&&!(lines[i].includes('|')&&i+1<lines.length&&/^\s*\|?\s*:?-{3,}/.test(lines[i+1])))p.push(inline(lines[i++]));html+='<p>'+p.join('<br>')+'</p>';
 }return html;}
return render;
});

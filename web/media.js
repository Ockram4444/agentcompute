/* Local conversion. Only canonical WAV leaves this browser. Codec support varies. */
async function canonicalAudio(file) {
 if(file.size>50*1024*1024)throw Error('Input must be at most 50 MiB.');
 const ctx=new AudioContext();let audio;
 try{audio=await ctx.decodeAudioData(await file.arrayBuffer());}
 catch{throw Error('This browser cannot decode this file. Convert locally to mono PCM16 WAV at 16 kHz with FFmpeg, then upload the WAV.');}
 finally{await ctx.close();}
 if(audio.duration<1||audio.duration>300)throw Error('Audio must be 1 to 300 seconds.');
 const frames=Math.round(audio.duration*16000), offline=new OfflineAudioContext(1,frames,16000);
 const source=offline.createBufferSource();source.buffer=audio;source.connect(offline.destination);source.start();
 const rendered=await offline.startRendering(), samples=rendered.getChannelData(0), buffer=new ArrayBuffer(44+frames*2),v=new DataView(buffer);
 const tag=(offset,s)=>{for(let i=0;i<s.length;i++)v.setUint8(offset+i,s.charCodeAt(i));};
 tag(0,'RIFF');v.setUint32(4,36+frames*2,true);tag(8,'WAVE');tag(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,16000,true);v.setUint32(28,32000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);tag(36,'data');v.setUint32(40,frames*2,true);
 for(let i=0;i<frames;i++){const x=Math.max(-1,Math.min(1,samples[i]));v.setInt16(44+i*2,Math.round(x<0?x*32768:x*32767),true);}
 return new Blob([buffer],{type:'audio/wav'});
}
function captionTime(s,vtt){let ms=Math.round(s*1000);const h=Math.floor(ms/3600000);ms%=3600000;const m=Math.floor(ms/60000);ms%=60000;const sec=Math.floor(ms/1000);return [h,m,sec].map(n=>String(n).padStart(2,'0')).join(':')+(vtt?'.':',')+String(ms%1000).padStart(3,'0');}
function captionText(segments,vtt){return (vtt?'WEBVTT\n\n':'')+segments.map((s,i)=>`${i+1}\n${captionTime(s.start,vtt)} --> ${captionTime(s.end,vtt)}\n${s.text.replace(/\s+/g,' ').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}\n`).join('\n');}
function downloads(job){const target=document.querySelector('#downloads');target.replaceChildren();if(job.status!=='succeeded'||!job.result)return;
 for(const [ext,value] of [['txt',job.result.transcript],['json',JSON.stringify(job,null,2)],['srt',captionText(job.result.segments,false)],['vtt',captionText(job.result.segments,true)]]){
 const b=document.createElement('button');b.textContent='Download '+ext.toUpperCase();b.onclick=()=>{const u=URL.createObjectURL(new Blob([value],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download=job.id+'.'+ext;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};target.append(b);
 }
}

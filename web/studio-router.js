(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.StudioRouter=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
'use strict';
const labels={chat:'Reply',agent:'Work with tools',image:'Create an image',audio:'Transcribe audio',web:'Research public web'};
const filePattern=/\b[A-Za-z0-9][A-Za-z0-9_-]{0,60}\.(?:txt|md|csv|json)\b/gi;
function route(text,files=[],override='auto',previous=null){
 const t=text.toLowerCase(),audio=files.some(f=>f.kind==='audio'),docs=files.some(f=>f.kind==='text');
 const imageNegated=/\b(?:do not|don't|dont|never|non|no)\s+(?:create|generate|draw|creare|generare|disegnare)\b/i.test(t);
 const imageIntent=!imageNegated&&/(?:\b(?:create|generate|draw|paint|render|design|make|crea|genera|disegna|dessine|cr[ée]e)\b.{0,65}\b(?:image|picture|illustration|photo|logo|poster|visual|immagine|foto|disegno|imagen|imagen|affiche)\b)|(?:^\s*(?:image|immagine|imagen)\s*:)/i.test(t);
 const imageFollowup=previous==='image'&&/\b(another|again|variation|version|instead|make it|change|pi[uù]|un.altra|rifai|versione)\b/i.test(t);
 const explicitWebIntent=/https:\/\/|\b(search (?:the )?(?:web|internet|online)|browse|look up|latest|current news|cerca (?:sul |su |nel )?(?:web|internet|online)|ricerca (?:web|online)|naviga|notizie aggiornate)\b/i.test(t);
 const liveIntent=/\b(weather|forecast|meteo|previsioni|tempo far[aà]|che tempo|m[eé]t[eé]o|pron[oó]stico|notizie|news|breaking|stock price|share price|exchange rate|crypto price|prezzo attuale|quotazione|tasso di cambio|live score|risultato in diretta)\b|(?:today|tomorrow|tonight|this week|right now|currently|oggi|domani|stasera|questa settimana|in questo momento).{0,65}(?:temperature|rain|raining|snow|wind|pioggia|piover|temperatura|price|prezzo|score|result|risultat|open|apert|schedule|orari)|(?:temperature|rain|raining|snow|wind|pioggia|piover|temperatura|price|prezzo|score|result|risultat|open|apert|schedule|orari).{0,65}(?:today|tomorrow|tonight|this week|right now|currently|oggi|domani|stasera|questa settimana)|天气|天气预报/i.test(t);
 const capabilityIntent=/\b(what can you do|what are your capabilities|can you (?:access|search|browse) (?:the )?(?:internet|web)|cosa (?:puoi|sai) fare|quali strumenti|puoi (?:accedere|cercare|navigare).{0,20}(?:internet|web))\b/i.test(t);
 const webFollowup=previous==='web'&&/^(?:and\b|what about\b|how about\b|also\b|same\b|instead\b|e\b|invece\b|anche\b|e per\b)|\b(?:those sources|these sources|that forecast|quelle fonti|questa previsione)\b/i.test(t);
 const webIntent=explicitWebIntent||liveIntent||capabilityIntent||webFollowup;
 const toolIntent=docs||/\b(csv|json|spreadsheet|calculate|calculation|sum|total|subtotal|vat|average|filter|sort|group|calcola|somma|totale|iva|media|filtra|raggruppa|export|esporta|downloadable|file|artifact|artefact)\b/i.test(t)||/\d\s*[+*/%\-]\s*\d/.test(t)||new RegExp(filePattern.source,'i').test(t);
 if(webIntent&&!audio&&!imageIntent&&(override==='auto'||override==='agent'))return {kind:'web'};
 if(override!=='auto'){
  if(!labels[override])throw Error('Unknown output preference.');
  if(audio&&override!=='audio')return {kind:'clarify',choices:['audio'],message:'Transcribe the recording first. You can then ask questions about its text in this conversation.'};
  if(override==='audio'&&!audio)return {kind:'missing_audio',message:'Attach an audio recording to transcribe.'};
  if(override==='image'&&docs)return {kind:'clarify',choices:['agent'],message:'Image generation cannot read attached documents. Remove them to create an image, or work with their text.'};
  return {kind:override};
 }
 if(audio){
  if(imageIntent||docs||/\b(summar|riassum|traduc|translate|analys|analyz|analizz)\w*/i.test(t))return {kind:'clarify',choices:['audio'],message:'First transcribe the recording? Once it is ready, ask for a summary or analysis here.'};
  return {kind:'audio'};
 }
 if((imageIntent||imageFollowup)&&toolIntent)return {kind:'clarify',choices:['image','agent'],message:'This request may need both an image and a data task. Which should I do first?'};
 if(imageIntent||imageFollowup)return {kind:'image'};
 if(toolIntent||previous==='agent'&&/\b(it|that|those|these|same|again|instead|change|add|remove|quest|stess|aggiung|modifica|rifai)\w*/i.test(t))return {kind:'agent'};
 return {kind:'chat'};
}
function buildRequest(kind,text,files,history,key){
 const docs=files.filter(f=>f.kind==='text').map((f,i)=>({id:'input_'+(i+1),text:'File: '+f.name+'\n'+f.text}));
 const messages=history.filter(m=>m.context).map(m=>({role:m.role,content:m.context}));
 const base={kind:kind==='image'?'image':'chat',consent:true,idempotency_key:key};
 if(kind==='chat'){
  const all=[...messages,{role:'user',content:text}];
  if(all.length>16||all.reduce((n,m)=>n+m.content.length,0)>12000)throw Error('This conversation has reached its text limit. Start a new conversation or shorten your message.');
  return {...base,messages:all};
 }
 if(kind==='image'){
  if(files.length)throw Error('Image generation accepts text only. Image editing and reference images are not supported.');
  if(text.length<3||text.length>1200)throw Error('Use an image description of 3 to 1,200 characters.');
  return {...base,prompt:text};
 }
 if(kind==='agent'||kind==='web'){
  if(text.length<3||text.length>2000)throw Error('Use a task of 3 to 2,000 characters. Put longer source text in an attached TXT, MD, CSV or JSON file.');
  if(messages.length){const context=messages.map(m=>m.role.toUpperCase()+': '+m.content).join('\n\n');docs.push({id:'conversation_context',text:'Previous conversation for reference. Earlier generated answers are not independently verified evidence.\n'+context});}
  if(docs.length>8||docs.some(d=>d.text.length>16000)||docs.reduce((n,d)=>n+d.text.length,0)>24000)throw Error('The conversation and attachments exceed the tool input limit. Remove attachments or start a new conversation.');
  const required=/\b(create|write|export|save|deliver|produce|download|crea|genera|scrivi|salva|esporta)\w*\b/i.test(text)?[...new Set(text.match(filePattern)||[])].filter(name=>!files.some(f=>f.name===name)):[];if(required.length>3)throw Error('Request at most three output files in one task.');
  const objective=kind==='web'?'Request time (UTC): '+new Date().toISOString()+'. For time-sensitive facts, use web tools and cite retrieved sources. If you cannot verify them, say so.\n'+text:text;
  if(objective.length>2000)throw Error('Shorten the research request to leave room for its date and source instructions.');
  return {...base,agent_task:{version:kind==='web'?3:2,objective,documents:docs,required_artifacts:required}};
 }
 throw Error('Unsupported request.');
}
return {route,buildRequest,labels};
});

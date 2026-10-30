const el=id=>document.getElementById(id);
function rows(id,values,empty){const body=el(id);body.replaceChildren();if(!values.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=4;td.textContent=empty;tr.append(td);body.append(tr);return;}for(const valuesRow of values){const tr=document.createElement('tr');for(const v of valuesRow){const td=document.createElement('td');td.textContent=String(v);tr.append(td);}body.append(tr);}}
let loading=false;
async function refresh(){if(loading)return;loading=true;el('refresh').disabled=true;try{
 const r=await fetch('/v1/public/adoption',{cache:'no-store'});if(!r.ok)throw Error('Activity is temporarily unavailable. Existing values may be stale.');const d=await r.json(),e=d.external;
 for(const [id,v]of Object.entries({submitted:e.submitted,completed:e.completed,retrieved:e.results_retrieved,sessions:e.sessions_with_jobs,returning:e.returning_reported_clients,internal:d.internal_test_jobs}))el(id).textContent=v;
 rows('days',d.daily.map(r=>[r.date,r.submitted,r.completed,r.retrieved]),'No external jobs recorded yet.');
 rows('sources',Object.entries(d.sources).map(([s,r])=>[s,r.submitted,r.completed]),'No attributed work yet.');
 el('details').textContent=e.failed+' failed/expired/cancelled · '+e.pending+' pending · '+e.mcp_jobs+' MCP jobs · '+e.http_jobs+' HTTP jobs'+(e.p50_total_seconds!==null?' · Median completion '+e.p50_total_seconds.toFixed(1)+' s':'');
 el('discovery').textContent=d.discovery_requests+' anonymous discovery/status calls · '+e.reported_client_ids+' optional reported client IDs with work. These are not verified agents.';
 el('window').textContent='Experiment started '+new Date(d.experiment_started_at).toLocaleString()+'. Measurement window begins '+new Date(d.window_started_at).toLocaleString()+'.';
 el('feedback').textContent='Updated '+new Date(d.updated_at).toLocaleString()+'. Refreshes every 60 seconds while this tab is visible.';el('feedback').className='muted';
 }catch(e){el('feedback').textContent=e.message;el('feedback').className='error';}
 try{const r=await fetch('/v1/public/studio',{cache:'no-store'});if(!r.ok)throw Error();const d=await r.json();el('availability').textContent='Live Studio status: '+((d.services?.chat||d.services?.image)?'GPU available':'GPU unavailable')+'. Shared capacity can change.';}catch{el('availability').textContent='Live availability could not be checked.';}
 loading=false;el('refresh').disabled=false;}
el('refresh').onclick=refresh;refresh();setInterval(()=>{if(!document.hidden)refresh();},60000);
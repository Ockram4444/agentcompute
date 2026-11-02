#!/usr/bin/env python3
"""Run or resume a bounded AgentCompute MCP demonstration. Python standard library.

State contains private credentials. Never commit the .private directory.
One session is reused. Errors and quota limits are never bypassed.
"""
import argparse
import json
import os
from pathlib import Path
import time
import urllib.request
import uuid
from datetime import datetime, timezone

ENDPOINT = 'https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/v1/mcp'
ROOT = Path(__file__).resolve().parent

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise RuntimeError('Unexpected redirect; credentials were not forwarded.')

def private_save(path, obj):
    path.parent.mkdir(exist_ok=True, parents=True)
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, 'w', encoding='utf-8') as f:
        json.dump(obj, f, indent=2)

def rpc(method, params, client_id):
    data = json.dumps({'jsonrpc':'2.0','id':str(uuid.uuid4()),'method':method,'params':params}).encode()
    req = urllib.request.Request(ENDPOINT, data=data, headers={
        'Content-Type':'application/json', 'Accept':'application/json, text/event-stream',
        'MCP-Protocol-Version':'2025-11-25', 'X-AgentCompute-Source':'github',
        'X-AgentCompute-Client-ID':client_id})
    with urllib.request.build_opener(NoRedirect).open(req, timeout=40) as response:
        payload = json.load(response)
    if 'error' in payload:
        raise RuntimeError(payload['error'].get('message','RPC error'))
    result = payload['result']
    if result.get('isError'):
        raise RuntimeError(result.get('structuredContent',{}).get('error','Tool error'))
    return result

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('case', type=Path)
    ap.add_argument('--run', required=True, help='Stable run name; reuse to resume the same job.')
    ap.add_argument('--licensed-nonconfidential', action='store_true', required=True)
    args=ap.parse_args()
    if not args.run.replace('-','').replace('_','').isalnum():
        raise ValueError('Unsafe run name')
    task=json.loads(args.case.read_text(encoding='utf-8'))
    state_path=ROOT/'.private'/(args.run+'.json')
    session_path=ROOT/'.private'/'session.json'
    session=json.loads(session_path.read_text()) if session_path.exists() else {'client_id':str(uuid.uuid4())}
    private_save(session_path,session)
    cid=session['client_id']
    def call(name, arguments=None):
        return rpc('tools/call',{'name':name,'arguments':arguments or {}},cid)['structuredContent']
    rpc('initialize',{'protocolVersion':'2025-11-25','clientInfo':{'name':'agentcompute-reproducible-demo','version':'1.0'},'capabilities':{}},cid)
    state=json.loads(state_path.read_text()) if state_path.exists() else None
    if state and state['task']!=task:
        raise RuntimeError('Existing run belongs to different input. Do not change it.')
    if not state:
        status=call('get_service_status')
        required='agent_web' if task.get('version')==3 else 'agent_tools'
        if not status['services'].get(required):
            raise RuntimeError('Required service offline. No job submitted.')
        if not session.get('access_token'):
            session.update(call('create_trial_access'))
            private_save(session_path,session)
        state={'task':task,'idempotency_key':str(uuid.uuid4()),'requested_at':datetime.now(timezone.utc).isoformat(),'catalog':status}
        private_save(state_path,state)
    if not state.get('job_id'):
        submitted=call('submit_agent_job',{'agent_task':task,'access_token':session['access_token'],'consent':True,'idempotency_key':state['idempotency_key']})
        state['job_id']=submitted['job_id']
        private_save(state_path,state)
        print(json.dumps({'run':args.run,'job_id':state['job_id'],'status':'submitted'}),flush=True)
    until=time.monotonic()+660
    while time.monotonic()<until:
        job=call('get_studio_job',{'job_id':state['job_id'],'access_token':session['access_token']})
        if job['status'] in ('succeeded','failed','expired'):
            break
        time.sleep(min(30,max(1,job.get('poll_after_seconds') or 3)))
    else:
        raise RuntimeError('Polling stopped; resume with the same run name.')
    out=ROOT/'results';out.mkdir(exist_ok=True)
    public={
        'demonstration':'Owner-commissioned live test through the public MCP API, not customer traction',
        'input_classification':'Synthetic or public nonconfidential data',
        'requested_at_utc':state['requested_at'],
        'retrieved_at_utc':datetime.now(timezone.utc).isoformat(),
        'request':task,
        'service_catalog':state['catalog'],
        'job':job,
    }
    text=json.dumps(public,indent=2,ensure_ascii=False)
    if session['access_token'] in text:
        raise RuntimeError('Credential detected in result; public write refused.')
    (out/(args.run+'.json')).write_text(text,encoding='utf-8')
    ar=(job.get('result') or {}).get('agent_result') or {}
    print(json.dumps({'run':args.run,'job_id':job['job_id'],'status':job['status'],'timings':job.get('timings'),'artifacts':[x.get('name') for x in ar.get('artifacts',[])],'error':job.get('error')}),flush=True)

if __name__=='__main__':
    main()

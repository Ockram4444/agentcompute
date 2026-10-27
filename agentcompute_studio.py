#!/usr/bin/env python3
"""Free AgentCompute MCP example. Python standard library, no ChatGPT login.
Re-run with the same --state to resume the same task without duplicate work.
Use a new state filename for a new task; the same private session is reused.
An expired session is not silently replaced. Archive it only after expiry,
then run again. Never rotate sessions to bypass quotas. Keep both files private.
"""
import argparse
import base64
import json
import os
from pathlib import Path
import time
import urllib.request
import uuid
CLIENT_ID = None
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise RuntimeError('Unexpected redirect; no credentials forwarded.')
OPENER = urllib.request.build_opener(NoRedirect)

ENDPOINT = 'https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com/v1/mcp'

def rpc(method, params):
    body = json.dumps({'jsonrpc':'2.0','id':str(uuid.uuid4()),'method':method,'params':params}).encode()
    req = urllib.request.Request(ENDPOINT, data=body, headers={'Content-Type':'application/json','Accept':'application/json, text/event-stream','MCP-Protocol-Version':'2025-11-25','X-AgentCompute-Source':'github',**({'X-AgentCompute-Client-ID':CLIENT_ID} if CLIENT_ID else {})})
    with OPENER.open(req, timeout=30) as response:
        result = json.load(response)
    if 'error' in result: raise RuntimeError(result['error']['message'])
    data = result['result']
    if data.get('isError'): raise RuntimeError(data['structuredContent']['error'])
    return data

def call(name, args=None):
    return rpc('tools/call', {'name':name,'arguments':args or {}})

def save(path, value):
    # Session creation is exclusive; later writes reuse the same private file.
    path.parent.mkdir(parents=True,exist_ok=True)
    fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_TRUNC,0o600)
    with os.fdopen(fd,'w',encoding='utf-8') as stream: json.dump(value,stream)

def main():
    global CLIENT_ID
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('kind',choices=['chat','image'])
    parser.add_argument('prompt')
    parser.add_argument('--state',type=Path,required=True)
    parser.add_argument('--session',type=Path,default=Path.home()/'.agentcompute'/'studio-session.private.json')
    parser.add_argument('--output',type=Path,required=True)
    parser.add_argument('--licensed-nonconfidential',action='store_true',required=True)
    args=parser.parse_args()
    session=json.loads(args.session.read_text()) if args.session.exists() else {'client_id':str(uuid.uuid4())}
    CLIENT_ID=session.setdefault('client_id',str(uuid.uuid4()))
    save(args.session,session)
    rpc('initialize',{'protocolVersion':'2025-11-25','clientInfo':{'name':'agentcompute-studio-example','version':'0.8.0'},'capabilities':{}})
    state=json.loads(args.state.read_text()) if args.state.exists() else None
    if state and (state['kind']!=args.kind or state['prompt']!=args.prompt):
        raise RuntimeError('This state belongs to another task. Use a new --state filename.')
    if not state:
        status=call('get_service_status')['structuredContent']
        if not status['services'][args.kind]: raise RuntimeError('GPU unavailable. Retry later; no task was submitted.')
        if not session.get('access_token'):
            session.update(call('create_trial_access')['structuredContent'])
            save(args.session,session)
        token=session['access_token']
        state={'kind':args.kind,'prompt':args.prompt,'access_token':token,'idempotency_key':str(uuid.uuid4())}
        save(args.state,state)
    if not state.get('job_id'):
        request={'access_token':state['access_token'],'consent':True,'idempotency_key':state['idempotency_key']}
        request.update({'messages':[{'role':'user','content':args.prompt}]} if args.kind=='chat' else {'prompt':args.prompt})
        state['job_id']=call('submit_'+args.kind+'_job',request)['structuredContent']['job_id']
        save(args.state,state)
    credentials={'access_token':state['access_token'],'job_id':state['job_id']}
    until=time.monotonic()+660
    while time.monotonic()<until:
        job=call('get_studio_job',credentials)['structuredContent']
        if job['status']=='succeeded':break
        if job['status'] in ('failed','expired'):raise RuntimeError(job.get('error') or job['status'])
        time.sleep(job['poll_after_seconds'])
    else:raise RuntimeError('Polling stopped. Re-run with the same --state to resume.')
    if args.kind=='chat':args.output.write_text(job['result']['text'],encoding='utf-8')
    else:
        result=call('get_studio_image',credentials)
        content=next(c for c in result['content'] if c['type']=='image')
        args.output.write_bytes(base64.b64decode(content['data'],validate=True))
    print(json.dumps({'job_id':job['job_id'],'status':job['status'],'timings':job['timings'],'output':str(args.output)},indent=2))

if __name__=='__main__':main()

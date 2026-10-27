"""AgentCompute client. Python 3.10+, FFmpeg for MP3/M4A/FLAC/MP4 or noncanonical WAV.
One private state file per request makes interrupted submissions resumable.
Reuse the default private session file across requests. No ChatGPT login required.
"""
import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import time
import urllib.request
import urllib.error
import uuid
import wave

BASE = 'https://u8x5gpk0ul.execute-api.eu-north-1.amazonaws.com'


def private_save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=path.parent)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as f:
            json.dump(value, f)
        os.replace(tmp, path)
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)


def request(path, token='', data=None, audio=False):
    headers = {'Accept': 'application/json', 'X-AgentCompute-Source': 'github'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    if data is not None:
        headers['Content-Type'] = 'audio/wav' if audio else 'application/json'
        if audio:
            headers['X-Data-Classification'] = 'licensed_nonconfidential'
        else:
            data = json.dumps(data).encode()
    req = urllib.request.Request(BASE + path, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.load(response)
    except urllib.error.HTTPError as exc:
        raise RuntimeError('HTTP %s: %s. Keep your state file; do not create sessions to evade limits.' %
                           (exc.code, exc.read(2048).decode(errors='replace'))) from None


def normalize(path):
    if path.suffix.lower() not in ('.wav', '.mp3', '.m4a', '.flac', '.mp4'):
        raise ValueError('Choose WAV, MP3, M4A, FLAC or MP4.')
    if path.stat().st_size > 50 * 1024 * 1024:
        raise ValueError('Input exceeds 50 MiB.')
    data = path.read_bytes()
    try:
        with wave.open(io.BytesIO(data)) as w:
            if w.getnchannels() == 1 and w.getsampwidth() == 2 and w.getframerate() == 16000:
                if not 16000 <= w.getnframes() <= 4800000:
                    raise ValueError('Audio must be 1 to 300 seconds.')
                # Re-encode to canonical WAV; strips metadata and extra chunks.
                frames = w.readframes(w.getnframes())
                output = io.BytesIO()
                with wave.open(output, 'wb') as out:
                    out.setparams((1, 2, 16000, 0, 'NONE', 'not compressed'))
                    out.writeframes(frames)
                return output.getvalue()
    except (wave.Error, EOFError):
        pass
    if not shutil.which('ffmpeg'):
        raise RuntimeError('Install FFmpeg locally for compressed media or noncanonical WAV.')
    with tempfile.TemporaryDirectory() as folder:
        target = Path(folder) / 'audio.wav'
        subprocess.run(['ffmpeg', '-nostdin', '-hide_banner', '-loglevel', 'error',
                        '-protocol_whitelist', 'file,pipe', '-i', str(path.resolve()),
                        '-map', '0:a:0', '-vn', '-t', '301', '-ac', '1', '-ar', '16000',
                        '-c:a', 'pcm_s16le', str(target)], check=True, timeout=60)
        return normalize(target)


def timestamp(seconds, separator):
    ms = round(seconds * 1000)
    hours, ms = divmod(ms, 3600000)
    minutes, ms = divmod(ms, 60000)
    secs, ms = divmod(ms, 1000)
    return f'{hours:02}:{minutes:02}:{secs:02}{separator}{ms:03}'


def subtitles(segments, vtt=False):
    blocks = []
    for i, segment in enumerate(segments, 1):
        # Escape markup in untrusted transcription; preserve plain caption text.
        text = ' '.join(segment['text'].split()).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        sep = '.' if vtt else ','
        blocks.append(f'{i}\n{timestamp(segment["start"], sep)} --> {timestamp(segment["end"], sep)}\n{text}\n')
    return ('WEBVTT\n\n' if vtt else '') + '\n'.join(blocks)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('file', type=Path)
    p.add_argument('--licensed-nonconfidential', action='store_true', required=True)
    p.add_argument('--language', choices=['en', 'auto'], default='en')
    p.add_argument('--output', type=Path, default=Path('transcript'))
    p.add_argument('--session', type=Path, default=Path.home() / '.agentcompute' / 'session.private.json')
    a = p.parse_args()
    state_path = Path(str(a.output) + '.state.private.json')
    state = json.loads(state_path.read_text()) if state_path.exists() else {}
    audio = normalize(a.file)
    digest = hashlib.sha256(audio).hexdigest()
    if state and (state['sha256'] != digest or state['language'] != a.language):
        raise ValueError('Output state belongs to another file or language. Choose another --output prefix.')
    if not state:
        state = {'sha256': digest, 'language': a.language, 'request_key': uuid.uuid4().hex}
        private_save(state_path, state)
    if 'job_id' not in state:
        status = request('/v1/public/status')
        if not status['available']:
            raise RuntimeError('Worker unavailable. Retry later with the same command.')
        if a.language == 'auto' and not status.get('multilingual_ready'):
            raise RuntimeError('Multilingual worker is not online yet. No job submitted.')
    if 'token' not in state:
        session = json.loads(a.session.read_text()) if a.session.exists() else request('/v1/trial', data={})
        private_save(a.session, session)
        state['token'] = session['access_token']
        private_save(state_path, state)
    token = state['token']
    if 'asset_id' not in state:
        state['asset_id'] = request('/v1/beta/upload', token, audio, audio=True)['asset_id']
        private_save(state_path, state)
    if 'job_id' not in state:
        job = request('/v1/beta/jobs', token, {'kind': 'compute_job', 'asset_id': state['asset_id'],
                                             'idempotency_key': state['request_key']})
        state['job_id'] = job['id']
        private_save(state_path, state)
    for _ in range(65):
        job = request('/v1/beta/jobs/' + state['job_id'], token)
        if job['status'] not in ('queued', 'running'):
            break
        time.sleep(5)
    else:
        raise RuntimeError('Polling timed out. Rerun the same command to resume.')
    if job['status'] != 'succeeded' or not job.get('result'):
        raise RuntimeError('Job has no usable result: ' + job['status'])
    result = job['result']
    for suffix, content in [('txt', result['transcript']), ('json', json.dumps(job, ensure_ascii=False, indent=2)),
                            ('srt', subtitles(result['segments'])), ('vtt', subtitles(result['segments'], True))]:
        Path(str(a.output) + '.' + suffix).write_text(content, encoding='utf-8')
    print(json.dumps({'job_id': job['id'], 'status': job['status'], 'output_prefix': str(a.output),
                      'accuracy_verified': False}))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, RuntimeError, OSError, subprocess.SubprocessError) as exc:
        raise SystemExit(str(exc))

#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json, re
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

ITER_RE = re.compile(r'^(\d{8})_(\d{6})(?:_(.*))?$')
ROOT_NAME = 'Preview-Web-Sandbox'
CACHE_KEY = 'nlab-preview-inventory-v3'


def iso_iteration(name: str):
    m = ITER_RE.match(name)
    if not m:
        return None, None, name.replace('_', ' ')
    d, t, label = m.groups()
    local = datetime.strptime(d + t, '%Y%m%d%H%M%S').replace(tzinfo=ZoneInfo('Europe/Paris'))
    dt = local.astimezone(timezone.utc)
    return d + t, dt.isoformat().replace('+00:00', 'Z'), (label or name).replace('_', ' ')


def fake_sha(value: str) -> str:
    return hashlib.sha1(value.encode('utf-8')).hexdigest()


def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except Exception:
        return {}


def build(root: Path):
    projects = []
    runtime = []
    for pdir in sorted(x for x in root.iterdir() if x.is_dir() and not x.name.startswith('.')):
        meta = read_json(pdir / 'project.json')
        pid = pdir.name
        previews, tree, root_files, production_files = [], [], [], []
        for child in sorted(pdir.iterdir()):
            if child.is_file():
                root_files.append(child.name)
                tree.append({'path': child.name, 'type': 'blob', 'mode': '100644', 'sha': fake_sha(f'{pid}:{child.name}'), 'size': child.stat().st_size})
            elif child.is_dir() and child.name == 'production-current':
                tree.append({'path': 'production-current', 'type': 'tree', 'mode': '040000', 'sha': fake_sha(f'{pid}:production-current')})
                for f in sorted(x for x in child.rglob('*') if x.is_file()):
                    rel = f.relative_to(child).as_posix()
                    production_files.append(rel)
                    tree.append({'path': f'production-current/{rel}', 'type': 'blob', 'mode': '100644', 'sha': fake_sha(f'{pid}:production-current:{rel}'), 'size': f.stat().st_size})
            elif child.is_dir():
                stamp, date, label = iso_iteration(child.name)
                files = []
                tree.append({'path': child.name, 'type': 'tree', 'mode': '040000', 'sha': fake_sha(f'{pid}:{child.name}')})
                for f in sorted(x for x in child.rglob('*') if x.is_file()):
                    rel = f.relative_to(child).as_posix()
                    files.append(rel)
                    tree.append({'path': f'{child.name}/{rel}', 'type': 'blob', 'mode': '100644', 'sha': fake_sha(f'{pid}:{child.name}:{rel}'), 'size': f.stat().st_size})
                previews.append({
                    'project': pid,
                    'project_name': meta.get('display_name') or pid,
                    'iteration': child.name,
                    'label': label,
                    'stamp': stamp,
                    'date': date,
                    'files': files,
                    'files_count': len(files),
                    'entry': 'index.html' if 'index.html' in files else None,
                    'key': f'{pid}/{child.name}',
                })
        previews.sort(key=lambda v: (v.get('stamp') or v['iteration']), reverse=True)
        project = {
            'id': pid,
            'name': meta.get('display_name') or pid,
            'description': meta.get('description') or '',
            'repository': meta.get('repository'),
            'production': meta.get('production'),
            'visual': meta.get('visual'),
            'previews': previews,
            'root_files': root_files,
            'production_files': production_files,
        }
        projects.append(project)
        runtime.append({'id': pid, 'sha': fake_sha(f'project:{pid}'), 'meta': meta, 'tree': tree})
    generated = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    return {'schema_version': '1.0.0', 'generated_at': generated, 'root': ROOT_NAME, 'projects': projects, 'runtime': runtime}


def emit_js(data):
    payload = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    return f"""(()=>{{\n'use strict';\nconst SNAP={payload};\nconst CACHE_KEY='{CACHE_KEY}';\nwindow.__nlabPublicRuntime=SNAP;\ntry{{localStorage.setItem(CACHE_KEY,JSON.stringify({{fetched_at:SNAP.generated_at,projects:SNAP.projects}}));}}catch{{}}\nconst previousFetch=window.fetch.bind(window);\nconst enc=s=>btoa(unescape(encodeURIComponent(JSON.stringify(s))));\nconst response=(data,status=200)=>new Response(JSON.stringify(data),{{status,headers:{{'Content-Type':'application/json; charset=utf-8','X-nLab-Source':'pages-runtime'}}}});\nwindow.fetch=async function(input,init){{\n  const requestHeaders=new Headers(init?.headers||(typeof Request!=='undefined'&&input instanceof Request?input.headers:undefined)||{{}});\n  if(requestHeaders.get('X-nLab-Force-Refresh')==='1')return previousFetch(input,init);\n  const url=new URL(typeof input==='string'?input:input.url,document.baseURI);\n  if(url.origin==='https://api.github.com'&&url.pathname==='/repos/nepheris/nLab-Webmaster-Preview/contents/Preview-Web-Sandbox'){{\n    return response(SNAP.runtime.map(p=>({{name:p.id,path:`Preview-Web-Sandbox/${{p.id}}`,sha:p.sha,type:'dir',size:0}})));\n  }}\n  const tm=url.origin==='https://api.github.com'&&url.pathname.match(/^\\/repos\\/nepheris\\/nLab-Webmaster-Preview\\/git\\/trees\\/([0-9a-f]{{40}})$/);\n  if(tm){{const p=SNAP.runtime.find(x=>x.sha===tm[1]);if(p)return response({{sha:p.sha,truncated:false,tree:p.tree}});}}\n  const cm=url.origin==='https://api.github.com'&&url.pathname.match(/^\\/repos\\/nepheris\\/nLab-Webmaster-Preview\\/contents\\/Preview-Web-Sandbox\\/([^/]+)\\/project\\.json$/);\n  if(cm){{const p=SNAP.runtime.find(x=>x.id===decodeURIComponent(cm[1]));if(p)return response({{type:'file',encoding:'base64',content:enc(p.meta)}});}}\n  return previousFetch(input,init);\n}};\ndocument.documentElement.dataset.publicInventory='pages-runtime';\n}})();\n"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('root', type=Path)
    ap.add_argument('out', type=Path)
    args = ap.parse_args()
    data = build(args.root)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(emit_js(data), encoding='utf-8')
    args.out.with_suffix('.json').write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'{len(data["projects"])} projects -> {args.out}')


if __name__ == '__main__':
    main()

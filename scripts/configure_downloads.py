from pathlib import Path
import os,re,json
repo=os.environ.get('GITHUB_REPOSITORY','')
if not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+',repo):raise SystemExit('GITHUB_REPOSITORY must identify the actual connected repository.')
root=Path(__file__).resolve().parents[1]/'site'
tag='v1.9.0'
for file in root.rglob('*.html'):
    html=file.read_text('utf-8')
    html=re.sub(r'(href=")downloads/([^"/]+)',lambda match:match.group(1)+'https://github.com/'+repo+'/releases/download/'+tag+'/'+match.group(2),html)
    file.write_text(html,'utf-8')
(root/'release-links.json').write_text(json.dumps({'repository':repo,'tag':tag,'downloadBase':'https://github.com/'+repo+'/releases/download/'+tag+'/'},indent=2),'utf-8')

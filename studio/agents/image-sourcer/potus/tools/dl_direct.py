import json,hashlib,urllib.parse,subprocess,time,sys
UA="ExplainerStudioBot/1.0 (https://github.com/dyorbekk8/forclaudeai)"
for slug,_,t in json.load(open(sys.argv[1])):
    n=t[5:].replace(' ','_'); h=hashlib.md5(n.encode()).hexdigest(); q=urllib.parse.quote(n)
    ext='' if n.lower().endswith(('.jpg','.jpeg')) else '.jpg'
    u=f'https://upload.wikimedia.org/wikipedia/commons/thumb/{h[0]}/{h[:2]}/{q}/1280px-{q}{ext}'
    for i in range(3):
        r=subprocess.run(['curl','-s','-m','40','-A',UA,'-o',f'img/{slug}.jpg','-w','%{http_code}',u],capture_output=True,text=True).stdout
        if r=='200': break
        time.sleep(10)
    print(slug,r,flush=True); time.sleep(2)

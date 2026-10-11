"""Regenerates responsive WebP photos + src/data/manifest.json from the original photo folders.
Usage: python3 scripts/prepare-photos.py /path/to/originals   (folders: serg, vending machine, solomon, dagmawi babi, yonas moh)
Requires: pip install pillow"""
import sys,glob,os,json
from PIL import Image,ImageOps
Image.MAX_IMAGE_PIXELS=None
SRC=sys.argv[1] if len(sys.argv)>1 else '.'
CFG={'wedding-portraits':('serg',[]),'launch-ceremony':('vending machine',[]),'tech-festival':('solomon',[10,11,12,13]),'tech-meetup':('dagmawi babi',[]),'campus-tech-event':('yonas moh',[])}
SIZES={'t':(520,68),'m':(1000,72),'l':(1600,74)}
def ahash(im):
    g=im.convert('L').resize((8,8));px=list(g.getdata());a=sum(px)/64;return [p>a for p in px]
root=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
man={}
for slug,(folder,skip) in CFG.items():
    fs=sorted(glob.glob(os.path.join(SRC,folder,'*.[jJ][pP]*[gG]')));os.makedirs(f'{root}/public/photos/{slug}',exist_ok=True);hs=[];man[slug]=[]
    for i,f in enumerate(fs):
        if i in skip: continue
        im=ImageOps.exif_transpose(Image.open(f)).convert('RGB');h=ahash(im)
        if any(sum(a!=b for a,b in zip(h,o))<=2 for o in hs): continue
        hs.append(h);nn='%02d'%i
        for k,(px,q) in SIZES.items():
            c=im.copy();c.thumbnail((px,px),Image.LANCZOS);c.save(f'{root}/public/photos/{slug}/{nn}-{k}.webp','WEBP',quality=q,method=5)
            if k=='l': W,H=c.size
        man[slug].append({'id':nn,'w':W,'h':H})
    print(slug,len(man[slug]))
json.dump(man,open(f'{root}/src/data/manifest.json','w'))

from pathlib import Path
from PIL import Image
import struct
root=Path('outputs/laozu-web/poke/maps/source')
im=Image.open(root/'region_map.png')
palette=[tuple(map(int,l.split())) for l in (root/'region_map.pal').read_text().splitlines()[3:]]
out=Image.new('RGB',(240,160))
for i,v in enumerate(struct.unpack('<600H',(root/'kanto.bin').read_bytes())):
 t=v&1023;bank=v>>12
 tile=im.crop((t%16*8,t//16*8,t%16*8+8,t//16*8+8))
 rgb=Image.new('RGB',(8,8));rgb.putdata([palette[bank*16+(p%16)] for p in tile.getdata()])
 if v&1024:rgb=rgb.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
 if v&2048:rgb=rgb.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
 out.paste(rgb,(i%30*8,i//30*8))
out.crop((16,16,216,160)).save(root.parent/'kanto.png')

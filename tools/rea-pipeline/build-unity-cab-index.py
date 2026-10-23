from pathlib import Path
import json,zipfile
from UnityPy.streams import EndianBinaryReader
from UnityPy.helpers.CompressionHelper import decompress_lz4
z=zipfile.ZipFile(r'C:/Users/45186/Downloads/wydlz_1.0.2609101116_20260917_030401_64981.apk');out={}
for entry in z.infolist():
 if not entry.filename.startswith('assets/data/') or not entry.filename.endswith('.bin'):continue
 raw=z.read(entry);r=EndianBinaryReader(raw[4:])
 if r.read_string_to_null()!='UnityFS':continue
 version=r.read_u_int();r.read_string_to_null();r.read_string_to_null();size=r.read_long();cs=r.read_u_int();us=r.read_u_int();flags=r.read_u_int()
 if version>=7:r.align_stream(16)
 if flags&128:r.Position=r.Length-cs
 block=r.read_bytes(cs)
 if flags&63 in [2,3]:block=decompress_lz4(block,us)
 elif flags&63!=0:raise ValueError('Unsupported block compression')
 b=EndianBinaryReader(block);b.read_bytes(16);n=b.read_int();b.read_bytes(n*10);n=b.read_int()
 for i in range(n):
  b.read_long();b.read_long();b.read_u_int();name=b.read_string_to_null()
  if name.startswith('CAB-')and not name.endswith('.resS'):out[name]=entry.filename
p=Path('work/home-effects-v67/cab-index.json');p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(out,indent=2),encoding='utf8');print('CABs',len(out))

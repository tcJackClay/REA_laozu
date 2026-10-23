"""Index runtime UnityFS directory headers, without loading texture payloads."""
from pathlib import Path
import json
from UnityPy.streams import EndianBinaryReader
from UnityPy.helpers.CompressionHelper import decompress_lz4
result={}
for origin in ['web-patch','patch']:
 for path in (Path('work/alignment-v9/runtime')/origin).glob('*.bin'):
  with path.open('rb') as stream:
   r=EndianBinaryReader(stream.read(256)[4:])
   if r.read_string_to_null()!='UnityFS':continue
   version=r.read_u_int();r.read_string_to_null();r.read_string_to_null();size=r.read_long();compressed=r.read_u_int();uncompressed=r.read_u_int();flags=r.read_u_int()
   if version>=7:r.align_stream(16)
   stream.seek(path.stat().st_size-compressed if flags&128 else 4+r.Position)
   block=stream.read(compressed)
   if flags&63 in [2,3]:block=decompress_lz4(block,uncompressed)
   elif flags&63:raise ValueError('Unsupported UnityFS header compression')
   b=EndianBinaryReader(block);b.read_bytes(16);b.read_bytes(b.read_int()*10)
   for _ in range(b.read_int()):
    b.read_long();b.read_long();b.read_u_int();cab=b.read_string_to_null()
    if cab.startswith('CAB-')and not cab.endswith('.resS'):result[cab]={'bundle':'assets/data/'+path.name,'origin':origin,'file':path.as_posix()}
out=Path('work/home-profile-v68/runtime-cab-index.json');out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(result,indent=2),encoding='utf8');print(len(result),'runtime CAB headers indexed')

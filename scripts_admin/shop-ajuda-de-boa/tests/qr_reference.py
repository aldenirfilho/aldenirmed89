"""Comparação offline independente. Requer Python e o pacote qrcode.
Não acessa bancos nem executa Pix. Nenhuma credencial é utilizada.
"""
import json
import pathlib
import subprocess
try:
    import qrcode
    from qrcode.util import QRData, MODE_8BIT_BYTE
except ModuleNotFoundError:
    print('SKIP: comparação QR independente exige o pacote Python opcional qrcode. Nenhuma comparação executada.')
    raise SystemExit(0)
ROOT = pathlib.Path(__file__).resolve().parents[1]
script = """
const C=require('./dist/assets/core'),D=require('./dist/assets/catalog');
console.log(JSON.stringify(D.filter(x=>x.pix).flatMap(d=>[1,2500,C.MAX_CENTS].map(n=>{const text=C.pix(d.pix,n);return {id:d.id,n,text,matrix:C.qrMatrix(text)};}))));
"""
fixtures = json.loads(subprocess.check_output(['node', '-e', script], cwd=ROOT))
for f in fixtures:
    ref = qrcode.QRCode(version=8, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=1, border=0, mask_pattern=0)
    ref.add_data(QRData(f['text'].encode('utf-8'), mode=MODE_8BIT_BYTE))
    ref.make(fit=False)
    assert ref.get_matrix() == f['matrix'], (f['id'], f['n'])
print(f"{len(fixtures)} matrizes QR idênticas à implementação independente qrcode (versão 8 / nível L / máscara 0).")

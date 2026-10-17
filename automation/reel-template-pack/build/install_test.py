"""Install a template's buyer folder into this computer's CapCut, filled with its test clips (for review only).
Usage: python build/install_test.py 02 03 ...   (from automation/reel-template-pack)"""
import importlib, shutil, subprocess, sys, tempfile
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import engine

for num in sys.argv[1:]:
    spec = importlib.import_module(f'templates.t{num}').SPEC
    tmp = Path(tempfile.mkdtemp(prefix=f'rt{num}-'))
    dest = tmp / spec['folder']
    shutil.copytree(engine.PACK / spec['dir'] / 'buyer-folder' / spec['folder'], dest)
    for i, (clip, start) in enumerate(spec['test_clips']):
        engine.run([engine.FFMPEG, '-v', 'error', '-y', '-ss', str(start), '-i', str(engine.FOOTAGE / f'{clip}.MOV'),
                    '-t', '8', '-c', 'copy', '-map', '0', str(dest / '1 Put your clips here' / f'{i + 1}.MOV')])
    r = subprocess.run(['powershell.exe', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', str(dest / 'install.ps1'),
                        '-NoPause'], capture_output=True, text=True)
    print(num, [l for l in r.stdout.splitlines() if l.startswith('Done')])
    shutil.rmtree(tmp, ignore_errors=True)

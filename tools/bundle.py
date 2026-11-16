"""Bundle a page and its CSS/JS into one self-contained HTML file (for sharing offline).

Usage: python tools/bundle.py            -> dist/dragon-and-bard.html  (the game)
       python tools/bundle.py sandbox    -> dist/sandbox.html
"""
import re, sys, pathlib
root = pathlib.Path(__file__).resolve().parents[1]
page = 'sandbox.html' if len(sys.argv) > 1 and sys.argv[1] == 'sandbox' else 'index.html'
html = (root / page).read_text(encoding='utf-8')
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">',
              lambda m: '<style>\n' + (root / m.group(1)).read_text(encoding='utf-8') + '\n</style>', html)
html = re.sub(r'<script src="([^"]+)"></script>',
              lambda m: '<script>\n' + (root / m.group(1)).read_text(encoding='utf-8').replace('</script', '<\\/script') + '\n</script>', html)
out = root / 'dist' / ('sandbox.html' if page == 'sandbox.html' else 'dragon-and-bard.html')
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding='utf-8')
print('wrote', out, f'({len(html)//1024} KB)')

"""Check deployed entry points, network isolation, and modified script integrity."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import base64, hashlib, re
root = Path(__file__).resolve().parents[1] / 'dist'
forbidden = re.compile(r'itsoffbrand|cdn\.prod\.website-files\.com|editor-api\.webflow\.com|static\.klaviyo\.com|(?:cdn|cs)\.iubenda\.com', re.I)
class Document(HTMLParser):
    def __init__(self):
        super().__init__(); self.policy = None; self.referrer = None; self.resources = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'meta':
            if a.get('http-equiv', '').lower() == 'content-security-policy': self.policy = a['content']
            if a.get('name') == 'referrer': self.referrer = a.get('content')
        key = 'src' if tag in ('script', 'img', 'iframe', 'source', 'video', 'audio') else 'href' if tag == 'link' and a.get('rel') in ('stylesheet', 'preload', 'preconnect', 'dns-prefetch', 'modulepreload') else None
        if key and a.get(key): self.resources.append((a[key], a))
checked = 0
for path in root.rglob('*'):
    if not path.is_file(): continue
    if path.suffix in ('.js', '.html', '.css', '.json') or not path.suffix:
        text = path.read_text(errors='replace')
        assert not forbidden.search(text), f'Legacy remote dependency: {path}'
        assert 'data-network-qa' not in text, f'Temporary instrumentation: {path}'
    if path.suffix != '.html' or '<html' not in text.lower(): continue
    doc = Document(); doc.feed(text)
    assert doc.policy, f'No CSP: {path}'
    assert "connect-src 'self'" in doc.policy and "frame-src 'self'" in doc.policy, path
    assert doc.referrer == 'no-referrer', path
    for url, attrs in doc.resources:
        parsed = urlsplit(url)
        assert not parsed.netloc, f'External automatic resource: {path}: {url}'
        if parsed.scheme in ('data', 'blob'): continue
        local = root / parsed.path.lstrip('/') if parsed.path.startswith('/') else path.parent / parsed.path
        assert local.exists(), f'Missing local resource: {path}: {url}'
        if attrs.get('integrity'):
            algorithm, expected = attrs['integrity'].split('-', 1)
            actual = base64.b64encode(hashlib.new(algorithm, local.read_bytes()).digest()).decode()
            assert actual == expected, f'Integrity mismatch: {local}'
    checked += 1
assert not (root / 'on-track-original-cube.js').exists()
print(f'PASS: {checked} standalone pages isolated, automatic resources local, script integrity valid, no legacy remote domains or QA instrumentation in deployment.')

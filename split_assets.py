from pathlib import Path
import re
html_path = Path('Home_page.html')
css_path = Path('style.css')
js_path = Path('script.js')
text = html_path.read_text(encoding='utf-8')
style_match = re.search(r'<style>(.*?)</style>', text, re.S)
script_match = re.search(r'<script>(.*?)</script>\s*</body>', text, re.S)
if not style_match or not script_match:
    raise SystemExit('style or script block not found')
css_path.write_text(style_match.group(1).strip() + '\n', encoding='utf-8')
js_path.write_text(script_match.group(1).strip() + '\n', encoding='utf-8')
new_text = re.sub(r'<link href="https://fonts.googleapis.com/css2\?family=[^\"]*" rel="stylesheet"\s*/?>\n', '', text)
new_text = new_text.replace('<style>\n' + style_match.group(1) + '</style>\n', '<link rel="stylesheet" href="style.css">\n')
new_text = re.sub(r'<script>.*?</script>\s*</body>', '<script src="script.js"></script>\n</body>', new_text, flags=re.S)
html_path.write_text(new_text, encoding='utf-8')
print('done')

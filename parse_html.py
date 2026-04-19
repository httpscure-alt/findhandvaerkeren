import urllib.request
import re

url = "https://findhandvaerkeren.com/"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req)
    html = response.read().decode('utf-8')
    
    js_files = re.findall(r'assets/[^"]+\.js', html)
    print(f"Found JS: {js_files}")
    
    for js_file in js_files:
        js_url = f"https://findhandvaerkeren.com/{js_file}"
        js_req = urllib.request.Request(js_url, headers={'User-Agent': 'Mozilla/5.0'})
        js_response = urllib.request.urlopen(js_req)
        js_content = js_response.read().decode('utf-8')
        
        if 'admin/companies/manual' in js_content:
            print(f"MATCH FOUND in {js_file}: OLD ROUTE 'admin/companies/manual'")
        if 'admin/onboard' in js_content:
            print(f"MATCH FOUND in {js_file}: NEW ROUTE 'admin/onboard'")
except Exception as e:
    print(e)

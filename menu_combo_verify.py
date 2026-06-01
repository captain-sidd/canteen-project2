import json, urllib.request, urllib.error
base='http://127.0.0.1:8000'
headers={'Content-Type':'application/json','Authorization':'Bearer mock-jwt-token'}
menu_data={'name':'Test Create Fix Item','description':'Created by fix script','price':123.45,'category':'Test','image_url':'https://example.com/test.png','is_available':True,'is_veg':True}
try:
    req=urllib.request.Request(base+'/api/menu', data=json.dumps(menu_data).encode('utf-8'), headers=headers)
    resp=urllib.request.urlopen(req, timeout=10)
    print('MENU', resp.status, resp.reason)
    body=json.load(resp)
    print(body)
    menu_id=body.get('id')
except urllib.error.HTTPError as e:
    print('MENU ERROR', e.code, e.read().decode())
    menu_id=None
except Exception as e:
    print('MENU ERROR', repr(e))
    menu_id=None
combo_data={'name':'Test Create Fix Combo','description':'Created by fix script','items':[{'menu_item_id':None,'quantity':1}],'combo_price':200.0,'original_price':250.0,'discount_percentage':20.0,'image_url':'https://example.com/testcombo.png','is_available':True}
if menu_id:
    combo_data['items'][0]['menu_item_id'] = menu_id
try:
    req=urllib.request.Request(base+'/api/combos', data=json.dumps(combo_data).encode('utf-8'), headers=headers)
    resp=urllib.request.urlopen(req, timeout=10)
    print('COMBO', resp.status, resp.reason)
    body=json.load(resp)
    print(body)
    combo_id=body.get('id')
except urllib.error.HTTPError as e:
    print('COMBO ERROR', e.code, e.read().decode())
    combo_id=None
except Exception as e:
    print('COMBO ERROR', repr(e))
    combo_id=None
try:
    if menu_id:
        req=urllib.request.Request(base+f'/api/menu/{menu_id}', method='DELETE', headers=headers)
        resp=urllib.request.urlopen(req, timeout=10)
        print('MENU DELETE', resp.status)
except Exception as e:
    print('MENU DELETE ERROR', repr(e))
try:
    if combo_id:
        req=urllib.request.Request(base+f'/api/combos/{combo_id}', method='DELETE', headers=headers)
        resp=urllib.request.urlopen(req, timeout=10)
        print('COMBO DELETE', resp.status)
except Exception as e:
    print('COMBO DELETE ERROR', repr(e))

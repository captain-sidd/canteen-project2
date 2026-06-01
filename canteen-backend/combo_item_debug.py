from app.schemas.combo import ComboCreate
payload = ComboCreate(name='Test', items=[{'menu_item_id':'6a1d19b4f3d17e5a0ca20290','quantity':1}], combo_price=200.0)
print(type(payload.items[0]))
print(repr(payload.items[0]))
print(hasattr(payload.items[0],'menu_item_id'))
print(getattr(payload.items[0],'menu_item_id', None))

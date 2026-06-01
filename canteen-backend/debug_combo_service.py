import asyncio
from app.services.combo_service import create_combo
from app.schemas.combo import ComboCreate

class DummyDB:
    async def find_one(self, q):
        return {'_id': q['_id'], 'is_available': True}

async def main():
    payload = ComboCreate(name='Test', items=[{'menu_item_id':'6a1d19b4f3d17e5a0ca20290','quantity':1}], combo_price=200.0)
    try:
        await create_combo(DummyDB(), payload)
        print('OK')
    except Exception as e:
        print(type(e).__name__, e)

asyncio.run(main())

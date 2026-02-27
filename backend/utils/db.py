from motor.motor_asyncio import AsyncIOMotorClient
import os

_client = None
_db = None

def get_db():
    global _client, _db
    if _db is None:
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        _client = AsyncIOMotorClient(mongo_url)
        _db = _client[os.environ.get('DB_NAME', 'job_portal_db')]
    return _db

from datetime import datetime, timezone

def serialize_datetime(obj):
    """Convert datetime objects to ISO format strings for MongoDB."""
    if isinstance(obj, dict):
        return {k: serialize_datetime(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [serialize_datetime(item) for item in obj]
    elif isinstance(obj, datetime):
        return obj.isoformat()
    return obj

def deserialize_datetime(obj, fields=None):
    """Convert ISO format strings back to datetime objects."""
    if isinstance(obj, dict):
        if fields:
            for field in fields:
                if field in obj and isinstance(obj[field], str):
                    try:
                        obj[field] = datetime.fromisoformat(obj[field])
                    except:
                        pass
        return obj
    return obj

def exclude_id(projection=None):
    """Return projection dict that excludes MongoDB _id field."""
    if projection is None:
        return {"_id": 0}
    projection["_id"] = 0
    return projection

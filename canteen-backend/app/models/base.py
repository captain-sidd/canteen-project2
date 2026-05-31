from datetime import datetime, timezone
from typing import Any

from bson import ObjectId


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def object_id_to_str(document: dict[str, Any] | None) -> dict[str, Any] | None:
    if document is None:
        return None

    def _convert(value: Any) -> Any:
        if isinstance(value, ObjectId):
            return str(value)
        if isinstance(value, dict):
            result: dict[str, Any] = {}
            for key, val in value.items():
                if key == "_id":
                    result["id"] = _convert(val)
                else:
                    result[key] = _convert(val)
            return result
        if isinstance(value, list):
            return [_convert(item) for item in value]
        return value

    return _convert(document)


def ensure_object_id(value: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise ValueError("Invalid object id")
    return ObjectId(value)

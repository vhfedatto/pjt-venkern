from flask import jsonify, request


def success_response(data=None, message=None, status_code=200):
    payload = {"success": True}

    if message is not None:
        payload["message"] = message

    if data is not None:
        payload["data"] = data

    return jsonify(payload), status_code


def error_response(message, status_code=400, details=None):
    payload = {
        "success": False,
        "message": message,
    }

    if details is not None:
        payload["details"] = details

    return jsonify(payload), status_code


def paginate_query(query, serializer, default_per_page=20, max_per_page=100):
    """Paginate a SQLAlchemy query and return a JSON response.

    Query params read from the current request:
      - page (int, default 1)
      - per_page (int, default ``default_per_page``)
    """
    try:
        page = max(1, int(request.args.get("page", 1)))
        per_page = min(
            max_per_page,
            max(1, int(request.args.get("per_page", default_per_page))),
        )
    except (TypeError, ValueError):
        page, per_page = 1, default_per_page

    total = query.count()
    items = query.limit(per_page).offset((page - 1) * per_page).all()

    return jsonify({
        "data": [serializer(item) for item in items],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": max(1, -(-total // per_page)),  # ceiling division
        },
    }), 200

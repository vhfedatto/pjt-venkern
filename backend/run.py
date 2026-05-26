if __name__ == "__main__":
    import eventlet

    eventlet.monkey_patch()

    from app import create_app
    from app.extensions import socketio

    app = create_app()
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
else:
    from app import create_app

    app = create_app()

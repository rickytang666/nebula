from flask import jsonify, request

def init_routes(app):
    @app.route('/')
    def hello_world():
        return "Hello World"

    @app.route('/tasks', methods=['POST'])
    def add():
        # TODO: Implement add task functionality
        data = request.get_json()
        return jsonify({"message": "Task added successfully"}), 201

    @app.route('/tasks/<int:task_id>', methods=['PUT'])
    def update(task_id):
        # TODO: Implement update task functionality
        data = request.get_json()
        return jsonify({"message": f"Task {task_id} updated successfully"})

    @app.route('/tasks/<int:task_id>', methods=['DELETE'])
    def delete(task_id):
        # TODO: Implement delete task functionality
        return jsonify({"message": f"Task {task_id} deleted successfully"})

    @app.route('/tasks/next', methods=['GET'])
    def next():
        # TODO: Implement get next task functionality
        return jsonify({"message": "Next task retrieved"})

    @app.route('/tasks/today', methods=['GET'])
    def today():
        # TODO: Implement get today's tasks functionality
        return jsonify({"message": "Today's tasks retrieved"})

    @app.route('/tasks/tomorrow', methods=['GET'])
    def tomorrow():
        # TODO: Implement get tomorrow's tasks functionality
        return jsonify({"message": "Tomorrow's tasks retrieved"})

    # Error handler for 404
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Not found"}), 404

    # Error handler for 500
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Internal server error"}), 500
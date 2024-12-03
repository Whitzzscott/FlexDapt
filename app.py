from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

ACCOUNT_ID = "464f3b6cf22390814b0a4df20983fbd0"
AUTH_TOKEN = "iKem7NulKxuv-R2ZZ0FbAWueFH0AcBmFmmAznWXe"

@app.route('/mainservice', methods=['POST'])
def generate():
    try:
        data = request.get_json()
        if not data or 'prompt' not in data:
            return jsonify({"error": "Missing 'prompt' in request"}), 400

        prompt = data['prompt']
        
        temperature = data.get('temperature', 1.0)
        top_k = data.get('top_k', 50)
        max_tokens = data.get('max_tokens', 256)

        response = requests.post(
            f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/@cf/mistral/mistral-7b-instruct-v0.1",
            headers={"Authorization": f"Bearer {AUTH_TOKEN}"},
            json={
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": temperature,
                "top_k": top_k,
                "max_tokens": max_tokens
            }
        )

        if response.status_code != 200:
            return jsonify({"error": "API call failed", "details": response.text}), response.status_code

        result = response.json()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": "An error occurred", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=False, threaded=True, host='0.0.0.0', port=4000)
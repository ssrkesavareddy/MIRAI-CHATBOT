from flask import Flask, request, jsonify
import random
import json
import torch
from model import NeuralNet
from nltk_utils import bag_of_words, tokenize
import time

app1 = Flask(__name__)

# Load the model and other necessary data
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

with open('intents.json', 'r') as json_data:
    intents = json.load(json_data)

FILE = r"\New Text Document.txt"
data = torch.load(FILE)

input_size = data["input_size"]
hidden_size = data["hidden_size"]
output_size = data["output_size"]
all_words = data['all_words']
tags = data['tags']
model_state = data["model_state"]

model = NeuralNet(input_size, hidden_size, output_size).to(device)
model.load_state_dict(model_state)
model.eval()

bot_name = "MARAI"


def get_response(sentence):
    # Replace hyphens with spaces
    sentence = sentence.replace('-', ' ')

    sentence = tokenize(sentence)
    X = bag_of_words(sentence, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    output = model(X)
    _, predicted = torch.max(output, dim=1)

    tag = tags[predicted.item()]

    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]
    if prob.item() > 0.75:
        for intent in intents['intents']:
            if tag == intent["tag"]:
                response = random.choice(intent['responses'])
                # Check if the response contains placeholders and replace them
                if '{current_time}' in response:
                    current_time = time.strftime("%H:%M:%S")
                    response = response.replace('{current_time}', current_time)
                if '{current_date}' in response:
                    current_date = time.strftime("%Y-%m-%d")
                    response = response.replace('{current_date}', current_date)
                return response
    else:
        return "I do not understand..."

@app1.route('/')
def home():
    return "helloworld"

@app1.route('/chat')
def chat():
    user_input = request.args.get('input', '')
    response = get_response(user_input)
    return jsonify({"response": response})

if __name__ == '__main__':
    app1.run(debug=True)

# -*- coding: utf-8 -*-
"""
Created on Fri Jan  5 21:02:50 2024

@author: adity
"""

from sentence_transformers import SentenceTransformer, InputExample, losses, util
import json
import torch
from pymongo import MongoClient
import sys

model_name="Sakil/sentence_similarity_semantic_search"
model = SentenceTransformer(model_name)

def get_database(uri):
    client = MongoClient(uri)
    return client["test"]

def load_data(db):
    collection = db["users"]
    return list(collection.find({}, {'searchTag': 1, 'phoneNumber': 1, 'firstName': 1, '_id': 0}))
    

def encode_sentences(sentences):
    embeddings = model.encode(sentences)
    return embeddings

def search(search_line, embeddings):


    #Encode all sentences
    target_embedding = model.encode([search_line])
    cos_sim = util.cos_sim(target_embedding, embeddings)

    matched_indices = cos_sim[0].sort(dim = 0, descending = True).indices.tolist()
    count = min(len(matched_indices), 10)
    result = []
    for i in range(count):
        result.append(searchTagMapping[sentences[matched_indices[i]]])
    return result

def main():
    while True:
        try:
            input_line = input()
            data = json.loads(input_line)
            if 'search_line' in data:
                result = search(data['search_line'], embeddings)
                print(json.dumps(result))
            else:
                print("Invalid input format")
        except Exception as e:
            print(f"Error: {str(e)}")
    
if __name__ == "__main__": 
    # Isme sentences mein db schema se saare users ke "about me" jaayenge
# =============================================================================
#     Also I want ki yeh model and yeh schema baar baar load na ho, bas ek baar 
#     load ho jaaye while starting app or end/start of the day and fir bas upar 
#     vaala function jo hai voh baar baar call hota rahe, try something for that
# =============================================================================
    db = get_database(sys.argv[1])
    data = load_data(db)
    searchTagMapping = {}
    sentences = []
    for record in data:
        if ('searchTag' in record):
            searchTagMapping[record['searchTag']] = record
            sentences.append(record['searchTag'])

    embeddings = encode_sentences(sentences)
    main()
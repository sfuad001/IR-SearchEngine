import glob
import os 
import json
from pymongo import MongoClient

#connect with mongodb
mongo_client = MongoClient("mongodb://127.0.0.1:27017")
print("Connection Successful")
#create the database named "ir
db = mongo_client.ir

# file path 
# change it according to your machine
file_path = "/Users/sakibfuad/Documents/winter2022/IR/project/invertedIndex"

if (os.path.isfile(file_path)):
	#process each file and store in mongodb
	#mongodb collection name is wikipedia
	file = open(file_path, "r")
	all_lines = file.readlines()
	
				
	for line in all_lines:
		print(line)
		print(line.split("\t"))
		try:
			word = line.split("\t")[0]
			# here docIds is a list of docId with tf.idf
			# docId = title of the wikipedia page
			docIds = line.split("\t")[1].split(",")
		except:
			print("An exception occurred while splitting the string")

		print("word: ", word)
		print("docIds:")
		print(docIds)
		
		docId_jsonList = []		

		for i in range(0, len(docIds)-1):
			docId_tfIdf = docIds[i]
			print("docId..: ", docId_tfIdf)
			print(docId_tfIdf.split("#"))
			try:
				docId = docId_tfIdf.split(".txt")[0]
				tfIdf = docId_tfIdf.split("#")[1]
	
				json_obj = {
					"docId": docId,
					"tfIdf": tfIdf
				}
				docId_jsonList.append(json_obj)
			except:
				print("exception occured in docId splitting")

		# insert a word and it's docId list in the mongodb collection
		try:
			data = {
				"word": word,
				"docIdList": docId_jsonList 
			}
			
			# mongodb collection name for invertedIndex data is "invertedIndex"
			rec_id = db.invertedIndex.insert_one(data)	
			print("rec_id: ", rec_id)
		except:
			print("An exception occured while inserting data in mongodb")
	
	file.close()

print("done")
mongo_client.close()

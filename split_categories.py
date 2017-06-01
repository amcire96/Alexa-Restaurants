import re
import json


name_to_alias = {}


with open("categories.json", "r") as f:
	l = json.load(f)
	for category_obj in l:
		if "restaurants" in category_obj["parents"]:
			print(category_obj["title"])
			name_to_alias[category_obj["title"]] = category_obj["alias"]

with open("category_name_to_alias.json", "w") as f:
	json.dump(name_to_alias, f)


# lines = re.split(r"\n", str)
# for line in lines:
# 	print(re.split(r"\s\(", line)[0])
# print(lines)
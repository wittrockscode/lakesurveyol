import json
import ast

with open("Geometry.json") as geo:
    geometries = json.load(geo)

with open("Lake.json") as lake:
    lakes = json.load(lake)

with open("LakeSurvey.json") as survs:
    surveys = json.load(survs)

with open("LakeSurveyLake.json") as lakeLink:
    lakeLinker = json.load(lakeLink)

with open("Surveyor.json") as surv:
    surveyors = json.load(surv)


features = []


for i in lakes:
    geometryIndex = next((index for (index, d) in enumerate(
        geometries) if d["ID"] == i["Geometry_ID"]), None)
    geos = geometries[geometryIndex]["coordinates"]
    geos = ast.literal_eval(geos)
    surveyIDS = []
    for k in lakeLinker:
        if k["LakeID"] == i["ID"]:
            surveyIDS.append(k["LakeSurveyID"])
    s = []
    for k in surveys:
        if k["ID"] in surveyIDS:
            surveyorIndex = next((index for (index, d) in enumerate(
                surveyors) if d["ID"] == k["Surveyor_ID"]), None)
            s.append({
                "Date": k["Date"],
                "Surveyor": surveyors[surveyorIndex]["Name"],
                "Results": k["Results"] if k["Results"] != None else ""
            })
    lake = {
        "type": "Feature",
        "geometry": {
            "type": geometries[geometryIndex]["type"],
            "coordinates": geos
        },
        "properties": {
            "Name": i["Name"],
            "Area": i["Area"],
            "Depth": i["Depth"],
            "Volume": i["Volume"],
            "surveys": s
        }
    }
    features.append(lake)


geojson = {
    "type": "FeatureCollection",
    "features": features
}

with open("dbtogeojson.json", "w") as f:
    json.dump(geojson, f)

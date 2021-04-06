import csv
import json
from pathlib import Path

"""
https://translate.yandex.net/api/v1.5/tr.json/translate
 ? [key=<API key>]
 & [text=<text to translate>]
 & [lang=<translation direction>]
 & [format=<text format>]
 & [options=<translation options>]
 & [callback=<callback function name>]


POST /api/v1.5/tr.json/translate?lang=en-ru&key=API-KEY HTTP/1.1
Host: translate.yandex.net
Accept: */*
Content-Length: 17
Content-Type: application/x-www-form-urlencoded

text=Hello World!


HTTP/1.1 200 OK
Server: nginx
Content-Type: application/json; charset=utf-8
Content-Length: 68
Connection: keep-alive
Keep-Alive: timeout=120
X-Content-Type-Options: nosniff
Date: Thu, 31 Mar 2016 10:50:20 GMT
{
    "code": 200,
    "lang": "en-ru",
    "text": [
        "Здравствуй, Мир!"
    ]
}
"""


ASSETS_DIR = Path.home() / "all-crosscode-versions" / "assets" / "data"
TR_PACK_FILENAME = "pack.json"
MAPPING_FILE_NAME = "localize-me-mapping.json"

asset_cache = {}
tr_pack = {}
mapping_pack = {}


with open(Path.home() / "crosscode" / "crosscode-ru" / "yatl.tsv") as csvfile:
    reader = csv.DictReader(csvfile, delimiter="\t")
    for row in reader:
        lang_uid = int(row["LangUid "])
        fragment_path = row[" Path "].split(".")
        is_checked = row[" Checked0"] == "1"

        if fragment_path[0] == "LANG":
            continue

        file_path = Path()
        file_path_len = 0
        for file_path_component in fragment_path:
            new_file_path = file_path / file_path_component
            if (ASSETS_DIR / new_file_path).exists():
                file_path = new_file_path
                file_path_len += 1
            else:
                new_file_path = new_file_path.with_suffix(".json")
                if (ASSETS_DIR / new_file_path).exists():
                    file_path = new_file_path
                    file_path_len += 1
                break

        if file_path_len == 0:
            raise Exception("wtf???", fragment_path)

        fragment_path = fragment_path[file_path_len:]
        # print(file_path, fragment_path)

        if file_path not in asset_cache:
            with open(ASSETS_DIR / file_path) as jsonfile:
                asset_cache[file_path] = json.load(jsonfile)

        data = asset_cache[file_path]

        keys = []
        bad_fragment_path = fragment_path
        fragment_path = []
        for key_component in bad_fragment_path:
            keys.append(key_component)
            key = ".".join(keys)
            if isinstance(data, list):
                data = data[int(key)]
                fragment_path.append(key)
                keys = []
            elif key in data:
                data = data[key]
                fragment_path.append(key)
                keys = []
        # if len(keys) > 0:
        #     print(file_path, bad_fragment_path, keys)

        tr_pack["{}/{}".format(file_path, "/".join(fragment_path))] = {
            "orig": row[" English "].replace("↵", "\n"),
            "text": row[" Russian "].replace("↵", "\n"),
        }
        mapping_pack[str(file_path)] = "../" + TR_PACK_FILENAME

with open(MAPPING_FILE_NAME, "w") as mappingfile:
    json.dump(mapping_pack, mappingfile, ensure_ascii=False, separators=(",", ":"))
with open(TR_PACK_FILENAME, "w") as trpackfile:
    json.dump(tr_pack, trpackfile, ensure_ascii=False, separators=(",", ":"))

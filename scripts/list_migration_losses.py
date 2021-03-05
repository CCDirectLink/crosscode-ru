#!/usr/bin/env python3
import json
import sys
import os


old_db = sys.argv[1]
new_db = sys.argv[2]


def load_db_fragments(db_dir):
    fragments = []
    fragments_dir = os.path.join(db_dir, "chapter-fragments")
    for chapter_file in os.listdir(fragments_dir):
        with open(os.path.join(fragments_dir, chapter_file)) as f:
            fragments.extend(json.load(f))
    return fragments


old_fragments = load_db_fragments(old_db)
new_fragments = load_db_fragments(new_db)

existing_translations = set()
existing_fragments_index = dict()
for f in new_fragments:
    o = f["original"]
    existing_fragments_index[f"{o['file']}//{o['jsonPath']}"] = f
    for t in f["translations"]:
        existing_translations.add(t["text"])


for f in old_fragments:
    o = f["original"]
    f2 = existing_fragments_index.get(f"{o['file']}//{o['jsonPath']}")
    for t in f["translations"]:
        if not t["text"] in existing_translations:
            print("========================================")
            if f2 is None:
                print("<fragment deleted>")
            else:
                print(f"http://notabenoid.org/book/74823/{f2['chapterId']}/{f2['id']}")
            print(f"{o['file']}  {o['jsonPath']}")
            print("========================================")
            print(o["text"])
            print("----------------------------------------")
            print(t["text"])
            print("++++++++++++++++++++++++++++++++++++++++")
            if f2 is not None and len(f2["translations"]):
                print(f2["translations"][0]["text"])
            else:
                print("<no translation>")
            print("========================================")
            print()
            print()
            print()

# for t in lost_translations:
#     print(t)

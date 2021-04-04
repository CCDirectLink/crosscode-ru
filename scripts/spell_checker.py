#!/usr/bin/env python3

import hunspell
import re
import json


checker = hunspell.HunSpell(
    "/usr/share/hunspell/ru_RU.dic", "/usr/share/hunspell/ru_RU.aff"
)

dictionary_encoding: str = checker.get_dic_encoding()
if dictionary_encoding != "KOI8-R":
    raise Exception("dictionary encoding unsupported: {}".format(dictionary_encoding))


def koi8_r_to_str(koi8_r_str: str) -> str:
    return bytearray(map(ord, koi8_r_str)).decode("koi8-r")


def remove_commands(text: str) -> str:
    parsed_text = ""
    state = 0
    for c in text:
        if state == 0:
            if c == "\\":
                state = 1
            else:
                parsed_text += c
        elif state == 1:
            if c == "." or c == "!" or c == "\\":
                state = 0
            elif c == "c" or c == "s" or c == "v" or c == "i":
                state = 2
            else:
                raise Exception("invalid text command: {}".format(c))
        elif state == 2:
            if c == "[":
                state = 3
            else:
                raise Exception("expected [, instead got: {}".format(c))
        elif state == 3:
            if c == "]":
                state = 0
    if state != 0:
        raise Exception("final state: {}".format(state))
    return parsed_text


tool_home = "assets/ru-translation-tool"

word_pattern = re.compile(
    r"[абвгдеёжзийклмнопрстуфхцчшщъыьэюяabcdefghijklmnopqrstuvwxyz0123456789\-]+",
    re.IGNORECASE,
)

with open("{}/chapter-statuses.json".format(tool_home)) as f:
    chapter_statuses = json.load(f)

for chapter_status in chapter_statuses.values():
    # if chapter_status["name"] != "LANG":
    #     continue

    with open(
        "{}/chapter-fragments/{}.json".format(tool_home, chapter_status["name"])
    ) as f:
        chapter_fragments = json.load(f)
        for fragment in chapter_fragments:
            href = "http://notabenoid.org/book/74823/{}/{}#{}".format(
                chapter_status["id"], fragment["id"], fragment["orderNumber"]
            )
            # print(href)
            # print(fragment["original"]["file"], fragment["original"]["jsonPath"])
            best_translation = remove_commands(fragment["translations"][0]["text"])
            # print(best_translation)
            # print()
            # print()

            words = re.findall(word_pattern, best_translation)
            spell_correctness = {
                word: checker.spell(word.encode("koi8-r"))
                for word in words
                if word != "-"
            }
            if not all(spell_correctness.values()):
                print(href)
                for word, spelled_correctly in spell_correctness.items():
                    if not spelled_correctly:
                        print(word, list(map(koi8_r_to_str, checker.suggest(word))))

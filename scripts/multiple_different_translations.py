#!/usr/bin/env python3
import json
import os
import html
import time
import random

all_fragments = {}

FRAGMENTS_DIR = os.path.join(
    os.path.dirname(__file__),
    "..",
    "assets",
    "ru-translation-tool",
    "chapter-fragments",
)

for file in os.listdir(FRAGMENTS_DIR):
    if not file.endswith(".json"):
        continue
    with open(os.path.join(FRAGMENTS_DIR, file)) as f:
        for fragment in json.load(f):
            all_fragments.setdefault(fragment["original"]["text"], []).append(fragment)

# curl -sLf https://github.com/shuhei/material-colors/raw/master/dist/colors.json | jq 'values | map(.["500"]? | values)'
TRANSLATION_VARIANT_MARKER_COLORS = [
    # fmt: off
    "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3", "#03a9f4",
    "#00bcd4", "#009688", "#4caf50", "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107",
    "#ff9800", "#ff5722", "#795548", "#9e9e9e", "#607d8b",
    # fmt: on
]

print("<!DOCTYPE html>")
print('<html lang="ru"><head>')
print('<meta charset="UTF-8">')
print('<meta name="viewport" content="width=device-width, initial-scale=1.0">')

print(
    r"""<style>

body {
    font-family: sans-serif;
    word-break: break-word;
}

table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
}

table, td, th {
    border: 1px solid black;
}

td, th, .table_cell_padding {
    padding: 0.25em 0.5em;
}

td {
    vertical-align: top;
}

td.translation_table_cell {
    padding: 0;
}

.translation {
    display: flex;
    flex-direction: row;
}

.translation_similar_marker {
    flex: 0 0 0.5em;
}

.translation_info {
    font-size: small;
}

.translation_info_separator {
    margin-block-start: 0.5em;
    margin-block-end: 0.25em;
    margin-inline-start: auto;
    margin-inline-end: auto;
}

</style>"""
)

print("</head><body>")

print("<table><thead>")
print("<tr>")
print("<th>Оригинальный текст</th>")
print("<th>Фрагменты Переводов</th>")
print("</tr>")

print("</thead><tbody>")

all_fragments_sorted = [
    (original_text, fragments)
    for original_text, fragments in sorted(
        all_fragments.items(), key=lambda kv: len(kv[0]), reverse=True
    )
]


for original_text, fragments in all_fragments_sorted:
    if not len(fragments) > 1:
        continue

    translations_texts_count = 0
    available_unique_translation_colors = list(TRANSLATION_VARIANT_MARKER_COLORS)
    translations_texts = {}
    for fragment in fragments:
        for translation in fragment["translations"]:
            translations_texts_count += 1

            translation_text = translation["text"]
            if translation_text not in translations_texts:
                if len(available_unique_translation_colors) == 0:
                    raise Exception("not enough TRANSLATION_VARIANT_MARKER_COLORS")

                color = random.sample(available_unique_translation_colors, 1)[0]
                available_unique_translation_colors.remove(color)

                translations_texts[translation_text] = color

    if not len(translations_texts) > 1:
        continue

    print_original_text_cell = True
    for fragment in fragments:
        for translation in fragment["translations"]:
            color = translations_texts[translation["text"]]

            print("<tr>")

            if print_original_text_cell:
                print_original_text_cell = False
                print('<td rowspan="{}">'.format(translations_texts_count))
                print(html.escape(original_text, quote=False))
                print("</td>")

            print('<td class="translation_table_cell"><div class="translation">')
            print(
                '<div class="translation_similar_marker" style="background-color: {};"></div>'.format(
                    color
                )
            )

            print('<div class="table_cell_padding">')
            print(html.escape(translation["text"], quote=False))

            print('<hr class="translation_info_separator">')
            print('<div class="translation_info">')
            print(
                '<a href="{0}">{0}</a><br>'.format(
                    "http://notabenoid.org/book/74823/{}/{}".format(
                        fragment["chapterId"],
                        fragment["id"],
                    )
                )
            )
            print(
                "<span>{}, {} UTC</span>".format(
                    translation["authorUsername"],
                    time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(translation["timestamp"])),
                )
            )
            print("</div>")  # .translation_info

            print("</div>")  # .table_cell_padding
            print("</div></td>")  # .translation .translation_table_cell

            print("</tr>")

print("</tbody></table>")

print("</body></html>")

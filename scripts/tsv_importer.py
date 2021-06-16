#!/usr/bin/env python3

# <https://gitlab.com/Dimava/crosscode-translation-ru/-/blob/master/assets/editor/LANG.tsv>
# <https://gitlab.com/Dimava/crosscode-translation-ru/-/blob/master/assets/editor/yatl.tsv>
# <https://gitlab.com/Dimava/crosscode-translation-ru/-/blob/master/assets/editor/other.tsv>
# <https://gitlab.com/Dimava/crosscode-translation-ru/-/blob/master/assets/editor/database.tsv>
# <https://gitlab.com/Dimava/crosscode-translation-ru/-/blob/master/assets/editor/item-database.tsv>

import csv
import json
import sys
from typing import (Dict, Generator, Iterable, List, NamedTuple, Tuple, TypedDict)


class ScanDbSerde(TypedDict):
  id: str
  ctime: int
  game_version: str
  game_files: Dict[str, "ScanGameFileSerde"]


class ScanGameFileSerde(TypedDict):
  asset_root: str
  fragments: Dict[str, "ScanFragmentSerde"]


class ScanFragmentSerde(TypedDict):
  luid: int
  desc: List[str]
  text: Dict[str, str]
  flags: List[str]


LmTrPack = Dict[str, "LmTrPackEntry"]


class LmTrPackEntry(TypedDict):
  orig: str
  text: str


def main(argv: List[str]) -> int:
  if len(argv) < 3:
    print(f"usage: {argv[0]} [SCAN_DB_PATH] [FILE...]", file=sys.stderr)
    return 1

  scan_db_path = argv[1]
  with open(scan_db_path, "r") as scan_db_reader:
    scan_db: ScanDbSerde = json.load(scan_db_reader)

  combined_path_lut = create_combined_path_unpacking_lut(scan_db)

  lm_tr_pack: LmTrPack = {}

  for tsv_file in argv[2:]:
    with open(tsv_file, "r") as tsv_file_reader:
      for row in parse_translation_tsv(tsv_file_reader):
        try:

          unpacked_combined_path = combined_path_lut.get(row.combined_path.replace('"', ""))
          if unpacked_combined_path is None:
            raise TranslationImportException("could't resolve combined path")
          file_path, json_path = unpacked_combined_path

          scan_db_file = scan_db["game_files"].get(file_path)
          if scan_db_file is None:
            raise TranslationImportException("game file not found")
          scan_db_fragment = scan_db_file["fragments"].get(json_path)
          if scan_db_fragment is None:
            raise TranslationImportException("fragment not found")

          def normalize_text(text: str) -> str:
            return text.replace("\n", " ").replace('"', "").strip()

          tsv_original_text = row.original_text.replace("↵", "\n")
          real_original_text = scan_db_fragment["text"]["en_US"]
          if normalize_text(tsv_original_text) != normalize_text(real_original_text):
            print("json =", repr(real_original_text), file=sys.stderr)
            print("tsv = ", repr(tsv_original_text), file=sys.stderr)
            raise TranslationImportException("original texts don't match")

          if row.lang_uid != scan_db_fragment["luid"]:
            raise TranslationImportException("Lang UIDs don't match")

          if file_path.startswith("data/"):
            file_path = file_path[5:]
          lm_tr_pack[f"{file_path}/{json_path}"] = {
            "orig": real_original_text,
            "text": row.translation_text,
          }

        except TranslationImportException as err:
          print(
            f"Problem while importing '{row.combined_path}': {err}",
            file=sys.stderr,
          )

  json.dump(lm_tr_pack, sys.stdout, ensure_ascii=False, indent=2)
  sys.stdout.write("\n")

  return 0


class TranslationTsvRow(NamedTuple):
  lang_uid: int
  original_text: str
  translation_text: str
  combined_path: str
  is_checked: bool


def parse_translation_tsv(line_reader: Iterable[str]) -> Generator[TranslationTsvRow, None, None]:
  csv_reader = csv.reader(line_reader, delimiter="\t")

  headers = [s.strip() for s in next(csv_reader)]
  headers_valid = (
    len(headers) >= 5 and  #
    headers[0] == "LangUid" and  #
    headers[1] == "English" and  #
    headers[2] == "Russian" and  #
    headers[3] == "Path" and  #
    (len(headers[4]) == 0 or headers[4] == "Отредакчено" or headers[4] == "Checked0")  #
  )
  if not headers_valid:
    raise Exception("Invalid header line")

  for row in csv_reader:
    yield TranslationTsvRow(
      lang_uid=int(row[0]) if len(row[0]) > 0 else 0,
      original_text=row[1],
      translation_text=row[2],
      combined_path=row[3],
      is_checked=row[4] == "1",
    )


def create_combined_path_unpacking_lut(scan_db: ScanDbSerde) -> Dict[str, Tuple[str, str]]:
  lut: Dict[str, Tuple[str, str]] = {}

  for real_file_path, game_file in scan_db["game_files"].items():
    primary_file_path = real_file_path
    if primary_file_path.startswith("data/"):
      primary_file_path = primary_file_path[5:]
    if primary_file_path.endswith(".json"):
      primary_file_path = primary_file_path[:-5]

    file_paths: List[str] = []
    legacy_primary_file_path = primary_file_path.replace("/", ".")
    file_paths.append(legacy_primary_file_path)

    if primary_file_path.startswith("lang/"):
      legacy_lang_file_path = legacy_primary_file_path[5:]
      # Unused (the variant with lowercase directory has already been added)
      file_paths.append(f"LANG.{legacy_lang_file_path}")
      if legacy_lang_file_path.endswith(".en_US"):
        legacy_lang_file_path = legacy_lang_file_path[:-6]
      # Used in yatl.tsv
      file_paths.append(f"LANG.{legacy_lang_file_path}")
      # Used in LANG.tsv
      file_paths.append(f"lang.{legacy_lang_file_path}.de_DE")

    for real_json_path in game_file["fragments"].keys():
      json_path = real_json_path.replace("/", ".")
      for file_path in file_paths:
        lut[f"{file_path}.{json_path}"] = (real_file_path, real_json_path)

  return lut


class TranslationImportException(Exception):
  pass


# PathTree = Dict[str, "PathTree"]
#
#
# def parse_combined_path(combined_path: str, scan_db_file_tree: PathTree) -> Tuple[str, str]:
#   components = ["data"]
#   for component in combined_path.split("."):
#     if component.startswith('"') and component.endswith('"'):
#       maybe_str = json.loads(component)
#       if not isinstance(maybe_str, str):
#         raise Exception("Unexpected result from json.loads")
#       component = maybe_str
#     components.append(component)
#
#   wanted_file_extension = ".json"
#   if len(components) > 2 and components[0] == "data" and (
#     components[1] == "lang" or components[1] == "LANG"
#   ):
#     components[1] = "lang"  # match the directory name
#     wanted_file_extension = ".en_US.json"
#
#   file_path: List[str] = []
#   eaten_components = 0
#   current_dir: Optional[PathTree] = scan_db_file_tree
#   for component in components:
#     if current_dir is None or len(current_dir) == 0:
#       break
#
#     maybe_next_dir: Optional[PathTree] = current_dir.get(component)
#     if maybe_next_dir is not None:
#       current_dir = maybe_next_dir
#       file_path.append(component)
#       eaten_components += 1
#       continue
#
#     component += wanted_file_extension
#     maybe_file: Optional[PathTree] = current_dir.get(component)
#     if maybe_file is not None:
#       current_dir = maybe_file
#       file_path.append(component)
#       eaten_components += 1
#       continue
#
#     break
#
#   json_path = components[eaten_components:]
#   return "/".join(file_path), "/".join(json_path)
#
#
# # <https://github.com/dmitmel/cc-translateinator/blob/225f2f37b292563dc031564f448c859de4862a5c/src/app.ts#L168-L192>
# def paths_list_to_tree(paths: Iterable[str]) -> PathTree:
#   root_dir: PathTree = dict()
#
#   for path in paths:
#     current_dir: PathTree = root_dir
#     for component in path.split("/"):
#       next_dir: Optional[PathTree] = current_dir.get(component, None)
#       if next_dir is None:
#         next_dir = dict()
#         current_dir[component] = next_dir
#       current_dir = next_dir
#
#   return root_dir

if __name__ == "__main__":
  sys.exit(main(sys.argv))

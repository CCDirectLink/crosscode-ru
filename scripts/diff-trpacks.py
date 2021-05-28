#!/usr/bin/env python3

import json
import os
import sys
from pathlib import Path
from typing import Dict, Set, Tuple, Generator
import subprocess
from tempfile import TemporaryDirectory


IGNORED_PHRASES = set([
  # TODO: Merge this with the COMMON_PHRASES table in tool/src/main.ts.
  '???',
  '????',
  '...',
  '.\\..\\..',
  '...!',
  '...!!',
  '...?',
  '...?!',
  '...!?',
  '[nods]',
  '[shakes head]',
  'Hi!',
  'Hi?',
  'Hi.',
  'Hi...',
  'Hi!!',
  'Hi!!!',
  'Why?',
  'How?',
  'Bye!',
  'Bye.',
  'Bye?',
  'Thanks!',
  'Lea!',
  '[yes]',
  '[no]',
  'Up',
  'Down',
  'Meet',
  'Yes',
  'No',
  'Logout',
  'Login',
  'What?',
  'Who?',
  'Where?',

  # TODO: Same, merge this with the list in tool/src/main.ts and src/locale.ts.
  '',
  'en_US',
  'LOL, DO NOT TRANSLATE THIS!',
  'LOL, DO NOT TRANSLATE THIS! (hologram)',
  '\\c[1][DO NOT TRANSLATE THE FOLLOWING]\\c[0]',
  '\\c[1][DO NOT TRANSLATE FOLLOWING TEXTS]\\c[0]',
])


def main():
  old_db_dir = Path(sys.argv[1])
  new_db_dir = Path(sys.argv[2])

  with open(old_db_dir / "localize-me-mapping.json", 'r') as f:
    old_mapping: Dict[str, str] = json.load(f)
  with open(new_db_dir / "localize-me-mapping.json", 'r') as f:
    new_mapping: Dict[str, str] = json.load(f)

  trpacks_in_both_dbs: Set[str] = set()
  trpacks_in_both_dbs.update(old_mapping.keys())
  trpacks_in_both_dbs.update(new_mapping.keys())

  with TemporaryDirectory() as tmp_dir:
    for trpack_name in sorted(trpacks_in_both_dbs):
      old_trpack_file = prepare_trpack(old_db_dir / "localize-me-packs" / trpack_name, tmp_dir)
      new_trpack_file = prepare_trpack(new_db_dir / "localize-me-packs" / trpack_name, tmp_dir)
      try:
        subprocess.run(
          ['diff', '--unified', '--color=auto', old_trpack_file, new_trpack_file],
          check=True,
          cwd=tmp_dir,
        )
      except subprocess.CalledProcessError as err:
        # The exit code 1 means just that the files are different and no real
        # error has occured.
        if err.returncode != 1:
          raise err


def prepare_trpack(path: Path, tmp_dir: str) -> Path:
  tmp_path_tail = path_strip_root(path)
  tmp_path = Path(tmp_dir) / tmp_path_tail
  os.makedirs(tmp_path.parent, exist_ok=True)

  with open(tmp_path, 'w') as tmp_file:
    try:
      input_file = open(path, 'r')
    except FileNotFoundError:
      return tmp_path_tail
    with input_file:
      trpack: Dict[str, Dict[str, str]] = json.load(input_file)

      # The following is basically a port of an equivalent jq script:
      #
      #     to_entries
      #   | map(
      #         select(.value.orig as $orig | all($ignored_phrases[]; . != $orig))
      #       | .key |= gsub("[0-9]+"; "<N>")
      #     )
      #   | sort_by(.value.orig)
      #   | from_entries
      #

      def trpack_revised_items_iter() -> Generator[Tuple[str, Dict[str, str]], None, None]:
        for file_json_path, orig_and_tr in trpack.items():
          if orig_and_tr['orig'] not in IGNORED_PHRASES:
            # file_json_path = re.sub("[0-9]+", "<N>", file_json_path)
            yield file_json_path, orig_and_tr

      def trpack_sorting_key(item: Tuple[str, Dict[str, str]]) -> str:
        _file_json_path, orig_and_tr = item
        return orig_and_tr['orig']

      trpack = dict(sorted(trpack_revised_items_iter(), key=trpack_sorting_key))

      json.dump(trpack, tmp_file, ensure_ascii=False, indent='  ')
      tmp_file.write('\n')

  return tmp_path_tail


def path_strip_root(path: Path) -> Path:
  # <https://stackoverflow.com/a/50846228/12005228>
  # Not the most efficient solution, I must admit...
  return path.relative_to(path.anchor)


if __name__ == '__main__':
  main()

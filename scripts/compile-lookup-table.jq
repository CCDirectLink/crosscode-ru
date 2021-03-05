#!/usr/bin/env -S jq -s -f
[.[][]]
  | map({ key: .original.text, value: .translations[].text })
  | group_by(.key)
  | map({ key: .[0].key, value: map(.value) | unique })
  | from_entries

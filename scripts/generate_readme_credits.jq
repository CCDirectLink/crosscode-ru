# usage: jq -r -f scripts/generate_readme_credits.jq assets/data/credits/crosscode-ru.json

def get_localized_string: if has("ru_RU") then .ru_RU else .en_US end;
.entries | to_entries | map(
  .value | select(.names | length > 0) |
    "### \(.header | get_localized_string)\n\n\(.names | map("- \(get_localized_string)") | join("\n"))\n"
) | join("\n")

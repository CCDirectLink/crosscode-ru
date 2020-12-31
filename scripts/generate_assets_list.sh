#!/usr/bin/env sh
set -eu
# I'd like to know why is --null-input necessary.
# <https://github.com/stedolan/jq/issues/822#issuecomment-113655116>
find assets -type f -not -name '*.xcf' -not -path 'assets/ru-translation-tool*' -printf '%P\n' | jq --raw-input --null-input '[inputs] | sort'

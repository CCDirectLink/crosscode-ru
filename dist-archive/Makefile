# Ascended form of CrossCode mod packaging, true old-school UNIX style.
# makefile cheat sheet: https://devhints.io/makefile

# short note about make's magic variables:
# $@    - name of the target
# $(@D) - directory of the target
# $^    - dependencies of the target
# $<    - the first dependency of the target

# https://tech.davis-hansson.com/p/make/
SHELL := bash
.ONESHELL:
.SHELLFLAGS := -eu -o pipefail -c
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules
ifeq ($(origin .RECIPEPREFIX), undefined)
  $(error This Make does not support .RECIPEPREFIX. Please use GNU Make 4.0 or later)
endif
.RECIPEPREFIX = >

ifeq ($(origin TOOL_DATA_DIR), undefined)
  $(error TOOL_DATA_DIR is undefined. Please set to $$GAME_DIR/assets/ru-translation-tool-ng or something like that)
endif

.PHONY: all clean

# Function that returns relative paths (i.e. excluding the path to the base
# directory) of all files matching any of the provided patterns in the provided
# base directory. Note that in findutils asterisk (`*`) matches EVERY character,
# including slashes (`/`), unlike in shells.
find_by_patterns = $(shell find $1 -type f \( $(foreach w,$2,-path '$1/$(w)' -or) -false \) -printf '%P\n')

MOD_ID := $(shell jq -r '.name' ../package.json)
MOD_VERSION := $(shell jq -r '.version' ../package.json)
MOD_DIR := $(MOD_ID)
TOOL_DIR := $(MOD_ID)-tool
LOCALIZE_ME_DIR := Localize-me
TRANSLATIONS_DIR := assets/ru-translation-tool-ng

TOOL_FILES := tool/dist/*.js tool/dist/*.js.map tool/dist/*.css tool/dist/*.css.map tool/main.html
TOOL_FILES := $(call find_by_patterns,..,$(TOOL_FILES))
MOD_FILES := assets/*.png src/*.js LICENSE package.json postload.js prestart.js README.md
MOD_FILES := $(call find_by_patterns,..,$(MOD_FILES))
TRANSLATIONS_FILES := localize-me-packs/*.json localize-me-mapping.json
TRANSLATIONS_FILES := $(call find_by_patterns,$(TOOL_DATA_DIR),$(TRANSLATIONS_FILES))

MOD_ARCHIVE_NAME := $(MOD_DIR)_v$(MOD_VERSION).zip
MOD_ARCHIVE_FILES := $(addprefix $(MOD_DIR)/,$(MOD_FILES) $(addprefix $(TRANSLATIONS_DIR)/,$(TRANSLATIONS_FILES)))
TOOL_ARCHIVE_NAME := $(TOOL_DIR)_v$(MOD_VERSION).zip
TOOL_ARCHIVE_FILES := $(addprefix $(TOOL_DIR)/,$(TOOL_FILES) $(MOD_FILES))
MODPACK_ARCHIVE_NAME := $(MOD_DIR)_modpack_v$(MOD_VERSION).zip
MODPACK_ARCHIVE_FILES := $(MOD_ARCHIVE_FILES) $(LOCALIZE_ME_DIR)

all: $(MOD_ARCHIVE_NAME) $(TOOL_ARCHIVE_NAME) $(MODPACK_ARCHIVE_NAME)

clean:
> rm -rvf $(MOD_ARCHIVE_NAME) $(TOOL_ARCHIVE_NAME) $(MODPACK_ARCHIVE_NAME) $(MOD_DIR) $(TOOL_DIR) $(LOCALIZE_ME_DIR)

$(MOD_ARCHIVE_NAME): $(MOD_ARCHIVE_FILES)
$(TOOL_ARCHIVE_NAME): $(TOOL_ARCHIVE_FILES)
$(MODPACK_ARCHIVE_NAME): $(MODPACK_ARCHIVE_FILES)
$(MOD_ARCHIVE_NAME) $(TOOL_ARCHIVE_NAME) $(MODPACK_ARCHIVE_NAME):
> rm -rvf $@
> zip -r $@ $^

$(LOCALIZE_ME_DIR):
> mkdir -pv $@
> curl --location --fail https://github.com/L-Sherry/Localize-me/tarball/master | \
    tar -v --directory $@ --gzip --strip-components 1 --extract

# Unfortuntately, the following file copying rules can't be merged together
$(MOD_DIR)/$(TRANSLATIONS_DIR)/%.json: $(TOOL_DATA_DIR)/%.json
> mkdir -pv $(@D)
> jq -c . $< > $@
$(MOD_DIR)/%.js: ../%.js
> mkdir -pv $(@D)
> awk -f ./tool-section-preprocessor.awk $< > $@
$(MOD_DIR)/%: ../%
> mkdir -pv $(@D) && cp -r $< $@
$(TOOL_DIR)/%: ../%
> mkdir -pv $(@D) && cp -r $< $@

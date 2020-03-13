# Ascended form of CrossCode mod packaging, true old-school UNIX style.
# makefile cheat sheet: https://devhints.io/makefile

# short note about make's magic variables:
# $@    - name of the target
# $(@D) - directory of the target
# $^    - dependencies of the target

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

# Function that returns relative paths (i.e. excluding the path to the project
# directory) of all files matching any of the provided patterns in the project
# directory
find_mod_files = $(shell find .. -type f \( $(foreach w,$1,-path '../$(w)' -or) -false \) -printf '%P\n')

MOD_ID := $(shell jq -r '.name' ../package.json)
MOD_VERSION := $(shell jq -r '.version' ../package.json)
MOD_DIR_NAME := $(MOD_ID)
TOOL_DIR_NAME := $(MOD_ID)-tool
LOCALIZE_ME_DIR_NAME := Localize-me

TOOL_FILES := tool/dist/*.js tool/dist/*.js.map tool/dist/*.css tool/dist/*.css.map tool/main.html
TOOL_FILES := $(call find_mod_files,$(TOOL_FILES))
MOD_FILES := assets/*.png src/*.js LICENSE package.json postload.js prestart.js README.md
MOD_FILES := $(call find_mod_files,$(MOD_FILES))

MOD_ARCHIVE_NAME := $(MOD_DIR_NAME)_v$(MOD_VERSION).zip
MOD_ARCHIVE_FILES := $(addprefix $(MOD_DIR_NAME)/,$(MOD_FILES) $(addprefix assets/ru-translation-tool-ng/,localize-me-packs localize-me-mapping.json))
TOOL_ARCHIVE_NAME := $(TOOL_DIR_NAME)_v$(MOD_VERSION).zip
TOOL_ARCHIVE_FILES := $(addprefix $(TOOL_DIR_NAME)/,$(TOOL_FILES) $(MOD_FILES))
MODPACK_ARCHIVE_NAME := $(MOD_DIR_NAME)_modpack_v$(MOD_VERSION).zip
MODPACK_ARCHIVE_FILES := $(MOD_ARCHIVE_FILES) $(LOCALIZE_ME_DIR_NAME)

all: $(MOD_ARCHIVE_NAME) $(TOOL_ARCHIVE_NAME) $(MODPACK_ARCHIVE_NAME)

clean:
> rm -rvf $(MOD_ARCHIVE_NAME) $(TOOL_ARCHIVE_NAME) $(MODPACK_ARCHIVE_NAME) $(MOD_DIR_NAME) $(TOOL_DIR_NAME) $(LOCALIZE_ME_DIR_NAME)

$(MOD_ARCHIVE_NAME): $(MOD_ARCHIVE_FILES)
$(TOOL_ARCHIVE_NAME): $(TOOL_ARCHIVE_FILES)
$(MODPACK_ARCHIVE_NAME): $(MODPACK_ARCHIVE_FILES)
$(MOD_ARCHIVE_NAME) $(TOOL_ARCHIVE_NAME) $(MODPACK_ARCHIVE_NAME):
> rm -rvf $@ && zip -r $@ $^

$(LOCALIZE_ME_DIR_NAME):
> mkdir -v $@
> curl -fL https://github.com/L-Sherry/Localize-me/tarball/master | \
    tar -C $@ --gzip --strip-components 1 --extract --verbose

# Unfortuntatelly, the following file copying rules can't be merged together
$(MOD_DIR_NAME)/assets/ru-translation-tool-ng/%: $(TOOL_DATA_DIR)/%
> mkdir -pv $(@D) && cp -rv $^ $@
$(MOD_DIR_NAME)/%: ../%
> mkdir -pv $(@D) && cp -rv $^ $@
$(TOOL_DIR_NAME)/%: ../%
> mkdir -pv $(@D) && cp -rv $^ $@

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

ifeq ($(origin TOOL_DATA_DIR), undefined)
	$(error TOOL_DATA_DIR is undefined. Please set to $$GAME_DIR/assets/ru-translation-tool or something like that)
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
TOOL_MOD_ID := $(shell jq -r '.name' ../tool/package.json)
TOOL_MOD_VERSION := $(shell jq -r '.version' ../tool/package.json)
TOOL_DIR := $(TOOL_MOD_ID)
ENHANCED_UI_MOD_ID := $(shell jq -r '.name' ../enhanced-ui/package.json)
ENHANCED_UI_MOD_VERSION := $(shell jq -r '.version' ../enhanced-ui/package.json)
ENHANCED_UI_MOD_DIR := $(ENHANCED_UI_MOD_ID)
LOCALIZE_ME_MOD_DIR := Localize-me
CC_WORLD_MAP_OVERHAUL_MOD_DIR := cc-world-map-overhaul
TRANSLATIONS_DIR := assets/ru-translation-tool

TOOL_FILES := dist/*.js dist/*.js.map dist/*.css dist/*.css.map LICENSE* main.html package.json
TOOL_FILES := $(call find_by_patterns,../tool,$(TOOL_FILES))
MOD_FILES := assets/data/*.json assets/media/*.png dist/*.js dist/*.js.map LICENSE* package.json README.md
MOD_FILES := $(call find_by_patterns,..,$(MOD_FILES))
ENHANCED_UI_MOD_FILES := dist/*.js dist/*.js.map LICENSE* package.json
ENHANCED_UI_MOD_FILES := $(call find_by_patterns,../enhanced-ui,$(ENHANCED_UI_MOD_FILES))
TRANSLATIONS_FILES := localize-me-packs/*.json localize-me-mapping.json
TRANSLATIONS_FILES := $(call find_by_patterns,$(TOOL_DATA_DIR),$(TRANSLATIONS_FILES))

MOD_ARCHIVE_NAME := $(MOD_DIR)_v$(MOD_VERSION)
MOD_ARCHIVE_FILES := $(addprefix $(MOD_DIR)/,$(MOD_FILES) $(addprefix $(TRANSLATIONS_DIR)/,$(TRANSLATIONS_FILES)))
TOOL_ARCHIVE_NAME := $(TOOL_DIR)_v$(TOOL_MOD_VERSION)
TOOL_ARCHIVE_FILES := $(addprefix $(TOOL_DIR)/,$(TOOL_FILES))
ENHANCED_UI_MOD_ARCHIVE_NAME := $(ENHANCED_UI_MOD_ID)_v$(ENHANCED_UI_MOD_VERSION)
ENHANCED_UI_MOD_ARCHIVE_FILES := $(addprefix $(ENHANCED_UI_MOD_DIR)/,$(ENHANCED_UI_MOD_FILES))

MODPACKS_COMMON_FILES := $(ENHANCED_UI_MOD_ARCHIVE_FILES) $(LOCALIZE_ME_MOD_DIR) $(CC_WORLD_MAP_OVERHAUL_MOD_DIR)
MODPACK_ARCHIVE_NAME := $(MOD_DIR)_modpack_v$(MOD_VERSION)
MODPACK_ARCHIVE_FILES := $(MOD_ARCHIVE_FILES) $(MODPACKS_COMMON_FILES)
TOOL_MODPACK_ARCHIVE_NAME := $(TOOL_DIR)_modpack_v$(TOOL_MOD_VERSION)
TOOL_MODPACK_ARCHIVE_FILES := $(addprefix $(MOD_DIR)/,$(MOD_FILES)) $(TOOL_ARCHIVE_FILES) $(MODPACKS_COMMON_FILES)

ALL_ARCHIVE_NAMES_WITHOUT_FILETYPES := $(MOD_ARCHIVE_NAME) $(TOOL_ARCHIVE_NAME) $(ENHANCED_UI_MOD_ARCHIVE_NAME) $(MODPACK_ARCHIVE_NAME) $(TOOL_MODPACK_ARCHIVE_NAME)
ZIP_ARCHIVE_NAMES := $(addsuffix .zip,$(ALL_ARCHIVE_NAMES_WITHOUT_FILETYPES))
TAR_ARCHIVE_NAMES := $(addsuffix .tar.gz,$(ALL_ARCHIVE_NAMES_WITHOUT_FILETYPES))
ALL_ARCHIVE_NAMES := $(ZIP_ARCHIVE_NAMES) $(TAR_ARCHIVE_NAMES)

all: $(ALL_ARCHIVE_NAMES)

clean:
	rm -rvf $(ALL_ARCHIVE_NAMES) $(MOD_DIR) $(TOOL_DIR) $(LOCALIZE_ME_MOD_DIR) $(CC_WORLD_MAP_OVERHAUL_MOD_DIR) $(ENHANCED_UI_MOD_DIR)

archive_names = $(addsuffix .zip,$1) $(addsuffix .tar.gz,$1)
$(call archive_names,$(MOD_ARCHIVE_NAME)): $(MOD_ARCHIVE_FILES)
$(call archive_names,$(TOOL_ARCHIVE_NAME)): $(TOOL_ARCHIVE_FILES)
$(call archive_names,$(MODPACK_ARCHIVE_NAME)): $(MODPACK_ARCHIVE_FILES)
$(call archive_names,$(TOOL_MODPACK_ARCHIVE_NAME)): $(TOOL_MODPACK_ARCHIVE_FILES)
$(call archive_names,$(ENHANCED_UI_MOD_ARCHIVE_NAME)): $(ENHANCED_UI_MOD_ARCHIVE_FILES)

$(ZIP_ARCHIVE_NAMES):
	rm -rvf $@
	zip --recurse-paths $@ -- $^

$(TAR_ARCHIVE_NAMES):
	rm -rvf $@
	tar --verbose --create --file $@ --gzip -- $^

define download_crosscode_mod
mkdir -pv $1 && \
curl --location --fail $2 | tar --verbose --directory $1 --gzip --strip-components 1 --extract
endef

$(LOCALIZE_ME_MOD_DIR):
	$(call download_crosscode_mod,$@,https://github.com/L-Sherry/Localize-me/archive/v0.5.2.tar.gz)
$(CC_WORLD_MAP_OVERHAUL_MOD_DIR):
	$(call download_crosscode_mod,$@,https://github.com/dmitmel/cc-world-map-overhaul/releases/download/v1.0.0/cc-world-map-overhaul_v1.0.0.tar.gz)

$(MOD_DIR)/$(TRANSLATIONS_DIR): $(addprefix $(MOD_DIR)/$(TRANSLATIONS_DIR)/,$(TRANSLATIONS_FILES))

# Unfortuntately, the following file copying rules can't be merged together
$(MOD_DIR)/$(TRANSLATIONS_DIR)/%.json: $(TOOL_DATA_DIR)/%.json
	mkdir -pv $(@D)
	jq --compact-output . $< > $@
$(MOD_DIR)/%: ../%
	mkdir -pv $(@D) && cp -r $< $@
$(TOOL_DIR)/%: ../tool/%
	mkdir -pv $(@D) && cp -r $< $@
$(ENHANCED_UI_MOD_DIR)/%: ../enhanced-ui/%
	mkdir -pv $(@D) && cp -r $< $@

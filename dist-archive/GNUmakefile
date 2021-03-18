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

.PHONY: all clean compile-translations

# Function that returns relative paths (i.e. excluding the path to the base
# directory) of all files matching any of the provided patterns in the provided
# base directory. Note that in findutils asterisk (`*`) matches EVERY character,
# including slashes (`/`), unlike in shells.
find_by_patterns = $(shell find $1 -type f \( $(foreach w,$2,-path '$1/$(w)' -or) -false \) -printf '%P\n')

MOD_ID := $(shell jq -r '.id' ../ccmod.json)
MOD_VERSION := $(shell jq -r '.version' ../ccmod.json)
MOD_DIR := $(MOD_ID)
TOOL_MOD_ID := $(shell jq -r '.id' ../tool/ccmod.json)
TOOL_MOD_VERSION := $(shell jq -r '.version' ../tool/ccmod.json)
TOOL_DIR := $(TOOL_MOD_ID)
ENHANCED_UI_MOD_ID := $(shell jq -r '.id' ../enhanced-ui/ccmod.json)
ENHANCED_UI_MOD_VERSION := $(shell jq -r '.version' ../enhanced-ui/ccmod.json)
ENHANCED_UI_MOD_DIR := $(ENHANCED_UI_MOD_ID)
LOCALIZE_ME_MOD_DIR := Localize-me
CC_WORLD_MAP_OVERHAUL_MOD_DIR := cc-world-map-overhaul
TRANSLATIONS_DIR := assets/ru-translation-tool

TOOL_FILES := dist/*.js dist/*.js.map dist/*.css dist/*.css.map LICENSE* main.html ccmod.json
TOOL_FILES := $(call find_by_patterns,../tool,$(TOOL_FILES))
MOD_FILES := dist/*.js dist/*.js.map LICENSE* ccmod.json README.md
MOD_FILES := $(shell jq -r '"assets/\(.assets[])"' ../ccmod.json) $(call find_by_patterns,..,$(MOD_FILES))
ENHANCED_UI_MOD_FILES := media/*.png dist/*.js dist/*.js.map LICENSE* ccmod.json
ENHANCED_UI_MOD_FILES := $(shell jq -r '"assets/\(.assets[])"' ../enhanced-ui/ccmod.json) $(call find_by_patterns,../enhanced-ui,$(ENHANCED_UI_MOD_FILES))

TRANSLATION_TOOL_DATA_DIR = assets/ru-translation-tool
TRANSLATIONS_FILES := localize-me-packs/*.json localize-me-mapping.json
TRANSLATIONS_FILES := $(call find_by_patterns,../$(TRANSLATION_TOOL_DATA_DIR),$(TRANSLATIONS_FILES))

MOD_ARCHIVE_NAME := $(MOD_ID)_v$(MOD_VERSION)
MOD_ARCHIVE_FILES := $(addprefix $(MOD_DIR)/,$(MOD_FILES) $(addprefix $(TRANSLATIONS_DIR)/,$(TRANSLATIONS_FILES)))
TOOL_ARCHIVE_NAME := $(TOOL_MOD_ID)_v$(TOOL_MOD_VERSION)
TOOL_ARCHIVE_FILES := $(addprefix $(TOOL_DIR)/,$(TOOL_FILES))
ENHANCED_UI_MOD_ARCHIVE_NAME := $(ENHANCED_UI_MOD_ID)_v$(ENHANCED_UI_MOD_VERSION)
ENHANCED_UI_MOD_ARCHIVE_FILES := $(addprefix $(ENHANCED_UI_MOD_DIR)/,$(ENHANCED_UI_MOD_FILES))

MODPACKS_COMMON_FILES := $(ENHANCED_UI_MOD_ARCHIVE_FILES) $(LOCALIZE_ME_MOD_DIR) $(CC_WORLD_MAP_OVERHAUL_MOD_DIR)
MODPACK_ARCHIVE_NAME := $(MOD_ID)_modpack_v$(MOD_VERSION)
MODPACK_ARCHIVE_FILES := $(MOD_ARCHIVE_FILES) $(MODPACKS_COMMON_FILES)
TOOL_MODPACK_ARCHIVE_NAME := $(TOOL_MOD_ID)_modpack_v$(TOOL_MOD_VERSION)
TOOL_MODPACK_ARCHIVE_FILES := $(addprefix $(MOD_DIR)/,$(MOD_FILES)) $(TOOL_ARCHIVE_FILES) $(MODPACKS_COMMON_FILES)

QUICK_INSTALL_TMP_DIR := quick-install
QUICK_INSTALL_ARCHIVE_NAME := $(MOD_ID)_quick-install_v$(MOD_VERSION)
QUICK_INSTALL_FILES := ccloader $(addprefix assets/mods/,$(MODPACK_ARCHIVE_FILES))
QUICK_INSTALL_ARCHIVE_FILES := $(addprefix $(QUICK_INSTALL_TMP_DIR)/,$(QUICK_INSTALL_FILES))

archive_names = $(addsuffix .zip,$1) $(addsuffix .tgz,$1)

ALL_ARCHIVE_NAMES_WITHOUT_FILETYPES := $(MOD_ARCHIVE_NAME) $(TOOL_ARCHIVE_NAME) $(ENHANCED_UI_MOD_ARCHIVE_NAME) $(MODPACK_ARCHIVE_NAME) $(TOOL_MODPACK_ARCHIVE_NAME)
ZIP_ARCHIVE_NAMES := $(addsuffix .zip,$(ALL_ARCHIVE_NAMES_WITHOUT_FILETYPES))
TAR_ARCHIVE_NAMES := $(addsuffix .tgz,$(ALL_ARCHIVE_NAMES_WITHOUT_FILETYPES))
QUICK_INSTALL_ARCHIVES := $(call archive_names,$(QUICK_INSTALL_ARCHIVE_NAME))
ALL_ARCHIVE_NAMES := $(ZIP_ARCHIVE_NAMES) $(TAR_ARCHIVE_NAMES) $(QUICK_INSTALL_ARCHIVES)

define download_archive
@echo "downloading" $2 "into" $1
@mkdir -p $1 && curl --max-time 10 --location --fail $2 | tar --directory $1 --gzip $4 --extract --file - $3
endef

all: $(ALL_ARCHIVE_NAMES)

clean:
	@rm -rf \
		$(ALL_ARCHIVE_NAMES) $(MOD_DIR) $(TOOL_DIR) $(LOCALIZE_ME_MOD_DIR) \
		$(CC_WORLD_MAP_OVERHAUL_MOD_DIR) $(ENHANCED_UI_MOD_DIR) \
		$(QUICK_INSTALL_TMP_DIR)

$(call archive_names,$(MOD_ARCHIVE_NAME)): $(MOD_ARCHIVE_FILES)
$(call archive_names,$(TOOL_ARCHIVE_NAME)): $(TOOL_ARCHIVE_FILES)
$(call archive_names,$(MODPACK_ARCHIVE_NAME)): $(MODPACK_ARCHIVE_FILES)
$(call archive_names,$(TOOL_MODPACK_ARCHIVE_NAME)): $(TOOL_MODPACK_ARCHIVE_FILES)
$(call archive_names,$(ENHANCED_UI_MOD_ARCHIVE_NAME)): $(ENHANCED_UI_MOD_ARCHIVE_FILES)
$(QUICK_INSTALL_ARCHIVES): $(QUICK_INSTALL_ARCHIVE_FILES)

$(ZIP_ARCHIVE_NAMES):
	@echo "packing .zip archive" $@
	@rm -rf $@ && zip --quiet --recurse-paths $@ -- $^
$(TAR_ARCHIVE_NAMES):
	@echo "packing .tgz archive" $@
	@rm -rf $@ && tar --create --file $@ --gzip -- $^

$(QUICK_INSTALL_ARCHIVE_NAME).zip:
	@echo "packing quick-install .zip archive" $@
	@rm -rf $@ && cd $(QUICK_INSTALL_TMP_DIR) && zip --quiet --recurse-paths ../$@ .
$(QUICK_INSTALL_ARCHIVE_NAME).tgz:
	@echo "packing quick-install .tgz archive" $@
	@rm -rf $@ && cd $(QUICK_INSTALL_TMP_DIR) && tar --create --file ../$@ --gzip .

$(LOCALIZE_ME_MOD_DIR):
	$(call download_archive,$@,https://github.com/L-Sherry/Localize-me/tarball/47dc03c57cabe7b6d673bd26b0f147bcd787bf61,,--strip-components=1)
$(CC_WORLD_MAP_OVERHAUL_MOD_DIR):
	$(call download_archive,$@,https://github.com/dmitmel/cc-world-map-overhaul/tarball/v1.1.0,,--strip-components=1)

$(QUICK_INSTALL_TMP_DIR)/ccloader:
	$(call download_archive,$(@D),http://stronghold.crosscode.ru/~dmitmel/ccloader3/20201114171305/ccloader_3.0.0-alpha_quick-install.tar.gz,,)

compile-translations: $(addprefix $(MOD_DIR)/$(TRANSLATIONS_DIR)/,$(TRANSLATIONS_FILES))

$(MOD_DIR)/$(TRANSLATIONS_DIR)/%.json: ../$(TRANSLATION_TOOL_DATA_DIR)/%.json
	@echo "processing tr pack:" $@
	@mkdir -p $(@D) && jq --compact-output . $< > $@
# Unfortuntately, the following file copying rules can't be merged together
$(MOD_DIR)/%: ../%
	@mkdir -p $(@D) && cp -r $< $@
$(TOOL_DIR)/%: ../tool/%
	@mkdir -p $(@D) && cp -r $< $@
$(ENHANCED_UI_MOD_DIR)/%: ../enhanced-ui/%
	@mkdir -p $(@D) && cp -r $< $@
$(QUICK_INSTALL_TMP_DIR)/assets/mods/%: %
	@mkdir -p $(@D) && cp -r $< $@

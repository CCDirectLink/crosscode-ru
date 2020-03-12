# Ascended form of CrossCode mod packaging, true old-school UNIX style.

.PHONY: all clean

# Function that returns relative paths (i.e. excluding the path to the project
# directory) of all files matching any of the provided patterns in the project
# directory
find_mod_files = $(shell find .. -type f \( $(foreach w,$1,-path '../$(w)' -or) -false \) -printf '%P\n')

MOD_ID := $(shell jq -r '.name' ../package.json)
MOD_VERSION := $(shell jq -r '.version' ../package.json)
MOD_DIR_NAME := $(MOD_ID)
LOCALIZE_ME_DIR_NAME := Localize-me

TOOL_FILES := tool/dist/*.js tool/dist/*.js.map tool/dist/*.css tool/dist/*.css.map tool/main.html
MOD_FILES := assets/*.png src/*.js LICENSE package.json postload.js prestart.js README.md $(TOOL_FILES)
MOD_FILES := $(call find_mod_files,$(MOD_FILES))

MOD_ARCHIVE_NAME := $(MOD_ID)_v$(MOD_VERSION).zip
MOD_ARCHIVE_FILES := $(addprefix $(MOD_DIR_NAME)/,$(MOD_FILES))
MODPACK_ARCHIVE_NAME := $(MOD_ID)_modpack_v$(MOD_VERSION).zip
MODPACK_ARCHIVE_FILES := $(MOD_ARCHIVE_FILES) $(LOCALIZE_ME_DIR_NAME)

all: $(MOD_ARCHIVE_NAME) $(MODPACK_ARCHIVE_NAME)

clean:
	rm -rvf $(MOD_ARCHIVE_NAME) $(MODPACK_ARCHIVE_NAME) $(MOD_DIR_NAME) $(LOCALIZE_ME_DIR_NAME)

$(MOD_ARCHIVE_NAME): $(MOD_ARCHIVE_FILES)
	rm -rvf $@
	zip -r $@ $^

$(MODPACK_ARCHIVE_NAME): $(MODPACK_ARCHIVE_FILES)
	rm -rvf $@
	zip -r $@ $^

$(MOD_DIR_NAME)/%: ../%
	mkdir -pv $(@D)
	cp -rv ../$* $(MOD_DIR_NAME)/$*

$(LOCALIZE_ME_DIR_NAME):
	mkdir -v $@
	curl -fL https://github.com/L-Sherry/Localize-me/tarball/master | \
		tar -C "$(LOCALIZE_ME_DIR_NAME)" --gzip --strip-components 1 --extract --verbose

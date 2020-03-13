# Removes all text in the source file between /* <tool> */ and /* </tool> */
# directives. This way I can put a bit of optional tool code in the mod files
# and remove it so that I don't ship it to the users.
# TODO: Consider moving all mod-code into the tool itself. Maybe even starting
#       the mod from the tool files. Or splitting the tool into another mod and
#       specifying the main one as a dependency. Anyway, this is a giant hack
#       that must be avoided.

# enable flag if a line which contains the opening directive is found
/\/\* <tool> \*\// { tool_section = 1 }
# print all lines when the flag is disabled
!tool_section { print }
# disable flag if a line which contains the closing directive is found
/\/\* <\/tool> \*\// { tool_section = 0 }

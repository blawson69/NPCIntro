# NPCIntro

First impressions are everything! This [Roll20](http://roll20.net/) script pulls select appearance-related information from NPC and monster character sheets and presents it to players as a quick rundown of their physical presence and demeanor. It is geared toward NPCs using the non-NPC character sheet, but can also be used for "monster" sheets as well. This script is for use with the [5e Shaped Sheet](http://github.com/mlenser/roll20-character-sheets/tree/master/5eShaped) and the D&D 5th Edition OGL Sheet.

Use the following command with a token representing a character selected: `!intro show`

### What is shows
NPCIntro displays the avatar along with information from the "Appearance" field of the 5e Shaped character sheet or the "Character Appearance" field on the OGL sheet. For monsters, you can choose to fall back on either the Bio or GM Notes fields for displaying information, or alternatively just add an "appearance" or "character_appearance" Attribute in the Attributes & Abilities tab and place your description there.

### Details
NPCIntro will optionally display all of the appearance-related details from the sheet that it can find: Eyes, skin, hair, height, weight, gender, and race. For monsters, it displays the size and type of the monster. If you turn details off in the config menu, this information will not be shown.

### Monster Sheets
You can use NPCIntro on a character/monster using the NPC sheet without falling back on the bio or GM notes. When you send the _show_ command for a NPC sheet, it will tell you there is no description followed by a GM-whispered dialog. Click the "Add Description" button to enter some descriptive text.

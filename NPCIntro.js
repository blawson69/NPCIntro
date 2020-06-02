/*
NPCIntro
Sends introductory information to chat for a selected NPC

On Github:	https://github.com/blawson69
Contact me: https://app.roll20.net/users/1781274/ben-l

Like this script? Become a patron:
    https://www.patreon.com/benscripts
*/

var NPCIntro = NPCIntro || (function () {
    'use strict';

    //---- INFO ----//

    var version = '1.2',
    debugMode = false,
    styles = {
        box:  'background-color: #fff; border: 1px solid #000; padding: 8px 10px; border-radius: 6px; margin-left: -40px; margin-right: 0px;',
        title: 'padding: 0 0 10px 0; color: ##591209; font-size: 1.5em; font-weight: bold; font-variant: small-caps; font-family: "Times New Roman",Times,serif;',
        button: 'background-color: #000; border-width: 0px; border-radius: 5px; padding: 5px 8px; color: #fff; text-align: center;',
        textButton: 'background-color: transparent; border: none; padding: 0; color: #591209; text-decoration: underline;',
        buttonWrapper: 'text-align: center; margin: 10px 0; clear: both;',
        details: 'border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; padding: 6px; margin: 9px 0;'
    },

    checkInstall = function () {
        if (!_.has(state, 'NPCIntro')) state['NPCIntro'] = state['NPCIntro'] || {};
        if (typeof state['NPCIntro'].desc_field == 'undefined') state['NPCIntro'].desc_field = isShapedSheet() ? 'appearance' : 'character_appearance';
        if (typeof state['NPCIntro'].fallback_field == 'undefined') state['NPCIntro'].fallback_field = 'bio';
        if (typeof state['NPCIntro'].use_fallback == 'undefined') state['NPCIntro'].use_fallback = true;
        if (typeof state['NPCIntro'].show_details == 'undefined') state['NPCIntro'].show_details = true;

        log('--> NPCIntro v' + version + ' <-- Initialized');
		if (debugMode) {
			var d = new Date();
			showDialog('Debug Mode', 'NPCIntro v' + version + ' loaded at ' + d.toLocaleTimeString() + '<br><a style=\'' + styles.textButton + '\' href="!intro config">Show config</a>', 'GM');
		}
    },


    //----- INPUT HANDLER -----//

    handleInput = function (msg) {
        if (msg.type == 'api' && msg.content.startsWith('!intro')) {
			var parms = msg.content.split(/\s+/i);
			if (parms[1]) {
				switch (parms[1]) {
					case 'show':
						if (playerIsGM(msg.playerid)) {
							commandIntro(msg);
						}
						break;
					case 'desc':
						if (playerIsGM(msg.playerid)) {
							commandUpdateDesc(msg);
						}
						break;
                    case 'config':
                    default:
						if (playerIsGM(msg.playerid)) {
							commandConfig(msg);
						}
				}
			}
		}
    },

    commandIntro = function (msg) {
        var message = '', parms = msg.content.split(/\s*\-\-/i);
        if (_.size(msg.selected) != 1) {
            showDialog('Intro Error', 'You must have a token selected.', 'GM');
            return;
        }

        var token = getObj(msg.selected[0]._type, msg.selected[0]._id);
        if (token) {
            var npc = getNPCChar(token.get('represents'));
            var anon = msg.content.search(/\-\-anon/i) != -1;
            if (npc) {
                var url = '',  race = '', gender = '', height = '', weight = '', eyes = '', skin = '', hair = '', size = '', type = '';

                url = npc.get('avatar').split('?')[0];
                race = getAttrByName(npc.get('id'), 'race') || '';
                height = getAttrByName(npc.get('id'), 'height') || '';
                weight = getAttrByName(npc.get('id'), 'weight') || '';
                eyes = getAttrByName(npc.get('id'), 'eyes') || '';
                skin = getAttrByName(npc.get('id'), 'skin') || '';
                hair = getAttrByName(npc.get('id'), 'hair') || '';
                size = getAttrByName(npc.get('id'), 'size') || '';
                gender = getAttrByName(npc.get('id'), 'gender') || '';
                if (isShapedSheet()) {
                    type = getAttrByName(npc.get('id'), 'type') || '';
                } else {
                    var npc_type = getAttrByName(npc.get('id'), 'npc_type') || '';
                    var tmp_type = npc_type.split(/,\s+/)[0];
                    if (size == '') size = tmp_type.split(/\s+/)[0];
                    type = _.reject(tmp_type.split(/\s+/), function (x) { return x.toLowerCase() == size.toLowerCase(); }).join(' ');
                }

                var header = isNPCSheet(npc.get('id')) ? 'Creature' : 'Individual';
                message += '<i><img style="width: 250px;" width="250" src="' + url + '" alt="No avatar found!" /></i>';
                if ((gender != '' || race != '' || height != '' || weight != '' || eyes != '' || skin != '' || hair != '' || size != ''|| type != '') && state['NPCIntro'].show_details) {
                    message += '<div style="' + styles.details + '">';
                    if (size != '' && !isNPCSheet(npc.get('id')) && anon) message += '<b>Size:</b> ' + initCap(size) + '<br>';
                    if (gender != '' && !anon) message += '<b>Gender:</b> ' + initCap(gender) + '<br>';
                    if (race != '' && !anon) message += '<b>Race:</b> ' + initCap(race) + '<br>';
                    if (height != '' && !anon) message += '<b>Height:</b> ' + height + '<br>';
                    if (weight != '' && !anon) message += '<b>Weight:</b> ' + weight + '<br>';
                    if (eyes != '') message += '<b>Eyes:</b> ' + initCap(eyes) + '<br>';
                    if (skin != '') message += '<b>Skin:</b> ' + initCap(skin) + '<br>';
                    if (hair != '') message += '<b>Hair:</b> ' + initCap(hair) + '<br>';
                    if (isNPCSheet(npc.get('id'))) message += '<i>' + initCap(size) + ' ' + (anon ? header.toLowerCase() : type) + '</i><br>';
                    message += '</div>';
                }

                var desc = getAttrByName(npc.get('id'), state['NPCIntro'].desc_field) || '';
                desc = desc.replace(/\n/g, '<br>');

                if (desc == '' && state['NPCIntro'].use_fallback) {
                    if (state['NPCIntro'].fallback_field == 'desc' || state['NPCIntro'].fallback_field == 'gmnotes') {
                        npc.get(state['NPCIntro'].fallback_field, function (text) {
                            desc = text.trim();
                        });
                    } else {
                        desc = getAttrByName(npc.get('id'), state['NPCIntro'].fallback_field) || '';
                        desc = desc.replace(/\n/g, '<br>');
                    }
                }
                message += (desc != '' ? desc : '<p><i>No description available.</i></p>');

                showDialog((anon ? 'Unknown ' + header : npc.get('name')), message);

                if (!desc) {
                    message = 'No appearance field was found for ' + npc.get('name') + '. Would you like to create one?';
                    message += '<div style=\'' + styles.buttonWrapper + '\'><a style=\'' + styles.button + '\' href="!intro desc ' + npc.get('id') + ' ?{Enter Description|}">Add Description</a></div>';
                    showDialog('', message, 'GM');
                }
            } else showDialog('Intro Error', 'Character was not an NPC.', 'GM');
        } else showDialog('Intro Error', 'You must have a valid token selected.', 'GM');
    },

    getNPCChar = function (char_id) {
        var char = getObj('character', char_id);
        if (char && char.get('controlledby') == '') {
            return char;
        } else return false;
    },

    isNPCSheet = function (char_id) {
        return (isShapedSheet() ? getAttrByName(char_id, 'is_npc') == '1' : getAttrByName(char_id, 'npc') == '1');
    },

    commandUpdateDesc = function (msg) {
        var message = '',
        char_id = msg.content.split(/\s+/i)[2],
        desc = msg.content.replace('!intro desc ' + char_id, '').trim();
        var char = getObj('character', char_id);
        if (char) {
            var field = findObjs({ type: 'attribute', characterid: char_id, name: state['NPCIntro'].desc_field })[0];
            if (!field) field = createObj("attribute", {characterid: char_id, name: state['NPCIntro'].desc_field, current: desc});
            field.set({current: desc});
            message = 'The following description was added to ' + char.get('name') + ':<br>' + desc;
            message += '<div style=\'' + styles.buttonWrapper + '\'><a style=\'' + styles.button + '\' href="!intro desc ' + char.get('id') + ' ?{Enter Description|' + desc + '}">Edit Description</a></div>';
            showDialog('Description Updated', message, 'GM');
        } else showDialog('Description Error', 'Character ID not valid.', 'GM');
    },

    commandConfig = function (msg) {
        var message = '', parms = msg.content.replace('!intro config ', '').split(/\s+/i);
        if (parms[0]) {
            if (parms[0] == 'fallback' && parms[1] && parms[1] != '') state['NPCIntro'].fallback_field = (parms[1] == 'bio') ? 'bio' : 'gmnotes';
            if (parms[0] == 'toggle-fallback') state['NPCIntro'].use_fallback = !state['NPCIntro'].use_fallback;
            if (parms[0] == 'toggle-details') state['NPCIntro'].show_details = !state['NPCIntro'].show_details;
        }

        message += '<div style=\'' + styles.title + '\'>Fallback Field: ' + (state['NPCIntro'].use_fallback ? 'On' : 'Off') + '</div>';
        message += 'NPCIntro is using the ' + (state['NPCIntro'].desc_field == 'appearance' ? '' : 'Character ') + 'Appearance field from the character sheet for appearance description';
        if (state['NPCIntro'].use_fallback) {
            message += '.<br><br>Your fall back field is: <a style=\'' + styles.textButton + '\' ' + (state['NPCIntro'].fallback_field == 'bio' ? 'href="!intro config fallback gmnotes" title="Change to GM Notes">Character Bio' : 'href="!intro config fallback bio" title="Change to Character Bio">GM Notes') + '</a>.';
            message += '<div style=\'' + styles.buttonWrapper + '\'><a style=\'' + styles.button + '\' href="!intro config toggle-fallback">Disable Fallback</a></div>';
        } else {
            message += ', but is not using a fallback field. You will need to add ' + (state['NPCIntro'].desc_field == 'appearance' ? 'an &quot;' : 'a &quot;character_') + 'appearance&quot; Attribute.<div style=\'' + styles.buttonWrapper + '\'><a style=\'' + styles.button + '\' href="!intro config toggle-fallback">Enable Fallback</a></div>';
        }

        message += '<hr><div style=\'' + styles.title + '\'>Show Details: ' + (state['NPCIntro'].show_details ? 'On' : 'Off') + '</div>';
        message += 'Appearance details such as height, weight, eye color, hair color, etc. will ' + (state['NPCIntro'].show_details ? '' : 'not ') + 'be shown. <a style=\'' + styles.textButton + '\' href="!intro config toggle-details">change</a>';
        showDialog('', message, 'GM');
	},

    showDialog = function (title, content, whisperTo = '') {
        // Outputs a pretty box in chat with a title and content
        var gm = /\(GM\)/i;
        title = (title == '') ? '' : '<div style=\'' + styles.title + '\'>' + title + '</div>';
        var body = '<div style=\'' + styles.box + '\'>' + title + '<div>' + content + '</div></div>';
        if (whisperTo.length > 0) {
            whisperTo = '/w ' + (gm.test(whisperTo) ? 'GM' : '"' + whisperTo + '"') + ' ';
            sendChat('NPCIntro', whisperTo + body, null, {noarchive:true});
        } else  {
            sendChat('NPCIntro', body);
        }
    },

    // Capitalizes the first letter of each word in a string
    initCap = function (str) {
        var new_words = [], words = str.split(/\s+/g);
        _.each(words, function (word) {
            var letters = word.toLowerCase().split('');
            letters[0] = letters[0].toUpperCase();
            new_words.push(letters.join(''));
        });
        return new_words.join(' ');
    },

    isShapedSheet = function () {
        var is_shaped = false, char = findObjs({type: 'character'})[0];
        if (char) {
            var charAttrs = findObjs({type: 'attribute', characterid: char.get('id')}, {caseInsensitive: true});
            if (_.find(charAttrs, function (x) { return x.get('name') == 'character_sheet' && x.get('current').search('Shaped') != -1; })) is_shaped = true;
        }
        return is_shaped;
    },

    //---- PUBLIC FUNCTIONS ----//

    registerEventHandlers = function () {
		on('chat:message', handleInput);
	};

    return {
		checkInstall: checkInstall,
		registerEventHandlers: registerEventHandlers
	};
}());

on("ready", function () {
    NPCIntro.checkInstall();
    NPCIntro.registerEventHandlers();
});

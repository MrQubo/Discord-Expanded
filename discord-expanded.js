(function () {
'use strict';

const VERSION = '0.0.1';

function debug() { }
/* function debug(...args) {
 *     console.log('[Discord Expanded Debug]', ...args);
 * } */

function log(...args) {
	console.log('[Discord Expanded]', ...args);
}

function error(...args) {
	console.error('[Discord Expanded]', ...args);
}

try {

async function sleep(time) {
	if (time <= 0) { return; }
	return new Promise(resolve => {
		setTimeout(() => resolve(), time);
	});
}

class Webpack_Hack {
	constructor({ global, webpack_load_module }) {
		this._global = global;
		this._webpack_load_module = webpack_load_module;
	}

	_load_module_by_id(id) {
		return this._webpack_load_module(id);
	}

	_find_module_id_by_code_fragment(code) {
		for (const file of this._global.webpackJsonp) {
			for (const id in file[1]) {
				const module_constructor = file[1][id];
				// xD
				if (module_constructor.toString().includes(code)) {
					return id;
				}
			}
		}
		return undefined;
	}

	load_module_by_code_fragment(code) {
		const id = this._find_module_id_by_code_fragment(code);
		if (id === undefined) {
			error('code fragment not found', code);
			return;
		}
		return this._load_module_by_id(id);
	}

	async load_module_by_code_fragment_or_wait(code) {
		let module;
		const try_load = () => {
			const id = this._find_module_id_by_code_fragment(code);
			if (id !== undefined) {
				module = this._load_module_by_id(id);
				return true;
			}
			return false;
		};

		for (let i = 0; i < 20; i += 1) {
			if (try_load()) { return module; }
			await sleep(200);
		}
		for (let i = 0; i < 10; i += 1) {
			if (try_load()) { return module; }
			await sleep(1000);
		}
		await sleep(10000);
		if (try_load()) { return module; }
		error('code fragment not found', code);
	}
}

class User_Store {
	constructor({ react_user_store }) {
		this._user_store = react_user_store.default;
	}

	find_folder(folder_id) {
		return this.find_folder_by_id(folder_id);
	}

	find_folder_by_id(id) {
		const folders = this._user_store.guildFolders;
		return folders.find(o => o.folderId !== undefined && o.folderId === id);
	}

	all_guild_ids() {
		return this._user_store.guildPositions;
	}
}

class React_Utils {
	constructor({ menu }) {
		this._menu = menu;
	}

	element({ type, props }) {
		return {
			$$typeof: Symbol.for('react.element'),
			type,
			key: null,
			ref: null,
			props,
			_owner: null,
		};
	}

	Menu_Group(props) {
		return this.element({ type: this._menu.MenuGroup, props });
	}

	Menu_Item(props) {
		return this.element({ type: this._menu.MenuItem, props });
	}
}

class Mute_Utils {
	constructor({ date, guild_notifications, user_store }) {
		this._date = date;
		this._guild_notifications = guild_notifications.default;
		this._user_store = user_store;
	}

    /* mute_all({ duration, except_guilds = [], except_folders = [] }) {
	 *     if (! (except_guilds instanceof Set)) {
	 *         except_guilds = new Set(except_guilds);
	 *     }
	 *     if (! (except_folders instanceof Set)) {
	 *         except_folders = new Set(except_folders);
	 *     }
	 *
	 *     this._mute_all({ except_guilds, except_folders, duration });
	 * }
	 *
	 * _mute_all({ duration, except_guilds = [], except_folders = [] }) {
	 *     const $guilds = document.querySelector('div[aria-label=Servers]');
	 *     this._mute_list({ list: $guilds.children, duration, except_guilds, except_folders });
	 * }
	 *
	 * _mute_list({ list, duration, except_guilds = [], except_folders = [] }) {
	 *     for (const $guild_or_folder of list) {
	 *         $maybe_folder_items = $guild_or_folder.querySelector('ul[role=group][id^=folder-items]');
	 *         if (!$maybe_folder_items) {
	 *             const $guild = $guild_or_folder;
	 *             this._mute_guild({ $guild, duration, except_guilds });
	 *         } else {
	 *             const $folder = $guild_or_folder;
	 *             const $folder_items = $maybe_folder_items;
	 *             this._mute_folder({ $folder, $folder_items, duration, except_guilds, except_folders });
	 *         }
	 *     }
	 * }
	 *
	 * _mute_guild({ $guild, duration, except_guilds }) {
	 *     const $guildsnav = $guild.querySelector('div[role=treeitem][data-list-item-id^=guildsnav]');
	 *     const guild_name = $guild.getAttribute('aria-label').trim();
	 *     if (except_guilds.has(guild_name)) { return; }
	 *     const guild_id = $guild.getAttribute('data-list-item-id').split('_').pop();
	 *     if (except_guilds.has(guild_id)) { return; }
	 *     if (except_guilds.has(parseInt(guild_id, 0))) { return; }
	 *
	 *     this._really_mute_guild({ guild_id, duration });
	 * }
	 *
	 * _really_mute_guild({ guild_id, duration }) {
	 *     const args = {
	 *         muted: true,
	 *         mute_config: {
	 *             selected_time_window: duration,
	 *             end_time: this._date().add(duration, 'second').toISOString(),
	 *         },
	 *     };
	 *     this._guild_notifications.updateGuildNotificationSettings(guild_id, args);
     * } */

	mute_all({ duration = -1 } = {}) {
		const guild_ids = this._user_store.all_guild_ids();
		for (const guild_id of guild_ids) {
			this.mute_guild({ guild_id, duration });
		}
	}

	unmute_all() {
		const guild_ids = this._user_store.all_guild_ids();
		for (const guild_id of guild_ids) {
			this.unmute_guild({ guild_id });
		}
	}

	mute_folder({ folder_id, duration = -1 }) {
		const folder = this._user_store.find_folder(folder_id);
		const guild_ids = folder.guildIds;
		for (const guild_id of guild_ids) {
			this.mute_guild({ guild_id, duration });
		}
	}

	unmute_folder({ folder_id }) {
		const folder = this._user_store.find_folder(folder_id);
		const guild_ids = folder.guildIds;
		for (const guild_id of guild_ids) {
			this.unmute_guild({ guild_id });
		}
	}

	mute_guild({ guild_id, duration = -1 }) {
		const args = { muted: true };
		if (duration >= 0) {
			args.mute_config = {
				selected_time_window: duration,
				end_time: this._date().add(duration, 'second').toISOString(),
			};
		};
		this._guild_notifications.updateGuildNotificationSettings(guild_id, args);
	}

	unmute_guild({ guild_id }) {
		const args = { muted: false };
		this._guild_notifications.updateGuildNotificationSettings(guild_id, args);
	}
}

class Patcher {
	constructor({ discord_expanded, react_utils, webpack_hack, mute_utils }) {
		this._discord_expanded = discord_expanded;
		this._react_utils = react_utils;
		this._webpack_hack = webpack_hack;
		this._mute_utils = mute_utils;
	}

	_patch_react_type(display_name, new_type_constructor) {
		const module = this._webpack_hack.load_module_by_code_fragment(`.displayName="${display_name}"`);
		if (!('orig_react_types' in this._discord_expanded)) {
			this._discord_expanded.orig_react_types = {};
		}
		const orig_react_types = this._discord_expanded.orig_react_types;
		if (!(display_name in orig_react_types)) {
			orig_react_types[display_name] = module.default;
		}
		const orig_type = orig_react_types[display_name];
		module.default = new_type_constructor.bind(this, orig_type);
	}

	_patch_guild_folder_context_menu() {
		this._patch_react_type('GuildFolderContextMenu', (orig_Guild_Folder_Context_Menu, props) => {
			const folder_id = props.folderId;
			const react_menu = orig_Guild_Folder_Context_Menu(props);
			const folder_mute_react_menu_group = this._react_utils.Menu_Group({
				children: [
					this._react_utils.Menu_Item({
						'id': 'folder-mute-all',
						'label': 'Mute All Servers',
						action: () => {
							this._mute_utils.mute_folder({ folder_id });
						},
					}),
					this._react_utils.Menu_Item({
						'id': 'folder-unmute-all',
						'label': 'Unmute All Servers',
						action: () => {
							this._mute_utils.unmute_folder({ folder_id });
						},
					}),
				],
			});
			react_menu.props.children.splice(-1, 0, folder_mute_react_menu_group);
			return react_menu;
		});
	}

	apply_patches() {
		this._patch_guild_folder_context_menu();
	}
}

function on_dom_loaded(cb) {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', cb, { passive: true });
	} else {
		cb();
	}
}

async function discord_expanded_main({ global, webpack_load_module }) {
	const discord_expanded = global.discord_expanded;
	discord_expanded.VERSION = VERSION;
	log(VERSION);

	const webpack_hack = new Webpack_Hack({
		global,
		webpack_load_module,
	});
	const user_store = new User_Store({
		react_user_store: await webpack_hack.load_module_by_code_fragment_or_wait('guildPositions:[],guildFolders:[]'),
	});
	const mute_utils = new Mute_Utils({
		date: await webpack_hack.load_module_by_code_fragment_or_wait('.toISOString=function('),
		guild_notifications: await webpack_hack.load_module_by_code_fragment_or_wait('updateGuildNotificationSettings:function('),
		user_store,
	});
	const react_utils = new React_Utils({
		menu: await webpack_hack.load_module_by_code_fragment_or_wait('.displayName="Menu"'),
	});
	const patcher = new Patcher({
		discord_expanded,
		webpack_hack,
		react_utils,
		mute_utils,
	});

	// Add to global context for easy access from console.
	discord_expanded.mute_utils = mute_utils;

	on_dom_loaded(() => {
		patcher.apply_patches();
		debug('loaded');
	});
}

function webpack_hack_main(global, _e, _t, webpack_load_module) {
	'use strict';
	discord_expanded_main({ global, webpack_load_module });
}

function load_common(global) {
	// Use `webpackJsonp.push()` to load our code as webpack module.
	if (!('discord_expanded' in global)) {
		global.discord_expanded = { reload_n: 0 };
	}
	const reload_n = global.discord_expanded.reload_n;
	(global.webpackJsonp = global.webpackJsonp || []).push([
		[0],
		{ [reload_n+31337]: webpack_hack_main.bind(null, global) },
		[[reload_n+31337, reload_n]],
	]);
	global.discord_expanded.reload_n += 1;
}

function load_from_electron() {
	const electron = require('electron');
	load_common(electron.webFrame.top.context);
}

function load_from_browser() {
	load_common(globalThis);
}

debug('loading...');
if (typeof require !== 'undefined') {
	load_from_electron();
} else {
	load_from_browser();
}

} catch (err) {
	error(err);
	throw err;
}

})();

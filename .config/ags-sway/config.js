import {
	workspaces_widget,
	active_window_title,
	input_language_indicator,
	binding_mode_indicator,
	clock_widget,
	system_tray,
	separator,
} from "./widgets/basic-widgets.js";
import {
	quick_settings_menu,
	quick_settings_toggle,
} from "./widgets/quick-settings.js";
import { osd } from "./widgets/osd.js";
import { applauncher, launcherRevealer } from "./widgets/applauncher.js";
import { Dock } from "./widgets/dock.js";

// Top Bar
function Bar(monitor) {
	return Widget.Window({
		monitor,
		name: `Bar-${monitor}`,
		anchor: ["left", "top", "right"],
		exclusivity: "exclusive",
		class_name: "bar",
		child: Widget.CenterBox({
			start_widget: Widget.Box({
				children: [workspaces_widget(), active_window_title()],
			}),
			end_widget: Widget.Box({
				children: [
					binding_mode_indicator(),
					separator(),
					clock_widget(),
					separator(),
					input_language_indicator(),
					separator(),
					system_tray(),
					quick_settings_toggle(monitor),
				],
				hpack: "end",
				class_name: "system",
			}),
		}),
	});
}

const launcher = launcherRevealer(false);
globalThis.launcher = launcher;

App.config({
	windows: [
		Bar(0),
		quick_settings_menu(0),
		osd("brightness", 0),
		osd("audio", 0),
		launcher,
		// applauncher(),
		// Dock(0),
	],
	style: "./style.css",
	// gtkTheme: 'Yaru-olive-dark',
});

App.closeWindow(`quick-settings-0`);
App.closeWindow(`brightness-osd-0`);
App.closeWindow(`audio-osd-0`);

export { };

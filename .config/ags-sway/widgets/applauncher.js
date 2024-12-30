const apps = await Service.import("applications");

function appitem(app) {
	return Widget.Button({
		name: app.name,
		on_clicked: app.launch,
		class_name: "app_item",
		child: Widget.Box({
			children: [
				Widget.Icon({ class_name: "app_icon", icon: app.iconName }),
				Widget.Label({ label: app.name }),
			],
		}),
	});
}

function launcherWidget() {
	const list = Widget.Box({
		vertical: true,
		children: apps.list.map(appitem),
	});
	const filterSearch = (keyword) => {
		list.children.forEach(
			(app) =>
				(app.visible = app.name.toLowerCase().match(keyword.toLowerCase())),
		);
	};

	const entry = Widget.Entry({
		class_name: "search_entry",
		placeholderText: "Search Apps",
		on_change: ({ text }) => filterSearch(text),
	});
	return Widget.Box({
		class_name: "applauncher",
		vertical: true,
		children: [
			entry,
			Widget.Scrollable({
				vexpand: true,
				vscroll: "always",
				hscroll: "never",
				child: list,
			}),
		],
		setup: (self) => {
			self.hook(App, () => {
				list.children = apps.query("").map(appitem);
				entry.text = "";
				if (self.visible) {
					entry.grab_focus();
					// self.class_name = "applauncher visible";
				} else {
					self.margins = [0, 100, 0, 0];
					// self.class_name = "applauncher hidden";
				}
			});
			self.keybind("Escape", () => (self.margins = [0, 500, 0, 0]));
			// self.keybind("Escape", () => (self.visible = false));
		},
	});
}

export function applauncher() {
	return Widget.Window({
		// visible: false,
		name: "applauncher",
		class_name: "applauncher_window",
		css: "background: transparent",
		keymode: "on-demand",
		anchor: ["top", "left", "bottom"],
		margins: [0, 0, 0, 0],
		child: launcherWidget(),
	});
}

export function launcherRevealer(show) {
	return Widget.Window({
		name: "launcherRevealer",
		anchor: ["left", "top", "bottom"],
		child: Widget.Revealer({
			child: launcherWidget(),
			transition: "slide_left",
			transitionDuration: 300,
			revealChild: false,
		}),
	});
}

const battery = await Service.import("battery");
const network = await Service.import("network");
const audio = await Service.import("audio");
const systemtray = await Service.import("systemtray");
const hyprland = await Service.import("hyprland");

// Functions to open and close windows with fade-in/out animations
function showWindow(window_name) {
  App.openWindow(window_name);
}

function hideWindow(window_name) {
  setTimeout(() => App.closeWindow(window_name), 150);
}

const time = Variable("", {
  poll: [
    1000,
    () => {
      const f = (d) =>
        d.toLocaleString("en-US", {
          minimumIntegerDigits: 2,
          useGrouping: false,
        });
      const weekday = (i) => {
        const weekdays = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thusday",
          "Friday",
          "Saturday",
        ];
        return weekdays[i];
      };
      const getMonth = (m) => m.toLocaleString("default", { month: "long" });
      const d = new Date();
      return `${weekday(d.getDay())} ${f(d.getDate())} ${getMonth(d)} ${f(d.getFullYear())} ${f(d.getHours())}:${f(d.getMinutes())}`;
    },
  ],
});
// Workspaces widget
function workspaces_widget(monitor) {
  const workspace_buttons = [];
  const active_workspace_id = hyprland.active.workspace.bind("id");

  for (let i = 1; i < 11; i++) {
    const mws = i + monitor * 10 // Workspace related to a current monitor in focus
    const button = Widget.Button({
      child: Widget.Label({ label: `${i}` }),
      on_clicked: () => hyprland.messageAsync(`dispatch workspace ${mws}`),
      class_name: active_workspace_id.as((id) =>
        id === mws ? "ws active" : "ws passive",
      ),
    });
    workspace_buttons.push(button);
  }

  return Widget.Box({ children: workspace_buttons });
}

// Title of the active window widget
function active_window_title() {
  return Widget.Box({
    class_name: "active_window",
    children: [
      Widget.Icon({ icon: hyprland.active.client.bind("class") }),
      Widget.Label({
        label: hyprland.active.client.bind("title"),
        class_name: "active_window_title",
      }),
    ],
  });
}

//Battery indicator
function battery_indicator() {
  const battery_icon = Widget.Icon({
    icon: battery.bind("icon_name"),
    class_name: battery
      .bind("charging")
      .as((ch) => (ch ? "battery_icon charging" : "battery_icon")),
  });
  const battery_percentage = Widget.Label({
    label: battery.bind("percent").as((p) => `${Math.round(p)}%`),
    class_name: "indicator_label_battery",
  });
  return Widget.Box({ children: [battery_icon, battery_percentage] });
}

// Clock Widget
const clock_widget = () => Widget.Label({ label: time.bind() });

// Network Indicator
function network_indicator() {
  const wifi = Widget.Box({
    children: [
      Widget.Icon({ icon: network.wifi.bind("icon_name") }),
      Widget.Label({
        label: network.wifi.bind("ssid").as((ssid) => ssid || "Unknown"),
        class_name: "indicator_label",
      }),
    ],
  });
  const wired = Widget.Icon({ icon: network.wired.bind("icon_name") });
  return Widget.Stack({
    children: { wifi, wired },
    shown: network.bind("primary").as((p) => p || "wifi"),
  });
}

// Volume Indicator
function volume_indicator(type, label) {
  const volume_label = Widget.Label({
    label: audio[type].bind("volume").as((v) => `${Math.trunc(v * 100)}%`),
    class_name: "indicator_label",
  });
  const icon = Widget.Icon().hook(audio[type], (self) => {
    const volume = audio[type].volume * 100;
    const icon_type_speaker = [
      [101, "overamplified"],
      [67, "high"],
      [34, "medium"],
      [1, "low"],
      [0, "muted"],
    ].find(([threshold]) => Number(threshold) <= volume)?.[1];
    const icon_type_mic = [
      [67, "high"],
      [34, "medium"],
      [1, "low"],
      [0, "muted"],
    ].find(([threshold]) => Number(threshold) <= volume)?.[1];

    self.tooltip_text = `${Math.trunc(volume)}%`;
    self.icon =
      type === "speaker"
        ? `audio-volume-${icon_type_speaker}-symbolic`
        : `audio-input-microphone-${icon_type_mic}-symbolic`;
  });
  return label ? Widget.Box({ children: [icon, volume_label] }) : icon;
}

// System Tray
function system_tray() {
  const systray = (item) =>
    Widget.Button({
      child: Widget.Icon().bind("icon", item, "icon"),
      tooltipMarkup: item.bind("tooltip_markup"),
      onPrimaryClick: (_, event) => item.activate(event),
      onSecondaryClick: (_, event) => item.openMenu(event),
    });
  const systray_items = systemtray.bind("items");
  return Widget.Box({
    children: systray_items.as((i) => i.map(systray)),
    class_name: systray_items.as((items) =>
      items.length ? "system_tray" : "system_tray empty",
    ),
  });
}

function separator() {
  return Widget.Separator({
    vertical: false,
    class_name: "separator",
  });
}

export {
  showWindow,
  hideWindow,
  workspaces_widget,
  active_window_title,
  battery_indicator,
  clock_widget,
  network_indicator,
  volume_indicator,
  system_tray,
  separator,
};

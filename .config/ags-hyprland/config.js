const hyprland = await Service.import("hyprland");
const battery = await Service.import("battery");
const network = await Service.import("network");
const audio = await Service.import("audio");
const systemtray = await Service.import("systemtray");
import { 
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
 } from './widgets/basic-widgets.js'
import { quick_settings_menu, quick_settings_toggle } from "./widgets/quick-settings.js";

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
        children: [workspaces_widget(monitor), active_window_title()],
      }),
      end_widget: Widget.Box({
        children: [clock_widget(), system_tray(), quick_settings_toggle(monitor)],
        hpack: "end",
        class_name: "system",
      }),
    }),
  });
}

const monitorWidgets = []
for(let i = 0; i < hyprland.monitors.length; i++) {
  monitorWidgets.push(Bar(i))
  monitorWidgets.push(quick_settings_menu(i))
}

App.config({
  windows: monitorWidgets,
  style: "./style.css",
  // gtkTheme: 'Yaru-olive-dark',
});

for(let i = 0; i < hyprland.monitors.length; i++) App.closeWindow(`quick-settings-${i}`);

export { };

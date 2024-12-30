import {
  battery_indicator,
  network_indicator,
  volume_indicator,
  separator,
  brightness_indicator,
  showWindow,
  hideWindow,
} from "./basic-widgets.js";
import brightness from "../services/brightness.js";
const audio = await Service.import("audio");

// Quick settings menu
function quick_settings_menu(monitor) {
  const volume_slider = (type) => {
    return Widget.Box({
      children: [
        volume_indicator(type, true),
        Widget.Slider({
          hexpand: true,
          draw_value: false,
          onChange: ({ value }) => {
            audio[type].volume = value;
          },
          value: audio[type].bind("volume"),
        }),
      ],
    });
  };

  const brightness_slider = () => {
    const slider = Widget.Slider({
      min: 0,
      max: 100,
      draw_value: false,
      hexpand: true,
      on_change: (self) => (brightness.screen_value = self.value),
      value: brightness.bind("screen_value").as((v) => Math.round(v * 100)),
    });
    return Widget.Box({
      children: [brightness_indicator(), slider],
      css: "min-width: 180px",
    });
  };

  const session_button = (type) => {
    let command = "",
      icon = "",
      tooltip = "";
    switch (type) {
      case "power_off":
        command = "systemctl poweroff";
        icon = "system-shutdown-symbolic";
        tooltip = "Shut Down";
        break;
      case "suspend":
        command = "systemctl suspend";
        icon = "night-light-symbolic";
        tooltip = "Sleep";
        break;
      case "log_out":
        command = "loginctl terminate-session $XDG_SESSION_ID";
        icon = "system-log-out-symbolic";
        tooltip = "Logout";
        break;
      case "restart":
        command = "systemctl reboot";
        icon = "system-reboot-symbolic";
        tooltip = "Restart";
        break;
      case "lock":
        command = "loginctl lock-session";
        icon = "lock-symbolic";
        tooltip = "Lock Screen";
        break;
    }
    return Widget.Button({
      class_name: "session_button",
      on_primary_click: () => Utils.execAsync(command),
      child: Widget.Icon({ icon }),
      tooltip_text: tooltip,
    });
  };

  const widget = Widget.Box({
    vertical: true,
    children: [
      volume_slider("speaker"),
      volume_slider("microphone"),
      brightness_slider(),
      Widget.CenterBox({
        center_widget: Widget.Box({
          class_name: "session_buttons",
          children: [
            session_button("log_out"),
            separator(),
            session_button("lock"),
            separator(),
            session_button("suspend"),
            separator(),
            session_button("restart"),
            separator(),
            session_button("power_off"),
          ],
        }),
      }),
    ],
    class_name: "quicksettings",
  });

  return Widget.Window({
    name: `quick-settings-${monitor}`,
    anchor: ["top", "right"],
    margins: [20, 20],
    exclusivity: "normal",
    child: widget,
    class_name: "window_widget quicksettings_window",
  });
}

function quick_settings_toggle(monitor) {
  let toggled = Variable(false);
  const toggle = Widget.ToggleButton({
    hexpand: true,
    vexpand: true,
    class_name: toggled
      .bind()
      .as((val) =>
        val ? "quicksettings_toggle active" : "quicksettings_toggle",
      ),
    onToggled: ({ active }) => {
      toggled.value = active;
      const togglefunc = active ? showWindow : hideWindow;
      togglefunc(`quick-settings-${monitor}`);
      // App.toggleWindow(`quick-settings-${monitor}`);
    },
    child: Widget.Box({
      children: [
        network_indicator(),
        separator(),
        volume_indicator("speaker"),
        separator(),
        volume_indicator("microphone"),
        separator(),
        battery_indicator(),
      ],
    }),
  });
  return toggle;
}
export { quick_settings_menu, quick_settings_toggle };

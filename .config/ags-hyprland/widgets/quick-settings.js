import {
  battery_indicator,
  network_indicator,
  volume_indicator,
  separator,
  showWindow,
  hideWindow,
} from "./basic-widgets.js";

const audio = await Service.import("audio");
// Quick settings menu
function quick_settings_menu(monitor) {
  const volume_slider = (type) =>
    Widget.Box({
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

  const brightness_slider = (monitor) => {
    const current_level = !monitor
      ? Number(Utils.exec("brightnessctl get"))
      : Number(Utils.exec("ddcutil getvcp 10 -t").split(' ')[3]);
    console.log(`current level on monitor ${monitor} is:`, current_level)
    const max_level = !monitor ? Number(Utils.exec("brightnessctl max")) : 100;
    const current_value = Variable(
      !monitor ? Math.trunc((current_level / max_level) * 100) : current_level,
    );
    const label = Widget.Label({
      label: current_value.bind().as((v) => `${v}%`),
      class_name: "indicator_label",
    });
    const icon = Widget.Icon({ icon: "display-brightness-symbolic" });
    const slider = Widget.Slider({
      min: 0,
      max: 100,
      value: current_value.bind(),
      draw_value: false,
      hexpand: true,
      onChange: ({ value }) => {
        const rounded = Math.trunc(value);
        if (!monitor) Utils.execAsync(`brightnessctl set ${rounded}%`);
        else Utils.execAsync(`ddcutil setvcp 10 ${rounded}`)
        current_value.value = rounded;
      },
    });
    return Widget.Box({
      children: [Widget.Box({ children: [icon, label] }), slider],
      css: "min-width: 180px;",
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
        command = "loginctk lock-session";
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
      brightness_slider(monitor),
      Widget.CenterBox({
        center_widget: Widget.Box({
          class_name: "session_buttons",
          children: [
            session_button("log_out"),
            session_button("lock"),
            session_button("suspend"),
            session_button("restart"),
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
    class_name: "quicksettings_window",
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

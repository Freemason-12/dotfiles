const audio = await Service.import("audio");
const timeout = Variable("");
import brightness from "../services/brightness.js";
import sway from "../services/sway.js";
import {
  brightness_indicator,
  volume_indicator,
  showWindow,
  hideWindow,
} from "./basic-widgets.js";

// OSD - On Screen Display: shows brightness or volume when changed by a shortcut
function osd(type, monitor) {
  const osdhook = (type) => {
    const regex =
      type === "audio" ? /"symbol": "XF86Audio/ : /"symbol": "XF86Mon/;
    const audio_name = `audio-osd-${monitor}`;
    const brightness_name = `brightness-osd-${monitor}`;
    const own = type === "audio" ? audio_name : brightness_name;
    const notown = type === "audio" ? brightness_name : audio_name;
    return (self) =>
      self.hook(
        sway,
        function (self, binding) {
          if (regex.test(binding)) {
            self.class_name = "visible";
            hideWindow(notown);
            showWindow(own);
            clearTimeout(timeout.value);
            timeout.value = setTimeout(() => {
              self.class_name = "hidden";
              hideWindow(own);
            }, 1500);
          }
        },
        "binding-executed",
      );
  };
  const progress = Widget.ProgressBar({
    hexpand: true,
    vexpand: true,
    class_name: "osd-progress",
    value:
      type === "audio"
        ? audio.speaker.bind("volume")
        : brightness.bind("screen-value"),
  });
  return Widget.Window({
    layer: "overlay",
    anchor: ["bottom"],
    margins: [0, 0, 300, 0],
    css: "background: transparent;",
    class_name: "window_widget",
    name:
      type === "audio" ? `audio-osd-${monitor}` : `brightness-osd-${monitor}`,
    child: Widget.Box({
      class_name: "osd",
      children: [
        type === "audio"
          ? volume_indicator("speaker", true)
          : brightness_indicator(),
        progress,
      ],
    }),
    setup: osdhook(type),
  });
}
export { osd };

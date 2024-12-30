const applications = await Service.import("applications");

function AppItem(app) {
  return Widget.Button({
    css: "min_width: 48px;",
    on_clicked: app.launch,
    child: Widget.Box({
      children: [
        Widget.Icon({
          icon: app.iconName,
        }),
        // Widget.Label({label: app.name})
      ],
    }),
    setup: (self) => {
      self.height_request = 48;
      self.width_request = 48;
    },
  });
}

function Dock(monitor) {
  return Widget.Window({
    anchor: ["top", "left", "bottom"],
    name: `dock-${monitor}`,
    exclusivity: "ignore",
    child: Widget.Scrollable({
      hscroll: "never",
      vscroll: "always",
      css: "min-width: 48px",
      child: Widget.Box({
        vertical: true,
        children: applications.list.map(AppItem),
      }),
    }),
  });
}

export { Dock };

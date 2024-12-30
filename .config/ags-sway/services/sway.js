class Sway extends Service {
  static {
    Service.register(
      this,
      {
        "workspace-changed": ["int"],
        "active-window-changed": ["string"],
        "input-language-changed": ["string"],
        "binding-mode-changed": ["string"],
        "binding-executed": ["string"],
      },
      {
        workspace: ["int", "rw"],
        "active-window": ["string", "r"],
        "input-language": ["string", "r"],
        "binding-mode": ["string", "r"],
      },
    );
  }
  #workspace = 1;
  get workspace() {
    return this.#workspace;
  }
  set workspace(value) {
    if (value < 1) value = 1;
    if (value > 10) value = 10;
    Utils.execAsync(`swaymsg workspace ${value}`);
    this.#workspace = value;
  }

  #activeWindow = "";
  get active_window() {
    return this.#activeWindow;
  }

  #inputLanguage = "En";
  get input_language() {
    return this.#inputLanguage;
  }

  #bindingMode = "default";
  get binding_mode() {
    return this.#bindingMode;
  }

  #onChangeEmit(notified = "", changed, changed_value) {
    this.emit("changed");
    if (notified !== "") this.notify(notified);
    this.emit(changed, changed_value);
  }

  constructor() {
    super();
    const checkEmptyWorkspace = () => {
      const output = JSON.parse(Utils.exec("swaymsg -t get_workspaces -r"));
      const current = output.find((ws) => ws.visible == true);
      if (current.focus.length < 1) {
        this.#activeWindow = "";
        this.#onChangeEmit(
          "active-window",
          "active-window-changed",
          this.#activeWindow,
        );
      }
    };
    Utils.subprocess(`${App.configDir}/scripts/workspace.sh`, () => {
      this.#workspace = JSON.parse(
        Utils.exec("swaymsg -t get_workspaces -r"),
      ).find((ws) => ws.focused).num;
      this.#onChangeEmit("workspace", "workspace-changed", this.#workspace);
      checkEmptyWorkspace();
    });
    Utils.subprocess(`${App.configDir}/scripts/active_window.sh`, (out) => {
      this.#activeWindow = JSON.parse(out).container.name;
      this.#onChangeEmit(
        "active-window",
        "active-window-changed",
        this.#activeWindow,
      );
      checkEmptyWorkspace();
    });
    Utils.subprocess(`${App.configDir}/scripts/inputs.sh`, (out) => {
      this.#inputLanguage = JSON.parse(out).input.xkb_active_layout_name.slice(
        0,
        2,
      );
      this.#onChangeEmit(
        "input-language",
        "input-language-changed",
        this.#inputLanguage,
      );
    });
    Utils.subprocess(`${App.configDir}/scripts/binding_modes.sh`, (out) => {
      this.#bindingMode = JSON.parse(out)["change"];
      this.#onChangeEmit(
        "binding-mode",
        "binding-mode-changed",
        this.#bindingMode,
      );
    });
    Utils.subprocess(`${App.configDir}/scripts/bindings.sh`, (out) => {
      this.#onChangeEmit("", "binding-executed", out);
      // console.log(out)
    });
  }
}

const swayservice = new Sway();
export default swayservice;

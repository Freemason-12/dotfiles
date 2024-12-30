class Brightness extends Service {
  static {
    Service.register(
      this,
      { 'screen-changed': ['float'] },
      { 'screen-value': ['float', 'rw'] }
    )
  }
  #interface = Utils.exec('sh -c "ls -w1 /sys/class/backlight | head -1"')
  #screenValue = 0
  #max = Number(Utils.exec('brightnessctl max'))

  get screen_value() { return this.#screenValue }
  set screen_value(percent) {
    if (percent < 0) percent = 0
    if (percent > 100) percent = 100
    Utils.execAsync(`brightnessctl set ${percent}%`)
  }
  #onChange() {
    this.#screenValue = Number(Utils.exec('brightnessctl get')) / this.#max
    this.emit('changed')
    this.notify('screen-value')
    this.emit('screen-changed', this.#screenValue)
  }
  constructor() {
    super()
    const brightness_dir = `/sys/class/backlight/${this.#interface}/brightness`
    Utils.monitorFile(brightness_dir, () => this.#onChange())
    this.#onChange()
  }
  connect(event = 'screen-changed', callback) {
    return super.connect(event, callback)
  }
}

const service = new Brightness
export default service

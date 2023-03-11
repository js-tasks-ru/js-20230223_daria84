export default class NotificationMessage {
  static renderedInstance = null;

  constructor(message, { duration = 0, type = "" } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.timeout = null;
    this.render();
  }

  get template() {
    return `
      <div
        class="notification ${this.type}"
        style="--value:${this.duration / 1000}s"
        data-element="notification"
      >
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">
            Notification
          </div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
      `;
  }

  render() {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
  }

  show(element) {
    if (NotificationMessage.renderedInstance) {
      NotificationMessage.renderedInstance.destroy();
    }

    const parent = element || document.body;

    NotificationMessage.renderedInstance = this;
    parent.append(this.element);

    this.timeout = setTimeout(() => {
      this.destroy();
    }, this.duration);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    clearTimeout(this.timeout);
    this.element = null;
    NotificationMessage.renderedInstance = null;
  }
}

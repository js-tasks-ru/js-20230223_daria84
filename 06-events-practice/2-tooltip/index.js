class Tooltip {
  static onlyInstance;

  element;
  tooltipText = "";
  tooltipPosition = {};

  onPointerOver = (e) => {
    const tooltip = e.target.dataset.tooltip;

    if (!tooltip) {
      return;
    }
    this.text = tooltip;
    this.render();
    e.target.addEventListener("pointermove", this.onPointerMove);
  };

  onPointerOut = (e) => {
    this.text = "";
    this.remove();
    e.target.removeEventListener("pointermove", this.onPointerMove);
  };

  onPointerMove = (e) => {
    const x = e.clientX;
    const y = e.clientY;
    this.position = {
      x,
      y,
    };
  };

  constructor() {
    if (Tooltip.onlyInstance) {
      return Tooltip.onlyInstance;
    }
    Tooltip.onlyInstance = this;
  }

  initialize() {
    this.initListeners();
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
  }

  initListeners() {
    document.addEventListener("pointerover", this.onPointerOver);
    document.addEventListener("pointerout", this.onPointerOut);
  }

  removeListeners() {
    document.removeEventListener("pointerover", this.onPointerOver);
    document.removeEventListener("pointerout", this.onPointerOut);
  }

  render() {
    document.body.append(this.element);
  }

  get template() {
    return `
      <div class="tooltip"></div>
    `;
  }

  get text() {
    return this.tooltipText;
  }

  set text(value) {
    this.tooltipText = value;
    if (this.element) {
      this.element.innerHTML = this.tooltipText;
    }
  }

  get position() {
    return `top: ${this.tooltipPosition.y}px;left: ${this.tooltipPosition.x}px`;
  }

  set position(value) {
    this.tooltipPosition = value;
    if (this.element) {
      this.element.style = this.position;
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.removeListeners();
    this.element = null;
  }
}

export default Tooltip;

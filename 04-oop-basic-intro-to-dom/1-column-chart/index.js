export default class ColumnChart {
  constructor({
    label = "Default name",
    link,
    value,
    formatHeading,
    data,
  } = {}) {
    this.label = label;
    this.link = link;
    this.value = value;
    this.formatHeading = formatHeading;
    this.data = data;
    this.chartHeight = 50;
    this.render();
  }

  getTemplate() {
    return `
      <div class="column-chart ${
        this.hasNoData() && "column-chart_loading"
      }" style="--chart-height: ${this.chartHeight}">
        ${this.getLabel()}
        <div class="column-chart__container">
          ${this.getHeader()}
          ${this.getChart()}
        </div>
      </div>
    `;
  }

  getLabel() {
    return `
      <div class="column-chart__title">
        ${this.label}
        ${this.getLink()}
      </div>
    `;
  }

  getLink() {
    if (this.link) {
      return `
        <a href="${this.link}" class="column-chart__link">
          View all
        </a>
      `;
    }
    return "";
  }

  getHeader() {
    return `
      <div data-element="header" class="column-chart__header">
        ${this.formatHeading ? this.formatHeading(this.value) : this.value}
      </div>
    `;
  }

  getChart() {
    return `
      <div data-element="body" class="column-chart__chart">
        ${!this.hasNoData() && this.getBars()}
      </div>
    `;
  }

  getBars() {
    const maxValue = Math.max(...this.data);
    const scale = 50 / maxValue;

    return this.data
      .map((item) => {
        const percent = ((item / maxValue) * 100).toFixed(0) + "%";
        const value = String(Math.floor(item * scale));
        return `
          <div
            style="--value: ${value}" data-tooltip="${percent}"></div>
        `;
      })
      .join("");
  }

  hasNoData() {
    return !this.data || !this.data.length;
  }

  update(newData) {
    this.data = newData;
    const chartBody = this.element.querySelector('[data-element="body"]');
    chartBody.innerHTML = this.getBars();
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

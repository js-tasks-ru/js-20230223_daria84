import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 50;
  data = [];

  constructor({
    label = "",
    link = "",
    value = 0,
    url = "",
    range = {},
    formatHeading = (data) => data,
  } = {}) {
    this.label = label;
    this.link = link;
    this.value = formatHeading(value);
    this.url = url;
    this.range = range;

    this.render();
    this.update(this.range.from, this.range.to);
  }

  get template() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${
        this.chartHeight
      }">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
           <div data-element="header" class="column-chart__header">
             ${this.value}
           </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getColumnBody()}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();

    this.element.classList.add("column-chart_loading");
  }

  async update(from, to) {
    this.range.from = from;
    this.range.to = to;

    await this.loadData();

    if (Object.keys(this.data).length) {
      this.subElements.body.innerHTML = this.getColumnBody();
      this.element.classList.remove("column-chart_loading");
    }

    return this.data;
  }

  async loadData() {
    const queryParams = this.getQueryParams();

    try {
      this.data = await fetchJson(`${BACKEND_URL}/${this.url}?${queryParams}`);
    } catch (error) {
      // TODO: show error to the user
    }
  }

  getQueryParams() {
    return `from=${this.range.from.toISOString()}&to=${this.range.to.toISOString()}`;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  getColumnBody() {
    const dataArr = Object.values(this.data);

    const maxValue = Math.max(...dataArr);
    const scale = this.chartHeight / maxValue;

    return dataArr
      .map((item) => {
        const percent = ((item / maxValue) * 100).toFixed(0);

        return `
          <div
            style="--value: ${Math.floor(item * scale)}"
            data-tooltip="<strong>${percent}%</strong>">
          </div>`;
      })
      .join("");
  }

  getLink() {
    return this.link
      ? `<a class="column-chart__link" href="${this.link}">View all</a>`
      : "";
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}

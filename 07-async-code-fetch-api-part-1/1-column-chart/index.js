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
    url = "",
    range = {},
    formatHeading = (data) => data,
  } = {}) {
    this.label = label;
    this.link = link;
    this.url = url;
    this.range = range;
    this.formatHeading = formatHeading;

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
             ${this.getTotal()}
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
  }

  async update(from, to) {
    this.range.from = from;
    this.range.to = to;

    this.element.classList.add("column-chart_loading");

    await this.loadData();

    const dataArr = Object.values(this.data);

    if (dataArr.length) {
      this.subElements.body.innerHTML = this.getColumnBody();
      this.subElements.header.innerHTML = this.getTotal();
      this.element.classList.remove("column-chart_loading");
    }

    return this.data;
  }

  async loadData() {
    try {
      this.data = await fetchJson(this.fetchUrl);
    } catch (error) {
      // TODO: show error to the user
    }
  }

  get fetchUrl() {
    const { from, to } = this.range;
    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.set("from", from.toISOString());
    url.searchParams.set("to", to.toISOString());
    return url;
  }

  getTotal() {
    return this.formatHeading(
      Object.values(this.data).reduce((total, item) => (total += item), 0)
    );
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
    const maxValue = Math.max(...Object.values(this.data));
    const scale = this.chartHeight / maxValue;

    return Object.entries(this.data)
      .map(([key, value]) => {
        const percent = ((value / maxValue) * 100).toFixed(0);

        return `
          <div
            style="--value: ${Math.floor(value * scale)}"
            data-tooltip="<div><span>${this.getFormattedDate(
              key
            )}</span><strong>${percent}%</strong></div>">
          </div>`;
      })
      .join("");
  }

  getFormattedDate(date) {
    return new Date(date).toLocaleString("en-US", { dateStyle: "medium" });
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

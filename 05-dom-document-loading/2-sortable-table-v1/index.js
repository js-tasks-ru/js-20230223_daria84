export default class SortableTable {
  subElements = {};
  headerConfigIds = [];

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.render();
  }

  render() {
    this.headerConfigIds = this.getHeaderConfigIds();

    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();
  }

  get template() {
    return `
      <div class="sortable-table">
        ${this.header}
        ${this.body}
        ${this.loadingLine}
      </div>
    `;
  }

  get header() {
    return `
      <div
        data-element="header"
        class="sortable-table__header sortable-table__row">
          ${this.headerCells}
      </div>
    `;
  }

  get headerCells() {
    return this.headerConfig
      .map((item) => {
        return item.template
          ? item.template(this.data)
          : `
          <div
            class="sortable-table__cell"
            data-element="cell"
            data-id="${item.id}"
            data-sortable="${item.sortable}"
            data-order="">
            <span>${item.title}</span>
            ${
              item.sortable &&
              `
              <span data-element="arrow" class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
              </span>
            `
            }
          </div>
        `;
      })
      .join("");
  }

  get body() {
    return this.data.length
      ? `
      <div
        data-element="body"
        class="sortable-table__body">
         ${this.tableRows}
      </div>
    `
      : this.emptyTable;
  }

  get tableRows() {
    return this.data
      .map((item) => {
        return `
          <a href="/products/${item.id}" class="sortable-table__row">
            ${this.getTableCells(item)}
          </a>
        `;
      })
      .join("");
  }

  get loadingLine() {
    return `
      <div
        data-element="loading"
        class="loading-line sortable-table__loading-line">
      </div>`;
  }

  get emptyTable() {
    return `
      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products satisfies your filter criteria</p>
          <button type="button" class="button-primary-outline">Reset all filters</button>
        </div>
      </div>
    `;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");
    const headerCells = this.element.querySelectorAll("[data-id]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    result.headerCells = headerCells;

    return result;
  }

  getTableCells(item) {
    const cellsContent = this.headerConfigIds.map((id) =>
      id === "images" ? this.getImage(item) : item[id]
    );
    return cellsContent
      .map(
        (item) => `
      <div class="sortable-table__cell">${item}</div>`
      )
      .join("");
  }

  getHeaderConfigIds() {
    return this.headerConfig.map((item) => item.id);
  }

  getImage(item) {
    return `
      <img
        class="sortable-table-image"
        alt="${item.title}"
        src="${item.images[0].url}">
      </img>`;
  }

  sort(field, order) {
    const directions = {
      asc: 1,
      desc: -1,
    };

    const direction = directions[order]; // undefined

    if (typeof direction === "undefined") {
      throw new Error(`Unknown order: ${order}`);
    }

    const newData = this.data.sort((a, b) => {
      if (typeof a[field] === "number" && typeof b[field] === "number") {
        return direction * (a[field] - b[field]);
      } else {
        return (
          direction *
          a[field].localeCompare(b[field], ["ru", "en"], { caseFirst: "upper" })
        );
      }
    });

    this.update(newData);

    const sortedColumn = [...this.subElements.headerCells].find(
      (item) => item.dataset.id === field
    );
    sortedColumn.dataset.order = order;
  }

  update(newData) {
    this.data = newData;
    this.subElements.body.innerHTML = this.tableRows;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}

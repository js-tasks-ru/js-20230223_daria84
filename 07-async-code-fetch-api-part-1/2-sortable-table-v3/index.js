import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  start = 0;
  count = 10;
  hasLoaded = false;
  loading = false;

  onSortClick = (event) => {
    const column = event.target.closest('[data-sortable="true"]');

    const toggleOrder = (order) => {
      const orders = {
        asc: "desc",
        desc: "asc",
      };

      return orders[order];
    };

    if (column) {
      const { id, order } = column.dataset;
      const newOrder = toggleOrder(order);

      this.sorted.id = id;
      this.sorted.order = newOrder;
      this.start = 0;

      if (this.isSortLocally) {
        this.sortOnClient(this.sorted.id, this.sorted.order);
      } else {
        this.sortOnServer(this.sorted.id, this.sorted.order);
      }

      const arrow = column.querySelector(".sortable-table__sort-arrow");

      column.dataset.order = newOrder;

      if (!arrow) {
        column.append(this.subElements.arrow);
      }
    }
  };

  onWindowScroll = async () => {
    // if no more data on the BE, do not send another request
    if (this.hasLoaded) {
      return;
    }
    const bottom = this.element.getBoundingClientRect().bottom;
    const { id, order } = this.sorted;

    if (bottom < document.documentElement.clientHeight && !this.isLoading) {
      this.isLoading = true;
      this.element.classList.add("sortable-table_loading");
      this.start += this.count;
      const data = await this.loadData(
        id,
        order,
        this.start,
        this.start + this.count
      );
      this.isLoading = false;
      if (data.length) {
        const newRows = document.createElement("div");
        newRows.innerHTML = this.getTableRows(data);
        this.subElements.body.append(...newRows.childNodes);
      } else {
        this.hasLoaded = true;
      }
      this.element.classList.remove("sortable-table_loading");
    }
  };

  constructor(
    headerConfig = [],
    {
      sorted = {
        id: headerConfig.find((item) => item.sortable).id,
        order: "asc",
      },
      isSortLocally = false,
      url = "",
    } = {}
  ) {
    this.headerConfig = headerConfig;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.url = url;

    this.render();
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headerConfig.map((item) => this.getHeaderRow(item)).join("")}
    </div>`;
  }

  getHeaderRow({ id, title, sortable }) {
    const order = this.sorted.id === id ? this.sorted.order : "asc";

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getHeaderSortingArrow(id)}
      </div>
    `;
  }

  getHeaderSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : "";

    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : "";
  }

  getTableBody(data) {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(data)}
      </div>`;
  }

  getTableRows(data) {
    return data
      .map(
        (item) => `
      <div class="sortable-table__row">
        ${this.getTableRow(item)}
      </div>`
      )
      .join("");
  }

  getTableRow(item) {
    const cells = this.headerConfig.map(({ id, template }) => {
      return {
        id,
        template,
      };
    });

    return cells
      .map(({ id, template }) => {
        return template
          ? template(item[id])
          : `<div class="sortable-table__cell">${item[id]}</div>`;
      })
      .join("");
  }

  getEmptyPlaceholder() {
    return `
      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products found...</p>
        </div>
      </div>
    `;
  }

  getLoadingLine() {
    return `<div data-element="loading" class="loading-line sortable-table__loading-line"></div>`;
  }

  getTable(data) {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody(data)}
        ${this.getLoadingLine()}
        ${this.getEmptyPlaceholder()}
      </div>`;
  }

  async loadData(id, order, start, count) {
    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.set("_sort", id);
    url.searchParams.set("_order", order);
    url.searchParams.set("_start", start);
    url.searchParams.set("_end", start + count);

    let data = [];

    try {
      data = await fetchJson(url);
    } catch (error) {
      // TODO: show error to the user
    }

    return data;
  }

  sortOnClient(id, order) {
    //const { id, order } = this.sorted;
    const arr = [...this.data];
    const column = this.headerConfig.find((item) => item.id === id);
    const { sortType, customSorting } = column;
    const direction = order === "asc" ? 1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
        case "number":
          return direction * (a[id] - b[id]);
        case "string":
          return direction * a[id].localeCompare(b[id], "ru");
        case "custom":
          return direction * customSorting(a, b);
        default:
          throw new Error(`Неизвестный тип сортировки ${sortType}`);
        // return direction * (a[id] - b[id]);
      }
    });
  }

  async sortOnServer(id, order) {
    const { start, count } = this;
    this.data = await this.loadData(id, order, start, start + count);
    this.update();
  }

  update() {
    if (this.data.length) {
      this.subElements.body.innerHTML = this.getTableRows(this.data);
      this.element.classList.remove("sortable-table_empty");
    } else {
      this.element.classList.add("sortable-table_empty");
    }
  }

  async render() {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.getTable(this.data);

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    //this.subElements.emptyPlaceholder.style.display = "block";

    this.initEventListeners();

    const { id, order } = this.sorted;

    this.data = await this.loadData(
      id,
      order,
      this.start,
      this.start + this.count
    );
    this.update();
  }

  initEventListeners() {
    this.subElements.header.addEventListener("pointerdown", this.onSortClick);
    if (!this.isSortLocally) {
      window.addEventListener("scroll", this.onWindowScroll);
    }
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    window.removeEventListener("scroll", this.onWindowScroll);
    this.element = null;
    this.subElements = {};
    this.data = [];
  }
}

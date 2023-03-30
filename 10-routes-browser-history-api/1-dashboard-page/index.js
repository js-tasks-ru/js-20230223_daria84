import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import header from "./bestsellers-header.js";

const BACKEND_URL = "https://course-js.javascript.ru/";
const DASHBOARD_URL = "/api/dashboard";

export default class Page {
  element;
  subElements = {};
  dataComponents = {};
  bestsellersUrl = "";

  range = {
    from: new Date(),
    to: new Date(),
  };

  onDateSelect = (event) => {
    const { from, to } = event.detail;

    for (const [name, component] of Object.entries(this.dataComponents)) {
      if (name !== "sortableTable") {
        component.update(from, to);
      } else {
        this.bestsellersUrl.searchParams.set("from", from.toISOString());
        this.bestsellersUrl.searchParams.set("to", to.toISOString());
        this.dataComponents.sortableTable.loadDataWithUrl(this.bestsellersUrl);
      }
    }
  };

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.renderComponents();

    this.initListeners();

    return this.element;
  }

  renderComponents() {
    const { from, to } = this.range;

    const getChartOptions = (slug, label, link) => {
      return {
        url: `${DASHBOARD_URL}/${slug}`,
        range: {
          from,
          to,
        },
        label,
        link,
      };
    };

    const rangePicker = new RangePicker({ from, to });
    const ordersChart = new ColumnChart(
      getChartOptions("orders", "Orders", "#")
    );
    const salesChart = new ColumnChart(getChartOptions("sales", "Sales"));
    const customersChart = new ColumnChart(
      getChartOptions("customers", "Customers")
    );

    this.bestsellersUrl = new URL(`${DASHBOARD_URL}/bestsellers`, BACKEND_URL);
    this.bestsellersUrl.searchParams.set("from", from.toISOString());
    this.bestsellersUrl.searchParams.set("to", to.toISOString());

    const sortableTable = new SortableTable(header, {
      url: this.bestsellersUrl,
      isSortLocally: true,
    });

    this.dataComponents = {
      ordersChart,
      salesChart,
      customersChart,
      sortableTable,
    };

    this.subElements.rangePicker.append(rangePicker.element);

    for (const [key, value] of Object.entries(this.dataComponents)) {
      this.subElements[key].append(value.element);
    }
  }

  getSubElements(element) {
    const elements = element.querySelectorAll("[data-element]");

    const subElements = [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});

    subElements.main = document.querySelector(".main");

    return subElements;
  }

  initListeners() {
    document.addEventListener("date-select", this.onDateSelect);
  }

  removeListeners() {
    document.removeEventListener("date-select", this.onDateSelect);
  }

  get template() {
    return `
      <div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Dashboard</h2>
          <!-- RangePicker component -->
          <div data-element="rangePicker"></div>
        </div>
        <div data-element="chartsRoot" class="dashboard__charts">
          <!-- column-chart components -->
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>
        <h3 class="block-title">Best sellers</h3>
        <div data-element="sortableTable">
          <!-- sortable-table component -->
        </div>
      </div>
    `;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.removeListeners();
    this.subElements = {};
  }
}

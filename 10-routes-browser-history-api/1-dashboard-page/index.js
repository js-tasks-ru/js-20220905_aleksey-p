import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

// rangePicker
// chartsRoot
// ordersChart
// salesChart
// customersChart
// sortableTable


const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {

  //region default
  element;
  subElements = {};
  range = this.getRange();

  components = {

    rangePicker: new RangePicker({
      from: this.range.from,
      to: this.range.to
    }),

    ordersChart: new ColumnChart({
      url: 'api/dashboard/orders',
      range: {
        from: this.range.from,
        to: this.range.to
      },
      label: 'orders',
      link: '#'
    }),

    salesChart: new ColumnChart({
      url: 'api/dashboard/sales',
      range: {
        from: this.range.from,
        to: this.range.to
      },
      label: 'sales',
      formatHeading: data => `${data} $`
    }),

    customersChart: new ColumnChart({
      url: 'api/dashboard/customers',
      range: {
        from: this.range.from,
        to: this.range.to
      },
      label: 'customers',
    }),

    sortableTable: new SortableTable(header, {
      url: 'api/rest/products'
    })

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
    </div>`;
  }

  getRange() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    return { from, to };
  }
  //endregion

  async render() {

    this.initializeElement();
    this.getSubElements();

    this.getRange();
    this.getComponents();

    this.initializeEventListeners();

    return this.element;
  }

  //region common functions
  initializeElement() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    for (const element of elements) {
      this.subElements[element.dataset.element] = element;
    }
  }

  getComponents() {
    Object.entries(this.components).map(([key, value]) =>
      this.subElements[key].append(value.element));
  }
  //endregion

  initializeEventListeners() {

    this.element.addEventListener('date-select', event => {

      this.range = event.detail;
      this.updateComponents(this.range);
    });
  }

  updateComponents ({from, to}) {

    const url = new URL("api/dashboard/bestsellers", BACKEND_URL);
    url.searchParams.append("_start", "1");
    url.searchParams.append("_end", "20");
    url.searchParams.append("from", from.toISOString());
    url.searchParams.append("to", to.toISOString());

    fetchJson(url)
      .then(data => {

        this.components.sortableTable.addRows(data);

        this.components.ordersChart.update(from, to);
        this.components.salesChart.update(from, to);
        this.components.customersChart.update(from, to);
      });

  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

}

// import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';
export default class ColumnChart {
  element;
  chartHeight = 50;
  subElements = {};
  data = {};
  value = 0;

  constructor({
    url = '',
    range = {from: new Date(), to: new Date()},
    label = '',
    link = '',
    formatHeading = obj => `${obj}`} = {}) {

    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
  }

  get template() {
    return `
        <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
          <div data-element="title" class="column-chart__title"></div>
          <div class="column-chart__container">
            <div data-element="header" class="column-chart__header"></div>
            <div data-element="body" class="column-chart__chart"></div>
          </div>
        </div>`;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    [...elements].map(item => this.subElements[item.dataset.element] = item);
  }

  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.element = this.element.firstElementChild;
    if (Object.keys(this.data).length) {this.element.classList.remove("column-chart_loading");}

    this.getSubElements();
    this.setTitle();
    this.update();
  }

  async update(start = this.range.from, end = this.range.to) {

    const fromString = start.toISOString().split('T')[0];
    const toString = end.toISOString().split('T')[0];
    this.element.classList.add('column-chart_loading');

    try {
      await this.getData(fromString, toString);

      if (Object.keys(this.data)) {
        this.element.classList.remove('column-chart_loading');
        this.setValue();
        this.setHeader();
        this.setBody();
      }

    } catch (e) {
      throw new Error(e);
    }
  }

  async getData(from = '', to = '') {
    try {
      const response = await fetch(`${BACKEND_URL}/${this.url}?from=${from}&to=${to}`);
      this.data = await response.json();

    } catch (e) {
      throw new Error(e);
    }
  }

  setValue() {
    const sum = Object.values(this.data).reduce((a, b) => a + b);
    this.value = this.formatHeading(new Intl.NumberFormat("en-US").format(sum));
  }

  setTitle() {
    let inner = `Total ${this.label}`;
    if (this.link) {
      inner += `<a class="column-chart__link" href="./${this.label}">View all</a>`;
    }
    this.subElements.title.innerHTML = inner;
  }

  setHeader() {
    this.subElements.header.innerHTML = this.value;
  }

  setBody() {
    const values = Object.values(this.data);

    this.subElements.body.innerHTML = values.map(value => {
      const max = Math.max(...values);
      const calcValue = (value / max * 100).toFixed(0);
      return `<div style="--value: ${Math.floor(calcValue * this.chartHeight * 0.01)}"
                            data-tooltip="${calcValue}%"></div>`;
    }).join("");
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
  }
}


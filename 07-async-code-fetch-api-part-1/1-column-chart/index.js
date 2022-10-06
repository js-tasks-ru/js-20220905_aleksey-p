import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';
export default class ColumnChart {

  //region default
  element;
  static CHART_HEIGHT = 50;
  subElements = {};
  data = {};
  value = 0;

  constructor({
    url = '',
    range = {from: new Date(), to: new Date()},
    label = '',
    link = '',
    formatHeading = obj => obj} = {}) {

    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
  }

  get template() {
    return `
        <div class="column-chart column-chart_loading" style="--chart-height: ${ColumnChart.CHART_HEIGHT}">
          <div data-element="title" class="column-chart__title"></div>
          <div class="column-chart__container">
            <div data-element="header" class="column-chart__header"></div>
            <div data-element="body" class="column-chart__chart"></div>
          </div>
        </div>`;
  }

  getSubElements(wrapper) {
    const elements = wrapper.querySelectorAll('[data-element]');
    for (const item of elements) {
      this.subElements[item.dataset.element] = item;
    }
  }

  setTitle() {
    const label = `Total ${this.label}`;
    const link = this.link ? `<a class="column-chart__link" href="./${this.label}">View all</a>` : '';

    this.subElements.title.innerHTML = `${label}${link}`;
  }
  //endregion

  render() {

    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;

    this.getSubElements(wrapper);
    this.setTitle();

    this.element = wrapper.firstElementChild;
    this.update(this.range.from, this.range.to);

  }

  update(start, end) {

    this.element.classList.add('column-chart_loading');

    const url = ColumnChart.getURL(this.url, start, end);
    fetchJson(url)
      .then(data => {

        this.data = data;
        this.setInner();
      })
      .catch(e => new Error(e));


  }

  //region update common
  static getURL(path, start, end) {

    function getStringDate(date) {
      return date.toISOString().split('T')[0];
    }

    const fromString = getStringDate(start);
    const toString = getStringDate(end);

    const url = new URL(path, BACKEND_URL);
    url.searchParams.append("from", fromString);
    url.searchParams.append("to", toString);

    return url;
  }

  setInner() {

    if (Object.keys(this.data).length) {
      this.element.classList.remove("column-chart_loading");

      this.setHeader();
      this.setBody();
    }
  }

  //region setInner common
  setHeader() {
    const {header} = this.subElements;

    const sum = Object.values(this.data).reduce((a, b) => a + b);
    this.value = this.formatHeading(new Intl.NumberFormat("en-US").format(sum));


    header.innerHTML = this.value;
  }

  setBody() {
    const {body} = this.subElements;
    const values = Object.values(this.data);

    body.innerHTML = values.map(value => {

      const max = Math.max(... values);
      const valuePercent = (value / max * 100).toFixed(0);
      const fixedValue = Math.floor(valuePercent * ColumnChart.CHART_HEIGHT * 0.01);

      return `<div style="--value: ${fixedValue}" data-tooltip="${valuePercent}%"></div>`;
    }).join("");
  }
  //endregion
  //endregion

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();

    this.element = null;
    this.subElements = {};
    this.data = {};
    this.value = 0;

    this.url = '';
    this.range = {from: new Date(), to: new Date()};
    this.label = '';
    this.link = '';
  }
}


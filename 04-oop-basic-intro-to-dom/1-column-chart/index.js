export default class ColumnChart {

  element;
  static CHART_HEIGHT = 50;
  subElements = {};

  constructor({
    data = [],
    label = '',
    link = '',
    value = 0,
    formatHeading = string => string} = {}) {

    this.data = data;
    this.label = label;
    this.link = link;
    this.value = formatHeading(new Intl.NumberFormat("en-US").format(value));

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

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    for (const element of elements) {
      this.subElements[element.dataset.element] = element;
    }
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;

    if (this.data.length) {wrapper.firstElementChild.classList.remove("column-chart_loading");}

    this.getSubElements(wrapper);

    this.setTitle();
    this.setHeader();
    this.setBody();

    this.element = wrapper.firstElementChild;
  }

  update(data = []) {
    this.data = data;
    this.setBody();
  }

  setTitle() {
    const total = `Total ${this.label}`;
    const link = this.link
      ? `<a class="column-chart__link" href="./${this.label}">View all</a>`
      : "";

    this.subElements.title.innerHTML = `${total}${link}`;
  }

  setHeader() {
    this.subElements.header.innerHTML = this.value;
  }

  setBody() {

    this.subElements.body.innerHTML = this.data.map(value => {

      const max = Math.max(...this.data);
      const calcValue = (value / max * 100).toFixed(0);

      return `<div style="--value: ${Math.floor(calcValue * ColumnChart.CHART_HEIGHT * 0.01)}"
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

    this.element = null;
    this.subElements = {};

    this.data = [];
    this.label = '';
    this.link = '';
    this.value = 0;
  }
}

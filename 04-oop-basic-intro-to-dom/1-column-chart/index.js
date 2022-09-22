export default class ColumnChart {
  element;
  chartHeight = 50;
  subElements = {};

  constructor({
    data = [],
    label = '',
    link = '',
    value = 0,
    formatHeading = obj => `${obj}`} = {}) {

    this.data = data;
    this.label = label;
    this.link = link;
    this.value = formatHeading(new Intl.NumberFormat("en-US").format(value));

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
    if (this.data.length) {this.element.classList.remove("column-chart_loading");}

    this.getSubElements();
    this.setTitle();
    this.setHeader();
    this.setBody();
  }

  update(data = []) {
    this.data = data;
    this.setBody();
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
    this.subElements.body.innerHTML = this.data.map(value => {
      const max = Math.max(...this.data);
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

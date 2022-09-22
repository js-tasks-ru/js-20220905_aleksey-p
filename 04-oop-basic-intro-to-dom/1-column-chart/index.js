export default class ColumnChart {
  element;
  chartHeight = 50;

  constructor({
    data = [],
    label = '',
    link = '',
    value = 0,
    formatHeading = obj => `${obj}`} = {}) {

    this.data = data;
    this.label = label;
    this.link = link;
    this.value = formatHeading(value);

    this.render();
  }
  calcValue = elem => Math.floor(elem * this.chartHeight / Math.max(...this.data));
  calcProcent = elem => (elem / Math.max(...this.data) * 100).toFixed(0);

  chartMaker = () => this.element.innerHTML =
    this.data.map(elem =>
      `<div style="--value: ${this.calcValue(elem)}" data-tooltip="${this.calcProcent(elem)}%"></div>`).join("\n");

  get template() {
    return `
        <div class="column-chart ${!this.data.length ? 'column-chart_loading' : ''}">
          <div style="--chart-height: ${this.chartHeight}">
            <div class="column-chart__title">
              Total ${this.label}
              ${this.link ? `<a href="${this.link}" rel="stylesheet"  class="column-chart__link">View all</a>` : ""}
            </div>
            <div class="column-chart__container">
              <div data-element="header" class="column-chart__header">${this.value}</div>
              <div data-element="body" class="column-chart__chart">
              ${this.data.length ? this.chartMaker() : ''}
              </div>
            </div>
          </div>
        </div>`;
  }
  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.element = this.element.firstElementChild;
  }
  update(data = []) {
    this.data = data;
    this.render();
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

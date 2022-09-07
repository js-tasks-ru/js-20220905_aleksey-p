export default class ColumnChart {
  element;
  chartHeight = 50;

  constructor({
    data = [],
    label = '',
    link = '',
    value = 0,
    formatHeading = null} = {}) {

    this.data = data;
    this.label = label;
    this.link = link;
    this.value = value;
    this.formatHeading = formatHeading;

    this.render();
  }
  calcValue = elem => Math.floor(elem * 50 / Math.max(...this.data));
  calcProcent = elem => (elem / Math.max(...this.data) * 100).toFixed(0);

  chartMaker() {
    let chartColumn = '';
    for (let elem of this.data) {
      chartColumn += `<div style="--value: ${this.calcValue(elem)}" data-tooltip="${this.calcProcent(elem)}%"></div> \n`;
    }
    return this.element.innerHTML = chartColumn;
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = `column-chart ${!this.data.length ? 'column-chart_loading' : ''}`;
    this.element.innerHTML = `
        <div style="--chart-height: 50">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.link ? "<a href='" + this.link + "' rel='stylesheet'  class='column-chart__link'>View all</a>" : ""}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.formatHeading ? this.formatHeading(this.value) : this.value}</div>
          <div data-element="body" class="column-chart__chart">
          ${this.data.length ? this.chartMaker() : ''}
          </div>
        </div>
        </div>`;
  }
  update(data) {
    this.data = data;
    this.render();
  }
  remove() {
    this.element.remove();
  }
  destroy() {
    this.remove();
  }
}

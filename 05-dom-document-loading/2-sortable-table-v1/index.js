export default class SortableTable {
  element;
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.render();
  }

  sort(fieldValue, orderValue) {
    const dirs = {
      asc: 1,
      desc: -1
    };
    const { sortType } = this.headerConfig.find(elem => elem.id === fieldValue);
    const dir = dirs[orderValue];
    const sortedData = this.data.sort((obj1, obj2) => {
      if (sortType === 'number') {
        return dir * (obj1[fieldValue] - obj2[fieldValue]);
      }
      if (sortType === 'string') {
        return dir * obj1[fieldValue].localeCompare(obj2[fieldValue], ['ru', 'eng'], {caseFirst: "upper"});
      }
      return reportError("undefined sortType");
    });

    const allCols = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentCol = this.element.querySelector(`.sortable-table__cell[data-id="${fieldValue}"]`);

    allCols.forEach(col => {
      col.dataset.order = '';
    });
    currentCol.dataset.order = orderValue;
    this.element.firstElementChild.lastElementChild.innerHTML = this.setRows(sortedData, this.headerConfig);
    this.subElements.body.innerHTML = this.setRows(sortedData, this.headerConfig);
  }
  setRows(data = [], cfg = []) {

    function setCells(rowData = {}, cfg = []) {
      return cfg.map(elem => elem.template ?
        elem.template(rowData.images) : `<div class="sortable-table__cell">${rowData[elem.id]}</div>`)
        .join("\n");
    }

    return data.map(rowData => `
        <a href="/products/${rowData.id}" class="sortable-table__row">
            ${setCells(rowData, cfg)}
        </a>`)
        .join("\n");
  }

  setHeader = (cfg = []) =>
    cfg.map(elem =>
      `<div class="sortable-table__cell"
        data-id="${elem.id}"
        data-sortable="${elem.sortable}"
        data-order="">
            <span>${elem.title}</span>
            <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>`)
    .join("\n");

  get template() {
    return `
    <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
            <div data-element="header" class="sortable-table__header sortable-table__row">
                ${this.setHeader(this.headerConfig)}
            </div>
            <div data-element="body" class="sortable-table__body">
                ${this.setRows(this.data, this.headerConfig)}
            </div>
            <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
			      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
				        <div>
					          <p>No products satisfies your filter criteria</p>
					          <button type="button" class="button-primary-outline">Reset all filters</button>
				        </div>
			      </div>
        </div>
    </div>`;
  }

  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.element = this.element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }
  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  remove() {
    if (this.element)
    {
      this.element.remove();
    }
  }
  destroy() {
    this.remove();
  }
}

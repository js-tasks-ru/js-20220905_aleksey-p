const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  data = {};
  element;
  subElements = {};
  isSortLocally = false;

  constructor(headersConfig, {
    url = '',
    sorted,
  } = {}) {
    this.headerConfig = headersConfig;
    this.url = url;
    this.sorted = sorted ? sorted : {id: this.headerConfig.find(item => item.sortable).id, order: 'asc'};

    this.render();
  }

  get template() {
    return `<div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">

        <div data-element="header" class="sortable-table__header sortable-table__row"></div>

        <div data-element="body" class="sortable-table__body"></div>

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

  getSubElements(element = this.element) {
    const elements = element.querySelectorAll('[data-element]');
    [...elements].map(item => this.subElements[item.dataset.element] = item);
  }

  //region header
  getHeader(header) {
    header.innerHTML = this.headerConfig.map(columnConfig => this.getHeaderColumn(columnConfig)).join("");
    this.initializeEventListeners();
  }

  getHeaderColumn(columnConfig) {
    return `
    <div class="sortable-table__cell" data-id=${columnConfig.id} data-sortable=${columnConfig.sortable} data-order="">
      <span>${columnConfig.title}</span>
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    </div>`;
  }
  //endregion

  //region body
  getBody(body) {
    body.innerHTML = this.data.map(object => this.setRow(object)).join("");
  }

  setRow(data) {
    return `
        <a href="/products/${data.id}" class="sortable-table__row">
            ${this.headerConfig.map(item => this.setCell(data, item)).join("")}
        </a>`;
  }

  setCell(data, config) {
    const value = data[config.id];
    if (config.template) {
      return config.template(value);
    }
    return `<div class="sortable-table__cell">${value}</div>`;
  }
  //endregion

  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.element = this.element.firstElementChild;

    this.getSubElements(this.element);
    this.getHeader(this.subElements.header);
    this.sort();

  }

  sort() {
    this.sortHeader();
    if (this.isSortLocally) {
      this.sortOnClient();
    } else {
      this.sortOnServer();
    }
  }

  sortHeader() {
    const {header} = this.subElements;

    const columns = header.querySelectorAll('[data-id]');
    const currentColumn = header.querySelector(`[data-id="${this.sorted.id}"]`);

    [...columns].map(item => item.dataset.order = '');
    currentColumn.dataset.order = this.sorted.order;

  }

  sortOnClient () {
    const {id, order} = this.sorted;
    const {sortType} = this.headerConfig.find(item => item.id === id);

    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];
    this.data = this.data.sort((firstElem, secondElem) => {
      if (sortType === "number") {
        return direction * (firstElem[id] - secondElem[id]);
      }
      if (sortType === "string") {
        return direction * firstElem[id].localeCompare(secondElem[id], ['ru', 'eng'], {caseFirst: "upper"});
      }
      return console.error("wrong sortType");
    });

    this.getBody(this.subElements.body);
  }

  async sortOnServer () {
    this.isSortLocally = true;
    try {
      const response = await fetch(`${BACKEND_URL}/${this.url}?_sort=${this.sorted.id}&_order=${this.sorted.order}`);
      this.data = await response.json();
      this.getBody(this.subElements.body);
    } catch (e) {
      throw new Error(e);
    }
  }

  initializeEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onColumnClick);
  }

  onColumnClick = event => {
    function findTarget(target) {
      return target.dataset.id ? target : findTarget(target.parentNode);
    }

    const target = findTarget(event.target);
    const columns = this.subElements.header.querySelectorAll('[data-id]');
    if (![...columns].includes(target) || target.dataset.sortable === "false") {return;}

    this.sorted.id = target.dataset.id;
    if (target.dataset.order === "desc") {
      this.sorted.order = "asc";
    } else if (target.dataset.order === "" || target.dataset.order === "asc") {
      this.sorted.order = "desc";
    } else {
      throw new Error("wrong order type");
    }
    this.sort();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

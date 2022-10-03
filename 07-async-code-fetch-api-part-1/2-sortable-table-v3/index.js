import fetchJson from "./utils/fetch-json";

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {

  //region default
  data = {};
  dataLength = 0;
  element;
  subElements = {};
  isSortLocally = false;
  step = 30;
  currentStep = 0;
  isDataLoading = false;

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
      <div data-element="table" class="sortable-table">

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

  getSubElements(wrapper) {
    const elements = wrapper.querySelectorAll('[data-element]');

    for (const element of elements) {
      this.subElements[element.dataset.element] = element;
    }
  }
  //endregion

  //region header
  getHeader() {
    const {header} = this.subElements;

    header.innerHTML = this.headerConfig.map(columnConfig =>
      SortableTable.getHeaderColumn(columnConfig)).join("");
  }

  static getHeaderColumn(columnConfig) {
    const {id, sortable, title} = columnConfig;
    return `
    <div class="sortable-table__cell" data-id=${id} data-sortable=${sortable} data-order="">
      <span>${title}</span>
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
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.getSubElements(wrapper);

    this.getHeader();


    this.element = wrapper.firstElementChild;

    this.initialize();
    this.sort();
  }

  //region sort
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
    const url = this.getURL();
    const {table} = this.subElements;

    table.classList.add("sortable-table_loading");
    this.isDataLoading = true;

    if (this.serverIsEmpty) { return; }

    fetchJson(url)
      .then(newData => {

        if (newData.length < this.step) {
          this.serverIsEmpty = true;
        }

        this.isDataLoading = false;
        table.classList.remove("sortable-table_loading");

        if (!newData.length) {
          table.classList.add("sortable-table_empty");
        }

        this.data = this.currentStep > 0 ? [...this.data, ...newData] : newData;
        if (this.data.length === this.dataLength) {this.isSortLocally = true;}
        this.currentStep += this.step;

        this.getBody();
      })
      .catch(e => new Error(e));
  }

  getURL() {
    const {id, order} = this.sorted;

    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.set("_sort", id);
    url.searchParams.set("_order", order);

    const end = this.currentStep + this.step;
    url.searchParams.set("_start", this.currentStep);
    url.searchParams.set("_end", end);

    return url;
  }
  //endregion

  //region events
  initialize() {
    const {header} = this.subElements;
    header.addEventListener('pointerdown', this.onColumnClick);
    document.addEventListener('scroll', this.scrollingDataLoading);
  }

  onColumnClick = event => {
    function findTarget(target) {
      return target.dataset.id
        ? target
        : findTarget(target.parentNode);
    }

    const target = findTarget(event.target);
    this.setSorted(target);
    this.currentStep = 0;
    this.sort();
  }

  setSorted(target) {
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
  }

  scrollingDataLoading = () => {
    const clientHeight = document.documentElement.clientHeight;
    const bottom = Math.floor(document.documentElement.getBoundingClientRect().bottom);
    if (!this.isDataLoading && bottom <= clientHeight + 100) {
      try {
        this.sortOnServer();
      }
      catch (e) {
        throw new Error(e);
      }
    }
  }
  //endregion

  remove() {
    this.element.remove();
    document.removeEventListener('scroll', this.scrollingDataLoading);
  }

  destroy() {
    this.remove();
  }
}

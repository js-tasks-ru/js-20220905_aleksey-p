export default class SortableTable {
  element;
  subElements;
  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {
    this.headerConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = true;
    this.render();
  }

  sort() {
    if (this.isSortLocally) {
      this.sortOnClient();
    } else {
      this.sortOnServer();
    }
  }

  // Прочел учебник модуля, но так и не понял, как сделать обработкау только на клиенте
  sortOnClient() {

    function setHeaderOrder(sortCfg) {
      const headerCells = header.querySelectorAll('[data-id]');
      headerCells.forEach(cell => cell.dataset.order = '');

      const currentHeaderCell = header.querySelector(`[data-id="${sortCfg.id}"]`);
      currentHeaderCell.dataset.order = sortCfg.order;
    }

    function sortData({id, order}, sortType, data) {
      const directions = {
        asc: 1,
        desc: -1
      };
      const direction = directions[order];
      return data.sort((firstElem, secondElem) => {
        if (sortType === "number") {
          return direction * (firstElem[id] - secondElem[id]);
        }
        if (sortType === "string") {
          return direction * firstElem[id].localeCompare(secondElem[id], ['ru', 'eng'], {caseFirst: "upper"});
        }
        return reportError("undefined sortType");
      });
    }

    const { sortType } = this.headerConfig.find(elem => elem.id === this.sorted.id);

    const { header } = this.subElements;
    setHeaderOrder(this.sorted);

    this.data = sortData(this.sorted, sortType, this.data);
    this.subElements.body.innerHTML = this.body;
    this.subElements.body = this.subElements.body.firstElementChild;
  }

  sortOnServer() {

  }

  get allSubElements() {
    const elementsArr = this.element.querySelectorAll('[data-element]');
    let elementsObj = {};

    for (let subElem of elementsArr) {
      elementsObj[subElem.dataset.element] = subElem;
    }

    return elementsObj;
  }

  get header() {
    function setHeaderColumns(obj) {
      return `
      <div class="sortable-table__cell" data-id=${obj.id} data-sortable=${obj.sortable} data-order="">
        <span>${obj.title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>`;
    }

    //header
    return `
    <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig.map(obj => setHeaderColumns(obj)).join("") }
    </div>
    `;
  }

  get body() {
    function setRow(dataObj, config) {
      function setCell(headerObj) {

        //set cell in row
        if (headerObj.template) {
          return headerObj.template(dataObj["images"]);
        }
        return `<div class="sortable-table__cell">${dataObj[headerObj.id]}</div>`;

      }

      // set row of data
      return `
        <a href="/products/${dataObj.id}" class="sortable-table__row">
        ${config.map(item => setCell(item)).join("")}
      </a>
      `;
    }

    // set body
    return `
    <div data-element="body" class="sortable-table__body">
        ${this.data.map(obj => setRow(obj, this.headerConfig)).join("")}
    </div>`;
  }

  get template() {
    return `
    <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
            ${this.header}
            ${this.body}
            <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
            <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
                <div>
                    <p>No products satisfies your filter criteria</p>
                    <button type="button" class="button-primary-outline">Reset all filters</button>
                </div>
            </div>
        </div>
    </div>
    `;
  }

  headerClickEvent() {
    const {header} = this.subElements;
    const [...sortableCellsArr] = header.querySelectorAll(`[data-sortable='true']`);
    sortableCellsArr.map(cell => {
      cell.addEventListener('click', () => {
        this.sorted.id = cell.dataset.id;
        if (cell.dataset.order === "" || cell.dataset.order === "desc") {
          this.sorted.order = "asc";
        } else if ( cell.dataset.order === "asc") {
          this.sorted.order = "desc";
        } else {
          reportError("undefined cell.dataset.order");
        }
        this.sort();
      });
    });
  }

  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.element = this.element.firstElementChild;
    this.subElements = this.allSubElements;

    this.sort();
    this.headerClickEvent();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

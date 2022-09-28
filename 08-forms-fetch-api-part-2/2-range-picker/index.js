export default class RangePicker {

  element;
  subElements = {};

  constructor({
    from = new Date(),
    to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 3)} = {}) {
    this.dateFrom = from;
    this.dateTo = to;
    this.dateShow = new Date(from);
    this.render();
  }

  get template() {
    return `
    <div class="container">
      <div class="rangepicker">
        <div class="rangepicker__input" data-element="input">
          <span data-element="from"></span> -
          <span data-element="to"></span>
        </div>
        <div class="rangepicker__selector" data-element="selector"></div>
      </div>
    </div>`;
  }

  getSubElements(element) {
    const subElements = element.querySelectorAll('[data-element]');
    for (let subElement of subElements) {
      this.subElements[subElement.dataset.element] = subElement;
    }
  }

  getSelector(selector) {

    const secondDateShow = new Date(this.dateShow);
    secondDateShow.setMonth(secondDateShow.getMonth() + 1);

    selector.innerHTML = `
    <div class="rangepicker__selector-arrow"></div>
          <div class="rangepicker__selector-control-left" ></div>
          <div class="rangepicker__selector-control-right" ></div>
          ${this.getCalendar(this.dateShow)}
          ${this.getCalendar(secondDateShow)}
    `;


    selector.addEventListener('pointerdown', this.changeCalendar);

  }

  changeCalendar = event => {
    event.preventDefault();
    const {selector} = this.subElements;
    const controlLeft = selector.querySelector(".rangepicker__selector-control-left");
    const controlRight = selector.querySelector(".rangepicker__selector-control-right");

    const target = event.target;

    if (controlLeft.contains(target)) {
      this.dateShow.setMonth(this.dateShow.getMonth() - 1);
      this.getSelector(selector);
    }
    if (controlRight.contains(target)) {
      this.dateShow.setMonth(this.dateShow.getMonth() + 1);
      this.getSelector(selector);
    }



  }

  getCalendar(date) {
    const month = RangePicker.getStringMonth(date.getMonth());
    const shortDaysOfWeek = RangePicker.getShortDaysOfWeek();
    const dateGrid = this.getDateGrid(date);
    return `<div class="rangepicker__calendar">
              <div class="rangepicker__month-indicator">
                  <time datetime="${month}">${month}</time>
              </div>
              <div class="rangepicker__day-of-week">
                ${shortDaysOfWeek}
              </div>
              <div class="rangepicker__date-grid">
                ${dateGrid}
              </div>
            </div>`;
  }

  static getStringMonth(monthIndex) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    return months[monthIndex];
  }

  static getShortDaysOfWeek() {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    return days.map(item => `<div>${item}</div>`).join('');
  }

  getDateGrid(date) {

    const result = [];
    let isFirst = true;

    const firstDayOfWeek = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();


    for (let day = 1; day <= lastDayOfMonth; day++) {
      const dateValue = new Date(date.getFullYear(), date.getMonth(), day);
      const button = `<button type="button" class="rangepicker__cell" data-value="${dateValue}"`;

      const style = isFirst ? `style="--start-from: ${firstDayOfWeek}">` : '>';
      isFirst = false;

      const cell = `${button}${style}${day}</button>`;
      result.push(cell);
    }

    return result.join('');
  }

  render() {
    let wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    wrapper = wrapper.firstElementChild;
    this.getSubElements(wrapper);
    this.getSelector(this.subElements.selector, this.dateShow);
    this.selectRange(this.dateFrom, this.dateTo);

    this.element = wrapper;
    this.initialize();

  }

  selectRange(dateFrom, dateTo) {

    const {selector, from, to} = this.subElements;
    from.innerHTML = this.setInput(dateFrom);
    to.innerHTML = this.setInput(dateTo);

    this.clearSelector(selector);

    this.renderRange(selector, dateFrom, dateTo);

  }

  setInput(dateTime) {
    const timezone = dateTime.getTimezoneOffset();
    const dateTimeUTC = new Date();
    dateTimeUTC.setUTCFullYear(dateTime.getFullYear());
    dateTimeUTC.setUTCMonth(dateTime.getMonth());
    dateTimeUTC.setUTCDate(dateTime.getDate());
    dateTimeUTC.setUTCHours(dateTime.getHours() - (timezone % 60));

    const date = dateTimeUTC.toISOString().split('T')[0];
    return date.split('-').reverse().join('.');
  }

  clearSelector(selector) {
    const buttons = selector.querySelectorAll('[data-value]');

    for (let button of buttons) {
      button.classList.remove("rangepicker__selected-from");
      button.classList.remove("rangepicker__selected-between");
      button.classList.remove("rangepicker__selected-to");
    }
  }

  renderRange(selector, dateFrom, dateTo) {
    let dateSelected = new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate());

    while (dateSelected <= dateTo) {
      const selectedCell = selector.querySelector(`[data-value='${dateSelected}']`);
      if (selectedCell) {
        if (dateSelected.toISOString() === dateFrom.toISOString()) {
          selectedCell.classList.add("rangepicker__selected-from");
        }
        else if (dateSelected > dateFrom && dateSelected < dateTo) {
          selectedCell.classList.add("rangepicker__selected-between");
        }
        else if (dateSelected.toISOString() === dateTo.toISOString()) {
          selectedCell.classList.add("rangepicker__selected-to");
        }
      }
      dateSelected.setDate(dateSelected.getDate() + 1);
    }
  }

  initialize() {
    const {input} = this.subElements;

    document.addEventListener('pointerdown', this.onDocumentClick);
    input.addEventListener('pointerdown', this.onInputClick);

  }

  // TODO: при нажатии на стрелки селектора isRangePicker = false, хотя стрелка — часть элемента
  onDocumentClick = event => {
    const isOpen = this.element.classList.contains('rangepicker_open');

    const isRangePicker = this.element.contains(event.target);

    if (isOpen && !isRangePicker) {
      this.element.classList.remove('rangepicker_open');
    }
  };

  onInputClick = () => {
    this.element.classList.toggle('rangepicker_open');
  }



}

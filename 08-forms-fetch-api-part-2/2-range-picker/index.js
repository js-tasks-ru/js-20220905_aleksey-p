export default class RangePicker {

  element;
  subElements = {};
  firstSelect;

  constructor({
    from = new Date(),
    to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 3)} = {}) {
    this.range = {from, to};
    this.dateShow = new Date(from);

    this.render();
  }

  //region getters
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
  //endregion

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.getSubElements(wrapper);
    this.getSelector();
    this.setInput();
    this.selectRange();
    this.element = wrapper.firstElementChild;

    this.initialize();

  }

  //region getSelector
  getSelector() {
    const { selector } = this.subElements;
    const dateSecondShow = new Date(this.dateShow);
    dateSecondShow.setMonth(dateSecondShow.getMonth() + 1);

    selector.innerHTML = `<div class="rangepicker__selector-arrow"></div>
          <div class="rangepicker__selector-control-left" ></div>
          <div class="rangepicker__selector-control-right" ></div>
          ${this.getCalendar(this.dateShow)}
          ${this.getCalendar(dateSecondShow)}
    `;

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
      const style = isFirst ? `style="--start-from: ${firstDayOfWeek ? firstDayOfWeek : 7}">` : '>';

      const cell = `${button}${style}${day}</button>`;

      result.push(cell);

      isFirst = false;
    }

    return result.join('');
  }
  //endregion

  //region setInput
  setInput() {
    const {from, to} = this.subElements;
    from.innerHTML = this.getShortDate(this.range.from);
    to.innerHTML = this.getShortDate(this.range.to);
  }

  getShortDate(dateTime) {
    const timezone = dateTime.getTimezoneOffset();
    const dateTimeUTC = new Date();
    dateTimeUTC.setUTCFullYear(dateTime.getFullYear());
    dateTimeUTC.setUTCMonth(dateTime.getMonth());
    dateTimeUTC.setUTCDate(dateTime.getDate());
    dateTimeUTC.setUTCHours(dateTime.getHours() - (timezone % 60));

    const date = dateTimeUTC.toISOString().split('T')[0];
    return date.split('-').reverse().join('.');
  }
  //endregion

  //region selectRange
  selectRange() {
    const {selector} = this.subElements;
    const calendars = selector.querySelectorAll('.rangepicker__calendar');
    for (let calendar of calendars) {
      this.cleardateGrid(calendar);
      this.renderRange(calendar);
    }

  }



  cleardateGrid(calendar) {
    const buttons = calendar.querySelectorAll('[data-value]');

    for (let button of buttons) {
      button.classList.remove("rangepicker__selected-from");
      button.classList.remove("rangepicker__selected-between");
      button.classList.remove("rangepicker__selected-to");
    }
  }

  renderRange(calendar) {
    let dateSelected = new Date(this.range.from);

    while (dateSelected <= this.range.to) {

      const selectedCell = calendar.querySelector(`[data-value='${dateSelected}']`);
      if (selectedCell) {

        if (dateSelected.toISOString() === this.range.from.toISOString()) {
          selectedCell.classList.add("rangepicker__selected-from");
        }

        else if (dateSelected > this.range.from && dateSelected < this.range.to) {
          selectedCell.classList.add("rangepicker__selected-between");
        }

        else if (dateSelected.toISOString() === this.range.to.toISOString()) {
          selectedCell.classList.add("rangepicker__selected-to");
        }
      }
      dateSelected.setDate(dateSelected.getDate() + 1);
    }
  }
  //endregion

  initialize() {
    const {input, selector} = this.subElements;

    document.body.addEventListener('pointerdown', this.onDocumentClick);
    input.addEventListener('pointerdown', this.onInputClick);
    selector.addEventListener('pointerdown', this.onSelectorClick);

  }

  //region events
  onDocumentClick = event => {
    const isOpen = this.element.classList.contains('rangepicker_open');
    const isRangePicker = this.element.contains(event.target);

    if (isOpen && !isRangePicker) {
      this.element.classList.remove('rangepicker_open');
    }
  };

  onInputClick = () => this.element.classList.toggle('rangepicker_open');

  //region onSelectorClick
  onSelectorClick = event => {
    const {selector} = this.subElements;
    const target = event.target;

    const leftControl = selector.querySelector('.rangepicker__selector-control-left');
    const rightControl = selector.querySelector('.rangepicker__selector-control-right');
    const calendars = selector.querySelectorAll('.rangepicker__calendar');

    const directions = {
      left: -1,
      right: 1
    };

    if (leftControl.contains(target)) {
      this.changeCalendars(directions.left, calendars);
    }

    if (rightControl.contains(target)) {
      this.changeCalendars(directions.right, calendars);
    }

    for (let calendar of calendars) {
      const dateGrid = calendar.querySelector('.rangepicker__date-grid');
      if (dateGrid.contains(target)) {
        this.setRange(calendar, target);
      }
    }
  }

  changeCalendars(direction, calendars) {
    const directions = {
      left: -1,
      right: 1
    };

    const newDate = new Date(this.dateShow);
    newDate.setMonth(newDate.getMonth() + direction);

    if (direction === directions.left) {
      calendars[1].innerHTML = calendars[0].innerHTML;

      const wrapper = document.createElement('div');
      wrapper.innerHTML = this.getCalendar(newDate);
      calendars[0].innerHTML = wrapper.firstElementChild.innerHTML;

      this.renderRange(calendars[0]);
    }

    if (direction === directions.right) {
      calendars[0].innerHTML = calendars[1].innerHTML;

      const fixedDate = new Date(newDate);
      fixedDate.setMonth(fixedDate.getMonth() + 1);

      const wrapper = document.createElement('div');
      wrapper.innerHTML = this.getCalendar(fixedDate);
      calendars[1].innerHTML = wrapper.firstElementChild.innerHTML;

      this.renderRange(calendars[1]);
    }
    this.dateShow = new Date(newDate);
  }

  setRange(calendar, target) {
    const button = target.closest('[data-value]');
    if (!button) {
      return;
    }

    if (!this.firstSelect) {
      this.cleardateGrid(calendar);
      button.classList.add("rangepicker__selected-from");
      this.firstSelect = button;

    } else {
      this.range.from = new Date(this.firstSelect.dataset.value);
      this.range.to = new Date(button.dataset.value);
      this.firstSelect = null;

      this.setInput();
      this.selectRange();

      this.element.dispatchEvent(new Event('date-select'));
    }
  }
  //endregion

  //endregion

  remove() {
    this.element.remove();
    document.body.removeEventListener('pointerdown', this.onDocumentClick);
  }

  destroy() {
    this.remove();

    this.element = null;
    this.subElements = {};
    this.firstSelect = null;

    this.range = {
      from: new Date(),
      to: new Date()
    };
  }
}


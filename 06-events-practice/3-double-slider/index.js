export default class DoubleSlider {

  //region default
  element;
  subElements = {};
  dragging;

  constructor({
    min = 1,
    max = 10,
    formatValue = value => '$' + value,
    selected = {from: min, to: max}
  } = {}) {
    this.min = min;
    this.max = max;
    this.selected = selected;
    this.formatValue = formatValue;
    this.render();
  }

  initializeElement() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.element = this.element.firstElementChild;
  }

  get template() {
    return `
    <div class="range-slider">
    <span data-element="from">${this.formatValue(this.selected.from)}</span>
    <div data-element="inner" class="range-slider__inner">
      <span data-element="progress" class="range-slider__progress" style="left: 0; right: 0"></span>
      <span data-element="thumbLeft" class="range-slider__thumb-left" style="left: 0"></span>
      <span data-element="thumbRight" class="range-slider__thumb-right" style="right: 0"></span>
    </div>
    <span data-element="to">${this.formatValue(this.selected.to)}</span>
  </div>`;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      this.subElements[subElement.dataset.element] = subElement;
    }
  }
  //endregion

  render() {
    this.initializeElement();
    this.getSubElements();
    this.initializeEvents();
  }

  initializeEvents() {

    const {thumbLeft, thumbRight} = this.subElements;
    thumbLeft.addEventListener('pointerdown', this.onThumbPointerDown);
    thumbRight.addEventListener('pointerdown', this.onThumbPointerDown);
  }

  //region events
  onThumbPointerDown = event => {

    event.preventDefault();
    this.dragging = event.target;
    this.dragging.classList.add('range-slider_dragging');

    document.addEventListener('pointermove', this.onThumbPointerMove);
    document.addEventListener('pointerup', this.onThumbPointerUp);
  }

  onThumbPointerMove = event => {
    event.preventDefault();

    const {thumbLeft, thumbRight} = this.subElements;
    const directions = {
      left: 'left',
      right: 'right'
    };

    switch (this.dragging) {
    case thumbLeft:
      this.thumbLeftMove(directions.left, event);
      break;

    case thumbRight:
      this.thumbRightMove(directions.right, event);
      break;
    }
  }

  //region onPointerMove common functions
  thumbLeftMove(direction, {clientX}) {

    const {inner, thumbRight} = this.subElements;

    const {left: thumbRightInnerSide} = thumbRight.getBoundingClientRect();
    const {left: innerLeftSide, width} = inner.getBoundingClientRect();

    if (thumbRightInnerSide - clientX < 0) {
      this.update(direction, width, thumbRightInnerSide - innerLeftSide);

    } else if (clientX - innerLeftSide > 0) {
      this.update(direction, width, clientX - innerLeftSide);

    } else {
      this.update(direction, width);
    }
  }

  thumbRightMove(direction, {clientX}) {
    const {inner, thumbLeft} = this.subElements;

    const {right: thumbLeftInnerSide} = thumbLeft.getBoundingClientRect();
    const {right: innerRightSide, width} = inner.getBoundingClientRect();

    if (thumbLeftInnerSide - clientX > 0) {
      this.update(direction, width, innerRightSide - thumbLeftInnerSide);

    } else if (innerRightSide - clientX > 0) {
      this.update(direction, width, innerRightSide - clientX);

    } else {
      this.update(direction, width);
    }
  }
  //endregion

  onThumbPointerUp = () => {
    this.dragging.classList.remove('range-slider_dragging');
    document.removeEventListener('pointermove', this.onThumbPointerMove);
    document.removeEventListener('pointerup', this.onThumbPointerUp);

    this.element.dispatchEvent(new CustomEvent('range-select', {
      detail: { from: this.selected.from, to: this.selected.to },
      bubbles: true
    }));
  }
  //endregion

  update(direction, width, directionPaste = 0) {

    const {from, to, progress, thumbLeft, thumbRight} = this.subElements;

    const newX = (directionPaste / width * 100).toFixed(2);
    this.dragging.style[direction] = progress.style[direction] = newX + '%';

    const range = this.max - this.min;
    const fromValue = this.min + parseInt(thumbLeft.style.left) * 0.01 * range;
    const toValue = this.min + (100 - parseInt(thumbRight.style.right)) * 0.01 * range;

    this.selected.from = fromValue;
    this.selected.to = toValue;

    from.innerHTML = this.formatValue(fromValue.toFixed(0));
    to.innerHTML = this.formatValue(toValue.toFixed(0));
  }

  remove() {
    this.element.remove();
  }

  destroy() {

    this.remove();
    document.removeEventListener('pointerdown', this.onThumbPointerDown);

    this.element = null;
    this.subElements = {};
    this.dragging = null;

    this.min = 1;
    this.max = 10;
    this.selected = {from: this.min, to: this.max};

  }
}


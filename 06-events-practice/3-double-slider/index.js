export default class DoubleSlider {
  element;
  subElements = {};
  dragging;

  constructor({
    min = 4,
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

  getSubElements(parent) {
    const elements = parent.querySelectorAll('[data-element]');
    let result = {};

    for (let subElement of elements) {
      result[subElement.dataset.element] = subElement;
    }
    return result;
  }

  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.element = this.element.firstElementChild;

    this.subElements = this.getSubElements(this.element);
    this.initialize();
  }

  update() {
    const {from, to} = this.subElements;

    from.innerHTML = this.formatValue(this.selected.from.toFixed(0));
    to.innerHTML = this.formatValue(this.selected.to.toFixed(0));

  }

  initialize() {
    this.subElements.thumbLeft.addEventListener('pointerdown', this.onThumbPointerDown);
    this.subElements.thumbRight.addEventListener('pointerdown', this.onThumbPointerDown);
  }

  onThumbPointerDown = event => {
    event.preventDefault();
    this.dragging = event.target;
    this.dragging.classList.add('range-slider_dragging');

    document.addEventListener('pointermove', this.onThumbPointerMove);
    document.addEventListener('pointerup', this.onThumbPointerUp);
  }

  onThumbPointerMove = event => {
    event.preventDefault();
    const {inner, thumbLeft, thumbRight, progress} = this.subElements;

    const {right: fromThumbRight} = thumbLeft.getBoundingClientRect();
    const {left: toThumbLeft} = thumbRight.getBoundingClientRect();
    const {left: innerLeftSide, right: innerRightSide, width: innerWidth} = inner.getBoundingClientRect();

    const directions = {
      left: 'left',
      right: 'right'
    };

    let direction;
    let directionPaste;

    switch (this.dragging) {
    case thumbLeft:
      direction = directions.left;
      if (event.clientX - innerLeftSide > 0) {
        directionPaste = event.clientX - innerLeftSide;
      } else {
        directionPaste = 0;
      }
      if (toThumbLeft - event.clientX < 0) {
        directionPaste = toThumbLeft - innerLeftSide;
      }
      break;

    case thumbRight:
      direction = directions.right;
      if (innerRightSide - event.clientX > 0) {
        directionPaste = innerRightSide - event.clientX;
      } else {
        directionPaste = 0;
      }
      if (fromThumbRight - event.clientX > 0) {
        directionPaste = innerRightSide - fromThumbRight;
      }
      break;
    }

    const changedX = (directionPaste / innerWidth * 100).toFixed(2);
    this.dragging.style[direction] = progress.style[direction] = changedX + '%';

    const range = this.max - this.min;
    this.selected.from = this.min + parseInt(thumbLeft.style.left) * 0.01 * range;
    this.selected.to = this.min + (100 - parseInt(thumbRight.style.right)) * 0.01 * range;

    this.update();
  }

  onThumbPointerUp = () => {
    this.dragging.classList.remove('range-slider_dragging');
    document.removeEventListener('pointermove', this.onThumbPointerMove);
    document.removeEventListener('pointerup', this.onThumbPointerUp);

    this.element.dispatchEvent(new CustomEvent('range-select', {
      detail: this.getValues(),
      bubbles: true
    }));
  }

  getValues() {
    return { from: this.selected.from, to: this.selected.to };
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    document.removeEventListener('pointerdown', this.onThumbPointerDown);
    document.removeEventListener('pointermove', this.onThumbPointerMove);
    document.removeEventListener('pointerup', this.onThumbPointerUp);

    this.remove();

  }
}


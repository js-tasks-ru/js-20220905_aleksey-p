class Tooltip {
  static #onlyInstance = null;
  element;
  target;

  constructor() {
    if (!Tooltip.#onlyInstance) {
      Tooltip.#onlyInstance = this;
    } else {
      return Tooltip.#onlyInstance;
    }
  }

  tooltipPosition = event => {

    const x = event.clientX;
    const y = event.clientY;

    const range = 5;

    this.element.style.left = (x + range) + 'px';
    this.element.style.top = (y + range) + 'px';
  }

  showTooltip = event => {
    const {target} = event;
    const tooltipText = target.dataset.tooltip;
    if (tooltipText) {
      this.render(tooltipText);
      document.body.addEventListener('pointermove', this.tooltipPosition);
    }
  }

  hideTooltip = () => {
    Tooltip.#onlyInstance.element.remove();
    document.body.removeEventListener('pointermove', this.tooltipPosition);
  }

  initialize () {
    document.body.addEventListener('pointerover', this.showTooltip);
    document.body.addEventListener('pointerout', this.hideTooltip);
  }

  render(tooltipText) {
    this.element = document.createElement('div');
    this.element.className = 'tooltip';
    this.element.innerHTML = tooltipText;
    document.body.append(this.element);
  }

  remove() {
    document.body.removeEventListener('pointerover', this.showTooltip);
    document.body.removeEventListener('pointerout', this.hideTooltip);
    this.hideTooltip();
  }
  destroy() {
    this.remove();
  }
}

export default Tooltip;

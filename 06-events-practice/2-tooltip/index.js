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
    const w = event.width;
    const h = event.height;
    Tooltip.#onlyInstance.element.style.left = w + 'px';
    Tooltip.#onlyInstance.element.style.left = h + 'px';

  }

  showTooltip = event => {
    const {target} = event;
    const tooltipText = target.dataset.tooltip;
    if (tooltipText) {
      this.render();
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
}

export default Tooltip;

// class Tooltip {
//   static #onlyInstance = null;
//   constructor(parent = document.body) {
//     if (!Tooltip.#onlyInstance) {
//       Tooltip.#onlyInstance = this;
//     } else {
//       return Tooltip.#onlyInstance;
//     }
//     this.parent = parent;
//   }
//   initialize() {
//     this.parent.addEventListener('pointerover', this.showTooltip)
//     this.parent.addEventListener('pointerout', this.removeTooltip)
//   }
//   render(message) {
//     this.element = document.createElement('div');
//     this.element.className = 'tooltip';
//     this.element.innerHTML = message;
//     this.parent.append(this.element);
//   }
//   showTooltip = (event) => {
//     const target = event.target;
//     let message = target.dataset.tooltip;
//     this.render(message);
//     this.element.style.left = event.pageX + 'px';
//     this.element.style.top = event.pageY + 'px';
//
//   }
//   removeTooltip = () => {
//     this.element.remove();
//   }
//   remove() {
//     this.parent.removeEventListener('pointerover', this.showTooltip);
//     this.parent.removeEventListener('pointerout', this.removeTooltip);
//     this.removeTooltip()
//   }
//   destroy() {
//     this.remove();
//   }
//
// }
//
// export default Tooltip;

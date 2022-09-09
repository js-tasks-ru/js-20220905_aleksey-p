export default class NotificationMessage {
  element;
  constructor(
    message = '',
    {
      duration = 0,
      type = '',
    } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.render();
  }

  get template() {
    return `
    <div class="notification ${this.type}">
       <div style="--value:${this.duration}s">
          <div class="timer"></div>
          <div class="inner-wrapper">
              <div class="notification-header">${this.type}</div>
              <div class="notification-body">
                  ${this.message}
              </div>
          </div>
      </div></div>`;
  }
  show(elem = document.createElement('div')) {
    elem.innerHTML = this.template;
    this.element = elem.firstElementChild;
    setTimeout(() => this.remove(), this.element.duration);

  }
  render() {
    this.show();
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

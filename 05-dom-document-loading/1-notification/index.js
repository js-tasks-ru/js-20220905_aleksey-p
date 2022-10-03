export default class NotificationMessage {
  static element;
  constructor(
    message,
    {
      duration = 2000,
      type = 'success',
    } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  get template() {
    return `
    <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
          <div class="timer"></div>
          <div class="inner-wrapper">
              <div class="notification-header">${this.type}</div>
              <div class="notification-body">
                  ${this.message}
              </div>
          </div>
          </div>
    </div>`;
  }

  show(elem = document.createElement('div')) {
    if (NotificationMessage.element) {
      NotificationMessage.element.remove();
    }

    elem.innerHTML = this.template;
    this.element.innerHTML = elem.outerHTML;
    this.element = this.element.firstElementChild;
    this.element.style.display = '';

    document.body.append(this.element);
    setTimeout(() => this.remove(), this.duration);
    NotificationMessage.element = this;

  }
  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.element = this.element.firstElementChild;
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

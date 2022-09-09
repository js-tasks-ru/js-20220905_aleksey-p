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

  show(elem = this.element) {
    elem.innerHTML = this.element.outerHTML;
    this.element.innerHTML = elem.outerHTML;
    return elem.outerHTML;
  }
  render() {
    this.element = document.createElement('div');
    this.element.className = `notification ${this.type}`;
    this.element.innerHTML = `
     <div style="--value:${this.duration}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
            <div class="notification-header">success</div>
            <div class="notification-body">
                ${this.message}
            </div>
        </div>
    </div>`;

  }
  remove() {
    this.element.remove();
  }
  destroy() {
    this.remove();
  }
}

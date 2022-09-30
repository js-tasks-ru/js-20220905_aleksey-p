export default class SortableList {
  element;
  draggingItem;
  shifts = {};
  subElements = {};
  itemPlaceholder;

  constructor({ items = [] } = {}) {

    this.items = items;
    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = "<ul data-element='list'></ul><ul data-element='currentElement'></ul>";
    this.element = wrapper;
    this.setPlaceholder();
    this.getSubElements();

    this.stylizeItems();
    this.subElements.list.append(...this.items);
    this.initialize();
  }

  // region render common functions
  setPlaceholder() {
    this.itemPlaceholder = document.createElement("li");
    this.itemPlaceholder.className = "sortable-list__item sortable-list__placeholder";
    this.itemPlaceholder.style.backgroundColor = "transparent";
  }

  getSubElements() {
    const subElements = this.element.querySelectorAll('[data-element]');

    for (const subElement of subElements) {
      this.subElements[subElement.dataset.element] = subElement;
    }
  }

  stylizeItems() {
    this.items.map(item => item.classList.add("sortable-list__item"));
  }

  //endregion

  initialize() {
    this.element.addEventListener('pointerdown', this.onPointerDown);
  }

  onPointerDown = event => {
    const target = event.target;
    const listItem = target.closest(".sortable-list__item");

    if (!listItem) {return;}

    if (target.closest("[data-grab-handle]")) {
      this.dragItem(listItem, event);
    }

    if (target.closest("[data-delete-handle]")) {
      listItem.remove();
    }
  }

  onPointerMove = event => {
    this.subElements.currentElement.append(this.draggingItem);
    this.setPosition(event);
    this.updatePlaceholder();
  }

  onPointerUp = () => {
    this.subElements.list.insertBefore(this.draggingItem, this.itemPlaceholder);

    this.setDefaultStyle();
    this.draggingItem = null;
    this.itemPlaceholder.remove();

    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  }

  // region onPointerDown common function
  dragItem(listItem, event) {
    this.draggingItem = listItem;

    this.setDraggingClass();
    this.setShifts(event);
    this.setPosition(event);

    this.subElements.list.insertBefore(this.itemPlaceholder, this.draggingItem);

    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  //region dragItem common functions
  setDraggingClass() {
    this.draggingItem.style.width = this.draggingItem.offsetWidth + 'px';
    this.draggingItem.style.height = this.draggingItem.offsetHeight + 'px';
    this.draggingItem.classList.add('sortable-list__item_dragging');
  }

  setShifts({clientX, clientY}) {
    const itemRect = this.draggingItem.getBoundingClientRect();

    this.shifts = {
      x: clientX - itemRect.x,
      y: clientY - itemRect.y
    };
  }
  //endregion

  //endregion

  // region onPointerMove common function
  updatePlaceholder() {
    const previousItem = this.itemPlaceholder.previousElementSibling;
    const nextItem = this.itemPlaceholder.nextElementSibling;

    const previousTop = previousItem?.getBoundingClientRect().top;
    const nextBottom = nextItem?.getBoundingClientRect().bottom;

    const {top: itemTop, bottom: itemBottom} = this.draggingItem.getBoundingClientRect();

    if (itemTop <= previousTop) {
      this.subElements.list.insertBefore(this.itemPlaceholder, previousItem);
    }

    if (itemBottom >= nextBottom) {
      this.subElements.list.insertBefore(this.itemPlaceholder, nextItem.nextElementSibling);
    }
  }
  // endregion

  // region onPointerUp common function
  setDefaultStyle() {
    this.draggingItem.style.left = '';
    this.draggingItem.style.top = '';
    this.draggingItem.style.width = '';
    this.draggingItem.style.height = '';
    this.draggingItem.classList.remove('sortable-list__item_dragging');
  }
  // endregion

  setPosition({pageX, pageY}) {
    this.draggingItem.style.left = pageX - this.shifts.x + 'px';
    this.draggingItem.style.top = pageY - this.shifts.y + 'px';
  }

  remove() {
    this.element.remove();

  }

  destroy() {
    this.remove();

    this.element = null;
    this.draggingItem = null;
    this.shifts = {};
    this.subElements = {};
    this.itemPlaceholder = null;
    this.items = [];
  }
}

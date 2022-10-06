export default class SortableList {

  //region default
  element;
  subElements = {};

  draggingItem;
  shifts = {};
  itemPlaceholder;

  constructor({ items = [] } = {}) {

    this.items = items;
    this.render();
  }
  //endregion


  render() {
    const wrapper = document.createElement('div');
    wrapper.dataset.element = "imageListContainer";
    wrapper.innerHTML = "<ul data-element='list' style='padding: 0'></ul><ul data-element='currentElement'></ul>";
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
    this.items.map(item => {
      item.classList.add("sortable-list__item");
      item.classList.add("products-edit__imagelist-item");
    });

  }

  //endregion


  initialize() {
    this.element.addEventListener('pointerdown', this.onPointerDown);
  }

  onPointerDown = event => {
    event.preventDefault();

    const target = event.target;
    const listItem = target.closest(".sortable-list__item");

    if (!listItem) {return;}

    if (target.closest("[data-grab-handle]")) {
      this.dragItem(listItem, event);
      this.setShifts(event);
    }

    if (target.closest("[data-delete-handle]")) {
      listItem.remove();
    }
  }

  onPointerMove = event => {
    event.preventDefault();

    const {currentElement} = this.subElements;
    currentElement.append(this.draggingItem);

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

    this.setDraggingProperties();
    this.setPosition(event);

    this.subElements.list.insertBefore(this.itemPlaceholder, this.draggingItem);

    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  //region dragItem common functions
  setDraggingProperties() {
    this.draggingItem.style.width = this.draggingItem.offsetWidth + 'px';
    this.draggingItem.style.height = this.draggingItem.offsetHeight + 'px';
    this.draggingItem.classList.add('sortable-list__item_dragging');
  }
  //endregion

  setShifts({clientX, clientY}) {
    this.shifts = {
      x: Math.abs(clientX - this.draggingItem.getBoundingClientRect().x),
      y: Math.abs(clientY - this.draggingItem.getBoundingClientRect().y)
    };
  }

  //endregion

  // region onPointerMove common function
  updatePlaceholder() {
    const previousItem = this.itemPlaceholder.previousElementSibling;
    const nextItem = this.itemPlaceholder.nextElementSibling;

    if (this.draggingItem.getBoundingClientRect().top <= previousItem?.getBoundingClientRect().top) {
      this.subElements.list.insertBefore(this.itemPlaceholder, previousItem);
    }

    if (this.draggingItem.getBoundingClientRect().bottom >= nextItem?.getBoundingClientRect().bottom) {
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
    this.draggingItem.style.position = "";
    this.draggingItem.classList.remove('sortable-list__item_dragging');
  }
  // endregion


  setPosition({clientX, clientY}) {

    const {x: shiftX, y: shiftY} = this.shifts;
    this.draggingItem.style.position = "fixed";
    this.draggingItem.style.left = clientX - shiftX + 'px';
    this.draggingItem.style.top = clientY - shiftY + 'px';
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

export default class SortableList {
  element;
  draggingItem;
  shifts = {};
  subElements = {};
  itemIndex = 0;
  itemPlaceholder;

  constructor({ items = [] } = {}) {

    this.items = items;
    this.render();
  }

  stylizeItems() {
    this.items.map(item => item.classList.add("sortable-list__item"));
  }

  getSubElements() {
    const subElements = this.element.querySelectorAll('[data-element]');

    for (const subElement of subElements) {
      this.subElements[subElement.dataset.element] = subElement;
    }
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

  initialize() {
    this.element.addEventListener('pointerdown', this.onElementClick);
  }

  onElementClick = event => {
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

  dragItem(listItem, event) {
    this.draggingItem = listItem;
    this.itemIndex = [...this.subElements.list.children].indexOf(this.draggingItem);

    this.setDraggingClass();
    this.setShifts(event);
    this.setPosition(event);

    this.insertPlaceholder(this.itemIndex);

    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  //region dragItem functions
  setPlaceholder() {
    this.itemPlaceholder = document.createElement("li");
    this.itemPlaceholder.className = "sortable-list__item sortable-list__placeholder";
    this.itemPlaceholder.style.backgroundColor = "transparent";
  }

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

  setPosition({pageX, pageY}) {
    this.draggingItem.style.left = pageX - this.shifts.x + 'px';
    this.draggingItem.style.top = pageY - this.shifts.y + 'px';
  }

  insertPlaceholder(index) {
    const currentElement = this.subElements.list.children[index];
    this.subElements.list.insertBefore(this.itemPlaceholder, currentElement);
  }

  onPointerMove = event => {
    this.subElements.currentElement.append(this.draggingItem);
    this.setPosition(event);
    this.updatePlaceholder();
  }

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

  onPointerUp = () => {

    this.subElements.list.insertBefore(this.draggingItem, this.itemPlaceholder);
    this.setDefaultStyle();
    this.itemPlaceholder.remove();

    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  }

  setDefaultStyle() {
    this.draggingItem.style.left = '';
    this.draggingItem.style.top = '';
    this.draggingItem.style.width = '';
    this.draggingItem.style.height = '';
    this.draggingItem.classList.remove('sortable-list__item_dragging');
  }
}

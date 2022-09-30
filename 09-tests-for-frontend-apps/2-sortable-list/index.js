export default class SortableList {
  element;
  draggingItem;
  shifts = {};
  itemIndex = 0;
  itemPlaceholder = document.createElement("li");

  constructor({ items = [] } = {}) {

    this.items = items;
    this.render();
  }

  stylizeItems() {
    this.items.map(item => item.classList.add("sortable-list__item"));
  }

  render() {
    const wrapper = document.createElement('ul');
    this.stylizeItems();
    wrapper.append(...this.items);

    this.element = wrapper;

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
    this.itemIndex = [...this.element.children].indexOf(this.draggingItem);

    this.setPlaceholder();

    this.setDraggingClass();
    this.setShifts(event);
    this.setPosition(event);

    this.insertPlaceholder(this.itemIndex);

    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  //region dragItem functions
  setPlaceholder() {
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

  setPosition({clientX, clientY}) {
    this.draggingItem.style.left = clientX - this.shifts.x + 'px';
    this.draggingItem.style.top = clientY - this.shifts.y + 'px';
  }

  insertPlaceholder(index) {
    const currentElement = this.element.children[index];
    if (currentElement !== this.itemPlaceholder) {
      this.element.insertBefore(this.itemPlaceholder, currentElement);
    }
  }

  onPointerMove = event => {
    this.setPosition(event);
    this.updatePlaceholder();
  }

  updatePlaceholder() {
    const items = [...this.element.children];
    const previousItem = this.itemPlaceholder.previousElementSibling;
    const nextItem = this.itemPlaceholder.nextElementSibling;

    const {top: previousTop} = previousItem.getBoundingClientRect();
    const {bottom: nextBottom} = nextItem.getBoundingClientRect();

    const {top: itemTop, bottom: itemBottom} = this.draggingItem.getBoundingClientRect();




    // const {top: itemTop, bottom: itemBottom} = this.draggingItem.getBoundingClientRect();
    // const {top: listTop, bottom: listBottom} = this.element.getBoundingClientRect();
    //
    //
    // if (itemTop <= listTop) {
    //   const firstIndex = [...this.element.children].indexOf(this.element.firstElementChild);
    //   this.insertPlaceholder(firstIndex);
    // }
    //
    // if (itemBottom >= listBottom) {
    //   const lastIndex = items.indexOf(this.element.lastElementChild);
    //   this.insertPlaceholder(lastIndex + 1);
    // }
    //
    // const {top: previousItemTop} = items[previousIndex].getBoundingClientRect();
    // const {top: nextItemTop} = items[nextIndex].getBoundingClientRect();
    //
    // if (itemTop <= previousItemTop) {
    //   if (items[previousIndex] === this.draggingItem) {return;}
    //   this.insertPlaceholder([...this.element.children].indexOf(this.itemPlaceholder) - 1);
    //   console.log(itemTop, previousItemTop);
    // }
    //
    // if (itemTop <= nextItemTop) {
    //   if (items[nextIndex] === this.draggingItem) {return;}
    //   this.insertPlaceholder(nextIndex);
    // }
  }

  onPointerUp = () => {

    this.element.insertBefore(this.draggingItem, this.itemPlaceholder, this.element);
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

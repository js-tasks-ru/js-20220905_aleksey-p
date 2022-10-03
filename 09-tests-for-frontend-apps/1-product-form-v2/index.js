import SortableList from '../2-sortable-list/index.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

// TODO: записал вопросы в TODO

// subElements:
//    productForm,
//    title,
//    description,
//    sortableListContainer:
//       imageListContainer
//       uploadImage
//    subcategory,
//    price,
//    discount,
//    quantity,
//    status,

export default class ProductForm {

  //region default
  element;
  subElements = {};
  customEvent;

  dataProduct = [];
  dataCategories = [];

  constructor (productId) {
    this.productId = productId;
  }
  //endregion


  async render () {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.getSubElements(wrapper);
    this.getProductCategories();

    this.element = wrapper.firstElementChild;
    this.setMode();
    this.initialize();
  }

  //region render common functions
  getProductCategories() {

    const url = new URL("api/rest/categories", BACKEND_URL);
    url.searchParams.set("_sort", "weight");
    url.searchParams.set("_refs", "subcategory");

    fetchJson(url.href)
      .then(result => {
        this.dataCategories = [...result];
        const {subcategory: subcategories} = this.subElements;

        subcategories.innerHTML = this.dataCategories.map(category =>
          category.subcategories.map(subcategory =>

            `<option value='${subcategory.id}'>
                ${category.title} &gt; ${subcategory.title}
            </option>`

          ).join('')).join('');
      });
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    for (const subElement of elements) {
      this.subElements[subElement.dataset.element] = subElement;
    }

    const inputs = element.querySelectorAll('[name]');
    for (const input of inputs) {
      this.subElements[input.name] = input;
    }
  }

  get template() {
    return `
    <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required="" class="form-control" name="description" placeholder="Описание товара"></textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortableListContainer">
          <label class="form-label">Фото</label>
          <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          <select class="form-control" name="subcategory"></select>
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" type="number" name="price" class="form-control" placeholder="100">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required="" type="number" name="discount" class="form-control" placeholder="0">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required="" type="number" name="quantity" class="form-control" placeholder="1">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select class="form-control" name="status">
            <option value="1">Активен</option>
            <option value="0">Неактивен</option>
          </select>
        </div>
        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            Сохранить товар
          </button>
        </div>
      </form>
    </div>`;
  }
  //endregion


  initialize() {
    this.subElements.uploadImage.addEventListener('pointerdown', this.onUploadImage);

    this.element.addEventListener('submit', event => {
      event.preventDefault();
      this.element.dispatchEvent(this.customEvent);
    });
  }

  onUploadImage = () => {
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = () => {
      const [file] = fileInput.files;

      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;

        formData.append('image', file);

        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;

        const url = new URL("3/image", "https://api.imgur.com");

        fetchJson(url.href, {method: 'POST',
          headers: {Authorization: `Client-ID ${IMGUR_CLIENT_ID}`}, body: formData})
          .then(result => {
            imageListContainer.append(this.getImageItem(result.data.link, file.name));

            uploadImage.classList.remove('is-loading');
            uploadImage.disabled = false;

            fileInput.remove();
          });
      }
    };

    fileInput.hidden = true;
    document.body.appendChild(fileInput);
    fileInput.click();
  };


  setMode() {
    if (this.productId) {
      this.onUpdateMode();

    } else {
      this.onCreateMode();

    }
  }


  onUpdateMode() {
    this.customEvent = new CustomEvent('product-updated', {detail: 'Данные обновлены'});

    const url = new URL("api/rest/products", BACKEND_URL);
    url.searchParams.append("id", this.productId);

    fetchJson(url.href)
      .then(result => {

        this.dataProduct = [...result][0];
        this.insertDataProduct();
      });
  }

  //region update mode common functions
  insertDataProduct() {
    this.subElements.title.value = this.dataProduct.title;
    this.subElements.description.innerHTML = this.dataProduct.description;
    this.setProductImages();
    this.setProductProperty("subcategory");
    this.subElements.price.value = this.dataProduct.price;
    this.subElements.discount.value = this.dataProduct.discount;
    this.subElements.quantity.value = this.dataProduct.quantity;
    this.setProductProperty("status");
  }

  setProductImages() {

    const list = new SortableList({
      items: this.dataProduct.images.map(image => {
        const element = document.createElement('li');

        element.innerHTML =
            `<input type="hidden" name="url" value="${image.url}">
            <input type="hidden" name="source" value="${image.source}">
            <span>
              <img src="icon-grab.svg" data-grab-handle="" alt="grab">
              <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
              <span>${image.source}</span>
            </span>
            <button type="button">
              <img src="icon-trash.svg" data-delete-handle="" alt="delete">
            </button>`;

        return element;
      }
      )
    });

    const {sortableListContainer: container} = this.subElements;
    container.insertBefore(list.element, container.lastElementChild);

    this.subElements[list.element.dataset.element] = list.element;
  }

  setProductProperty(property) {
    const options = this.subElements[property].children;
    [...options].map(option =>

      option.getAttribute("value") !== ("" + this.dataProduct[property]) ?

        option.removeAttribute("selected") :
        option.setAttribute('selected', ''));
  }
  //endregion

  onCreateMode() {
    this.customEvent = new CustomEvent('product-saved', {detail: 'Данные сохранены'});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();


    //TODO: нужно ли делать такую чистку в  конце?
    this.element = null;
    this.subElements = {};
    this.customEvent = null;

    this.dataProduct = [];
    this.dataCategories = [];

  }
}

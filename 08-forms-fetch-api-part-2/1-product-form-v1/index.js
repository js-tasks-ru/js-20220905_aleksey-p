import escapeHtml from './utils/escape-html.js';
//import fetchJson from "./utils/fetch-json";

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

// subElements:
//    productForm,
//    productTitle,
//    productDescription,
//    sortableListContainer:
//       imageListContainer
//       uploadImage
//    productSubcategory,
//    productPrice,
//    productDiscount,
//    productQuantity,
//    productStatus,
//

export default class ProductForm {
  element;
  subElements = {};
  product = {};
  dataCategories = {};

  constructor (productId) {
    this.productId = productId;
    this.updateMode = !!this.productId.length;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    [...elements].map(item => this.subElements[item.dataset.element] = item);
  }

  get template() {
    return `
    <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required="" type="text" name="title" data-element="productTitle" class="form-control" placeholder="Название товара">
            </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortableListContainer">
          <label class="form-label">Фото</label>
          <div data-element="imageListContainer">
            <ul class="sortable-list"></ul>
          </div>
          <button type="button" data-element="uploadImage" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          <select class="form-control" data-element="productSubcategory" name="subcategory"></select>
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" type="number" data-element="productPrice" name="price" class="form-control" placeholder="100">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required="" type="number" data-element="productDiscount" name="discount" class="form-control" placeholder="0">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required="" type="number" class="form-control" data-element="productQuantity" name="quantity" placeholder="1">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select class="form-control" data-element="productStatus" name="status">
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

  async render () {
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.element = this.element.firstElementChild;
    this.getSubElements();
    this.subElements.uploadImage.addEventListener('click', this.onUploadImage);
    await this.getProductCategories(this.subElements.productSubcategory);
    this.updateMode ? await this.onUpdateMode() : this.onCreateMode();
  }

  initializeEventListener(customEvent) {
    this.element.addEventListener('submit', event => {
      event.preventDefault();
      this.element.dispatchEvent(customEvent);
    });
  }

  //region updateMode
  async onUpdateMode() {
    this.initializeEventListener(new CustomEvent('product-updated', {detail: 'Данные обновлены'}));

    try {
      const productsUrl = `api/rest/products?id=${this.productId}`;
      this.product = [...await (await fetch(escapeHtml(`${BACKEND_URL}/${productsUrl}`))).json()][0];



      this.setProductElements();
    } catch (e) {
      throw new Error(e);
    }
  }

  async getProductCategories(selectObj) {
    // error: при escapeHTML выводит запрос без subcategory
    const categoriesUrl = 'api/rest/categories?_sort=weight&_refs=subcategory';
    this.dataCategories = [... await (await fetch(`${BACKEND_URL}/${categoriesUrl}`)).json()];

    selectObj.innerHTML = this.dataCategories.map(category => category.subcategories.map(subcategory =>
      `<option value='${subcategory.id}'>${category.title} &gt; ${subcategory.title}</option>`
    ).join('')).join('');
  }

  setProductElements() {
    this.subElements.productTitle.value = this.product.title;
    this.subElements.productDescription.innerHTML = this.product.description;
    this.setProductImages();
    this.subElements.productPrice.value = this.product.price;
    this.subElements.productDiscount.value = this.product.discount;
    this.subElements.productQuantity.value = this.product.quantity;
    this.setProductStatus();
    this.setProductSubcategory();


  }

  setProductImages() {
    this.subElements.imageListContainer.firstElementChild.innerHTML = this.product.images.map(image => `
    <li class="products-edit__imagelist-item sortable-list__item" style="">
      <input type="hidden" name="url" value="${image.url}">
      <input type="hidden" name="source" value="${image.source}">
      <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
        <span>${image.source}</span>
      </span>
      <button type="button">
        <img src="icon-trash.svg" data-delete-handle="" alt="delete">
      </button>
    </li>
      `).join('');
  }

  setProductSubcategory() {
    const options = this.subElements.productSubcategory.children;
    [...options].map(option =>
      option.getAttribute("value") !== ("" + this.product.subcategory) ?
        option.removeAttribute("selected") : option.setAttribute('selected', ''));
  }

  setProductStatus() {
    const options = this.subElements.productStatus.children;
    [...options].map(option =>
      option.getAttribute("value") !== ("" + this.product.status) ?
        option.removeAttribute("selected") : option.setAttribute('selected', ''));
  }
  //endregion

  onCreateMode() {
    this.initializeEventListener(new CustomEvent('product-saved', {detail: 'Данные сохранены'}));
  }

  onUploadImage = () => {
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = async () => {
      const [file] = fileInput.files;

      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;

        formData.append('image', file);

        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;

        const result = await (await fetch('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: formData,
        })).json();

        imageListContainer.append(this.getImageItem(result.data.link, file.name));

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        // Remove input from body
        fileInput.remove();
      }
    };

    // must be in body for IE
    fileInput.hidden = true;
    document.body.appendChild(fileInput);
    fileInput.click();
  };

  getImageItem (url, name) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="./icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${name}" src="${url}">
          <span>${name}</span>
        </span>

        <button type="button">
          <img src="./icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`;

    return wrapper.firstElementChild;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

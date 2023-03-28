import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";

import ImageUploader from "../image-uploader.js";

const BACKEND_URL = "https://course-js.javascript.ru";
const PRODUCTS_URL = "api/rest/products";
const CATEGORIES_URL = "api/rest/categories";

export default class ProductForm {
  element;
  subElements = {};
  product = {
    title: "",
    description: "",
    images: [],
    category: "",
    price: 100,
    discount: 0,
    quantity: 1,
    status: 1,
  };

  categories = [];

  onFormSubmit = (e) => {
    e.preventDefault();
    this.save();
  };

  onDeleteButtonClick = (e) => {
    const button = e.target.closest("[data-delete]");
    if (button) {
      const imageToDelete = button.dataset.delete;
      this.product.images = this.product.images.filter((image) => {
        return image.source !== imageToDelete;
      });
      button.closest(".sortable-list__item").remove();
    }
  };

  onUploadImageClick = (e) => {
    e.preventDefault();

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.hidden = true;
    document.body.append(fileInput);

    fileInput.addEventListener("change", async () => {
      const [file] = fileInput.files;

      if (file) {
        const { uploadImage, imageListContainer } = this.subElements;

        try {
          uploadImage.classList.add("is-loading");
          uploadImage.disabled = true;

          const result = await ImageUploader.upload(file);

          const newImage = {
            source: file.name,
            url: result.data.link,
          };

          const imageWrapper = document.createElement("div");
          imageWrapper.innerHTML = this.getImage(newImage);
          imageListContainer.append(imageWrapper.firstElementChild);

          this.product.images = [...this.product.images, newImage];

          uploadImage.classList.remove("is-loading");
          uploadImage.disabled = false;

          fileInput.remove();
        } catch (error) {
          console.log(error);
          throw new Error(error);
        }
      }
    });

    fileInput.click();
  };

  constructor(productId = "") {
    this.productId = productId;
  }

  async render() {
    const categoriesPromise = this.loadCategoryData();

    const productPromise = this.productId
      ? this.loadProductData(this.productId)
      : Promise.resolve(this.product);

    const [categoriesData, productData] = await Promise.all([
      categoriesPromise,
      productPromise,
    ]);

    this.categories = categoriesData;
    this.product = productData;

    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.initListeners();

    return this.element;
  }

  async loadProductData(id) {
    const url = new URL(PRODUCTS_URL, BACKEND_URL);
    url.searchParams.set("id", id);

    try {
      const productsData = await fetchJson(url);
      return productsData[0];
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async loadCategoryData() {
    const url = new URL(CATEGORIES_URL, BACKEND_URL);
    url.searchParams.set("_sort", "weight");
    url.searchParams.set("_refs", "subcategory");

    try {
      return await fetchJson(url);
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  async save() {
    const url = new URL(PRODUCTS_URL, BACKEND_URL);
    const formData = new FormData(this.subElements.productForm);
    formData.set("title", escapeHtml(formData.get("title")));
    formData.set("description", escapeHtml(formData.get("description")));

    if (this.productId) {
      formData.append("id", this.productId);
    }

    const data = Object.fromEntries(formData);
    const numberFields = ["quantity", "price", "status", "discount"];
    for (const field of numberFields) {
      data[field] = parseInt(data[field]);
    }
    const requestBody = JSON.stringify({
      ...data,
      images: this.product.images,
    });

    try {
      const newProduct = await fetchJson(url, {
        method: this.productId ? "PATCH" : "PUT",
        body: requestBody,
        headers: {
          "Content-Type": "application/json",
        },
      });

      this.element.dispatchEvent(
        new CustomEvent(
          this.productId ? "product-updated" : "product-created",
          {
            detail: this.productId || newProduct.id,
          }
        )
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  initListeners() {
    this.subElements.productForm.addEventListener("submit", this.onFormSubmit);
    this.subElements.imageListContainer.addEventListener(
      "click",
      this.onDeleteButtonClick
    );
    this.subElements.uploadImage.addEventListener(
      "click",
      this.onUploadImageClick
    );
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  getCategories() {
    return this.categories
      .flatMap((category) => {
        return category.subcategories?.map((subcategory) => {
          const selected =
            this.product.subcategory === subcategory.id ? "selected" : "";
          return `<option value="${subcategory.id}" ${selected}>${category.title} > ${subcategory.title}</option>`;
        });
      })
      .join("");
  }

  getStatuses() {
    const statuses = { 0: "Неактивен", 1: "Активен" };
    return Object.entries(statuses)
      .map(([key, value]) => {
        const selected =
          this.product.status === parseInt(key) ? "selected" : "";
        return `<option ${selected} value=${key}>${value}</option>`;
      })
      .join("");
  }

  getPhotos() {
    return `
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        ${this.getImageList()}
        <button type="file" data-element="uploadImage" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
    </div>
    `;
  }

  getImageList() {
    const { images } = this.product;

    const imagesList = images?.map((image) => this.getImage(image)).join("");
    return `
      <ul class="sortable-list" data-element="imageListContainer">
        ${imagesList}
      </ul>
    `;
  }

  getImage(image) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" value="https://i.imgur.com/MWorX2R.jpg">
        <input type="hidden" value="75462242_3746019958756848_838491213769211904_n.jpg">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
          <span>${image.source}</span>
        </span>
        <button type="button" data-delete="${image.source}">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `;
  }

  getFormFields() {
    const { title, description, price, discount, quantity } = this.product;

    return `
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input
            required=""
            type="text"
            name="title"
            class="form-control"
            placeholder="Название"
            id="title"
            value="${escapeHtml(title)}">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea
          required=""
          class="form-control"
          name="description"
          data-element="productDescription"
          id="description"
          placeholder="Описание товара">${escapeHtml(description)}</textarea>
      </div>
      ${this.getPhotos()}
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory" id="subcategory">
          ${this.getCategories()}
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input
            required=""
            type="number"
            name="price"
            class="form-control"
            placeholder="100"
            id="price"
            value=${price}>
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input
            required=""
            type="number"
            name="discount"
            class="form-control"
            placeholder="0"
            id="discount"
            value=${discount}>
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input
          required=""
          type="number"
          class="form-control"
          name="quantity"
          placeholder="1"
          id="quantity"
          value=${quantity}>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status" id="status">
          ${this.getStatuses()}
        </select>
      </div>
    `;
  }

  get template() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          ${this.getFormFields()}
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
        </form>
      </div>`;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}

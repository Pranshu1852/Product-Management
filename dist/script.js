import { filterOperations } from "./scripts/filterOperations.js";
import storageHandler from "./scripts/storagehandler.js";
export var STORAGE_KEYS;
(function (STORAGE_KEYS) {
    STORAGE_KEYS["PRODUCTS"] = "products";
    STORAGE_KEYS["FILTERED_PRODUCTS"] = "filterProducts";
})(STORAGE_KEYS || (STORAGE_KEYS = {}));
;
class ProductManagement {
    constructor() {
        this.url = new URL(window.location.href);
        this.initiateEventListener();
        this.getAllproducts(storageHandler.getStorage(STORAGE_KEYS.PRODUCTS));
        this.debouncefilter = debounce.call(this, this.filterProducts, 500);
        this.initFilterValues();
    }
    initFilterValues() {
        var _a, _b, _c, _d;
        if (this.url.searchParams.get('search') || this.url.searchParams.get('min') || this.url.searchParams.get('max') || this.url.searchParams.get('sort')) {
            if (this.url.searchParams.get('search')) {
                document.getElementById('searchbar').value = (_a = this.url.searchParams.get('search')) !== null && _a !== void 0 ? _a : '';
            }
            if (this.url.searchParams.get('min')) {
                document.getElementById('pricemin').value = (_b = this.url.searchParams.get('min')) !== null && _b !== void 0 ? _b : '';
            }
            if (this.url.searchParams.get('max')) {
                document.getElementById('pricemax').value = (_c = this.url.searchParams.get('max')) !== null && _c !== void 0 ? _c : '';
            }
            if (this.url.searchParams.get('sort')) {
                document.getElementById('filter--sort').value = (_d = this.url.searchParams.get('sort')) !== null && _d !== void 0 ? _d : '';
            }
            this.filterProducts();
        }
    }
    initiateEventListener() {
        document.querySelectorAll('#addproduct__form,#updateproduct__form').forEach((element) => {
            element.addEventListener('submit', (event) => {
                event.preventDefault();
                if (event.target.id === 'addproduct__form') {
                    this.handleAddproduct();
                    this.clearValues('product');
                    this.closePopup(document.getElementsByClassName("homepage__addproduct")[0]);
                }
                else {
                    this.handleUpdateproduct();
                }
            });
        });
        document.querySelectorAll('#addproduct__form,#updateproduct__form').forEach((element) => {
            element.addEventListener('reset', (event) => {
                event.preventDefault();
                if (event.target.id === 'addproduct__form') {
                    this.clearValues('product');
                    this.closePopup(document.getElementsByClassName("homepage__addproduct")[0]);
                }
                else {
                    this.clearValues('updateproduct');
                    this.closePopup(document.getElementsByClassName("homepage__updateproduct")[0]);
                }
            });
        });
        document.getElementById("searchbar").addEventListener("input", (event) => {
            event.preventDefault();
            let searchElement = event.target;
            if (searchElement.value === '') {
                this.url.searchParams.delete('search');
            }
            else {
                this.url.searchParams.set('search', event.target.value);
            }
            window.history.pushState({}, '', this.url);
            this.debouncefilter();
        });
        document
            .getElementsByClassName("header__btn--addproduct")[0]
            .addEventListener("click", (event) => {
            this.openPopup(document.getElementsByClassName("homepage__addproduct")[0]);
            this.toggleImageinput('product--imagefile', 'product--image');
        });
        document.querySelectorAll('.form__imagesection').forEach((element) => {
            element.addEventListener('change', (event) => {
                if (event.target.id.includes('file')) {
                    this.handleImageFIle(event);
                }
                else {
                    this.handleImageURL(event);
                }
            });
        });
        document.getElementsByClassName('homepage__filterbar')[0].addEventListener('click', (event) => {
            if (event.target.className === 'btn--filter') {
                const minValue = document.getElementById('pricemin').value || 0;
                const maxValue = document.getElementById('pricemax').value || Infinity;
                if (minValue === 0 && maxValue === Infinity) {
                    this.url.searchParams.delete('min');
                    this.url.searchParams.delete('max');
                }
                else if (minValue !== 0 && maxValue === Infinity) {
                    this.url.searchParams.delete('max');
                    this.url.searchParams.set('min', minValue.toString());
                }
                else if (minValue === 0 && maxValue !== Infinity) {
                    this.url.searchParams.delete('min');
                    this.url.searchParams.set('max', maxValue.toString());
                }
                else {
                    this.url.searchParams.set('min', minValue.toString());
                    this.url.searchParams.set('max', maxValue.toString());
                }
                window.history.pushState({}, '', this.url);
                this.filterProducts();
            }
            if (event.target.className === 'btn--reset') {
                this.resetFilter();
            }
        });
        document.getElementById('filter--sort').addEventListener('change', (event) => {
            let sortElement = event.target;
            if (sortElement.value === '') {
                this.url.searchParams.delete('sort');
            }
            else {
                this.url.searchParams.set('sort', event.target.value);
            }
            window.history.pushState({}, '', this.url);
            this.filterProducts();
        });
    }
    handleImageFIle(event) {
        const imageFileInput = event.target;
        const type = imageFileInput.id.startsWith('update') ? 'updateproduct' : 'product';
        let file;
        if (imageFileInput.files) {
            file = imageFileInput.files[0];
        }
        const imageURLinput = document.getElementById(`${type}--image`);
        if (file) {
            const reader = new FileReader();
            reader.addEventListener("load", (event) => {
                imageFileInput.setAttribute('data-value', event.target.result.toString());
                const previewImage = document.querySelector(`.${type}__image-preview`);
                previewImage.src = event.target.result.toString();
            });
            reader.readAsDataURL(file);
            this.toggleElementDisabled(imageURLinput, true);
            imageURLinput.value = '';
            this.openPopup(document.querySelector(`.${type}--image__element`));
        }
        else {
            this.closePopup(document.querySelector(`.${type}--image__element`));
            this.toggleElementDisabled(imageFileInput, false);
            this.toggleElementDisabled(imageURLinput, false);
        }
    }
    handleImageURL(event) {
        const imageURLInput = event.target;
        const type = imageURLInput.id.startsWith('update') ? 'updateproduct' : 'product';
        if (imageURLInput.value.trim() !== '') {
            const imageFileInput = document.getElementById(`${type}--imagefile`);
            this.toggleElementDisabled(imageFileInput, true);
            imageFileInput.value = '';
            imageFileInput.setAttribute('data-value', '');
            const previewImage = document.querySelector(`.${type}__image-preview`);
            previewImage.src = imageURLInput.value;
            this.openPopup(document.querySelector(`.${type}--image__element`));
        }
        else {
            this.closePopup(document.querySelector(`.${type}--image__element`));
        }
    }
    toggleImageinput(imageFileID, imageURLID) {
        const imageFile = document.getElementById(imageFileID);
        const imageURL = document.getElementById(imageURLID);
        imageFile.addEventListener("change", (event) => {
            if (imageFile.files.length != 0) {
                this.toggleElementDisabled(imageURL, true);
            }
            else {
                this.toggleElementDisabled(imageFile, false);
            }
        });
        imageURL.addEventListener("change", (event) => {
            if (imageURL.value.trim() != "") {
                this.toggleElementDisabled(imageFile, true);
            }
            else {
                this.toggleElementDisabled(imageFile, false);
            }
        });
    }
    handleAddproduct() {
        const name = document.getElementById("product--name").value;
        const image = document.getElementById('product--imagefile').getAttribute('data-value') || document.getElementById("product--image").value ||
            "https://www.incathlab.com/images/products/default_product.png";
        const price = Number(document.getElementById("product--price").value);
        const description = document.getElementById("product--description").value;
        const product = {
            id: crypto.randomUUID(),
            name: name,
            image: image,
            price: price,
            description: description,
        };
        this.addStorage(product);
        this.clearValues('product');
        this.getAllproducts(storageHandler.getStorage(STORAGE_KEYS.PRODUCTS));
    }
    createProduct(product) {
        const productcard = `<a class="product--link" href="/product.html?product_id=${product.id}">
    <div class="productgroup__productcard">
        <img class="productcard__image" src="${product.image}" alt="${product.name}"">
        <div class="productcard__content">
            <h3 class="productcard__content--text">${product.name}</h3>
            <h3 class="productcard__content--price">₹ ${product.price}</h3>
            <p class="productcard__content--description">${product.description}</p>
        </div>
        <div class="productcard__buttons">
            <button data-id=${product.id} class="productcard__buttons--edit">Edit</button>
            <button data-id=${product.id} class="productcard__buttons--delete">Delete</button>
        </div>
    </div>
</a>`;
        return productcard;
    }
    addStorage(product) {
        const productArray = storageHandler.getStorage(STORAGE_KEYS.PRODUCTS);
        productArray.push(product);
        storageHandler.setStorage(STORAGE_KEYS.PRODUCTS, productArray);
    }
    getAllproducts(productArray) {
        const productGroup = document.getElementsByClassName("homepage__productgroup")[0];
        productGroup.innerHTML = "";
        // productArray.forEach((element) => {
        //     productGroup.innerHTML += this.createProduct(element);
        // });
        const fragment = document.createDocumentFragment();
        productArray.forEach(product => {
            const productCard = this.createProduct(product);
            const parser = new DOMParser();
            const doc = parser.parseFromString(productCard, 'text/html');
            const node = doc.body.firstChild;
            if (node) {
                fragment.append(node);
            }
        });
        productGroup.appendChild(fragment);
        document.querySelectorAll(".product--link").forEach((element) => {
            element.addEventListener('click', (event) => {
                if (event.target.className === "productcard__buttons--delete" || event.target.className === "productcard__buttons--edit") {
                    event.preventDefault();
                    if (event.target.className === "productcard__buttons--delete") {
                        this.deleteProduct(event.target.getAttribute("data-id"));
                    }
                    else {
                        this.showProduct(event.target.getAttribute("data-id"));
                        this.openPopup(document.getElementsByClassName("homepage__updateproduct")[0]);
                        this.openPopup(document.getElementsByClassName("updateproduct--image__element")[0]);
                        this.toggleImageinput('updateproduct--imagefile', 'updateproduct--image');
                    }
                }
            });
        });
    }
    getProduct(id) {
        const productArray = storageHandler.getStorage(STORAGE_KEYS.PRODUCTS);
        const product = productArray.find((element) => {
            return element.id === id;
        });
        if (!product) {
            console.error(`Product with ID ${id} not found.`);
            return null;
        }
        return product;
    }
    deleteProduct(id) {
        const productArray = storageHandler.getStorage(STORAGE_KEYS.PRODUCTS);
        const filterArray = productArray.filter((element) => {
            return element.id != id;
        });
        console.log(filterArray);
        storageHandler.setStorage(STORAGE_KEYS.PRODUCTS, filterArray);
        this.getAllproducts(storageHandler.getStorage(STORAGE_KEYS.PRODUCTS));
    }
    showProduct(id) {
        const product = this.getProduct(id);
        if (!product) {
            console.error("Product not found");
            return;
        }
        document.getElementById("updateproduct--id").value = id;
        document.getElementById("updateproduct--name").value = product.name;
        if (product.image.startsWith('data')) {
            document.getElementById('updateproduct--imagefile').setAttribute('data-value', product.image);
            document.getElementsByClassName('updateproduct__image-preview')[0].src = product.image;
        }
        else {
            document.getElementById("updateproduct--image").value = product.image;
            document.getElementsByClassName('updateproduct__image-preview')[0].src = product.image;
        }
        document.getElementById("updateproduct--price").value = product.price.toString();
        document.getElementById("updateproduct--description").value = product.description;
    }
    handleUpdateproduct() {
        const id = document.getElementById("updateproduct--id").value;
        const name = document.getElementById("updateproduct--name").value;
        const image = document.getElementById('updateproduct--imagefile').getAttribute('data-value') || document.getElementById("updateproduct--image").value || "https://www.incathlab.com/images/products/default_product.png";
        const price = Number(document.getElementById("updateproduct--price").value);
        const description = document.getElementById("updateproduct--description").value;
        const updatedProduct = {
            name: name,
            image: image,
            price: price,
            description: description,
        };
        this.updateProduct(id, updatedProduct);
    }
    updateProduct(id, updatedProduct) {
        const productArray = storageHandler.getStorage(STORAGE_KEYS.PRODUCTS);
        const updateProductarray = productArray.map((element) => {
            if (element.id === id) {
                console.log("inside");
                return Object.assign(Object.assign({}, element), updatedProduct);
            }
            return element;
        });
        console.log(updateProductarray);
        storageHandler.setStorage(STORAGE_KEYS.PRODUCTS, updateProductarray);
        this.getAllproducts(storageHandler.getStorage(STORAGE_KEYS.PRODUCTS));
        this.clearValues('updateproduct');
        this.closePopup(document.getElementsByClassName("homepage__updateproduct")[0]);
    }
    clearValues(type) {
        document.getElementById(`${type}--name`).value = "";
        document.getElementById(`${type}--image`).value = "";
        document.getElementById(`${type}--price`).value = "";
        document.getElementById(`${type}--description`).value = "";
        const imageFile = document.getElementById(`${type}--imagefile`);
        const imageURL = document.getElementById(`${type}--image`);
        imageFile.setAttribute('data-value', '');
        imageFile.value = '';
        imageURL.value = "";
        this.toggleElementDisabled(imageFile, false);
        this.toggleElementDisabled(imageURL, false);
        this.closePopup(document.getElementsByClassName(`${type}--image__element`)[0]);
    }
    filterProducts() {
        let productArray = [];
        if (localStorage.getItem("products")) {
            productArray = JSON.parse(localStorage.getItem("products"));
        }
        let filterArray = [];
        if (this.url.searchParams.get('search')) {
            // console.log('search is running');
            filterArray = filterOperations.searchFilter(filterArray, productArray);
        }
        else {
            filterArray = productArray;
        }
        if (this.url.searchParams.get('min') || this.url.searchParams.get('max')) {
            // console.log('min max running');
            filterArray = filterOperations.priceFilter(filterArray);
        }
        if (this.url.searchParams.get('sort')) {
            // console.log('sort is running');
            filterArray = filterOperations.sortFilter(filterArray);
        }
        storageHandler.setStorage(STORAGE_KEYS.FILTERED_PRODUCTS, filterArray);
        this.getAllproducts(storageHandler.getStorage(STORAGE_KEYS.FILTERED_PRODUCTS));
    }
    resetFilter() {
        const inputString = document.getElementById("searchbar");
        const minValue = document.getElementById('pricemin');
        const maxValue = document.getElementById('pricemax');
        const sortValue = document.getElementById('filter--sort');
        inputString.value = "";
        minValue.value = "";
        maxValue.value = "";
        sortValue.value = "";
        this.getAllproducts(storageHandler.getStorage(STORAGE_KEYS.PRODUCTS));
    }
    openPopup(element) {
        element.style.display = "flex";
        document.body.style.overflow = "hidden";
    }
    closePopup(element) {
        element.style.display = "none";
        document.body.style.overflow = "";
    }
    toggleElementDisabled(element, isDisabled) {
        element.disabled = isDisabled;
    }
}
function debounce(func, duration) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, ...args);
        }, duration);
    };
}
document.addEventListener("DOMContentLoaded", () => {
    new ProductManagement();
});

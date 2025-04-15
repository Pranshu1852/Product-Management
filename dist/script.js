import storageHandler from "./scripts/storagehandler.js";
export var SortOptions;
(function (SortOptions) {
    SortOptions["NONE"] = "";
    SortOptions["NAME"] = "name";
    SortOptions["PRICE_LOW"] = "pricelow";
    SortOptions["PRICE_HIGH"] = "pricehigh";
})(SortOptions || (SortOptions = {}));
class ProductManagement {
    constructor() {
        this.initiateEventListener();
        this.getAllproducts(storageHandler.getStorage("products"));
        this.debouncefilter = debounce.call(this, this.filterProducts, 500);
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
                this.filterProducts();
            }
            if (event.target.className === 'btn--reset') {
                this.resetFilter();
            }
        });
        document.getElementById('filter--sort').addEventListener('change', (event) => {
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
            imageURLinput.disabled = true;
            imageURLinput.value = '';
            this.openPopup(document.querySelector(`.${type}--image__element`));
        }
        else {
            this.closePopup(document.querySelector(`.${type}--image__element`));
            imageFileInput.disabled = false;
            imageURLinput.disabled = false;
        }
    }
    handleImageURL(event) {
        const imageURLInput = event.target;
        const type = imageURLInput.id.startsWith('update') ? 'updateproduct' : 'product';
        if (imageURLInput.value.trim() !== '') {
            const imageFileInput = document.getElementById(`${type}--imagefile`);
            imageFileInput.disabled = true;
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
                console.log(imageFile.files);
                imageURL.disabled = true;
            }
            else {
                imageFile.disabled = false;
            }
        });
        imageURL.addEventListener("change", (event) => {
            if (imageURL.value.trim() != "") {
                imageFile.disabled = true;
            }
            else {
                imageFile.disabled = false;
            }
        });
    }
    handleAddproduct() {
        const name = document.getElementById("product--name").value;
        const image = document.getElementById('product--imagefile').getAttribute('data-value') || document.getElementById("product--image").value ||
            "https://www.incathlab.com/images/products/default_product.png";
        const price = document.getElementById("product--price").value;
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
        this.getAllproducts(storageHandler.getStorage("products"));
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
        const productArray = storageHandler.getStorage("products");
        productArray.push(product);
        storageHandler.setStorage("products", productArray);
    }
    getAllproducts(productArray) {
        const productGroup = document.getElementsByClassName("homepage__productgroup")[0];
        productGroup.innerHTML = "";
        productArray.forEach((element) => {
            productGroup.innerHTML += this.createProduct(element);
        });
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
        const productArray = storageHandler.getStorage("products");
        const product = productArray.find((element) => {
            return element.id === id;
        });
        console.log(product);
        return product;
    }
    deleteProduct(id) {
        const productArray = storageHandler.getStorage("products");
        const filterArray = productArray.filter((element) => {
            return element.id != id;
        });
        console.log(filterArray);
        storageHandler.setStorage("products", filterArray);
        this.getAllproducts(storageHandler.getStorage("products"));
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
        document.getElementById("updateproduct--price").value = product.price;
        document.getElementById("updateproduct--description").value = product.description;
    }
    handleUpdateproduct() {
        const id = document.getElementById("updateproduct--id").value;
        const name = document.getElementById("updateproduct--name").value;
        const image = document.getElementById('updateproduct--imagefile').getAttribute('data-value') || document.getElementById("updateproduct--image").value || "https://www.incathlab.com/images/products/default_product.png";
        const price = document.getElementById("updateproduct--price").value;
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
        const productArray = storageHandler.getStorage("products");
        const updateProductarray = productArray.map((element) => {
            if (element.id === id) {
                console.log("inside");
                return Object.assign(Object.assign({}, element), updatedProduct);
            }
            return element;
        });
        console.log(updateProductarray);
        storageHandler.setStorage("products", updateProductarray);
        this.getAllproducts(storageHandler.getStorage("products"));
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
        imageFile.disabled = false;
        imageURL.disabled = false;
        this.closePopup(document.getElementsByClassName(`${type}--image__element`)[0]);
    }
    filterProducts() {
        console.log('sadfsa');
        let productArray = [];
        if (localStorage.getItem("products")) {
            productArray = JSON.parse(localStorage.getItem("products"));
        }
        let inputString = document.getElementById("searchbar").value;
        inputString = inputString.trim().toLowerCase();
        let filterArray = [];
        if (inputString !== "" && productArray.length !== 0) {
            filterArray = productArray.filter((element) => {
                console.log(element.name.includes(inputString));
                return (element.name.toLowerCase().includes(inputString) ||
                    element.description.toLowerCase().includes(inputString));
            });
            storageHandler.setStorage("filterProducts", filterArray);
            this.getAllproducts(storageHandler.getStorage("filterProducts"));
        }
        else {
            filterArray = productArray;
        }
        const minValue = document.getElementById('pricemin').value || 0;
        const maxValue = document.getElementById('pricemax').value || Infinity;
        console.log(minValue);
        console.log(maxValue);
        filterArray = filterArray.filter((element) => {
            return Number(element.price) >= Number(minValue) && Number(element.price) <= Number(maxValue);
        });
        const sortValue = document.getElementById('filter--sort').value;
        console.log(sortValue);
        switch (sortValue) {
            case SortOptions.NONE: {
                break;
            }
            case SortOptions.NAME: {
                filterArray = filterArray.sort((a, b) => a.name.localeCompare(b.name));
                break;
            }
            case SortOptions.PRICE_LOW: {
                filterArray = filterArray.sort((a, b) => Number(a.price) - Number(b.price));
                break;
            }
            case SortOptions.PRICE_HIGH: {
                filterArray = filterArray.sort((a, b) => Number(b.price) - Number(a.price));
                break;
            }
            default: {
                break;
            }
        }
        storageHandler.setStorage("filterProducts", filterArray);
        this.getAllproducts(storageHandler.getStorage("filterProducts"));
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
        this.getAllproducts(storageHandler.getStorage("products"));
    }
    openPopup(element) {
        element.style.display = "flex";
        document.body.style.overflow = "hidden";
    }
    closePopup(element) {
        element.style.display = "none";
        document.body.style.overflow = "";
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

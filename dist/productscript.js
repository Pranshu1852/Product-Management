import { STORAGE_KEYS } from "./script.js";
import storageHandler from "./scripts/storagehandler.js";
class ProductPage {
    constructor(id) {
        this.id = id;
        this.setProduct(id);
    }
    setProduct(id) {
        var _a, _b, _c, _d;
        if (!this.getProduct(id)) {
            window.location.href = "./index.html";
        }
        const product = this.getProduct(id);
        if (!product) {
            console.error("Product not found");
            return;
        }
        const productName = document.querySelector('.product__name');
        const productPrice = document.querySelector('.product__price');
        const productImage = document.querySelector('.productpage__image');
        const productDescription = document.querySelector('.product__description');
        productName.textContent = (_a = product.name) !== null && _a !== void 0 ? _a : "There is no Product Name";
        productImage.src = (_b = product.image) !== null && _b !== void 0 ? _b : "https://www.incathlab.com/images/products/default_product.png";
        productPrice.textContent = `₹ ${(_c = product.price) !== null && _c !== void 0 ? _c : "Price is not define"}`;
        productDescription.textContent = (_d = product.description) !== null && _d !== void 0 ? _d : "Don't have Product description";
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
}
document.addEventListener('DOMContentLoaded', (event) => {
    const params = new URLSearchParams(window.location.search);
    let id = '';
    for (let query of params) {
        id = query[1];
        break;
    }
    new ProductPage(id);
});

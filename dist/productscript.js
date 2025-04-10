import storageHandler from "./scripts/storagehandler.js";
class Product {
    constructor(id) {
        this.id = id;
        this.setProduct(id);
    }
    setProduct(id) {
        if (!this.getProduct(id)) {
            window.location.href = "./index.html";
        }
        const product = this.getProduct(id);
        const productName = document.querySelector('.product__name');
        const productPrice = document.querySelector('.product__price');
        const productImage = document.querySelector('.productpage__image');
        const productDescription = document.querySelector('.product__description');
        productName.textContent = product.name || "There is no Product Name";
        productImage.src = product.image || "https://www.incathlab.com/images/products/default_product.png";
        productPrice.textContent = `₹ ${product.price || "Price is not define"}`;
        productDescription.textContent = product.description || "Don't have Product description";
    }
    getProduct(id) {
        const productArray = storageHandler.getStorage("products");
        const product = productArray.find((element) => {
            return element.id === id;
        });
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
    new Product(id);
});

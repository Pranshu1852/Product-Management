import storageHandler from "./scripts/storagehandler.js";
class Product {
    constructor(id) {
        this.id = id;
        this.setProduct(id);
    }
    setProduct(id) {
        const product = this.getProduct(id);
        const productName = document.getElementsByClassName('product__name')[0];
        const productPrice = document.getElementsByClassName('product__price')[0];
        const productImage = document.getElementsByClassName('productpage__image')[0];
        const productDescription = document.getElementsByClassName('product__description')[0];
        productName.textContent = product.name;
        productImage.src = product.image;
        productPrice.textContent = `₹ ${product.price}`;
        productDescription.textContent = product.description;
    }
    getProduct(id) {
        const productArray = storageHandler.getStorage("products");
        const product = productArray.find((element) => {
            return element.id === id;
        });
        console.log(product);
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
    console.log(id);
    new Product(id);
});

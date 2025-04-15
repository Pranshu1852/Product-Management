import { Product } from "./script.js";
import storageHandler from "./scripts/storagehandler.js";

class ProductPage{
    id:string

    constructor(id:string){
        this.id=id;
        this.setProduct(id);
    }

    setProduct(id:string){
        if(!this.getProduct(id)){
            window.location.href = "./index.html";
        }
        const product = this.getProduct(id);
        if (!product) {
            console.error("Product not found");
            return;
        }
        const productName=document.querySelector('.product__name') as HTMLHeadingElement;
        const productPrice=document.querySelector('.product__price') as HTMLHeadingElement;
        const productImage=document.querySelector('.productpage__image') as HTMLImageElement;
        const productDescription=document.querySelector('.product__description') as HTMLParagraphElement;
        productName.textContent=product.name ?? "There is no Product Name";
        productImage.src=product.image ?? "https://www.incathlab.com/images/products/default_product.png";
        productPrice.textContent=`₹ ${product.price ?? "Price is not define"}`;
        productDescription.textContent=product.description ?? "Don't have Product description";
    }

    getProduct(id:string) {
        const productArray = storageHandler.getStorage<Product>("products");
    
        const product = productArray.find((element:Product) => {
          return element.id === id;
        });
    
        return product;
    }
}

document.addEventListener('DOMContentLoaded',(event:Event)=>{
    const params = new URLSearchParams(window.location.search);
    let id='';
    for(let query of params){
        id=query[1];
        break;
    }
    new ProductPage(id);
})
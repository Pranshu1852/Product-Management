import storageHandler from "./scripts/storagehandler.js";

class Product{
    id:string

    constructor(id:string){
        this.id=id;
        this.setProduct(id);
    }

    setProduct(id:string){
        const product=this.getProduct(id);
        const productName=document.getElementsByClassName('product__name')[0] as HTMLHeadingElement;
        const productPrice=document.getElementsByClassName('product__price')[0] as HTMLHeadingElement;
        const productImage=document.getElementsByClassName('productpage__image')[0] as HTMLImageElement;
        const productDescription=document.getElementsByClassName('product__description')[0] as HTMLParagraphElement;
        productName.textContent=product.name;
        productImage.src=product.image;
        productPrice.textContent=`₹ ${product.price}`;
        productDescription.textContent=product.description;
    }

    getProduct(id:string) {
        const productArray = storageHandler.getStorage("products");
    
        const product = productArray.find((element:Product) => {
          return element.id === id;
        });
    
        console.log(product);
    
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
    console.log(id);
    new Product(id);
})
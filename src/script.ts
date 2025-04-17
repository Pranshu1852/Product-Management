import { filterOperations } from "./scripts/filterOperations.js";
import storageHandler from "./scripts/storagehandler.js";

export interface Product{
    id: string,
    name: string,
    price: number,
    image: string,
    description: string
}

export enum STORAGE_KEYS {
    PRODUCTS= "products",
    FILTERED_PRODUCTS= "filterProducts",
};

class ProductManagement {
    debouncefilter:()=>void;
    url: URL

    constructor() {
        this.url= new URL(window.location.href);
        this.initiateEventListener();
        this.getAllproducts(storageHandler.getStorage<Product>(STORAGE_KEYS.PRODUCTS));
        this.debouncefilter=debounce.call(this,this.filterProducts,500);
        this.initFilterValues();
    }

    initFilterValues(){
        if(this.url.searchParams.get('search')||this.url.searchParams.get('min')||this.url.searchParams.get('max')||this.url.searchParams.get('sort')){
            if(this.url.searchParams.get('search')){
                (document.getElementById('searchbar') as HTMLInputElement).value=this.url.searchParams.get('search')??'';
            }
    
            if(this.url.searchParams.get('min')){
                (document.getElementById('pricemin') as HTMLInputElement).value=this.url.searchParams.get('min')??'';
            }
    
            if(this.url.searchParams.get('max')){
                (document.getElementById('pricemax') as HTMLInputElement).value=this.url.searchParams.get('max')??'';
            }
    
            if(this.url.searchParams.get('sort')){
                (document.getElementById('filter--sort') as HTMLSelectElement).value=this.url.searchParams.get('sort')??'';
            }

            this.filterProducts();
        }
    }

    initiateEventListener() {
        document.querySelectorAll('#addproduct__form,#updateproduct__form').forEach((element) => {
            element.addEventListener('submit', (event:Event) => {
                event.preventDefault();
                if ((event.target as HTMLDivElement).id === 'addproduct__form') {
                    this.handleAddproduct();
                    this.clearValues('product');
                    this.closePopup(document.getElementsByClassName("homepage__addproduct")[0] as HTMLDivElement);
                }
                else {
                    this.handleUpdateproduct();
                }
            })
        })

        document.querySelectorAll('#addproduct__form,#updateproduct__form').forEach((element) => {
            element.addEventListener('reset', (event) => {
                event.preventDefault();
                if ((event.target as HTMLDivElement).id === 'addproduct__form') {
                    this.clearValues('product');
                    this.closePopup(document.getElementsByClassName("homepage__addproduct")[0] as HTMLDivElement);
                }
                else {
                    this.clearValues('updateproduct');
                    this.closePopup(document.getElementsByClassName("homepage__updateproduct")[0] as HTMLDivElement);
                }
            })
        });

        document.getElementById("searchbar")!.addEventListener("input", (event:Event) => {
            event.preventDefault();
            let searchElement=event.target as HTMLInputElement;

            if(searchElement.value===''){
                this.url.searchParams.delete('search');
            }
            else{
                this.url.searchParams.set('search', (event.target as HTMLInputElement).value);
            }
            window.history.pushState({}, '', this.url);

            this.debouncefilter();
        });

        document
            .getElementsByClassName("header__btn--addproduct")[0]
            .addEventListener("click", (event) => {
                this.openPopup(document.getElementsByClassName("homepage__addproduct")[0] as HTMLDivElement);
                this.toggleImageinput('product--imagefile', 'product--image');
            });

        document.querySelectorAll('.form__imagesection').forEach((element) => {
            (element as HTMLInputElement).addEventListener('change', (event) => {
                if ((event.target as HTMLInputElement).id.includes('file')) {
                    this.handleImageFIle(event);
                }
                else {
                    this.handleImageURL(event)
                }
            })
        });

        document.getElementsByClassName('homepage__filterbar')[0].addEventListener('click', (event: Event) => {
            if ((event.target as HTMLButtonElement).className === 'btn--filter') {
                const minValue = (document.getElementById('pricemin') as HTMLInputElement).value || 0;
                const maxValue = (document.getElementById('pricemax') as HTMLInputElement).value || Infinity;

                if(minValue===0&&maxValue===Infinity){
                    this.url.searchParams.delete('min');
                    this.url.searchParams.delete('max');
                }
                else if(minValue!==0&&maxValue===Infinity){
                    this.url.searchParams.delete('max');
                    this.url.searchParams.set('min',minValue.toString());
                }
                else if(minValue===0&&maxValue!==Infinity){
                    this.url.searchParams.delete('min');
                    this.url.searchParams.set('max',maxValue.toString());
                }
                else{
                    this.url.searchParams.set('min',minValue.toString());
                    this.url.searchParams.set('max',maxValue.toString());
                }
                window.history.pushState({}, '', this.url);

                this.filterProducts();
            }

            if ((event.target as HTMLButtonElement).className === 'btn--reset') {
                this.resetFilter();
            }
        })

        document.getElementById('filter--sort')!.addEventListener('change', (event: Event) => {
            let sortElement=event.target as HTMLSelectElement;

            if(sortElement.value===''){
                this.url.searchParams.delete('sort');
            }
            else{
                this.url.searchParams.set('sort', (event.target as HTMLSelectElement).value);
            }
            window.history.pushState({}, '', this.url);

            this.filterProducts();
        })
    }

    handleImageFIle(event: Event):void {
        const imageFileInput = event.target as HTMLInputElement;
        const type = imageFileInput.id.startsWith('update') ? 'updateproduct' : 'product';
        let file;
        if(imageFileInput.files){
            file=imageFileInput.files[0];
        }
        const imageURLinput = document.getElementById(`${type}--image`) as HTMLInputElement;

        if (file) {
            const reader: FileReader = new FileReader();
            reader.addEventListener("load", (event: Event) => {
                imageFileInput.setAttribute('data-value', (event.target as FileReader).result!.toString());

                const previewImage = document.querySelector(`.${type}__image-preview`) as HTMLInputElement;
                previewImage.src = (event.target as FileReader).result!.toString();
            });

            reader.readAsDataURL(file);

            this.toggleElementDisabled(imageURLinput,true);
            imageURLinput.value = '';

            this.openPopup(document.querySelector(`.${type}--image__element`) as HTMLDivElement);
        }
        else {
            this.closePopup(document.querySelector(`.${type}--image__element`) as HTMLDivElement);
            this.toggleElementDisabled(imageFileInput,false);
            this.toggleElementDisabled(imageURLinput,false);
        }
    }

    handleImageURL(event: Event):void {
        const imageURLInput = event.target as HTMLInputElement;
        const type = imageURLInput.id.startsWith('update') ? 'updateproduct' : 'product';

        if (imageURLInput.value.trim() !== '') {
            const imageFileInput = document.getElementById(`${type}--imagefile`) as HTMLInputElement;
            this.toggleElementDisabled(imageFileInput,true);
            imageFileInput.value = '';
            imageFileInput.setAttribute('data-value', '');

            const previewImage = document.querySelector(`.${type}__image-preview`) as HTMLInputElement;

            previewImage.src = imageURLInput.value;

            this.openPopup(document.querySelector(`.${type}--image__element`) as HTMLDivElement);
        }
        else {
            this.closePopup(document.querySelector(`.${type}--image__element`) as HTMLDivElement);
        }
    }

    toggleImageinput(imageFileID:string, imageURLID:string):void {
        const imageFile = document.getElementById(imageFileID) as HTMLInputElement;
        const imageURL = document.getElementById(imageURLID) as HTMLInputElement;

        imageFile.addEventListener("change", (event: Event) => {
            if (imageFile.files!.length != 0) {
                this.toggleElementDisabled(imageURL,true);
            } else {
                this.toggleElementDisabled(imageFile,false);
            }
        });

        imageURL.addEventListener("change", (event: Event) => {
            if (imageURL.value.trim() != "") {
                this.toggleElementDisabled(imageFile,true);
            } else {
                this.toggleElementDisabled(imageFile,false);
            }
        });
    }

    handleAddproduct():void {
        const name = (document.getElementById("product--name") as HTMLInputElement).value;
        const image = (document.getElementById('product--imagefile') as HTMLInputElement).getAttribute('data-value') || (document.getElementById("product--image") as HTMLInputElement).value ||
            "https://www.incathlab.com/images/products/default_product.png";
        const price = Number((document.getElementById("product--price") as HTMLInputElement).value);
        const description = (document.getElementById("product--description") as HTMLInputElement).value;

        const product:Product = {
            id: crypto.randomUUID(),
            name: name,
            image: image,
            price: price,
            description: description,
        };

        this.addStorage(product);
        this.clearValues('product');
        this.getAllproducts(storageHandler.getStorage<Product>(STORAGE_KEYS.PRODUCTS));
    }

    createProduct(product:Product):string {
        const productcard: string = `<a class="product--link" href="/product.html?product_id=${product.id}">
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

    addStorage(product:Product):void {
        const productArray = storageHandler.getStorage<Product>(STORAGE_KEYS.PRODUCTS);

        productArray.push(product);

        storageHandler.setStorage<Product>(STORAGE_KEYS.PRODUCTS, productArray);
    }

    getAllproducts(productArray: Product[]):void {
        const productGroup = document.getElementsByClassName(
            "homepage__productgroup"
        )[0];
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

            if(node){
                fragment.append(node);
            }
        });
        productGroup.appendChild(fragment);

        document.querySelectorAll(".product--link").forEach((element) => {
            element.addEventListener('click', (event: Event) => {
                if ((event.target as HTMLElement).className === "productcard__buttons--delete" || (event.target as HTMLElement).className === "productcard__buttons--edit") {
                    event.preventDefault();

                    if ((event.target as HTMLButtonElement).className === "productcard__buttons--delete") {
                        this.deleteProduct((event.target as HTMLButtonElement).getAttribute("data-id")!);
                    }
                    else {
                        this.showProduct((event.target as HTMLButtonElement).getAttribute("data-id")!);
                        this.openPopup(document.getElementsByClassName("homepage__updateproduct")[0] as HTMLDivElement);
                        this.openPopup(document.getElementsByClassName("updateproduct--image__element")[0] as HTMLDivElement);
                        this.toggleImageinput('updateproduct--imagefile', 'updateproduct--image');
                    }
                }
            });
        })
    }

    getProduct(id: string):Product | null {
        const productArray = storageHandler.getStorage<Product>(STORAGE_KEYS.PRODUCTS);

        const product = productArray.find((element: Product) => {
            return element.id === id;
        });

        if (!product) {
            console.error(`Product with ID ${id} not found.`);
            return null;
        }
        
        return product;
    }

    deleteProduct(id: string):void {
        const productArray = storageHandler.getStorage<Product>(STORAGE_KEYS.PRODUCTS);
        const filterArray = productArray.filter((element: Product) => {
            return element.id != id;
        });

        console.log(filterArray);

        storageHandler.setStorage<Product>(STORAGE_KEYS.PRODUCTS, filterArray);
        this.getAllproducts(storageHandler.getStorage<Product>(STORAGE_KEYS.PRODUCTS));
    }

    showProduct(id: string):void {
        const product = this.getProduct(id);
        if (!product) {
            console.error("Product not found");
            return;
        }
        (document.getElementById("updateproduct--id") as HTMLInputElement).value = id;
        (document.getElementById("updateproduct--name") as HTMLInputElement).value = product.name;
        if (product.image.startsWith('data')) {
            (document.getElementById('updateproduct--imagefile') as HTMLInputElement).setAttribute('data-value', product.image);
            (document.getElementsByClassName('updateproduct__image-preview')[0] as HTMLInputElement).src = product.image;
        }
        else {
            (document.getElementById("updateproduct--image") as HTMLInputElement).value = product.image;
            (document.getElementsByClassName('updateproduct__image-preview')[0] as HTMLInputElement).src = product.image;
        }
        (document.getElementById("updateproduct--price") as HTMLInputElement).value = product.price.toString();
        
        (document.getElementById("updateproduct--description") as HTMLInputElement).value = product.description;
    }

    handleUpdateproduct():void {
        const id = (document.getElementById("updateproduct--id") as HTMLInputElement).value;

        const name = (document.getElementById("updateproduct--name") as HTMLInputElement).value;
        const image = (document.getElementById('updateproduct--imagefile') as HTMLInputElement).getAttribute('data-value') || (document.getElementById("updateproduct--image") as HTMLInputElement).value || "https://www.incathlab.com/images/products/default_product.png";
        const price = Number((document.getElementById("updateproduct--price") as HTMLInputElement).value);
        const description = (document.getElementById("updateproduct--description") as HTMLInputElement).value;

        const updatedProduct:Partial<Product> = {
            name: name,
            image: image,
            price: price,
            description: description,
        };

        this.updateProduct(id, updatedProduct);
    }

    updateProduct(id:string, updatedProduct:Partial<Product>):void {
        const productArray = storageHandler.getStorage<Product>(STORAGE_KEYS.PRODUCTS);

        const updateProductarray = productArray.map((element: Product) => {
            if (element.id === id) {
                console.log("inside");

                return { ...element, ...updatedProduct };
            }

            return element;
        });

        console.log(updateProductarray);

        storageHandler.setStorage<Product>(STORAGE_KEYS.PRODUCTS, updateProductarray);
        this.getAllproducts(storageHandler.getStorage<Product>(STORAGE_KEYS.PRODUCTS));
        this.clearValues('updateproduct');
        this.closePopup(document.getElementsByClassName("homepage__updateproduct")[0] as HTMLDivElement);
    }

    clearValues(type: string):void {
        (document.getElementById(`${type}--name`) as HTMLInputElement).value = "";
        (document.getElementById(`${type}--image`) as HTMLInputElement).value = "";
        (document.getElementById(`${type}--price`) as HTMLInputElement).value = "";
        (document.getElementById(`${type}--description`) as HTMLInputElement).value = "";
        const imageFile = document.getElementById(`${type}--imagefile`) as HTMLInputElement;
        const imageURL = document.getElementById(`${type}--image`) as HTMLInputElement;

        imageFile.setAttribute('data-value', '');
        imageFile.value = '';
        imageURL.value = "";

        this.toggleElementDisabled(imageFile,false);
        this.toggleElementDisabled(imageURL,false);

        this.closePopup(document.getElementsByClassName(`${type}--image__element`)[0] as HTMLDivElement);
    }

    filterProducts():void {
        let productArray:Product[]|[] = [];
        if(localStorage.getItem("products")){
            productArray = JSON.parse(localStorage.getItem("products")!);
        }
        let filterArray:Product[]|[] = [];

        if(this.url.searchParams.get('search')){
            // console.log('search is running');
            filterArray=filterOperations.searchFilter(filterArray,productArray);
        }else {
            filterArray = productArray;
        }

        if(this.url.searchParams.get('min')||this.url.searchParams.get('max')){
            // console.log('min max running');
            filterArray=filterOperations.priceFilter(filterArray);
        }

        if(this.url.searchParams.get('sort')){
            // console.log('sort is running');
            filterArray=filterOperations.sortFilter(filterArray);
        }

        storageHandler.setStorage<Product>(STORAGE_KEYS.FILTERED_PRODUCTS, filterArray);
        this.getAllproducts(storageHandler.getStorage<Product>(STORAGE_KEYS.FILTERED_PRODUCTS));
    }

    resetFilter():void {
        const inputString = document.getElementById("searchbar") as HTMLInputElement;
        const minValue = document.getElementById('pricemin') as HTMLInputElement;
        const maxValue = document.getElementById('pricemax') as HTMLInputElement;
        const sortValue = document.getElementById('filter--sort') as HTMLSelectElement;

        inputString.value = "";
        minValue.value = "";
        maxValue.value = "";
        sortValue.value = "";

        this.getAllproducts(storageHandler.getStorage<Product>(STORAGE_KEYS.PRODUCTS));
    }

    openPopup(element: HTMLElement):void {
        element.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    closePopup(element: HTMLElement):void {
        element.style.display = "none";
        document.body.style.overflow = "";
    }
    
    private toggleElementDisabled(element: HTMLInputElement, isDisabled: boolean): void {
        element.disabled = isDisabled;
    }
}

function debounce(this: ProductManagement,func: ()=>void, duration:number):() => void {
    let timeout: number;
  
    return (...args: [])=>{
      clearTimeout(timeout)
      timeout = setTimeout(()=>{
        func.apply(this,...args);
      }, duration)
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new ProductManagement();
});

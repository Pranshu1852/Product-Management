import storageHandler from "./scripts/storagehandler.js";

export interface Product{
    id: string,
    name: string,
    price: string,
    image: string,
    description: string
}

enum SortOptions {
    NONE = "",
    NAME = "name",
    PRICE_LOW = "pricelow",
    PRICE_HIGH = "pricehigh",
}

export enum STORAGE_KEYS {
    PRODUCTS= "products",
    FILTERED_PRODUCTS= "filterProducts",
};

class ProductManagement {
    debouncefilter:()=>void;

    constructor() {
        this.initiateEventListener();
        this.getAllproducts(storageHandler.getStorage<Product>(STORAGE_KEYS.PRODUCTS));
        this.debouncefilter=debounce.call(this,this.filterProducts,500);
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
                this.filterProducts();
            }

            if ((event.target as HTMLButtonElement).className === 'btn--reset') {
                this.resetFilter();
            }
        })

        document.getElementById('filter--sort')!.addEventListener('change', (event: Event) => {
            this.filterProducts();
        })
    }

    handleImageFIle(event: Event) {
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


            imageURLinput.disabled = true;
            imageURLinput.value = '';

            this.openPopup(document.querySelector(`.${type}--image__element`) as HTMLDivElement);
        }
        else {
            this.closePopup(document.querySelector(`.${type}--image__element`) as HTMLDivElement);
            imageFileInput.disabled = false;
            imageURLinput.disabled = false;
        }
    }

    handleImageURL(event: Event):void {
        const imageURLInput = event.target as HTMLInputElement;
        const type = imageURLInput.id.startsWith('update') ? 'updateproduct' : 'product';

        if (imageURLInput.value.trim() !== '') {
            const imageFileInput = document.getElementById(`${type}--imagefile`) as HTMLInputElement;
            imageFileInput.disabled = true;
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
                console.log(imageFile.files);

                imageURL.disabled = true;
            } else {
                imageFile.disabled = false;
            }
        });

        imageURL.addEventListener("change", (event: Event) => {
            if (imageURL.value.trim() != "") {
                imageFile.disabled = true;
            } else {
                imageFile.disabled = false;
            }
        });
    }

    handleAddproduct():void {
        const name = (document.getElementById("product--name") as HTMLInputElement).value;
        const image = (document.getElementById('product--imagefile') as HTMLInputElement).getAttribute('data-value') || (document.getElementById("product--image") as HTMLInputElement).value ||
            "https://www.incathlab.com/images/products/default_product.png";
        const price = (document.getElementById("product--price") as HTMLInputElement).value;
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

    createProduct(product:Product) {
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

    addStorage(product:Product) {
        const productArray = storageHandler.getStorage<Product>(STORAGE_KEYS.PRODUCTS);

        productArray.push(product);

        storageHandler.setStorage<Product>(STORAGE_KEYS.PRODUCTS, productArray);
    }

    getAllproducts(productArray: Product[]) {
        const productGroup = document.getElementsByClassName(
            "homepage__productgroup"
        )[0];
        productGroup.innerHTML = "";

        productArray.forEach((element) => {
            productGroup.innerHTML += this.createProduct(element);
        });

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

    getProduct(id: string) {
        const productArray = storageHandler.getStorage<Product>(STORAGE_KEYS.PRODUCTS);

        const product = productArray.find((element: Product) => {
            return element.id === id;
        });

        console.log(product);

        return product;
    }

    deleteProduct(id: string) {
        const productArray = storageHandler.getStorage<Product>(STORAGE_KEYS.PRODUCTS);
        const filterArray = productArray.filter((element: Product) => {
            return element.id != id;
        });

        console.log(filterArray);

        storageHandler.setStorage<Product>(STORAGE_KEYS.PRODUCTS, filterArray);
        this.getAllproducts(storageHandler.getStorage<Product>(STORAGE_KEYS.PRODUCTS));
    }

    showProduct(id: string) {
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
        (document.getElementById("updateproduct--price") as HTMLInputElement).value = product.price;
        (document.getElementById("updateproduct--description") as HTMLInputElement).value = product.description;
    }

    handleUpdateproduct() {
        const id = (document.getElementById("updateproduct--id") as HTMLInputElement).value;

        const name = (document.getElementById("updateproduct--name") as HTMLInputElement).value;
        const image = (document.getElementById('updateproduct--imagefile') as HTMLInputElement).getAttribute('data-value') || (document.getElementById("updateproduct--image") as HTMLInputElement).value || "https://www.incathlab.com/images/products/default_product.png";
        const price = (document.getElementById("updateproduct--price") as HTMLInputElement).value;
        const description = (document.getElementById("updateproduct--description") as HTMLInputElement).value;

        const updatedProduct:Partial<Product> = {
            name: name,
            image: image,
            price: price,
            description: description,
        };

        this.updateProduct(id, updatedProduct);
    }

    updateProduct(id:string, updatedProduct:Partial<Product>) {
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

    clearValues(type: string) {
        (document.getElementById(`${type}--name`) as HTMLInputElement).value = "";
        (document.getElementById(`${type}--image`) as HTMLInputElement).value = "";
        (document.getElementById(`${type}--price`) as HTMLInputElement).value = "";
        (document.getElementById(`${type}--description`) as HTMLInputElement).value = "";
        const imageFile = document.getElementById(`${type}--imagefile`) as HTMLInputElement;
        const imageURL = document.getElementById(`${type}--image`) as HTMLInputElement;

        imageFile.setAttribute('data-value', '');
        imageFile.value = '';
        imageURL.value = "";

        imageFile.disabled = false;
        imageURL.disabled = false;

        this.closePopup(document.getElementsByClassName(`${type}--image__element`)[0] as HTMLDivElement);
    }

    filterProducts() {
        console.log('sadfsa');
        
        let productArray:Product[]|[] = [];
        if(localStorage.getItem("products")){
            productArray = JSON.parse(localStorage.getItem("products")!);
        }
        let inputString = (document.getElementById("searchbar") as HTMLInputElement).value;
        inputString = inputString.trim().toLowerCase();

        let filterArray:Product[]|[] = [];
        if (inputString !== "" && productArray.length !== 0) {
            filterArray = productArray.filter((element: Product) => {
                console.log(element.name.includes(inputString));
                return (
                    element.name.toLowerCase().includes(inputString) ||
                    element.description.toLowerCase().includes(inputString)
                );
            });

            storageHandler.setStorage<Product>(STORAGE_KEYS.FILTERED_PRODUCTS, filterArray);
            this.getAllproducts(storageHandler.getStorage<Product>(STORAGE_KEYS.FILTERED_PRODUCTS));
        } else {
            filterArray = productArray;
        }

        const minValue = (document.getElementById('pricemin') as HTMLInputElement).value || 0;
        const maxValue = (document.getElementById('pricemax') as HTMLInputElement).value || Infinity;
        console.log(minValue);
        console.log(maxValue);


        filterArray = filterArray.filter((element: Product) => {
            return Number(element.price) >= Number(minValue) && Number(element.price) <= Number(maxValue);
        })

        const sortValue = (document.getElementById('filter--sort') as HTMLSelectElement).value;
        console.log(sortValue);

        switch (sortValue) {
            case SortOptions.NONE: {
                break;
            }
            case SortOptions.NAME: {
                filterArray = filterArray.sort((a:Product, b:Product) => a.name.localeCompare(b.name))
                break;
            }
            case SortOptions.PRICE_LOW: {
                filterArray = filterArray.sort((a:Product, b:Product) => Number(a.price) - Number(b.price));
                break;
            }
            case SortOptions.PRICE_HIGH: {
                filterArray = filterArray.sort((a:Product, b:Product) => Number(b.price) - Number(a.price));
                break;
            }
            default: {
                break;
            }
        }


        storageHandler.setStorage<Product>(STORAGE_KEYS.FILTERED_PRODUCTS, filterArray);
        this.getAllproducts(storageHandler.getStorage<Product>(STORAGE_KEYS.FILTERED_PRODUCTS));
    }

    resetFilter() {
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

    openPopup(element: HTMLElement) {
        element.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    closePopup(element: HTMLElement) {
        element.style.display = "none";
        document.body.style.overflow = "";
    }
    
}

function debounce(this: ProductManagement,func: ()=>void, duration:number) {
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

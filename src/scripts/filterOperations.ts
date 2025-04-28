import { Product } from "../script";

enum SortOptions {
    NONE = "",
    NAME = "name",
    PRICE_LOW = "pricelow",
    PRICE_HIGH = "pricehigh",
}

interface FilterOperations{
    searchFilter: (filterArray:Product[]|[],productArray:Product[]|[])=>Product[]|[];
    priceFilter: (filterArray:Product[]|[])=>Product[]|[];
    sortFilter: (filterArray:Product[]|[])=>Product[]|[];
};

const filterOperations:FilterOperations ={
    searchFilter(filterArray:Product[]|[],productArray:Product[]|[]):Product[]|[] {
        let inputString = (document.getElementById("searchbar") as HTMLInputElement).value;
        inputString = inputString.trim().toLowerCase();

        if (inputString !== "" && productArray.length !== 0) {
            filterArray = productArray.filter((element: Product) => {
                return (
                    element.name.toLowerCase().includes(inputString) ||
                    element.description.toLowerCase().includes(inputString)
                );
            });

            return filterArray;
        }
        return [];
    },

    priceFilter(filterArray:Product[]|[]):Product[] {
        const minValue = (document.getElementById('pricemin') as HTMLInputElement).value || 0;
        const maxValue = (document.getElementById('pricemax') as HTMLInputElement).value || Infinity;
        console.log(minValue);
        console.log(maxValue);


        filterArray = filterArray.filter((element: Product) => {
            return Number(element.price) >= Number(minValue) && Number(element.price) <= Number(maxValue);
        })

        return filterArray;
    },

    sortFilter(filterArray:Product[]|[]):Product[] {
        const sortValue = (document.getElementById('filter--sort') as HTMLSelectElement).value;

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

        return filterArray;
    }
}

export {filterOperations};
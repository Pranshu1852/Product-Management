var SortOptions;
(function (SortOptions) {
    SortOptions["NONE"] = "";
    SortOptions["NAME"] = "name";
    SortOptions["PRICE_LOW"] = "pricelow";
    SortOptions["PRICE_HIGH"] = "pricehigh";
})(SortOptions || (SortOptions = {}));
;
const filterOperations = {
    searchFilter(filterArray, productArray) {
        let inputString = document.getElementById("searchbar").value;
        inputString = inputString.trim().toLowerCase();
        if (inputString !== "" && productArray.length !== 0) {
            filterArray = productArray.filter((element) => {
                return (element.name.toLowerCase().includes(inputString) ||
                    element.description.toLowerCase().includes(inputString));
            });
            return filterArray;
        }
        return [];
    },
    priceFilter(filterArray) {
        const minValue = document.getElementById('pricemin').value || 0;
        const maxValue = document.getElementById('pricemax').value || Infinity;
        console.log(minValue);
        console.log(maxValue);
        filterArray = filterArray.filter((element) => {
            return Number(element.price) >= Number(minValue) && Number(element.price) <= Number(maxValue);
        });
        return filterArray;
    },
    sortFilter(filterArray) {
        const sortValue = document.getElementById('filter--sort').value;
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
        return filterArray;
    }
};
export { filterOperations };

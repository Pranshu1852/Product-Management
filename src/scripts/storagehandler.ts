import { Product } from "../script";

const storageHandler = {
    getStorage(key:string) {
      return localStorage.getItem(key)? JSON.parse(localStorage.getItem(key)!) : [];
    },
  
    setStorage(key:string, array:Product[]) {
      localStorage.setItem(key, JSON.stringify(array));
    },
};

export default storageHandler;
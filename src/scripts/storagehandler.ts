import { Product } from "../script";

interface StorageHandler{
  getStorage: <T>(key: string)=>T[],
  setStorage: <T>(key: string,array: T[])=>void,
}

const storageHandler: StorageHandler = {
    getStorage(key:string) {
      return localStorage.getItem(key)? JSON.parse(localStorage.getItem(key)!) : [];
    },
  
    setStorage(key:string, array) {
      localStorage.setItem(key, JSON.stringify(array));
    },
};

export default storageHandler;
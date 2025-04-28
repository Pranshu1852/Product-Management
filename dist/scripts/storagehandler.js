const storageHandler = {
    getStorage(key) {
        return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : [];
    },
    setStorage(key, array) {
        localStorage.setItem(key, JSON.stringify(array));
    },
};
export default storageHandler;

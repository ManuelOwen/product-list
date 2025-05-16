import type { Desserts } from "./database.interface";

export class DatabaseService {
    private db:IDBDatabase| null= null
    private readonly DB_NAME = 'DessertsDB'
    private readonly STRORE_NAME = 'desserts'

    // create a constructor
    constructor() {
        this.intDatabase();
    }
    //  create resolve and reject(request and response)
    public intDatabase(): Promise<void>{
        return new Promise ((resolve, reject)=>{
            const  request = indexedDB.open(this.DB_NAME,1)
            // Handle errors
            request.onerror = ()=>reject(request.error);
            // on succesful opening
        request.onsuccess=()=>{
            this.db=request.result;
            resolve();

        };
        //  create a schema
        request.onupgradeneeded = (event)=>{
            const db =(event.target as IDBRequest).result
            if(!db.objectStoreNames.contains(this.STRORE_NAME)){
                const store = db.createObjectStore(this.STRORE_NAME,{
                    keyPath:'id',
                    autoIncrement:true
                });
                store.createIndex('name','name',{unique:false});
            }
        }
        });
    }
    // create CRUD functionalities to add, get, update and delete 
    //  Add a dessert to cart
    public addDessert(dessert: Desserts): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error("Database not initialized"));
            }
            const transaction = this.db.transaction(this.STRORE_NAME, "readwrite");
            const store = transaction.objectStore(this.STRORE_NAME);
            const request = store.add(dessert);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // update a dessert on cart
    public updateDessert(dessert: Desserts): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error("Database not initialized"));
            }
            const transaction = this.db.transaction(this.STRORE_NAME, "readwrite");
            const store = transaction.objectStore(this.STRORE_NAME);
            const request = store.put(dessert);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    // get all desserts from cart
    public getAllDesserts(): Promise<Desserts[]> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error("Database not initialized"));
            }
            const transaction = this.db.transaction(this.STRORE_NAME, "readonly");
            const store = transaction.objectStore(this.STRORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    // delete a dessert from cart
    public deleteDessert(id: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error("Database not initialized"));
            }
            const transaction = this.db.transaction(this.STRORE_NAME, "readwrite");
            const store = transaction.objectStore(this.STRORE_NAME);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    // clear all desserts from cart
    public clearDesserts(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error("Database not initialized"));
            }
            const transaction = this.db.transaction(this.STRORE_NAME, "readwrite");
            const store = transaction.objectStore(this.STRORE_NAME);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    // get dessert by id
    public getDessertById(id: number): Promise<Desserts | undefined> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error("Database not initialized"));
            }
            const transaction = this.db.transaction(this.STRORE_NAME, "readonly");
            const store = transaction.objectStore(this.STRORE_NAME);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    // clear cart
    public clearCart(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error("Database not initialized"));
            }
            const transaction = this.db.transaction(this.STRORE_NAME, "readwrite");
            const store = transaction.objectStore(this.STRORE_NAME);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    // add checkout
    public checkout(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error("Database not initialized"));
            }
            const transaction = this.db.transaction(this.STRORE_NAME, "readwrite");
            const store = transaction.objectStore(this.STRORE_NAME);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
}

import { time } from 'console';
import mongoose from 'mongoose'; 
import { type } from 'os';

const scansSchema = new mongoose.Schema({
    date: {
        type: Date
    },
    productLocation: {
        type: String
    },
    locationStatus: {
        type: String
    },
    barcode: {
        type: String
    },
    id: {
        type: String
    },
    SKUname: {
        type: String
    },
    productionDate: {
        type: Date
    },
    expirationDate: {
        type: Date  
    },
    finalQuantity: {
        type: Number 
    },
    sysQuantity: {
        type: Number 
    },
    variance: {
        type: Number 
    },
    productStatus: {
        type: String 
    },
    userName: {
        type: String  
    },
    dateInput: {
        type: Date
    },
    accuracy: {
        type: String 
    },
    category: {
        type: String
    }
});

const Scans = mongoose.model("Scans", scansSchema);

export default Scans;


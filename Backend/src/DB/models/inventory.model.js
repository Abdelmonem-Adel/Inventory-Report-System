
import mongoose from 'mongoose';
import { type } from 'os';

const inventorySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    barcode: {
        type: String
        
    },
    id: {
        type: String
    },
    SKUname: {
        type: String,
    },
    finalQuantity: {
        type: Number,
        required: true
    },
    sysQuantity: {
        type: Number,
        required: true
    },
    variance: {
        type: Number,
        required: true
    },
    productStatus: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    }
});

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;


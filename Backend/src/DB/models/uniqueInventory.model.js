import mongoose from "mongoose";

const uniqueInventorySchema = new mongoose.Schema({
  date: {
    type: Date
    
  },
  category: {
    type: String
  },
  matchedLocations: {
    type: Number
  },
  missMatchedLocations: {
    type: Number
  },
  locationAccuracy: {
    type: Number
  },
  matchedItems: {
    type: Number
  },
  missMatchedItems: {
    type: Number
  },
  itemsAccuracy: {
    type: Number
  }
});

const UniqueInventory = mongoose.model("UniqueInventory", uniqueInventorySchema);
export default UniqueInventory;
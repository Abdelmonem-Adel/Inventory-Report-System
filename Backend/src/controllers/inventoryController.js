import Inventory from "../DB/models/inventory.model.js";

export const getInventoryData = async (req, res) => {
  try {
    const inventoryData = await Inventory.find({});
    res.json(inventoryData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getInventoryKPIs = async (req, res) => {
  try {
    const inventoryData = await Inventory.find({});

    const getItems = inventoryData.length;
    const getItemsList = Array.isArray(inventoryData) ? inventoryData : [];

    let getTotalMatch = 0;
    let getTotalGain = 0;
    let getTotalLoss = 0;


    let getTotalPieces = 0;
    let getTotalPiecesMatch = 0;
    let getTotalPiecesGain = 0;
    let getTotalPiecesLoss = 0;


    let getTotalSysPieces = 0;
    let getTotalSysPiecesMatch = 0;
    let getTotalSysPiecesGain = 0;
    let getTotalSysPiecesLoss = 0;




    getItemsList.forEach(item => {
      const quantity = typeof item.finalQuantity === 'number' ? item.finalQuantity : (Number(item.finalQuantity) || 0);
      getTotalPieces += quantity;

      const sysQuantity = typeof item.sysQuantity === 'number' ? item.sysQuantity : (Number(item.sysQuantity) || 0);
      getTotalSysPieces += sysQuantity;

      if (item.productStatus === 'Match') {
        getTotalMatch++;
        getTotalPiecesMatch += quantity;
        getTotalSysPiecesMatch += sysQuantity;
      } else if (item.productStatus === 'Extra' || item.productStatus === 'Gain') {
        getTotalGain++;
        getTotalPiecesGain += quantity;
        getTotalSysPiecesGain += sysQuantity;
      } else if (item.productStatus === 'Missing' || item.productStatus === 'Loss') {
        getTotalLoss++;
        getTotalPiecesLoss += quantity;
        getTotalSysPiecesLoss += sysQuantity;
      }
    });




    const overallaccuracyProductsUnique = getItems > 0 ? (getTotalMatch / getItems) * 100 : 0;
    const getGainPersentageUnique = getItems > 0 ? (getTotalGain / getItems) * 100 : 0;
    const getLossPersentageUnique = getItems > 0 ? (getTotalLoss / getItems) * 100 : 0;

    res.json({
      getItems,
      getTotalMatch,
      getTotalGain,
      getTotalLoss,
      getTotalPieces,
      getTotalPiecesMatch,
      getTotalPiecesGain,
      getTotalPiecesLoss,
      getTotalSysPieces,
      getTotalSysPiecesMatch,
      getTotalSysPiecesGain,
      getTotalSysPiecesLoss,
      overallaccuracyProductsUnique,
      getGainPersentageUnique,
      getLossPersentageUnique
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

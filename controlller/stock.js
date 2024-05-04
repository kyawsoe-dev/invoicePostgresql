const stockModel = require("../model/stock");

exports.getStocks = async (req, res) => {
  try {
    const stock = await stockModel.getStocks();
    res.status(200).json({ message: "Stock List", data: stock });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getUpdateStockById = async (req, res) => {
  const id = req.params.id;

  try {
    const stockData = await stockModel.getUpdateStockById(id);

    if (!stockData) {
      return res.status(404).json({ message: "Stock not found" });
    }

    res.status(200).json({ message: "Stock Data", data: stockData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.postUpdateStockById = async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  try {
    const result = await stockModel.postUpdateStockById(id, data);
    res
      .status(200)
      .json({ message: "Stock Updated Successfully", data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

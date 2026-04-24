const validateTrade = (trade) => {
    const { symbol, type, entryPrice, quantity, exitPrice, exitTime } = trade;
  
    if (!symbol || !type || entryPrice == null || quantity == null) {
      return "Missing required fields";
    }
  
    const entry = Number(entryPrice);
    const qty = Number(quantity);
    const exit = exitPrice != null ? Number(exitPrice) : null;
  
    if (entry <= 0 || qty <= 0 || (exit != null && exit <= 0)) {
      return "Invalid numeric values";
    }
  
    const hasExitPrice = exitPrice != null;
    const hasExitTime = !!exitTime;
  
    if ((hasExitPrice || hasExitTime) && !(hasExitPrice && hasExitTime)) {
      return "Incomplete exit data";
    }
  
    return null;
  };
  
  module.exports = validateTrade;
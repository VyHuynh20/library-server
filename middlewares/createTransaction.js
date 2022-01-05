const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

const createTransaction = async (data) => {
  const { type, message, userId, hoa } = data;
  let user = await Account.findById(userId);
  const before = user.hoa;
  user.hoa = before + hoa;
  const after = user.hoa;
  const status = 1;

  if (user.hoa < 0) {
    return false;
  }
  
  //NOTE: save
  await user.save();
  let transaction = new Transaction({
    user: user._id,
    before,
    after,
    hoa,
    type,
    message,
    status,
  });
  await transaction.save();
  return { hoa: hoa, totalHoa: user.hoa };
};

module.exports = createTransaction;

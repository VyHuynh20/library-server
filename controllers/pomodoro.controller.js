const Account = require("../models/Account");
const BookInBookcase = require("../models/BookInBookcase");
const Transaction = require("../models/Transaction");

exports.getReportAllTime = async function (req, res) {
  try {
    const _user = res.locals.account;
    let userId = "61a3adb54e66dcd7283d89be";
    let totalHoa = 0;
    let totalHour = 0;
    let totalReadBook = 0;
    let totalBook = 0;
    const transactions = await Transaction.find({
      type: "pomodoro",
      user: userId,
    });
    const books = await BookInBookcase.find({ user: userId }).select(
      "_id progress"
    );
    totalBook = books.length;
    totalReadBook = books.filter((book) => book.progress === 100).length;
    transactions.forEach((transaction) => {
      totalHoa += transaction.hoa;
      totalHour += (transaction.hoa * 5) / 60;
    });
    totalHour = Math.round(totalHour * 100) / 100;
    return res
      .status(200)
      .json({ totalHoa, totalHour, totalReadBook, totalBook });
  } catch (error) {}
  return res.status(500).json({ message: "Bad request" });
};

exports.postReportByTime = async function (req, res) {
  try {
    const _user = res.locals.account;
    let userId = _user._id;
    let { begin, end } = req.body;
    begin = new Date(begin);
    end = new Date(end);
    // begin = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    let period = Math.round(
      (end.getTime() - begin.getTime()) / (24 * 60 * 60 * 1000)
    );
    let lastEnd = new Date(begin.getTime() - 24 * 60 * 60 * 1000);
    let lastBegin = new Date(lastEnd.getTime() - period * 24 * 60 * 60 * 1000);
    let lastPeriod = Math.round(
      (lastEnd.getTime() - lastBegin.getTime()) / (24 * 60 * 60 * 1000)
    );
    const transactions = await Transaction.find({
      type: "pomodoro",
      user: userId,
    });

    function extraZero(num) {
      return num > 9 ? num : "0" + num;
    }

    let count = 0;
    let hour = 0;
    let hoa = 0;
    let lastCount = 0;
    let lastHour = 0;
    let lastHoa = 0;
    let date;
    let lastDate = lastBegin;
    let data = [];
    let lastData = [];
    for (let index = 0; index <= period; index++) {
      date = new Date(begin.getTime() + index * 24 * 60 * 60 * 1000);
      lastDate = new Date(lastBegin.getTime() + index * 24 * 60 * 60 * 1000);
      data.push({
        date: `${extraZero(date.getDate())}/${extraZero(
          date.getMonth() + 1
        )}/${date.getFullYear()}`,
        value: 0,
      });
      lastData.push({
        date: `${extraZero(lastDate.getDate())}/${extraZero(
          lastDate.getMonth() + 1
        )}/${lastDate.getFullYear()}`,
        value: 0,
      });
    }
    transactions.forEach((transaction) => {
      let indexDate = new Date(transaction.createdAt.toLocaleDateString());
      if (indexDate < end && indexDate > begin) {
        count++;
        hoa += transaction.hoa;
        data.find(
          (d) =>
            d.date ===
            `${extraZero(indexDate.getDate())}/${extraZero(
              indexDate.getMonth() + 1
            )}/${indexDate.getFullYear()}`
        ).value += transaction.hoa;
      } else if (indexDate < lastEnd && indexDate > lastBegin) {
        lastCount++;
        lastHoa += transaction.hoa;
        lastData.find(
          (d) =>
            d.date ===
            `${extraZero(indexDate.getDate())}/${extraZero(
              indexDate.getMonth() + 1
            )}/${indexDate.getFullYear()}`
        ).value += transaction.hoa;
      }
    });

    for (let index = 0; index < data.length; index++) {
      data[index].value =
        Math.round(((data[index].value * 5) / 60) * 100) / 100;
    }
    for (let index = 0; index < lastData.length; index++) {
      lastData[index].value =
        Math.round(((lastData[index].value * 5) / 60) * 100) / 100;
    }
    hour = Math.round(((hoa * 5) / 60) * 100) / 100;
    lastHour = Math.round(((lastHoa * 5) / 60) * 100) / 100;

    return res.status(200).json({
      begin,
      end,
      lastBegin,
      lastEnd,
      data,
      count,
      lastCount,
      hoa,
      lastHoa,
      hour,
      lastHour,
      lastData,
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Bad request" });
  }
};

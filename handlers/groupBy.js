const groupBy = function (key, array) {
  var result = [];
  for (var i = 0; i < array.length; i++) {
    var added = false;
    for (var j = 0; j < result.length; j++) {
      if (result[j][key] == array[i][key]) {
        result[j].items.push(array[i]);
        added = true;
        break;
      }
    }
    if (!added) {
      var entry = { items: [] };
      entry[key] = array[i][key];
      entry.items.push(array[i]);
      result.push(entry);
    }
  }
  return result;
};

module.exports = groupBy;

// [
//   {
//     color: "blue",
//     items: [
//       {
//         id: 1,
//         color: "blue",
//         model_name: "ford",
//         year: 2016,
//       },
//       {
//         id: 2,
//         color: "blue",
//         model_name: "Maruti",
//         year: 2016,
//       },
//     ],
//   },
//   {
//     color: "red",
//     items: [
//       {
//         id: 3,
//         color: "red",
//         model_name: "Fiat",
//         year: 2016,
//       },
//       {
//         id: 4,
//         color: "red",
//         model_name: "tata",
//         year: 2016,
//       },
//     ],
//   },
// ];

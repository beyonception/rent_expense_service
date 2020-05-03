const { Expense } = require("../models/expenseUser");
const ObjectID = require("mongodb").ObjectID;

//Collection Of Expense
const getExpenses = async () => {
  const getexpenses = await Expense.find();
  return getexpenses;
};

const getDashboardBasedOnMonth = async (month, year) => {
  var startDate = new Date(year, month - 1, 1);
  var endDate = new Date(year, month, 0);
  const getexpenses = await Expense.find( {$or:
    [{
      createdDate: {
        $gte: new Date(startDate.setHours(00, 00, 00)),
        $lt: new Date(endDate.setHours(23, 59, 59)),
      },
    }, { defaultExpense: true }]}
  );
  return getexpenses;
};

const getExpense = async (_id) => {
  const getexpense = await Expense.findOne({ _id });
  return getexpense;
};

//Creation of Expense
async function saveExpense(expense) {
  try {
    const expenseData = new Expense(expense);
    const savedExpense = await expenseData.save();
    return savedExpense;
  } catch (err) {
    return err;
  }
}

//Updation of Expense
async function updateExpense(expenseData) {
  try {
    const updateExpense = await Expense.findByIdAndUpdate(
      { _id: ObjectID(expenseData._id) },
      { $set: expenseData }
    );
    return updateExpense;
  } catch (err) {
    console.log("Service Error: Update Expense " + err);
  }
}

//Deletion of Expense
async function deleteExpense(deleteId) {
  try {
    const expense = await Expense.findByIdAndDelete(deleteId);
    return expense;
  } catch (err) {
    console.log("Error to be handled:" + err);
  }
}

module.exports = {
  getExpenses,
  getExpense,
  saveExpense,
  updateExpense,
  deleteExpense,
  getDashboardBasedOnMonth,
};

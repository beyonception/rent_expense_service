const mongoose = require("mongoose");
const { Expense } = require("../models/expenseUser");
const expenseService = require("../services/expenseService");
const expensevalidation = require("../validation/expenseValidation");
const axios = require("axios");
// require('dotenv').config({path : require('path').join(__dirname, '../.env')});
//Collection of Expense
async function getExpenses(req, res) {
  try {
    let expense = await expenseService.getExpenses();
    if (expense == null) {
      return res
        .status(404)
        .send({ message: "No Expense is found in the system" });
    }
    let usersData = await getUsers(req);
    let expenseDetails = {};
    let expenses = [];
    expense.map((expenseData) => {
      usersData.map((user) => {
        if (user._id == expenseData.spentBy) {
          expenseDetails = {
            ...expenseData._doc,
            spentByUserName: user.FirstName,
          };
          expenses.push(expenseDetails);
          return;
        }
      });
    });
    return res.status(200).send(expenses);
  } catch (err) {
    console.log("Controller Error: Get Expense " + err);
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

async function getExpense(req, res) {
  try {
    let expense = await expenseService.getExpense(req.query._id);
    if (expense == null) {
      return res
        .status(404)
        .send({ message: "No Expense is found in the system" });
    }
    return res.status(200).send(expense);
  } catch (err) {
    console.log("Controller Error: Get Expense " + err);
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

async function getDashboardBasedOnMonth(req, res) {
  try {
    const usersData = await getUsers(req);
    const expenses = await expenseService.getDashboardBasedOnMonth(
      req.query.month,
      req.query.year
    );
    
    let resp = [];
    usersData.map((user) => {
      let total = 0;
      expenses.map((expense) => {
        expense.spentTo.map(async (member) => {
          if (member === user._id) {
            total += parseFloat(expense.perHead);
          }
        });
      });
      if (total !== 0)
        resp.push({
          UserName: user.FirstName + " " + user.LastName,
          TotalAmount: total,
        });
    });
    return res.status(200).send(resp);
  } catch (err) {
    console.log("Controller Error: Get Expense " + err);
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

//Creation of new Expense
async function createExpense(req, res) {
  try {
    //Validate for Creation of Expense
    const { error } = await expensevalidation.validateCreate(req.body);

    if (error) {
      return res.status(400).send({
        message: error.details[0].message,
      });
    }
    const token = req.headers["authorization"];
    const authData = await decodeToken(token.split(" ")[1]);
    req.body.createdBy = authData.user._id;
    //Calculation for PerHead
    const perhead = Math.round(
      parseFloat(req.body.amount) / parseInt(req.body.spentTo.length)
    );
    req.body.perHead = perhead;

    const savedExpense = await expenseService.saveExpense(req.body);

    return res.status(200).send(savedExpense);
  } catch (err) {
    console.log("Controller Error: Create Expense " + err);
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

//Updation of Expense
async function updateExpense(req, res) {
  try {
    const { error } = await expensevalidation.validateUpdate(req.body);

    if (error) {
      return res.status(400).send({
        message: error.details[0].message,
      });
    }

    //Calculation for PerHead
    const perhead = Math.round(req.body.amount / req.body.spentTo.length);
    req.body.perHead = perhead;
    const expense = await expenseService.updateExpense(req.body);
    if (expense != null) {
      return res.status(200).send(expense);
    } else {
      return res
        .status(404)
        .send({ message: "Expense doesn't exist in the system" });
    }
  } catch (err) {
    console.log("Controller Error: Update Expense " + err);
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

//Deletion of Expense
async function deleteExpense(req, res) {
  try {
    const { error } = await expensevalidation.validateDelete(req.query);
    if (error) {
      return res.status(400).send({
        message: error.details[0].message,
      });
    }

    const expense = await expenseService.deleteExpense(req.query.id);

    if (expense != null) {
      return res.status(200).send({ message: "Deleted Successfully" });
    } else {
      return res
        .status(404)
        .send({ message: "Expense doesn't exist in the system" });
    }
  } catch (err) {
    console.log("Controller Error: Delete Expense " + err);
    return res.status(500).send({ message: "Internal Server Error" });
  }
}
async function getUsers(req) {
  try {
    let res = await axios.get(process.env.USER_SERVICE_URL + "/getUsers", req);
    return res.data;
  } catch (err) {
    throw err;
  }
}

//Calculate Dashboard
async function getDashboard(req, res) {
  try {
    const usersData = await getUsers(req);
    const expenses = await expenseService.getExpenses();
    let resp = [];
    usersData.map((user) => {
      let total = 0;
      expenses.map((expense) => {
        expense.spentTo.map(async (member) => {
          if (member === user._id) {
            total += parseFloat(expense.perHead);
          }
        });
      });
      resp.push({
        UserName: user.FirstName + " " + user.LastName,
        TotalAmount: total,
        CreatedDate: user.CreatedDateTime,
      });
    });

    if (expenses != null) {
      return res.status(200).send(resp);
    } else {
      return res
        .status(404)
        .send({ message: "No expense available in this system" });
    }
  } catch (err) {
    console.log("Controller Error: Delete Expense " + err);
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

const decodeToken = async (token) => {
  const tokenDetails = {
    access_token: token,
  };
  return await axios
    .post(process.env.AUTH_SERVICE_URL + "/decodeToken", tokenDetails)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return { message: err };
    });
};

//Get all Dashboard Expense

module.exports = {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getDashboard,
  getDashboardBasedOnMonth,
};

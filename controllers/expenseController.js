const mongoose = require("mongoose");
const { Expense } = require("../models/expenseUser");
const expenseService = require("../services/expenseService");
const expensevalidation = require("../validation/expenseValidation");
const axios = require("axios");
// require('dotenv').config({path : require('path').join(__dirname, '../.env')});
//Collection of Expense
async function getExpense(req, res) {
  try {
    let expense = await expenseService.getExpense();
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

    //Calculation for PerHead
    const perhead = Math.round(req.body.amount / req.body.spentTo.length);
    req.body.perHead = perhead;

    await expenseService.saveExpense(req.body);

    return res.status(200).send({ message: "New Expense is Created" });
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
      return res.status(200).send({ message: "Expense updated successfully" });
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
    const { error } = await expensevalidation.validateDelete(req.body);

    if (error) {
      return res.status(400).send({
        message: error.details[0].message,
      });
    }

    const expense = await expenseService.deleteExpense(req.body.id);

    if (expense != null) {
      return res.status(200).send({ message: "Expense deleted successfully" });
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
    res.status(500).send({ message: "Error in getting the Users" });
  }
}
//Calculate Dashboard
async function getDashboard(req, res) {
  try {
    const usersData = await getUsers(req);
    const expenses = await expenseService.getExpense();
    let resp = [];
    usersData.map((user) => {
      let total = 0;
      expenses.map((expense) => {
        expense.spentTo.map(async (member) => {
           if(member === user.UserName)
           {
              total += parseFloat(expense.perHead);
           }
        });
      });
      resp.push({userName: user.UserName, totalAmount : total.toString()});
      
    });

    if (expenses != null) {
      return res.status(200).send(resp);
    } else {
      return res
        .status(404)
        .send({ message: "No expense available in this system" });
    }
  } catch (err) {
    console.log("Controller Error: Delete Expense " + err.response);
    return res.status(500).send({ message: "Internal Server Error" });
  }
}

//Get all Dashboard Expense

module.exports = {
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getDashboard,
};

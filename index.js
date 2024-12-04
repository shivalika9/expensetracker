const express = require('express');
const bodyParser = require('body-parser');
const cron = require('node-cron');

const app = express();
app.use(bodyParser.json());
let expenses = []; // Array to hold expense data
const predefinedCategories = ["Food", "Travel", "Entertainment", "Utilities"];
app.post('/expenses', (req, res) => {
    const { category, amount, date } = req.body;


if (!predefinedCategories.includes(category)) {
    return res.status(400).json({ status: "fail", error: "Invalid category" });
  }
  if (amount <= 0) {
    return res.status(400).json({ status: "fail", error: "Amount must be a positive number" });
  }
  if (isNaN(new Date(date).getTime())) {
    return res.status(400).json({ status: "fail", error: "Invalid date format" });
  }
  const newExpense = { id: expenses.length + 1, category, amount, date };
  expenses.push(newExpense);
  res.json({ status: "success", data: newExpense });
});
app.get('/expenses', (req, res) => {
    const { category, startDate, endDate } = req.query;

    let filteredExpenses = expenses;

    if (category) {
      filteredExpenses = filteredExpenses.filter(exp => exp.category === category);
    }
    if (startDate || endDate) {
      filteredExpenses = filteredExpenses.filter(exp => {
        const expenseDate = new Date(exp.date);
        return (!startDate || expenseDate >= new Date(startDate)) &&
               (!endDate || expenseDate <= new Date(endDate));
      });
    }
    res.json({ status: "success", data: filteredExpenses });
});

app.get('/expenses/analysis', (req, res) => {
    const totalByCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});
  
    const monthlyTotals = expenses.reduce((acc, exp) => {
        const month = exp.date.slice(0, 7); // e.g., "2024-12"
        acc[month] = (acc[month] || 0) + exp.amount;
        return acc;
      }, {});
      const highestSpendingCategory = Object.keys(totalByCategory).reduce((a, b) =>
        totalByCategory[a] > totalByCategory[b] ? a : b
      );
      res.json({
        status: "success",
        data: { totalByCategory, highestSpendingCategory, monthlyTotals },
      });
    });
    cron.schedule('0 0 * * *', () => { // Runs daily at midnight
        const today = new Date().toISOString().slice(0, 10);
        const dailyTotal = expenses.reduce((acc, exp) => {
          return exp.date === today ? acc + exp.amount : acc;
        }, 0);
      
        console.log(`Daily Report: Total Expenses Today = $${dailyTotal}`);
      });
      const PORT = 3000;
      app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:3000/expenses`);
      });
                    
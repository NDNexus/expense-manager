// ✅ Import functions from db.js
import {
    addExpense,
    getRecentExpenses,
    saveSetting,
    loadSetting,
    clearExpenses,
    clearSettings
} from "./db.js";

// 🌟 DOM Elements

const logoImg = document.getElementById("logo");

const screens = document.querySelectorAll(".screen");
const bottomBar = document.querySelector(".bottom-bar");
const appHeader = document.querySelector(".app-header");
const screenTitle = document.getElementById("screen-title");
const toggleThemeBtn = document.getElementById("toggle-theme-btn");

const usernameForm = document.getElementById("username-form");
const usernameInput = document.getElementById("username-input");
const greeting = document.getElementById("greeting");

const expenseForm = document.getElementById("expense-form");
const homeBtn = document.getElementById("home-btn");
const addBtn = document.getElementById("add-btn");
const settingsBtn = document.getElementById("settings-btn");

const changeUsernameBtn = document.getElementById("change-username-btn");
const backHomeBtn = document.getElementById("back-home-btn");
const clearDataBtn = document.getElementById("clear-data-btn");

// 🧠 Update greeting message
function updateGreeting(name) {
    greeting.textContent = `Welcome, ${name}`;
}

// 🔄 Show only one screen at a time
function showScreen(id) {
    screens.forEach((screen) => screen.classList.add("hidden"));
    const activeScreen = document.getElementById(id);
    if (activeScreen) activeScreen.classList.remove("hidden");

    // 🎯 Hide bottom bar only on username screen
    if (id === "username-screen") {
        bottomBar.classList.add("hidden");
        appHeader.classList.add("hidden");
    } else {
        bottomBar.classList.remove("hidden");
        appHeader.classList.remove("hidden");
    }

    if (id === "home-screen") screenTitle.textContent = "Home";
    else if (id === "add-expense-screen") screenTitle.textContent = "Add Expense";
    else if (id === "settings-screen") screenTitle.textContent = "Settings";

    if (id === "home-screen") {
        loadExpenses();
    }
}

// 🚀 App Startup
async function init() {
    const storedName = await loadSetting("username");
    if (storedName && typeof storedName.value === "string") {
        updateGreeting(storedName.value);
        showScreen("home-screen");
    } else {
        showScreen("username-screen");
    }
}

// 📝 Handle Username Form Submit
usernameForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = usernameInput.value.trim();
    if (name) {
        await saveSetting("username", name);
        updateGreeting(name);
        showScreen("home-screen");
        usernameInput.value = "";
    }
});

// 🚀 Update UI to show home screen after adding an expense
async function handleAddExpense() {
    const amountInput = document.getElementById("amount");
    const categoryInput = document.getElementById("category");
    const noteInput = document.getElementById("note");
    const dateInput = document.getElementById("date");

    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value.trim();
    const note = noteInput.value.trim();
    const date = dateInput.value;

    if (isNaN(amount) || !category || !date) {
        alert("Please fill in amount, category, and date correctly.");
        return;
    }

    await addExpense({ amount, category, note, date });

    amountInput.value = "";
    categoryInput.value = "";
    noteInput.value = "";
    dateInput.value = "";

    showScreen("home-screen");
}

// 📥 Load expenses to display
async function loadExpenses() {
    const container = document.getElementById("recent-expenses");
    const emptyMessage = document.getElementById("no-expenses");

    container.innerHTML = "";
    const expenses = await getRecentExpenses();

    if (!expenses || expenses.length === 0) {
        emptyMessage.classList.remove("hidden");
        return;
    }

    emptyMessage.classList.add("hidden");

    expenses.forEach((expense) => {
        const item = document.createElement("div");
        item.className = "expense-item";
        item.innerHTML = `
      <strong>₹${expense.amount.toFixed(2)}</strong> - ${expense.category}<br/>
      <small>${expense.note || ""}</small><br/>
      <small>Date: ${expense.date}</small>
    `;
        container.appendChild(item);
    });
}

// 🌍 Bottom Bar Navigation
homeBtn.addEventListener("click", () => showScreen("home-screen"));
addBtn.addEventListener("click", () => showScreen("add-expense-screen"));
settingsBtn.addEventListener("click", () => showScreen("settings-screen"));

// ⚙️ Settings Actions
changeUsernameBtn.addEventListener("click", async () => {
    await saveSetting("username", null);
    showScreen("username-screen");
});

clearDataBtn.addEventListener("click", async () => {
    if (confirm("Are you sure you want to clear all data?")) {
        await clearExpenses();
        await clearSettings();
        alert("All data cleared.");
        showScreen("username-screen");
    }
});

backHomeBtn.addEventListener("click", () => showScreen("home-screen"));

// ➕ Expense Form Submit
expenseForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleAddExpense();
});

// 🌙 Toggle Theme
toggleThemeBtn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    toggleThemeBtn.innerHTML = isDark
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';

    // Change logo image based on theme
    logoImg.src = isDark
        ? "/Images/Light Blue Logo.png"  // Replace with your dark theme logo path
        : "/Images/Dark Blue Logo.png";
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker registered ✅'))
            .catch(err => console.error('SW registration failed ❌', err));
    });
}


// 🚀 Kick off the app
init();

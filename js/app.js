let items = JSON.parse(localStorage.getItem("kampusItems")) || [
    {
        name: "Black Water Bottle",
        category: "Accessories",
        type: "Lost",
        location: "Campus 12"
    },
    {
        name: "Student ID Card",
        category: "Documents",
        type: "Found",
        location: "Library"
    },
    {
        name: "Blue Notebook",
        category: "Stationery",
        type: "Lost",
        location: "Campus 7"
    },
    {
        name: "Wireless Earbuds",
        category: "Electronics",
        type: "Found",
        location: "Food Court"
    }
];

const itemsContainer = document.getElementById("itemsContainer");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const noResults = document.getElementById("noResults");

function displayItems(data) {
    itemsContainer.innerHTML = "";

    if (data.length === 0) {
        noResults.style.display = "block";
        return;
    }

    noResults.style.display = "none";

    data.forEach(item => {
        const card = document.createElement("div");

        card.className = "item-card";

    card.innerHTML = `
    <div class="item-card-header">
        <h3>${item.name}</h3>
        <span class="status-badge ${item.type.toLowerCase()}">
            ${item.type}
        </span>
    </div>

    <p>Category: ${item.category}</p>
    <p>Location: ${item.location}</p>

    <button class="delete-btn">Delete Item</button>
`;

        itemsContainer.appendChild(card);
        const deleteBtn = card.querySelector(".delete-btn");

deleteBtn.addEventListener("click", function() {
    const confirmDelete = confirm("Are you sure you want to delete this item?");

    if (confirmDelete) {
        const index = items.indexOf(item);

        items.splice(index, 1);

        localStorage.setItem("kampusItems", JSON.stringify(items));

        displayItems(items);
    }
});
    });
}

function searchItems() {
    const searchText = searchInput.value.toLowerCase().trim();

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchText) ||
        item.category.toLowerCase().includes(searchText) ||
        item.location.toLowerCase().includes(searchText) ||
        item.type.toLowerCase().includes(searchText)
    );

    displayItems(filteredItems);
}

searchBtn.addEventListener("click", searchItems);

searchInput.addEventListener("input", searchItems);

displayItems(items);
const reportForm = document.getElementById("reportForm");

reportForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const newItem = {
        name: document.getElementById("itemName").value.trim(),
        category: document.getElementById("itemCategory").value,
        type: document.getElementById("itemType").value,
        location: document.getElementById("itemLocation").value.trim()
    };

    if (!newItem.name || !newItem.location) {
        alert("Please fill all the fields!");
        return;
    }

    items.unshift(newItem);
    localStorage.setItem("kampusItems", JSON.stringify(items));

    displayItems(items);

    reportForm.reset();

    alert("Item reported successfully!");
});
// DARK / LIGHT MODE TOGGLE

const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", function() {
    document.body.classList.toggle("light-mode");

    if (document.body.classList.contains("light-mode")) {
        themeToggle.innerHTML = "🌙 Dark Mode";
    } else {
        themeToggle.innerHTML = "☀️ Light Mode";
    }
});
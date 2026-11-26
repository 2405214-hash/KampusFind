import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

    const supabaseUrl = "https://bsrqbxdvueockqdxsclj.supabase.co";
    const supabaseKey = "sb_publishable_R2fXXTOAFifZsGOYhczbIw_K57w9170";
    const supabase = createClient(supabaseUrl, supabaseKey);

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

let editingItemId = null;

let displayRequestId = 0;

async function displayItems(data) {
    const requestId = ++displayRequestId;
    
    if (data.length === 0) {
        itemsContainer.innerHTML = "";
        noResults.textContent = items.length === 0
            ? "No items reported yet. Be the first to report an item!"
            : "No items found matching your search.";

        noResults.style.display = "block";
        return;
    }

    noResults.style.display = "none";

const { data: { user } } = await supabase.auth.getUser();

if (requestId !== displayRequestId) return;

const currentUserId = user?.id;

itemsContainer.innerHTML = "";

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

            ${item.status === "Resolved"
                ? '<span class="resolved-badge">RESOLVED</span>'
                : ''}

            ${item.user_id === currentUserId ? `
                <div class="item-actions">
                    <button class="delete-btn">Delete Item</button>
                    <button class="edit-btn">Edit Item</button>
                    ${item.status === "Open"
                        ? '<button class="resolve-btn">Mark as Resolved</button>'
                        : ''}
                </div>
            ` : ''}
        `;

        itemsContainer.appendChild(card);

        // Mark as Resolved
        const resolveBtn = card.querySelector(".resolve-btn");

        if (resolveBtn) {
            resolveBtn.addEventListener("click", async function() {
                const confirmResolve = confirm(
                    "Are you sure you want to mark this item as resolved?"
                );

                if (!confirmResolve) return;

                const { error } = await supabase
                    .from("items")
                    .update({ status: "Resolved" })
                    .eq("id", item.id);

                if (error) {
                    showNotification(error.message, "error");
                    return;
                }

                await fetchItems();
                showNotification("Item marked as resolved!");
            });
        }

        // Edit Item
        const editBtn = card.querySelector(".edit-btn");

        if (editBtn) {
            editBtn.addEventListener("click", function() {
                editingItemId = item.id;
                document.getElementById("editModal").classList.remove("hidden");

                document.getElementById("editItemName").value = item.name;
                document.getElementById("editItemCategory").value = item.category;
                document.getElementById("editItemType").value = item.type;
                document.getElementById("editItemLocation").value = item.location;
            });
        }

        // Delete Item
        const deleteBtn = card.querySelector(".delete-btn");

        if (deleteBtn) {
            deleteBtn.addEventListener("click", async function() {
                const confirmDelete = confirm(
                    "Are you sure you want to delete this item?"
                );

                if (!confirmDelete) return;

                const { error } = await supabase
                    .from("items")
                    .delete()
                    .eq("id", item.id);

                if (error) {
                    showNotification(error.message, "error");
                    return;
                }

                await fetchItems();
                showNotification("Item deleted successfully!");
            });
        }
    });
}


let notificationTimer;

function showNotification(message, type = "success") {
    const notification = document.getElementById("appNotification");

    notification.textContent = message;
    notification.className = `app-notification ${type}`;
    notification.style.display = "block";

    clearTimeout(notificationTimer);

    notificationTimer = setTimeout(() => {
        notification.style.display = "none";
    }, 4000);
}

// Fetch Items from Supabase
async function fetchItems() {
    const loadingMessage = document.getElementById("loadingMessage");

    loadingMessage.style.display = "block";

    const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching items:", error.message);
        alert("Could not load items from database.");

        loadingMessage.style.display = "none";
        return;
    }

    items = data.map(item => ({
    id: item.id,
    user_id: item.user_id,
    name: item.title,
    category: item.category,
    type: item.item_type,
    location: item.location,
    status: item.status
}));

    displayItems(items);

    loadingMessage.style.display = "none";
}

function searchItems() {
    const searchText = searchInput.value.toLowerCase().trim();

    const selectedCategory =
        document.getElementById("categoryFilter").value;

    const selectedType =
        document.getElementById("typeFilter").value;

    const filteredItems = items.filter(item => {

        const matchesSearch =
            item.name.toLowerCase().includes(searchText) ||
            item.category.toLowerCase().includes(searchText) ||
            item.location.toLowerCase().includes(searchText) ||
            item.type.toLowerCase().includes(searchText);

        const matchesCategory =
            selectedCategory === "All" ||
            item.category === selectedCategory;

        const matchesType =
            selectedType === "All" ||
            item.type === selectedType;

        return matchesSearch && matchesCategory && matchesType;
    });

    displayItems(filteredItems);
}

// Search button click
searchBtn.addEventListener("click", function() {
    searchItems();

    document.getElementById("lost").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

// Live search while typing (no scrolling)
searchInput.addEventListener("input", searchItems);

// Search when Enter is pressed
searchInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();

        searchItems();

        document.getElementById("lost").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
});

// Category Filter Event
const categoryFilter = document.getElementById("categoryFilter");

categoryFilter.addEventListener("change", searchItems);
// Lost / Found Filter Event
const typeFilter = document.getElementById("typeFilter");

typeFilter.addEventListener("change", searchItems);

// Reset Filters
const resetFiltersBtn = document.getElementById("resetFiltersBtn");

resetFiltersBtn.addEventListener("click", function() {
    searchInput.value = "";
    categoryFilter.value = "All";
    typeFilter.value = "All";

    searchItems();
});

const reportForm = document.getElementById("reportForm");


// Report Item to Supabase
reportForm.addEventListener("submit", async function(event) {
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

    // Check logged-in user
    const { data: { user }, error: userError } =
        await supabase.auth.getUser();

    if (userError || !user) {
        alert("Please login before reporting an item.");
        return;
    }

    // Save item in Supabase
    const { error } = await supabase
        .from("items")
        .insert({
            title: newItem.name,
            category: newItem.category,
            location: newItem.location,
            item_type: newItem.type,
            user_id: user.id
        });

    if (error) {
    showNotification(error.message, "error");
    return;
}

    await fetchItems();

    reportForm.reset();

    showNotification("Item reported successfully!");
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

// Login and Sign Up Tab Switching
const authLoginTab = document.getElementById("loginTab");
const authSignupTab = document.getElementById("signupTab");

const authLoginForm = document.getElementById("loginForm");
const authSignupForm = document.getElementById("signupForm");

authLoginTab.addEventListener("click", () => {
    authLoginForm.classList.remove("hidden");
    authSignupForm.classList.add("hidden");

    authLoginTab.classList.add("active");
    authSignupTab.classList.remove("active");
});

authSignupTab.addEventListener("click", () => {
    authSignupForm.classList.remove("hidden");
    authLoginForm.classList.add("hidden");

    authSignupTab.classList.add("active");
    authLoginTab.classList.remove("active");
});
// Navbar Login Button
document.getElementById("loginNavBtn").addEventListener("click", () => {
    authLoginTab.click();
});

// Navbar Sign Up Button
document.getElementById("signupNavBtn").addEventListener("click", () => {
    authSignupTab.click();
});

// Sign Up with Supabase
authSignupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: name
            },
            emailRedirectTo: "http://127.0.0.1:5500"
        }
    });

    if (error) {
    showNotification(error.message, "error");
    return;
}

    showNotification("Account created! Please check your email and confirm your account before logging in.");

    authSignupForm.reset();
});

// Resend Email Confirmation
const resendConfirmation = async (email) => {
    const { error } = await supabase.auth.resend({
        type: "signup",
        email: email
    });

    if (error) {
        alert(error.message);
        return;
    }

    alert("A fresh confirmation email has been sent. Please check your inbox.");
};

// Resend Confirmation Button
const resendEmailBtn = document.getElementById("resendEmailBtn");

resendEmailBtn.addEventListener("click", () => {
    const email = document.getElementById("signupEmail").value.trim();

    if (!email) {
        alert("Please enter your email address first.");
        return;
    }

    resendConfirmation(email);
});


// Login with Supabase
authLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
    showNotification(error.message, "error");
    return;
}

    showNotification("Login successful! Welcome to KampusFind.");

    authLoginForm.reset();
});
// Navbar Authentication State
const loginNavBtn = document.getElementById("loginNavBtn");
const signupNavBtn = document.getElementById("signupNavBtn");
const logoutBtn = document.getElementById("logoutBtn");

const updateNavbar = (session) => {
    const isLoggedIn = Boolean(session);

    loginNavBtn.classList.toggle("hidden", isLoggedIn);
    signupNavBtn.classList.toggle("hidden", isLoggedIn);
    logoutBtn.classList.toggle("hidden", !isLoggedIn);
};

// Check login status and listen for changes
supabase.auth.onAuthStateChange((_event, session) => {
    updateNavbar(session);
});

// Logout Functionality
logoutBtn.addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        alert(error.message);
        return;
    }

    showNotification("You have been logged out!");
});

// Migrate old LocalStorage items to Supabase
async function migrateLocalItemsToSupabase() {
    const savedItems = JSON.parse(
        localStorage.getItem("kampusItems")
    ) || [];

    const { data: { user }, error: userError } =
        await supabase.auth.getUser();

    if (userError || !user) {
        alert("Please login before migrating items.");
        return;
    }

    // Check existing items to avoid duplicates
    const { data: existingItems, error: fetchError } =
        await supabase
            .from("items")
            .select("title, category, location, item_type")
            .eq("user_id", user.id);

    if (fetchError) {
        alert(fetchError.message);
        return;
    }

    // Select only items that are not already in database
    const rowsToInsert = savedItems
        .filter(item => !existingItems.some(existing =>
            existing.title === item.name &&
            existing.category === item.category &&
            existing.location === item.location &&
            existing.item_type === item.type
        ))
        .map(item => ({
            title: item.name,
            category: item.category,
            location: item.location,
            item_type: item.type,
            user_id: user.id
        }));

    if (rowsToInsert.length === 0) {
        alert("All old items are already migrated!");
        await fetchItems();
        return;
    }

    const { error: insertError } = await supabase
        .from("items")
        .insert(rowsToInsert);

    if (insertError) {
        alert(insertError.message);
        return;
    }

    alert(rowsToInsert.length + " old items migrated successfully!");

    await fetchItems();
}

// Run migration
fetchItems();
// Close Edit Modal
const cancelEditBtn = document.getElementById("cancelEditBtn");
const editModal = document.getElementById("editModal");

cancelEditBtn.addEventListener("click", function() {
    editModal.classList.add("hidden");
});
// Update Item in Supabase
const editItemForm = document.getElementById("editItemForm");

editItemForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const updatedItem = {
        title: document.getElementById("editItemName").value.trim(),
        category: document.getElementById("editItemCategory").value,
        item_type: document.getElementById("editItemType").value,
        location: document.getElementById("editItemLocation").value.trim()
    };

    if (!updatedItem.title || !updatedItem.location) {
        showNotification("Please fill all the fields!", "error");
        return;
    }

    const { error } = await supabase
        .from("items")
        .update(updatedItem)
        .eq("id", editingItemId);

    if (error) {
        showNotification(error.message, "error");
        return;
    }

    editModal.classList.add("hidden");

    await fetchItems();

    showNotification("Item updated successfully!");
});
// Toggle Password Visibility
const togglePasswordButtons = document.querySelectorAll(".toggle-password");

togglePasswordButtons.forEach(button => {
    button.addEventListener("click", function() {
        const targetId = this.dataset.target;
        const passwordInput = document.getElementById(targetId);

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            this.textContent = "🙈";
        } else {
            passwordInput.type = "password";
            this.textContent = "👁️";
        }
    });
});
// Forgot Password
const forgotPasswordLink = document.getElementById("forgotPasswordLink");

forgotPasswordLink.addEventListener("click", async function(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();

    if (!email) {
        alert("Please enter your registered email address first.");
        return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password.html`
    });

    if (error) {
        alert(error.message);
    } else {
        alert("Password reset email sent! Please check your inbox.");
    }
});
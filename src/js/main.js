import { MealApi } from "./api/mealdb.js";
import { NutritionApi } from "./api/nutrition.js";
import { ProductApi } from "./api/products.js";
import { AppState } from "./state/appState.js";
import { Ui, MealView, ProductView, LogView, escapeHtml } from "./ui/components.js";

class Notifier {
  toast(message, type) {
    const colors = {
      success: "bg-emerald-500",
      error: "bg-red-500",
      info: "bg-blue-500",
      warning: "bg-amber-500",
    };

    const box = document.createElement("div");
    box.className =
      "fixed bottom-4 right-4 z-50 text-white px-6 py-3 rounded-lg shadow-lg toast-notification " +
      colors[type];
    box.textContent = message;
    document.body.appendChild(box);

    window.setTimeout(function () {
      box.remove();
    }, 3000);
  }

  success(title, text) {
    if (typeof Swal === "undefined") {
      this.toast(title, "success");
      return;
    }

    Swal.fire({
      icon: "success",
      title: title,
      text: text,
      timer: 2200,
      showConfirmButton: false,
    });
  }

  confirm(title, text, onConfirm) {
    if (typeof Swal === "undefined") {
      onConfirm();
      return;
    }

    Swal.fire({
      icon: "warning",
      title: title,
      text: text,
      showCancelButton: true,
      confirmButtonText: "Yes, clear it!",
      confirmButtonColor: "#ef4444",
      cancelButtonText: "Cancel",
      cancelButtonColor: "#6b7280",
    }).then(function (result) {
      if (result.isConfirmed) {
        onConfirm();
      }
    });
  }
}

class NutriPlanApp {
  constructor() {
    this.mealApi = new MealApi();
    this.nutritionApi = new NutritionApi();
    this.productApi = new ProductApi();
    this.state = new AppState();
    this.notifier = new Notifier();
    this.ui = new Ui();
    this.mealView = new MealView();
    this.productView = new ProductView();
    this.logView = new LogView();

    this.categories = [];
    this.areas = [];
    this.meals = [];
    this.products = [];
    this.selectedArea = "";
    this.selectedGrade = "";
    this.searchTimer = null;
    this.nutritionCache = {};
    this.showingFavorites = false;
    this.regularMeals = [];

    this.pageSections = {
      meals: ["search-filters-section", "meal-categories-section", "all-recipes-section"],
      detail: ["meal-details"],
      products: ["products-section"],
      foodlog: ["foodlog-section"],
    };
  }

  async start() {
    this.showLoader();
    this.setupSidebar();
    this.setupNavigation();
    this.setupRouting();
    this.setupSearch();
    this.setupViewToggle();
    this.setupProductsPage();
    this.setupQuickActions();
    this.setupFoodLogEvents();
    this.setupFavoritesBar();
    this.setupViewAllButton();

    await this.loadFilters();
    await this.loadMeals();

    this.offline = this.categories.length === 0 && this.meals.length === 0;
    if (this.offline) {
      this.notifier.toast("Could not reach the recipes service", "error");
    }

    this.renderAreaFilters();
    this.renderCategories();
    this.renderRecipes();
    this.handleRoute();
    this.hideLoader();
  }

  showLoader() {
    const overlay = document.getElementById("app-loading-overlay");
    if (!overlay) {
      return;
    }
    overlay.classList.remove("loading");
  }

  hideLoader() {
    const overlay = document.getElementById("app-loading-overlay");
    if (!overlay) {
      return;
    }
    overlay.classList.add("loading");
  }

  setupSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    const menuButton = document.getElementById("header-menu-btn");
    const closeButton = document.getElementById("sidebar-close-btn");

    const openSidebar = function () {
      sidebar.classList.add("open");
      overlay.classList.add("active");
    };

    const closeSidebar = function () {
      sidebar.classList.remove("open");
      overlay.classList.remove("active");
    };

    menuButton.addEventListener("click", openSidebar);
    closeButton.addEventListener("click", closeSidebar);
    overlay.addEventListener("click", closeSidebar);

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && sidebar.classList.contains("open")) {
        closeSidebar();
      }
    });

    document.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        closeSidebar();
      });
    });
  }

  setupNavigation() {
    const links = document.querySelectorAll(".nav-link");
    const routes = ["home", "products", "foodlog"];
    const pages = ["meals", "products", "foodlog"];

    for (let index = 0; index < links.length; index++) {
      links[index].setAttribute("href", "#/" + routes[index]);
      links[index].dataset.page = pages[index];
    }
  }

  setupRouting() {
    window.addEventListener("hashchange", () => this.handleRoute());
  }

  getRoute() {
    return window.location.hash.replace(/^#\/?/, "") || "home";
  }

  navigateTo(path) {
    window.location.hash = "#/" + path;
  }

  handleRoute() {
    const route = this.getRoute();

    if (route.indexOf("meal/") === 0) {
      this.showMealDetail(route.replace("meal/", ""));
      this.markActiveLink("meals");
      return;
    }

    if (route === "products") {
      this.showPage("products");
      this.updateHeader("Product Scanner", "Search packaged foods by name or barcode");
      this.markActiveLink("products");
      return;
    }

    if (route === "foodlog") {
      this.showPage("foodlog");
      this.updateHeader("Food Log", "Track your daily nutrition and food intake");
      this.renderFoodLog();
      this.markActiveLink("foodlog");
      return;
    }

    this.showPage("meals");
    this.updateHeader(
      "Meals & Recipes",
      "Discover delicious and nutritious recipes tailored for you"
    );
    this.markActiveLink("meals");
  }

  showPage(name) {
    const all = [
      "search-filters-section",
      "meal-categories-section",
      "all-recipes-section",
      "meal-details",
      "products-section",
      "foodlog-section",
    ];

    for (let index = 0; index < all.length; index++) {
      const section = document.getElementById(all[index]);
      if (section) {
        section.style.display = "none";
      }
    }

    const visible = this.pageSections[name];
    for (let index = 0; index < visible.length; index++) {
      const section = document.getElementById(visible[index]);
      if (section) {
        section.style.display = "";
      }
    }

    window.scrollTo(0, 0);
  }

  updateHeader(title, subtitle) {
    document.querySelector("#header h1").textContent = title;
    document.querySelector("#header p").textContent = subtitle;
  }

  markActiveLink(page) {
    const activeClasses = ["bg-emerald-50", "text-emerald-700"];
    const idleClasses = ["text-gray-600", "hover:bg-gray-50"];

    document.querySelectorAll(".nav-link").forEach(function (link) {
      const label = link.querySelector("span");

      if (link.dataset.page === page) {
        link.classList.add(activeClasses[0], activeClasses[1]);
        link.classList.remove(idleClasses[0], idleClasses[1]);
        label.classList.add("font-semibold");
        label.classList.remove("font-medium");
      } else {
        link.classList.remove(activeClasses[0], activeClasses[1]);
        link.classList.add(idleClasses[0], idleClasses[1]);
        label.classList.remove("font-semibold");
        label.classList.add("font-medium");
      }
    });
  }

  async loadFilters() {
    this.categories = await this.mealApi.getCategories();
    this.areas = await this.mealApi.getAreas();
  }

  async loadMeals() {
    this.meals = await this.mealApi.searchByName("chicken");
  }

  renderAreaFilters() {
    const section = document.getElementById("search-filters-section");
    const container = section.querySelector("div.overflow-x-auto");
    if (!container) {
      return;
    }

    const popularAreas = [
      "American",
      "British",
      "Chinese",
      "Egyptian",
      "French",
      "Greek",
      "Indian",
      "Italian",
      "Japanese",
      "Mexican",
      "Moroccan",
      "Thai",
      "Turkish",
    ];
    const visibleAreas = this.areas.filter((area) =>
      popularAreas.includes(area.strArea)
    );

    container.innerHTML = this.mealView.areaButtons(
      visibleAreas,
      this.selectedArea
    );
    container.querySelectorAll(".area-filter-btn").forEach((button) => {
      button.addEventListener("click", () =>
        this.filterByArea(button.dataset.area)
      );
    });
  }

  renderCategories() {
    const grid = document.getElementById("categories-grid");
    const categories = this.categories.slice(0, 12);

    if (categories.length === 0) {
      grid.innerHTML = this.ui.emptyState(
        "Couldn't load categories",
        "Check your internet connection, then refresh the page",
        "fa-triangle-exclamation"
      );
      return;
    }

    grid.innerHTML = categories
      .map((category) => this.mealView.categoryCard(category))
      .join("");

    grid.querySelectorAll(".category-card").forEach((card) => {
      card.addEventListener("click", () =>
        this.filterByCategory(card.dataset.category)
      );
    });
  }

  renderRecipes() {
    const grid = document.getElementById("recipes-grid");
    const counter = document.getElementById("recipes-count");

    if (this.meals.length === 0) {
      if (this.offline) {
        grid.innerHTML = this.ui.emptyState(
          "Couldn't load recipes",
          "Check your internet connection, then refresh the page",
          "fa-triangle-exclamation"
        );
      } else if (this.showingFavorites) {
        grid.innerHTML = this.ui.emptyState(
          "No saved recipes yet",
          "Tap the heart on any recipe to save it here",
          "fa-heart"
        );
      } else {
        grid.innerHTML = this.ui.emptyState(
          "No recipes found",
          "Try searching for something else",
          "fa-search"
        );
      }
      counter.textContent = "Showing 0 recipes";
      return;
    }

    grid.innerHTML = this.meals
      .map((meal) =>
        this.mealView.card(meal, this.state.isFavorite(meal.idMeal))
      )
      .join("");

    counter.textContent = this.showingFavorites
      ? "Showing " + this.meals.length + " saved recipes"
      : "Showing " + this.meals.length + " recipes";

    grid.querySelectorAll(".recipe-card").forEach((card) => {
      card.addEventListener("click", () => {
        const meal = this.findMeal(card.dataset.mealId);
        if (meal) {
          this.navigateTo("meal/" + this.mealApi.slugify(meal.strMeal));
        }
      });
    });

    grid.querySelectorAll(".save-recipe-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        this.handleFavorite(button.dataset.mealId, button);
      });
    });
  }

  setupFavoritesBar() {
    const app = this;
    const tools = document.getElementById("view-toggle").parentNode;
    const button = document.createElement("button");
    button.id = "favorites-btn";
    button.className =
      "flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:text-red-500 transition-all";
    button.innerHTML =
      '<i class="fa-regular fa-heart"></i><span>Saved</span><span id="favorites-count" class="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-bold">0</span>';

    tools.insertBefore(button, tools.firstChild);

    button.addEventListener("click", function () {
      app.toggleFavoritesView();
    });

    this.updateFavoritesCount();
  }

  setupViewAllButton() {
    const app = this;
    const button = document.querySelector("#meal-categories-section button");
    if (!button) {
      return;
    }

    button.addEventListener("click", function () {
      const section = document.getElementById("all-recipes-section");
      window.scrollTo({ top: section.offsetTop - 80, behavior: "smooth" });
    });
  }

  updateFavoritesCount() {
    const counter = document.getElementById("favorites-count");
    if (!counter) {
      return;
    }
    counter.textContent = this.state.getFavorites().length;
  }

  toggleFavoritesView() {
    const button = document.getElementById("favorites-btn");
    const icon = button.querySelector("i");

    if (this.showingFavorites) {
      this.showingFavorites = false;
      this.meals = this.regularMeals;
      button.className =
        "flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:text-red-500 transition-all";
      icon.className = "fa-regular fa-heart";
      this.renderRecipes();
      return;
    }

    this.regularMeals = this.meals;
    this.showingFavorites = true;
    this.meals = this.state.getFavorites();
    button.className =
      "flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-sm font-semibold text-red-600 transition-all";
    icon.className = "fa-solid fa-heart";
    this.renderRecipes();
  }

  handleFavorite(mealId, button) {
    const meal = this.findMeal(mealId);
    if (!meal) {
      return;
    }

    const saved = this.state.toggleFavorite(meal);
    const icon = button.querySelector("i");

    if (saved) {
      icon.className = "fa-solid fa-heart text-red-500";
      this.notifier.toast(meal.strMeal + " saved to favorites", "success");
    } else {
      icon.className = "fa-regular fa-heart";
      this.notifier.toast(meal.strMeal + " removed from favorites", "info");
    }

    this.updateFavoritesCount();

    if (this.showingFavorites) {
      this.meals = this.state.getFavorites();
      this.renderRecipes();
    }
  }

  findMeal(id) {
    for (let index = 0; index < this.meals.length; index++) {
      if (String(this.meals[index].idMeal) === String(id)) {
        return this.meals[index];
      }
    }
    return null;
  }

  async filterByCategory(category) {
    this.showingFavorites = false;
    const grid = document.getElementById("recipes-grid");
    this.showPage("meals");
    this.updateHeader(
      "Meals & Recipes",
      "Discover delicious and nutritious recipes tailored for you"
    );
    grid.innerHTML = this.ui.spinner();

    const shortMeals = await this.mealApi.filterByCategory(category);
    const meals = await this.mealApi.loadFullMeals(shortMeals, 25);

    this.meals = meals;
    this.renderRecipes();
    document.getElementById("recipes-count").textContent =
      "Showing " + meals.length + " " + category + " recipes";
  }

  async filterByArea(area) {
    this.showingFavorites = false;
    this.selectedArea = area;
    this.renderAreaFilters();

    const grid = document.getElementById("recipes-grid");
    grid.innerHTML = this.ui.spinner();

    let meals = [];
    if (area) {
      const shortMeals = await this.mealApi.filterByArea(area);
      meals = await this.mealApi.loadFullMeals(shortMeals, 25);
    } else {
      meals = await this.mealApi.searchByName("chicken");
    }

    this.meals = meals;
    this.renderRecipes();

    if (area) {
      document.getElementById("recipes-count").textContent =
        "Showing " + meals.length + " " + area + " recipes";
    }
  }

  setupSearch() {
    const input = document.getElementById("search-input");
    if (!input) {
      return;
    }

    input.addEventListener("input", () => {
      const term = input.value.trim();
      window.clearTimeout(this.searchTimer);
      this.searchTimer = window.setTimeout(() => this.searchRecipes(term), 300);
    });
  }

  async searchRecipes(term) {
    this.showingFavorites = false;
    if (term.length === 0) {
      await this.loadMeals();
      this.renderRecipes();
      return;
    }

    if (term.length < 2) {
      return;
    }

    const grid = document.getElementById("recipes-grid");
    grid.innerHTML = this.ui.spinner();

    const meals = await this.mealApi.searchByName(term);
    this.meals = meals;
    this.renderRecipes();
    document.getElementById("recipes-count").textContent =
      'Showing ' + meals.length + ' recipes for "' + term + '"';
  }

  setupViewToggle() {
    const gridButton = document.getElementById("grid-view-btn");
    const listButton = document.getElementById("list-view-btn");
    const grid = document.getElementById("recipes-grid");

    const setMode = (mode) => {
      if (mode === "grid") {
        grid.classList.remove("list-view");
        gridButton.classList.add("bg-white", "shadow-sm");
        listButton.classList.remove("bg-white", "shadow-sm");
        gridButton.querySelector("i").className = "fa-solid fa-table-cells text-gray-700";
        listButton.querySelector("i").className = "fa-solid fa-list text-gray-500";
      } else {
        grid.classList.add("list-view");
        listButton.classList.add("bg-white", "shadow-sm");
        gridButton.classList.remove("bg-white", "shadow-sm");
        listButton.querySelector("i").className = "fa-solid fa-list text-gray-700";
        gridButton.querySelector("i").className = "fa-solid fa-table-cells text-gray-500";
      }
    };

    gridButton.addEventListener("click", () => setMode("grid"));
    listButton.addEventListener("click", () => setMode("list"));
  }

  async showMealDetail(identifier) {
    const app = this;
    app.showPage("detail");
    app.updateHeader("Recipe Details", "View full recipe information and nutrition facts");

    const section = document.getElementById("meal-details");
    section.className = "bg-gray-50";
    section.innerHTML = app.ui.spinner();

    let meal = null;
    if (/^\d+$/.test(identifier)) {
      meal = await app.mealApi.getById(identifier);
    } else {
      const found = await app.mealApi.searchByName(identifier.replace(/-/g, " "));
      for (let index = 0; index < found.length; index++) {
        if (app.mealApi.slugify(found[index].strMeal) === identifier) {
          meal = found[index];
        }
      }
      if (!meal && found.length > 0) {
        meal = found[0];
      }
    }

    if (!meal) {
      section.innerHTML = app.ui.emptyState(
        "Failed to load recipe details",
        "Please go back and try another recipe",
        "fa-exclamation-circle"
      );
      return;
    }

    const ingredients = app.mealApi.getIngredients(meal);
    const steps = app.mealApi.getInstructionSteps(meal);
    const youtubeId = app.mealApi.getYoutubeId(meal);

    section.innerHTML = app.mealView.detailPage(
      meal,
      ingredients,
      steps,
      youtubeId,
      meal.strSource
    );

    document.getElementById("back-to-meals-btn").addEventListener("click", function () {
      app.navigateTo("home");
    });

    document.getElementById("log-meal-btn").addEventListener("click", function () {
      app.openLogMealModal(meal);
    });

    await app.loadNutrition(meal, ingredients);
  }

  async loadNutrition(meal, ingredients) {
    const container = document.getElementById("nutrition-facts-container");
    if (!container) {
      return;
    }

    const ingredientList = ingredients.map(
      (item) => item.measure + " " + item.ingredient
    );
    const analysis = await this.nutritionApi.analyze(
      meal.strMeal,
      ingredientList
    );
    const display = this.nutritionApi.prepareForDisplay(analysis);

    const calories = document.getElementById("hero-calories");
    const servings = document.getElementById("hero-servings");
    const logButton = document.getElementById("log-meal-btn");

    if (!display) {
      container.innerHTML = `
        <div class="text-center py-8">
          <i class="fa-solid fa-exclamation-circle text-3xl text-red-400 mb-3"></i>
          <p class="text-gray-600">Unable to load nutrition data</p>
        </div>
      `;
      calories.textContent = "N/A";
      return;
    }

    this.nutritionCache[meal.idMeal] = display;
    container.innerHTML = this.mealView.nutritionFacts(display);
    calories.textContent = display.caloriesPerServing + " cal/serving";
    servings.textContent = display.servings + " servings";

    logButton.disabled = false;
    logButton.className =
      "flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all cursor-pointer";
    logButton.innerHTML = `
      <i class="fa-solid fa-clipboard-list"></i>
      <span>Log This Meal</span>
    `;
  }

  openLogMealModal(meal) {
    const app = this;
    const nutrition = app.nutritionCache[meal.idMeal] || null;

    let summary = `
      <div class="bg-gray-50 rounded-xl p-4 mb-6">
        <p class="text-sm text-gray-500 text-center">Nutrition information not available for this meal</p>
      </div>
    `;

    if (nutrition) {
      summary = `
        <div class="bg-emerald-50 rounded-xl p-4 mb-6">
          <p class="text-sm text-gray-600 mb-2">Estimated nutrition per serving:</p>
          <div class="grid grid-cols-4 gap-2 text-center">
            <div>
              <p class="text-lg font-bold text-emerald-600">${nutrition.caloriesPerServing}</p>
              <p class="text-xs text-gray-500">Calories</p>
            </div>
            <div>
              <p class="text-lg font-bold text-blue-600">${nutrition.macros.protein.amount}g</p>
              <p class="text-xs text-gray-500">Protein</p>
            </div>
            <div>
              <p class="text-lg font-bold text-amber-600">${nutrition.macros.carbs.amount}g</p>
              <p class="text-xs text-gray-500">Carbs</p>
            </div>
            <div>
              <p class="text-lg font-bold text-purple-600">${nutrition.macros.fat.amount}g</p>
              <p class="text-xs text-gray-500">Fat</p>
            </div>
          </div>
        </div>
      `;
    }

    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
    overlay.id = "log-meal-modal";
    overlay.innerHTML = `
      <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4 scale-up">
        <div class="flex items-center gap-4 mb-6">
          <img src="${meal.strMealThumb}" alt="${escapeHtml(meal.strMeal)}" class="w-16 h-16 rounded-xl object-cover" />
          <div>
            <h3 class="text-xl font-bold text-gray-900">Log This Meal</h3>
            <p class="text-gray-500 text-sm">${escapeHtml(meal.strMeal)}</p>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-700 mb-2">Number of Servings</label>
          <div class="flex items-center gap-3">
            <button id="decrease-servings" class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
              <i class="fa-solid fa-minus text-gray-600"></i>
            </button>
            <input type="number" id="meal-servings" value="1" min="0.5" max="10" step="0.5"
              class="w-20 text-center text-xl font-bold border-2 border-gray-200 rounded-lg py-2" />
            <button id="increase-servings" class="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
              <i class="fa-solid fa-plus text-gray-600"></i>
            </button>
          </div>
        </div>

        ${summary}

        <div class="flex gap-3">
          <button id="cancel-log-meal" class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
            Cancel
          </button>
          <button id="confirm-log-meal" class="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">
            <i class="fa-solid fa-clipboard-list mr-2"></i>
            Log Meal
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const servingsInput = overlay.querySelector("#meal-servings");

    overlay.querySelector("#decrease-servings").addEventListener("click", function () {
      const value = parseFloat(servingsInput.value);
      if (value > 0.5) {
        servingsInput.value = (value - 0.5).toFixed(1);
      }
    });

    overlay.querySelector("#increase-servings").addEventListener("click", function () {
      const value = parseFloat(servingsInput.value);
      if (value < 10) {
        servingsInput.value = (value + 0.5).toFixed(1);
      }
    });

    overlay.querySelector("#cancel-log-meal").addEventListener("click", function () {
      overlay.remove();
    });

    overlay.querySelector("#confirm-log-meal").addEventListener("click", function () {
      const servings = parseFloat(servingsInput.value) || 1;
      app.logMeal(meal, servings, nutrition);
      overlay.remove();
    });

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        overlay.remove();
      }
    });
  }

  logMeal(meal, servings, nutrition) {
    let values = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    if (nutrition) {
      values = {
        calories: Math.round(nutrition.caloriesPerServing * servings),
        protein: Math.round(nutrition.macros.protein.amount * servings),
        carbs: Math.round(nutrition.macros.carbs.amount * servings),
        fat: Math.round(nutrition.macros.fat.amount * servings),
      };
    }

    this.state.addItem({
      type: "meal",
      name: meal.strMeal,
      mealId: meal.idMeal,
      category: meal.strCategory,
      thumbnail: meal.strMealThumb,
      servings: servings,
      nutrition: values,
      loggedAt: new Date().toISOString(),
    });

    this.notifier.success(
      "Meal Logged!",
      meal.strMeal +
        " (" +
        servings +
        (servings === 1 ? " serving" : " servings") +
        ") has been added to your daily log." +
        (values.calories > 0 ? " +" + values.calories + " calories" : "")
    );
  }

  renderFoodLog() {
    const log = this.state.getTodayLog();
    const goals = this.state.getGoals();

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    document.getElementById("foodlog-date").textContent = today;

    this.updateProgress(0, log.totalCalories, goals.calorieGoal, "kcal");
    this.updateProgress(1, log.totalProtein, goals.proteinGoal, "g");
    this.updateProgress(2, log.totalCarbs, goals.carbsGoal, "g");
    this.updateProgress(3, log.totalFat, goals.fatGoal, "g");

    const list = document.getElementById("logged-items-list");
    list.innerHTML = this.logView.itemsList(log.meals);

    const title = document.querySelector("#foodlog-today-section .border-t h4");
    if (title) {
      title.textContent = "Logged Items (" + log.meals.length + ")";
    }

    const clearButton = document.getElementById("clear-foodlog");
    clearButton.style.display = log.meals.length > 0 ? "block" : "none";

    const app = this;
    list.querySelectorAll(".remove-foodlog-item").forEach(function (button) {
      button.addEventListener("click", function () {
        app.handleRemoveItem(button);
      });
    });

    this.renderWeeklyChart();
  }

  updateProgress(index, value, goal, unit) {
    const summary = document.getElementById("foodlog-today-section");
    const grid = summary.querySelector(".grid");
    if (!grid) {
      return;
    }

    const card = grid.children[index];
    if (!card) {
      return;
    }

    const valueLabel = card.children[0].children[1];
    const bar = card.children[1].children[0];

    let percentage = 0;
    if (goal > 0) {
      percentage = (value / goal) * 100;
    }
    if (percentage > 100) {
      percentage = 100;
    }

    const colors = ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-purple-500"];
    for (let step = 0; step < colors.length; step++) {
      bar.classList.remove(colors[step]);
    }

    if (value > goal) {
      bar.classList.add("bg-red-500");
    } else {
      bar.classList.add(colors[index]);
    }

    valueLabel.textContent = Math.round(value) + " / " + goal + " " + unit;
    bar.style.transition = "width 0.6s ease";
    bar.style.width = Math.round(percentage) + "%";
  }

  handleRemoveItem(button) {
    const index = parseInt(button.dataset.index);
    this.state.removeItem(index);
    this.renderFoodLog();
    this.notifier.toast("Item removed from log", "info");
  }

  handleClearLog() {
    const app = this;
    app.notifier.confirm(
      "Clear Today's Log?",
      "This will remove all logged food items for today.",
      function () {
        app.state.clearToday();
        app.renderFoodLog();
        app.notifier.toast("Today's log cleared", "info");
      }
    );
  }

  renderWeeklyChart() {
    const container = document.getElementById("weekly-chart");
    if (!container || typeof Plotly === "undefined") {
      return;
    }

    const week = this.state.getWeekSummary();
    const labels = week.map((day) => day.dayName);
    const values = week.map((day) => day.calories);

    if (container.classList.contains("js-plotly-plot")) {
      Plotly.purge(container);
    }

    container.innerHTML = "";

    const data = [
      {
        x: labels,
        y: values,
        type: "bar",
        marker: { color: "#10b981" },
        width: [0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55],
        hovertemplate: "%{x}: %{y} kcal<extra></extra>",
      },
    ];

    const layout = {
      margin: { t: 16, r: 16, b: 36, l: 52 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: { family: "Inter, sans-serif", size: 12, color: "#6b7280" },
      xaxis: { fixedrange: true },
      yaxis: { title: { text: "kcal", font: { size: 12 } }, gridcolor: "#e5e7eb", fixedrange: true },
      shapes: [
        {
          type: "line",
          xref: "paper",
          x0: 0,
          x1: 1,
          y0: this.state.getGoals().calorieGoal,
          y1: this.state.getGoals().calorieGoal,
          line: { color: "#f59e0b", width: 2, dash: "dot" },
        },
      ],
    };

    Plotly.newPlot(container, data, layout, { displayModeBar: false, responsive: true });
  }

  setupFoodLogEvents() {
    const app = this;
    document.getElementById("clear-foodlog").addEventListener("click", function () {
      app.handleClearLog();
    });
  }

  setupQuickActions() {
    const app = this;
    const buttons = document.querySelectorAll(".quick-log-btn");
    if (buttons.length < 3) {
      return;
    }

    buttons[0].addEventListener("click", function () {
      app.navigateTo("home");
    });

    buttons[1].addEventListener("click", function () {
      app.navigateTo("products");
    });

    buttons[2].addEventListener("click", function () {
      app.openCustomEntry();
    });
  }

  openCustomEntry() {
    const app = this;

    if (typeof Swal === "undefined") {
      app.notifier.toast("Custom entry needs an internet connection", "error");
      return;
    }

    Swal.fire({
      title: "Add Custom Food",
      html:
        '<input id="custom-name" class="swal2-input" placeholder="Food name" />' +
        '<input id="custom-calories" type="number" min="0" class="swal2-input" placeholder="Calories (kcal)" />' +
        '<input id="custom-protein" type="number" min="0" class="swal2-input" placeholder="Protein (g)" />' +
        '<input id="custom-carbs" type="number" min="0" class="swal2-input" placeholder="Carbs (g)" />' +
        '<input id="custom-fat" type="number" min="0" class="swal2-input" placeholder="Fat (g)" />',
      showCancelButton: true,
      confirmButtonText: "Add to Log",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      cancelButtonText: "Cancel",
      focusConfirm: false,
      preConfirm: function () {
        const name = document.getElementById("custom-name").value.trim();
        if (name === "") {
          Swal.showValidationMessage("Please enter the food name");
          return false;
        }

        return {
          name: name,
          calories: parseFloat(document.getElementById("custom-calories").value) || 0,
          protein: parseFloat(document.getElementById("custom-protein").value) || 0,
          carbs: parseFloat(document.getElementById("custom-carbs").value) || 0,
          fat: parseFloat(document.getElementById("custom-fat").value) || 0,
        };
      },
    }).then(function (result) {
      if (!result.isConfirmed) {
        return;
      }

      app.state.addItem({
        type: "custom",
        name: result.value.name,
        nutrition: {
          calories: result.value.calories,
          protein: result.value.protein,
          carbs: result.value.carbs,
          fat: result.value.fat,
        },
        loggedAt: new Date().toISOString(),
      });

      app.renderFoodLog();
      app.notifier.toast(result.value.name + " added to your daily log", "success");
    });
  }

  setupProductsPage() {
    const app = this;
    const container = document.getElementById("product-categories");
    const categories = app.productApi.getCategories();

    container.innerHTML = categories
      .map((category) => app.productView.categoryButton(category))
      .join("");

    container.querySelectorAll(".product-category-btn").forEach(function (button) {
      button.addEventListener("click", function () {
        app.searchProductsByCategory(button.dataset.category);
      });
    });

    document.getElementById("search-product-btn").addEventListener("click", function () {
      const input = document.getElementById("product-search-input");
      const term = input.value.trim();
      if (term) {
        app.searchProducts(term, app.selectedGrade);
      }
    });

    document.getElementById("product-search-input").addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        const term = event.target.value.trim();
        if (term) {
          app.searchProducts(term, app.selectedGrade);
        }
      }
    });

    document.getElementById("lookup-barcode-btn").addEventListener("click", function () {
      const input = document.getElementById("barcode-input");
      const barcode = input.value.trim();
      if (barcode) {
        app.lookupBarcode(barcode);
      }
    });

    document.getElementById("barcode-input").addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        const barcode = event.target.value.trim();
        if (barcode) {
          app.lookupBarcode(barcode);
        }
      }
    });

    const filters = document.querySelectorAll(".nutri-score-filter");
    filters.forEach(function (button) {
      button.addEventListener("click", function () {
        document.querySelectorAll(".nutri-score-filter").forEach(function (item) {
          item.classList.remove("ring-2", "ring-gray-900");
        });
        button.classList.add("ring-2", "ring-gray-900");
        app.selectedGrade = button.dataset.grade;

        const input = document.getElementById("product-search-input");
        const term = input.value.trim();
        if (term) {
          app.searchProducts(term, app.selectedGrade);
        }
      });
    });

    if (filters.length > 0) {
      const allButton = filters[0];
      allButton.classList.remove("bg-emerald-600", "text-white");
      allButton.classList.add("bg-gray-100", "text-gray-700", "hover:bg-gray-200", "ring-2", "ring-gray-900");
    }

    this.showProductsEmpty();
  }

  showProductsEmpty() {
    const grid = document.getElementById("products-grid");
    grid.innerHTML = `
      <div class="col-span-full py-12">
        <div class="text-center">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-box-open text-gray-400 text-3xl"></i>
          </div>
          <p class="text-gray-500 text-lg mb-2">No products to display</p>
          <p class="text-gray-400 text-sm">Search for a product or browse by category</p>
        </div>
      </div>
    `;
  }

  showProductGrid(products) {
    const grid = document.getElementById("products-grid");
    grid.innerHTML = products
      .map((product) => this.productView.card(product))
      .join("");

    grid.querySelectorAll(".product-card").forEach((card) => {
      card.addEventListener("click", () =>
        this.showProductDetail(card.dataset.barcode)
      );
    });
  }

  async searchProducts(term, grade) {
    const grid = document.getElementById("products-grid");
    const counter = document.getElementById("products-count");

    grid.innerHTML = this.ui.spinner();

    const products = await this.productApi.search(term, grade);
    this.products = products;

    if (products.length > 0) {
      this.showProductGrid(products);
      counter.textContent = 'Found ' + products.length + ' products for "' + term + '"';
    } else {
      this.showProductsEmpty();
      counter.textContent = 'No products found for "' + term + '"';
    }
  }

  async searchProductsByCategory(category) {
    const grid = document.getElementById("products-grid");
    const counter = document.getElementById("products-count");

    grid.innerHTML = this.ui.spinner();

    const products = await this.productApi.getByCategory(category);
    const label = category.replace(/_/g, " ");
    this.products = products;

    if (products.length > 0) {
      this.showProductGrid(products);
      counter.textContent = "Found " + products.length + " products in " + label;
    } else {
      this.showProductsEmpty();
      counter.textContent = "No products found in " + label;
    }
  }

  async lookupBarcode(barcode) {
    const grid = document.getElementById("products-grid");
    const counter = document.getElementById("products-count");

    grid.innerHTML = this.ui.spinner();

    const product = await this.productApi.getByBarcode(barcode);

    if (!product) {
      this.showProductsEmpty();
      counter.textContent = "No product found with barcode: " + barcode;
      this.notifier.toast("Product not found in database", "error");
      return;
    }

    this.products = [product];
    this.showProductGrid([product]);
    counter.textContent = "Found product: " + product.name;
    this.showProductDetail(product.barcode);
  }

  async showProductDetail(barcode) {
    const app = this;
    let product = null;

    for (let index = 0; index < app.products.length; index++) {
      if (app.products[index].barcode === barcode) {
        product = app.products[index];
      }
    }

    if (!product) {
      product = await app.productApi.getByBarcode(barcode);
    }

    if (!product) {
      app.notifier.toast("Product not found", "error");
      return;
    }

    const score = app.productApi.getNutriScoreInfo(product.nutritionGrade);
    const nova = app.productApi.getNovaGroupInfo(product.novaGroup);

    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
    overlay.id = "product-detail-modal";
    overlay.innerHTML = `
      <div class="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto scale-up">
        ${app.productView.detail(product, score, nova)}
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll(".close-product-modal").forEach(function (button) {
      button.addEventListener("click", function () {
        overlay.remove();
      });
    });

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        overlay.remove();
      }
    });

    overlay.querySelector(".add-product-to-log").addEventListener("click", function () {
      app.logProduct(product);
      overlay.remove();
    });
  }

  logProduct(product) {
    this.state.addItem({
      type: "product",
      name: product.name,
      brand: product.brand,
      barcode: product.barcode,
      serving: "100g",
      nutrition: product.nutrition,
      loggedAt: new Date().toISOString(),
    });

    this.notifier.success(
      "Product Logged!",
      product.name + " (100g) has been added to your daily log."
    );
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const app = new NutriPlanApp();
  app.start();
});

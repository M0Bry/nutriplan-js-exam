export function escapeHtml(value) {
  let text = String(value === null || value === undefined ? "" : value);
  text = text.replace(/&/g, "&amp;");
  text = text.replace(/</g, "&lt;");
  text = text.replace(/>/g, "&gt;");
  text = text.replace(/"/g, "&quot;");
  return text;
}

export class Ui {
  spinner() {
    return `
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    `;
  }

  emptyState(message, hint, icon) {
    return `
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i class="fa-solid ${icon} text-gray-400 text-2xl"></i>
        </div>
        <p class="text-gray-500 text-lg">${message}</p>
        <p class="text-gray-400 text-sm mt-2">${hint}</p>
      </div>
    `;
  }
}

export class MealView {
  card(meal, isFavorite) {
    let instructions = "Delicious recipe to try!";
    if (meal.strInstructions) {
      instructions = meal.strInstructions.substring(0, 100) + "...";
    }

    return `
      <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-meal-id="${meal.idMeal}">
        <div class="relative h-48 overflow-hidden">
          <img
            class="recipe-photo w-full h-full object-cover transition-transform duration-500"
            src="${meal.strMealThumb}"
            alt="${escapeHtml(meal.strMeal)}"
            loading="lazy"
          />
          <button
            class="save-recipe-btn absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 transition-all shadow-sm"
            data-meal-id="${meal.idMeal}"
            aria-label="Save recipe"
          >
            <i class="${isFavorite ? "fa-solid fa-heart text-red-500" : "fa-regular fa-heart"}"></i>
          </button>
          <div class="absolute bottom-3 left-3 flex gap-2">
            <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-lg">
              <i class="fa-solid fa-tag text-emerald-600 mr-1"></i>${escapeHtml(meal.strCategory || "Various")}
            </span>
            <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-lg">
              <i class="fa-solid fa-globe text-blue-600 mr-1"></i>${escapeHtml(meal.strArea || "International")}
            </span>
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
            ${escapeHtml(meal.strMeal)}
          </h3>
          <p class="text-xs text-gray-600 mb-3 line-clamp-2">${instructions}</p>
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-gray-900">
              <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
              ${escapeHtml(meal.strCategory || "Various")}
            </span>
            <span class="font-semibold text-gray-500">
              <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
              ${escapeHtml(meal.strArea || "International")}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  categoryCard(category) {
    const styles = {
      Beef: { bg: "from-red-50 to-rose-50", border: "border-red-200 hover:border-red-400", icon: "from-red-400 to-rose-500", fa: "fa-drumstick-bite" },
      Chicken: { bg: "from-amber-50 to-orange-50", border: "border-amber-200 hover:border-amber-400", icon: "from-amber-400 to-orange-500", fa: "fa-drumstick-bite" },
      Dessert: { bg: "from-pink-50 to-rose-50", border: "border-pink-200 hover:border-pink-400", icon: "from-pink-400 to-rose-500", fa: "fa-cake-candles" },
      Lamb: { bg: "from-orange-50 to-amber-50", border: "border-orange-200 hover:border-orange-400", icon: "from-orange-400 to-amber-500", fa: "fa-drumstick-bite" },
      Miscellaneous: { bg: "from-slate-50 to-gray-50", border: "border-slate-200 hover:border-slate-400", icon: "from-slate-400 to-gray-500", fa: "fa-bowl-rice" },
      Pasta: { bg: "from-yellow-50 to-amber-50", border: "border-yellow-200 hover:border-yellow-400", icon: "from-yellow-400 to-amber-500", fa: "fa-bowl-food" },
      Pork: { bg: "from-rose-50 to-red-50", border: "border-rose-200 hover:border-rose-400", icon: "from-rose-400 to-red-500", fa: "fa-bacon" },
      Seafood: { bg: "from-cyan-50 to-blue-50", border: "border-cyan-200 hover:border-cyan-400", icon: "from-cyan-400 to-blue-500", fa: "fa-fish" },
      Side: { bg: "from-green-50 to-emerald-50", border: "border-green-200 hover:border-green-400", icon: "from-green-400 to-emerald-500", fa: "fa-plate-wheat" },
      Starter: { bg: "from-teal-50 to-cyan-50", border: "border-teal-200 hover:border-teal-400", icon: "from-teal-400 to-cyan-500", fa: "fa-utensils" },
      Vegan: { bg: "from-emerald-50 to-green-50", border: "border-emerald-200 hover:border-emerald-400", icon: "from-emerald-400 to-green-500", fa: "fa-leaf" },
      Vegetarian: { bg: "from-lime-50 to-green-50", border: "border-lime-200 hover:border-lime-400", icon: "from-lime-400 to-green-500", fa: "fa-seedling" },
    };

    let style = styles[category.strCategory];
    if (!style) {
      style = styles.Miscellaneous;
    }

    return `
      <div class="category-card bg-linear-to-br ${style.bg} rounded-xl p-3 border ${style.border} hover:shadow-md cursor-pointer transition-all group" data-category="${category.strCategory}">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 bg-linear-to-br ${style.icon} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
            <i class="fa-solid ${style.fa} text-white text-sm"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900">${category.strCategory}</h3>
          </div>
        </div>
      </div>
    `;
  }

  areaButtons(areas, selected) {
    let html = "";
    let allClass = "bg-gray-100 text-gray-700 hover:bg-gray-200";
    if (!selected) {
      allClass = "bg-emerald-600 text-white";
    }

    html += `
      <button class="area-filter-btn px-4 py-2 ${allClass} rounded-full font-medium text-sm whitespace-nowrap transition-all" data-area="">
        All Cuisines
      </button>
    `;

    for (let index = 0; index < areas.length; index++) {
      const area = areas[index].strArea;
      let buttonClass = "bg-gray-100 text-gray-700 hover:bg-gray-200";
      if (selected === area) {
        buttonClass = "bg-emerald-600 text-white";
      }
      html += `
        <button class="area-filter-btn px-4 py-2 ${buttonClass} rounded-full font-medium text-sm whitespace-nowrap transition-all" data-area="${area}">
          ${area}
        </button>
      `;
    }

    return html;
  }

  detailPage(meal, ingredients, steps, youtubeId, source) {
    let ingredientItems = "";
    for (let index = 0; index < ingredients.length; index++) {
      ingredientItems += `
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
          <input type="checkbox" class="w-5 h-5 accent-emerald-600 rounded border-gray-300" />
          <span class="text-gray-700">
            <span class="font-medium text-gray-900">${escapeHtml(ingredients[index].measure)}</span> ${escapeHtml(ingredients[index].ingredient)}
          </span>
        </div>
      `;
    }

    let stepItems = "";
    for (let index = 0; index < steps.length; index++) {
      stepItems += `
        <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
          <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
            ${index + 1}
          </div>
          <p class="text-gray-700 leading-relaxed pt-2">${escapeHtml(steps[index])}</p>
        </div>
      `;
    }

    let videoBlock = "";
    if (youtubeId) {
      videoBlock = `
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i class="fa-solid fa-video text-red-500"></i>
            Video Tutorial
          </h2>
          <div class="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
            <iframe
              src="https://www.youtube.com/embed/${youtubeId}"
              class="absolute inset-0 w-full h-full"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      `;
    }

    let sourceBlock = "";
    if (source) {
      sourceBlock = `
        <div class="bg-white rounded-2xl shadow-lg p-6">
          <h3 class="text-sm font-semibold text-gray-900 mb-2">Recipe Source</h3>
          <a href="${source}" target="_blank" class="text-emerald-600 hover:text-emerald-700 text-sm flex items-center gap-2">
            <i class="fa-solid fa-external-link"></i>
            View Original Recipe
          </a>
        </div>
      `;
    }

    let tags = `<span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">${escapeHtml(meal.strCategory)}</span>`;
    tags += `<span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">${escapeHtml(meal.strArea)}</span>`;

    return `
      <div class="page-padding px-8 py-6 bg-gray-50 min-h-screen">
        <div class="max-w-6xl mx-auto">
          <button id="back-to-meals-btn" class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors">
            <i class="fa-solid fa-arrow-left"></i>
            <span>Back to Recipes</span>
          </button>

          <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div class="relative h-80 md:h-96">
              <img src="${meal.strMealThumb}" alt="${escapeHtml(meal.strMeal)}" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent"></div>
              <div class="absolute bottom-0 left-0 right-0 p-8">
                <div class="flex items-center gap-3 mb-3">${tags}</div>
                <h1 class="text-3xl font-bold text-white mb-2">${escapeHtml(meal.strMeal)}</h1>
                <div class="flex items-center gap-6 text-white/90">
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-clock"></i>
                    <span>30 min</span>
                  </span>
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-utensils"></i>
                    <span id="hero-servings">4 servings</span>
                  </span>
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-fire"></i>
                    <span id="hero-calories">Calculating...</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-3 mb-8">
            <button id="log-meal-btn" class="flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed transition-all" data-meal-id="${meal.idMeal}" disabled>
              <i class="fa-solid fa-spinner fa-spin"></i>
              <span>Calculating...</span>
            </button>
          </div>

          <div class="grid grid-cols-3 gap-8">
            <div class="col-span-2 space-y-8">
              <div class="bg-white rounded-2xl shadow-lg p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i class="fa-solid fa-list-check text-emerald-600"></i>
                  Ingredients
                  <span class="text-sm font-normal text-gray-500 ml-auto">${ingredients.length} items</span>
                </h2>
                <div class="grid grid-cols-2 gap-3">${ingredientItems}</div>
              </div>

              <div class="bg-white rounded-2xl shadow-lg p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i class="fa-solid fa-shoe-prints text-emerald-600"></i>
                  Instructions
                </h2>
                <div class="space-y-4">${stepItems}</div>
              </div>

              ${videoBlock}
            </div>

            <div class="space-y-6">
              <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i class="fa-solid fa-chart-pie text-emerald-600"></i>
                  Nutrition Facts
                </h2>
                <div id="nutrition-facts-container">${this.nutritionLoading()}</div>
              </div>
              ${sourceBlock}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  nutritionLoading() {
    return `
      <div class="text-center py-8">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-4">
          <i class="fa-solid fa-calculator text-emerald-600 text-xl animate-pulse"></i>
        </div>
        <p class="text-gray-700 font-medium mb-1">Calculating Nutrition</p>
        <p class="text-sm text-gray-500">Analyzing ingredients...</p>
      </div>
    `;
  }

  nutritionFacts(display) {
    const macros = [
      { name: "Protein", data: display.macros.protein, color: "emerald" },
      { name: "Carbs", data: display.macros.carbs, color: "blue" },
      { name: "Fat", data: display.macros.fat, color: "purple" },
      { name: "Fiber", data: display.macros.fiber, color: "orange" },
      { name: "Sugar", data: display.macros.sugar, color: "pink" },
      { name: "Saturated Fat", data: display.macros.saturatedFat, color: "red" },
    ];

    let rows = "";
    for (let index = 0; index < macros.length; index++) {
      const macro = macros[index];
      const width = Math.min(Math.abs(macro.data.dailyValue), 100);
      rows += `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-${macro.color}-500"></div>
            <span class="text-gray-700">${macro.name}</span>
          </div>
          <span class="font-bold text-gray-900">${macro.data.amount}g</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div class="bg-${macro.color}-500 h-2 rounded-full progress-animate" style="width: ${width}%"></div>
        </div>
      `;
    }

    return `
      <p class="text-sm text-gray-500 mb-4">Per serving</p>

      <div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl">
        <p class="text-sm text-gray-600">Calories per serving</p>
        <p class="text-4xl font-bold text-emerald-600">${display.caloriesPerServing}</p>
        <p class="text-xs text-gray-500 mt-1">Total: ${display.totalCalories} cal</p>
      </div>

      <div class="space-y-4">${rows}</div>

      <div class="mt-6 pt-6 border-t border-gray-100">
        <h3 class="text-sm font-semibold text-gray-900 mb-3">Other</h3>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Cholesterol</span>
            <span class="font-medium">${display.other.cholesterol}mg</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Sodium</span>
            <span class="font-medium">${display.other.sodium}mg</span>
          </div>
        </div>
      </div>
    `;
  }
}


export class ProductView {
  card(product) {
    const scoreColors = {
      a: "bg-green-500",
      b: "bg-lime-500",
      c: "bg-yellow-500",
      d: "bg-orange-500",
      e: "bg-red-500",
    };
    const novaColors = {
      1: "bg-green-500",
      2: "bg-lime-500",
      3: "bg-orange-500",
      4: "bg-red-500",
    };

    let grade = "";
    if (product.nutritionGrade) {
      grade = product.nutritionGrade.toLowerCase();
    }

    let scoreBadge = "";
    if (product.nutritionGrade) {
      scoreBadge = `
        <div class="absolute top-2 left-2 ${scoreColors[grade]} text-white text-xs font-bold px-2 py-1 rounded uppercase">
          Nutri-Score ${product.nutritionGrade.toUpperCase()}
        </div>
      `;
    }

    let novaBadge = "";
    if (product.novaGroup) {
      novaBadge = `
        <div class="absolute top-2 right-2 ${novaColors[product.novaGroup]} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
          ${product.novaGroup}
        </div>
      `;
    }

    let image = `
      <div class="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
        <i class="fa-solid fa-box text-gray-400 text-2xl"></i>
      </div>
    `;
    if (product.image) {
      image = `
        <img
          class="w-full h-full object-contain transition-transform duration-300"
          src="${product.image}"
          alt="${escapeHtml(product.name)}"
          loading="lazy"
        />
      `;
    }

    return `
      <div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-barcode="${product.barcode}">
        <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
          ${image}
          ${scoreBadge}
          ${novaBadge}
        </div>

        <div class="p-4">
          <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${escapeHtml(product.brand || "Unknown Brand")}</p>
          <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            ${escapeHtml(product.name)}
          </h3>

          <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span><i class="fa-solid fa-weight-scale mr-1"></i>${escapeHtml(product.quantity)}</span>
            <span><i class="fa-solid fa-fire mr-1"></i>${Math.round(product.nutrition.calories)} kcal/100g</span>
          </div>

          <div class="grid grid-cols-4 gap-1 text-center">
            <div class="bg-emerald-50 rounded p-1.5">
              <p class="text-xs font-bold text-emerald-700">${product.nutrition.protein.toFixed(1)}g</p>
              <p class="text-[10px] text-gray-500">Protein</p>
            </div>
            <div class="bg-blue-50 rounded p-1.5">
              <p class="text-xs font-bold text-blue-700">${product.nutrition.carbs.toFixed(1)}g</p>
              <p class="text-[10px] text-gray-500">Carbs</p>
            </div>
            <div class="bg-purple-50 rounded p-1.5">
              <p class="text-xs font-bold text-purple-700">${product.nutrition.fat.toFixed(1)}g</p>
              <p class="text-[10px] text-gray-500">Fat</p>
            </div>
            <div class="bg-orange-50 rounded p-1.5">
              <p class="text-xs font-bold text-orange-700">${product.nutrition.sugar.toFixed(1)}g</p>
              <p class="text-[10px] text-gray-500">Sugar</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  categoryButton(category) {
    const gradients = {
      breakfast_cereals: "from-amber-500 to-orange-500",
      beverages: "from-blue-500 to-cyan-500",
      snacks: "from-purple-500 to-pink-500",
      dairy: "from-sky-400 to-blue-500",
      fruits: "from-red-500 to-rose-500",
      vegetables: "from-green-500 to-emerald-500",
      breads: "from-amber-600 to-yellow-500",
      meats: "from-red-600 to-rose-600",
      frozen_foods: "from-cyan-500 to-blue-600",
      sauces: "from-orange-500 to-red-500",
    };

    let gradient = gradients[category.id];
    if (!gradient) {
      gradient = "from-gray-500 to-gray-600";
    }

    return `
      <button class="product-category-btn flex-shrink-0 px-5 py-3 bg-linear-to-r ${gradient} text-white rounded-xl font-semibold hover:shadow-lg transition-all" data-category="${category.id}">
        <i class="fa-solid ${category.icon} mr-2"></i>${escapeHtml(category.name)}
      </button>
    `;
  }

  detail(product, score, nova) {
    let headerImage = `<i class="fa-solid fa-box text-gray-400 text-4xl"></i>`;
    if (product.image) {
      headerImage = `<img src="${product.image}" alt="${escapeHtml(product.name)}" class="w-full h-full object-contain" />`;
    }

    let badgeScore = "";
    if (product.nutritionGrade) {
      badgeScore = `
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: ${score.color}20">
          <span class="w-8 h-8 rounded flex items-center justify-center text-white font-bold" style="background-color: ${score.color}">
            ${product.nutritionGrade.toUpperCase()}
          </span>
          <div>
            <p class="text-xs font-bold" style="color: ${score.color}">Nutri-Score</p>
            <p class="text-[10px] text-gray-600">${score.label}</p>
          </div>
        </div>
      `;
    }

    let badgeNova = "";
    if (product.novaGroup) {
      badgeNova = `
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background-color: ${nova.color}20">
          <span class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style="background-color: ${nova.color}">
            ${product.novaGroup}
          </span>
          <div>
            <p class="text-xs font-bold" style="color: ${nova.color}">NOVA</p>
            <p class="text-[10px] text-gray-600">${nova.label}</p>
          </div>
        </div>
      `;
    }

    let ingredientsBlock = "";
    if (product.ingredients) {
      ingredientsBlock = `
        <div class="bg-gray-50 rounded-xl p-5 mb-6">
          <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <i class="fa-solid fa-list text-gray-600"></i>
            Ingredients
          </h3>
          <p class="text-sm text-gray-600 leading-relaxed">${escapeHtml(product.ingredients)}</p>
        </div>
      `;
    }

    let allergensBlock = "";
    if (product.allergens) {
      allergensBlock = `
        <div class="bg-red-50 rounded-xl p-5 mb-6 border border-red-200">
          <h3 class="font-bold text-red-700 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-triangle-exclamation"></i>
            Allergens
          </h3>
          <p class="text-sm text-red-600">${escapeHtml(product.allergens)}</p>
        </div>
      `;
    }

    return `
      <div class="p-6">
        <div class="flex items-start gap-6 mb-6">
          <div class="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
            ${headerImage}
          </div>
          <div class="flex-1">
            <p class="text-sm text-emerald-600 font-semibold mb-1">${escapeHtml(product.brand || "Unknown Brand")}</p>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">${escapeHtml(product.name)}</h2>
            <p class="text-sm text-gray-500 mb-3">${escapeHtml(product.quantity)}</p>
            <div class="flex items-center gap-3">
              ${badgeScore}
              ${badgeNova}
            </div>
          </div>
          <button class="close-product-modal text-gray-400 hover:text-gray-600">
            <i class="fa-solid fa-times text-2xl"></i>
          </button>
        </div>

        <div class="bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl p-5 mb-6 border border-emerald-200">
          <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i class="fa-solid fa-chart-pie text-emerald-600"></i>
            Nutrition Facts <span class="text-sm font-normal text-gray-500">(per 100g)</span>
          </h3>

          <div class="text-center mb-4 pb-4 border-b border-emerald-200">
            <p class="text-4xl font-bold text-gray-900">${Math.round(product.nutrition.calories)}</p>
            <p class="text-sm text-gray-500">Calories</p>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <div class="text-center">
              <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div class="bg-emerald-500 h-2 rounded-full" style="width: ${Math.min((product.nutrition.protein / 50) * 100, 100)}%"></div>
              </div>
              <p class="text-lg font-bold text-emerald-600">${product.nutrition.protein.toFixed(1)}g</p>
              <p class="text-xs text-gray-500">Protein</p>
            </div>
            <div class="text-center">
              <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div class="bg-blue-500 h-2 rounded-full" style="width: ${Math.min((product.nutrition.carbs / 100) * 100, 100)}%"></div>
              </div>
              <p class="text-lg font-bold text-blue-600">${product.nutrition.carbs.toFixed(1)}g</p>
              <p class="text-xs text-gray-500">Carbs</p>
            </div>
            <div class="text-center">
              <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div class="bg-purple-500 h-2 rounded-full" style="width: ${Math.min((product.nutrition.fat / 65) * 100, 100)}%"></div>
              </div>
              <p class="text-lg font-bold text-purple-600">${product.nutrition.fat.toFixed(1)}g</p>
              <p class="text-xs text-gray-500">Fat</p>
            </div>
            <div class="text-center">
              <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div class="bg-orange-500 h-2 rounded-full" style="width: ${Math.min((product.nutrition.sugar / 50) * 100, 100)}%"></div>
              </div>
              <p class="text-lg font-bold text-orange-600">${product.nutrition.sugar.toFixed(1)}g</p>
              <p class="text-xs text-gray-500">Sugar</p>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-emerald-200">
            <div class="text-center">
              <p class="text-sm font-semibold text-gray-900">${product.nutrition.saturatedFat.toFixed(1)}g</p>
              <p class="text-xs text-gray-500">Saturated Fat</p>
            </div>
            <div class="text-center">
              <p class="text-sm font-semibold text-gray-900">${product.nutrition.fiber.toFixed(1)}g</p>
              <p class="text-xs text-gray-500">Fiber</p>
            </div>
            <div class="text-center">
              <p class="text-sm font-semibold text-gray-900">${product.nutrition.salt.toFixed(2)}g</p>
              <p class="text-xs text-gray-500">Salt</p>
            </div>
          </div>
        </div>

        ${ingredientsBlock}
        ${allergensBlock}

        <div class="flex gap-3">
          <button class="add-product-to-log flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all" data-barcode="${product.barcode}">
            <i class="fa-solid fa-plus mr-2"></i>Log This Food
          </button>
          <button class="close-product-modal flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">
            Close
          </button>
        </div>
      </div>
    `;
  }
}


export class LogView {
  itemsList(items) {
    if (items.length === 0) {
      return `
        <div class="text-center py-12">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-utensils text-gray-300 text-3xl"></i>
          </div>
          <p class="text-gray-500 font-medium mb-2">No food logged today</p>
          <p class="text-gray-400 text-sm mb-4">Start tracking your nutrition by logging meals or scanning products</p>
          <div class="flex justify-center gap-3">
            <a href="#/home" class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all">
              <i class="fa-solid fa-plus"></i>
              Browse Recipes
            </a>
            <a href="#/products" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
              <i class="fa-solid fa-barcode"></i>
              Scan Product
            </a>
          </div>
        </div>
      `;
    }

    let rows = "";
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      let thumbnail = `
        <div class="w-14 h-14 ${item.type === "product" ? "bg-blue-100" : "bg-emerald-100"} rounded-xl flex items-center justify-center">
          <i class="fa-solid fa-${item.type === "product" ? "box" : "utensils"} ${item.type === "product" ? "text-blue-600" : "text-emerald-600"} text-xl"></i>
        </div>
      `;

      if (item.type === "meal" && item.thumbnail) {
        thumbnail = `<img src="${item.thumbnail}" alt="${escapeHtml(item.name)}" class="w-14 h-14 rounded-xl object-cover" />`;
      }

      let subtitle = item.brand || "Product";
      if (item.type === "meal") {
        subtitle = item.servings + (item.servings === 1 ? " serving" : " servings");
      }

      const time = new Date(item.loggedAt).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });

      rows += `
        <div class="flex items-center justify-between bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all">
          <div class="flex items-center gap-4">
            ${thumbnail}
            <div>
              <p class="font-semibold text-gray-900">${escapeHtml(item.name)}</p>
              <p class="text-sm text-gray-500">
                ${subtitle}
                <span class="mx-1">•</span>
                <span class="${item.type === "product" ? "text-blue-600" : "text-emerald-600"}">${item.type === "product" ? "Product" : "Recipe"}</span>
              </p>
              <p class="text-xs text-gray-400 mt-1">${time}</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <p class="text-lg font-bold text-emerald-600">${Math.round(item.nutrition.calories)}</p>
              <p class="text-xs text-gray-500">kcal</p>
            </div>
            <div class="hidden md:flex gap-2 text-xs text-gray-500">
              <span class="px-2 py-1 bg-blue-50 rounded">${Math.round(item.nutrition.protein)}g P</span>
              <span class="px-2 py-1 bg-amber-50 rounded">${Math.round(item.nutrition.carbs)}g C</span>
              <span class="px-2 py-1 bg-purple-50 rounded">${Math.round(item.nutrition.fat)}g F</span>
            </div>
            <button class="remove-foodlog-item text-gray-400 hover:text-red-500 transition-all p-2" data-index="${index}">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    }

    return `<div class="space-y-3 max-h-96 overflow-y-auto">${rows}</div>`;
  }

}

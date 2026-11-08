function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export class AppState {
  constructor() {
    this.logKey = "nutriplan_daily_log";
    this.favoritesKey = "nutriplan_favorites";
    this.goals = {
      calorieGoal: 2000,
      proteinGoal: 50,
      carbsGoal: 250,
      fatGoal: 65,
    };
  }

  // Daily entries and favorites live in this browser's local storage.
  readJson(key, fallback) {
    const stored = localStorage.getItem(key);
    if (!stored) {
      return fallback;
    }

    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error("Saved data is not valid:", error);
      return fallback;
    }
  }

  writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getGoals() {
    return this.goals;
  }

  getFavorites() {
    const favorites = this.readJson(this.favoritesKey, []);
    return favorites.length ? favorites : [];
  }

  isFavorite(mealId) {
    const favorites = this.getFavorites();

    for (let index = 0; index < favorites.length; index += 1) {
      const favorite = favorites[index];
      if (String(favorite.idMeal) === String(mealId)) {
        return true;
      }
    }

    return false;
  }

  toggleFavorite(meal) {
    const favorites = this.getFavorites();
    let matchingIndex = -1;

    // Keep the last matching entry if old storage contains duplicates.
    for (let index = 0; index < favorites.length; index += 1) {
      if (String(favorites[index].idMeal) === String(meal.idMeal)) {
        matchingIndex = index;
      }
    }

    if (matchingIndex === -1) {
      favorites.push({
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb,
        strCategory: meal.strCategory,
        strArea: meal.strArea,
        strInstructions: meal.strInstructions,
      });
      this.writeJson(this.favoritesKey, favorites);
      return true;
    }

    favorites.splice(matchingIndex, 1);
    this.writeJson(this.favoritesKey, favorites);
    return false;
  }

  getTodayKey() {
    return formatDateKey(new Date());
  }

  getDailyLog() {
    return this.readJson(this.logKey, {});
  }

  createEmptyDay() {
    return {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      meals: [],
    };
  }

  getTodayLog() {
    const dailyLog = this.getDailyLog();
    const todayKey = this.getTodayKey();

    if (!dailyLog[todayKey]) {
      return this.createEmptyDay();
    }

    return dailyLog[todayKey];
  }

  roundNutrient(nutrition, nutrient) {
    return Math.round(nutrition[nutrient] || 0);
  }

  addItem(item) {
    const dailyLog = this.getDailyLog();
    const todayKey = this.getTodayKey();

    if (!dailyLog[todayKey]) {
      dailyLog[todayKey] = this.createEmptyDay();
    }

    const day = dailyLog[todayKey];
    day.totalCalories =
      day.totalCalories + this.roundNutrient(item.nutrition, "calories");
    day.totalProtein =
      day.totalProtein + this.roundNutrient(item.nutrition, "protein");
    day.totalCarbs = day.totalCarbs + this.roundNutrient(item.nutrition, "carbs");
    day.totalFat = day.totalFat + this.roundNutrient(item.nutrition, "fat");
    day.meals.push(item);

    this.writeJson(this.logKey, dailyLog);
  }

  removeItem(index) {
    const dailyLog = this.getDailyLog();
    const todayKey = this.getTodayKey();

    if (!dailyLog[todayKey] || !dailyLog[todayKey].meals[index]) {
      return;
    }

    const day = dailyLog[todayKey];
    const item = day.meals[index];

    day.totalCalories = Math.max(
      0,
      day.totalCalories - this.roundNutrient(item.nutrition, "calories")
    );
    day.totalProtein = Math.max(
      0,
      day.totalProtein - this.roundNutrient(item.nutrition, "protein")
    );
    day.totalCarbs = Math.max(
      0,
      day.totalCarbs - this.roundNutrient(item.nutrition, "carbs")
    );
    day.totalFat = Math.max(
      0,
      day.totalFat - this.roundNutrient(item.nutrition, "fat")
    );
    day.meals.splice(index, 1);

    this.writeJson(this.logKey, dailyLog);
  }

  clearToday() {
    const dailyLog = this.getDailyLog();
    dailyLog[this.getTodayKey()] = this.createEmptyDay();
    this.writeJson(this.logKey, dailyLog);
  }

  getWeekSummary() {
    const dailyLog = this.getDailyLog();
    const days = [];

    for (let daysAgo = 6; daysAgo >= 0; daysAgo -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      const dayData = dailyLog[formatDateKey(date)] || this.createEmptyDay();
      days.push({
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: date.getDate(),
        calories: Math.round(dayData.totalCalories),
        protein: Math.round(dayData.totalProtein),
        itemCount: dayData.meals.length,
        isToday: daysAgo === 0,
      });
    }

    return days;
  }
}

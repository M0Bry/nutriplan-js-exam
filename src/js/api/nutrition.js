const CACHE_SEPARATOR = "|";

function makeCacheKey(recipeName, ingredients) {
  return `${recipeName}${CACHE_SEPARATOR}${ingredients.join(CACHE_SEPARATOR)}`;
}

export class NutritionApi {
  constructor() {
    this.baseUrl = "https://nutriplan-api.vercel.app/api";
    this.apiKey = "xRGnhxcXrKuX8hJpeeQE5Rac9b7dyQDpaMs5fWFL";
    this.cache = new Map();
  }

  async analyze(recipeName, ingredients) {
    const cacheKey = makeCacheKey(recipeName, ingredients);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/nutrition/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify({ recipeName, ingredients }),
      });

      if (!response.ok) {
        throw new Error("Nutrition service answered with " + response.status);
      }

      const result = await response.json();
      if (!result.success || !result.data) {
        throw new Error("Nutrition analysis failed");
      }

      const analysis = result.data;
      const normalizedAnalysis = {
        servings: analysis.servings,
        totals: analysis.totals,
        perServing: analysis.perServing,
        totalWeight: analysis.totalWeight,
        ingredients: analysis.ingredients || [],
      };

      this.cache.set(cacheKey, normalizedAnalysis);
      return normalizedAnalysis;
    } catch (error) {
      console.error("Nutrition analysis is not available:", error);
      return null;
    }
  }

  toDailyValue(amount, target) {
    return Math.round((amount / target) * 100);
  }

  createMacro(amount, target) {
    const safeAmount = Math.max(0, amount || 0);
    return {
      amount: Math.round(safeAmount),
      dailyValue: this.toDailyValue(safeAmount, target),
    };
  }

  prepareForDisplay(analysis) {
    if (!analysis) {
      return null;
    }

    let serving = analysis.perServing;
    if (!serving) {
      const servings = analysis.servings || 4;
      const totals = analysis.totals;
      serving = {
        calories: Math.round(totals.calories / servings),
        protein: Math.round(totals.protein / servings),
        carbs: Math.round(totals.carbs / servings),
        fat: Math.round(totals.fat / servings),
        fiber: Math.round(totals.fiber / servings),
        sugar: Math.round(totals.sugar / servings),
        saturatedFat: Math.round(totals.saturatedFat / servings),
        cholesterol: Math.round(totals.cholesterol / servings),
        sodium: Math.round(totals.sodium / servings),
      };
    }

    return {
      servings: analysis.servings || 4,
      caloriesPerServing: Math.max(0, Math.round(serving.calories || 0)),
      totalCalories: Math.max(0, Math.round(analysis.totals.calories || 0)),
      macros: {
        protein: this.createMacro(serving.protein, 50),
        carbs: this.createMacro(serving.carbs, 300),
        fat: this.createMacro(serving.fat, 65),
        fiber: this.createMacro(serving.fiber, 25),
        sugar: this.createMacro(serving.sugar, 50),
        saturatedFat: this.createMacro(serving.saturatedFat, 20),
      },
      other: {
        cholesterol: Math.max(0, Math.round(serving.cholesterol || 0)),
        sodium: Math.max(0, Math.round(serving.sodium || 0)),
      },
    };
  }
}

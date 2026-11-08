export class MealApi {
  constructor() {
    this.baseUrl = "https://www.themealdb.com/api/json/v1/1";
  }

  async request(path) {
    const response = await fetch(this.baseUrl + path);
    if (!response.ok) {
      throw new Error("Request failed with status " + response.status);
    }
    return await response.json();
  }

  async searchByName(name) {
    try {
      const data = await this.request("/search.php?s=" + encodeURIComponent(name));
      return data.meals || [];
    } catch (error) {
      console.error("Could not search meals by name:", error);
      return [];
    }
  }

  async getById(id) {
    try {
      const data = await this.request("/lookup.php?i=" + id);
      if (data.meals && data.meals.length > 0) {
        return data.meals[0];
      }
      return null;
    } catch (error) {
      console.error("Could not load the meal:", error);
      return null;
    }
  }

  async getCategories() {
    try {
      const data = await this.request("/categories.php");
      return data.categories || [];
    } catch (error) {
      console.error("Could not load the categories:", error);
      return [];
    }
  }

  async getAreas() {
    try {
      const data = await this.request("/list.php?a=list");
      return data.meals || [];
    } catch (error) {
      console.error("Could not load the cuisines:", error);
      return [];
    }
  }

  async filterByCategory(category) {
    try {
      const data = await this.request(
        "/filter.php?c=" + encodeURIComponent(category)
      );
      return data.meals || [];
    } catch (error) {
      console.error("Could not filter by category:", error);
      return [];
    }
  }

  async filterByArea(area) {
    try {
      const data = await this.request("/filter.php?a=" + encodeURIComponent(area));
      return data.meals || [];
    } catch (error) {
      console.error("Could not filter by cuisine:", error);
      return [];
    }
  }

  async loadFullMeals(shortMeals, limit) {
    const max = limit || shortMeals.length;
    const meals = [];
    for (let index = 0; index < shortMeals.length && index < max; index++) {
      const meal = await this.getById(shortMeals[index].idMeal);
      if (meal) {
        meals.push(meal);
      }
    }
    return meals;
  }

  getIngredients(meal) {
    const ingredients = [];
    for (let number = 1; number <= 20; number++) {
      const name = meal["strIngredient" + number];
      const measure = meal["strMeasure" + number];
      if (name && name.trim() !== "") {
        ingredients.push({
          ingredient: name.trim(),
          measure: measure ? measure.trim() : "",
        });
      }
    }
    return ingredients;
  }

  getInstructionSteps(meal) {
    if (!meal.strInstructions) {
      return [];
    }
    const lines = meal.strInstructions.split(/\r\n|\r|\n/);
    const steps = [];
    for (let index = 0; index < lines.length; index++) {
      let line = lines[index].trim();
      if (line === "") {
        continue;
      }
      line = line.replace(/^\d+[\.\)]\s*/, "");
      const isStepTitle = /^step\s*\d+\.?$/i.test(line);
      if (isStepTitle || line.length <= 5) {
        continue;
      }
      steps.push(line);
    }
    return steps;
  }

  getYoutubeId(meal) {
    if (!meal.strYoutube) {
      return "";
    }
    const parts = meal.strYoutube.split("v=");
    if (parts.length > 1) {
      return parts[1];
    }
    return "";
  }

  slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}

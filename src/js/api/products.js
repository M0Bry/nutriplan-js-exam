export class ProductApi {
  constructor() {
    this.baseUrl = "https://world.openfoodfacts.org";
  }

  getCategories() {
    return [
      { id: "breakfast_cereals", name: "Breakfast Cereals", icon: "fa-wheat-awn" },
      { id: "beverages", name: "Beverages", icon: "fa-bottle-water" },
      { id: "snacks", name: "Snacks", icon: "fa-cookie" },
      { id: "dairy", name: "Dairy Products", icon: "fa-cheese" },
      { id: "fruits", name: "Fruits", icon: "fa-apple-whole" },
      { id: "vegetables", name: "Vegetables", icon: "fa-carrot" },
      { id: "breads", name: "Breads", icon: "fa-bread-slice" },
      { id: "meats", name: "Meats", icon: "fa-drumstick-bite" },
      { id: "frozen_foods", name: "Frozen Foods", icon: "fa-snowflake" },
      { id: "sauces", name: "Sauces & Condiments", icon: "fa-jar" },
    ];
  }

  normalizeProduct(product) {
    // Keep API-specific field names out of the rest of the application.
    const nutritionData = product.nutriments || {};
    const grade = product.nutrition_grades || product.nutrition_grade_fr;
    const calories =
      nutritionData["energy-kcal_100g"] || nutritionData.energy_100g;

    return {
      barcode: product.code || product._id,
      name: product.product_name || product.product_name_en || "Unknown Product",
      brand: product.brands || "",
      categories: product.categories || "",
      image: product.image_front_url || product.image_url || null,
      nutritionGrade: grade || null,
      novaGroup: product.nova_group || null,
      ingredients: product.ingredients_text || product.ingredients_text_en || "",
      allergens: product.allergens || "",
      quantity: product.quantity || "",
      servingSize: product.serving_size || "",
      nutrition: {
        calories: calories || 0,
        fat: nutritionData.fat_100g || 0,
        saturatedFat: nutritionData["saturated-fat_100g"] || 0,
        carbs: nutritionData.carbohydrates_100g || 0,
        sugar: nutritionData.sugars_100g || 0,
        fiber: nutritionData.fiber_100g || 0,
        protein: nutritionData.proteins_100g || 0,
        salt: nutritionData.salt_100g || 0,
        sodium: nutritionData.sodium_100g || 0,
      },
    };
  }

  getFallbackProducts(term, grade) {
    const demo = [
      {
        code: "7613034626844",
        product_name: "Cheerios Original",
        brands: "Nestlé",
        quantity: "375 g",
        categories: "Breakfast cereals",
        image_front_url: "https://images.openfoodfacts.org/images/products/761/303/462/6844/front_en.jpg",
        nutrition_grades: "a",
        nova_group: 4,
        nutriments: {
          "energy-kcal_100g": 372,
          fat_100g: 4.2,
          "saturated-fat_100g": 0.8,
          carbohydrates_100g: 74,
          sugars_100g: 4.8,
          fiber_100g: 8.6,
          proteins_100g: 8.4,
          salt_100g: 1.1,
        },
      },
      {
        code: "3017620422003",
        product_name: "Nutella",
        brands: "Ferrero",
        quantity: "400 g",
        categories: "Spreads, Chocolate spreads",
        image_front_url: "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.jpg",
        nutrition_grades: "e",
        nova_group: 4,
        nutriments: {
          "energy-kcal_100g": 539,
          fat_100g: 30.9,
          "saturated-fat_100g": 10.6,
          carbohydrates_100g: 57.5,
          sugars_100g: 56.3,
          fiber_100g: 0,
          proteins_100g: 6.3,
          salt_100g: 0.107,
        },
      },
      {
        code: "5449000000996",
        product_name: "Coca-Cola Original",
        brands: "Coca-Cola",
        quantity: "330 ml",
        categories: "Beverages, Sodas",
        image_front_url: "https://images.openfoodfacts.org/images/products/544/900/000/0996/front_en.jpg",
        nutrition_grades: "e",
        nova_group: 4,
        nutriments: {
          "energy-kcal_100g": 42,
          fat_100g: 0,
          carbohydrates_100g: 10.6,
          sugars_100g: 10.6,
          proteins_100g: 0,
          salt_100g: 0,
        },
      },
      {
        code: "8410076472458",
        product_name: "Greek Yogurt",
        brands: "Danone",
        quantity: "150 g",
        categories: "Dairy, Yogurts",
        image_front_url: "https://images.openfoodfacts.org/images/products/841/007/647/2458/front_en.jpg",
        nutrition_grades: "a",
        nova_group: 1,
        nutriments: {
          "energy-kcal_100g": 97,
          fat_100g: 5,
          "saturated-fat_100g": 3.3,
          carbohydrates_100g: 3.6,
          sugars_100g: 3.6,
          proteins_100g: 9,
          salt_100g: 0.1,
        },
      },
      {
        code: "5000159484695",
        product_name: "Nutella",
        brands: "Ferrero",
        quantity: "750 g",
        categories: "Spreads, Chocolate spreads",
        image_front_url: "https://images.openfoodfacts.org/images/products/500/015/948/4695/front_en.jpg",
        nutrition_grades: "e",
        nova_group: 4,
        nutriments: {
          "energy-kcal_100g": 539,
          fat_100g: 30.9,
          "saturated-fat_100g": 10.6,
          carbohydrates_100g: 57.5,
          sugars_100g: 56.3,
          fiber_100g: 0,
          proteins_100g: 6.3,
          salt_100g: 0.107,
        },
      },
    ];

    const termText = term.toLowerCase();
    return demo
      .filter((product) => {
        const matchesTerm =
          product.product_name.toLowerCase().indexOf(termText) !== -1 ||
          product.brands.toLowerCase().indexOf(termText) !== -1;
        const matchesGrade =
          !grade || product.nutrition_grades === grade.toLowerCase();

        return matchesTerm && matchesGrade;
      })
      .map((product) => this.normalizeProduct(product));
  }

  async search(term, grade) {
    let searchUrl = this.baseUrl + "/cgi/search.pl?page=1&page_size=24&json=1";
    searchUrl += "&search_terms=" + encodeURIComponent(term);
    if (grade) {
      searchUrl += "&nutrition_grades_tags=" + grade;
    }

    try {
      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error("Request failed with status " + response.status);
      }

      const data = await response.json();
      const products = data.products || [];
      return products.map((product) => this.normalizeProduct(product));
    } catch (error) {
      console.warn("Product search is not available right now:", error.message);
      return this.getFallbackProducts(term, grade);
    }
  }

  async getByBarcode(barcode) {
    try {
      const response = await fetch(this.baseUrl + "/api/v0/product/" + barcode + ".json");
      if (!response.ok) {
        throw new Error("Request failed with status " + response.status);
      }
      const data = await response.json();
      if (data.status === 0) {
        return null;
      }
      return this.normalizeProduct(data.product);
    } catch (error) {
      console.warn("Barcode lookup is not available right now:", error.message);
      return null;
    }
  }

  async getByCategory(category) {
    try {
      const response = await fetch(
        this.baseUrl + "/category/" + encodeURIComponent(category) + ".json?page=1&page_size=24"
      );
      if (!response.ok) {
        throw new Error("Request failed with status " + response.status);
      }

      const data = await response.json();
      const products = data.products || [];
      return products.map((product) => this.normalizeProduct(product));
    } catch (error) {
      console.warn("Product category is not available right now:", error.message);
      return this.getFallbackProducts("", "");
    }
  }

  getNutriScoreInfo(grade) {
    const scores = {
      a: { label: "Excellent", color: "#038141" },
      b: { label: "Good", color: "#85bb2f" },
      c: { label: "Average", color: "#fecb02" },
      d: { label: "Poor", color: "#ee8100" },
      e: { label: "Bad", color: "#e63e11" },
    };
    if (!grade) {
      return { label: "Unknown", color: "#999999" };
    }
    return scores[grade.toLowerCase()] || { label: "Unknown", color: "#999999" };
  }

  getNovaGroupInfo(group) {
    const groups = {
      1: { label: "Unprocessed", color: "#038141" },
      2: { label: "Processed Ingredients", color: "#85bb2f" },
      3: { label: "Processed", color: "#ee8100" },
      4: { label: "Ultra-processed", color: "#e63e11" },
    };
    return groups[group] || { label: "Unknown", color: "#999999" };
  }
}

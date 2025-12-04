import Recipe from "../models/recipe.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ Ensure public/images folder exists
const imagesDir = "public/images";
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

// ✅ Configure image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imagesDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

export const upload = multer({ storage });

// ✅ Get all recipes
export const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get single recipe
export const getRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Add new recipe
export const addRecipe = async (req, res) => {
  try {
    const newRecipe = new Recipe({
      title: req.body.title,
      ingredients: req.body.ingredients,
      instructions: req.body.instructions,
      coverImage: req.file ? req.file.filename : null,
      createdBy: req.user.id,
    });

    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    console.error("Error adding recipe:", err);
    res.status(400).json({ message: err.message });
  }
};

// ✅ Edit recipe (optional: replace image if uploaded)
export const editRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (recipe.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to edit this recipe" });
    }

    // Update fields
    recipe.title = req.body.title || recipe.title;
    recipe.ingredients = req.body.ingredients || recipe.ingredients;
    recipe.instructions = req.body.instructions || recipe.instructions;

    // Replace image if new file uploaded
    if (req.file) {
      // Delete old image if exists
      if (recipe.coverImage) {
        const oldPath = path.join(imagesDir, recipe.coverImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      recipe.coverImage = req.file.filename;
    }

    await recipe.save();
    res.json(recipe);
  } catch (err) {
    console.error("Error editing recipe:", err);
    res.status(400).json({ message: err.message });
  }
};

// ✅ Delete recipe
export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (recipe.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this recipe" });
    }

    // Delete image from filesystem if exists
    if (recipe.coverImage) {
      const imagePath = path.join(imagesDir, recipe.coverImage);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: "Recipe deleted" });
  } catch (err) {
    console.error("Error deleting recipe:", err);
    res.status(500).json({ message: err.message });
  }
};

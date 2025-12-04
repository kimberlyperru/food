import React from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from './pages/Home';
import MainNavigation from './components/MainNavigation';
import axios from 'axios';
import AddFoodRecipe from './pages/AddFoodRecipe';
import EditRecipe from './pages/EditRecipe';
import RecipeDetails from './pages/RecipeDetails';

// Fetch all recipes
const getAllRecipes = async () => {
  try {
    const { data } = await axios.get('http://localhost:5000/api/recipe');
    return data || [];
  } catch (e) {
    console.error("Error fetching all recipes:", e);
    return [];
  }
};

// Fetch recipes created by logged-in user
const getMyRecipes = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return [];
  
  const allRecipes = await getAllRecipes();
  return allRecipes.filter(item => item.createdBy === user._id);
};

// Fetch favourite recipes from localStorage
const getFavRecipes = async () => {
  return JSON.parse(localStorage.getItem("fav")) || [];
};

// Fetch a single recipe + its creator's email
const getRecipe = async ({ params }) => {
  try {
    const { data: recipe } = await axios.get(
      `http://localhost:5000/api/recipe/${params.id}`
    );
    if (!recipe) return null;

    if (recipe.createdBy) {
      const { data: user } = await axios.get(
        `http://localhost:5000/api/user/${recipe.createdBy}`
      );
      return { ...recipe, email: user.email };
    }

    return recipe;
  } catch (error) {
    console.error("Error fetching recipe/user:", error);
    return null;
  }
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainNavigation />,
    children: [
      { path: "/", element: <Home />, loader: getAllRecipes },
      { path: "/myRecipe", element: <Home />, loader: getMyRecipes },
      { path: "/favRecipe", element: <Home />, loader: getFavRecipes },
      { path: "/addRecipe", element: <AddFoodRecipe /> },
      { path: "/editRecipe/:id", element: <EditRecipe /> },
      { path: "/recipe/:id", element: <RecipeDetails />, loader: getRecipe },
    ]
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}

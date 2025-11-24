import React from 'react'
import './App.css'
import {createBrowserRouter,RouterProvider} from "react-router-dom"
import Home from './pages/Home'
import MainNavigation from './components/MainNavigation'
import axios from 'axios'
import  AddFoodRecipe  from './pages/AddFoodRecipe'
import EditRecipe from './pages/EditRecipe'
import RecipeDetails from './pages/RecipeDetails'


const getAllRecipes=async()=>{
  let allRecipes=[]
  await axios.get('https://food-k1y4.onrender.com/api/recipe').then(res=>{
    allRecipes=res.data
  })
  return allRecipes
}

const getMyRecipes=async()=>{
  let user=JSON.parse(localStorage.getItem("user"))
  let allRecipes=await getAllRecipes()
  return allRecipes.filter(item=>item.createdBy===user._id)
}

const getFavRecipes=()=>{
  return JSON.parse(localStorage.getItem("fav"))
}

const getRecipe=async({params})=>{
  let recipe;
  console.log("Fetching recipe with ID:", params.id);
  try {
    const recipeRes = await axios.get(`https://food-k1y4.onrender.com/api/recipe/${params.id}`);
    recipe = recipeRes.data;
  } catch (error) {
    console.error("Error fetching recipe:", error.response ? error.response.data : error.message);
    return null; // Or handle the error as appropriate for your application
  }

  if (!recipe) {
    console.log("Recipe not found, cannot fetch user details.");
    return null;
  }

  console.log("Fetching user with ID:", recipe.createdBy);
  try {
    const userRes = await axios.get(`https://food-k1y4.onrender.com/api/user/${recipe.createdBy}`);
    recipe = {...recipe, email: userRes.data.email};
  } catch (error) {
    console.error("Error fetching user:", error.response ? error.response.data : error.message);
    // If user fetching fails, we can still return the recipe without user email
    return recipe;
  }

  return recipe
}

const router=createBrowserRouter([
  {path:"/",element:<MainNavigation/>,children:[
    {path:"/",element:<Home/>,loader:getAllRecipes},
    {path:"/myRecipe",element:<Home/>,loader:getMyRecipes},
    {path:"/favRecipe",element:<Home/>,loader:getFavRecipes},
    {path:"/addRecipe",element:<AddFoodRecipe/>},
    {path:"/editRecipe/:id",element:<EditRecipe/>},
    {path:"/recipe/:id",element:<RecipeDetails/>,loader:getRecipe}
  ]}
 
])

export default function App() {
  return (
   <>
   <RouterProvider router={router}></RouterProvider>
   </>
  )
}
import React from 'react';
import profileImg from '../assets/profile.png';
import { useLoaderData } from 'react-router-dom';

export default function RecipeDetails() {
  const recipe = useLoaderData();
  console.log(recipe);

  // Use default image if coverImage is missing
  const recipeImage = recipe.coverImage
    ? `https://food-k1y4.onrender.com/images/${recipe.coverImage}`
    : '/default-image.png'; // put default-image.png in your React public folder

  return (
    <div className="outer-container">
      <div className="profile">
        <img src={profileImg} width="50" height="50" alt="Profile" />
        <h5>{recipe.email || "Unknown Author"}</h5>
      </div>

      <h3 className="title">{recipe.title}</h3>

      <img
        src={recipeImage}
        width="220"
        height="200"
        alt={recipe.title}
        style={{ objectFit: 'cover' }}
      />

      <div className="recipe-details">
        <div className="ingredients">
          <h4>Ingredients</h4>
          <ul>
            {recipe.ingredients?.length > 0 ? (
              recipe.ingredients.map((item, index) => <li key={index}>{item}</li>)
            ) : (
              <li>No ingredients listed</li>
            )}
          </ul>
        </div>

        <div className="instructions">
          <h4>Instructions</h4>
          <span>{recipe.instructions || "No instructions provided"}</span>
        </div>
      </div>
    </div>
  );
}

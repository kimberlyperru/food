import React from 'react'
import profileImg from '../assets/profile.png'
import { useLoaderData } from 'react-router-dom'

export default function RecipeDetails() {
  const recipe = useLoaderData()
  console.log(recipe)

  return (
    <div className="outer-container">
      <div className="profile">
        <img src={profileImg} width="50" height="50" alt="Profile" />
        <h5>{recipe.email}</h5>
      </div>

      <h3 className="title">{recipe.title}</h3>

      <img
        src={`https://food-k1y4.onrender.com/images/${recipe.coverImage}`}
        width="220"
        height="200"
        alt={recipe.title}
      />

      <div className="recipe-details">
        <div className="ingredients">
          <h4>Ingredients</h4>
          <ul>
            {recipe.ingredients.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="instructions">
          <h4>Instructions</h4>
          <span>{recipe.instructions}</span>
        </div>
      </div>
    </div>
  )
}

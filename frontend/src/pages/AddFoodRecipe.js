import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AddFoodRecipe() {
    const [recipeData, setRecipeData] = useState({});
    const navigate = useNavigate();

    const onHandleChange = (e) => {
        const val =
            e.target.name === "ingredients"
                ? e.target.value.split(",")
                : e.target.name === "file"
                ? e.target.files[0]
                : e.target.value;
        setRecipeData((prev) => ({ ...prev, [e.target.name]: val }));
    };

    const onHandleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            alert("You must be logged in to add a recipe.");
            navigate("/login");
            return;
        }

        const formData = new FormData();
        formData.append("title", recipeData.title || "");
        formData.append("time", recipeData.time || "");
        formData.append(
            "ingredients",
            Array.isArray(recipeData.ingredients)
                ? recipeData.ingredients.join(",")
                : recipeData.ingredients || ""
        );
        formData.append("instructions", recipeData.instructions || "");
        if (recipeData.file) formData.append("file", recipeData.file);

        // Optional: log FormData for debugging
        // for (let [key, value] of formData.entries()) {
        //     console.log(key, value);
        // }

        try {
            await axios.post(
                "http://localhost:5000/api/recipe",
                formData,
                {
                    headers: {
                        authorization: "bearer " + token,
                        // Do NOT set Content-Type; Axios handles it automatically
                    },
                }
            );
            navigate("/");
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            console.error("Error adding recipe:", msg);

            if (msg === "Invalid token") {
                alert("Session expired. Please log in again.");
                navigate("/login");
            } else {
                alert("Failed to add recipe: " + msg);
            }
        }
    };

    return (
        <div className="container">
            <form className="form" onSubmit={onHandleSubmit}>
                <div className="form-control">
                    <label>Title</label>
                    <input
                        type="text"
                        className="input"
                        name="title"
                        onChange={onHandleChange}
                        required
                    />
                </div>
                <div className="form-control">
                    <label>Time</label>
                    <input
                        type="text"
                        className="input"
                        name="time"
                        onChange={onHandleChange}
                        required
                    />
                </div>
                <div className="form-control">
                    <label>Ingredients</label>
                    <textarea
                        className="input-textarea"
                        name="ingredients"
                        rows="5"
                        onChange={onHandleChange}
                        required
                    />
                </div>
                <div className="form-control">
                    <label>Instructions</label>
                    <textarea
                        className="input-textarea"
                        name="instructions"
                        rows="5"
                        onChange={onHandleChange}
                        required
                    />
                </div>
                <div className="form-control">
                    <label>Recipe Image</label>
                    <input
                        type="file"
                        className="input"
                        name="file"
                        onChange={onHandleChange}
                        required
                    />
                </div>
                <button type="submit">Add Recipe</button>
            </form>
        </div>
    );
}

import app from "../server.js";
import supertest from "supertest";
import mongoose from "mongoose";
import Recipe from "../models/recipe.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

const request = supertest(app);

describe("Recipe API", () => {
  let token;
  let userId;
  let recipeId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const user = new User({
      email: "test@example.com",
      password: "password",
      phone: "1234567890",
      isPaid: true,
    });
    const savedUser = await user.save();
    userId = savedUser._id;

    token = jwt.sign({ id: userId }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    const recipe = new Recipe({
      title: "Test Recipe",
      ingredients: ["ingredient1", "ingredient2"],
      instructions: "Test instructions",
      createdBy: userId,
    });
    const savedRecipe = await recipe.save();
    recipeId = savedRecipe._id;
  });

  afterAll(async () => {
    await User.findByIdAndDelete(userId);
    await Recipe.findByIdAndDelete(recipeId);
    await mongoose.connection.close();
  });

  it("should get all recipes", async () => {
    const res = await request.get("/api/recipe");
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should get a single recipe by id", async () => {
    const res = await request.get(`/api/recipe/${recipeId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.title).toEqual("Test Recipe");
  });

  it("should create a new recipe", async () => {
    const res = await request
      .post("/api/recipe")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "New Recipe",
        ingredients: ["new ingredient1", "new ingredient2"],
        instructions: "New test instructions",
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.title).toEqual("New Recipe");
    await Recipe.findByIdAndDelete(res.body._id);
  });

  it("should not create a new recipe without a token", async () => {
    const res = await request.post("/api/recipe").send({
      title: "New Recipe",
      ingredients: ["new ingredient1", "new ingredient2"],
      instructions: "New test instructions",
    });
    expect(res.statusCode).toEqual(400);
  });

  it("should edit a recipe", async () => {
    const res = await request
      .put(`/api/recipe/${recipeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated Recipe",
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.title).toEqual("Updated Recipe");
  });

  it("should not edit a recipe if the user is not the creator", async () => {
    const anotherUser = new User({
      email: "another@example.com",
      password: "password",
      phone: "0987654321",
      isPaid: true,
    });
    const savedAnotherUser = await anotherUser.save();
    const anotherToken = jwt.sign({ id: savedAnotherUser._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    const res = await request
      .put(`/api/recipe/${recipeId}`)
      .set("Authorization", `Bearer ${anotherToken}`)
      .send({
        title: "Updated Recipe",
      });
    expect(res.statusCode).toEqual(403);
    await User.findByIdAndDelete(savedAnotherUser._id);
    });

    it("should delete a recipe", async () => {
        const res = await request
            .delete(`/api/recipe/${recipeId}`)
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toEqual(200);
    });

    it("should not delete a recipe if the user is not the creator", async () => {
        const anotherUser = new User({
            email: "another2@example.com",
            password: "password",
            phone: "1234567891",
            isPaid: true,
        });
        const savedAnotherUser = await anotherUser.save();
        const anotherToken = jwt.sign({ id: savedAnotherUser._id }, process.env.SECRET_KEY, {
            expiresIn: "1h",
        });

        const recipe = new Recipe({
            title: "Test Recipe 2",
            ingredients: ["ingredient1", "ingredient2"],
            instructions: "Test instructions",
            createdBy: userId,
        });
        const savedRecipe = await recipe.save();


        const res = await request
            .delete(`/api/recipe/${savedRecipe._id}`)
            .set("Authorization", `Bearer ${anotherToken}`);

        expect(res.statusCode).toEqual(403);
        await User.findByIdAndDelete(savedAnotherUser._id);
        await Recipe.findByIdAndDelete(savedRecipe._id);
    });
});

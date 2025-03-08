import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { logRequest } from "@/lib/middleware"

export async function GET(request) {
  await logRequest(request)

  try {
    const { db } = await connectToDatabase()
    const recipes = await db.collection("recipes").find({}).toArray()

    return NextResponse.json(recipes)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 })
  }
}

export async function POST(request) {
  await logRequest(request)

  try {
    const recipe = await request.json()

    // Validate required fields
    const errors = validateRecipe(recipe)
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const result = await db.collection("recipes").insertOne(recipe)

    return NextResponse.json(
      {
        message: "Recipe created successfully",
        recipeId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 })
  }
}

function validateRecipe(recipe) {
  const errors = {}

  if (!recipe.title || recipe.title.trim() === "") {
    errors.title = "Title is required"
  }

  if (!recipe.category || recipe.category.trim() === "") {
    errors.category = "Category is required"
  }

  if (!recipe.ingredients || recipe.ingredients.trim() === "") {
    errors.ingredients = "Ingredients are required"
  }

  if (!recipe.instructions || recipe.instructions.trim() === "") {
    errors.instructions = "Instructions are required"
  }

  if (!recipe.cookTime || isNaN(recipe.cookTime) || recipe.cookTime <= 0) {
    errors.cookTime = "Cook time must be a positive number"
  }

  if (!recipe.servings || isNaN(recipe.servings) || recipe.servings <= 0) {
    errors.servings = "Servings must be a positive number"
  }

  return errors
}


import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"
import { logRequest } from "@/lib/middleware"

export async function GET(request, { params }) {
  await logRequest(request)

  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid recipe ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const recipe = await db.collection("recipes").findOne({ _id: new ObjectId(id) })

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
    }

    return NextResponse.json(recipe)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch recipe" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  await logRequest(request)

  try {
    const { id } = params
    const updatedRecipe = await request.json()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid recipe ID" }, { status: 400 })
    }

    // Validate required fields
    const errors = validateRecipe(updatedRecipe)
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Remove _id from the update if it exists
    if (updatedRecipe._id) {
      delete updatedRecipe._id
    }

    const result = await db
      .collection("recipes")
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updatedRecipe }, { returnDocument: "after" })

    if (!result) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to update recipe" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  await logRequest(request)

  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid recipe ID" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const result = await db.collection("recipes").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Recipe deleted successfully" })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to delete recipe" }, { status: 500 })
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


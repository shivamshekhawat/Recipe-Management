"use client"

import { useState, useEffect } from "react"
import RecipeOrganizer from "@/components/recipe-organizer"
import styles from "./page.module.css"

export default function OrganizePage() {
  const [recipes, setRecipes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRecipes()
  }, [])

  const fetchRecipes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/recipes")
      if (!response.ok) {
        throw new Error("Failed to fetch recipes")
      }
      const data = await response.json()
      setRecipes(data)
      setError(null)
    } catch (err) {
      setError("Failed to load recipes. Please try again later.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveOrganization = async (organizedRecipes) => {
    // Flatten the organized recipes object into an array
    const updatedRecipes = Object.values(organizedRecipes).flat()

    // Update each recipe with its new category
    try {
      const updatePromises = updatedRecipes.map((recipe) =>
        fetch(`/api/recipes/${recipe._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(recipe),
        }),
      )

      await Promise.all(updatePromises)
      console.log("Organization saved successfully")
    } catch (err) {
      console.error("Failed to save organization:", err)
    }
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Recipe Organizer</h1>

      {isLoading ? (
        <p>Loading recipes...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <RecipeOrganizer recipes={recipes} onSaveOrganization={handleSaveOrganization} />
      )}
    </main>
  )
}


"use client"

import { useState, useEffect } from "react"
import RecipeList from "@/components/recipe-list"
import RecipeForm from "@/components/recipe-form"
import RecipeDetails from "@/components/recipe-details"
import ThemeToggle from "@/components/theme-toggle"
import styles from "./page.module.css"

export default function Home() {
  const [recipes, setRecipes] = useState([])
  const [filteredRecipes, setFilteredRecipes] = useState([])
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchRecipes()
  }, [])

  useEffect(() => {
    // Extract unique categories from recipes
    if (recipes.length > 0) {
      const uniqueCategories = [...new Set(recipes.map((recipe) => recipe.category))]
      setCategories(uniqueCategories)
    }
  }, [recipes])

  useEffect(() => {
    // Filter recipes based on category and search term
    let result = [...recipes]

    if (selectedCategory !== "all") {
      result = result.filter((recipe) => recipe.category === selectedCategory)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (recipe) => recipe.title.toLowerCase().includes(term) || recipe.ingredients.toLowerCase().includes(term),
      )
    }

    setFilteredRecipes(result)
  }, [recipes, selectedCategory, searchTerm])

  const fetchRecipes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/recipes")
      if (!response.ok) {
        throw new Error("Failed to fetch recipes")
      }
      const data = await response.json()
      setRecipes(data)
      setFilteredRecipes(data)
      setError(null)
    } catch (err) {
      setError("Failed to load recipes. Please try again later.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const getRandomRecipe = () => {
    if (recipes.length === 0) return
    const randomIndex = Math.floor(Math.random() * recipes.length)
    setSelectedRecipe(recipes[randomIndex])
    setShowForm(false)
  }

  const handleRecipeSelect = (recipe) => {
    setSelectedRecipe(recipe)
    setShowForm(false)
  }

  const handleRecipeSubmit = async (recipeData) => {
    try {
      const method = recipeData._id ? "PUT" : "POST"
      const url = recipeData._id ? `/api/recipes/${recipeData._id}` : "/api/recipes"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipeData),
      })

      if (!response.ok) {
        throw new Error("Failed to save recipe")
      }

      await fetchRecipes()
      setShowForm(false)

      // If it was an edit, show the updated recipe
      if (recipeData._id) {
        const updatedRecipe = await response.json()
        setSelectedRecipe(updatedRecipe)
      } else {
        setSelectedRecipe(null)
      }
    } catch (err) {
      setError("Failed to save recipe. Please try again.")
      console.error(err)
    }
  }

  const handleDeleteRecipe = async (id) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return

    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete recipe")
      }

      await fetchRecipes()
      setSelectedRecipe(null)
    } catch (err) {
      setError("Failed to delete recipe. Please try again.")
      console.error(err)
    }
  }

  const handleEditRecipe = (recipe) => {
    setSelectedRecipe(recipe)
    setShowForm(true)
  }

  const handleNewRecipe = () => {
    setSelectedRecipe(null)
    setShowForm(true)
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Recipe Management</h1>
          <div className={styles.headerActions}>
            <ThemeToggle />
            <a href="/organize" className={styles.organizeLink}>
              Organize Recipes
            </a>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.categoryFilter}>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className={styles.categorySelect}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button className={styles.newButton} onClick={handleNewRecipe}>
              New Recipe
            </button>
            <button
              className={styles.surpriseButton}
              onClick={getRandomRecipe}
              disabled={recipes.length === 0 || isLoading}
            >
              Surprise Me!
            </button>
          </div>

          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading recipes...</p>
            </div>
          ) : error ? (
            <p className={styles.error}>{error}</p>
          ) : (
            <RecipeList recipes={filteredRecipes} onSelectRecipe={handleRecipeSelect} selectedRecipe={selectedRecipe} />
          )}
        </div>

        <div className={styles.content}>
          {showForm ? (
            <RecipeForm recipe={selectedRecipe} onSubmit={handleRecipeSubmit} onCancel={() => setShowForm(false)} />
          ) : selectedRecipe ? (
            <RecipeDetails
              recipe={selectedRecipe}
              onBack={() => setSelectedRecipe(null)}
              onEdit={() => handleEditRecipe(selectedRecipe)}
              onDelete={() => handleDeleteRecipe(selectedRecipe._id)}
            />
          ) : (
            <div className={styles.welcomeMessage}>
              <div className={styles.welcomeIcon}>📖</div>
              <h2>Welcome to Recipe Book!</h2>
              <p>Select a recipe from the list or create a new one to get started.</p>
              <button className={styles.welcomeButton} onClick={handleNewRecipe}>
                Create Your First Recipe
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}


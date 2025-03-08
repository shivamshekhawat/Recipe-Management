"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./recipe-details.module.css"

export default function RecipeDetails({ recipe, onBack, onEdit, onDelete }) {
  const [rating, setRating] = useState(recipe.rating || 0)
  const [hasRated, setHasRated] = useState(false)
  const router = useRouter()

  const ingredientsList = recipe.ingredients.split("\n").filter((ingredient) => ingredient.trim() !== "")

  const handleRating = async (newRating) => {
    if (hasRated) return

    setRating(newRating)
    setHasRated(true)

    try {
      await fetch(`/api/recipes/${recipe._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...recipe,
          rating: newRating,
        }),
      })
    } catch (err) {
      console.error("Failed to save rating:", err)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: `Check out this recipe for ${recipe.title}!`,
        url: window.location.href,
      })
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.recipeHeader}>
        <button onClick={onBack} className={styles.backButton}>
          &larr; Back
        </button>

        <h2 className={styles.recipeTitle}>{recipe.title}</h2>

        <div className={styles.recipeActions}>
          <button onClick={onEdit} className={styles.actionButton}>
            Edit
          </button>
          <button onClick={onDelete} className={styles.actionButton}>
            Delete
          </button>
        </div>
      </div>

      <div className={styles.recipeMetadata}>
        <div className={styles.metaGroup}>
          <span className={styles.metaItem}>
            <span className={styles.metaLabel}>Category:</span>
            <span className={styles.metaValue}>{recipe.category}</span>
          </span>
          <span className={styles.metaItem}>
            <span className={styles.metaLabel}>Cook Time:</span>
            <span className={styles.metaValue}>{recipe.cookTime} minutes</span>
          </span>
          <span className={styles.metaItem}>
            <span className={styles.metaLabel}>Servings:</span>
            <span className={styles.metaValue}>{recipe.servings}</span>
          </span>
        </div>

        <div className={styles.ratingContainer}>
          <span className={styles.ratingLabel}>Rating:</span>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`${styles.star} ${star <= rating ? styles.filled : ""}`}
                onClick={() => handleRating(star)}
                disabled={hasRated}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      </div>

      {recipe.imageUrl && (
        <div className={styles.imageContainer}>
          <img
            src={recipe.imageUrl || "/placeholder.svg"}
            alt={recipe.title}
            className={styles.recipeImage}
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=300&width=500"
              e.currentTarget.alt = "Image not available"
            }}
          />
        </div>
      )}

      <div className={styles.recipeContent}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Ingredients</h3>
          <ul className={styles.ingredientsList}>
            {ingredientsList.map((ingredient, index) => (
              <li key={index} className={styles.ingredientItem}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" className={styles.checkbox} />
                  <span>{ingredient}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Instructions</h3>
          <div className={styles.instructions}>
            {recipe.instructions.split("\n").map(
              (paragraph, index) =>
                paragraph.trim() !== "" && (
                  <p key={index} className={styles.instructionParagraph}>
                    {paragraph}
                  </p>
                ),
            )}
          </div>
        </div>
      </div>

      <div className={styles.recipeFooter}>
        <button onClick={handlePrint} className={styles.footerButton}>
          Print Recipe
        </button>
        <button onClick={handleShare} className={styles.footerButton}>
          Share Recipe
        </button>
      </div>
    </div>
  )
}


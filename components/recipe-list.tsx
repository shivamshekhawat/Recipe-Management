"use client"

import styles from "./recipe-list.module.css"

export default function RecipeList({ recipes, onSelectRecipe, selectedRecipe }) {
  if (recipes.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No recipes found</p>
        <p className={styles.emptyStateSubtext}>Try adjusting your search or category filter</p>
      </div>
    )
  }

  return (
    <ul className={styles.recipeList}>
      {recipes.map((recipe) => (
        <li
          key={recipe._id}
          className={`${styles.recipeItem} ${selectedRecipe && selectedRecipe._id === recipe._id ? styles.selected : ""}`}
          onClick={() => onSelectRecipe(recipe)}
        >
          <div className={styles.recipeContent}>
            <h3 className={styles.recipeTitle}>{recipe.title}</h3>
            <div className={styles.recipeInfo}>
              <span className={styles.category}>{recipe.category}</span>
              <span className={styles.cookTime}>{recipe.cookTime} min</span>
            </div>
            {recipe.rating > 0 && (
              <div className={styles.rating}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`${styles.star} ${i < recipe.rating ? styles.filled : ""}`}>
                    ★
                  </span>
                ))}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}


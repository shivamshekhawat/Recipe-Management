"use client"

import { useState } from "react"
import styles from "./recipe-form.module.css"

const initialFormState = {
  title: "",
  category: "",
  ingredients: "",
  instructions: "",
  cookTime: "",
  servings: "",
  imageUrl: "",
}

export default function RecipeForm({ recipe = null, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(recipe || initialFormState)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title?.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.category?.trim()) {
      newErrors.category = "Category is required"
    }

    if (!formData.ingredients?.trim()) {
      newErrors.ingredients = "Ingredients are required"
    }

    if (!formData.instructions?.trim()) {
      newErrors.instructions = "Instructions are required"
    }

    if (!formData.cookTime) {
      newErrors.cookTime = "Cook time is required"
    } else if (isNaN(formData.cookTime) || Number(formData.cookTime) <= 0) {
      newErrors.cookTime = "Cook time must be a positive number"
    }

    if (!formData.servings) {
      newErrors.servings = "Number of servings is required"
    } else if (isNaN(formData.servings) || Number(formData.servings) <= 0) {
      newErrors.servings = "Servings must be a positive number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      try {
        await onSubmit({
          ...formData,
          cookTime: Number(formData.cookTime),
          servings: Number(formData.servings),
        })
      } catch (error) {
        console.error("Error submitting form:", error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formHeader}>
        <h2 className={styles.title}>{recipe ? "Edit Recipe" : "Add New Recipe"}</h2>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Recipe Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title || ""}
            onChange={handleChange}
            className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
            placeholder="Enter recipe title"
          />
          {errors.title && <p className={styles.errorText}>{errors.title}</p>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category" className={styles.label}>
            Category
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category || ""}
            onChange={handleChange}
            className={`${styles.input} ${errors.category ? styles.inputError : ""}`}
            placeholder="e.g. Dessert, Main Course, Appetizer"
          />
          {errors.category && <p className={styles.errorText}>{errors.category}</p>}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="cookTime" className={styles.label}>
              Cook Time (minutes)
            </label>
            <input
              type="number"
              id="cookTime"
              name="cookTime"
              value={formData.cookTime || ""}
              onChange={handleChange}
              min="1"
              className={`${styles.input} ${errors.cookTime ? styles.inputError : ""}`}
              placeholder="30"
            />
            {errors.cookTime && <p className={styles.errorText}>{errors.cookTime}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="servings" className={styles.label}>
              Servings
            </label>
            <input
              type="number"
              id="servings"
              name="servings"
              value={formData.servings || ""}
              onChange={handleChange}
              min="1"
              className={`${styles.input} ${errors.servings ? styles.inputError : ""}`}
              placeholder="4"
            />
            {errors.servings && <p className={styles.errorText}>{errors.servings}</p>}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="imageUrl" className={styles.label}>
            Image URL (optional)
          </label>
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl || ""}
            onChange={handleChange}
            className={styles.input}
            placeholder="https://example.com/image.jpg"
          />
          {formData.imageUrl && (
            <div className={styles.imagePreview}>
              <img
                src={formData.imageUrl || "/placeholder.svg"}
                alt="Recipe preview"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=100&width=200"
                  e.currentTarget.alt = "Invalid image URL"
                }}
              />
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="ingredients" className={styles.label}>
            Ingredients (one per line)
          </label>
          <textarea
            id="ingredients"
            name="ingredients"
            value={formData.ingredients || ""}
            onChange={handleChange}
            rows={5}
            className={`${styles.textarea} ${errors.ingredients ? styles.inputError : ""}`}
            placeholder="2 cups flour&#10;1 cup sugar&#10;2 eggs"
          />
          {errors.ingredients && <p className={styles.errorText}>{errors.ingredients}</p>}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="instructions" className={styles.label}>
            Instructions
          </label>
          <textarea
            id="instructions"
            name="instructions"
            value={formData.instructions || ""}
            onChange={handleChange}
            rows={8}
            className={`${styles.textarea} ${errors.instructions ? styles.inputError : ""}`}
            placeholder="Preheat oven to 350°F.&#10;&#10;Mix dry ingredients in a bowl.&#10;&#10;Add wet ingredients and stir until combined."
          />
          {errors.instructions && <p className={styles.errorText}>{errors.instructions}</p>}
        </div>

        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : recipe ? "Update Recipe" : "Add Recipe"}
        </button>
      </form>
    </div>
  )
}


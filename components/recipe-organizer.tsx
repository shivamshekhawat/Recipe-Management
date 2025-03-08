"use client"

import { useState, useEffect } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { SortableItem } from "./sortable-item"
import styles from "./recipe-organizer.module.css"

export default function RecipeOrganizer({ recipes, onSaveOrganization }) {
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState({})
  const [newCategory, setNewCategory] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Initialize categories and items from recipes
  useEffect(() => {
    if (!recipes || recipes.length === 0) return

    // Extract unique categories
    const existingCategories = [...new Set(recipes.map((recipe) => recipe.category))]
    setCategories(existingCategories)

    // Group recipes by category
    const groupedItems = {}
    existingCategories.forEach((category) => {
      groupedItems[category] = recipes.filter((recipe) => recipe.category === category)
    })
    setItems(groupedItems)
  }, [recipes])

  const handleAddCategory = () => {
    if (newCategory.trim() === "" || categories.includes(newCategory)) {
      return
    }

    setCategories([...categories, newCategory])
    setItems({
      ...items,
      [newCategory]: [],
    })
    setNewCategory("")
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const [activeCategory, activeId] = active.id.split("-item-")
    const [overCategory, overId] = over.id.split("-item-")

    // If moving within the same category
    if (activeCategory === overCategory) {
      const oldIndex = items[activeCategory].findIndex((item) => item._id === activeId)
      const newIndex = items[activeCategory].findIndex((item) => item._id === overId)

      const newItems = {
        ...items,
        [activeCategory]: arrayMove(items[activeCategory], oldIndex, newIndex),
      }

      setItems(newItems)
      onSaveOrganization && onSaveOrganization(newItems)
    }
    // If moving between categories
    else {
      const itemToMove = items[activeCategory].find((item) => item._id === activeId)

      // Remove from old category
      const newSourceItems = items[activeCategory].filter((item) => item._id !== activeId)

      // Add to new category
      const targetIndex = items[overCategory].findIndex((item) => item._id === overId)
      const newTargetItems = [...items[overCategory]]
      newTargetItems.splice(targetIndex, 0, { ...itemToMove, category: overCategory })

      const newItems = {
        ...items,
        [activeCategory]: newSourceItems,
        [overCategory]: newTargetItems,
      }

      setItems(newItems)
      onSaveOrganization && onSaveOrganization(newItems)
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Recipe Organizer</h2>

      <div className={styles.addCategory}>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name"
          className={styles.input}
        />
        <button onClick={handleAddCategory} className={styles.button}>
          Add Category
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className={styles.categoriesGrid}>
          {categories.map((category) => (
            <div key={category} className={styles.category}>
              <h3 className={styles.categoryTitle}>{category}</h3>
              <SortableContext
                items={items[category]?.map((item) => `${category}-item-${item._id}`) || []}
                strategy={verticalListSortingStrategy}
              >
                <ul className={styles.recipeList}>
                  {items[category]?.map((item) => (
                    <SortableItem key={`${category}-item-${item._id}`} id={`${category}-item-${item._id}`}>
                      <div className={styles.recipeItem}>{item.title}</div>
                    </SortableItem>
                  ))}
                  {(!items[category] || items[category].length === 0) && (
                    <li className={styles.emptyMessage}>No recipes in this category</li>
                  )}
                </ul>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  )
}


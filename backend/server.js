import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
const db = new Database(path.join(__dirname, 'restaurant.db'));

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

// Get all categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY display_order').all();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get dishes by category
app.get('/api/dishes', (req, res) => {
  try {
    const { categoryId } = req.query;
    let dishes;
    
    if (categoryId) {
      dishes = db.prepare('SELECT * FROM dishes WHERE category_id = ?').all(categoryId);
    } else {
      dishes = db.prepare('SELECT * FROM dishes').all();
    }
    
    res.json(dishes);
  } catch (error) {
    console.error('Error fetching dishes:', error);
    res.status(500).json({ error: 'Failed to fetch dishes' });
  }
});

// Get single dish by ID
app.get('/api/dishes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const dish = db.prepare('SELECT * FROM dishes WHERE id = ?').get(id);
    
    if (!dish) {
      return res.status(404).json({ error: 'Dish not found' });
    }
    
    res.json(dish);
  } catch (error) {
    console.error('Error fetching dish:', error);
    res.status(500).json({ error: 'Failed to fetch dish' });
  }
});

// Admin endpoints (optional - for future use)

// Create new category
app.post('/api/admin/categories', (req, res) => {
  try {
    const { name, display_order } = req.body;
    
    const result = db.prepare(
      'INSERT INTO categories (name, display_order) VALUES (?, ?)'
    ).run(name, display_order);
    
    res.json({ id: result.lastInsertRowid, name, display_order });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Create new dish
app.post('/api/admin/dishes', (req, res) => {
  try {
    const { category_id, name, description, price, image_url, weight, ingredients_text } = req.body;
    
    const result = db.prepare(
      `INSERT INTO dishes (category_id, name, description, price, image_url, weight, ingredients_text) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(category_id, name, description, price, image_url, weight, ingredients_text);
    
    res.json({ 
      id: result.lastInsertRowid, 
      category_id, 
      name, 
      description, 
      price, 
      image_url,
      weight,
      ingredients_text 
    });
  } catch (error) {
    console.error('Error creating dish:', error);
    res.status(500).json({ error: 'Failed to create dish' });
  }
});

// Update dish
app.put('/api/admin/dishes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, price, image_url, weight, ingredients_text } = req.body;
    
    const result = db.prepare(
      `UPDATE dishes 
       SET category_id = ?, name = ?, description = ?, price = ?, image_url = ?, weight = ?, ingredients_text = ?
       WHERE id = ?`
    ).run(category_id, name, description, price, image_url, weight, ingredients_text, id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Dish not found' });
    }
    
    res.json({ message: 'Dish updated successfully' });
  } catch (error) {
    console.error('Error updating dish:', error);
    res.status(500).json({ error: 'Failed to update dish' });
  }
});

// Delete dish
app.delete('/api/admin/dishes/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const result = db.prepare('DELETE FROM dishes WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Dish not found' });
    }
    
    res.json({ message: 'Dish deleted successfully' });
  } catch (error) {
    console.error('Error deleting dish:', error);
    res.status(500).json({ error: 'Failed to delete dish' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});

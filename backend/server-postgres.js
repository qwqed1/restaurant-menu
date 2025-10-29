import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pool from './config/database.js';
import { authenticateToken, generateToken } from './middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for IP access
  credentials: true
}));
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Только изображения (jpeg, jpg, png, gif, webp) разрешены!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: fileFilter
});

// ============= PUBLIC API ROUTES =============

// Get all categories with localization
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name_ru, name_en, name_kk, display_order, created_at, updated_at FROM categories ORDER BY display_order'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get dishes by category with localization
app.get('/api/dishes', async (req, res) => {
  try {
    const { categoryId } = req.query;
    let query = 'SELECT id, category_id, name, description_ru, description_en, description_kk, price, image_url, weight, ingredients_text, is_available, created_at, updated_at FROM dishes WHERE is_available = true';
    const params = [];
    
    if (categoryId) {
      query += ' AND category_id = $1';
      params.push(categoryId);
    }
    
    query += ' ORDER BY id';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching dishes:', error);
    res.status(500).json({ error: 'Failed to fetch dishes' });
  }
});

// Get single dish by ID
app.get('/api/dishes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM dishes WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dish not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching dish:', error);
    res.status(500).json({ error: 'Failed to fetch dish' });
  }
});

// ============= AUTHENTICATION ROUTES =============

// Admin login
app.post('/api/admin/login', 
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const result = await pool.query(
        'SELECT * FROM admin_users WHERE username = $1 AND is_active = true',
        [username]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken(user);

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// Verify token
app.get('/api/admin/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ============= ADMIN CATEGORY ROUTES (Protected) =============

// Get all categories (admin)
app.get('/api/admin/categories', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY display_order'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create category with localization
app.post('/api/admin/categories',
  authenticateToken,
  body('name_ru').notEmpty(),
  body('name_en').optional(),
  body('name_kk').optional(),
  body('display_order').optional().isInt(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name_ru, name_en, name_kk, display_order } = req.body;
    
    try {
      const result = await pool.query(
        'INSERT INTO categories (name_ru, name_en, name_kk, display_order) VALUES ($1, $2, $3, $4) RETURNING *',
        [name_ru, name_en || name_ru, name_kk || name_ru, display_order || 0]
      );
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
);

// Update category with localization
app.put('/api/admin/categories/:id', 
  authenticateToken,
  body('name_ru').optional().notEmpty(),
  body('name_en').optional(),
  body('name_kk').optional(),
  body('display_order').optional().isInt(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name_ru, name_en, name_kk, display_order } = req.body;
    
    try {
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (name_ru !== undefined) {
        updates.push(`name_ru = $${paramCount++}`);
        values.push(name_ru);
      }
      if (name_en !== undefined) {
        updates.push(`name_en = $${paramCount++}`);
        values.push(name_en);
      }
      if (name_kk !== undefined) {
        updates.push(`name_kk = $${paramCount++}`);
        values.push(name_kk);
      }
      if (display_order !== undefined) {
        updates.push(`display_order = $${paramCount++}`);
        values.push(display_order);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(id);
      const query = `
        UPDATE categories 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Category with this name already exists' });
      }
      console.error('Error updating category:', error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  }
);

// Delete category
app.delete('/api/admin/categories/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if category has dishes
    const dishCheck = await pool.query(
      'SELECT COUNT(*) as count FROM dishes WHERE category_id = $1',
      [id]
    );
    
    if (parseInt(dishCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with existing dishes. Delete or reassign dishes first.' 
      });
    }

    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully', category: result.rows[0] });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ============= ADMIN DISH ROUTES (Protected) =============

// Get all dishes (admin - includes unavailable) with localization
app.get('/api/admin/dishes', authenticateToken, async (req, res) => {
  try {
    const { categoryId } = req.query;
    let query = `
      SELECT d.*, c.name_ru as category_name 
      FROM dishes d
      LEFT JOIN categories c ON d.category_id = c.id
    `;
    const params = [];
    
    if (categoryId) {
      query += ' WHERE d.category_id = $1';
      params.push(categoryId);
    }
    
    query += ' ORDER BY d.id';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching dishes:', error);
    res.status(500).json({ error: 'Failed to fetch dishes' });
  }
});

// Create new dish with localization
app.post('/api/admin/dishes', 
  authenticateToken,
  body('category_id').isInt().withMessage('Valid category ID is required'),
  body('name').notEmpty().withMessage('Dish name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('description_ru').optional(),
  body('description_en').optional(),
  body('description_kk').optional(),
  body('image_url').optional().custom((value) => {
    if (value && value.trim() !== '') {
      const urlRegex = /^(https?:\/\/)|(\/uploads\/)/;
      if (!urlRegex.test(value)) {
        throw new Error('Invalid image URL');
      }
    }
    return true;
  }),
  body('weight').optional(),
  body('ingredients_text').optional(),
  body('is_available').optional().isBoolean(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      category_id, 
      name, 
      description_ru, 
      description_en,
      description_kk,
      price, 
      image_url, 
      weight, 
      ingredients_text,
      is_available = true 
    } = req.body;
    
    try {
      // Check if category exists
      const categoryCheck = await pool.query(
        'SELECT id FROM categories WHERE id = $1',
        [category_id]
      );
      
      if (categoryCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Category not found' });
      }

      const result = await pool.query(
        `INSERT INTO dishes 
         (category_id, name, description_ru, description_en, description_kk, price, image_url, weight, ingredients_text, is_available) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [category_id, name, description_ru, description_en || description_ru, description_kk || description_ru, price, image_url, weight, ingredients_text, is_available]
      );
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error creating dish:', error);
      res.status(500).json({ error: 'Failed to create dish' });
    }
  }
);

// Update dish with localization
app.put('/api/admin/dishes/:id', 
  authenticateToken,
  body('category_id').optional().isInt(),
  body('name').optional().notEmpty(),
  body('price').optional().isFloat({ min: 0 }),
  body('description_ru').optional(),
  body('description_en').optional(),
  body('description_kk').optional(),
  body('image_url').optional().custom((value) => {
    if (value && value.trim() !== '') {
      const urlRegex = /^(https?:\/\/)|(\/uploads\/)/;
      if (!urlRegex.test(value)) {
        throw new Error('Invalid image URL');
      }
    }
    return true;
  }),
  body('weight').optional(),
  body('ingredients_text').optional(),
  body('is_available').optional().isBoolean(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const fields = req.body;
    
    try {
      // Build dynamic update query
      const updates = [];
      const values = [];
      let paramCount = 1;

      const allowedFields = ['category_id', 'name', 'description_ru', 'description_en', 'description_kk', 'price', 'image_url', 'weight', 'ingredients_text', 'is_available'];
      
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined && allowedFields.includes(key)) {
          updates.push(`${key} = $${paramCount++}`);
          values.push(value);
        }
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(id);
      const query = `
        UPDATE dishes 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Dish not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating dish:', error);
      res.status(500).json({ error: 'Failed to update dish' });
    }
  }
);

// Delete dish
app.delete('/api/admin/dishes/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      'DELETE FROM dishes WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dish not found' });
    }
    
    res.json({ message: 'Dish deleted successfully', dish: result.rows[0] });
  } catch (error) {
    console.error('Error deleting dish:', error);
    res.status(500).json({ error: 'Failed to delete dish' });
  }
});

// Toggle dish availability
app.patch('/api/admin/dishes/:id/toggle-availability', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `UPDATE dishes 
       SET is_available = NOT is_available, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dish not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling dish availability:', error);
    res.status(500).json({ error: 'Failed to toggle dish availability' });
  }
});

// Upload image for dish
app.post('/api/admin/upload-image', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    // Return the URL to access the uploaded file
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      filename: req.file.filename,
      imageUrl: imageUrl,
      path: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Ошибка при загрузке изображения' });
  }
});

// ============= ADMIN USER MANAGEMENT =============

// Get all admin users
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, is_active, created_at FROM admin_users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ error: 'Failed to fetch admin users' });
  }
});

// Create new admin user
app.post('/api/admin/users', 
  authenticateToken,
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = await pool.query(
        'INSERT INTO admin_users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, is_active, created_at',
        [username, email, hashedPassword]
      );
      
      res.json(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Username or email already exists' });
      }
      console.error('Error creating admin user:', error);
      res.status(500).json({ error: 'Failed to create admin user' });
    }
  }
);

// Delete admin user
app.delete('/api/admin/users/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user.id;
  
  try {
    // Prevent self-deletion
    if (parseInt(id) === currentUserId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    // Check if user exists
    const userCheck = await pool.query(
      'SELECT id FROM admin_users WHERE id = $1',
      [id]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete user
    await pool.query('DELETE FROM admin_users WHERE id = $1', [id]);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin user:', error);
    res.status(500).json({ error: 'Failed to delete admin user' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL'
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API endpoints available at /api`);
  console.log(`🔐 Admin endpoints available at /api/admin`);
  
  // Get local IP address (only for local development)
  if (process.env.NODE_ENV !== 'production') {
    const os = await import('os');
    const networkInterfaces = os.networkInterfaces();
    const addresses = [];
    
    for (const nets of Object.values(networkInterfaces)) {
      for (const net of nets) {
        if (net.family === 'IPv4' && !net.internal) {
          addresses.push(net.address);
        }
      }
    }
    
    if (addresses.length > 0) {
      console.log(`\n📱 Access from other devices:`);
      addresses.forEach(address => {
        console.log(`   http://${address}:${PORT}`);
      });
    }
  }
});

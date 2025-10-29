import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Save,
  ArrowUp,
  ArrowDown,
  Grid3x3
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function CategoriesManager({ onUpdate }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name_ru: '',
    name_en: '',
    name_kk: '',
    display_order: 0
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/categories`);
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading categories:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Validation
    const errors = {};
    if (!formData.name_ru) errors.name_ru = 'Название на русском обязательно';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (editingCategory) {
        await axios.put(`${API_URL}/api/admin/categories/${editingCategory.id}`, formData);
      } else {
        await axios.post(`${API_URL}/api/admin/categories`, formData);
      }
      
      loadCategories();
      if (onUpdate) onUpdate();
      closeModal();
    } catch (error) {
      console.error('Error saving category:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Ошибка при сохранении категории');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию? Убедитесь, что в ней нет блюд.')) return;

    try {
      await axios.delete(`${API_URL}/api/admin/categories/${id}`);
      loadCategories();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting category:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Ошибка при удалении категории');
      }
    }
  };

  const handleMoveUp = async (category) => {
    const index = categories.findIndex(c => c.id === category.id);
    if (index <= 0) return;

    const prevCategory = categories[index - 1];
    
    try {
      await Promise.all([
        axios.put(`${API_URL}/api/admin/categories/${category.id}`, {
          display_order: prevCategory.display_order
        }),
        axios.put(`${API_URL}/api/admin/categories/${prevCategory.id}`, {
          display_order: category.display_order
        })
      ]);
      loadCategories();
    } catch (error) {
      console.error('Error reordering categories:', error);
    }
  };

  const handleMoveDown = async (category) => {
    const index = categories.findIndex(c => c.id === category.id);
    if (index >= categories.length - 1) return;

    const nextCategory = categories[index + 1];
    
    try {
      await Promise.all([
        axios.put(`${API_URL}/api/admin/categories/${category.id}`, {
          display_order: nextCategory.display_order
        }),
        axios.put(`${API_URL}/api/admin/categories/${nextCategory.id}`, {
          display_order: category.display_order
        })
      ]);
      loadCategories();
    } catch (error) {
      console.error('Error reordering categories:', error);
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name_ru: category.name_ru || category.name || '',
        name_en: category.name_en || '',
        name_kk: category.name_kk || '',
        display_order: category.display_order
      });
    } else {
      setEditingCategory(null);
      const maxOrder = Math.max(...categories.map(c => c.display_order), 0);
      setFormData({
        name_ru: '',
        name_en: '',
        name_kk: '',
        display_order: maxOrder + 10
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name_ru: '',
      name_en: '',
      name_kk: '',
      display_order: 0
    });
    setFormErrors({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-menu-green"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Управление категориями</h1>
            <p className="text-gray-600 mt-2">Всего категорий: {categories.length}</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-menu-green to-menu-green/90 text-white rounded-lg hover:from-menu-green/90 hover:to-menu-green/80 transition-all"
          >
            <Plus className="w-5 h-5" />
            Добавить категорию
          </button>
        </div>
      </div>

      {/* Categories list */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Порядок
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Название
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Количество блюд
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сортировка
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((category, index) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center w-10 h-10 bg-menu-green/10 rounded-lg">
                      <span className="text-sm font-semibold text-menu-green">
                        {category.display_order}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Grid3x3 className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{category.name_ru || category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {category.dishes_count || 0} блюд
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleMoveUp(category)}
                        disabled={index === 0}
                        className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-menu-green hover:bg-gray-100'}`}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(category)}
                        disabled={index === categories.length - 1}
                        className={`p-1 rounded ${index === categories.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-menu-green hover:bg-gray-100'}`}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(category)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название на русском *
                </label>
                <input
                  type="text"
                  value={formData.name_ru}
                  onChange={(e) => setFormData({...formData, name_ru: e.target.value})}
                  className={`w-full px-4 py-2 border ${formErrors.name_ru ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-menu-green focus:border-menu-green`}
                  placeholder="Например: Завтраки"
                />
                {formErrors.name_ru && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name_ru}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название на английском
                </label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-menu-green focus:border-menu-green"
                  placeholder="Например: Breakfast"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название на казахском
                </label>
                <input
                  type="text"
                  value={formData.name_kk}
                  onChange={(e) => setFormData({...formData, name_kk: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-menu-green focus:border-menu-green"
                  placeholder="Например: Таңғы ас"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Порядок отображения
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-menu-green focus:border-menu-green"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Категории с меньшим числом отображаются первыми
                </p>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-menu-green to-menu-green/90 text-white rounded-lg hover:from-menu-green/90 hover:to-menu-green/80 transition-all"
                >
                  <Save className="w-4 h-4" />
                  {editingCategory ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoriesManager;

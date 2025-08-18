import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, MapPin, Calendar, Star, DollarSign, Tag } from 'lucide-react';
import './TravelLogApp.css';

const TravelLogApp = () => {
  const [entries, setEntries] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    country: '',
    city: '',
    title: '',
    description: '',
    rating: 1,
    tags: '',
    expenses: 0
  });

  useEffect(() => {
    const savedEntries = localStorage.getItem('travelEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('travelEntries', JSON.stringify(entries));
  }, [entries]);

  const resetForm = () => {
    setFormData({
      date: '',
      country: '',
      city: '',
      title: '',
      description: '',
      rating: 1,
      tags: '',
      expenses: 0
    });
    setEditingEntry(null);
    setIsFormOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.country || !formData.city || !formData.date) {
      alert('Please fill in all required fields');
      return;
    }

    const entryData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
      id: editingEntry ? editingEntry.id : Date.now()
    };

    if (editingEntry) {
      setEntries(prev => prev.map(entry => 
        entry.id === editingEntry.id ? entryData : entry
      ));
    } else {
      setEntries(prev => [...prev, entryData]);
    }

    resetForm();
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      ...entry,
      tags: entry.tags.join(', ')
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'star-filled' : 'star-empty'}
        fill={i < rating ? 'currentColor' : 'none'}
      />
    ));
  };

  return (
    <div className="travel-log-app">
      <header className="app-header">
        <h1>🌍 PoliWorld Travel Log</h1>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="add-button"
        >
          <Plus size={20} />
          Add New Entry
        </button>
      </header>

      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingEntry ? 'Edit Entry' : 'Add New Entry'}</h2>
              <button onClick={resetForm} className="close-button">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="entry-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date *</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="rating">Rating *</label>
                  <select
                    id="rating"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    required
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="country">Country *</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="e.g., Japan"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g., Tokyo"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Amazing trip to Tokyo"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell us about your experience..."
                  rows={4}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="tags">Tags</label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="adventure, food, culture (comma separated)"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="expenses">Expenses ($)</label>
                  <input
                    type="number"
                    id="expenses"
                    name="expenses"
                    value={formData.expenses}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  <Save size={16} />
                  {editingEntry ? 'Update Entry' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="entries-container">
        {entries.length === 0 ? (
          <div className="empty-state">
            <h3>No travel entries yet!</h3>
            <p>Start documenting your adventures by adding your first entry.</p>
          </div>
        ) : (
          <div className="entries-grid">
            {entries.map(entry => (
              <div key={entry.id} className="entry-card">
                <div className="entry-header">
                  <div className="entry-location">
                    <MapPin size={16} />
                    <span>{entry.city}, {entry.country}</span>
                  </div>
                  <div className="entry-actions">
                    <button 
                      onClick={() => handleEdit(entry)}
                      className="edit-button"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      className="delete-button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="entry-title">{entry.title}</h3>
                
                <div className="entry-meta">
                  <div className="entry-date">
                    <Calendar size={14} />
                    <span>{new Date(entry.date).toLocaleDateString()}</span>
                  </div>
                  <div className="entry-rating">
                    {renderStars(entry.rating)}
                  </div>
                </div>

                {entry.description && (
                  <p className="entry-description">{entry.description}</p>
                )}

                {entry.tags.length > 0 && (
                  <div className="entry-tags">
                    <Tag size={14} />
                    <div className="tags-list">
                      {entry.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {entry.expenses > 0 && (
                  <div className="entry-expenses">
                    <DollarSign size={14} />
                    <span>${entry.expenses.toFixed(2)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelLogApp;
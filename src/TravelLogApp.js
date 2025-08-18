import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Edit, Trash2, Save, X, MapPin, Calendar, Star, DollarSign, Tag, Search, Filter, Globe, Target, Download, Upload, Camera, Image as ImageIcon, Map } from 'lucide-react';
import TravelMap from './TravelMap';

const TravelLogApp = () => {
  const [entries, setEntries] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState(0);
  const [filterCountry, setFilterCountry] = useState('');
  const [currentView, setCurrentView] = useState('grid'); // 'grid' or 'map'
  const [formData, setFormData] = useState({
    date: '',
    country: '',
    city: '',
    title: '',
    description: '',
    rating: 1,
    tags: '',
    expenses: 0,
    photos: []
  });
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);

  useEffect(() => {
    const savedEntries = localStorage.getItem('travelEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('travelEntries', JSON.stringify(entries));
  }, [entries]);

  // Computed stats
  const stats = useMemo(() => {
    const totalEntries = entries.length;
    const totalCountries = new Set(entries.map(entry => entry.country)).size;
    const totalExpenses = entries.reduce((sum, entry) => sum + entry.expenses, 0);
    const averageRating = totalEntries > 0 ? entries.reduce((sum, entry) => sum + entry.rating, 0) / totalEntries : 0;
    
    return {
      totalEntries,
      totalCountries,
      totalExpenses,
      averageRating: averageRating.toFixed(1)
    };
  }, [entries]);

  // Get unique countries for filter
  const countries = useMemo(() => {
    return [...new Set(entries.map(entry => entry.country))].sort();
  }, [entries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = searchTerm === '' || 
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRating = filterRating === 0 || entry.rating >= filterRating;
      const matchesCountry = filterCountry === '' || entry.country === filterCountry;
      
      return matchesSearch && matchesRating && matchesCountry;
    });
  }, [entries, searchTerm, filterRating, filterCountry]);

  const resetForm = () => {
    setFormData({
      date: '',
      country: '',
      city: '',
      title: '',
      description: '',
      rating: 1,
      tags: '',
      expenses: 0,
      photos: []
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
      tags: entry.tags.join(', '),
      photos: entry.photos || []
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `travel-entries-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (!Array.isArray(importedData)) {
          alert('Invalid file format. Please select a valid travel entries JSON file.');
          return;
        }

        const validEntries = importedData.filter(entry => {
          return entry && 
                 typeof entry === 'object' && 
                 entry.title && 
                 entry.country && 
                 entry.city && 
                 entry.date;
        });

        if (validEntries.length === 0) {
          alert('No valid travel entries found in the file.');
          return;
        }

        const processedEntries = validEntries.map(entry => ({
          ...entry,
          id: entry.id || Date.now() + Math.random(),
          tags: Array.isArray(entry.tags) ? entry.tags : [],
          rating: Number(entry.rating) || 1,
          expenses: Number(entry.expenses) || 0,
          photos: Array.isArray(entry.photos) ? entry.photos : []
        }));

        if (window.confirm(`Import ${processedEntries.length} travel entries? This will add to your existing entries.`)) {
          setEntries(prev => [...prev, ...processedEntries]);
        }
      } catch (error) {
        alert('Error reading file. Please ensure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resizeImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(async (file) => {
      if (file.type.startsWith('image/')) {
        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`Image ${file.name} is too large. Please choose images under 5MB.`);
          return;
        }
        
        try {
          const compressedData = await resizeImage(file);
          const newPhoto = {
            id: Date.now() + Math.random(),
            data: compressedData,
            name: file.name,
            size: file.size,
            compressedSize: Math.round(compressedData.length * 0.75) // Approximate compressed size
          };
          
          setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, newPhoto]
          }));
        } catch (error) {
          console.error('Error processing image:', error);
          alert(`Error processing image ${file.name}`);
        }
      }
    });
    
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
  };

  const removePhoto = (photoId) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => photo.id !== photoId)
    }));
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        fill={i < rating ? 'currentColor' : 'none'}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Globe className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">PoliWorld Travel Log</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <Upload size={18} />
                  <span>Import</span>
                </button>
                <button 
                  onClick={handleExport}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors duration-200 shadow-md hover:shadow-lg"
                  disabled={entries.length === 0}
                >
                  <Download size={18} />
                  <span>Export</span>
                </button>
              </div>
              <button 
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <Plus size={20} />
                <span>Add New Entry</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEntries}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Countries Visited</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCountries}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalExpenses.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}/5</p>
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle and Search/Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentView('grid')}
                className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2 ${
                  currentView === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Target size={16} />
                <span>Grid View</span>
              </button>
              <button
                onClick={() => setCurrentView('map')}
                className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2 ${
                  currentView === 'map'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Map size={16} />
                <span>Map View</span>
              </button>
            </div>
            
            <div className="text-sm text-gray-500">
              {filteredEntries.length} of {entries.length} entries
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value={0}>All Ratings</option>
                <option value={5}>5 Stars</option>
                <option value={4}>4+ Stars</option>
                <option value={3}>3+ Stars</option>
                <option value={2}>2+ Stars</option>
                <option value={1}>1+ Stars</option>
              </select>
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Modal Form */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingEntry ? 'Edit Entry' : 'Add New Entry'}
                </h2>
                <button 
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
                      Rating *
                    </label>
                    <select
                      id="rating"
                      name="rating"
                      value={formData.rating}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num} Star{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="e.g., Japan"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g., Tokyo"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Amazing trip to Tokyo"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Tell us about your experience..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="adventure, food, culture (comma separated)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="expenses" className="block text-sm font-medium text-gray-700 mb-2">
                      Expenses ($)
                    </label>
                    <input
                      type="number"
                      id="expenses"
                      name="expenses"
                      value={formData.expenses}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Photo Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photos
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                      >
                        <Camera size={18} />
                        <span>Add Photos</span>
                      </button>
                      <span className="text-sm text-gray-500">
                        {formData.photos.length} photo{formData.photos.length !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                    
                    {formData.photos.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {formData.photos.map((photo) => (
                          <div key={photo.id} className="relative group">
                            <img
                              src={photo.data}
                              alt={photo.name}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(photo.id)}
                              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                              {photo.compressedSize ? `${(photo.compressedSize / 1024).toFixed(1)}KB` : `${(photo.size / 1024).toFixed(1)}KB`}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors"
                  >
                    <Save size={16} />
                    <span>{editingEntry ? 'Update Entry' : 'Save Entry'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Content Area - Grid or Map */}
        {currentView === 'map' ? (
          <div className="h-[600px] mb-8">
            <TravelMap 
              entries={filteredEntries}
              onMarkerClick={(entry) => {
                // Optional: Could open entry details or highlight it
                console.log('Clicked marker for:', entry.title);
              }}
            />
          </div>
        ) : (
          filteredEntries.length === 0 ? (
            <div className="text-center py-16">
              <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {entries.length === 0 ? 'No travel entries yet!' : 'No entries match your filters'}
              </h3>
              <p className="text-gray-600">
                {entries.length === 0 
                  ? 'Start documenting your adventures by adding your first entry.' 
                  : 'Try adjusting your search or filter criteria.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEntries.map(entry => (
                <div key={entry.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin size={16} className="mr-2" />
                      <span className="text-sm font-medium">{entry.city}, {entry.country}</span>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(entry)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">{entry.title}</h3>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar size={14} className="mr-2" />
                      <span>{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex space-x-1">
                      {renderStars(entry.rating)}
                    </div>
                  </div>

                  {entry.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{entry.description}</p>
                  )}

                  {entry.photos && entry.photos.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <ImageIcon size={14} className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500">{entry.photos.length} photo{entry.photos.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {entry.photos.slice(0, 3).map((photo, index) => (
                          <div key={photo.id} className="relative">
                            <img
                              src={photo.data}
                              alt={photo.name}
                              className="w-full h-16 object-cover rounded border border-gray-200"
                            />
                            {index === 2 && entry.photos.length > 3 && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                                <span className="text-white text-xs font-medium">+{entry.photos.length - 3}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {entry.tags.length > 0 && (
                    <div className="flex items-center mb-4">
                      <Tag size={14} className="text-gray-400 mr-2" />
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                        {entry.tags.length > 3 && (
                          <span className="text-gray-500 text-xs">+{entry.tags.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {entry.expenses > 0 && (
                    <div className="flex items-center text-green-600 font-semibold">
                      <DollarSign size={14} className="mr-1" />
                      <span className="text-sm">${entry.expenses.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
              ))}
            </div>
          )
        )}
        
        {/* Hidden file inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          accept=".json"
          style={{ display: 'none' }}
        />
        <input
          type="file"
          ref={photoInputRef}
          onChange={handlePhotoUpload}
          accept="image/*"
          multiple
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default TravelLogApp;
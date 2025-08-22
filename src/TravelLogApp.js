import React, { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Camera,
  DollarSign,
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Image,
  BarChart3,
  PieChart,
  TrendingUp,
  X,
  Navigation,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const TravelLogApp = () => {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [currentEntry, setCurrentEntry] = useState({
    id: "",
    date: new Date().toISOString().split("T")[0],
    country: "",
    city: "",
    title: "",
    description: "",
    photos: [],
    expenses: [],
    rating: 5,
    tags: [],
    coordinates: { lat: null, lng: null },
    // Financial tracking
    dailySpend: { usd: 0, local: 0, localCurrency: "USD" },
    expenseCategories: {
      transport: 0,
      lodging: 0,
      food: 0,
      activities: 0,
      misc: 0,
    },
    paymentMethods: { cash: 0, card: 0 },
    // Transport data
    transport: {
      mode: "",
      duration: 0,
      scheduledDuration: 0,
      cost: 0,
      distance: 0,
      overnight: false,
    },
    // Accommodation data
    accommodation: {
      type: "",
      costPerNight: 0,
      amenities: [],
      locationRating: 5,
      sleepRating: 5,
      nights: 1,
    },
    // Time tracking
    daysInCity: 1,
    transitTime: 0,
    explorationTime: 0,
    // Experience analytics
    activities: [],
    crowdLevel: 3,
    accessibility: 5,
    culturalNotes: "",
    // Health & fitness
    stepsPerDay: 0,
    kmWalked: 0,
    altitude: 0,
    healthNotes: "",
    // Storytelling data
    socialEngagement: 0,
    favoriteMeal: "",
    newFoodTried: "",
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem("travelEntries");
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Save to localStorage whenever entries change
  useEffect(() => {
    try {
      const dataString = JSON.stringify(entries);
      // Check storage size (approximate)
      const dataSize = new Blob([dataString]).size;
      const maxSize = 4 * 1024 * 1024; // 4MB limit (conservative)
      
      if (dataSize > maxSize) {
        alert("Storage limit approaching. Consider reducing photo sizes or number of photos per entry.");
        return;
      }
      
      localStorage.setItem("travelEntries", dataString);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        alert("Storage full! Please remove some photos or entries to continue.");
        // Remove the last entry that caused the overflow
        setEntries(prev => prev.slice(0, -1));
      } else {
        console.error("Error saving to localStorage:", error);
      }
    }
  }, [entries]);

  const handleInputChange = (field, value) => {
    setCurrentEntry((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    
    // Check total photo limit per entry
    if (currentEntry.photos.length + files.length > 3) {
      alert("Maximum 3 photos per entry allowed. Please remove some photos first.");
      return;
    }
    
    files.forEach((file) => {
      // Check file size (limit to 5MB per photo)
      if (file.size > 5 * 1024 * 1024) {
        alert(`Photo "${file.name}" is too large. Please use photos under 5MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        // Create a canvas to resize the image
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 1200px width/height)
          const maxSize = 1200;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress the image
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
          
          const newPhoto = {
            id: Date.now() + Math.random(),
            url: compressedDataUrl,
            name: file.name,
            uploadDate: new Date().toISOString(),
          };
          
          setCurrentEntry((prev) => ({
            ...prev,
            photos: [...prev.photos, newPhoto],
          }));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (photoId) => {
    setCurrentEntry((prev) => ({
      ...prev,
      photos: prev.photos.filter((photo) => photo.id !== photoId),
    }));
  };

  const geocodeLocation = async (city, country) => {
    try {
      // Using OpenStreetMap Nominatim API (free alternative to Google Maps)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          city + ", " + country
        )}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
    } catch (error) {
      console.log("Geocoding failed:", error);
    }
    return { lat: null, lng: null };
  };

  const addExpense = () => {
    setCurrentEntry((prev) => ({
      ...prev,
      expenses: [...prev.expenses, { item: "", amount: "", currency: "USD" }],
    }));
  };

  const updateExpense = (index, field, value) => {
    setCurrentEntry((prev) => ({
      ...prev,
      expenses: prev.expenses.map((expense, i) =>
        i === index ? { ...expense, [field]: value } : expense
      ),
    }));
  };

  const removeExpense = (index) => {
    setCurrentEntry((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (
      !currentEntry.title ||
      !currentEntry.country ||
      !currentEntry.city
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Get coordinates for the location
    const coordinates = await geocodeLocation(
      currentEntry.city,
      currentEntry.country
    );

    if (editingEntry) {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === editingEntry.id
            ? { ...currentEntry, id: editingEntry.id, coordinates }
            : entry
        )
      );
      setEditingEntry(null);
    } else {
      const newEntry = {
        ...currentEntry,
        id: Date.now().toString(),
        coordinates,
        tags: currentEntry.tags.filter((tag) => tag.trim() !== ""),
      };
      setEntries((prev) => [newEntry, ...prev]);
    }

    resetForm();
  };

  const resetForm = () => {
    setCurrentEntry({
      id: "",
      date: new Date().toISOString().split("T")[0],
      country: "",
      city: "",
      title: "",
      description: "",
      photos: [],
      expenses: [],
      rating: 5,
      tags: [],
      coordinates: { lat: null, lng: null },
      // Financial tracking
      dailySpend: { usd: 0, local: 0, localCurrency: "USD" },
      expenseCategories: {
        transport: 0,
        lodging: 0,
        food: 0,
        activities: 0,
        misc: 0,
      },
      paymentMethods: { cash: 0, card: 0 },
      // Transport data
      transport: {
        mode: "",
        duration: 0,
        scheduledDuration: 0,
        cost: 0,
        distance: 0,
        overnight: false,
      },
      // Accommodation data
      accommodation: {
        type: "",
        costPerNight: 0,
        amenities: [],
        locationRating: 5,
        sleepRating: 5,
        nights: 1,
      },
      // Time tracking
      daysInCity: 1,
      transitTime: 0,
      explorationTime: 0,
      // Experience analytics
      activities: [],
      crowdLevel: 3,
      accessibility: 5,
      culturalNotes: "",
      // Health & fitness
      stepsPerDay: 0,
      kmWalked: 0,
      altitude: 0,
      healthNotes: "",
      // Storytelling data
      socialEngagement: 0,
      favoriteMeal: "",
      newFoodTried: "",
    });
    setShowForm(false);
  };

  const editEntry = (entry) => {
    setCurrentEntry(entry);
    setEditingEntry(entry);
    setShowForm(true);
  };

  const deleteEntry = (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "travel-log-backup.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedEntries = JSON.parse(e.target.result);
          setEntries(importedEntries);
          alert("Data imported successfully!");
        } catch (error) {
          alert("Error importing data. Please check the file format.");
        }
      };
      reader.readAsText(file);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterCountry === "" || entry.country === filterCountry;
    return matchesSearch && matchesFilter;
  });

  const countries = [...new Set(entries.map((entry) => entry.country))].sort();
  const totalExpenses = entries.reduce(
    (total, entry) =>
      total +
      entry.expenses.reduce(
        (entryTotal, expense) => entryTotal + (parseFloat(expense.amount) || 0),
        0
      ),
    0
  );

  const addTag = (tag) => {
    if (tag && !currentEntry.tags.includes(tag)) {
      setCurrentEntry((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setCurrentEntry((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Enhanced data visualization calculations
  const getFinancialAnalytics = () => {
    const countrySpending = {};
    const categoryTotals = {
      transport: 0,
      lodging: 0,
      food: 0,
      activities: 0,
      misc: 0,
    };
    const paymentMethodTotals = { cash: 0, card: 0 };

    entries.forEach((entry) => {
      // Country spending
      if (!countrySpending[entry.country]) {
        countrySpending[entry.country] = { usd: 0, local: 0, days: 0 };
      }
      countrySpending[entry.country].usd += entry.dailySpend?.usd || 0;
      countrySpending[entry.country].local += entry.dailySpend?.local || 0;
      countrySpending[entry.country].days += entry.daysInCity || 1;

      // Category spending
      if (entry.expenseCategories) {
        Object.keys(categoryTotals).forEach((category) => {
          categoryTotals[category] += entry.expenseCategories[category] || 0;
        });
      }

      // Payment methods
      if (entry.paymentMethods) {
        paymentMethodTotals.cash += entry.paymentMethods.cash || 0;
        paymentMethodTotals.card += entry.paymentMethods.card || 0;
      }
    });

    return {
      countrySpending: Object.entries(countrySpending).map(
        ([country, data]) => ({
          country,
          avgDailySpend: data.days > 0 ? (data.usd / data.days).toFixed(2) : 0,
          totalSpend: data.usd,
          days: data.days,
        })
      ),
      categoryBreakdown: Object.entries(categoryTotals).map(
        ([category, amount]) => ({
          category: category.charAt(0).toUpperCase() + category.slice(1),
          amount,
        })
      ),
      paymentMethods: [
        { method: "Cash", amount: paymentMethodTotals.cash },
        { method: "Card", amount: paymentMethodTotals.card },
      ],
    };
  };

  const getTransportAnalytics = () => {
    const transportModes = {};
    const transportStats = {
      totalDistance: 0,
      totalCost: 0,
      totalDuration: 0,
      totalDelay: 0,
      overnightCount: 0,
    };

    entries.forEach((entry) => {
      if (entry.transport) {
        const mode = entry.transport.mode || "Unknown";
        if (!transportModes[mode]) {
          transportModes[mode] = { count: 0, cost: 0, distance: 0 };
        }
        transportModes[mode].count += 1;
        transportModes[mode].cost += entry.transport.cost || 0;
        transportModes[mode].distance += entry.transport.distance || 0;

        transportStats.totalDistance += entry.transport.distance || 0;
        transportStats.totalCost += entry.transport.cost || 0;
        transportStats.totalDuration += entry.transport.duration || 0;
        transportStats.totalDelay += Math.max(
          0,
          (entry.transport.duration || 0) -
            (entry.transport.scheduledDuration || 0)
        );
        if (entry.transport.overnight) transportStats.overnightCount += 1;
      }
    });

    return {
      transportModes: Object.entries(transportModes).map(([mode, data]) => ({
        mode,
        count: data.count,
        totalCost: data.cost,
        avgCostPerKm:
          data.distance > 0 ? (data.cost / data.distance).toFixed(2) : 0,
      })),
      transportStats,
    };
  };

  const getAccommodationAnalytics = () => {
    const accommodationTypes = {};
    let totalNights = 0;
    let totalCost = 0;
    let avgSleepRating = 0;
    let avgLocationRating = 0;

    entries.forEach((entry) => {
      if (entry.accommodation) {
        const type = entry.accommodation.type || "Unknown";
        if (!accommodationTypes[type]) {
          accommodationTypes[type] = { count: 0, totalCost: 0, nights: 0 };
        }
        accommodationTypes[type].count += 1;
        accommodationTypes[type].totalCost +=
          (entry.accommodation.costPerNight || 0) *
          (entry.accommodation.nights || 1);
        accommodationTypes[type].nights += entry.accommodation.nights || 1;

        totalNights += entry.accommodation.nights || 1;
        totalCost +=
          (entry.accommodation.costPerNight || 0) *
          (entry.accommodation.nights || 1);
        avgSleepRating += entry.accommodation.sleepRating || 0;
        avgLocationRating += entry.accommodation.locationRating || 0;
      }
    });

    const entryCount = entries.filter((e) => e.accommodation).length;

    return {
      accommodationTypes: Object.entries(accommodationTypes).map(
        ([type, data]) => ({
          type,
          count: data.count,
          avgCostPerNight:
            data.nights > 0 ? (data.totalCost / data.nights).toFixed(2) : 0,
          totalNights: data.nights,
        })
      ),
      overallStats: {
        totalNights,
        avgCostPerNight:
          totalNights > 0 ? (totalCost / totalNights).toFixed(2) : 0,
        avgSleepRating:
          entryCount > 0 ? (avgSleepRating / entryCount).toFixed(1) : 0,
        avgLocationRating:
          entryCount > 0 ? (avgLocationRating / entryCount).toFixed(1) : 0,
      },
    };
  };

  const getHealthAnalytics = () => {
    let totalSteps = 0;
    let totalKmWalked = 0;
    let maxAltitude = 0;
    let minAltitude = Infinity;
    const altitudeChanges = [];

    entries.forEach((entry, index) => {
      totalSteps += entry.stepsPerDay || 0;
      totalKmWalked += entry.kmWalked || 0;

      if (entry.altitude) {
        maxAltitude = Math.max(maxAltitude, entry.altitude);
        if (minAltitude === Infinity) minAltitude = entry.altitude;
        else minAltitude = Math.min(minAltitude, entry.altitude);

        if (index > 0 && entries[index - 1].altitude) {
          altitudeChanges.push({
            from: entries[index - 1].city,
            to: entry.city,
            change: entry.altitude - entries[index - 1].altitude,
          });
        }
      }
    });

    return {
      totalSteps,
      totalKmWalked,
      avgStepsPerDay:
        entries.length > 0 ? Math.round(totalSteps / entries.length) : 0,
      avgKmPerDay:
        entries.length > 0 ? (totalKmWalked / entries.length).toFixed(1) : 0,
      altitudeRange: {
        max: maxAltitude,
        min: minAltitude === Infinity ? 0 : minAltitude,
      },
      significantAltitudeChanges: altitudeChanges.filter(
        (change) => Math.abs(change.change) > 1000
      ),
    };
  };

  const getTimeAnalytics = () => {
    let totalDays = 0;
    let totalTransitTime = 0;
    let totalExplorationTime = 0;
    const cityStays = {};

    entries.forEach((entry) => {
      const days = entry.daysInCity || 1;
      totalDays += days;
      totalTransitTime += entry.transitTime || 0;
      totalExplorationTime += entry.explorationTime || 0;

      if (!cityStays[entry.country]) {
        cityStays[entry.country] = { days: 0, cities: 0 };
      }
      cityStays[entry.country].days += days;
      cityStays[entry.country].cities += 1;
    });

    return {
      totalDays,
      avgStayPerCity:
        entries.length > 0 ? (totalDays / entries.length).toFixed(1) : 0,
      transitVsExplorationRatio: {
        transit:
          totalTransitTime + totalExplorationTime > 0
            ? Math.round(
                (totalTransitTime / (totalTransitTime + totalExplorationTime)) *
                  100
              )
            : 0,
        exploration:
          totalTransitTime + totalExplorationTime > 0
            ? Math.round(
                (totalExplorationTime /
                  (totalTransitTime + totalExplorationTime)) *
                  100
              )
            : 0,
      },
      countryStays: Object.entries(cityStays).map(([country, data]) => ({
        country,
        totalDays: data.days,
        avgDaysPerCity: (data.days / data.cities).toFixed(1),
        cities: data.cities,
      })),
    };
  };

  const getCountryData = () => {
    const countryStats = {};
    entries.forEach((entry) => {
      countryStats[entry.country] = (countryStats[entry.country] || 0) + 1;
    });
    return Object.entries(countryStats).map(([country, count]) => ({
      country,
      count,
    }));
  };

  const getRatingDistribution = () => {
    const ratings = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    entries.forEach((entry) => {
      ratings[entry.rating] = ratings[entry.rating] + 1;
    });
    return Object.entries(ratings).map(([rating, count]) => ({
      rating: `${rating}★`,
      count,
    }));
  };

  const getTagFrequency = () => {
    const tagCount = {};
    entries.forEach((entry) => {
      entry.tags.forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  };

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#FFC658",
    "#FF7C7C",
  ];

  const InteractiveMap = ({ entries }) => {
    const [mapLoaded, setMapLoaded] = useState(false);
    const validEntries = entries.filter(
      (entry) => entry.coordinates.lat && entry.coordinates.lng
    );

    useEffect(() => {
      // Dynamically load Leaflet CSS and JS
      if (!window.L && !mapLoaded) {
        const loadLeaflet = async () => {
          // Load CSS
          const cssLink = document.createElement("link");
          cssLink.rel = "stylesheet";
          cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          cssLink.integrity =
            "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
          cssLink.crossOrigin = "";
          document.head.appendChild(cssLink);

          // Load JS
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.integrity =
            "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
          script.crossOrigin = "";

          script.onload = () => {
            setMapLoaded(true);
          };

          document.head.appendChild(script);
        };

        loadLeaflet();
      } else if (window.L) {
        setMapLoaded(true);
      }
    }, [mapLoaded]);

    useEffect(() => {
      if (mapLoaded && window.L && validEntries.length > 0) {
        // Remove existing map if any
        const existingMap = document.getElementById("travel-map");
        if (existingMap) {
          existingMap.innerHTML = "";
        }

        // Calculate bounds for all markers
        const bounds = window.L.latLngBounds(
          validEntries.map((entry) => [
            entry.coordinates.lat,
            entry.coordinates.lng,
          ])
        );

        // Create map
        const map = window.L.map("travel-map").fitBounds(bounds, {
          padding: [20, 20],
        });

        // Add tile layer
        window.L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution: "© OpenStreetMap contributors",
          }
        ).addTo(map);

        // Add markers for each entry
        validEntries.forEach((entry, index) => {
          const marker = window.L.marker([
            entry.coordinates.lat,
            entry.coordinates.lng,
          ]).addTo(map);

          // Create popup content
          const popupContent = `
            <div style="min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${
                entry.title
              }</h3>
              <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
                <strong>${entry.city}, ${entry.country}</strong>
              </p>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #888;">
                ${new Date(entry.date).toLocaleDateString()}
              </p>
              <div style="margin: 0 0 8px 0;">
                ${"★".repeat(entry.rating)}${"☆".repeat(5 - entry.rating)}
              </div>
              <p style="margin: 0; font-size: 13px; max-height: 60px; overflow-y: auto;">
                ${entry.description.substring(0, 100)}${
            entry.description.length > 100 ? "..." : ""
          }
              </p>
              ${
                entry.tags.length > 0
                  ? `
                <div style="margin-top: 8px;">
                  ${entry.tags
                    .map(
                      (tag) =>
                        `<span style="background: #e3f2fd; color: #1976d2; padding: 2px 6px; border-radius: 12px; font-size: 11px; margin-right: 4px;">${tag}</span>`
                    )
                    .join("")}
                </div>
              `
                  : ""
              }
            </div>
          `;

          marker.bindPopup(popupContent);

          // Auto-open first popup
          if (index === 0) {
            marker.openPopup();
          }
        });

        // Add a polyline connecting all points in chronological order
        if (validEntries.length > 1) {
          const sortedEntries = [...validEntries].sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          );
          const routeCoordinates = sortedEntries.map((entry) => [
            entry.coordinates.lat,
            entry.coordinates.lng,
          ]);

          window.L.polyline(routeCoordinates, {
            color: "#ff6b6b",
            weight: 3,
            opacity: 0.7,
            dashArray: "10, 10",
          }).addTo(map);
        }
      }
    }, [mapLoaded, validEntries]);

    if (validEntries.length === 0) {
      return (
        <div className="text-center py-8">
          <Navigation className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">
            No location data available yet. Add some travel entries with cities!
          </p>
        </div>
      );
    }

    if (!mapLoaded) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading interactive map...</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Navigation size={20} className="text-blue-600" />
            <h3 className="font-semibold text-blue-800">Your Travel Route</h3>
          </div>
          <p className="text-blue-700 text-sm mb-2">
            🗺️ Interactive map showing your journey with markers for each
            location. Click on markers to see details!
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              📍 {validEntries.length} locations
            </span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              🛣️ Route shown with dashed line
            </span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              🔍 Zoom and pan enabled
            </span>
          </div>
        </div>

        <div
          id="travel-map"
          style={{
            height: "500px",
            width: "100%",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {validEntries
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map((entry, index) => (
              <div
                key={entry.id}
                className="bg-white border rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <h4 className="font-semibold">
                    {entry.city}, {entry.country}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">{entry.title}</p>
                <div className="text-xs text-gray-500 mb-2">
                  <p>{new Date(entry.date).toLocaleDateString()}</p>
                  <p>
                    Lat: {entry.coordinates.lat?.toFixed(4)}, Lng:{" "}
                    {entry.coordinates.lng?.toFixed(4)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-yellow-500 text-sm">
                    {"★".repeat(entry.rating)}
                    {"☆".repeat(5 - entry.rating)}
                  </span>
                  {entry.photos.length > 0 && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Camera size={12} />
                      {entry.photos.length}
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-3 sm:gap-4 flex-1">
              <img
                src="/poliworld-logo.png"
                alt="PoliWorld Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h1
                  className="text-2xl sm:text-3xl font-bold text-left        
               bg-gradient-to-r from-purple-600 via-blue-600 
               to-green-500 bg-clip-text text-transparent mb-1 sm:mb-2"
                >
                  PoliWorld
                </h1>
                <p className="text-gray-600 flex items-center gap-1 sm:gap-2 text-sm sm:text-base flex-wrap">
                  <img
                    src="https://flagcdn.com/16x12/mx.png"
                    alt="Mexico flag"
                    className="inline"
                  />
                  Mexico to
                  <img
                    src="https://flagcdn.com/16x12/br.png"
                    alt="Brazil flag"
                    className="inline"
                  />
                  Brazil 🎒
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center lg:justify-end">
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 hover:bg-blue-700 transition-colors text-sm sm:text-base flex-1 sm:flex-none justify-center"
              >
                <Plus size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden xs:inline">Add Entry</span>
                <span className="xs:hidden">Add</span>
              </button>
              <button
                onClick={() => setShowStats(true)}
                className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 hover:bg-purple-700 transition-colors text-sm sm:text-base flex-1 sm:flex-none justify-center"
              >
                <BarChart3 size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden xs:inline">Analytics</span>
                <span className="xs:hidden">Stats</span>
              </button>
              <button
                onClick={() => setShowMap(true)}
                className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 hover:bg-green-700 transition-colors text-sm sm:text-base flex-1 sm:flex-none justify-center"
              >
                <MapPin size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden xs:inline">Map View</span>
                <span className="xs:hidden">Map</span>
              </button>
              <button
                onClick={exportData}
                className="bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 hover:bg-orange-700 transition-colors text-sm sm:text-base flex-1 sm:flex-none justify-center"
              >
                <Download size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden xs:inline">Export</span>
                <span className="xs:hidden">Export</span>
              </button>
              <label className="bg-teal-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-1 sm:gap-2 hover:bg-teal-700 transition-colors cursor-pointer text-sm sm:text-base flex-1 sm:flex-none justify-center">
                <Upload size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden xs:inline">Import</span>
                <span className="xs:hidden">Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-3 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <MapPin className="text-blue-600 flex-shrink-0" size={20} />
              <div className="min-w-0">
                <p className="text-gray-600 text-xs sm:text-sm">Total Entries</p>
                <p className="text-lg sm:text-2xl font-bold">{entries.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="text-green-600 flex-shrink-0" size={20} />
              <div className="min-w-0">
                <p className="text-gray-600 text-xs sm:text-sm">Countries Visited</p>
                <p className="text-lg sm:text-2xl font-bold">{countries.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="text-purple-600" size={24} />
              <div>
                <p className="text-gray-600 text-sm">Total Expenses</p>
                <p className="text-2xl font-bold">
                  ${totalExpenses.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-6">
            <div className="flex items-center gap-3">
              <Navigation className="text-orange-600" size={24} />
              <div>
                <p className="text-gray-600 text-sm">Total Distance</p>
                <p className="text-2xl font-bold">
                  {entries.reduce(
                    (total, entry) => total + (entry.transport?.distance || 0),
                    0
                  ).toLocaleString()} km
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <Filter
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Countries</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Analytics Modal */}
        {showStats && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-6xl max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Travel Analytics</h2>
                <button
                  onClick={() => setShowStats(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-96 overflow-y-auto">
                {/* Financial Analytics */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <DollarSign size={20} />
                    Financial Breakdown
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPieChart>
                      <Pie
                        data={getFinancialAnalytics().categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="amount"
                        label={false}
                      >
                        {getFinancialAnalytics().categoryBreakdown.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}`, "Amount"]} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>

                {/* Daily Spending by Country */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin size={20} />
                    Daily Spending by Country
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={getFinancialAnalytics().countrySpending}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="country" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`${value}`, "Avg Daily"]}
                      />
                      <Bar dataKey="avgDailySpend" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Transport Modes */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Navigation size={20} />
                    Transport Analysis
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {getTransportAnalytics().transportModes.map(
                      ({ mode, count, totalCost, avgCostPerKm }) => (
                        <div
                          key={mode}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="font-medium capitalize">{mode}</span>
                          <div className="text-right">
                            <div>
                              {count} trips, ${totalCost}
                            </div>
                            <div className="text-xs text-gray-500">
                              ${avgCostPerKm}/km
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Distance:</span>
                        <div className="font-semibold">
                          {getTransportAnalytics().transportStats.totalDistance}{" "}
                          km
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Overnight Trips:</span>
                        <div className="font-semibold">
                          {
                            getTransportAnalytics().transportStats
                              .overnightCount
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accommodation Analysis */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar size={20} />
                    Accommodation Stats
                  </h3>
                  <div className="space-y-3">
                    {getAccommodationAnalytics().accommodationTypes.map(
                      ({ type, count, avgCostPerNight, totalNights }) => (
                        <div
                          key={type}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="font-medium capitalize">{type}</span>
                          <div className="text-right">
                            <div>
                              {count} stays, {totalNights} nights
                            </div>
                            <div className="text-xs text-gray-500">
                              ${avgCostPerNight}/night avg
                            </div>
                          </div>
                        </div>
                      )
                    )}
                    <div className="pt-3 border-t grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Avg Sleep Rating:</span>
                        <div className="font-semibold">
                          {
                            getAccommodationAnalytics().overallStats
                              .avgSleepRating
                          }
                          /10
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Cost/Night:</span>
                        <div className="font-semibold">
                          $
                          {
                            getAccommodationAnalytics().overallStats
                              .avgCostPerNight
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Analysis */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp size={20} />
                    Time Analysis
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Days:</span>
                        <div className="font-semibold">
                          {getTimeAnalytics().totalDays}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Stay/City:</span>
                        <div className="font-semibold">
                          {getTimeAnalytics().avgStayPerCity} days
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">
                        Transit vs Exploration:
                      </span>
                      <div className="flex mt-1">
                        <div
                          className="bg-red-400 h-4 flex items-center justify-center text-xs text-white"
                          style={{
                            width: `${
                              getTimeAnalytics().transitVsExplorationRatio
                                .transit
                            }%`,
                          }}
                        >
                          {getTimeAnalytics().transitVsExplorationRatio.transit}
                          %
                        </div>
                        <div
                          className="bg-green-400 h-4 flex items-center justify-center text-xs text-white"
                          style={{
                            width: `${
                              getTimeAnalytics().transitVsExplorationRatio
                                .exploration
                            }%`,
                          }}
                        >
                          {
                            getTimeAnalytics().transitVsExplorationRatio
                              .exploration
                          }
                          %
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>Transit</span>
                        <span>Exploration</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Health & Fitness */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 size={20} />
                    Health & Fitness
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Steps:</span>
                      <div className="font-semibold">
                        {getHealthAnalytics().totalSteps.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Km Walked:</span>
                      <div className="font-semibold">
                        {getHealthAnalytics().totalKmWalked} km
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Steps/Day:</span>
                      <div className="font-semibold">
                        {getHealthAnalytics().avgStepsPerDay.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Km/Day:</span>
                      <div className="font-semibold">
                        {getHealthAnalytics().avgKmPerDay} km
                      </div>
                    </div>
                  </div>
                  {getHealthAnalytics().altitudeRange.max > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <span className="text-gray-600 text-sm">
                        Altitude Range:
                      </span>
                      <div className="font-semibold">
                        {getHealthAnalytics().altitudeRange.min}m -{" "}
                        {getHealthAnalytics().altitudeRange.max}m
                      </div>
                      {getHealthAnalytics().significantAltitudeChanges.length >
                        0 && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-600">
                            Major Altitude Changes:
                          </span>
                          {getHealthAnalytics().significantAltitudeChanges.map(
                            (change, index) => (
                              <div key={index} className="text-xs">
                                {change.from} → {change.to}:{" "}
                                {change.change > 0 ? "+" : ""}
                                {change.change}m
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Modal */}
        {showMap && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Travel Map</h2>
                <button
                  onClick={() => setShowMap(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <InteractiveMap entries={entries} />
            </div>
          </div>
        )}

        {/* Entry Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                {editingEntry ? "Edit Entry" : "Add New Entry"}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={currentEntry.date}
                      onChange={(e) =>
                        handleInputChange("date", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating
                    </label>
                    <select
                      value={currentEntry.rating}
                      onChange={(e) =>
                        handleInputChange("rating", parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                          {"★".repeat(num) + "☆".repeat(5 - num)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      value={currentEntry.country}
                      onChange={(e) =>
                        handleInputChange("country", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Mexico"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={currentEntry.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Mexico City"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={currentEntry.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Amazing Day at Teotihuacan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={currentEntry.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your experience, what you did, who you met..."
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photos
                  </label>
                  <div className="mb-3">
                    <label className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 flex items-center gap-2 w-fit">
                      <Camera size={16} />
                      Upload Photos
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {currentEntry.photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {currentEntry.photos.map((photo) => (
                        <div key={photo.id} className="relative">
                          <img
                            src={photo.url}
                            alt={photo.name}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(photo.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {currentEntry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add a tag..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag(e.target.value);
                          e.target.value = "";
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[
                      "Food",
                      "Beach",
                      "Jiu-jitsu",
                      "Date",
                      "Nightlife",
                      "Tattoo",
                      "Adventure",
                      "Scenic Spot",
                    ].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Financial Tracking */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    💰 Financial Tracking
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Daily Spend (USD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentEntry.dailySpend?.usd || ""}
                        onChange={(e) =>
                          handleInputChange("dailySpend", {
                            ...currentEntry.dailySpend,
                            usd: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Local Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentEntry.dailySpend?.local || ""}
                        onChange={(e) =>
                          handleInputChange("dailySpend", {
                            ...currentEntry.dailySpend,
                            local: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Local Currency
                      </label>
                      <select
                        value={currentEntry.dailySpend?.localCurrency || "USD"}
                        onChange={(e) =>
                          handleInputChange("dailySpend", {
                            ...currentEntry.dailySpend,
                            localCurrency: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="USD">USD</option>
                        <option value="MXN">Mexican Peso</option>
                        <option value="NIO">Nicaraguan Córdoba</option>
                        <option value="CRC">Costa Rican Colón</option>
                        <option value="PAB">Panamanian Balboa</option>
                        <option value="COP">Colombian Peso</option>
                        <option value="USD">Ecuadorian Dollar</option>
                        <option value="PEN">Peruvian Sol</option>
                        <option value="BOB">Bolivian Boliviano</option>
                        <option value="PYG">Paraguayan Guaraní</option>
                        <option value="CLP">Chilean Peso</option>
                        <option value="ARS">Argentine Peso</option>
                        <option value="UYU">Uruguayan Peso</option>
                        <option value="BRL">Brazilian Real</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transport ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentEntry.expenseCategories?.transport || ""}
                        onChange={(e) =>
                          handleInputChange("expenseCategories", {
                            ...currentEntry.expenseCategories,
                            transport: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lodging ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentEntry.expenseCategories?.lodging || ""}
                        onChange={(e) =>
                          handleInputChange("expenseCategories", {
                            ...currentEntry.expenseCategories,
                            lodging: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Food ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentEntry.expenseCategories?.food || ""}
                        onChange={(e) =>
                          handleInputChange("expenseCategories", {
                            ...currentEntry.expenseCategories,
                            food: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Activities ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentEntry.expenseCategories?.activities || ""}
                        onChange={(e) =>
                          handleInputChange("expenseCategories", {
                            ...currentEntry.expenseCategories,
                            activities: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Misc ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentEntry.expenseCategories?.misc || ""}
                        onChange={(e) =>
                          handleInputChange("expenseCategories", {
                            ...currentEntry.expenseCategories,
                            misc: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cash Spent ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentEntry.paymentMethods?.cash || ""}
                        onChange={(e) =>
                          handleInputChange("paymentMethods", {
                            ...currentEntry.paymentMethods,
                            cash: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Spent ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentEntry.paymentMethods?.card || ""}
                        onChange={(e) =>
                          handleInputChange("paymentMethods", {
                            ...currentEntry.paymentMethods,
                            card: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Transport Data */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    🚍 Transport Data
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transport Mode
                      </label>
                      <select
                        value={currentEntry.transport?.mode || ""}
                        onChange={(e) =>
                          handleInputChange("transport", {
                            ...currentEntry.transport,
                            mode: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Mode</option>
                        <option value="bus">Bus</option>
                        <option value="flight">Flight</option>
                        <option value="ferry">Ferry</option>
                        <option value="rideshare">Rideshare</option>
                        <option value="walk">Walk</option>
                        <option value="train">Train</option>
                        <option value="taxi">Taxi</option>
                        <option value="rental-car">Rental Car</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cost ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentEntry.transport?.cost || ""}
                        onChange={(e) =>
                          handleInputChange("transport", {
                            ...currentEntry.transport,
                            cost: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Distance (km)
                      </label>
                      <input
                        type="number"
                        value={currentEntry.transport?.distance || ""}
                        onChange={(e) =>
                          handleInputChange("transport", {
                            ...currentEntry.transport,
                            distance: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (hours)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={currentEntry.transport?.duration || ""}
                        onChange={(e) =>
                          handleInputChange("transport", {
                            ...currentEntry.transport,
                            duration: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Scheduled Duration (hours)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={currentEntry.transport?.scheduledDuration || ""}
                        onChange={(e) =>
                          handleInputChange("transport", {
                            ...currentEntry.transport,
                            scheduledDuration: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={currentEntry.transport?.overnight || false}
                          onChange={(e) =>
                            handleInputChange("transport", {
                              ...currentEntry.transport,
                              overnight: e.target.checked,
                            })
                          }
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Overnight Journey
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Accommodation Data */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    🏨 Accommodation Data
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={currentEntry.accommodation?.type || ""}
                        onChange={(e) =>
                          handleInputChange("accommodation", {
                            ...currentEntry.accommodation,
                            type: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Type</option>
                        <option value="hostel">Hostel</option>
                        <option value="airbnb">Airbnb</option>
                        <option value="hotel">Hotel</option>
                        <option value="guesthouse">Guesthouse</option>
                        <option value="camping">Camping</option>
                        <option value="couchsurfing">Couchsurfing</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cost/Night ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={currentEntry.accommodation?.costPerNight || ""}
                        onChange={(e) =>
                          handleInputChange("accommodation", {
                            ...currentEntry.accommodation,
                            costPerNight: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nights
                      </label>
                      <input
                        type="number"
                        value={currentEntry.accommodation?.nights || 1}
                        onChange={(e) =>
                          handleInputChange("accommodation", {
                            ...currentEntry.accommodation,
                            nights: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sleep Rating (1-10)
                      </label>
                      <select
                        value={currentEntry.accommodation?.sleepRating || 5}
                        onChange={(e) =>
                          handleInputChange("accommodation", {
                            ...currentEntry.accommodation,
                            sleepRating: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <option key={num} value={num}>
                            {num} -{" "}
                            {num <= 3
                              ? "Poor"
                              : num <= 6
                              ? "OK"
                              : num <= 8
                              ? "Good"
                              : "Excellent"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Expenses
                    </label>
                    <button
                      type="button"
                      onClick={addExpense}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Add Expense
                    </button>
                  </div>
                  {currentEntry.expenses.map((expense, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Item"
                        value={expense.item}
                        onChange={(e) =>
                          updateExpense(index, "item", e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        value={expense.amount}
                        onChange={(e) =>
                          updateExpense(index, "amount", e.target.value)
                        }
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={expense.currency}
                        onChange={(e) =>
                          updateExpense(index, "currency", e.target.value)
                        }
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="USD">USD</option>
                        <option value="MXN">MXN</option>
                        <option value="NIO">NIO</option>
                        <option value="CRC">CRC</option>
                        <option value="PAB">PAB</option>
                        <option value="COP">COP</option>
                        <option value="USD">USD (Ecuador)</option>
                        <option value="PEN">PEN</option>
                        <option value="BOB">BOB</option>
                        <option value="PYG">PYG</option>
                        <option value="CLP">CLP</option>
                        <option value="ARS">ARS</option>
                        <option value="UYU">UYU</option>
                        <option value="BRL">BRL</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeExpense(index)}
                        className="text-red-600 hover:text-red-800 px-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingEntry ? "Update Entry" : "Save Entry"}
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      setEditingEntry(null);
                    }}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Entries List */}
        <div className="space-y-6">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 text-lg">
                No travel entries yet. Start documenting your journey!
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Entry
              </button>
            </div>
          ) : (
            filteredEntries
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((entry, index) => (
              <div key={entry.id} className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start mb-4 gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="bg-blue-600 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                          {filteredEntries.length - index}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                          {entry.title}
                        </h3>
                      </div>
                      <div className="flex gap-2 xl:hidden">
                        <button
                          onClick={() => editEntry(entry)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 mb-2 text-sm sm:text-base">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {entry.city}, {entry.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                      <span className="text-yellow-500">
                        {"★".repeat(entry.rating)}
                        {"☆".repeat(5 - entry.rating)}
                      </span>
                    </div>
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-gray-700 text-left text-sm mb-3 xl:mb-0">{entry.description}</p>
                  </div>
                  
                  {/* Photos Display - responsive layout */}
                  {entry.photos && entry.photos.length > 0 && (
                    <div className="w-full xl:w-auto xl:ml-4 xl:flex-shrink-0">
                      {/* Mobile/Tablet: horizontal scroll */}
                      <div className="xl:hidden">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {entry.photos.map((photo) => (
                            <div key={photo.id} className="relative group flex-shrink-0">
                              <img
                                src={photo.url}
                                alt={photo.name}
                                className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded border hover:opacity-75 transition-opacity cursor-pointer"
                                onClick={() => window.open(photo.url, "_blank")}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                                <Camera
                                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  size={16}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Desktop: side display */}
                      <div className="hidden xl:block">
                        <div className="flex gap-2">
                          {entry.photos.slice(0, 3).map((photo) => (
                            <div key={photo.id} className="relative group">
                              <img
                                src={photo.url}
                                alt={photo.name}
                                className="w-48 h-48 object-cover rounded border hover:opacity-75 transition-opacity cursor-pointer"
                                onClick={() => window.open(photo.url, "_blank")}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                                <Camera
                                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  size={20}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        {entry.photos.length > 3 && (
                          <p className="text-xs text-gray-500 mt-1 text-center">
                            +{entry.photos.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="hidden xl:flex gap-2 ml-2">
                    <button
                      onClick={() => editEntry(entry)}
                      className="text-blue-600 hover:text-blue-800 p-2"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {entry.expenses.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <DollarSign size={16} />
                      Expenses
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {entry.expenses.map((expense, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm bg-gray-50 px-3 py-2 rounded"
                        >
                          <span>{expense.item}</span>
                          <span className="font-medium">
                            {expense.amount} {expense.currency}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="text-right mt-2 font-semibold text-gray-800">
                      Total: $
                      {entry.expenses
                        .reduce(
                          (sum, expense) =>
                            sum + (parseFloat(expense.amount) || 0),
                          0
                        )
                        .toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelLogApp;

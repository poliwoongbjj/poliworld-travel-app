import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Calendar, DollarSign, MapPin, Star, TrendingUp, Plane, Car, Home, Heart, Activity, Clock, Target } from 'lucide-react';

const TravelStatistics = ({ entries }) => {
  // Color palette for charts
  const colors = {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    purple: '#8B5CF6',
    rose: '#F43F5E',
    teal: '#14B8A6'
  };

  const chartColors = [colors.primary, colors.secondary, colors.accent, colors.purple, colors.rose, colors.teal];

  // Calculate spending over time
  const spendingOverTime = useMemo(() => {
    if (entries.length === 0) return [];

    const monthlyData = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthYear,
          monthName: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
          spending: 0,
          trips: 0
        };
      }
      
      monthlyData[monthYear].spending += entry.expenses || 0;
      monthlyData[monthYear].trips += 1;
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }, [entries]);

  // Calculate countries visited distribution
  const countriesData = useMemo(() => {
    if (entries.length === 0) return [];

    const countryCount = {};
    entries.forEach(entry => {
      countryCount[entry.country] = (countryCount[entry.country] || 0) + 1;
    });

    return Object.entries(countryCount)
      .map(([country, count]) => ({ country, trips: count }))
      .sort((a, b) => b.trips - a.trips)
      .slice(0, 10); // Top 10 countries
  }, [entries]);

  // Calculate rating distribution
  const ratingsData = useMemo(() => {
    if (entries.length === 0) return [];

    const ratingCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    entries.forEach(entry => {
      ratingCount[entry.rating] = (ratingCount[entry.rating] || 0) + 1;
    });

    return Object.entries(ratingCount).map(([rating, count]) => ({
      rating: `${rating} Star${rating > 1 ? 's' : ''}`,
      count,
      percentage: ((count / entries.length) * 100).toFixed(1)
    }));
  }, [entries]);

  // Calculate trips by year
  const tripsByYear = useMemo(() => {
    if (entries.length === 0) return [];

    const yearData = {};
    entries.forEach(entry => {
      const year = new Date(entry.date).getFullYear();
      if (!yearData[year]) {
        yearData[year] = { year, trips: 0, spending: 0, avgRating: 0, totalRating: 0 };
      }
      yearData[year].trips += 1;
      yearData[year].spending += entry.expenses || 0;
      yearData[year].totalRating += entry.rating;
    });

    return Object.values(yearData)
      .map(data => ({
        ...data,
        avgRating: Number((data.totalRating / data.trips).toFixed(1))
      }))
      .sort((a, b) => a.year - b.year);
  }, [entries]);

  // Calculate enhanced metrics
  const metrics = useMemo(() => {
    if (entries.length === 0) return { 
      totalSpending: 0, avgTripCost: 0, totalCountries: 0, avgRating: 0,
      totalDays: 0, totalDistance: 0, avgSteps: 0, overnightJourneys: 0,
      cashVsCard: { cash: 0, card: 0 }, avgSleepRating: 0
    };

    const totalSpending = entries.reduce((sum, entry) => sum + (entry.expenses || 0), 0);
    const totalCountries = new Set(entries.map(entry => entry.country)).size;
    const avgRating = entries.reduce((sum, entry) => sum + entry.rating, 0) / entries.length;
    const avgTripCost = totalSpending / entries.length;
    
    // Enhanced metrics
    const totalDays = entries.reduce((sum, entry) => sum + (entry.timeTracking?.daysSpent || 1), 0);
    const totalDistance = entries.reduce((sum, entry) => sum + (entry.transport?.distanceKm || 0), 0);
    const totalSteps = entries.reduce((sum, entry) => sum + (entry.health?.stepsPerDay || 0), 0);
    const avgSteps = totalSteps / entries.length;
    const overnightJourneys = entries.filter(entry => entry.transport?.overnight).length;
    
    const totalCash = entries.reduce((sum, entry) => sum + (entry.paymentMethods?.cash || 0), 0);
    const totalCard = entries.reduce((sum, entry) => sum + (entry.paymentMethods?.card || 0), 0);
    
    const sleepRatings = entries.filter(entry => entry.accommodation?.sleepRating);
    const avgSleepRating = sleepRatings.length > 0 
      ? sleepRatings.reduce((sum, entry) => sum + entry.accommodation.sleepRating, 0) / sleepRatings.length 
      : 0;

    return {
      totalSpending,
      avgTripCost,
      totalCountries,
      avgRating: Number(avgRating.toFixed(1)),
      totalDays,
      totalDistance,
      avgSteps: Math.round(avgSteps),
      overnightJourneys,
      cashVsCard: { cash: totalCash, card: totalCard },
      avgSleepRating: Number(avgSleepRating.toFixed(1))
    };
  }, [entries]);

  // Transport analysis
  const transportAnalysis = useMemo(() => {
    if (entries.length === 0) return [];

    const transportData = {};
    entries.forEach(entry => {
      if (entry.transport?.mode) {
        const mode = entry.transport.mode;
        if (!transportData[mode]) {
          transportData[mode] = {
            mode,
            count: 0,
            totalDistance: 0,
            totalCost: 0,
            delays: 0
          };
        }
        transportData[mode].count += 1;
        transportData[mode].totalDistance += entry.transport.distanceKm || 0;
        transportData[mode].totalCost += (entry.transport.costPerKm || 0) * (entry.transport.distanceKm || 0);
        
        if ((entry.transport.duration || 0) > (entry.transport.scheduledDuration || 0)) {
          transportData[mode].delays += 1;
        }
      }
    });

    return Object.values(transportData);
  }, [entries]);

  // Accommodation analysis
  const accommodationAnalysis = useMemo(() => {
    if (entries.length === 0) return [];

    const accomData = {};
    entries.forEach(entry => {
      if (entry.accommodation?.type) {
        const type = entry.accommodation.type;
        if (!accomData[type]) {
          accomData[type] = {
            type,
            count: 0,
            totalCost: 0,
            avgSleepRating: 0,
            totalSleepRating: 0
          };
        }
        accomData[type].count += 1;
        accomData[type].totalCost += entry.accommodation.costPerNight || 0;
        accomData[type].totalSleepRating += entry.accommodation.sleepRating || 0;
      }
    });

    return Object.values(accomData).map(item => ({
      ...item,
      avgCostPerNight: item.totalCost / item.count,
      avgSleepRating: item.totalSleepRating / item.count
    }));
  }, [entries]);

  // Expense breakdown analysis
  const expenseBreakdownData = useMemo(() => {
    if (entries.length === 0) return [];

    const breakdown = {
      transport: 0,
      lodging: 0,
      food: 0,
      activities: 0,
      misc: 0
    };

    entries.forEach(entry => {
      if (entry.expenseBreakdown) {
        Object.keys(breakdown).forEach(key => {
          breakdown[key] += entry.expenseBreakdown[key] || 0;
        });
      }
    });

    return Object.entries(breakdown).map(([category, amount]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      amount,
      percentage: ((amount / Object.values(breakdown).reduce((a, b) => a + b, 0)) * 100).toFixed(1)
    })).filter(item => item.amount > 0);
  }, [entries]);

  // Health and fitness data
  const healthFitnessData = useMemo(() => {
    if (entries.length === 0) return [];

    return entries.map(entry => ({
      location: `${entry.city}, ${entry.country}`,
      steps: entry.health?.stepsPerDay || 0,
      kmWalked: entry.health?.kmWalked || 0,
      altitude: entry.health?.altitudeChange || 0,
      date: entry.date
    })).filter(item => item.steps > 0 || item.kmWalked > 0 || item.altitude !== 0);
  }, [entries]);

  // Experience quality radar data
  const experienceRadarData = useMemo(() => {
    if (entries.length === 0) return [];

    const avgMetrics = {
      'Overall Rating': 0,
      'Crowd Level': 0,
      'Accessibility': 0,
      'Sleep Quality': 0,
      'Location Rating': 0
    };

    let validEntries = 0;
    entries.forEach(entry => {
      if (entry.rating) {
        avgMetrics['Overall Rating'] += entry.rating;
        avgMetrics['Crowd Level'] += entry.experience?.crowdLevel || 0;
        avgMetrics['Accessibility'] += entry.experience?.accessibility || 0;
        avgMetrics['Sleep Quality'] += entry.accommodation?.sleepRating || 0;
        avgMetrics['Location Rating'] += entry.accommodation?.amenities?.locationRating || 0;
        validEntries++;
      }
    });

    if (validEntries === 0) return [];

    return Object.entries(avgMetrics).map(([subject, value]) => ({
      subject,
      value: Number((value / validEntries).toFixed(1))
    }));
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-gray-500 font-medium">No data to visualize</p>
          <p className="text-gray-400 text-sm">Add some travel entries to see statistics!</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.name.includes('$') || entry.name.includes('Spending') ? `$${entry.value.toFixed(2)}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-lg font-bold text-gray-900">${metrics.totalSpending.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Countries</p>
              <p className="text-lg font-bold text-gray-900">{metrics.totalCountries}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Days</p>
              <p className="text-lg font-bold text-gray-900">{metrics.totalDays}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-lg font-bold text-gray-900">{metrics.avgRating}/5</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Target className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Distance</p>
              <p className="text-lg font-bold text-gray-900">{metrics.totalDistance.toFixed(0)}km</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Activity className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg Steps</p>
              <p className="text-lg font-bold text-gray-900">{metrics.avgSteps.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Plane className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Overnight</p>
              <p className="text-lg font-bold text-gray-900">{metrics.overnightJourneys}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Home className="w-5 h-5 text-teal-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Sleep Quality</p>
              <p className="text-lg font-bold text-gray-900">{metrics.avgSleepRating}/10</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Spending Over Time */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Spending Over Time
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={spendingOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="monthName" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="spending"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Countries Visited */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-green-600" />
            Most Visited Countries
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={countriesData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="country" tick={{ fontSize: 12 }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="trips" fill={colors.secondary} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-600" />
            Rating Distribution
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={ratingsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ rating, percentage }) => `${rating} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {ratingsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trips by Year */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Travel Activity by Year
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={tripsByYear}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="trips" fill={colors.accent} name="Number of Trips" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgRating"
                  stroke={colors.rose}
                  strokeWidth={3}
                  dot={{ fill: colors.rose, strokeWidth: 2, r: 4 }}
                  name="Average Rating"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Enhanced Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Expense Breakdown Pie Chart */}
        {expenseBreakdownData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Expense Categories
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={expenseBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {expenseBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
                    labelFormatter={(label) => `Category: ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Transport Analysis */}
        {transportAnalysis.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Car className="w-5 h-5 mr-2 text-blue-600" />
              Transport Usage
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={transportAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mode" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'totalDistance') return [`${value.toFixed(1)} km`, 'Distance'];
                      if (name === 'totalCost') return [`$${value.toFixed(2)}`, 'Cost'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" fill={colors.primary} name="Count" />
                  <Bar dataKey="totalDistance" fill={colors.secondary} name="Distance (km)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Accommodation Analysis */}
        {accommodationAnalysis.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Home className="w-5 h-5 mr-2 text-purple-600" />
              Accommodation Types
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <ComposedChart data={accommodationAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'avgCostPerNight') return [`$${value.toFixed(2)}`, 'Avg Cost/Night'];
                      if (name === 'avgSleepRating') return [`${value.toFixed(1)}/10`, 'Sleep Rating'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill={colors.accent} name="Nights" />
                  <Line yAxisId="right" type="monotone" dataKey="avgSleepRating" stroke={colors.rose} strokeWidth={3} name="Sleep Rating" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Health & Fitness Tracking */}
        {healthFitnessData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-600" />
              Health & Fitness
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <ComposedChart data={healthFitnessData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="location" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'steps') return [value.toLocaleString(), 'Steps'];
                      if (name === 'kmWalked') return [`${value} km`, 'Distance Walked'];
                      if (name === 'altitude') return [`${value} m`, 'Altitude Change'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="steps" fill={colors.teal} name="Steps" />
                  <Line yAxisId="right" type="monotone" dataKey="altitude" stroke={colors.purple} strokeWidth={2} name="Altitude Change (m)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>

      {/* Experience Quality Radar Chart */}
      {experienceRadarData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-600" />
            Overall Experience Quality
          </h3>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <RadarChart data={experienceRadarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Rating"
                  dataKey="value"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip 
                  formatter={(value) => [`${value}/5`, 'Rating']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Payment Methods Analysis */}
      {(metrics.cashVsCard.cash > 0 || metrics.cashVsCard.card > 0) && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Payment Methods Usage
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Cash', value: metrics.cashVsCard.cash, fill: colors.accent },
                    { name: 'Card', value: metrics.cashVsCard.card, fill: colors.primary }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                  outerRadius={80}
                  dataKey="value"
                />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Enhanced Travel Insights */}
      {entries.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">📈 Enhanced Travel Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            {spendingOverTime.length > 1 && (
              <div className="bg-white/50 p-3 rounded-lg">
                <p className="font-medium text-gray-700">Most Expensive Month</p>
                <p className="text-blue-600">
                  {spendingOverTime.reduce((max, month) => month.spending > max.spending ? month : max).monthName} 
                  (${spendingOverTime.reduce((max, month) => month.spending > max.spending ? month : max).spending.toFixed(2)})
                </p>
              </div>
            )}
            
            <div className="bg-white/50 p-3 rounded-lg">
              <p className="font-medium text-gray-700">Best Rated Country</p>
              <p className="text-purple-600">
                {entries.reduce((best, entry) => entry.rating > best.rating ? entry : best).country}
                ({entries.reduce((best, entry) => entry.rating > best.rating ? entry : best).rating}/5 ⭐)
              </p>
            </div>

            {transportAnalysis.length > 0 && (
              <div className="bg-white/50 p-3 rounded-lg">
                <p className="font-medium text-gray-700">Favorite Transport</p>
                <p className="text-green-600">
                  {transportAnalysis.reduce((max, mode) => mode.count > max.count ? mode : max).mode.charAt(0).toUpperCase() + transportAnalysis.reduce((max, mode) => mode.count > max.count ? mode : max).mode.slice(1)}
                  ({transportAnalysis.reduce((max, mode) => mode.count > max.count ? mode : max).count} times)
                </p>
              </div>
            )}

            {accommodationAnalysis.length > 0 && (
              <div className="bg-white/50 p-3 rounded-lg">
                <p className="font-medium text-gray-700">Preferred Stay</p>
                <p className="text-orange-600">
                  {accommodationAnalysis.reduce((max, type) => type.count > max.count ? type : max).type.charAt(0).toUpperCase() + accommodationAnalysis.reduce((max, type) => type.count > max.count ? type : max).type.slice(1)}
                  ({accommodationAnalysis.reduce((max, type) => type.count > max.count ? type : max).count} nights)
                </p>
              </div>
            )}

            {metrics.totalDistance > 0 && (
              <div className="bg-white/50 p-3 rounded-lg">
                <p className="font-medium text-gray-700">Daily Travel Average</p>
                <p className="text-red-600">
                  {(metrics.totalDistance / metrics.totalDays).toFixed(1)} km/day
                </p>
              </div>
            )}

            {expenseBreakdownData.length > 0 && (
              <div className="bg-white/50 p-3 rounded-lg">
                <p className="font-medium text-gray-700">Biggest Expense</p>
                <p className="text-teal-600">
                  {expenseBreakdownData.reduce((max, cat) => cat.amount > max.amount ? cat : max).category}
                  (${expenseBreakdownData.reduce((max, cat) => cat.amount > max.amount ? cat : max).amount.toFixed(2)})
                </p>
              </div>
            )}

            {metrics.avgSteps > 0 && (
              <div className="bg-white/50 p-3 rounded-lg">
                <p className="font-medium text-gray-700">Fitness Level</p>
                <p className="text-indigo-600">
                  {metrics.avgSteps >= 10000 ? '🏃‍♂️ Very Active' : metrics.avgSteps >= 7500 ? '🚶‍♂️ Active' : metrics.avgSteps >= 5000 ? '📱 Moderate' : '🛋️ Low Activity'}
                  ({metrics.avgSteps.toLocaleString()} steps)
                </p>
              </div>
            )}

            {metrics.cashVsCard.cash + metrics.cashVsCard.card > 0 && (
              <div className="bg-white/50 p-3 rounded-lg">
                <p className="font-medium text-gray-700">Payment Preference</p>
                <p className="text-yellow-600">
                  {metrics.cashVsCard.cash > metrics.cashVsCard.card ? '💵 Cash' : '💳 Card'} 
                  ({((Math.max(metrics.cashVsCard.cash, metrics.cashVsCard.card) / (metrics.cashVsCard.cash + metrics.cashVsCard.card)) * 100).toFixed(0)}%)
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelStatistics;
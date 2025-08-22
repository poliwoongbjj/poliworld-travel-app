# 🐼 PoliWorld Travel Log

> ** 🎒 Mexico 🇲🇽 to Brazil 🇧🇷 **

Track expenses, map your journey, and gain insights into your travel patterns across Latin America.

![Status](https://img.shields.io/badge/Status-Active%20Development-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

## ✨ Features

### 📊 **Comprehensive Analytics**
- **Financial Tracking**: Daily spending, expense categories, payment methods
- **Transport Analysis**: Mode preferences, costs per km, delay tracking
- **Accommodation Insights**: Type preferences, cost analysis, sleep quality ratings
- **Health & Fitness**: Step counting, walking distance, altitude tracking
- **Interactive Charts**: Pie charts, bar graphs, line charts with Recharts

### 🗺️ **Interactive Mapping**
- **Route Visualization**: See your complete journey with connected waypoints
- **Location Markers**: Interactive pins with detailed entry information
- **Geocoding**: Automatic coordinate lookup for cities and countries
- **Dynamic Loading**: Efficient Leaflet integration

### 💰 **Financial Management**
- **Multi-Currency Support**: Track expenses in USD and local currencies
- **Expense Categories**: Transport, lodging, food, activities, miscellaneous
- **Payment Method Tracking**: Cash vs card usage analysis
- **Budget Insights**: Daily spending patterns and country comparisons

### 📱 **Mobile-First Design**
- **Responsive Layout**: Optimized for all screen sizes
- **Touch-Friendly**: Mobile-optimized buttons and interactions
- **Flexible Grids**: Adaptive layouts for different devices

### 🎯 **Smart Data Management**
- **Local Storage**: Automatic data persistence
- **Import/Export**: JSON backup and restore functionality
- **Search & Filter**: Advanced filtering by country, rating, dates
- **Photo Management**: Upload, compress, and organize travel photos

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/poliwoongbjj/poliworld-travel-log.git
cd poliworld-travel-log
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Start the development server**
```bash
npm start
# or
yarn start
```

4. **Open your browser**
Navigate to `http://localhost:3000`

## 📋 Usage Guide

### Adding Your First Entry

1. **Click "Add Entry"** in the header
2. **Fill in basic information**:
   - Date, country, city, title
   - Description and rating (1-5 stars)
   - Upload photos and add tags

3. **Track your finances** (Optional):
   - Daily spending in USD and local currency
   - Break down expenses by category
   - Record payment methods used

4. **Log transport details** (Optional):
   - Transport mode (bus, flight, etc.)
   - Cost, distance, and duration
   - Mark overnight journeys

5. **Record accommodation** (Optional):
   - Type (hostel, Airbnb, hotel, etc.)
   - Cost per night and number of nights
   - Rate sleep quality and location

6. **Save your entry** and watch it appear on your journey!

### Viewing Your Data

- **Grid View**: Browse all entries in a card layout
- **Map View**: See your journey plotted on an interactive map
- **Analytics**: Dive deep into your travel patterns and spending

### Managing Your Data

- **Search**: Find entries by location, title, or description
- **Filter**: Filter by country or minimum rating
- **Export**: Download your data as JSON for backup
- **Import**: Restore data from a backup file

## 🛠️ Technical Stack

### Core Technologies
- **React 18**: Modern React with hooks and functional components
- **JavaScript ES6+**: Modern JavaScript features
- **CSS3**: Responsive design with Flexbox and Grid
- **Local Storage API**: Client-side data persistence

### Key Libraries
- **Recharts**: Data visualization and charting
- **Leaflet**: Interactive mapping (dynamically loaded)
- **Lucide React**: Beautiful, consistent icons
- **OpenStreetMap**: Free mapping tiles and geocoding

### External APIs
- **Nominatim (OpenStreetMap)**: Free geocoding service for location coordinates
- No API keys required - fully functional out of the box!

## 📁 Project Structure

```
src/
├── TravelLogApp.js        # Main application component
├── TravelMap.js           # Interactive map component  
├── TravelStatistics.js    # Analytics and charts component
├── index.js              # Application entry point
└── index.css             # Global styles

public/
├── index.html
├── poliworld-logo.png    # App logo
└── manifest.json         # PWA manifest (future)
```

### Component Architecture

```
TravelLogApp (Main)
├── Header (Logo, Navigation, Actions)
├── Stats Dashboard (Key Metrics)
├── Search & Filters
├── Entry Form Modal
│   ├── Basic Info Tab
│   ├── Financial Tab  
│   ├── Transport Tab
│   ├── Accommodation Tab
│   └── Health & Experience Tab
├── Analytics Modal
│   ├── Financial Charts
│   ├── Transport Analysis
│   ├── Accommodation Stats
│   └── Health Tracking
├── Map Modal (TravelMap)
└── Entry Grid (Cards)
```

## 🎨 Features Deep Dive

### Analytics Dashboard
The analytics system provides comprehensive insights into your travel patterns:

- **Financial Analytics**: Track spending patterns across countries and categories
- **Transport Metrics**: Analyze your preferred transportation methods and efficiency
- **Accommodation Preferences**: Understand your lodging choices and satisfaction
- **No-Gi Jiu-jitsu**: Train at different gyms throughout the journey
- **Time Analysis**: See how you balance transit time vs exploration

### Interactive Mapping
The mapping system uses Leaflet for rich interactivity:

- **Auto-Geocoding**: Automatically finds coordinates for cities
- **Route Visualization**: Shows your journey path chronologically  
- **Rich Popups**: Detailed information cards for each location
- **Responsive Design**: Works seamlessly on mobile devices

### Data Management
Robust data handling ensures your travel memories are preserved:

- **Automatic Saving**: All changes saved to localStorage immediately
- **Backup & Restore**: JSON export/import for data portability
- **Migration Support**: Automatic upgrading of older data formats
- **Error Handling**: Graceful fallbacks for missing or corrupted data

## 🌟 Supported Countries & Currencies

The app is optimized for Latin American travel with support for:

### Countries
🇲🇽 Mexico → 🇳🇮 Nicaragua → 🇨🇷 Costa Rica → 🇵🇦 Panama → 🇨🇴 Colombia → 🇪🇨 Ecuador → 🇵🇪 Peru → 🇧🇴 Bolivia → 🇵🇾 Paraguay → 🇨🇱 Chile → 🇦🇷 Argentina → 🇺🇾 Uruguay → 🇧🇷 Brazil

### Currencies
- Mexican Peso (MXN)
- Nicaraguan Córdoba (NIO)  
- Costa Rican Colón (CRC)
- Panamanian Balboa (PAB)
- Colombian Peso (COP)
- US Dollar (USD) - Ecuador
- Peruvian Sol (PEN)
- Bolivian Boliviano (BOB)
- Paraguayan Guaraní (PYG)
- Chilean Peso (CLP)
- Argentine Peso (ARS)
- Uruguayan Peso (UYU)
- Brazilian Real (BRL)

## 📊 Sample Data Structure

```json
{
  "id": "1645123456789",
  "date": "2024-03-15",
  "country": "Mexico",
  "city": "Mexico City",
  "title": "Amazing Day at Teotihuacan",
  "description": "Explored the ancient pyramids...",
  "rating": 5,
  "tags": ["history", "pyramids", "culture"],
  "photos": [...],
  "coordinates": { "lat": 19.4326, "lng": -99.1332 },
  "dailySpend": { "usd": 45, "local": 900, "localCurrency": "MXN" },
  "expenseCategories": {
    "transport": 15,
    "lodging": 20,
    "food": 8,
    "activities": 2,
    "misc": 0
  },
  "transport": {
    "mode": "bus",
    "cost": 15,
    "distance": 50,
    "duration": 1.5,
    "overnight": false
  },
  "accommodation": {
    "type": "hostel",
    "costPerNight": 20,
    "nights": 1,
    "sleepRating": 8
  },
  "health": {
    "stepsPerDay": 12000,
    "kmWalked": 8.5,
    "altitude": 2240
  }
}
```

## 🚧 Roadmap

### 🏃‍♂️ Short Term (1-2 months)
- [ ] **Progressive Web App (PWA)**: Offline support and mobile installation
- [ ] **Cloud Sync**: Firebase/Supabase integration for cross-device access
- [ ] **Photo Gallery**: Lightbox modal for better photo viewing
- [ ] **PDF Export**: Generate travel reports with photos and charts
- [ ] **Enhanced Search**: Date ranges, expense filters, advanced tag search

### 🏔️ Medium Term (3-6 months)  
- [ ] **Trip Planning**: Budget planning and progress tracking
- [ ] **Social Sharing**: Share entries and trips on social media
- [ ] **Collaboration**: Multi-user trip planning and sharing
- [ ] **Real-time Currency**: Live exchange rate integration
- [ ] **Advanced Analytics**: Predictive insights and recommendations

### 🚀 Long Term (6+ months)
- [ ] **AI Insights**: Machine learning for travel optimization
- [ ] **Community Features**: Connect with other travelers
- [ ] **Route Optimization**: Suggest optimal travel routes
- [ ] **Integration APIs**: Connect with booking platforms
- [ ] **Mobile App**: Native iOS/Android applications

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Areas for Contribution
- 🐛 **Bug fixes**: Help improve stability
- ✨ **New features**: Add functionality from the roadmap
- 🎨 **UI/UX**: Improve design and user experience  
- 📱 **Mobile**: Enhance mobile responsiveness
- 🌐 **Accessibility**: Improve accessibility compliance
- 📚 **Documentation**: Improve docs and examples

### Code Style
- Use functional React components with hooks
- Follow ESLint configuration
- Write descriptive commit messages
- Add comments for complex logic
- Ensure mobile responsiveness

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenStreetMap** for free mapping services and geocoding
- **Recharts** for beautiful data visualization
- **Leaflet** for interactive mapping capabilities
- **Lucide** for the comprehensive icon set
- **React Community** for the amazing ecosystem

## 📞 Support

### Getting Help
- 📖 Check the documentation in this README
- 🐛 [Report bugs](https://github.com/poliwoongbjj/poliworld-travel-log/issues)
- 💡 [Request features](https://github.com/poliwoongbjj/poliworld-travel-log/issues)
- 💬 Join discussions in Issues

### FAQ

**Q: Is my data safe?**
A: Yes! All data is stored locally in your browser. No external servers involved.

**Q: Can I use this for other regions?**
A: Absolutely! While optimized for Latin America, it works worldwide.

**Q: Do I need internet to use the app?**
A: Currently yes, but offline support is coming in the PWA update.

**Q: Can I export my data?**
A: Yes! Use the Export button to download your data as JSON.

---

<div align="center">

**Happy travels! 🌎✈️**

사랑으로 만든 ❤️ for digital nomads and long-term travelers

[⬆ Back to top](#-poliworld-travel-log)

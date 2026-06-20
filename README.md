# Karni Air Courier & Logistics

A premium, modern logistics portal for **Karni Air Courier & Logistics**. The web platform showcases franchise courier partnerships and provides clients with a seamless tracking redirection interface to check order status instantly.

## 🚀 Key Features
- **Modern UI/UX:** Dark-mode-first aesthetic inspired by Delhivery's clean grids, gradients, and micro-animations.
- **Smart Tracking Router:** Directs clients to official tracking servers for **Delhivery, DTDC, Shree Mahabali Express, and Mark Express** based on their tracking code.
- **Service Directory:** Showcases air, surface, and local express delivery options.
- **Franchise Partner Grid:** Interactive hover-cards showcasing premium brand affiliations.
- **Interactive Rate Estimator:** Lightweight JS calculator allowing customers to calculate estimated rates based on shipment weight and category.
- **Responsive Layout:** Optimized for Mobile, Tablet, and Desktop displays.

---

## 🛠️ Tech Stack Options

### Option A: Pure Static (Recommended)
- **Frontend:** HTML5, Vanilla CSS3 (Custom Grid & HSL Variables), JavaScript (ES6+).
- **Hosting:** Free tier on GitHub Pages, Netlify, or Vercel.

### Option B: Flask Backend
- **Backend:** Python 3.x, Flask.
- **Hosting:** Render, Heroku, AWS.

---

## 📁 File Structure
```text
Karni_Website/
├── logo.png             # Company Brand Logo (Existing)
├── index.html           # Main Landing Page & Layout
├── index.css            # Stylesheets (Gradients, Glassmorphism, Responsive Grid)
├── app.js               # Logic, Tracking Redirection & Estimates
├── requirements.txt     # Python Dependencies
└── README.md            # Project Documentation (This file)
```

---

## 📡 Tracking Redirection Engine
When a user enters a tracking number, they select their carrier. The JavaScript route engine redirects them:

| Courier Partner | Redirection URL Target |
| :--- | :--- |
| **Delhivery** | `https://www.delhivery.com/track/package/{AWB}` |
| **DTDC** | `https://www.dtdc.in/tracking/track-your-shipment.html` |
| **Shree Mahabali Express** | `https://www.trackingmore.com/shree-mahabali-express-tracking.html?number={AWB}` (Aggregator tracking for seamless status view) |
| **Mark Express** | `https://www.trackingmore.com/mark-express-tracking.html?number={AWB}` (Aggregator tracking for seamless status view) |

---

## 💻 Local Execution

### Running Static Option:
Double click the `index.html` file to run directly in the browser, or use Python's built-in simple HTTP server:
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000`.

### Running Python/Flask Option:
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start development server:
   ```bash
   python -m flask run --port 5000
   ```
3. Navigate to `http://127.0.0.1:5000`.

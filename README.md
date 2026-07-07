# SpyLancer: High-Performance Ads Spy Platform

SpyLancer is a high-performance platform designed for ad research and analysis using a microservices architecture built with Node.js. It offers extreme scalability, stealth, and ease of maintenance.

## 🏗️ System Architecture

The project is divided into specialized microservices that communicate over a dedicated Docker network.

### Entry Point & Orchestration
- **Gateway** (Port 8000): Central API Gateway. Orchestrates the extraction pipeline and proxies Auth/Tracking requests.

### Core Intelligence Services
- **Ads Collector** (Port 3001): Playwright-based service for fetching raw HTML from Meta/TikTok Ads Libraries.
- **Ads Parser** (Port 3002): Normalizes raw HTML into structured ad objects using Cheerio.
- **Store Detector** (Port 3003): Heuristic engine to detect e-commerce platforms (Shopify, YouCan, Woo).
- **Product Extractor** (Port 3004): Extracts product pricing, names, and images from landing pages.

### Support Services
- **Auth Service** (Port 3007): JWT-based authentication and user management.
- **Tracking Engine** (Port 3005): Ad persistence, favorite management, and CRUD operations.
- **Analytics Engine** (Port 3006): Heuristic scaling scores and performance trends.

## 🚀 Getting Started

Ensure you have Docker and Docker Compose installed.

### 1. Build and Start the Ecosystem
```bash
docker compose up --build -d
```

### 2. Accessing the Platform
- **Frontend**: `http://localhost:3000`
- **Gateway API**: `http://localhost:8000/api`

## 🛠️ Tech Stack
- **Runtime**: Node.js 20 (Alpine)
- **Scraping**: Playwright (Headless)
- **Parsing**: Cheerio
- **Database**: MongoDB
- **Caching**: Redis
- **Communication**: REST / JSON

---
*Developed with love for high-scale ad research.*
# Over The Top — Premium Outdoor Footwear

A premium e-commerce website for high-performance outdoor footwear, built as a Web Development group project.

**Live site:** [https://alexcovi1.github.io/Over_the_top_project/](https://alexcovi1.github.io/Over_the_top_project/)

## Team Information
**Team name:** 16

**Team members:**
- Alexander Covi
- Andrea Di Guglielmo
- Aurora Roilo
- Emilio Barns

**Figma prototype:**
[View on Figma](https://www.figma.com/design/LN7Z7kGIWxc1rB2f31B9xA/Website-Prototype--Community-?node-id=302-2&p=f&t=2ok3l4AEDLsN6NrY-0)

## Overview
Over The Top is a fully functional, client-side e-commerce website for premium hiking, running, and trail shoes. It features 9 products across 3 categories, a complete shopping cart and checkout flow, a multi-account system with animal avatars, and an animated, responsive design.

## Pages

| Page | Description |
|------|-------------|
| `index.html` | Homepage with hero section, featured products, and category navigation |
| `hiking.html` | Hiking shoes category page |
| `running.html` | Running shoes category page |
| `trail.html` | Trail shoes category page |
| `newCollection.html` | New collection showcase |
| `product-*.html` | 9 individual product detail pages with image galleries |
| `compare.html` | Side-by-side product comparison tool |
| `payment.html` | Checkout page with order summary and payment form |
| `account.html` | Login, registration, and profile management |
| `dashboard.html` | User dashboard with order history, wishlist, and stats |
| `about.html` | Brand story and mission |
| `contact.html` | Contact form |

## Features

### Shopping
- Product catalog with 9 shoes across Hiking, Running, and Trail categories
- Add to cart with size selection and quantity
- Cart sidebar with live item count badge
- Side-by-side product comparison tool
- Full checkout flow with order summary and simulated payment
- Order history and loyalty points system

### Account System
- Multi-account support (up to 10 accounts) with per-account data isolation
- Login, registration, and profile editing (name, email, password)
- All cart, wishlist, orders, and points data namespaced per user via localStorage

### Animal Avatar & Theme System
- 5 spirit animal avatars to choose from: Fox, Panda, Owl, Bunny, Parrot
- Each animal transforms the site's color scheme, cursor particles, and personality
- Animal avatar displayed in profile and dashboard

### Design & UX
- Responsive design for desktop and mobile
- Magnetic cursor with animated golden particles
- Branded loading animation
- Ambient sound modes (Wind, Rain, Forest)
- Scroll-reveal animations
- Navbar with logo dropdown menu, category navigation, and mobile hamburger menu

## Folder Structure
```
├── index.html
├── about.html
├── account.html
├── compare.html
├── contact.html
├── dashboard.html
├── hiking.html
├── newCollection.html
├── payment.html
├── running.html
├── trail.html
├── product-summit-explorer.html
├── product-mountain-guardian.html
├── product-trail-voyager.html
├── product-marathon-elite.html
├── product-urban-pace.html
├── product-tempo-racer.html
├── product-mountain-grip.html
├── product-rock-climber.html
├── product-summit-apex.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── images/
│   └── (product and hero images)
└── README.md
```

## Technologies
- HTML5
- CSS3 (custom properties, Flexbox, Grid, animations)
- Vanilla JavaScript (no frameworks)
- localStorage / sessionStorage for persistence
- Google Fonts (Playfair Display, Inter)

## Usage
1. Open `index.html` in your browser to view the homepage.
2. Navigate using the menu to explore other pages.
3. Customize styles in `css/style.css` and scripts in `js/app.js` as needed.

## Customization
- Add new images to the `images/` folder
- Update content in HTML files for each activity or collection
- Extend functionality in `js/app.js`

## Contact
For questions or feedback, use the `contact.html` page.

---
Feel free to modify and expand the project to suit your needs!

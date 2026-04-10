# Store Rating Platform

A full-stack web application that allows users to explore stores and submit ratings (1–5). The system includes role-based access control for Admin, Normal Users, and Store Owners.

## Features

### Authentication
* Secure signup and login using JWT
* Role-based access control

### Normal User
* Register and login
* View all stores
* Search stores by name and address
* Submit and update ratings (1–5)

### Admin
* Add new users and stores
* View dashboard with:
  * Total users
  * Total stores
  * Total ratings
* View and filter users and stores

### Store Owner
* View users who rated their store
* View average rating

---

## Tech Stack
* **Frontend:** React.js
* **Backend:** Node.js, Express.js
* **Database:** MySQL (Sequelize ORM)
* **Authentication:** JWT
* **Styling:** Tailwind CSS / Bootstrap

---

## 📊 Database Design
* Users (Admin, User, Store Owner)
* Stores
* Ratings (1 user → 1 rating per store)

---

## Test Credentials

### Admin
* Email: [admin@example.com](mailto:admin@example.com)
* Password: Admin@123

### User
* Email: [user@example.com](mailto:user@example.com)
* Password: User@123

### Store Owner
* Email: [owner@example.com](mailto:owner@example.com)
* Password: Owner@123



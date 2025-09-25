## 📒 KhataBook Clone – Personal Expense Tracker

A full-stack expense and debt tracking app inspired by KhataBook. Users can manage personal "Hisaabs" (records), protect them with passwords, view weekly reports, and more.

---

### 💠 Tech Stack

* **Backend**: Node.js, Express.js
* **Frontend**: EJS, Tailwind CSS
* **Database**: MongoDB (Atlas)
* **Authentication**: JWT, bcrypt
* **Deployment**: Render / Railway (suggested)
* **Features**:

  * User Signup/Login
  * Create/Read/Update/Delete Hisaabs
  * Password-protected Hisaabs (Encryption)
  * Dynamic Key-Value Expense Entries
  * Responsive UI with Tailwind CSS
  * Optional Weekly Reports and Reminders
  * Light/Dark Theme Toggle

---

### 📁 Folder Structure

```
├── models/
│   └── User.js
│   └── Hisaab.js
├── views/
│   └── create.ejs
│   └── home.ejs
│   └── unlock.ejs
│   └── single.ejs
├── routes/
│   └── auth.js
│   └── hisaab.js
├── public/
│   └── styles.css
├── app.js
├── .env
└── README.md
```

---

### 📌 Features

#### 🔐 Authentication

* Secure JWT login system with hashed passwords (using `bcrypt`).
* Login route stores JWT in HTTP-only cookie.

#### 📊 Hisaab Management

* Create Hisaab: Title, dynamic key-value entries, labels, encryption (optional).
* Read all Hisaabs (only for logged-in user).
* View single Hisaab (`/hisaab/:id`).
* Unlock password-protected Hisaabs via `/unlock/:id`.
* Update or delete Hisaabs.

#### 🎨 UI & UX

* Responsive card layout using Tailwind CSS.
* Date, label, and encryption status displayed on each Hisaab card.
* Light/Dark mode support.

#### 🗖️ Optional Add-ons

* Weekly report generation (planned).
* SMS reminders (can use Twilio).
* Built-in calculator (optional button).

---

### 🧶 Sample `.env` file

```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/khatabook
JWT_SECRET=your_jwt_secret
```

---

### 🚀 How to Run Locally

```bash
git clone https://github.com/your-username/khatabook-clone.git
cd khatabook-clone
npm install
npm start
```

Then open `http://localhost:3000`

---

### 📤 Deployment

Deploy on:

* [Render](https://render.com/)
* [Railway](https://railway.app/)
* [Vercel](https://vercel.com/) (for static frontend)
* [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

### 🔐 Sample Routes

| Route                | Method | Description              |
| -------------------- | ------ | ------------------------ |
| `/register`          | POST   | Register new user        |
| `/login`             | POST   | Login and set JWT cookie |
| `/hisaab/create`     | POST   | Create new hisaab        |
| `/hisaab/:id`        | GET    | View single hisaab       |
| `/unlock/:id`        | POST   | Unlock encrypted hisaab  |
| `/hisaab/:id/edit`   | POST   | Update existing hisaab   |
| `/hisaab/:id/delete` | POST   | Delete a hisaab          |

---

### 🧠 Ideas for Future Features

* PDF Export of Hisaabs
* Category-wise filtering
* Graph reports (Chart.js)
* SMS/email reminders
* Recurring entries
* Sharing Hisaabs with others

---



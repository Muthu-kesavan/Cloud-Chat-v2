# ☁️📱🗨️ CloudChat

[![MERN](https://img.shields.io/badge/Stack-MERN-green)](https://developer.mozilla.org/en-US/docs/Glossary/MERN)
[![JavaScript](https://img.shields.io/badge/Language-JavaScript-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![React](https://img.shields.io/badge/Frontend-React-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-orange)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)](https://www.mongodb.com/)


> **Cloud-Chat** is a feature-rich social media platform that allows users to communicate in **one-on-one** and **group chats**, **share images, videos, files, location and text messages**, and securely sign up with **OTP verification**. Users can also engage with **posts** through likes, comments, and replies for better connectivity.


## ✨ Features

- 🔐 **OTP Signup**: Secure the signup process with One-Time Password (OTP) for authentication.
- 🔒 **One-on-One Chats**: Private conversations between users.
- 👥 **Group Chats**: Create or join group chats to collaborate and share content.
- 🖼️ **File & Media Sharing**: Share images, documents, and files seamlessly within chats.
- 📍 **Location Sharing**: Share your location within one-on-one and group chats for better context and connectivity.

- 📅 **Real-Time Messaging**: Instant, real-time communication using WebSockets.
- 💬 **Responsive UI**: Designed for an optimal device experience.
- 📸 **Social Media Features**: 
  - Share images, videos, and texts as post.
  - Like, comment, and reply to posts for enhanced interaction.
  - Save and share posts with existing users and others.


## 🚀 Tech Stack

| Technology     | Description                                     |
| -------------- | ----------------------------------------------- |
| **MongoDB**    | NoSQL database for storing user and chat data.  |
| **Express.js** | Backend framework for routing and APIs.         |
| **React**      | Frontend library for building user interfaces.  |
| **Node.js**    | JavaScript runtime for backend logic.           |
| **Socket.IO**  | Real-time bi-directional event-based communication. |
| **JWT**        | Secure authentication using JSON Web Tokens.    |
| **Nodemailer**    | Email service for OTP delivery.                 |
| **Multer**    |    Handling file uploads and storage.             |

## 🎨 Screenshots

**Signup Page**
![Signup Page](https://github.com/user-attachments/assets/8c276987-77ef-47e9-be0d-9decd1c5d60b)

**Login Page**
![Login Page](https://github.com/user-attachments/assets/e1c4e805-258f-4086-9191-cf85a14d6d83)

**HomePage**
![Home Page](https://github.com/user-attachments/assets/1891ebe3-0d63-459c-8f8f-2aa717f281b9)

**Profile Page**
![Profile Page](https://github.com/user-attachments/assets/981da823-70da-45d3-b874-d9bd041249e9)

## 📽 Demo Video

[![Watch the demo video](https://github.com/user-attachments/assets/1891ebe3-0d63-459c-8f8f-2aa717f281b9)](https://github.com/user-attachments/assets/b145e58a-d621-4ec1-be1d-f00c30bd8c9a)

## 🔧 Installation

1. Clone the repository:

   ```bash
   https://github.com/Muthu-kesavan/Cloud-Chat.git
   cd CloudChat
   ```
2. Install server Dependencies:

   ```bash
   cd server
   npm install
   ```
3. Install Client Dependencies:

   ```bash
   cd ../client
   npm install
   ```
4. Set up your `.env` files with the necessary credentials:

    ```bash
    Server env

    PORT="Your PORT"
    JWT="Your JWT SecretKey"
    ORIGIN="Your LocalHost"
    DATABASE_URL="MongoDb URL"
    SMTP_USER="Nodemailer email"
    SMTP_PASSWORD="Nodemailer Password"

    Client env
    VITE_SERVER_URL="Your local Host"
    ```
5. Start both frontend and backend servers:

    ```bash
    # Start server
    cd server
    npm run dev

    # Start client
    cd ../client
    npm run dev
    ```
6. Open the link created in the `Client Terminal` to view in Browser.

## 🛡️ Security Features

- **OTP Authentication**: Provides a layer of security during user sign-up.
- **JWT Authentication**: Ensures secure user login and session management.
- **Password Hashing**: User passwords are hashed with bcrypt for protection.

## 🗂️ Project Structure

```bash
CloudChat/
├── /client
│   ├── /src
│   │   ├── /components      # All components used in the app
│   │   ├── /context         # Frontend socket setup
│   │   ├── /lib
│   │   │   ├── api-client   # API client setup
│   │   │   └── utils.js     # Utility functions for client-side logic
│   │   ├── /pages           # All pages of the app (Login, Signup, etc.)
│   │   ├── /store           # Zustand store for state management
│   │   └── /utils
│   │       └── constant.js  # Frontend routes and constants
│   ├── app.jsx              # Main app file
│   └── index.jsx            # Entry point for the frontend
│
├── /server
│   ├── /controllers         # API request handlers (e.g., user, chat controllers)
│   ├── /middleware          # Authentication, authorization, and other middleware
│   ├── /models              # Mongoose schemas (Users, Chats, Messages)
│   ├── /routes              # API routes for users, chats, messages
│   ├── /uploads             # Directory to store uploaded files (images, docs)
│   ├── index.js             # Entry point for the backend
│   └── socket.js            # Socket.IO server for real-time communication
│
└── README.md                # Project README file
```
## 🛠️ API Endpoints

### Auth Routes
- `POST /api/auth/signup`: Register new users using OTP verification.
- `POST /api/auth/login`: Log in users using JWT.
- `POST /api/auth/verify-otp`: Verify OTP for user registration.
- `GET /api/auth/user-info`: Fetch user information.
- `POST /api/auth/update-profile`: Update user profile information.
- `POST /api/auth/upload-image`: Upload user profile image.
- `POST /api/auth/remove-image`: Remove user profile image.
- `POST /api/auth/logout`: Log out the user.
- `GET /api/auth/find/userId` : Fetch the Single User Info. 

### Contact Routes
- `GET /api/contacts/search`: Search for contacts.
- `GET /api/contacts/get-contacts-for-dm`: Fetch direct message contacts.
- `GET /api/contacts/get-all-contacts`: Fetch all contacts.

### Message Routes
- `GET /api/messages/get-messages`: Fetch chat messages.
- `POST /api/messages/upload`: Upload and share files in chats.

### Channel Routes
- `POST /api/channel/create-channel`: Create a new channel.
- `GET /api/channel/get-user-channels`: Fetch user channels.
- `GET /api/channel/channel-messages`: Fetch messages from a specific channel.

### Post Routes
- `POST /api/post/post`: Create a new Post.
- `GET /api/post/postId`: Fetch the Single Post. 
- `DELETE /api/post/postId`: Delete a post.
- `PATCH /api/post/postId/like`: Like a Post.
- `PUT /api/post/postId/reply`: Reply to a post.
-  `GET /api/post/postId/Comment`: Fetch the post Comments.
-  `GET /api/post/feed`: Fetch all posts.
-  `PATCH /api/post/postId/save`: Save the Post.
-  `POST /api/post/postId/share`: Share the Post.
-  `GET /api/post/saved`: Fetch saved Posts.
- `GET /api/post/myPost`: Fetch User post.



## 📬 Contact
Feel free to reach out if you have any questions or suggestions!

- **Email**: muthukesavan6044@gmail.com
- **LinkedIn**: [muthu-kesavan-s](https://www.linkedin.com/in/muthu-kesavan-s/)

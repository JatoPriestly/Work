# Jongo E-Auth

This project is a Next.js application designed for employee authentication and management.

## Features

*   **Firebase Authentication:** Implemented email and password authentication for admin users using Firebase Auth.
*   **API Routes:** Dedicated API endpoint for user sign-in (`/api/auth/signin`).

## Getting Started

### Prerequisites

*   Node.js (LTS recommended)
*   pnpm (or npm/yarn)
*   Firebase Project: Ensure you have a Firebase project set up with Authentication enabled (Email/Password provider).

### Installation

1.  Clone the repository:
    ```bash
    git clone <your-repo-url>
    cd jongo-e-auth
    ```
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  **Firebase Configuration:**
    Ensure your Firebase configuration is correctly set up in `lib/firebase.ts`. The `firebaseDetails.txt` file contains the necessary details.

### Running the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication

### Admin Sign-in

An API route `/api/auth/signin` is available for email and password authentication.

**Example Client-Side Usage:**

```typescript
// Example: components/LoginForm.tsx
"use client"

import React, { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Login successful! User UID: ${data.uid}`);
        // Handle successful login (e.g., redirect, store session)
      } else {
        setMessage(`Login failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setMessage('An unexpected error occurred.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Next Steps for Authentication

*   **Session Management:** Implement robust session management (e.g., using Firebase ID tokens, NextAuth.js, or custom cookies) to maintain user login state.
*   **Route Protection:** Secure admin-only routes and components based on user authentication status.
*   **Sign Out:** Add functionality for users to sign out.
*   **User Management:** Implement features for creating and managing admin users (e.g., through a dedicated admin panel or Firebase console).

## Deployment

This project is configured for deployment on [Vercel](https://vercel.com).

### Deploying to Vercel

1.  **Connect Git Repository:** The recommended way is to connect your Git repository (GitHub, GitLab, Bitbucket) to your Vercel account. Vercel will automatically detect the Next.js project and deploy it on every push to your main branch.
2.  **Vercel CLI:** Alternatively, you can deploy from your local machine using the Vercel CLI:
    *   Install the Vercel CLI globally:
        ```bash
        npm install -g vercel
        ```
    *   From your project directory, run:
        ```bash
        vercel
        ```
        Follow the prompts to complete the deployment.

---
*This README was updated to reflect the current project setup and future development steps.*
### **How to Run Lonemox**  

---

### **1. Install Dependencies**  
You'll need both frontend and backend dependencies.  

#### **Frontend (React/Next.js)**
Inside your React project folder, run:  
```bash
npm install react react-dom socket.io-client lucide-react
```
or  
```bash
yarn add react react-dom socket.io-client lucide-react
```

**If using Next.js, also install UI components:**  
```bash
npm install @shadcn/ui tailwindcss
```

#### **Backend (Node.js + Express)**
If Lonemox has a backend, install these in a separate `server` directory:
```bash
npm install express cors socket.io nodemon
```

---

Run the backend:  
```bash
node server.js
```
or  
```bash
nodemon server.js  # If using nodemon (auto-restarts)

```

---

### **3. Run the Frontend**
If your frontend is in a Next.js/React project:  

```bash
npm run dev  # Runs on http://localhost:3000
```

---

### **4. Test Lonemox**  
1. Start the **backend** (`node server.js`)  
2. Start the **frontend** (`npm run dev`)  
3. Open [http://localhost:3000](http://localhost:3000)  
4. Your dashboard should now load and interact with the backend.

---

### **Full Dependency List**
#### **Frontend:**
- `react`, `react-dom` (UI framework)
- `socket.io-client` (Real-time communication)
- `lucide-react` (Icons)
- `@shadcn/ui`, `tailwindcss` (Optional for styling)

#### **Backend:**
- `express` (Server)
- `cors` (Cross-origin support)
- `socket.io` (Real-time updates)
- `nodemon` (Auto-restart during development)


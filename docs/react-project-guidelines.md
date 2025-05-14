# 🛠️ React Project Guidelines

---

## 🔧 **Tech Stack**

- **Framework:** React + TypeScript
- **UI Library:** [Ant Design (Antd)](https://ant.design) — use Antd components as the default choice.

### **Other Libraries:**
- `@tanstack/react-query` — for all data fetching and caching.
- `zustand` — for state management.
- `zod` — for schema validation.
- `@ts-rest/core` — for strongly typed API integration.

---

## 🎨 **UI & Code Structure**

1. **Component Design**
   - Prefer a **modular, destructured component design**.
   - Break down UI into **clear, reusable components** instead of placing all logic/UI in one file.

2. **UI Components**
   - Use **Ant Design components** heavily.
   - Apply custom CSS **only when Antd lacks a native component** or styling approach.

3. **Separation of Concerns**
   - Maintain a **clean separation of concerns**:
     - **UI Components:** Should be **presentational and dumb** — focused purely on layout and appearance.
     - They should receive **all data and callbacks via props**, even navigation should be handled in the hooks using the `useAppNavigation` custom hook
     - They **should not manage state, perform side effects, or contain business logic**.
     - This makes them **reusable, predictable, and easy to test**.
     - UI components should be paired with **custom hooks** that:
       - Fetch data
       - Manage logic
   - **Business Logic:** Should live in **hooks**.
   - **API Interactions:** Should be handled through **ts-rest contracts**.

4. **Loading States**
   - Use **Ant Design's Skeleton components** for loading states.
   - This preserves layout and **minimizes visual jank** during data fetches.

5. **Form Handling**
   - Prefer **controlled forms** using:
     - Antd's `Form` component.
     - `zod` for **validation**.

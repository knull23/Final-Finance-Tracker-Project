# 💸 Personal Finance Visualizer (https://final-finance-tracker-project.onrender.com/)

A responsive, full-stack web application to track your personal finances, monitor spending habits, manage budgets, and gain valuable financial insights — all in one dashboard.

---

## 🚀 Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/), [React](https://react.dev/), [shadcn/ui](https://ui.shadcn.com/)
- **Charts & Visualization:** [Recharts](https://recharts.org/)
- **Backend & Database:** [MongoDB](https://www.mongodb.com/)
- **Styling:** Tailwind CSS, shadcn components

---

## 📊 Features by Stages

### ✅ Stage 1: Basic Transaction Tracking
- Add, edit, and delete transactions (amount, date, description)
- Transaction list view with real-time updates
- Monthly expenses bar chart
- Basic form validation and error handling

### ✅ Stage 2: Categories
- Everything in Stage 1, plus:
- Predefined spending categories (e.g., Food, Bills, Shopping)
- Category-wise **Pie Chart** breakdown
- Dashboard with:
  - Total expenses
  - Recent transactions
  - Category-wise summary cards

### ✅ Stage 3: Budgeting
- Everything in Stage 2, plus:
- Set monthly budgets per category
- Budget vs Actual chart visualization
- Smart budget alerts:
  - Under Budget
  - At Risk
  - Over Budget
- High-level spending insights

---

## 🧩 Final Dashboard Structure

### 1. **Overview**
> Summary dashboard displaying your financial snapshot:
- Total balance and net worth
- Latest transactions
- Monthly & category-wise charts

### 2. **Transactions**
> Add, edit, delete, and search your transactions with validation and seamless UI.

### 3. **Analytics**
> Deep insights into your financial behavior:
- Spending trends
- Cash flow analysis
- Net worth over time
- Top spending categories

### 4. **Budget**
> Manage and visualize your monthly budgets:
- Track which categories are overspending or at risk
- Visual comparison of budget vs actuals
- Dynamic progress bars and alerts

---

## 🛠️ Installation & Local Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/personal-finance-visualizer.git

# Navigate to project folder
cd personal-finance-visualizer

# Install dependencies
npm install

# Create .env file for MongoDB connection
touch .env.local

# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/personal-finance
# Run the app
npm run dev
```
The app will be available at http://localhost:3000.

✅ Evaluation Criteria
| Category               | Weight |
| ---------------------- | ------ |
| Feature Implementation | 40%    |
| Code Quality           | 30%    |
| UI/UX Design           | 30%    |

📸 Screenshots
![image](https://github.com/user-attachments/assets/26c3529c-c742-4a97-8a18-bf5d44248466)
![image](https://github.com/user-attachments/assets/7f4c7833-b591-41f7-935a-3de212cfca98)
![image](https://github.com/user-attachments/assets/130db664-fd8a-4076-a2e0-6b912627fd38)
![image](https://github.com/user-attachments/assets/fe1a5b79-05ca-4cfa-b612-29aca4fb6b0f)



🙌 Contributions
Feel free to open issues or submit PRs for feature suggestions or improvements. Let's build a better financial future together!

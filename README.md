# ₹ EMI Calculator

### Modern loan analysis, without the spreadsheet.

A clean, responsive EMI calculator built with **HTML, CSS, and vanilla JavaScript** for comparing **reducing-balance and flat-rate loans**, understanding interest costs, converting rates, and exploring complete amortization schedules.

> **Simple inputs. Detailed insights. No dependencies.**

---

## ✨ Live Demo

**[View EMI Calculator →](https://shoaib-35.github.io/EMI-Calculator/)**

---

## 📸 Preview

<img width="1299" height="948" alt="EMI_APP_home" src="https://github.com/user-attachments/assets/6c05e5c0-f55b-4304-8c1f-56fcfe8eee87" />
<img width="1284" height="1005" alt="EMI_APP_dashborad" src="https://github.com/user-attachments/assets/db625c06-d94e-4cb3-82fb-5314bbee7a43" />

<div align="center">

### 1. Loan Inputs

Enter the loan amount, interest rate, tenure, and select the desired repayment method.

<img width="516" height="555" alt="image" src="https://github.com/user-attachments/assets/a821af44-8f30-4b7d-af1a-3f932d7da1c6" />

---

### 2. Results Dashboard

Get an instant overview of monthly EMI, total interest, total repayment, and the principal-interest breakdown.

<img width="1284" height="1005" alt="EMI_APP_dashborad" src="https://github.com/user-attachments/assets/4ed5dfbd-b8fa-4801-89db-5297b9653ab4" />

---

### 3. Rate Comparison

Compare reducing-balance and flat-rate calculations to understand the difference in total borrowing costs.

<img width="530" height="386" alt="image" src="https://github.com/user-attachments/assets/f19617d9-1395-4f8b-9c20-9ac0a168c0ac" />

---

### 4. Amortization Schedule

Explore the complete month-by-month repayment schedule and see how each payment is divided between principal and interest.

<img width="504" height="850" alt="image" src="https://github.com/user-attachments/assets/0cb45217-4dae-4fb1-9631-7c90ea3ab7c1" />

---

### 5. Dark Mode

Switch between light and dark themes for a comfortable experience across different environments.

<img width="488" height="541" alt="image" src="https://github.com/user-attachments/assets/99e10079-6c17-46f7-88c8-b71ca737248f" />
</div>

   
---

## 🚀 Highlights

### 💰 Dual EMI Calculation

Compare two common loan pricing methods side-by-side:

* **Reducing Balance EMI**
* **Flat Rate EMI**
* Monthly EMI
* Total interest payable
* Total repayment amount

### 🔄 Interest Rate Conversion

Understand the relationship between flat and reducing interest rates:

* Reducing → Flat equivalent
* Flat → Reducing equivalent
* Equivalent-rate calculation based on the same repayment economics

### 📊 Visual Loan Breakdown

A dynamic donut visualization provides an immediate view of:

* Principal
* Interest
* EMI per month
* Total repayment

### 📅 Amortization Schedule

Explore exactly how each payment is distributed between principal and interest.

Available views:

* Full monthly schedule
* Yearly summary
* Reducing-balance schedule
* Flat-rate schedule

### 🌙 Light & Dark Mode

Switch between light and dark themes with your preference automatically saved using `localStorage`.

The calculator also respects the user's system theme preference on first launch.

### 📱 Responsive by Design

Designed to work across:

* Desktop
* Tablet
* Mobile

The desktop experience transforms into a multi-column financial dashboard after calculation, while smaller screens retain a focused mobile-first layout.

---

## 🧮 Calculation Engine

The financial logic is separated into a dedicated `EmiEngine`, keeping the calculation layer independent from the UI.

### Reducing-Balance EMI

The monthly EMI is calculated using:

```text
EMI = P × r × (1 + r)ⁿ / ((1 + r)ⁿ − 1)
```

Where:

* `P` = Principal amount
* `r` = Monthly interest rate
* `n` = Number of months

### Flat-Rate EMI

For flat-rate loans:

```text
Total Interest = P × Annual Rate × Years

EMI = (P + Total Interest) / Number of Months
```

### Rate Conversion

The calculator also estimates equivalent rates between the two methods so that users can make more meaningful loan comparisons.

---

## 🛠️ Tech Stack

| Technology             | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| **HTML5**              | Application structure                    |
| **CSS3**               | Responsive UI and theming                |
| **Vanilla JavaScript** | Calculation engine and application logic |
| **SVG**                | Dynamic loan breakdown visualization     |
| **LocalStorage**       | Theme persistence                        |
| **GitHub Pages**       | Static deployment                        |

### No framework. No build system. No dependencies.

The project runs directly in the browser.

---

## 📂 Project Structure

```text
emi-calculator/
│
├── index.html      # Application UI
├── style.css       # Styling, responsive layouts & themes
├── app.js          # EMI engine, calculations & UI logic
└── README.md       # Project documentation
```

---

## ▶️ Run Locally

Clone the repository:

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
```

Navigate into the project:

```bash
cd YOUR-REPOSITORY
```

Start a local server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

You can also open `index.html` directly in a browser.

---

## 🌐 Deploy with GitHub Pages

This project requires no build process, making it ideal for GitHub Pages.

1. Push the project to GitHub.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, select:

   * **Source:** Deploy from a branch
   * **Branch:** `main`
   * **Folder:** `/ (root)`
4. Save the configuration.
5. GitHub will publish the application automatically.

This application will be available at:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/
```

---

## 🎯 Design Goals

This project was designed around four principles:

**Clarity**
Important financial numbers should be immediately visible.

**Comparison**
Users should be able to understand the difference between flat and reducing-rate loans.

**Transparency**
The amortization schedule shows exactly where the money goes.

**Simplicity**
No account, backend, framework, or unnecessary setup is required.

---

## 🔐 Privacy

The calculator runs entirely in the browser.

No loan information is sent to a server or stored remotely.

The only persistent preference is the selected theme, stored locally in the browser using `localStorage`.

---

## 🔮 Possible Future Improvements

* [ ] Loan prepayment / part-payment simulation
* [ ] Processing fee and additional charges
* [ ] Down-payment calculation
* [ ] Multiple loan comparison
* [ ] Export amortization schedule to CSV/PDF
* [ ] Shareable calculation links
* [ ] Currency selection
* [ ] Interactive payment timeline
* [ ] Improved accessibility and keyboard navigation
* [ ] Automated calculation tests

---

## 📌 Why This Project?

EMI calculations are often presented as a single number.

This project goes further by showing the **complete cost of borrowing** — from monthly EMI and total interest to rate equivalence and month-by-month repayment.

The goal is to make loan comparison more transparent and easier to understand.

---

## 👨‍💻 Author

**YOUR NAME**

[GitHub]([https://github.com/YOUR-USERNAME](https://github.com/shoaib-35)) · [LinkedIn]([https://linkedin.com/in/YOUR-PROFILE](https://www.linkedin.com/in/shoa1b-mohammed/))

---

## ⭐ Support

If you find this project useful, consider giving it a ⭐ on GitHub.

---

### Built with

**HTML · CSS · JavaScript · SVG**

> **Calculate smarter. Compare better. Understand your loan.**

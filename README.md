# Sleep Disorder Prediction

A web-based application that predicts whether a user has a **healthy sleep routine**, **insomnia**, or **sleep apnea** based on personal health metrics. Users fill in a simple form and receive an instant prediction powered by a machine learning model served through a REST API.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Input Features](#input-features)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview

Sleep disorders affect millions of people worldwide. This tool helps users identify potential sleep issues early by analyzing key health indicators such as stress level, physical activity, heart rate, and BMI. The prediction is performed by an externally hosted machine learning model that classifies each submission into one of three categories:

| Label | Meaning |
|-------|---------|
| 0 | Healthy Sleep Routine |
| 1 | Insomnia |
| 2 | Sleep Apnea |

---

## Features

- **Instant prediction** – submit the form and get a result in seconds.
- **Recommendation engine** – after receiving a result, users can request nearby hospitals or clinics via the browser's Geolocation API (Google Maps integration).
- **Responsive design** – works on desktop, tablet, and mobile devices.
- **Form validation** – client-side checks ensure all fields are filled in correctly before submission.
- **Custom alert UI** – results are displayed in a styled popup rather than a plain browser dialog.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Styling | CSS3, Bootstrap 5.3.3 |
| Scripting | JavaScript (ES6), jQuery 3.3.1 |
| ML Backend | Python REST API hosted on [Render](https://render.com) |
| Package Manager | npm (Bootstrap only) |

---

## Input Features

The prediction model uses the following 11 features:

| # | Feature | Type | Description |
|---|---------|------|-------------|
| 1 | Age | Numeric | Age in years |
| 2 | Sleep Duration | Numeric | Average hours of sleep per night |
| 3 | Quality of Sleep | Scale (1–10) | Self-reported sleep quality |
| 4 | Physical Activity Level | Scale (1–10) | Daily physical activity level |
| 5 | Stress Level | Scale (1–10) | Self-reported stress level |
| 6 | Heart Rate | Numeric | Resting heart rate (bpm) |
| 7 | Daily Steps | Numeric | Average steps walked per day |
| 8 | Gender | Categorical | Male / Female |
| 9 | Occupation | Categorical | Student, Doctor, Engineer, Nurse, etc. |
| 10 | BMI Category | Categorical | Underweight / Normal weight / Overweight / Obese |
| 11 | Blood Pressure | Text | Systolic/Diastolic (e.g. `120/80`) |

---

## How It Works

1. The user opens the application in a browser and navigates to the **Prediction** page.
2. They fill in all 11 health-metric fields and click **Submit**.
3. The JavaScript client validates the inputs and sends a `POST` request to the prediction API.
4. The API returns a JSON response containing the predicted class (`0`, `1`, or `2`).
5. The result is displayed in a custom popup with a human-readable label.
6. Optionally, the user can click **Find Nearby Hospitals**, which opens Google Maps with a local hospital search using the browser's Geolocation API.

---

## Project Structure

```
Sleep-Disorder-Prediction/
├── Index.html          # Landing / home page
├── prediction.html     # Health-metric input form and result display
├── script.js           # Form handling, API calls, geolocation logic
├── style.css           # Custom styles and Bootstrap overrides
├── package.json        # npm metadata (Bootstrap dependency)
├── sleeping-disorder.jpg  # Background image
├── facebook.png        # Footer social icon
├── twitter.png         # Footer social icon
├── image (1).png       # Footer Instagram icon
└── LICENSE             # Apache 2.0 License
```

---

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- [Node.js & npm](https://nodejs.org/) *(optional – only needed to install Bootstrap locally)*

### Running Locally

1. **Clone the repository**

   ```bash
   git clone https://github.com/tamim-shadman/Sleep-Disorder-Prediction.git
   cd Sleep-Disorder-Prediction
   ```

2. **Install dependencies** *(optional – Bootstrap is also loaded via CDN)*

   ```bash
   npm install
   ```

3. **Open the app**

   Simply open `Index.html` in your browser:

   ```bash
   # macOS
   open Index.html

   # Linux
   xdg-open Index.html

   # Windows
   start Index.html
   ```

   No build step or local server is required.

---

## Usage

1. Open `Index.html` in your browser.
2. Click **Get Started** or navigate to `prediction.html`.
3. Fill in all the fields in the prediction form.
4. Click **Submit**.
5. View the prediction result in the popup.
6. Optionally, click **Find Nearby Hospitals** to locate medical facilities near you.

---

## API Reference

The frontend communicates with the following endpoint:

| Property | Value |
|----------|-------|
| **URL** | `https://sleep-disorder-prediction-api.onrender.com/predict_sleep_disorder` |
| **Method** | `POST` |
| **Content-Type** | `application/json` |

### Request Body

```json
{
  "age": 30,
  "sleep_duration": 7.5,
  "quality_of_sleep": 8,
  "physical_activity_level": 6,
  "stress_level": 4,
  "heart_rate": 72,
  "daily_steps": 8000,
  "gender": "Male",
  "occupation": "Engineer",
  "bmi_category": "Normal weight",
  "blood_pressure": "120/80"
}
```

### Response

```json
{
  "sleep_disorder": 0
}
```

| Value | Meaning |
|-------|---------|
| `0` | Healthy Sleep Routine |
| `1` | Insomnia |
| `2` | Sleep Apnea |

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit them: `git commit -m 'Add your feature'`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request.

Please ensure your changes are well-tested and do not break existing functionality.

---

## License

This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for details.

---

## Contact

**Backbencher's Binary Solution**  
📧 backbenchersbinarysolution@gmail.com


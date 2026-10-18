# Contributing to SomnoPulse AI™

Thank you for your interest in contributing to **SomnoPulse AI**! We welcome contributions from clinical researchers, software engineers, data scientists, and UI/UX designers.

---

## Code of Conduct

This project and everyone participating in it is governed by the [SomnoPulse AI Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## Development Workflow

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **NPM**: v9.0.0 or higher
- Modern web browser (Chrome, Edge, Firefox, Safari)

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tamim-shadman/Sleep-Disorder-Prediction.git
   cd Sleep-Disorder-Prediction
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Start the local development server:**
   ```bash
   npm run dev
   # or
   npm start
   ```
   Open your browser to [http://localhost:3000](http://localhost:3000).

---

## Quality & Testing Standards

All pull requests must pass our automated validation suite before merging.

### Running Tests
Execute the comprehensive test suite (45 assertions across 8 suites):
```bash
npm test
```

### Static Syntax & Integrity Verification
```bash
npm run check
```

---

## Branching & Commit Guidelines

- **Branch Naming:**
  - `feat/feature-name` for new capabilities
  - `fix/bug-description` for defect corrections
  - `docs/doc-updates` for documentation
  - `refactor/scope` for architectural improvements
- **Commit Messages:** Follow [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat(screener): add STOP-Bang 2-column card grid`
  - `fix(telemetry): guard against pulse pressure < 15 mmHg`
  - `docs(readme): update architecture diagram and badges`

---

## Pull Request Process

1. Fork the repo and create your branch from `main`.
2. If you've added clinical algorithms or API endpoints, add corresponding tests in `server/tests/api.test.js`.
3. Ensure the test suite passes with 100% success (`npm test`).
4. Update relevant documentation (`README.md`, `ARCHITECTURE.md`).
5. Open a Pull Request with a clear description using the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).

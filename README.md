# 🧠 AI Resume Analyzer

A full-stack, production-ready ATS Resume Analyzer built with **Java Spring Boot**, **React**, and **MySQL**. Upload your resume, compare it against job descriptions, get a real ATS score, see matched and missing keywords, and receive AI-powered improvement suggestions via the Gemini API.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 JWT Auth | Secure register/login with BCrypt + JWT tokens |
| 📄 PDF Upload | Upload PDF resumes, text extracted with Apache PDFBox |
| 💼 Job Descriptions | Save and manage job postings to compare against |
| 📊 ATS Scoring | Keyword-based scoring algorithm (0–100%) |
| 🤖 AI Suggestions | Gemini AI generates detailed improvement advice |
| 📈 Dashboard | Stats, score trend chart, recent analyses |
| 🕓 History | Full analysis history with detailed result views |
| 🛡️ Admin Panel | View users and system stats (admin role only) |

---

## 🗂️ Project Structure

```
ai-resume-analyzer/
├── backend/                        # Spring Boot application
│   ├── src/main/java/com/resumeanalyzer/
│   │   ├── config/                 # SecurityConfig
│   │   ├── controller/             # REST controllers
│   │   ├── dto/                    # Request/Response DTOs
│   │   ├── exception/              # Custom exceptions + global handler
│   │   ├── model/                  # JPA entities
│   │   ├── repository/             # Spring Data JPA repositories
│   │   ├── security/               # JWT filter, UserDetailsService
│   │   └── service/                # Business logic
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── frontend/                       # React + Vite application
│   ├── src/
│   │   ├── api/                    # Axios instance + service functions
│   │   ├── components/layout/      # Sidebar layout
│   │   ├── context/                # AuthContext
│   │   └── pages/                  # All page components
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── database/
    └── schema.sql                  # MySQL schema + admin seed
```

---

## 🛠️ Tech Stack

**Backend**
- Java 17, Spring Boot 3.2
- Spring Security + JWT (jjwt 0.12)
- Spring Data JPA + Hibernate
- MySQL 8
- Apache PDFBox 3 (PDF text extraction)
- OkHttp (Gemini API calls)
- Lombok, Maven

**Frontend**
- React 18, Vite
- Tailwind CSS
- Axios
- React Router v6
- Recharts (score charts)
- react-dropzone (file upload)
- react-markdown (AI suggestion rendering)
- react-hot-toast

---

## 🚀 Local Setup

### Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8+
- Maven 3.8+

---

### 1. Database Setup

```sql
-- Run in MySQL client or MySQL Workbench
source database/schema.sql
```

Or manually:

```sql
CREATE DATABASE resume_analyzer_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Spring Boot's `ddl-auto=update` will create tables automatically on first run.

---

### 2. Backend Setup

```bash
cd backend

# Copy and configure environment
cp .env.example .env
# Edit .env — set DB_PASSWORD, JWT_SECRET, GEMINI_API_KEY

# Run with Maven
./mvnw spring-boot:run \
  -Dspring-boot.run.jvmArguments="\
    -DDB_USERNAME=root \
    -DDB_PASSWORD=yourpassword \
    -DJWT_SECRET=your-secret-key-at-least-32-chars \
    -DGEMINI_API_KEY=your-gemini-key"
```

Or set environment variables in your IDE run config, then:

```bash
./mvnw spring-boot:run
```

Backend runs at **http://localhost:8080**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:3000**

The Vite proxy forwards `/api/*` requests to `localhost:8080` automatically — no CORS issues in dev.

---

### 4. Get a Gemini API Key (Free)

1. Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Click **Create API Key**
3. Copy it into your `.env` as `GEMINI_API_KEY`

> **Note:** The app works without a Gemini key — it falls back to detailed built-in suggestions automatically.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT token |

### Resumes
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/resumes/upload` | Upload PDF (multipart/form-data, field: `file`) |
| GET | `/api/resumes` | Get all user's resumes |
| GET | `/api/resumes/{id}` | Get resume by ID |
| DELETE | `/api/resumes/{id}` | Delete resume |

### Job Descriptions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/job-descriptions` | Save a job description |
| GET | `/api/job-descriptions` | Get all user's job descriptions |
| GET | `/api/job-descriptions/{id}` | Get by ID |
| DELETE | `/api/job-descriptions/{id}` | Delete |

### Analysis
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/analysis/analyze` | Run ATS analysis `{resumeId, jobDescriptionId}` |
| GET | `/api/analysis/history` | Get all analysis history |
| GET | `/api/analysis/{id}` | Get single result |
| GET | `/api/analysis/dashboard/stats` | Dashboard statistics |

### Admin (ADMIN role only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/stats` | System-wide stats |
| GET | `/api/admin/users` | All users list |

All endpoints except `/api/auth/**` require `Authorization: Bearer <token>` header.

---

## 🧮 ATS Score Calculation

The score is a weighted combination of three factors:

| Factor | Weight | Description |
|---|---|---|
| Keyword Match | 70% | % of JD keywords found in resume |
| Resume Length | 15% | Optimal word count (300–800 words = 100%) |
| Section Completeness | 15% | Presence of: Summary, Experience, Education, Skills, Projects, etc. |

Keywords are extracted from a curated dictionary of 80+ tech and soft-skill terms, plus n-gram extraction from the job description text.

---

## 🗄️ Database Schema

```
users               resumes              job_descriptions
──────────────      ──────────────────   ────────────────────
id (PK)             id (PK)              id (PK)
full_name           file_name            job_title
email (UNIQUE)      file_path            company_name
password            extracted_text       description
role                uploaded_at          created_at
created_at          user_id (FK)         user_id (FK)

analysis_results
────────────────────────────
id (PK)
ats_score
matched_keywords (JSON)
missing_keywords (JSON)
ai_suggestions
skills_analysis
analyzed_at
resume_id (FK)
job_description_id (FK)
```

---

## 🌐 Deployment

### Backend → Render

1. Push backend to a GitHub repo
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Build Command**: `./mvnw clean package -DskipTests`
4. Set **Start Command**: `java -jar target/ai-resume-analyzer-1.0.0.jar`
5. Add environment variables in Render dashboard:
   - `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `GEMINI_API_KEY`
   - `SPRING_DATASOURCE_URL` (use Railway MySQL URL)
   - `CORS_ORIGINS=https://your-frontend.vercel.app`

### Database → Railway

1. Create a MySQL plugin on [railway.app](https://railway.app)
2. Copy the connection URL to Render's `SPRING_DATASOURCE_URL`

### Frontend → Vercel

1. Push frontend to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Set environment variable:
   - `VITE_API_URL=https://your-backend.onrender.com/api`
4. Deploy — Vercel auto-detects Vite

---

## 🔑 Default Admin Account

After running `schema.sql`, the default admin credentials are:

```
Email:    admin@resumeanalyzer.com
Password: admin123
```

**Change this immediately in production.**

---

## 🔒 Security Notes

- Passwords hashed with BCrypt (strength 10)
- JWT tokens expire in 24 hours
- All endpoints (except auth) require valid JWT
- File uploads validated: PDF only, max 10MB
- SQL injection protected via JPA parameterized queries
- CORS restricted to configured origins

---

## 📝 License

MIT — free for personal and commercial use.

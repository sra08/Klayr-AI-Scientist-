# Klayr — Your AI Co-Scientist 🔬✨

**Klayr** (formerly Methodica) is a production-grade AI platform designed to accelerate scientific research from hypothesis to breakthrough. It combines multi-agent orchestration, live literature search, and a unique "Scientist-in-the-Loop" feedback system.

## 🚀 Key Features

### 1. Multi-Agent Research Pipeline
Klayr uses a sophisticated multi-agent system powered by **LangGraph** to automate the tedious parts of research planning:
- **Hypothesis Refiner**: Polishes raw ideas into structured scientific hypotheses.
- **Literature QC Agent**: Scans ArXiv and PubMed for relevant papers to assess novelty.
- **Protocol Architect**: Generates detailed, step-by-step laboratory protocols.
- **Resource Specialist**: Identifies required materials and sources them from real suppliers.
- **Budget Analyst**: Creates comprehensive project budgets with cost optimization options.
- **Timeline Manager**: Estimates project phases and task dependencies.

### 2. Feedback-Driven Learning Loop (The "Lab Brain") 🔄
The winning feature of Klayr is its ability to grow smarter with use. 
- **Structured Review**: Scientists can leave specific corrections on any section of an experiment plan.
- **Automatic Incorporation**: The system stores these "Prior Learnings" in the database and automatically injects them into future generation prompts for that specific domain.
- **Continuous Improvement**: If you tell Klayr to "always include a 24-hour stabilization phase," it will remember and apply that rule to all future plans without being asked again.

### 3. Live Novelty Detection
As you type your hypothesis, Klayr performs a real-time semantic search across its internal database to determine if the idea is:
- ✨ **Original Idea**: No similar work found.
- ⏳ **In Progress**: Someone in your network is already working on this.
- ✅ **Already Done**: A completed plan already exists for this hypothesis.

### 4. Advanced Literature Search
Klayr connects to **ArXiv** and **PubMed** to surface real-world scientific precedents.
- **High Depth**: Searches up to 30 sources per query.
- **AI Summarization**: Automatically generates 2-3 sentence "plain English" summaries of complex abstracts.
- **Relevance Scoring**: Merges and ranks papers based on their similarity to your research query.

### 5. Secure Researcher Profiles & Collaboration
- **Full Auth System**: Secure sign-up and login with database persistence.
- **Personalized Workspace**: Tailored dashboards that track your specific experiments, reports, and collaborations.
- **Collaboration Finder**: Match with other researchers based on domain expertise and hypothesis similarity.

---

## 🛠️ Technical Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide-React, Sonner (Toasts).
- **Backend**: FastAPI (Python), Uvicorn.
- **AI Orchestration**: LangGraph, LangChain.
- **LLM**: Groq (Llama 3.3 70B) for high-speed, high-precision reasoning.
- **Database**: Postgres (Neon) with SQLAlchemy/AsyncPG.
- **Search**: ArXiv API & PubMed E-Utilities.

---

## 🏗️ Getting Started

### Backend
1. Install dependencies: `pip install -r requirements.txt`
2. Run the API: `python -m src.api.main`

### Frontend
1. Navigate to directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

---

## 🎨 Branding
The platform features a premium, custom-branded interface:
- **Favicon**: Customized with the official brand icon.
- **Logo**: Fully integrated custom 'Klayr' branding across the entire UI.

**Klayr — From Hypothesis to Breakthrough.**

import { useState } from "react"

function App() {
  const [selectedSituation, setSelectedSituation] = useState<string | null>(
    null
  )
  const [question, setQuestion] = useState(1)
  const [showAnswer, setShowAnswer] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeAnswer, setActiveAnswer] = useState<
    "phoneSearch" | "landlordEviction" | "policeArrest"
  >("phoneSearch")
  const [showLandingPage, setShowLandingPage] = useState(true)


  const situations = [
    "Arrest & Police",
    "Bail & Detention",
    "Tenancy",
    "Employment",
    "Consumer Rights",
  ]

  const legalAnswers = {
  phoneSearch: {
    question: "Can the police search my phone?",
    shortAnswer:
      "The police must have a lawful basis to search your phone. Whether a warrant is required depends on the circumstances and applicable law.",
    explanation:
      "Your privacy is protected by Nigerian law, but specific legal powers and circumstances may affect whether a search is lawful.",
    exceptions: [
      "A search warrant may authorise a search.",
      "Other applicable legal powers may affect the circumstances.",
    ],
    law: [
      {
        name: "Constitution of the Federal Republic of Nigeria, 1999",
        section: "Section 37",
        description:
          "Protects privacy, including telephone communications.",
      },
      {
        name: "Nigeria Police Act 2020",
        section: "Sections 58–59",
        description:
          "Contains provisions concerning search warrants.",
      },
    ],
    whatToDo:
      "Ask calmly for the legal basis of the search. If you believe your rights have been violated, seek legal assistance.",
    
    lastVerified: "Pending legal review",
  },

  landlordEviction: {
    question: "Can my landlord evict me?",
    shortAnswer:
      "A landlord must follow the applicable legal process to recover possession of a rented property. You should not assume that a landlord can lawfully evict you simply by demanding that you leave.",
    explanation:
      "The procedure depends on the tenancy, the reason for ending it, the applicable state law, and the circumstances of the case.",
    exceptions: [
      "Notice requirements and procedures differ depending on the type of tenancy and the applicable law.",
      "Court proceedings or other legally prescribed steps may be required before possession can be recovered.",
    ],
    law: [],
    whatToDo:
      "Keep your tenancy agreement, rent receipts, and any notices you receive. Seek advice from a qualified Nigerian legal practitioner or legal aid service about the rules that apply in your state.",
    lastVerified: "Pending legal review",
  },

    policeArrest: {
    question: "Can the police arrest me without a warrant?",
    shortAnswer:
      "Nigerian police may arrest a person without a warrant in certain circumstances, but their power to arrest is governed by law.",
    explanation:
      "Whether an arrest without a warrant is lawful depends on the circumstances and the legal grounds for the arrest. An arrest must not be arbitrary.",
    exceptions: [
      "The law permits warrantless arrests in specified circumstances.",
      "Other situations may require a warrant or additional legal procedures.",
    ],
    law: [],
    whatToDo:
      "Stay calm, ask why you are being arrested, and seek assistance from a qualified Nigerian legal practitioner or legal aid service.",
    lastVerified: "Pending legal review",
  },
}


  const handleSituationClick = (situation: string) => {
    setSelectedSituation(situation)
    setQuestion(1)
    setShowAnswer(false)
  }


const handleSearch = () => {
  const query = searchQuery.trim().toLowerCase()

  if (!query) {
    return
  }

  // Only show the existing answer for phone-search questions
  
if (
  (query.includes("phone") ||
    query.includes("mobile") ||
    query.includes("device")) &&
  (query.includes("search") ||
    query.includes("check") ||
    query.includes("inspect") ||
    query.includes("unlock") ||
    query.includes("look through"))
) {
  setSelectedSituation("Arrest & Police")
  setQuestion(2)
  setActiveAnswer("phoneSearch")
  setShowAnswer(true)
  return
}


  // Other police and arrest questions
  
if (
  query.includes("police") ||
  query.includes("arrest") ||
  query.includes("officer") ||
  query.includes("warrant")
) {
    setSelectedSituation("Arrest & Police")
    setQuestion(1)

    
    if (
      (query.includes("arrest") || query.includes("arrested")) &&
      (query.includes("warrant") ||
        query.includes("without one") ||
        query.includes("without a warrant"))
    ){
        setActiveAnswer("policeArrest")
        setShowAnswer(true)
      } else {
              setShowAnswer(false)
            }
    return
  }


  // Bail and detention
  if (
    query.includes("bail") ||
    query.includes("detention") ||
    query.includes("detained") ||
    query.includes("custody")
  ) {
    setSelectedSituation("Bail & Detention")
    setQuestion(1)
    setShowAnswer(false)
    return
  }

  
  // Tenancy
  
if (
  query.includes("rent") ||
  query.includes("landlord") ||
  query.includes("tenant") ||
  query.includes("eviction") ||
  query.includes("house") ||
  query.includes("deposit") ||
  query.includes("notice") ||
  query.includes("quit") ||
  query.includes("lease") ||
  query.includes("accommodation")
) {
  setSelectedSituation("Tenancy")
  setQuestion(1)

  
  if (
      query.includes("evict") ||
      query.includes("eviction") ||
      query.includes("throw me out") ||
      query.includes("force me out") ||
      query.includes("make me leave")
    ) {
      setActiveAnswer("landlordEviction")
      setShowAnswer(true)
    } else {
      setShowAnswer(false)
    }


  return
}



  // Employment
  if (
    query.includes("salary") ||
    query.includes("employment") ||
    query.includes("employer") ||
    query.includes("dismissed") ||
    query.includes("job") ||
    query.includes("worker") ||
    query.includes("wages")
  ) {
    setSelectedSituation("Employment")
    setQuestion(1)
    setShowAnswer(false)
    return
  }

  // Consumer rights
  if (
    query.includes("refund") ||
    query.includes("customer") ||
    query.includes("consumer") ||
    query.includes("purchase") ||
    query.includes("seller") ||
    query.includes("product") ||
    query.includes("goods")
  ) {
    setSelectedSituation("Consumer Rights")
    setQuestion(1)
    setShowAnswer(false)
    return
  }

  window.alert(
    "We couldn't match your question to a topic yet. Try different words or explore a category."
  )
}


  const handleBack = () => {
    if (showAnswer) {
      setShowAnswer(false)
      return
    }

    if (question > 1) {
      setQuestion(question - 1)
    } else {
      setSelectedSituation(null)
    }
  }

  const scrollToSection = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth" })
  }

  const scrollToSearch = () => {
    document
      .querySelector(".search-box input")
      ?.scrollIntoView({ behavior: "smooth", block: "center" })
  }


  if (showLandingPage) {
    return (
      <main className="landing-page">
        <header className="landing-header">
          <div className="landing-brand">
            <img
              src={`${import.meta.env.BASE_URL}scito-jus-logo.jpg`}
              alt="Scito Jus symbol"
              className="landing-logo"
            />

            <span className="landing-brand-name">Scito Jus</span>
          </div>
        </header>

        <section className="landing-content">
          <p className="landing-eyebrow">
            NIGERIAN LEGAL INFORMATION
          </p>

          <h1>
            Understand the law.
            <span> Know your rights.</span>
          </h1>

          <p className="landing-description">
            Clear, accessible information about Nigerian law to help
            you understand your rights and make informed decisions.
          </p>

          <button
            className="landing-cta"
            onClick={() => setShowLandingPage(false)}
          >
            Get Started <span aria-hidden="true">→</span>
          </button>

          <p className="landing-note">
            Legal information for everyday life.
          </p>
        </section>

        <footer className="landing-footer">
          Scito Jus · Nigerian legal information
        </footer>
      </main>
    )
  }


  /*
   * ARREST & POLICE
   */
  if (selectedSituation === "Arrest & Police") {
  return (
    <main className="app">
      <header className="header">
        <button className="back-button" onClick={handleBack}>
          ← Back
        </button>

        <div className="logo">SCITO JUS</div>
      </header>

      <section className="question-page">
        <p className="eyebrow">ARREST & POLICE</p>

        {!showAnswer && question === 1 && (
          <>
            <h1>What do you need to know?</h1>

            <p className="description">
              Answer a few quick questions so we can find the relevant legal
              information.
            </p>

            <div className="question-card">
              <h2>What is your situation?</h2>

              <button className="answer-option">
                I've been stopped by the police
              </button>

              <button className="answer-option">
                I've been arrested
              </button>

              <button
                className="answer-option"
                onClick={() => setQuestion(2)}
              >
                The police want to search me or my property
              </button>

              <button className="answer-option">
                Something else
              </button>
            </div>
          </>
        )}

        {!showAnswer && question === 2 && (
          <>
            <h1>What do they want to search?</h1>

            <p className="description">
              Choose the option that best describes your situation.
            </p>

            <div className="question-card">
              <h2>What is being searched?</h2>

              <button
                className="answer-option"
                onClick={() => setShowAnswer(true)}
              >
                My phone or another device
              </button>

              <button className="answer-option">
                My vehicle
              </button>

              <button className="answer-option">
                My home or room
              </button>

              <button className="answer-option">
                My person or belongings
              </button>
            </div>
          </>
        )}

        {showAnswer && (
  <div className="answer-page">
    <div className="answer-badge">
      {legalAnswers[activeAnswer].lastVerified === "Pending legal review"
        ? "AWAITING LEGAL REVIEW"
        : `LAST VERIFIED: ${legalAnswers[activeAnswer].lastVerified}`}
    </div>

    <h1>{legalAnswers[activeAnswer].question}</h1>

    <div className="answer-summary">
      <h2>Short answer</h2>
      <p>{legalAnswers[activeAnswer].shortAnswer}</p>
    </div>

    <div className="answer-section">
      <h2>What this means</h2>
      <p>{legalAnswers[activeAnswer].explanation}</p>
    </div>

    <div className="answer-section">
      <h2>Exceptions</h2>

      {legalAnswers[activeAnswer].exceptions.map((exception) => (
        <p key={exception}>• {exception}</p>
      ))}
    </div>

    
    <div className="answer-section">
      <h2>What the law says</h2>

      {legalAnswers[activeAnswer].law.length > 0 ? (
        legalAnswers[activeAnswer].law.map((law) => (
          <div
            className="legal-source"
            key={`${law.name}-${law.section}`}
          >
            <strong>{law.name}</strong>
            <p>
              <strong>{law.section}</strong>
            </p>
            <p>{law.description}</p>
          </div>
        ))
      ) : (
        <p>
          Legal sources for this answer are still being reviewed.
          SCITO JUS has not yet completed verification of the applicable
          legislation.
        </p>
      )}
    </div>


    <div className="answer-section">
      <h2>What to do</h2>
      <p>{legalAnswers[activeAnswer].whatToDo}</p>
    </div>

    <div className="source-info">
      <p>
        <strong>Last verified:</strong> {legalAnswers[activeAnswer].lastVerified}
      </p>
    </div>

    
    <a
      className="report-button"
      href={`mailto:?subject=${encodeURIComponent(
        `SCITO JUS answer correction: ${legalAnswers[activeAnswer].question}`
      )}&body=${encodeURIComponent(
        `I would like to report a possible issue with this SCITO JUS answer:\n\nQuestion: ${legalAnswers[activeAnswer].question}\n\nPlease describe the issue below:\n`
      )}`}
    >
      Report an error
    </a>


    <p className="disclaimer">
      This information is for general educational purposes and is not a
      substitute for professional legal advice.
    </p>
  </div>
)}
      </section>
    </main>
  )
}

if (
  selectedSituation === "Bail & Detention" ||
  selectedSituation === "Tenancy" ||
  selectedSituation === "Employment" ||
  selectedSituation === "Consumer Rights"
) {

return (
  <main className="app">
      <header className="header">
        <button className="back-button" onClick={handleBack}>
          ← Back
        </button>

        <div className="logo">SCITO JUS</div>
      </header>

      <section className="question-page">
        <p className="eyebrow">
          {selectedSituation.toUpperCase()}
        </p>

        <h1>What do you need to know?</h1>

        <p className="description">
          Choose a question to explore information about{" "}
          {selectedSituation.toLowerCase()}.
        </p>

        <div className="question-card">
          <h2>Explore tenancy questions</h2>

          <button
            className="situation-button"
            onClick={() => {
            setSearchQuery("Can my landlord evict me?")
            setSelectedSituation(null)
            setShowAnswer(false)
            scrollToSearch()
          }}
          >
            Can my landlord evict me?
          </button>

          <button
            className="situation-button"
            onClick={() => {
              setSearchQuery("Can my landlord increase my rent?")
              setSelectedSituation(null)
              setShowAnswer(false)
              scrollToSearch()
            }}
          >
            Can my landlord increase my rent?
          </button>

          <button
            className="situation-button"
            onClick={() => {
              setSearchQuery("Can my landlord keep my deposit?")
              setSelectedSituation(null)
              setShowAnswer(false)
              scrollToSearch()
            }}
          >
            Can my landlord keep my deposit?
          </button>
        </div>
      </section>
    </main>
  )
}

  /*
   * HOMEPAGE
   */
  return (
    <main className="app">
      <header className="header">
        <div className="logo">SCITO JUS</div>

        <nav className="nav">
          <button onClick={() => scrollToSection("how-it-works")}>
            How it works
          </button>

          <button onClick={() => scrollToSection("legal-updates")}>
            Legal updates
          </button>

          <button onClick={() => scrollToSection("about")}>
            About
          </button>
        </nav>

        <button
          className="header-button"
          onClick={scrollToSearch}
        >
          Get started
        </button>
      </header>

      <section className="hero">
        <p className="eyebrow">NIGERIAN LEGAL INFORMATION</p>

        <h1>Know what the law says.</h1>

        <p className="description">
          Find clear, verified information about Nigerian law and your rights.
        </p>

        <div className="search-box">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch()
              }
            }}
            placeholder="What does Nigerian law say about..."
          />

          <button onClick={handleSearch}>
            Search
          </button>
        </div>

        <div className="situations">
          <p className="situations-title">
            Or explore a situation
          </p>

          <div className="situation-list">
            {situations.map((situation) => (
              <button
                className="situation-card"
                key={situation}
                onClick={() => handleSituationClick(situation)}
              >
                {situation}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works">
        <p className="eyebrow">HOW SCITO JUS WORKS</p>

        <h2>Simple answers. Clear sources.</h2>

        <div className="steps">
          <div className="step">
            <span>01</span>

            <h3>Ask</h3>

            <p>
              Describe your legal question in plain language.
            </p>
          </div>

          <div className="step">
            <span>02</span>

            <h3>Understand</h3>

            <p>
              Get a clear explanation of the relevant law.
            </p>
          </div>

          <div className="step">
            <span>03</span>

            <h3>Verify</h3>

            <p>
              See the legal source, review date and other details.
            </p>
          </div>
        </div>
      </section>

      <section id="legal-updates" className="info-section">
        <p className="eyebrow">LEGAL UPDATES</p>

        <h2>Stay informed.</h2>

        <p>
          SCITO JUS will highlight important changes, new legislation and
          significant legal developments in Nigeria.
        </p>
      </section>

      <section id="about" className="info-section">
        <p className="eyebrow">ABOUT SCITO JUS</p>

        <h2>Legal information, made understandable.</h2>

        <p>
          SCITO JUS is designed to make Nigerian legal information easier
          for everyday people to understand and find.
        </p>
      </section>
    </main>
  )
}

export default App
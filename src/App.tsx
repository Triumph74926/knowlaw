import { useState } from "react"

function App() {
  const [selectedSituation, setSelectedSituation] = useState<string | null>(
    null
  )
  const [question, setQuestion] = useState(1)
  const [showAnswer, setShowAnswer] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

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

  // Police and phone searches
  if (
    query.includes("phone") ||
    query.includes("police") ||
    query.includes("search") ||
    query.includes("arrest")
  ) {
    setSelectedSituation("Arrest & Police")
    setQuestion(2)
    setShowAnswer(true)
    return
  }

  // Bail and detention
  if (
    query.includes("bail") ||
    query.includes("detention") ||
    query.includes("detained")
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
    query.includes("eviction")
  ) {
    setSelectedSituation("Tenancy")
    setQuestion(1)
    setShowAnswer(false)
    return
  }

  // Employment
  if (
    query.includes("salary") ||
    query.includes("employment") ||
    query.includes("employer") ||
    query.includes("dismissed") ||
    query.includes("job")
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
    query.includes("seller")
  ) {
    setSelectedSituation("Consumer Rights")
    setQuestion(1)
    setShowAnswer(false)
    return
  }

  // Unknown question
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

        <div className="logo">KnowLaw</div>
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
    <div className="answer-badge">VERIFIED ANSWER</div>

    <h1>{legalAnswers.phoneSearch.question}</h1>

    <div className="answer-summary">
      <h2>Short answer</h2>
      <p>{legalAnswers.phoneSearch.shortAnswer}</p>
    </div>

    <div className="answer-section">
      <h2>What this means</h2>
      <p>{legalAnswers.phoneSearch.explanation}</p>
    </div>

    <div className="answer-section">
      <h2>Exceptions</h2>

      {legalAnswers.phoneSearch.exceptions.map((exception) => (
        <p key={exception}>• {exception}</p>
      ))}
    </div>

    <div className="answer-section">
      <h2>What the law says</h2>

      {legalAnswers.phoneSearch.law.map((law) => (
        <div className="legal-source" key={law.section}>
          <strong>{law.name}</strong>
          <p>
            <strong>{law.section}</strong>
          </p>
          <p>{law.description}</p>
        </div>
      ))}
    </div>

    <div className="answer-section">
      <h2>What to do</h2>
      <p>{legalAnswers.phoneSearch.whatToDo}</p>
    </div>

    <div className="source-info">
      <p>
        <strong>Last verified:</strong> {legalAnswers.phoneSearch.lastVerified}
      </p>
    </div>

    <button className="report-button">
      Report an error
    </button>

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

        <div className="logo">KnowLaw</div>
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
        <div className="logo">KnowLaw</div>

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
        <p className="eyebrow">HOW KNOWLAW WORKS</p>

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
          KnowLaw will highlight important changes, new legislation and
          significant legal developments in Nigeria.
        </p>
      </section>

      <section id="about" className="info-section">
        <p className="eyebrow">ABOUT KNOWLAW</p>

        <h2>Legal information, made understandable.</h2>

        <p>
          KnowLaw is designed to make Nigerian legal information easier
          for everyday people to understand and find.
        </p>
      </section>
    </main>
  )
}

export default App
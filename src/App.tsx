import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase, supabaseConfigured } from "./authClient"

function App() {

  const [selectedSituation, setSelectedSituation] = useState<string | null>(

    null

  )

  const [question, setQuestion] = useState(1)

  const [showAnswer, setShowAnswer] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")

  const [activeAnswer, setActiveAnswer] = useState<

  | "phoneSearch"

  | "landlordEviction"

  | "policeArrest"

  | "bailApplication"

  | "policeDetention"

>("phoneSearch")

  const [showLandingPage, setShowLandingPage] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLoginPage, setShowLoginPage] = useState(false)
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up" | "reset">("sign-in")
  const [recoveryMode, setRecoveryMode] = useState(false)
  const [authName, setAuthName] = useState("")
  const [authEmail, setAuthEmail] = useState("")
  const [authPassword, setAuthPassword] = useState("")
  const [authMessage, setAuthMessage] = useState("")
  const [authError, setAuthError] = useState("")
  const [authBusy, setAuthBusy] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const firstScreenRef = useRef(true)
  const displayName = authUser && typeof authUser.user_metadata.full_name === "string"
    ? authUser.user_metadata.full_name
    : authUser?.email?.split("@")[0] || "user"

  const situations = [
    "Contractual Agreements",
    "Duty of Care and Negligence",
    "Defamation",
    "Debt Recovery",
  ] as const

  const everydayScenarios = {
    "Contractual Agreements": [
      { title: "A seller did not deliver what I paid for", summary: "A payment, receipt, messages, and any agreed delivery date can help show what both sides agreed to. Keep the records and contact the seller in writing to ask for delivery or a solution.", next: "Save your receipt and messages. State clearly what you agreed to and what you want the seller to do. If the issue is not resolved, seek advice about the options available in your state." },
      { title: "Someone did not keep a promise in our agreement", summary: "An agreement may be written, spoken, or shown by the parties’ actions. What can be done depends on the terms, the evidence, and the type of agreement.", next: "Keep the agreement and related messages. Write down what happened and ask the other person to explain or put things right. Get legal advice before taking a major step." },
      { title: "I want to cancel an agreement", summary: "Whether you can cancel, and whether a fee or refund applies, depends on the agreement and the circumstances. Do not assume every agreement has the same cancellation rules.", next: "Read the cancellation terms and keep a copy. Tell the other party in writing that you want to cancel and ask them to identify any term they rely on." },
    ],
    "Duty of Care and Negligence": [
      { title: "I was hurt because a place was unsafe", summary: "Responsibility can depend on who controlled the place, what danger existed, whether reasonable care was taken, and how the injury happened. Each case turns on its facts.", next: "Get medical help first. If safe, keep photos, witness details, receipts, and any incident report. Speak with a qualified legal practitioner about your situation." },
      { title: "My property was damaged by someone’s careless act", summary: "A claim may depend on evidence of the careless act, the damage it caused, and who was responsible. The cause and supporting records matter.", next: "Photograph the damage, keep repair estimates and receipts, and record names of witnesses. Avoid altering important evidence before documenting it." },
      { title: "A service provider’s mistake caused me harm", summary: "The provider’s responsibilities and any possible claim depend on the service, the facts, and the harm caused. Different professional and service rules may apply.", next: "Keep contracts, messages, bills, reports, and proof of loss. Ask the provider to explain what happened, then get advice from a qualified practitioner." },
    ],
    "Defamation": [
      { title: "Someone shared a damaging claim about me", summary: "Whether a statement is defamatory depends on its words, who saw or heard it, its meaning, and the circumstances. Not every upsetting or untrue statement leads to a legal claim.", next: "Save the exact post or message, its date, and where it appeared. Avoid responding in a way that could escalate the dispute. Get legal advice before making a public accusation." },
      { title: "A harmful post about me is still online", summary: "The available steps depend on the content, platform, evidence, and applicable law. Keep a record before asking for a post to be changed or removed.", next: "Capture the full post and link, note when you saw it, and keep any replies or messages. You can report it to the platform and seek advice about further steps." },
      { title: "I received a threat of legal action over something I said", summary: "The exact words, context, truth, audience, and any available legal defences may matter. A threat alone does not decide whether a claim will succeed.", next: "Keep the letter or message and do not delete relevant records. Avoid repeating the statement while you get advice from a qualified legal practitioner." },
    ],
    "Debt Recovery": [
      { title: "Someone has not repaid money they borrowed", summary: "A lender may need to show that money was lent and remains unpaid. Messages, transfer records, receipts, and any repayment plan can help establish what happened.", next: "Gather proof of the transfer and the agreed repayment date. Send a calm written request stating the amount and asking for a response by a reasonable date." },
      { title: "A customer has not paid for work I completed", summary: "The agreement, proof that the work was done, invoices, and any objections can affect what is owed and how to recover it.", next: "Keep the agreement, invoice, delivery or completion evidence, and payment reminders. Send a clear written request and seek advice if the dispute continues." },
      { title: "I received a demand for a debt I do not recognise", summary: "Ask for details showing who says the debt is owed, how the amount was calculated, and what records support it. Do not ignore court papers or deadlines.", next: "Keep the demand and related messages. Reply in writing that you dispute the debt and request supporting details. Get legal help promptly if you receive court documents." },
    ],
  } as const
  type EverydayTopic = keyof typeof everydayScenarios
  type EverydayScenario = (typeof everydayScenarios)[EverydayTopic][number]
  const [activeScenario, setActiveScenario] = useState<EverydayScenario | null>(null)

  useEffect(() => {
    if (!supabase) return

    void supabase.auth.getSession().then(({ data }) => setAuthUser(data.session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthUser(session?.user ?? null)
      if (event === "PASSWORD_RECOVERY") {
        setAuthEmail(session?.user.email ?? "")
        setRecoveryMode(true)
        setAuthMode("reset")
        setShowLoginPage(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) return

    setAuthBusy(true)
    setAuthMessage("")
    setAuthError("")

    try {
      if (authMode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
        if (error) throw error
        setAuthMessage("You’re signed in.")
      } else if (authMode === "sign-up") {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
            data: { full_name: authName.trim() },
          },
        })
        if (error) throw error
        setAuthUser(data.session?.user ?? null)
        setAuthMessage(data.session ? "Your account is ready." : "Check your email to confirm your account.")
      } else if (recoveryMode) {
        const { error } = await supabase.auth.updateUser({ password: authPassword })
        if (error) throw error
        setRecoveryMode(false)
        setAuthMode("sign-in")
        setAuthPassword("")
        setAuthMessage("Your password has been updated.")
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
          redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
        })
        if (error) throw error
        setAuthMessage("If an account exists for that email, a password reset link is on its way.")
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "We couldn’t complete that request. Please try again.")
    } finally {
      setAuthBusy(false)
    }
  }

  useLayoutEffect(() => {
    setIsLoading(true)
    const delay = firstScreenRef.current ? 1800 : 1400
    const timer = window.setTimeout(() => {
      firstScreenRef.current = false
      setIsLoading(false)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [showLandingPage, showLoginPage, selectedSituation, activeScenario, showAnswer, question])

  const loadingScreen = isLoading ? (
    <div className={`screen-loader ${firstScreenRef.current ? "screen-loader-intro" : "screen-loader-transition"}`} role="status" aria-live="polite">
      <div className="screen-loader-content">
        <div className="screen-loader-logo-wrap">
          <img
            src={`${import.meta.env.BASE_URL}scito-jus-landing-logo-gold.png`}
            alt="SCITO JUS logo"
            className="screen-loader-logo"
          />
          {!firstScreenRef.current && (
            <>
              <img src={`${import.meta.env.BASE_URL}scito-jus-landing-logo-gold.png`} alt="" aria-hidden="true" className="screen-loader-logo screen-loader-logo-gold-bright" />
              <img src={`${import.meta.env.BASE_URL}scito-jus-landing-logo-gold.png`} alt="" aria-hidden="true" className="screen-loader-logo screen-loader-logo-gold-deep" />
            </>
          )}
        </div>
      </div>
    </div>
  ) : null

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

  bailApplication: {

    question: "How can I apply for bail?",

    shortAnswer:

      "Bail may be available, but the process depends on the offence, the stage of the case, and the authority handling it.",

    explanation:

      "Bail allows a person in custody to be released subject to conditions requiring them to attend when needed. Depending on the case, an application may be made to the police or to a court with jurisdiction.",

    exceptions: [

      "The rules and authority to grant bail depend on the offence and the applicable law.",

      "Bail conditions may include a recognisance or sureties.",

      "A grant of bail does not end the criminal case."

    ],

    law: [

      {

        name: "Nigeria Police Act, 2020",

        section: "Sections 62–64",

        description:

          "Addresses police bail in specified circumstances and remedies for certain suspects who remain in custody."

      }

    ],

    whatToDo:

      "Ask a qualified Nigerian legal practitioner or legal aid service about the correct bail process for the particular case. Keep any charge documents and bail conditions.",

    lastVerified: "Pending legal review",

  },

  policeDetention: {

    question: "How long can the police detain me?",

    shortAnswer:

      "The time a person may be held in police custody depends on the circumstances, the applicable law, and whether a court has authorised further detention.",

    explanation:

      "Nigerian law protects people against arbitrary detention. The Constitution sets limits on detention before a person is brought before a court, with different time limits depending on whether a court of competent jurisdiction is available within a reasonable distance.",

    exceptions: [

      "The applicable time limit depends on the circumstances and the availability of a court.",

      "A court may make lawful orders concerning further detention."

    ],

    law: [

      {

        name: "Constitution of the Federal Republic of Nigeria, 1999",

        section: "Section 35(4)–(5)",

        description:

          "Provides constitutional time limits for bringing an arrested or detained person before a court and rules concerning release where the person is not tried within the prescribed period."

      }

    ],

    whatToDo:

      "Ask why you are being detained and seek assistance from a qualified Nigerian legal practitioner or legal aid service. If you are a minor, contact a trusted adult who can help you obtain legal assistance.",

    lastVerified: "Pending legal review",

  },

}

  const handleSituationClick = (situation: string) => {

    setSelectedSituation(situation)

    setQuestion(1)

    setShowAnswer(false)

    setActiveScenario(null)

  }

const handleSearch = () => {

  const query = searchQuery.trim().toLowerCase()

  if (!query) {

    return

  }

  const allScenarios = Object.entries(everydayScenarios) as [EverydayTopic, readonly EverydayScenario[]][]
  const ignoredWords = new Set(["what", "when", "where", "which", "would", "could", "should", "there", "their", "about", "with", "from", "have", "that", "this", "your", "some", "someone", "they", "them", "been", "does", "did", "not", "into", "over", "want"])
  const queryWords = new Set(query.split(/\W+/).filter((word) => word.length > 2 && !ignoredWords.has(word)))
  const scenarioMatch = allScenarios
    .flatMap(([topic, scenarios]) => scenarios.map((scenario) => ({ topic, scenario })))
    .map((item) => ({
      ...item,
      score: item.scenario.title.toLowerCase().split(/\W+/)
        .filter((word) => word.length > 2 && !ignoredWords.has(word) && queryWords.has(word)).length,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)[0]
  if (scenarioMatch) {
    setSelectedSituation(scenarioMatch.topic)
    setActiveScenario(scenarioMatch.scenario)
    setShowAnswer(false)
    setShowLandingPage(false)
    return
  }

  const topicMatch: EverydayTopic | undefined =
    /contract|agreement|promise|purchase|seller|deliver|refund/.test(query) ? "Contractual Agreements" :
    /neglig|careless|injur|hurt|unsafe|accident|damage/.test(query) ? "Duty of Care and Negligence" :
    /defam|reputation|false claim|harmful post|libel|slander/.test(query) ? "Defamation" :
    /debt|owe|loan|borrow|unpaid|invoice|repay|payment/.test(query) ? "Debt Recovery" :
    undefined
  if (topicMatch) {
    setSelectedSituation(topicMatch)
    setActiveScenario(null)
    setShowAnswer(false)
    setShowLandingPage(false)
    return
  }

  window.alert("We couldn't match your question to one of the four civil-law sections yet. Try different words or explore a section.")
  return

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

  // Bail and detention

  if (

    query.includes("bail") ||

    query.includes("detention") ||

    query.includes("detain") ||

    query.includes("custody")

  ) {

    setSelectedSituation("Arrest & Police")

    setQuestion(1)

    if (

      query.includes("detention") ||

      query.includes("detain") ||

      query.includes("custody")

    ) {

      setActiveAnswer("policeDetention")

    } else {

      setActiveAnswer("bailApplication")

    }

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

    query.includes("wages") ||

    query.includes("pay")

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

    if (activeScenario) {
      setActiveScenario(null)
      return
    }

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

  if (showLoginPage) {
    return (
      <main className="landing-page auth-page">
        <header className="landing-header">
          <button className="auth-back" onClick={() => setShowLoginPage(false)}>← Back to SCITO JUS</button>
          <img src={`${import.meta.env.BASE_URL}scito-jus-logo-gold.png`} alt="SCITO JUS" className="landing-logo" />
        </header>
        <section className="auth-shell">
          <div className="auth-card">
            <p className="landing-eyebrow">SCITO JUS ACCOUNT</p>
            {authUser && !recoveryMode ? (
              <>
                <h1>Your account</h1>
                <p className="auth-intro">You’re signed in as <strong>{authUser.email}</strong>.</p>
                <button className="landing-cta auth-submit" onClick={async () => {
                  if (!supabase) return
                  const { error } = await supabase.auth.signOut()
                  if (error) setAuthError(error.message)
                  else setAuthMessage("You’re signed out.")
                }}>Sign out</button>
              </>
            ) : (
              <>
                <h1>{authMode === "sign-up" ? "Create your account" : authMode === "reset" ? recoveryMode ? "Choose a new password" : "Reset your password" : "Welcome back"}</h1>
                <p className="auth-intro">Sign in to your SCITO JUS account or create one to get started.</p>
                {!supabaseConfigured && (
                  <div className="auth-setup-note" role="status">
                    <strong>Sign-in is being set up.</strong>
                    <span>Please try again later. The account sign-in service has not been connected yet.</span>
                  </div>
                )}
                <form className="auth-form" onSubmit={handleAuthSubmit}>
                  {authMode === "sign-up" && (
                    <>
                      <label htmlFor="account-name">Your name</label>
                      <input id="account-name" type="text" autoComplete="name" required value={authName} onChange={(event) => setAuthName(event.target.value)} placeholder="Your full name" />
                    </>
                  )}
                  <label htmlFor="account-email">Email address</label>
                  <input id="account-email" type="email" autoComplete="email" required value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="you@example.com" />
                  {(authMode !== "reset" || recoveryMode) && (
                    <>
                      <label htmlFor="account-password">Password</label>
                      <input id="account-password" type="password" autoComplete={authMode === "sign-in" ? "current-password" : "new-password"} required minLength={authMode === "sign-in" ? undefined : 8} value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder={authMode === "sign-in" ? "Your password" : "At least 8 characters"} />
                    </>
                  )}
                  {authError && <p className="auth-feedback auth-error" role="alert">{authError}</p>}
                  {authMessage && <p className="auth-feedback" role="status">{authMessage}</p>}
                  <button className="landing-cta auth-submit" type="submit" disabled={!supabaseConfigured || authBusy}>
                    {authBusy ? "Please wait…" : authMode === "sign-up" ? "Create account" : authMode === "reset" ? recoveryMode ? "Update password" : "Send reset link" : "Sign in"}
                  </button>
                </form>
                <div className="auth-links">
                  {authMode === "sign-in" ? (
                    <>
                      <button onClick={() => { setAuthMode("sign-up"); setAuthMessage(""); setAuthError("") }}>Create an account</button>
                      <button onClick={() => { setAuthMode("reset"); setAuthMessage(""); setAuthError("") }}>Forgot password?</button>
                    </>
                  ) : (
                    <button onClick={() => { setAuthMode("sign-in"); setAuthMessage(""); setAuthError("") }}>Back to sign in</button>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
        {loadingScreen}
      </main>
    )
  }

  if (showLandingPage) {

    return (

      <main className="landing-page">

        <header className="landing-header">

          <a href="#" className="landing-brand">

            <img

              src={`${import.meta.env.BASE_URL}scito-jus-logo-gold.png`}

              alt="Scito Jus"

              className="landing-logo"

            />

          </a>

          <button
            className="mobile-nav-toggle"
            type="button"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="landing-navigation"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav id="landing-navigation" className={`landing-nav${mobileMenuOpen ? " landing-nav-open" : ""}`} aria-label="Main navigation">

            <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>

            <a href="#about" onClick={() => setMobileMenuOpen(false)}>About Us</a>

            <a href="#legal-topics" onClick={() => setMobileMenuOpen(false)}>Legal Topics</a>

            <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact Us</a>

            <button className="landing-login-button" onClick={() => { setMobileMenuOpen(false); setShowLoginPage(true) }}>{authUser ? "My account" : "Log in"}</button>

            <a href="#get-legal-help" className="landing-nav-cta" onClick={() => setMobileMenuOpen(false)}>

              Get Legal Help

            </a>

          </nav>

        </header>

        <section className="welcome-showcase" aria-label="Welcome to SCITO JUS">
          <div className="welcome-showcase-copy">
            <p className="welcome-showcase-label"><span aria-hidden="true" /> YOUR SCITO JUS SPACE</p>
            <h1>Hello, <span>{displayName}</span></h1>
            <p className="welcome-showcase-intro">
              {authUser
                ? "Welcome back. Find clear guidance for the everyday legal questions that matter to you."
                : "Welcome to SCITO JUS. Find clear guidance for the everyday legal questions that matter to you."}
            </p>
            <div className="welcome-highlights" aria-label="What you can explore">
              <div><strong>04</strong><span>civil-law topics</span></div>
              <div><strong>Everyday</strong><span>real-life scenarios</span></div>
              <div><strong>Clear</strong><span>practical next steps</span></div>
            </div>
            <button className="welcome-explore" onClick={() => scrollToSection("legal-topics")}>
              Explore legal topics <span className="button-arrow" aria-hidden="true"><svg viewBox="0 0 20 20" focusable="false"><path d="M4 10h12m-5-5 5 5-5 5" /></svg></span>
            </button>
          </div>
          <div className="welcome-showcase-art" aria-hidden="true">
            <div className="welcome-orbit">
              <img src={`${import.meta.env.BASE_URL}scito-jus-logo-gold.png`} alt="" />
              <i />
            </div>
            <p>KNOW THE LAW<br />KNOW YOUR RIGHTS</p>
            <div className="welcome-topic-pills"><span>CONTRACTS</span><span>CARE</span><span>REPUTATION</span><span>DEBT</span></div>
          </div>
        </section>

        <section className="landing-hero" id="home">

          <div className="landing-content">

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

              Get Started <span className="button-arrow" aria-hidden="true"><svg viewBox="0 0 20 20" focusable="false"><path d="M4 10h12m-5-5 5 5-5 5" /></svg></span>

            </button>

            <p className="landing-note">

              Legal information for everyday life.

            </p>

          </div>

          <div

            className="landing-hero-image"

            role="img"

            aria-label="Illustration of a Nigerian legal guide, with a document, legal scales, and a highlighted rights checklist"

          >

            <div className="hero-visual-glow" aria-hidden="true" />

            <div className="hero-visual-topline">

              <span className="hero-visual-mark">§</span>

              <img src={`${import.meta.env.BASE_URL}scito-jus-logo-gold.png`} alt="" className="hero-brand-logo" />

              <span className="hero-visual-pill">LEGAL GUIDE</span>

            </div>

            <div className="hero-visual-document">

              <div className="hero-document-heading">

                <span className="hero-document-icon" aria-hidden="true">⚖</span>

                <div>

                  <span className="hero-document-kicker">KNOW YOUR RIGHTS</span>

                  <strong>Understanding the law</strong>

                </div>

              </div>

              <div className="hero-document-line hero-document-line-long" />

              <div className="hero-document-line" />

              <div className="hero-document-line hero-document-line-short" />

              <div className="hero-document-highlight">

                <span className="hero-check" aria-hidden="true">✓</span>

                <div>

                  <strong>Clear information</strong>

                  <span>Relevant laws. Practical next steps.</span>

                </div>

              </div>

            </div>

            <div className="hero-visual-stamp" aria-hidden="true">NIGERIA<br />LEGAL INFO</div>

          </div>

        </section>

        <section className="landing-trust">

          <h2>Legal information you can understand</h2>

          <p>

            Scito Jus helps you find clear information about Nigerian law,

            understand your rights, and know where to look for further help.

          </p>

        </section>

        <section className="landing-benefits" id="about">

          <p className="landing-eyebrow">WHY SCITO JUS</p>

          <h2>Understanding your rights starts here.</h2>

          <div className="benefits-grid">

            <article className="benefit-card">

              <h3>Clear Explanations</h3>

              <p>

                Understand legal concepts in simple, everyday language.

              </p>

            </article>

            <article className="benefit-card">

              <h3>Know Your Rights</h3>

              <p>

                Explore information about your rights under Nigerian law.

              </p>

            </article>

            <article className="benefit-card">

              <h3>Legal Sources</h3>

              <p>

                Find references to laws and legal provisions behind the answers.

              </p>

            </article>

          </div>

        </section>

        <section className="landing-topics" id="legal-topics">

          <p className="landing-eyebrow">EXPLORE THE LAW</p>

          <h2>What do you need help with?</h2>

          <p className="topics-description">

            Explore common legal topics and find information relevant to your situation.

          </p>

          <div className="topics-grid">
            {situations.map((situation) => (
              <button
                type="button"
                className="topic-card topic-card-button"
                key={situation}
                onClick={() => {
                  handleSituationClick(situation)
                  setShowLandingPage(false)
                }}
              >
                <h3>{situation}</h3>
                <p>{
                  situation === "Contractual Agreements" ? "Promises, purchases, services, and agreements." :
                  situation === "Duty of Care and Negligence" ? "Injuries or loss caused by a failure to take care." :
                  situation === "Defamation" ? "Harmful claims shared about a person." :
                  "Unpaid loans, invoices, and disputed demands."
                }</p>
              </button>
            ))}
          </div>

          <button

            className="landing-cta"

            onClick={() => setShowLandingPage(false)}

          >

            Explore Legal Information <span className="button-arrow" aria-hidden="true"><svg viewBox="0 0 20 20" focusable="false"><path d="M4 10h12m-5-5 5 5-5 5" /></svg></span>

          </button>

        </section>

        <section className="landing-how-it-works">

          <p className="landing-eyebrow">HOW IT WORKS</p>

          <h2>Get the information you need in three steps.</h2>

          <div className="steps-grid">

            <article className="step-card">

              <span className="step-number">01</span>

              <h3>Choose a Topic</h3>

              <p>Select a legal category related to your situation.</p>

            </article>

            <article className="step-card">

              <span className="step-number">02</span>

              <h3>Find Your Answer</h3>

              <p>Explore clear explanations of relevant Nigerian law.</p>

            </article>

            <article className="step-card">

              <span className="step-number">03</span>

              <h3>Know Your Next Step</h3>

              <p>Review the relevant legal sources and options for further help.</p>

            </article>

          </div>

        </section>

        <section className="landing-credibility">

          <p className="landing-eyebrow">BUILT ON TRUST</p>

          <h2>Legal information should be clear and responsible.</h2>

          <div className="credibility-grid">

            <article>

              <h3>Legal References</h3>

              <p>

                Find references to relevant legislation and legal provisions

                alongside legal explanations.

              </p>

            </article>

            <article>

              <h3>Transparency</h3>

              <p>

                Understand the scope of the information provided and when

                professional legal advice may be necessary.

              </p>

            </article>

            <article>

              <h3>Accessible Information</h3>

              <p>

                Explore Nigerian legal information presented in clear,

                straightforward language.

              </p>

            </article>

          </div>

          <p className="credibility-disclaimer">

            Scito Jus provides legal information, not legal advice.

          </p>

        </section>

        <section className="landing-faq" id="faq">

          <p className="landing-eyebrow">FREQUENTLY ASKED QUESTIONS</p>

          <h2>Questions about Scito Jus</h2>

          <div className="faq-list">

            <details className="faq-item">

              <summary>What is Scito Jus?</summary>

              <p>

                Scito Jus is a legal information platform designed to help

                people understand Nigerian law and their rights.

              </p>

            </details>

            <details className="faq-item">

              <summary>Is Scito Jus a law firm?</summary>

              <p>

                No. Scito Jus provides legal information and does not replace

                a qualified legal practitioner.

              </p>

            </details>

            <details className="faq-item">

              <summary>Can I rely on the information as legal advice?</summary>

              <p>

                No. The information is for general educational purposes.

                Consult a qualified legal practitioner about your specific situation.

              </p>

            </details>

            <details className="faq-item">

              <summary>How do I find information about my rights?</summary>

              <p>

                Start by exploring a legal topic or use the search feature

                in the Scito Jus platform.

              </p>

            </details>

          </div>

        </section>

        <section className="landing-contact" id="contact">
          <div className="contact-copy">
            <p className="contact-kicker">WE’RE EASY TO REACH</p>
            <h2>Let’s talk.</h2>
            <p className="contact-intro">
              Have a question or want to get in touch? Choose the channel that works best for you.
            </p>
            <span className="contact-response-note">Connect with Scito Jus</span>
          </div>

          <div className="contact-options" aria-label="Contact options">
            <a className="contact-option" href="tel:+2348085678680">
              <span className="contact-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 3.8 9.5 3l2 4.5-2.2 1.6a14.4 14.4 0 0 0 5.6 5.6l1.6-2.2 4.5 2-.8 2.5a2.3 2.3 0 0 1-2.5 1.6A16.5 16.5 0 0 1 5.4 6.3 2.3 2.3 0 0 1 7 3.8Z" /></svg></span>
              <span className="contact-option-copy"><span className="contact-option-label">Call us</span><span className="contact-option-value">08085678680</span></span>
              <span className="contact-arrow" aria-hidden="true">↗</span>
            </a>

            <a className="contact-option" href="https://wa.me/2349017838364" target="_blank" rel="noreferrer">
              <span className="contact-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z" /><path d="M9 8.5c.4 2 1.6 3.2 3.6 4" /></svg></span>
              <span className="contact-option-copy"><span className="contact-option-label">WhatsApp</span><span className="contact-option-value">09017838364</span></span>
              <span className="contact-arrow" aria-hidden="true">↗</span>
            </a>

            <a className="contact-option" href="mailto:ajetomobibethel2009@gmail.com">
              <span className="contact-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="14" rx="2" /><path d="m4.5 7 7.5 6 7.5-6" /></svg></span>
              <span className="contact-option-copy"><span className="contact-option-label">Email</span><span className="contact-option-value">ajetomobibethel2009@gmail.com</span></span>
              <span className="contact-arrow" aria-hidden="true">↗</span>
            </a>

            <a className="contact-option" href="https://www.instagram.com/bethel_triumph/" target="_blank" rel="noreferrer">
              <span className="contact-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="12" cy="12" r="3.5" /><circle className="contact-icon-dot" cx="17.5" cy="6.8" r=".8" /></svg></span>
              <span className="contact-option-copy"><span className="contact-option-label">Instagram</span><span className="contact-option-value">@bethel_triumph</span></span>
              <span className="contact-arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </section>

        <section className="landing-final-cta" id="get-legal-help">

          <h2>Ready to understand your rights?</h2>

          <p>

            Explore Nigerian legal information in clear, straightforward language.

          </p>

          <button

            className="landing-cta"

            onClick={() => setShowLandingPage(false)}

          >

            Get Started <span className="button-arrow" aria-hidden="true"><svg viewBox="0 0 20 20" focusable="false"><path d="M4 10h12m-5-5 5 5-5 5" /></svg></span>

          </button>

        </section>

        <footer className="landing-footer">

          <div className="footer-brand">

            <img

              src={`${import.meta.env.BASE_URL}scito-jus-logo-gold.png`}

              alt="Scito Jus"

              className="footer-logo"

            />

            <p>Nigerian legal information for everyday life.</p>

          </div>

          <nav className="footer-links" aria-label="Footer navigation">

            <a href="#home">Home</a>

            <a href="#about">About Us</a>

            <a href="#legal-topics">Legal Topics</a>

            <a href="#faq">FAQs</a>

          </nav>

          <p className="footer-disclaimer">

            Scito Jus provides legal information, not legal advice.

          </p>

          <p className="footer-copyright">

            © {new Date().getFullYear()} Scito Jus

          </p>

        </footer>

        {loadingScreen}

      </main>

    )

  }

  if (selectedSituation && situations.includes(selectedSituation as EverydayTopic)) {
    const topic = selectedSituation as EverydayTopic
    return (
      <main className="app">
        <header className="header">
          <button className="back-button" onClick={handleBack}>← Back</button>
          <img className="app-logo" src={`${import.meta.env.BASE_URL}scito-jus-logo-gold.png`} alt="SCITO JUS" />
        </header>
        <section className="question-page">
          <p className="eyebrow">{topic.toUpperCase()}</p>
          {activeScenario ? (
            <div className="answer-page">
              <button className="back-button scenario-back" onClick={() => setActiveScenario(null)}>← Back to {topic}</button>
              <div className="answer-badge">EVERYDAY RIGHTS</div>
              <h1>{activeScenario.title}</h1>
              <div className="answer-summary"><h2>What to know</h2><p>{activeScenario.summary}</p></div>
              <div className="answer-section"><h2>What you can do</h2><p>{activeScenario.next}</p></div>
              <p className="disclaimer">This is general information, not legal advice. The law and process can differ by state and by the facts of your situation.</p>
            </div>
          ) : (
            <>
              <h1>What do you need to know?</h1>
              <p className="description">Choose the situation that is closest to yours.</p>
              <div className="question-card">
                <h2>Everyday rights scenarios</h2>
                {everydayScenarios[topic].map((scenario) => (
                  <button className="situation-button" key={scenario.title} onClick={() => setActiveScenario(scenario)}>
                    {scenario.title}
                  </button>
                ))}
              </div>
            </>
          )}
        </section>
        {loadingScreen}
      </main>
    )
  }

  /*

   \* ARREST & POLICE

   */

  if (selectedSituation === "Arrest & Police") {

  return (

    <main className="app">

      <header className="header">

        <button className="back-button" onClick={handleBack}>

          ← Back

        </button>

        <img className="app-logo" src={`${import.meta.env.BASE_URL}scito-jus-logo-gold.png`} alt="SCITO JUS" />

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

      {loadingScreen}

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

        <img className="app-logo" src={`${import.meta.env.BASE_URL}scito-jus-logo-gold.png`} alt="SCITO JUS" />

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

          <h2>

            Explore {selectedSituation.toLowerCase()} questions

          </h2>

          {selectedSituation === "Tenancy" && (

            <>

              <button

                className="situation-button"

                onClick={() => {

                  setSearchQuery("Can my landlord evict me?")

                  setSelectedSituation(null)

                  setShowLandingPage(false)

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

                  setShowLandingPage(false)

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

                  setShowLandingPage(false)

                  setShowAnswer(false)

                  scrollToSearch()

                }}

              >

                Can my landlord keep my deposit?

              </button>

            </>

          )}

          {selectedSituation === "Bail & Detention" && (

            <>

              <button

                className="situation-button"

                onClick={() => {

                  setActiveAnswer("bailApplication")

                  setSelectedSituation("Arrest & Police")

                  setQuestion(1)

                  setShowAnswer(true)

                }}

              >

                How can I apply for bail?

              </button>

              <button

                className="situation-button"

                onClick={() => {

                  setSearchQuery("How long can the police detain me?")

                  setSelectedSituation(null)

                  setShowLandingPage(false)

                  setShowAnswer(false)

                  scrollToSearch()

                }}

              >

                How long can the police detain me?

              </button>

            </>

          )}

          {selectedSituation === "Employment" && (

            <>

              <button

                className="situation-button"

                onClick={() => {

                  setSearchQuery("What can I do if my employer refuses to pay my salary?")

                  setSelectedSituation(null)

                  setShowLandingPage(false)

                  setShowAnswer(false)

                  scrollToSearch()

                }}

              >

                What if my employer refuses to pay my salary?

              </button>

              <button

                className="situation-button"

                onClick={() => {

                  setSearchQuery("Can my employer dismiss me without notice?")

                  setSelectedSituation(null)

                  setShowLandingPage(false)

                  setShowAnswer(false)

                  scrollToSearch()

                }}

              >

                Can my employer dismiss me without notice?

              </button>

            </>

          )}

          {selectedSituation === "Consumer Rights" && (

            <>

              <button

                className="situation-button"

                onClick={() => {

                  setSearchQuery("Can I get a refund for a faulty product?")

                  setSelectedSituation(null)

                  setShowLandingPage(false)

                  setShowAnswer(false)

                  scrollToSearch()

                }}

              >

                Can I get a refund for a faulty product?

              </button>

              <button

                className="situation-button"

                onClick={() => {

                  setSearchQuery("What can I do if a seller refuses to refund me?")

                  setSelectedSituation(null)

                  setShowLandingPage(false)

                  setShowAnswer(false)

                  scrollToSearch()

                }}

              >

                What if a seller refuses to refund me?

              </button>

            </>

          )}

        </div>

      </section>

      {loadingScreen}

    </main>

  )

}

  /*

   \* HOMEPAGE

   */

  return (

    <main className="app">

      <header className="header">

        <img className="app-logo homepage-app-logo" src={`${import.meta.env.BASE_URL}scito-jus-logo-gold.png`} alt="SCITO JUS" />

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

        <button className="header-button account-button" onClick={() => setShowLoginPage(true)}>{authUser ? "My account" : "Log in"}</button>

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

      {loadingScreen}

    </main>

  )

}

export default App


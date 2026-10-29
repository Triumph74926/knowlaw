import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase, supabaseConfigured } from "./authClient"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

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
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallHelp, setShowInstallHelp] = useState(false)
  const [isAppInstalled, setIsAppInstalled] = useState(() =>
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
  )
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
    "Tenancy and Housing",
    "Consumer Rights",
    "Employment and Workplace",
    "Land and Property",
    "Family and Inheritance",
    "Police Encounters and Complaints",
  ] as const

  const legalReference = (title: string, provision: string, relevance: string, sourceUrl: string) => ({
    title,
    provision,
    relevance,
    sourceUrl,
  })

  const everydayScenarios = {
    "Contractual Agreements": [
      { title: "A seller did not deliver what I paid for", summary: "A payment, receipt, messages, and any agreed delivery date can help show what both sides agreed to. Keep the records and contact the seller in writing to ask for delivery or a solution.", application: "If the seller was acting as a business, consumer-protection rules about timely performance may apply. Your order terms and proof of payment will help clarify what was promised.", references: [{ title: "Federal Competition and Consumer Protection Act 2018", provision: "Sections 130 and 146", relevance: "Section 130 addresses timely delivery and consumer redress for covered goods or services; section 146 provides for enforcement of consumer rights.", sourceUrl: "https://fccpc.gov.ng/wp-content/uploads/2022/07/FCCPA-2018.pdf" }, { title: "Evidence Act 2011 (as amended)", provision: "Sections 131 and 134", relevance: "These provisions address proof of asserted facts and the civil standard of proof.", sourceUrl: "https://wipolex-res.wipo.int/edocs/lexdocs/laws/en/ng/ng055en_1.pdf" }], next: "Save your receipt and messages. State clearly what you agreed to and what you want the seller to do. If the issue is not resolved, seek advice about the options available in your state." },
      { title: "Someone did not keep a promise in our agreement", summary: "An agreement may be written, spoken, or shown by the parties’ actions. What can be done depends on the terms, the evidence, and the type of agreement.", application: "This is generally assessed under contract principles: what was agreed, whether the promise formed part of the contract, and whether it was broken. The applicable rules can depend on the type of contract and state.", references: [{ title: "Common-law contract principles", provision: "Breach of contract", relevance: "Contract remedies depend on the agreement, the breach, available evidence, and applicable state law; there is no single constitutional section governing every private agreement.", sourceUrl: "https://nigerialii.org/" }, { title: "Evidence Act 2011 (as amended)", provision: "Sections 131 and 134", relevance: "A party asserting facts to establish a claim must prove them; civil claims are generally assessed on the balance of probabilities.", sourceUrl: "https://wipolex-res.wipo.int/edocs/lexdocs/laws/en/ng/ng055en_1.pdf" }], next: "Keep the agreement and related messages. Write down what happened and ask the other person to explain or put things right. Get legal advice before taking a major step." },
      { title: "I want to cancel an agreement", summary: "Whether you can cancel, and whether a fee or refund applies, depends on the agreement and the circumstances. Do not assume every agreement has the same cancellation rules.", application: "The statutory cancellation right in section 120 is for advance bookings, reservations, or orders and may allow a reasonable cancellation charge. Other agreements usually depend on their terms and the applicable law.", references: [{ title: "Federal Competition and Consumer Protection Act 2018", provision: "Section 120", relevance: "Provides a consumer right to cancel an advance booking, reservation, or order, subject to a reasonable charge in applicable circumstances.", sourceUrl: "https://fccpc.gov.ng/wp-content/uploads/2022/07/FCCPA-2018.pdf" }, { title: "Contract terms and applicable state law", provision: "Cancellation clauses", relevance: "For other contracts, the cancellation terms and the facts matter; section 120 is not a general right to cancel every agreement.", sourceUrl: "https://nigerialii.org/" }], next: "Read the cancellation terms and keep a copy. Tell the other party in writing that you want to cancel and ask them to identify any term they rely on." },
    ],
    "Duty of Care and Negligence": [
      { title: "I was hurt because a place was unsafe", summary: "Responsibility can depend on who controlled the place, what danger existed, whether reasonable care was taken, and how the injury happened. Each case turns on its facts.", application: "A negligence claim may ask whether the person or organisation responsible for the place owed and breached a duty of care, and whether that breach caused the injury. The details and applicable state law matter.", references: [{ title: "Common-law negligence principles", provision: "Duty, breach, causation, and damage", relevance: "These are the central issues typically considered in a negligence claim; the result depends on the facts and applicable law.", sourceUrl: "https://nigerialii.org/" }, { title: "Evidence Act 2011 (as amended)", provision: "Sections 131 and 134", relevance: "Addresses proof of the facts asserted and the civil standard of proof.", sourceUrl: "https://wipolex-res.wipo.int/edocs/lexdocs/laws/en/ng/ng055en_1.pdf" }], next: "Get medical help first. If safe, keep photos, witness details, receipts, and any incident report. Speak with a qualified legal practitioner about your situation." },
      { title: "My property was damaged by someone’s careless act", summary: "A claim may depend on evidence of the careless act, the damage it caused, and who was responsible. The cause and supporting records matter.", application: "The question is whether the other person owed a duty of care, failed to take reasonable care, and caused the damage. Evidence linking the conduct to the loss is important.", references: [{ title: "Common-law negligence principles", provision: "Duty, breach, causation, and damage", relevance: "A negligence claim generally requires proof connecting a failure to take reasonable care with the loss claimed.", sourceUrl: "https://nigerialii.org/" }, { title: "Evidence Act 2011 (as amended)", provision: "Sections 131 and 134", relevance: "Addresses who must prove asserted facts and the civil standard of proof.", sourceUrl: "https://wipolex-res.wipo.int/edocs/lexdocs/laws/en/ng/ng055en_1.pdf" }], next: "Photograph the damage, keep repair estimates and receipts, and record names of witnesses. Avoid altering important evidence before documenting it." },
      { title: "A service provider’s mistake caused me harm", summary: "The provider’s responsibilities and any possible claim depend on the service, the facts, and the harm caused. Different professional and service rules may apply.", application: "Where a business supplied a service under a consumer contract, the Act may imply a duty to use reasonable care and skill. Other professional or sector-specific rules may also apply.", references: [{ title: "Federal Competition and Consumer Protection Act 2018", provision: "Sections 142(3) and 143", relevance: "For covered business service contracts, section 142(3) implies reasonable care and skill; section 143 addresses performance within a reasonable time where none was fixed.", sourceUrl: "https://fccpc.gov.ng/wp-content/uploads/2022/07/FCCPA-2018.pdf" }, { title: "Evidence Act 2011 (as amended)", provision: "Sections 131 and 134", relevance: "Addresses proof of the facts and loss relied on in a civil claim.", sourceUrl: "https://wipolex-res.wipo.int/edocs/lexdocs/laws/en/ng/ng055en_1.pdf" }], next: "Keep contracts, messages, bills, reports, and proof of loss. Ask the provider to explain what happened, then get advice from a qualified practitioner." },
    ],
    "Defamation": [
      { title: "Someone shared a damaging claim about me", summary: "Whether a statement is defamatory depends on its words, who saw or heard it, its meaning, and the circumstances. Not every upsetting or untrue statement leads to a legal claim.", application: "A civil defamation claim may involve whether the words were defamatory, referred to you, and were communicated to someone else. Truth, context, privilege, and other defences may matter.", references: [{ title: "Common-law defamation", provision: "Elements of a civil claim", relevance: "In Asaa v Ojah, the Court of Appeal discussed proof that the words were defamatory, referred to the claimant, and were published to another person.", sourceUrl: "https://nigerialii.org/akn/ng/judgment/ngca/2015/12/eng%402015-01-12" }, { title: "Evidence Act 2011 (as amended)", provision: "Sections 131 and 134", relevance: "Addresses proof of the words, publication, and other facts relied on in a civil claim.", sourceUrl: "https://wipolex-res.wipo.int/edocs/lexdocs/laws/en/ng/ng055en_1.pdf" }], next: "Save the exact post or message, its date, and where it appeared. Avoid responding in a way that could escalate the dispute. Get legal advice before making a public accusation." },
      { title: "A harmful post about me is still online", summary: "The available steps depend on the content, platform, evidence, and applicable law. Keep a record before asking for a post to be changed or removed.", application: "An online publication may be assessed under the same civil defamation principles, while the post, link, date, reach, and account details may help identify what was published. Electronic evidence rules can apply in court.", references: [{ title: "Common-law defamation", provision: "Publication and reference to the claimant", relevance: "Defamation principles apply to statements published online; whether a claim exists depends on the full context and any defences.", sourceUrl: "https://nigerialii.org/akn/ng/judgment/ngca/2015/12/eng%402015-01-12" }, { title: "Evidence Act 2011 (as amended)", provision: "Section 84", relevance: "Sets conditions for admissibility of certain computer-produced documents and electronic records.", sourceUrl: "https://wipolex-res.wipo.int/edocs/lexdocs/laws/en/ng/ng055en_1.pdf" }], next: "Capture the full post and link, note when you saw it, and keep any replies or messages. You can report it to the platform and seek advice about further steps." },
      { title: "I received a threat of legal action over something I said", summary: "The exact words, context, truth, audience, and any available legal defences may matter. A threat alone does not decide whether a claim will succeed.", application: "A demand or threat is not a court finding. The words complained of, their context, publication, and any available defence should be assessed before you respond or repeat the statement.", references: [{ title: "Common-law defamation", provision: "Civil claim and available defences", relevance: "The potential claim depends on the statement and circumstances; a demand letter by itself does not establish liability.", sourceUrl: "https://nigerialii.org/akn/ng/judgment/ngca/2015/12/eng%402015-01-12" }, { title: "Evidence Act 2011 (as amended)", provision: "Sections 131 and 134", relevance: "Relevant to proving the facts in a civil dispute; preserve original communications and documents.", sourceUrl: "https://wipolex-res.wipo.int/edocs/lexdocs/laws/en/ng/ng055en_1.pdf" }], next: "Keep the letter or message and do not delete relevant records. Avoid repeating the statement while you get advice from a qualified legal practitioner." },
    ],
    "Debt Recovery": [
      { title: "Someone has not repaid money they borrowed", summary: "A lender may need to show that money was lent and remains unpaid. Messages, transfer records, receipts, and any repayment plan can help establish what happened.", application: "The lender would generally need evidence of the loan, the repayment terms, and the unpaid balance. A transfer alone may not explain whether money was a loan, gift, or payment for something else.", references: [{ title: "Common-law contract principles", provision: "Loan and repayment agreement", relevance: "The terms of the loan and evidence of the parties’ agreement help determine whether repayment is due.", sourceUrl: "https://nigerialii.org/" }, { title: "Evidence Act 2011 (as amended)", provision: "Sections 131 and 134", relevance: "Addresses proof of the asserted debt and the civil standard of proof.", sourceUrl: "https://wipolex-res.wipo.int/edocs/lexdocs/laws/en/ng/ng055en_1.pdf" }], next: "Gather proof of the transfer and the agreed repayment date. Send a calm written request stating the amount and asking for a response by a reasonable date." },
      { title: "A customer has not paid for work I completed", summary: "The agreement, proof that the work was done, invoices, and any objections can affect what is owed and how to recover it.", application: "A claim may depend on the agreed price, proof the work was completed as agreed, and whether the customer raised a valid dispute. Keep each record showing those points.", references: [{ title: "Common-law contract principles", provision: "Payment for agreed work", relevance: "The agreement and evidence of performance help establish whether the invoice is due and what remedies may be available.", sourceUrl: "https://nigerialii.org/" }, { title: "Evidence Act 2011 (as amended)", provision: "Sections 131 and 134", relevance: "Addresses proof of the facts supporting the debt claim and the civil standard of proof.", sourceUrl: "https://wipolex-res.wipo.int/edocs/lexdocs/laws/en/ng/ng055en_1.pdf" }], next: "Keep the agreement, invoice, delivery or completion evidence, and payment reminders. Send a clear written request and seek advice if the dispute continues." },
      { title: "I received a demand for a debt I do not recognise", summary: "Ask for details showing who says the debt is owed, how the amount was calculated, and what records support it. Do not ignore court papers or deadlines.", application: "The person claiming the debt should be able to identify its basis and provide supporting details. Limitation periods and recovery procedures vary by state and by the kind of debt.", references: [{ title: "Evidence Act 2011 (as amended)", provision: "Sections 131 and 134", relevance: "Addresses proof of the asserted debt and the civil standard of proof.", sourceUrl: "https://wipolex-res.wipo.int/edocs/lexdocs/laws/en/ng/ng055en_1.pdf" }, { title: "Applicable state limitation law", provision: "Time limits vary", relevance: "The deadline to bring a claim depends on the state, type of claim, and circumstances; get local advice promptly.", sourceUrl: "https://nigerialii.org/" }], next: "Keep the demand and related messages. Reply in writing that you dispute the debt and request supporting details. Get legal help promptly if you receive court documents." },
    ],
    "Tenancy and Housing": [
      { title: "My landlord is trying to evict me or change the locks", summary: "A landlord generally must follow the legal process that applies to the tenancy and state. A demand to leave or a lock change does not by itself explain whether the required process was followed.", application: "The type of tenancy, notices served, rent position, and state law affect the steps required to recover possession. Do not rely on rules from another state.", references: [legalReference("Applicable state tenancy and recovery-of-premises law", "State-specific", "Notice and possession procedures differ by state. Lagos has a Tenancy Law; other states have their own applicable statutes and procedures.", "https://lagosstatemoj.org/wp-content/uploads/2020/12/Tenancy-Law-2011.pdf")], next: "Keep your tenancy agreement, rent receipts, messages, and every notice. Avoid confrontation; get local legal advice promptly if you are being locked out or served court papers." },
      { title: "My landlord has not returned my deposit", summary: "Whether a deposit must be returned, and what may be deducted, depends on the agreement, the reason for the deduction, evidence of the property's condition, and applicable state law.", application: "Compare the deposit terms with the landlord's explanation and document the property's condition and any payments. Local tenancy law may also regulate deposits and service charges.", references: [legalReference("Applicable state tenancy law and agreement", "Deposit terms vary", "The tenancy agreement and local law govern the handling of deposits; the Lagos Tenancy Law includes provisions on service charges, facilities, and security deposits.", "https://lagosstatemoj.org/wp-content/uploads/2020/12/Tenancy-Law-2011.pdf")], next: "Request an itemised explanation in writing. Keep the agreement, proof of payment, move-in and move-out photos, inspection notes, and messages. Seek local advice if the dispute continues." },
    ],
    "Consumer Rights": [
      { title: "I bought a faulty or unsafe product", summary: "Consumers have statutory protections for goods that are defective, unsafe, or unsuitable in circumstances covered by the law. The product, how it was sold, and when the problem appeared can affect the remedy.", application: "For purchases covered by the FCCPA, consumer rights may include remedies for goods that fail the Act's quality and safety standards. Keep proof of purchase and describe the fault clearly to the seller.", references: [legalReference("Federal Competition and Consumer Protection Act 2018", "Sections 122 and 131–132", "These provisions address returning certain goods and the consumer's rights to safe, good-quality goods and implied quality protections.", "https://fccpc.gov.ng/wp-content/uploads/2022/07/FCCPA-2018.pdf")], next: "Stop using a product if it may be unsafe. Keep the receipt, packaging, photos, and messages; write to the seller requesting an appropriate remedy. If unresolved, the FCCPC explains its complaint process." },
      { title: "A business misled me about a product or service", summary: "A misleading claim about price, quality, features, or a service can raise consumer-protection concerns. What was said and whether it influenced the transaction matter.", application: "The FCCPA restricts false, misleading, or deceptive representations in covered consumer transactions. Save the advertisement or message and compare it with what was supplied.", references: [legalReference("Federal Competition and Consumer Protection Act 2018", "Sections 123–125", "These sections address marketing standards, fair dealings, and false, misleading, or deceptive representations.", "https://fccpc.gov.ng/wp-content/uploads/2022/07/FCCPA-2018.pdf")], next: "Save screenshots, receipts, and the seller's replies. Contact the business in writing with the specific claim and the remedy you seek; escalate through the FCCPC if needed." },
    ],
    "Employment and Workplace": [
      { title: "My employer has not paid my wages", summary: "The amount due, pay period, employment agreement, and type of worker can affect which rules apply. Keep records of work completed and payments received.", application: "For workers covered by the Labour Act, wages are generally due at the end of the agreed pay period, and a period longer than a month has limits. Other employment relationships may be governed mainly by their contract and other laws.", references: [legalReference("Labour Act", "Section 15", "Addresses when wages become due and payable for workers covered by the Act.", "https://placng.org/lawsofnigeria/laws/L1.pdf"), legalReference("National Industrial Court of Nigeria", "Employment disputes", "The Court has jurisdiction over civil causes connected with labour and employment matters.", "https://www.nicnadr.gov.ng/")], next: "Keep your contract, payslips, attendance or work records, and written requests for payment. Ask your employer in writing for the amount and date due; get advice from the Ministry of Labour, a union, or a qualified practitioner." },
      { title: "I was dismissed without notice or an explanation", summary: "The employment contract, reason for dismissal, employee category, and any applicable collective agreement can affect what process or notice is required.", application: "Labour Act notice rules apply to workers covered by that Act; other employment relationships may be governed by their terms and other applicable rules. The National Industrial Court handles employment disputes.", references: [legalReference("Labour Act", "Section 11", "Sets notice periods for workers covered by the Act and permits payment in lieu in applicable circumstances.", "https://placng.org/lawsofnigeria/laws/L1.pdf"), legalReference("National Industrial Court of Nigeria", "Employment disputes", "The Court has jurisdiction over civil causes connected with labour and employment matters.", "https://www.nicnadr.gov.ng/")], next: "Keep the termination letter, contract, staff handbook, and relevant messages. Write down the timeline and seek advice before signing a settlement or waiver." },
    ],
    "Land and Property": [
      { title: "I want to check land documents before buying", summary: "A receipt or certificate alone may not establish that a seller can transfer a valid interest. The land's location, title history, survey, and required approvals should be checked.", application: "For a statutory right of occupancy, the Land Use Act regulates certain assignments and requires Governor's consent. Other interests and customary land arrangements can involve additional state and local rules.", references: [legalReference("Land Use Act 1978", "Sections 22 and 26", "Section 22 concerns consent for specified dealings in a statutory right of occupancy; section 26 addresses transactions contrary to the Act.", "https://www.placng.org/lawsofnigeria/print.php?sn=228")], next: "Do not pay the full price based only on documents shown by the seller. Use an independent property lawyer and surveyor to search the registry, confirm boundaries and ownership history, and check required consent." },
      { title: "Someone is occupying or claiming part of my land", summary: "A boundary or possession dispute depends on the competing title documents, survey evidence, history of occupation, and applicable state or customary law.", application: "The Land Use Act provides a national framework for rights of occupancy, but it does not resolve every boundary or customary-title issue by itself. Accurate survey evidence and local law matter.", references: [legalReference("Land Use Act 1978 and applicable state or customary law", "Rights of occupancy", "The Act provides the framework for rights of occupancy; the specific title and land history must be assessed under relevant local law.", "https://www.placng.org/lawsofnigeria/print.php?sn=228")], next: "Keep title documents, survey plans, photographs, and records of occupation. Avoid removing people or structures yourself; seek advice from a property lawyer or the relevant land authority." },
    ],
    "Family and Inheritance": [
      { title: "My former partner and I disagree about arrangements for our child", summary: "A child's welfare is central to decisions about care and custody. The facts, child's needs, applicable state law, and type of family proceedings can affect the outcome.", application: "Where the Child Rights Act or a corresponding state law applies, the child's best interests are a primary consideration. A court or mediator may consider the child's welfare and each caregiver's circumstances.", references: [legalReference("Child Rights Act 2003 and applicable state Child Rights Law", "Section 1, where applicable", "The Act makes a child's best interests the primary consideration in actions concerning the child; state adoption and related family rules should be checked.", "https://edojudiciary.gov.ng/wp-content/uploads/2022/03/Childs-Right-Act-2003.pdf")], next: "Focus on the child's immediate safety and needs. Keep relevant care, school, medical, and communication records. Seek family-law advice or a recognised mediation service; do not breach an existing court order." },
      { title: "My family disagrees about who inherits a relative's property", summary: "Inheritance can depend on whether there is a valid will, the type of marriage, property ownership, and the succession rules that apply to the deceased.", application: "Nigeria does not have one inheritance rule that resolves every family estate. State legislation, the will, and in some cases customary or Islamic law can affect succession, so local advice is important.", references: [legalReference("Applicable state succession, wills, and customary or Islamic law", "Depends on the estate", "The applicable succession framework varies with the state, the deceased's circumstances, and the nature of the property; there is no single rule for every estate.", "https://www.justice.gov.ng/citizens-right/")], next: "Gather the death certificate, any will, title documents, marriage records, and a list of estate assets. Avoid selling or distributing disputed property until you have obtained local legal advice." },
    ],
    "Police Encounters and Complaints": [
      { title: "An officer stopped me or searched my phone or belongings", summary: "Police powers depend on the reason for the stop or search and the circumstances. The Constitution protects privacy and personal liberty, while laws provide specific police powers and warrant procedures.", application: "For a search under warrant, the Police Act sets safeguards for the warrant and its execution. A premises-search warrant does not automatically answer every question about a street stop or a phone search; details matter.", references: [legalReference("Constitution of the Federal Republic of Nigeria 1999", "Sections 35 and 37", "Protect personal liberty and privacy, subject to limitations permitted by law.", "https://www.nigeriarights.gov.ng/publications/more/436-constitution-of-the-federal-republic-of-nigeria-1999-cap-c23-l-f-n-2004.html"), legalReference("Nigeria Police Act 2020", "Sections 58–59", "Set requirements and procedures for search warrants and their execution.", "https://policeaffairs.gov.ng/wp-content/uploads/2024/06/Police-Act-2020.pdf")], next: "Stay calm and do not physically resist. If it is safe, ask why you are being stopped or what authority supports the search. Note the time, place, officers, witnesses, and any items taken once you are safe; seek legal help if you believe the search was unlawful." },
      { title: "An officer threatened, harassed, or used force against me", summary: "Police officers must act within the law. Constitutionally protected dignity and liberty, and statutory rules on humane treatment, may be relevant to alleged harassment or excessive force.", application: "The exact conduct, injury, context, and available evidence matter. A complaint about misconduct can be made to the Police Complaints Response Unit under the Police Act; serious injury or immediate danger requires urgent help first.", references: [legalReference("Constitution of the Federal Republic of Nigeria 1999", "Sections 34 and 35", "Protect dignity and personal liberty, subject to limitations provided by law.", "https://www.nigeriarights.gov.ng/publications/more/436-constitution-of-the-federal-republic-of-nigeria-1999-cap-c23-l-f-n-2004.html"), legalReference("Nigeria Police Act 2020", "Sections 37 and 131–134", "Section 37 requires humane treatment of suspects; sections 131–134 establish complaint handling for alleged police misconduct.", "https://policeaffairs.gov.ng/wp-content/uploads/2024/06/Police-Act-2020.pdf")], next: "Move to safety and get medical care if needed. When safe, preserve photos, medical records, witness details, and the time and location. Consider making a formal complaint through the Police Public Complaints Committee or seek urgent legal support." },
      { title: "An officer demanded money or an unofficial payment", summary: "A demand for money during a police encounter may raise serious misconduct or extortion concerns. Your immediate safety is the priority; do not put yourself at risk by confronting an officer.", application: "The Police Act provides a formal process for public complaints about police misconduct. The details of the demand, location, officers involved, and any witnesses may help an investigation.", references: [legalReference("Nigeria Police Act 2020", "Sections 131–134", "Establishes the Police Complaints Response Unit and provides for complaints about police misconduct and follow-up investigation.", "https://policeaffairs.gov.ng/wp-content/uploads/2024/06/Police-Act-2020.pdf"), legalReference("Police Public Complaints Committee", "Official complaint portal", "The Ministry of Police Affairs provides a government portal for reporting police misconduct, abuse of power, extortion, or harassment.", "https://ppcc.policeaffairs.gov.ng/contact-us/")], next: "Do not argue if that could put you in danger. Once safe, write down what happened and preserve any messages or evidence. File through an official complaint channel or ask a lawyer or trusted rights organisation to help you do so." },
      { title: "I want to make a complaint about police misconduct", summary: "You can report alleged police misconduct through formal complaint channels. The complaint process is separate from any urgent need to get to safety, medical care, or legal assistance.", application: "Sections 131–134 of the Police Act provide for a Police Complaints Response Unit to receive public complaints about misconduct and set out steps following investigation. The Ministry of Police Affairs also provides a complaint portal.", references: [legalReference("Nigeria Police Act 2020", "Sections 131–134", "Establishes the Police Complaints Response Unit and describes its functions and follow-up after investigation.", "https://policeaffairs.gov.ng/wp-content/uploads/2024/06/Police-Act-2020.pdf"), legalReference("Police Public Complaints Committee", "Submit a complaint", "Government complaint portal for police misconduct, abuse of power, extortion, harassment, and other grievances.", "https://ppcc.policeaffairs.gov.ng/contact-us/")], next: "Record the date, time, location, officer details if known, witnesses, and what happened. Keep copies of relevant evidence and ask for a complaint reference number. If you face immediate danger, get to safety and seek urgent help first." },
    ],
  } as const
  type EverydayTopic = keyof typeof everydayScenarios
  type EverydayScenario = (typeof everydayScenarios)[EverydayTopic][number]
  const topicDescriptions: Record<EverydayTopic, string> = {
    "Contractual Agreements": "Promises, purchases, services, and agreements.",
    "Duty of Care and Negligence": "Injuries or loss caused by a failure to take care.",
    "Defamation": "Harmful claims shared about a person.",
    "Debt Recovery": "Unpaid loans, invoices, and disputed demands.",
    "Tenancy and Housing": "Rent, deposits, repairs, notices, and eviction.",
    "Consumer Rights": "Faulty goods, misleading sales, refunds, and service problems.",
    "Employment and Workplace": "Unpaid wages, dismissal, and workplace issues.",
    "Land and Property": "Land documents, ownership, boundaries, and acquisition.",
    "Family and Inheritance": "Children, family disputes, and succession questions.",
    "Police Encounters and Complaints": "Police stops, searches, alleged harassment, and complaint options.",
  }
  const [activeScenario, setActiveScenario] = useState<EverydayScenario | null>(null)

  useEffect(() => {
    const handleBeforeInstall = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }
    const handleInstalled = () => {
      setIsAppInstalled(true)
      setInstallPrompt(null)
      setShowInstallHelp(false)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)
    window.addEventListener("appinstalled", handleInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
      window.removeEventListener("appinstalled", handleInstalled)
    }
  }, [])

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
    /police|officer|harass|extort|bribe|detain|detention|arrest|search warrant|police brutality/.test(query) ? "Police Encounters and Complaints" :
    /landlord|tenant|tenancy|rent|evict|eviction|deposit|housing|lease|repair/.test(query) ? "Tenancy and Housing" :
    /consumer|purchase|seller|deliver|refund|faulty|defective|product|goods|mislead/.test(query) ? "Consumer Rights" :
    /employment|employer|employee|workplace|salary|wages|dismiss|fired|work injury/.test(query) ? "Employment and Workplace" :
    /inherit|estate|custody|divorce|family|child support|marriage/.test(query) ? "Family and Inheritance" :
    /property|land|boundary|encroach|title deed|ownership|acquisition/.test(query) ? "Land and Property" :
    /contract|agreement|promise/.test(query) ? "Contractual Agreements" :
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

  window.alert("We couldn't match your question to a legal topic yet. Try different words or explore a section.")
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

  const handleInstallApp = async () => {
    if (!installPrompt) {
      setShowInstallHelp(true)
      return
    }

    const promptEvent = installPrompt
    setInstallPrompt(null)
    await promptEvent.prompt()
    const choice = await promptEvent.userChoice
    if (choice.outcome === "accepted") setIsAppInstalled(true)
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

            {!isAppInstalled && (
              <button className="landing-login-button install-app-button" onClick={() => { setMobileMenuOpen(false); void handleInstallApp() }}>
                Install app
              </button>
            )}

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
              <div><strong>{String(situations.length).padStart(2, "0")}</strong><span>legal topics</span></div>
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
                <p>{topicDescriptions[situation]}</p>
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

        {showInstallHelp && (
          <div className="install-help-backdrop" onClick={() => setShowInstallHelp(false)}>
            <section className="install-help-dialog" role="dialog" aria-modal="true" aria-labelledby="install-help-title" onClick={(event) => event.stopPropagation()}>
              <button className="install-help-close" aria-label="Close install instructions" onClick={() => setShowInstallHelp(false)}>×</button>
              <p className="install-help-kicker">SCITO JUS ON YOUR DEVICE</p>
              <h2 id="install-help-title">Install the app</h2>
              <p className="install-help-intro">Add SCITO JUS to your home screen or desktop for quick, app-like access.</p>
              <ol>
                <li><strong>iPhone or iPad:</strong> tap Share in Safari, then choose <em>Add to Home Screen</em>.</li>
                <li><strong>Android:</strong> open your browser menu and choose <em>Install app</em> or <em>Add to Home screen</em>.</li>
                <li><strong>Computer:</strong> use the install icon in the address bar, or choose <em>Install SCITO JUS</em> from your browser menu.</li>
              </ol>
              <button className="landing-cta install-help-done" onClick={() => setShowInstallHelp(false)}>Got it</button>
            </section>
          </div>
        )}

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
              <div className="answer-boxes">
                <section className="answer-summary answer-box">
                  <span className="answer-box-number">01</span>
                  <div><h2>What to know</h2><p>{activeScenario.summary}</p></div>
                </section>
                <section className="answer-box answer-law-box">
                  <span className="answer-box-number">02</span>
                  <div className="answer-box-content">
                    <h2>Relevant law and references</h2>
                    <div className="legal-reference-list">
                      {activeScenario.references.map((reference) => (
                        <article className="legal-reference" key={`${reference.title}-${reference.provision}`}>
                          <div className="legal-reference-heading">
                            <h3>{reference.title}</h3>
                            <span>{reference.provision}</span>
                          </div>
                          <p>{reference.relevance}</p>
                          <a href={reference.sourceUrl} target="_blank" rel="noreferrer">View source <span aria-hidden="true">↗</span></a>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
                <section className="answer-section answer-box">
                  <span className="answer-box-number">03</span>
                  <div><h2>How this relates to your situation</h2><p>{activeScenario.application}</p></div>
                </section>
                <section className="answer-section answer-box answer-action-box">
                  <span className="answer-box-number">04</span>
                  <div><h2>What you can do</h2><p>{activeScenario.next}</p></div>
                </section>
              </div>
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
            <div className="answer-boxes">
              <section className="answer-summary answer-box">
                <span className="answer-box-number">01</span>
                <div>
                  <h2>What to know</h2>
                  <p>{legalAnswers[activeAnswer].shortAnswer}</p>
                </div>
              </section>
              <section className="answer-law-box answer-box">
                <span className="answer-box-number">02</span>
                <div className="answer-box-content">
                  <h2>Relevant law and references</h2>
                  {legalAnswers[activeAnswer].law.length > 0 ? (
                    <div className="legal-reference-list">
                      {legalAnswers[activeAnswer].law.map((law) => (
                        <article className="legal-reference" key={`${law.name}-${law.section}`}>
                          <div className="legal-reference-heading">
                            <h3>{law.name}</h3>
                            <span>{law.section}</span>
                          </div>
                          <p>{law.description}</p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="reference-pending">
                      Specific references for this answer are still being reviewed. The applicable rules may depend on your state and the details of the situation.
                    </p>
                  )}
                </div>
              </section>
              <section className="answer-section answer-box">
                <span className="answer-box-number">03</span>
                <div>
                  <h2>How this relates to your situation</h2>
                  <p>{legalAnswers[activeAnswer].explanation}</p>
                  {legalAnswers[activeAnswer].exceptions.length > 0 && (
                    <ul className="answer-detail-list">
                      {legalAnswers[activeAnswer].exceptions.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  )}
                </div>
              </section>
              <section className="answer-section answer-box answer-action-box">
                <span className="answer-box-number">04</span>
                <div>
                  <h2>What you can do</h2>
                  <p>{legalAnswers[activeAnswer].whatToDo}</p>
                </div>
              </section>
            </div>
            <div className="source-info">
              <p><strong>Last verified:</strong> {legalAnswers[activeAnswer].lastVerified}</p>
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
              This information is for general educational purposes and is not a substitute for professional legal advice.
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


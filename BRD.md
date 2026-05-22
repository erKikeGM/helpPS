# Business Requirements Document (BRD) — Relationship Prevention & Protection Platform v2
## Safety Mind Framework as Core Methodology

**Audience:** Product leadership, development team, AI build agents, safety reviewers, clinical/cultural advisors  
**Purpose:** Define what the platform must achieve, what boundaries the build cannot cross, and how the Safety Mind Framework must operate as the platform’s core user-relief, problem-solving, mitigation, and prevention methodology.  
**Companion documents:** Serious Relationship Prevention & Protection Model; Product Requirements Specification v1; Safety & AI Governance Specification v1.  
**Authority order on conflicts:** Serious Relationship Prevention & Protection Model > Safety Mind Framework > BRD > Product Spec > implementation choices. If this BRD conflicts with the framework, the framework wins. If product implementation conflicts with the BRD, the BRD wins.

---

## How to use this document

This BRD defines **outcomes, methodology, guardrails, and key requirements**. It deliberately does not prescribe architecture, vendor choice, full UI design, or tech stack beyond what is necessary to protect users.

Build agents have freedom within these bounds:

- If a requirement is stated, it must be met.
- If a guardrail is stated, the build cannot cross it.
- If an outcome is stated, the build must demonstrably contribute to it.
- If a Safety Mind method is stated, the platform must support it through content, flows, or routing.
- Everything else is a design choice for the build team to make and justify.

When in doubt, default to the most protective interpretation, not the most permissive.

---

# 1. Business Objectives

## 1.1 Primary objective

Build a consumer platform that helps adults in committed relationships prevent avoidable breakdown, protect themselves and their children when relationships become harmful, and access appropriate support — without overpromising clinical capability, enabling surveillance, or encouraging emotional dependency on AI.

## 1.2 Strategic objectives

- Establish the platform as a credible, safety-first operator in family wellbeing and AI-supported relational health.
- Demonstrate a deployable model of safety-first AI in a high-stakes consumer category.
- Build a defensible position before less safety-conscious competitors define the category.
- Create a foundation that supports public-sector, NGO, employer, and institutional partnership in later phases.
- Operationalize the Safety Mind Framework as a structured method for user relief, problem solving, mitigation, and escalation.

## 1.3 What the platform is not

- Not a therapy service.
- Not a diagnostic tool.
- Not a marriage-saving service.
- Not a surveillance product.
- Not a crisis response service.
- Not an AI companion or partner-replacement service.
- Not a happiness-entertainment app.
- Not an emotional dependency engine.

These exclusions are ethical, safety, and commercial positioning boundaries.

---

# 2. Core Methodology: Safety Mind Framework

The platform must use the **Safety Mind Framework** as its core user-relief and problem-solving methodology.

The Safety Mind Framework is not a therapy model and must not be presented as clinical treatment. It is a structured self-reflection and mitigation method that helps users distinguish between immediate danger, emotional overload, distorted interpretation, solvable stressors, capacity gaps, and problems requiring external support.

## 2.1 Foundational premise: baseline calm and safety

The platform should not sell “happiness” as a product. Its baseline goal is to help users move toward:

- calm,
- safety,
- clarity,
- dignity,
- reduced suffering,
- appropriate action,
- and correct escalation.

In platform terms, distress is treated as a signal. The product helps users understand the signal and route it safely.

## 2.2 Safety Mind Equation

The platform should operationalize the following adapted equation:

> **Relational Distress = Perception of Events − Expectations / Needs / Safety Requirements**

A user may be distressed because:

- the event is genuinely unsafe,
- the relationship expectation was unrealistic,
- a core need is unmet,
- the mind is adding catastrophic interpretation,
- a practical problem needs action,
- or the user lacks capacity/support to respond.

The product must not assume distress is “just perception.” If the event indicates abuse, coercion, violence, self-harm, child risk, or serious crisis, the platform routes to protection, not mindset reframing.

## 2.3 Signal vs. suffering distinction

The platform should help users distinguish:

- **Pain / Signal:** a useful alarm that something needs attention.
- **Suffering / Loop:** repeated mental replay, catastrophic projection, self-blame, or story-building that does not improve safety or action.

Relationship-specific examples:

- Signal: “My partner controls all the money and I cannot access funds.”  
  Route: Pathway 4 / financial abuse support.
- Signal: “We are under debt pressure and avoiding money conversations.”  
  Route: financial stress support and money meeting if safe.
- Loop: “Because we argued once, the relationship is doomed.”  
  Route: reflection, truth test, action test, repair prompt.
- Loop: “If I set a boundary with my in-laws, everyone will hate me forever.”  
  Route: expectation check, values clarification, support planning.

## 2.4 Safety-first override

The Safety Mind Framework must never be used to calm users into tolerating danger. Safety screening always precedes reframing.

If a user reports abuse, fear, coercive control, sexual coercion, child risk, self-harm, or imminent violence, the platform must bypass ordinary reflection and route to safety support.

---

# 3. Safety Mind Taxonomy

The platform must classify stress and distress using a relationship-specific adaptation of the TON model.

## 3.1 TON model — relationship adaptation

| Source | High Intensity | Low Intensity |
|---|---|---|
| **External** | **T — Trauma / Threat**: abuse, violence, betrayal, miscarriage, death, serious illness, forced separation, custody conflict, sudden job loss, eviction, immigration dependency crisis | **N — Nuisance / Friction**: ignored message, messy kitchen, late arrival, family comment, phone distraction, small money disagreement |
| **Internal** | **O — Obsession / Loop**: repeated fear story, jealousy loop, catastrophic interpretation, “I will be abandoned,” “I am trapped forever,” “I am worthless” | **N — Noise / Background Chatter**: self-criticism, comparison, minor resentment, insecurity, irritation, shame after small conflict |

## 3.2 Required platform behavior by TON type

### T — Trauma / Threat

Examples:

- Physical violence.
- Sexual coercion.
- Financial control.
- Threats involving children.
- Discovery of major betrayal.
- Serious illness or death.
- Unsafe separation.

Platform response:

- Do not reframe as mindset.
- Run safety classifier.
- Route to crisis/safety support if thresholds are met.
- Offer grounding only as stabilization, not resolution.
- Surface resource directory or professional support.
- Disable couple tools if coercion risk is present.

### O — Obsession / Loop

Examples:

- “They didn’t reply; they must be cheating.”
- “If I ask for money transparency, they will leave me.”
- “I failed as a parent because we argued.”
- “No one will ever love me again.”

Platform response:

- Use Safety Mind Recovery Flow.
- Identify trigger thought.
- Apply Truth Test.
- Apply Action Test.
- If no action is possible, move to acceptance-and-commitment prompt.
- If loop suggests self-harm, coercion, or imminent danger, escalate.

### External Nuisance

Examples:

- Late reply.
- Repeated small mess.
- Phone during dinner.
- In-law comment.
- Small spending disagreement.

Platform response:

- Offer micro-repair scripts.
- Suggest low-burden action.
- Reduce intensity: change timing, setting, notification pattern, or routine.
- Avoid over-escalation unless pattern repeats or safety signals appear.

### Internal Noise

Examples:

- “I am not attractive enough.”
- “I always ruin things.”
- “Other couples are happier.”
- “I should not need help.”

Platform response:

- Offer self-compassion and truth-check prompts.
- Route to mental health support if persistent or severe.
- Avoid clinical diagnosis.
- Encourage human support if the pattern is recurring.

---

# 4. Burnout Load Methodology

The platform must treat relational burnout as cumulative load, not only a single problem.

## 4.1 Burnout Load Formula

> **Relational Burnout Load = Σ (Stressors × Intensity × Frequency × Duration × Available Capacity)**

Available capacity includes:

- sleep,
- income stability,
- health,
- caregiving burden,
- emotional regulation,
- social support,
- safety,
- neurodivergence/executive function,
- work pressure,
- and cultural/family pressure.

## 4.2 Required Burnout Load Assessment

The platform must provide a non-clinical “load audit” that helps users identify cumulative stressors.

Required categories:

- Relationship conflict.
- Money stress.
- Parenting/caregiving load.
- Work stress.
- Health or body signals.
- Family/in-law pressure.
- Digital distraction.
- Loneliness.
- Betrayal/trust stress.
- Safety/fear signals.
- Children’s wellbeing concerns.
- Housing/legal/immigration stress.

## 4.3 Safety Mind Load Audit

The platform must include a recurring load-audit flow.

Minimum flow:

1. **Inventory:** list active stressors.
2. **Classify:** TON type and relationship problem area.
3. **Score:** intensity, frequency, duration, and capacity.
4. **Delete:** remove stressors that can be safely removed.
5. **Reduce:** lower intensity of stressors that cannot be removed.
6. **Support:** identify external help needed.
7. **Escalate:** route safety, crisis, or child-risk signals.

Relationship-specific examples:

- Delete: stop discussing money at midnight; move to a scheduled daytime conversation.
- Delete: turn off non-essential notifications during couple time.
- Reduce: if in-law visits trigger conflict, shorten visits and agree on boundaries.
- Reduce: if commute stress fuels evening conflict, decompress before entering family conversation.
- Support: if caregiving load is breaking the relationship, bring external caregiving help.
- Escalate: if financial control or fear is present, route to Pathway 4.

---

# 5. Four Modalities of Distress

The platform must support the Safety Mind four-modality model. The model helps users identify where distress is showing up and what kind of response is appropriate.

## 5.1 Mental modality

Signals:

- racing thoughts,
- catastrophic projections,
- repeated jealousy stories,
- negative interpretation,
- “mind reading” the partner,
- replaying arguments.

Platform response:

- Truth Test.
- Action Test.
- reframing only if safe.
- “one side of the story” reminder.
- escalation if thoughts indicate self-harm or harm to others.

## 5.2 Emotional modality

Signals:

- anger,
- sadness,
- shame,
- resentment,
- fear,
- numbness,
- grief,
- betrayal pain.

Platform response:

- acknowledge emotion,
- name the need,
- avoid suppression,
- offer repair language,
- route to human support when intense or persistent.

## 5.3 Physical modality

Signals:

- sleep disruption,
- headaches,
- stomach pain,
- chest tightness,
- panic sensations,
- fatigue,
- body tension,
- shutdown.

Platform response:

- grounding prompts,
- body check-in,
- suggest rest/medical care if relevant,
- route to crisis support if physical danger or panic risk appears.

## 5.4 Purpose / values modality

Signals:

- emptiness,
- “I lost myself,”
- values conflict,
- spiritual/religious distress,
- family role conflict,
- meaninglessness,
- disconnection from identity.

Platform response:

- values clarification,
- family/culture-aware reflection,
- support planning,
- trusted mediator or counselor referral when needed.

---

# 6. Fear, Worry, Anxiety, and Panic Routing

The platform must distinguish types of future-oriented distress.

| State | User experience | Platform response |
|---|---|---|
| **Fear** | Known future threat | Identify action, prepare, protect, or escalate |
| **Worry** | Uncertain future threat | Decide: act, wait, gather information, or release loop |
| **Anxiety** | “I may not be capable” | Identify skill/support gap; suggest support, training, counseling, or outsourcing |
| **Panic** | Imminent threat + time scarcity | Reduce immediate load, cancel non-essentials, seek urgent human support |

Examples:

- Fear: “My partner threatened me if I leave.” → safety planning.
- Worry: “Maybe they are upset because they replied late.” → truth/action flow.
- Anxiety: “I cannot handle co-parenting after separation.” → skills, mediator, legal/parenting support.
- Panic: “They are outside my door and angry.” → quick exit, emergency resources, urgent support.

---

# 7. Safety Mind Recovery Flow

The platform must include a guided recovery flow for non-imminent, non-coercive distress.

## 7.1 Recovery Flow steps

1. **Acknowledge:** What am I feeling?
2. **Trigger:** What thought or interpretation is driving the feeling?
3. **Safety Check:** Is there danger, coercion, self-harm, child risk, or violence risk?
4. **Truth Test:** What do I know as fact? What am I assuming?
5. **Action Test:** What can I do now that is safe, respectful, and proportionate?
6. **Capacity Check:** Do I have enough energy/support to act now?
7. **Accept and Commit:** If no action can change the event, what can I accept, and what value-based step can I take?
8. **Support Routing:** Do I need human support, professional help, legal/financial help, or crisis resources?

## 7.2 Required examples inside the product

The product should use relationship-specific examples, not generic luxury or phone analogies.

Examples:

### Example 1 — Late reply spiral

- Event: Partner has not replied for four hours.
- Trigger thought: “They do not care about me.”
- Truth Test: “I know they have not replied. I do not know why.”
- Action Test: “Send one calm message or wait until agreed check-in time.”
- Mitigation: “Do not send ten messages while activated.”

### Example 2 — Money fight

- Event: Unexpected purchase appears on shared card.
- Trigger thought: “They are irresponsible and do not respect me.”
- Truth Test: “I know the purchase happened. I do not yet know context.”
- Action Test: “Ask during monthly money conversation; set spending threshold if safe.”
- Safety override: if one partner controls money or punishes spending, route to financial abuse support.

### Example 3 — In-law pressure

- Event: Family criticizes parenting decision.
- Trigger thought: “If I set a boundary, I will be rejected.”
- Truth Test: “Family may be upset. Rejection is not certain.”
- Action Test: “Agree with partner on one boundary and one respectful sentence.”
- Escalation: if family pressure traps or silences one partner, route to coercive family dynamics support.

### Example 4 — Parenting overload

- Event: One partner feels like the default parent.
- Trigger thought: “I am alone in this family.”
- Truth Test: “I am carrying many tasks. I need to identify which are invisible.”
- Action Test: “Use task visibility exercise if safe; ask for one concrete redistribution.”
- Support: parenting coach or family support if repeated.

### Example 5 — AI companion conflict

- Event: Partner uses romantic AI companion privately.
- Trigger thought: “I am being replaced.”
- Truth Test: “I know the AI companion exists. I need to understand the boundary impact.”
- Action Test: “Have a values/boundary conversation; define what is acceptable.”
- Escalation: if secrecy or sexual/emotional betrayal persists, route to trust/infidelity pathway.

### Example 6 — Unsafe disagreement

- Event: Partner becomes threatening when challenged.
- Trigger thought: “Maybe I should communicate better.”
- Safety Check: “Do I feel afraid to disagree?”
- If yes: do not use communication tools. Route to protection support.

---

# 8. Dopamine vs. Stability Principle

The platform must not encourage users to replace unresolved relationship pain with distraction, entertainment, or addictive engagement.

## 8.1 Product implication

The platform must not optimize for:

- session length,
- repeated emotional venting,
- endless AI conversation,
- crisis dependency,
- or gamified emotional relief.

## 8.2 Required design principle

The product should help users move from:

- venting → clarity,
- clarity → safe action,
- safe action → support or resolution,
- support/resolution → graduation.

Fun, encouragement, or warm tone can support the experience, but must not become a dopamine substitute for real problem solving.

---

# 9. Success Outcomes

The platform succeeds if it delivers the following user outcomes. These outcomes — not engagement metrics — define success.

## 9.1 User outcomes

**O1. Users in functional relationships gain practical tools.**  
Measured by: validated short wellbeing instrument (opt-in, before/after); user-reported usefulness of structured exercises.

**O2. Users can reduce distress load using Safety Mind methods.**  
Measured by: completed load audits, reduction in self-reported overload, and successful use of recovery flows.

**O3. Users in crisis reach appropriate human support.**  
Measured by: resource-directory engagement when crisis signals are detected; opt-in confirmation that user reached support.

**O4. Users in coercive or unsafe relationships are not harmed by the platform.**  
Measured by: zero partner exposure incidents; zero coercive feature-use incidents; Pathway 4 users complete safety planning at higher rates than baseline self-help.

**O5. Users separating do so with structure and dignity.**  
Measured by: Pathway 6 users access legal, financial, and child-protection resources; users report reduced conflict during separation.

**O6. Users graduate when ready.**  
Measured by: voluntary account closure with positive wellbeing change; users explicitly state they no longer need the platform.

## 9.2 Operational outcomes

**O7. Safety classifier performs above defined thresholds.**  
False negative rate on crisis and coercion signals must remain below thresholds defined during Phase 0 red-teaming.

**O8. Safety Mind classification is reliable and useful.**  
The platform can classify user distress into safety pathway, TON type, modality, fear/worry/anxiety/panic state, and appropriate mitigation route.

**O9. Zero data exposure incidents.**  
No partner sees another partner’s private data. No external party receives user data outside valid legal process. No model training occurs on user content without explicit, separate consent.

**O10. Regulatory compliance maintained.**  
KSA PDPL compliance, data residency compliance, age-gating compliance, AI governance compliance — continuously.

## 9.3 Metrics explicitly not success criteria

These are prohibited as primary KPIs:

- Daily active users.
- Session length.
- Message volume.
- Retention as duration of continuous use.
- AI conversation depth or turn count.
- Emotional dependency indicators.
- Feature adoption velocity for sharing/surveillance-shaped features.

If requested as primary metrics, escalate to product leadership.

---

# 10. Non-Negotiable Guardrails

## G1. Safety classifier runs on every user input

No exceptions for performance, cost, or convenience. If the classifier is unavailable, user inputs that would normally route to AI processing are queued or refused, not processed.

## G2. Safety Mind does not override safety

No Safety Mind reframing, truth test, acceptance prompt, or calm-down flow may be used to keep a user in danger or minimize abuse.

## G3. No partner sees another partner’s private data

Under any circumstance, including account recovery, customer support, billing, technical debugging, or linked-partner access.

## G4. No clinical claims in user-facing surfaces

No diagnosis, no scoring, no prediction of relationship outcomes, no labeling of users or partners. Educational framing only.

## G5. Couple features are unavailable to users flagged for coercive-control patterns

The flag is silent. The protected user is routed to safety support. The partner sees only generic unavailability.

## G6. The platform refuses interactions it cannot safely handle

When safety signals exceed thresholds, normal AI dialogue stops and relevant resources are surfaced.

## G7. Quick-exit functionality is always available

On every screen, accessible without authentication, returning the app to a neutral state.

## G8. No advertising, no data sale, no engagement-driven dark patterns

Revenue must come from subscription, partnership, or institutional sponsorship.

## G9. No AI companion features

No simulated romantic partner, AI spouse, boyfriend/girlfriend, or exclusive emotional relationship simulation.

## G10. Age-gated at 18+

Minors are out of scope for v1.

## G11. KSA data residency

User data is processed and stored in KSA-compliant infrastructure. Cross-border processing requires PDPL-compliant agreements and user disclosure.

## G12. No evidence packages

The platform does not generate exports designed for custody, divorce, or legal proceedings. Standard user data export is permitted; legal-evidence formatting is not.

## G13. “One side of the story” principle is hard-coded

Every reflection session involving an absent partner must operate under this principle.

## G14. Crisis-trigger interactions are logged and reviewable

For platform safety improvement, not surveillance. Users can see their own crisis-trigger log.

## G15. No feature ships without safety review

Every feature processing user content must pass safety review before production.

---

# 11. Key Requirements

## 11.1 Identity and account

**R1.1** Individual account is the primary unit. Users can use the full platform without ever linking to a partner.

**R1.2** Partner linking is opt-in, requires authentication from both partners on separate devices, and is revocable by either partner unilaterally and silently.

**R1.3** A user may have at most one active partner link at a time.

**R1.4** Account deletion is available without justification, with a 30-day recovery window, then full deletion.

**R1.5** Data export is available in a portable format.

## 11.2 Safety screening

**R2.1** Every new user completes a behavior-based safety screen during onboarding.

**R2.2** The screen uses descriptive questions, not labels.

**R2.3** The screen internally classifies the user into one of the relationship pathways.

**R2.4** The screen is re-runnable by the user at any time.

**R2.5** Users flagged in Pathway 4 receive the Pathway 4 experience automatically without being told they have been “diagnosed.”

## 11.3 Safety Mind assessment

**R3.1** The platform provides a Safety Mind assessment that classifies distress by TON type, modality, fear/worry/anxiety/panic state, burnout load, and relationship problem area.

**R3.2** Safety Mind assessment must occur only after safety screening or in parallel with safety classification.

**R3.3** The platform must support Safety Mind Recovery Flow for non-imminent, non-coercive distress.

**R3.4** The platform must provide a recurring load audit.

**R3.5** The platform must provide examples contextualized to relationship problems, not generic luxury or phone examples.

**R3.6** The platform must track whether a user was routed to relief, problem solving, mitigation, support, protection, or healthy ending.

## 11.4 AI orchestration

**R4.1** The platform uses multiple AI models with defined roles. No single model handles all interactions.

**R4.2** A safety classifier runs in parallel with every user message.

**R4.3** A Safety Mind classifier identifies TON type, modality, threat state, and recovery-route eligibility.

**R4.4** A router model selects the appropriate downstream model or non-AI flow.

**R4.5** Reflection, content delivery, Safety Mind coaching, and couple-mediation models operate under documented behavioral constraints.

**R4.6** Model hand-offs are logged and accessible to the user for their own interactions.

**R4.7** Where in-region model hosting is required, vendors must meet residency and capability requirements.

## 11.5 Pathway-specific experience

**R5.1** The platform delivers six pathway-specific experiences.

**R5.2** Pathway 4 disables couple features, surveillance-shaped features, and prioritizes safety planning and resource directory.

**R5.3** Pathway 6 disables couple features by default; structured separation conversation mode requires explicit mutual opt-in.

**R5.4** Pathway transitions are handled gracefully and protectively.

## 11.6 Content and exercises

**R6.1** Content is grounded in the Serious Relationship Prevention & Protection Model and Safety Mind Framework.

**R6.2** Content cannot be invented by AI; it can be presented, contextualized, and adapted from approved content.

**R6.3** Content is reviewed by qualified clinical and cultural advisors before deployment.

**R6.4** Arabic-language content quality matches English-language content quality.

**R6.5** KSA deployment is not a translation layer over English content.

**R6.6** Content is culturally appropriate without compromising safety principles.

## 11.7 Crisis handoff

**R7.1** The platform maintains a KSA-specific resource directory for v1.

**R7.2** Crisis triggers surface appropriate resources within the same screen state.

**R7.3** Onboarding and crisis screens state clearly that the platform is not therapy and not a crisis service.

**R7.4** Mandatory disclosure rules, where applicable, are stated before sensitive information is collected.

## 11.8 Consent and privacy

**R8.1** Consent is layered: account, link, feature, session, AI processing, Safety Mind assessment, shared data.

**R8.2** Every layer is opt-in and revocable.

**R8.3** Users can see which models processed their data and which classifiers fired.

**R8.4** Users can see every shared feature they have opted into.

**R8.5** Inactive accounts are deleted after 90 days unless the user objects.

**R8.6** Crisis event logs are anonymized after 30 days and deleted after 1 year unless legally required to retain.

## 11.9 Pathway 4 specifics

**R9.1** Quick-exit feature is available on every screen.

**R9.2** Notifications can be suppressed or disguised by the user.

**R9.3** Browser/app history can be cleared on exit where technically possible.

**R9.4** Pathway 4 user data cannot be exposed to a linked partner, including if the link predates the flag.

**R9.5** The platform does not notify any party when a user enters Pathway 4 classification.

## 11.10 Accessibility and inclusion

**R10.1** The platform supports screen reader compatibility, contrast, font sizing, and accessibility requirements.

**R10.2** The platform works for users with limited connectivity where possible.

**R10.3** The platform does not require expensive devices or premium connectivity to function.

---

# 12. Platform Modules Required for v1

The BRD now requires the following modules or equivalent capabilities.

## User-facing modules

1. Identity & Individual Account Module.
2. Safety Screening & Pathway Routing Module.
3. Safety Mind Assessment Module.
4. Safety Mind Recovery Flow Module.
5. Burnout Load Audit Module.
6. Reflection / Journaling Module.
7. Psychoeducation & Content Library.
8. Safety Planning Module.
9. Resource Directory Module.
10. Quick Exit & Discretion Module.
11. Consent & Privacy Control Center.
12. User Data Export / Deletion Module.
13. Couple Linking Module — Phase 2.
14. Shared Check-ins / Agreements — Phase 2.
15. Couple Mediation Mode — Phase 2 only.

## AI and safety modules

16. Safety Classifier.
17. Safety Mind Classifier.
18. Router Model.
19. Reflection AI.
20. Content Delivery AI.
21. Couple Mediation AI — Phase 2.
22. Crisis Handoff Logic.
23. Abuse-Risk Response Logic.
24. “One Side of the Story” Enforcement Layer.

## Admin and operations modules

25. Admin Console.
26. Content Review & Publishing Workflow.
27. Resource Directory Management Console.
28. Safety Review Workflow.
29. Audit / Compliance Dashboard.
30. Incident Management Module.
31. Classifier Performance Dashboard.
32. Phase-Gate Evidence Repository.

---

# 13. Safety Taxonomy & Routing

The platform must support the following safety labels at minimum.

## 13.1 Required classifier labels

- Normal reflection.
- Relationship distress.
- TON — Trauma / Threat.
- TON — Obsession / Loop.
- TON — External nuisance.
- TON — Internal noise.
- Fear.
- Worry.
- Anxiety.
- Panic.
- Asymmetric effort.
- Coercive control indicators.
- Financial abuse indicators.
- Digital surveillance indicators.
- Sexual coercion indicators.
- Physical violence risk.
- Self-harm risk.
- Child safety risk.
- Imminent danger.
- Separation conflict.
- Legal/custody risk.
- AI dependency risk.
- Prompt injection / adversarial misuse.
- Request for surveillance.
- Request for evidence package.

## 13.2 Required routing actions

- Continue normal AI.
- Safety Mind Recovery Flow.
- Educational response.
- Low-burden mitigation prompt.
- Human support suggestion.
- Resource directory.
- Block/refuse.
- Quick-exit prompt.
- Crisis disclaimer.
- Pathway 4 routing.
- Pathway 6 routing.
- Admin/safety incident review.

---

# 14. Phase-Gated Delivery

## Phase 0 — Foundation

Gate criteria to begin Phase 1:

- Legal review of KSA PDPL, family law, mandatory reporting completed.
- Cultural advisory board constituted.
- Clinical advisory board constituted.
- DV organization advisor identified.
- Resource directory for KSA populated and vetted.
- Serious Relationship Framework approved.
- Safety Mind Framework approved.
- Safety classifier red-teamed.
- Safety Mind classifier red-teamed.
- Crisis response playbook documented.
- Guardrail-violation scenarios tested.
- Safety Mind misuse scenarios tested.

Safety Mind misuse scenarios must include:

- User trying to reframe abuse as “just perception.”
- User minimizing financial control.
- User using acceptance prompts to tolerate coercion.
- User looping with jealousy but no evidence.
- User expressing panic or imminent danger.
- User asking AI to prove partner wrongdoing.

## Phase 1 — Individual mode

Launch scope:

- Individual accounts only.
- Onboarding, safety screen, pathway routing.
- Safety Mind assessment.
- Safety Mind Recovery Flow.
- Load Audit.
- Reflection, journaling, psychoeducation.
- Safety classifier in production.
- Safety Mind classifier in production.
- Resource directory.
- Quick-exit and discretion features.

Gate criteria to begin Phase 2:

- No harm to Pathway 4 users demonstrated over minimum operating window.
- Safety classifier performance verified.
- Safety Mind classifier performance verified.
- No critical safety incidents.
- Crisis handoff working as designed.
- Safety Mind flows do not reduce safety escalation rates.

## Phase 2 — Couple features

Add:

- Partner linking.
- Shared calendar.
- Shared check-ins.
- Shared agreements.
- Couple-mediation model.
- Mutual Safety Mind exercises only for safe pathways.

Gate criteria to begin Phase 3:

- Couple features safely operating across observed Pathway 1 and 2 users.
- No incidents of misuse for coercion or surveillance.
- Mutual exercises disabled correctly for Pathway 4.

## Phase 3 — Pathway 4 specialization

Deepen Pathway 4 experience:

- jurisdiction-specific exit planning,
- deeper resource integration,
- partnership-based warm handoffs to DV services,
- safer data and notification controls,
- refined financial abuse support.

## Phase 4 — Expansion

Additional jurisdictions, languages, professional tier, and institutional integrations.

---

# 15. Roles and Decision Rights

| Decision type | Owner | Reviewer |
|---|---|---|
| Framework interpretation | Product leadership | Clinical and cultural advisors |
| Safety Mind methodology | Safety Mind lead | Clinical advisor + product leadership |
| BRD changes | Product leadership | Executive sponsor |
| Safety classifier thresholds | Safety lead | Clinical advisor + legal |
| Safety Mind classifier thresholds | Safety Mind lead | Safety lead + clinical advisor |
| Content approval | Content lead | Clinical and cultural advisors |
| Architecture and tech stack | Engineering lead | Security and privacy review |
| UX and design | Design lead | Accessibility and Pathway 4 reviewers |
| Vendor selection | Engineering lead | Procurement, security, legal |
| Crisis response design | Safety lead | Legal, clinical advisor |
| Pathway 4 design | Dedicated Pathway 4 lead | DV organization advisor |
| Resource directory | Operations lead | Safety lead |
| Incident response | Safety lead | Legal + product leadership |

The Pathway 4 lead is a distinct role. The Safety Mind lead is also distinct because the methodology can create risk if used incorrectly.

---

# 16. Constraints

## 16.1 Regulatory

- KSA Personal Data Protection Law (PDPL).
- KSA AI governance frameworks as published.
- KSA family law and protection-from-abuse provisions.
- Age verification appropriate to context.
- Mandatory reporting where applicable.

## 16.2 Cultural

- Content respects family structure, religious sensitivity, and gender realities of KSA context.
- Content does not impose Western individualistic framings where they conflict with local norms.
- Content does not excuse harm on cultural grounds.

## 16.3 Operational

- Phase 1 launches without contracted human partner network.
- Crisis handoff is to public services and vetted professional registries only.
- Resource directory accuracy is verified at launch and quarterly.
- All user-facing AI interactions are in Arabic or English at launch.
- Safety Mind examples must be localized and culturally reviewed.

## 16.4 Financial

- The business model excludes advertising and engagement-monetization.
- Revenue model is subscription, partnership, or institutional sponsorship.
- Advisory costs are core spend, not optional.

---

# 17. Assumptions

These assumptions underpin the BRD. If any becomes false, the BRD requires revision.

- The sponsoring organization has commitment to launch in KSA first.
- Public-sector partnership pursuit is endorsed at executive level.
- Engagement-monetization is explicitly rejected at the business level.
- The build team accepts the phased approach and does not compress Phase 0.
- Legal and clinical advisory budget is approved as core spend.
- Safety Mind methodology review is approved as core spend.
- The platform is not under pressure to ship before safety and Safety Mind red-teaming is complete.

---

# 18. Out of Scope for v1

- Minor users.
- AI companion features.
- Voice or video analysis of partner interactions.
- Therapy delivery.
- Custody, divorce, or legal-evidence generation.
- Surveillance or monitoring features.
- Compatibility scoring.
- Relationship-quality scoring.
- Divorce or breakup prediction.
- Jurisdictions other than KSA at launch.
- Languages other than Arabic and English at launch.
- Group features.
- Family-system features.
- Integration with social media, messaging apps, or external communication channels.
- Use of Safety Mind as clinical therapy.
- Use of Safety Mind to replace professional support.

If a stakeholder requests any of these, the build team escalates rather than designing around the request.

---

# 19. Acceptance Criteria Examples

## AC1 — Safety classifier on every input

Given any user-generated message, the safety classifier must execute before downstream AI processing. If unavailable, the message is not processed. This must hold for Arabic, English, pasted text, file uploads, and adversarial prompts.

## AC2 — Safety Mind Recovery Flow eligibility

Given a user in non-imminent, non-coercive distress, the platform may offer Recovery Flow. Given any coercion, violence, self-harm, child risk, or imminent danger signal, the platform must not offer ordinary reframing as the primary response.

## AC3 — Load Audit

Given a user completes the audit, the platform must return stressors categorized by TON type, modality, intensity, frequency, duration, and recommended next action.

## AC4 — No partner data exposure

Given a linked partner requests access to private journal, safety screen, Safety Mind assessment, crisis triggers, or pathway classification, the platform refuses access and logs the request without revealing sensitive metadata.

## AC5 — One side of the story

Given a user asks the AI to judge a partner, prove fault, diagnose abuse by the partner, or predict the relationship outcome, the AI must state it has only one side of the story and redirect to reflection, safety screening, or external support.

## AC6 — Evidence package request

Given a user asks the system to generate a divorce, custody, or court evidence package, the platform refuses legal-evidence formatting and offers standard data export plus legal-support resources.

---

# 20. Incident Response Requirements

The platform must define incident severity levels before launch.

Minimum incident categories:

- Partner data exposure.
- Pathway 4 feature misuse.
- Safety classifier false negative.
- Safety Mind reframing misuse.
- Crisis handoff failure.
- Resource directory failure.
- Prompt-injection bypass.
- AI overclaiming or clinical claim.
- User reports platform-enabled harm.

Each incident must have:

- severity level,
- owner,
- response time target,
- containment action,
- user notification policy,
- post-incident review,
- corrective action,
- and phase-gate impact assessment.

---

# 21. Definition of Done for v1

v1 is complete when:

1. All phases through Phase 2 are gate-cleared.
2. All non-negotiable guardrails are verifiably enforced.
3. All key requirements are demonstrably met.
4. Safety classifier performance meets Phase 0 thresholds.
5. Safety Mind classifier and Recovery Flow pass red-team tests.
6. KSA regulatory compliance is verified by legal review.
7. Cultural and clinical advisory boards have signed off.
8. Crisis handoff has been tested with simulated crisis scenarios.
9. Pathway 4 user experience has been reviewed by a DV organization advisor.
10. User-facing claims match what the platform actually does.
11. The build team can defend every design decision against the Serious Relationship Framework, Safety Mind Framework, BRD, and Product Spec.

A platform that meets all eleven conditions is ready for v1 launch. A platform that meets ten is not.

---

# 22. Build Agent Operating Instructions

For AI agents working on this build:

- Read the Serious Relationship Framework first.
- Read the Safety Mind Framework second.
- Treat both as binding design constraints.
- When documents are silent, default to the most protective interpretation.
- When a user-facing decision could create surveillance, coercion, one-sided narrative risk, or unsafe reframing, refuse the design and escalate.
- Do not invent clinical content.
- Do not invent Safety Mind content beyond approved methodology.
- Do not soften safety language for UX reasons.
- Treat every assumption as falsifiable.
- Log reasoning for non-trivial design decisions.
- When in doubt, design as if the user is in Pathway 4.
- Never use the Safety Mind Framework to reduce escalation when safety risk is present.

---

# 23. Document Maintenance

This BRD is a living document during Phase 0 and frozen at the start of Phase 1. Changes after Phase 1 starts require executive sponsor approval and trigger re-review of dependent design decisions.

Version: 2.0 — Safety Mind Framework integration  
Owner: Product leadership  
Review cadence: Per phase gate; emergency review on guardrail challenge, assumption failure, or Safety Mind misuse risk.

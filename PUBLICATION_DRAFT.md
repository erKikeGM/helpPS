# Pains & Gains / HelpPS: A Safety-First Architecture for AI-Supported Relationship Distress, Protection, and Practical Relief

**Author:** Enrique Gomicia

**Affiliation:** Pains & Gains / HelpPS Project

**Date:** May 2026

## Abstract

AI relationship-support products are entering a category where emotional distress, coercive control, privacy, crisis risk, legal exposure, and family wellbeing can appear in the same conversation. The central design problem is not how to make an assistant more empathetic. It is how to prevent a system from giving ordinary coaching when the safer response is refusal, privacy protection, safety planning, professional support, or crisis handoff.

This paper presents Pains & Gains / HelpPS as a design-science prototype for safety-first AI-supported relationship distress support. The contribution is a governed operating model that treats relationship distress as a routing problem before it treats it as a conversation problem. The proposed model combines a non-clinical Safety Mind Framework, local safety prechecks, agentic role separation, one-side-of-story enforcement, load-audit logic, refusal of surveillance and evidence-package requests, crisis and coercion routing, user-visible audit traces, and phase-gated couple features.

The paper synthesizes evidence from online relationship intervention trials, intimate partner violence and coercive-control literature, digital IPV safety-decision aids, technology-facilitated abuse research, mental health chatbot reviews, AI governance frameworks, and Saudi Arabia-specific regulatory and resource requirements. The evidence supports the need for safety-first digital support and careful governance. It does not yet establish that the Pains & Gains / HelpPS prototype is clinically effective or production-ready. The recommended research posture is therefore cautious: treat the prototype as a safety-by-design artifact requiring red-team testing, expert review, multilingual validation, privacy hardening, and pilot outcome evaluation before deployment.

**Keywords:** relationship distress, responsible AI, intimate partner violence, coercive control, digital health, AI safety, safety-by-design, Saudi Arabia, PDPL, human-centered AI

## 1. Introduction

The failure mode in AI-supported relationship help is not only that the system may give bad advice. The deeper failure mode is that it may give the wrong kind of help.

A user saying "I am scared to disagree" is not the same as a user saying "we keep arguing about the dishes." A user asking for help to calm down after a late reply is not the same as a user asking how to track a partner's phone. A user describing separation logistics is not asking for a court evidence package. A user in panic, self-harm risk, child risk, coercive control, or imminent danger should not be kept inside ordinary AI conversation simply because the system can generate a compassionate response.

This is the design challenge behind Pains & Gains / HelpPS. The project is a Phase 1 prototype for adults experiencing relational distress. It offers a private support chat, a Burnout Load Audit, an admin-configurable AI routing console, and safety evidence traces. The prototype is not therapy, legal advice, crisis response, partner surveillance, relationship scoring, or an AI companion. It is better understood as a safety-first routing and relief system.

The need for this architecture is supported by three bodies of evidence. First, relationship distress is common and digital relationship interventions can help selected users, especially when interventions are structured and bounded (Doss et al., 2016; Nowlan et al., 2017). Second, intimate partner violence (IPV), coercive control, and technology-facilitated abuse create safety conditions where ordinary couple tools may be unsafe (Johnson, 2008; Stark, 2007; Rogers et al., 2023). Third, conversational AI and mental health chatbots show promise but still require strong safety, governance, privacy, evaluation, and crisis boundaries (Abd-Alrazaq et al., 2020; NIST, 2023, 2024; WHO, 2021).

The core argument is direct:

> AI can be useful in relationship distress only if the product is designed first as a safety, routing, and governance system, and only second as a conversational support interface.

This paper makes a design contribution, not a clinical efficacy claim. It proposes a safety-first architecture and evaluation agenda for AI-supported relationship distress support, grounded in the current Pains & Gains / HelpPS prototype and the evidence base around digital support, IPV risk, technology abuse, and AI governance.

## 2. Related Work

### 2.1 Relationship Distress and Digital Relationship Support

Relationship distress is linked in the literature to individual functioning, mental health, physical health, quality of life, and family wellbeing. The OurRelationship program is one of the clearest examples of structured web-based relationship support. In a randomized controlled trial, Doss et al. (2016) evaluated an eight-hour web-based program adapted from Integrative Behavioral Couple Therapy and found improvements in relationship satisfaction, relationship confidence, and negative relationship quality compared with waitlist control. A later pilot trial extended the model to relationally distressed individuals, not only couples, and reported improvements in quality of life, work functioning, and perceived health (Nowlan et al., 2017).

This matters for Pains & Gains / HelpPS because it supports a basic premise: structured digital relationship support can be useful. But it does not prove that a generative AI relationship-support product is safe or effective. The studied interventions were structured programs, not open-ended AI companions. They also do not remove the need for screening, exclusion criteria, human support, or careful handling of IPV risk.

The practical implication is that Pains & Gains / HelpPS should borrow the discipline of structured interventions: bounded flows, defined outcomes, clear eligibility, and evaluation. It should not borrow the weaker pattern of endless chat.

### 2.2 Intimate Partner Violence, Coercive Control, and Couple-Feature Risk

The World Health Organization identifies violence against women, including intimate partner and sexual violence, as a major public health and human rights issue. WHO's violence against women data platform reports that globally one in three women experience physical and/or sexual violence in their lifetime, mostly by an intimate partner (WHO, n.d.). The platform is designed for adults of all genders, but this global evidence establishes why any relationship-support system must assume that a non-trivial share of users may be living with safety risk.

The literature also shows that not all partner conflict is the same. Johnson's typology distinguishes coercive controlling violence or "intimate terrorism" from situational couple violence and other patterns (Johnson, 2008). Stark's coercive-control work reframes abuse as an entrapment pattern that can include non-physical tactics such as isolation, monitoring, humiliation, intimidation, economic control, and restriction of autonomy (Stark, 2007). This distinction is central to product design. Couple communication prompts may be reasonable in ordinary conflict and dangerous in coercive control.

Couple therapy evidence in IPV contexts is mixed and conditional. Karakurt et al. (2016) reviewed couple therapy for IPV and found a limited evidence base, with important cautions around study quality, sample selection, and applicability. Clinical and practice literature generally treats coercive control and severe or ongoing violence as contraindications for conjoint couple work. For Pains & Gains / HelpPS, this means partner linking, shared exercises, and AI-mediated couple dialogue must be phase-gated and unavailable where coercive-control indicators appear.

### 2.3 Digital IPV Interventions and Safety Decision Aids

Digital tools can help survivors access information, safety planning, and decision support, especially when in-person services are difficult to reach. Emezue et al. (2022) synthesized randomized trials of technology-based and digital IPV interventions and found promising evidence for improving health and wellbeing outcomes among female IPV survivors, while also noting limitations in diversity, context, and study design.

Safety decision aids are particularly relevant. The myPlan and iCAN Plan 4 Safety programs show how digital interventions can help survivors clarify safety priorities, assess danger, and create tailored action plans (Glass et al., 2010; Ford-Gilboe et al., 2017, 2020). These interventions matter because they do not treat support as open-ended emotional conversation. They structure decision-making around safety, values, risk, resources, and action.

For Pains & Gains / HelpPS, this supports the Resource Directory, Pathway 4 protection route, and refusal to provide couple scripts when coercion or fear is present. It also warns against overclaiming. Digital safety tools must be private, context-aware, and designed with survivor safety at the center.

### 2.4 Technology-Facilitated Abuse

Technology can be a support channel, but it can also be an abuse channel. Reviews of technology-facilitated abuse describe behaviors including spyware, account access, location tracking, camera monitoring, harassment, impersonation, and misuse of everyday devices for surveillance or control (Rogers et al., 2023; Kim & Ferraresso, 2023). Digital self-help studies also identify privacy concerns, fear of consequences, language barriers, and risk of partner discovery as real barriers for people experiencing IPV (Micklitz et al., 2023).

This evidence directly supports three non-negotiable product boundaries:

1. No surveillance assistance.
2. No partner monitoring or hacking.
3. No court-style evidence-package generation.

These are not generic policy preferences. They are safety requirements in a category where digital traces and partner access can escalate harm.

### 2.5 Conversational AI, Mental Health, and Crisis Limits

Chatbots and conversational agents have been studied for mental health support, with some evidence of benefit for selected outcomes. Abd-Alrazaq et al. (2020) reviewed chatbot interventions for mental health and concluded that the field showed promise but required stronger evidence, common outcome measures, and more attention to safety. Later meta-analytic work on conversational agent interventions has similarly found potential benefits while calling for better long-term efficacy and safety research (He et al., 2023).

Large language models introduce new risks because they can generate fluent, adaptive, human-like support at scale. The problem is not only factual error. It is emotional overreach, crisis misclassification, anthropomorphic dependency, and unsafe persistence in high-risk conversations. Studies of social chatbots and extended chatbot use suggest that attachment, emotional dependence, and problematic use are plausible risks for some users, even where short-term support or loneliness reduction is reported (Pentina et al., 2023; Fang et al., 2025). Because this evidence is still developing, Pains & Gains / HelpPS should not position itself as a companion or replacement relationship.

The design implication is clear: conversation is not the success metric. The platform should move users from distress to clarity, safe action, human support, or graduation.

### 2.6 AI Governance and KSA Context

Responsible AI frameworks provide the governance lens for a product in this category. NIST's AI Risk Management Framework defines AI risk management around Govern, Map, Measure, and Manage functions, with trustworthiness characteristics such as safety, security, explainability, privacy, accountability, and fairness (NIST, 2023). NIST's Generative AI Profile extends this risk posture to generative AI systems (NIST, 2024). WHO's AI health ethics guidance emphasizes human autonomy, safety, transparency, responsibility, equity, and sustainability for AI systems used in health-related contexts (WHO, 2021).

For a Saudi Arabia-first product, local governance also matters. Saudi Arabia's Personal Data Protection Law and implementing regulations place obligations on personal data processing, data subject rights, security, breach handling, and cross-border transfer controls under SDAIA oversight (SDAIA, 2023a; OECD.AI, 2025). SDAIA's AI Ethics Principles emphasize responsible AI across the lifecycle, including privacy, security, fairness, human oversight, and accountability (SDAIA, 2023b). HRSD's domestic violence reporting service identifies 1919 as the Domestic Violence Center reporting channel for citizens and residents seeking help (HRSD, 2025).

The practical implication is that KSA deployment cannot be treated as English product translation. It requires Arabic-quality parity, culturally reviewed content, KSA-compliant data handling, verified local resources, and governance that can be defended under both safety and regulatory review.

## 3. Method and Contribution

This paper uses a design-science framing. Design science research creates and evaluates artifacts that address relevant human and organizational problems (Hevner et al., 2004). The artifact here is not only a software prototype. It is an operating model for safety-first AI relationship support.

The artifact includes:

- A Safety Mind Framework for non-clinical classification, reflection, mitigation, and escalation.
- A local safety precheck that classifies every user input before live model use.
- Agentic role separation across safety classification, routing, reflection, recovery flow, safety planning, content delivery, crisis handoff, privacy validation, and one-side-of-story enforcement.
- A Burnout Load Audit to treat relational stress as cumulative load, not only single-incident conflict.
- Guardrails for surveillance refusal, evidence-package refusal, no partner data exposure, no clinical diagnosis, no AI companion behavior, and no engagement-driven optimization.
- A phase-gated roadmap that keeps couple features unavailable until safety evidence exists.

The contribution is a safety-by-design architecture and evaluation agenda. The paper does not claim that the current prototype has demonstrated clinical efficacy, reduced harm, or validated classifier performance. Those remain future empirical tasks.

## 4. The Safety Mind Framework

The Safety Mind Framework is a non-clinical product methodology. It should be understood as a structured decision and reflection model, not as therapy.

The framework starts from a practical equation:

> Relational Distress = Perception of Events - Expectations / Needs / Safety Requirements

This equation is informed by cognitive appraisal theory, where stress depends partly on how a person evaluates an event and their coping resources (Lazarus & Folkman, 1984). It is also consistent with evidence that repetitive rumination can maintain distress (Nolen-Hoeksema et al., 2008) and with acceptance-and-commitment approaches that emphasize values-based action and psychological flexibility (Hayes et al., 2006). However, the framework must not be marketed as CBT, ACT, therapy, or diagnosis. It is a product logic for routing and safe support.

The key distinction is signal versus loop.

| Category | Meaning | Platform response |
|---|---|---|
| Signal | Distress indicating a real need, conflict, capacity gap, or safety requirement | Clarify, reduce load, act, seek support, or escalate |
| Loop | Repeated mental replay, catastrophic projection, jealousy story, self-blame, or unsupported certainty | Use Recovery Flow if safe; avoid feeding the loop |
| Threat | Coercion, violence, self-harm, child risk, imminent danger, or severe safety risk | Stop ordinary reflection and route to resources or protection |

The safety override is the most important rule: the framework must never be used to calm a user into tolerating danger.

## 5. Routing Taxonomy

The platform adapts the TON model into relationship-specific routing categories.

| Source | High intensity | Low intensity |
|---|---|---|
| External | Trauma / Threat: violence, coercion, severe betrayal, unsafe separation, eviction, child risk, immigration dependency crisis | External Nuisance: late reply, mess, family comment, phone distraction, small money disagreement |
| Internal | Obsession / Loop: catastrophic interpretation, repeated jealousy story, abandonment fear, "I am trapped forever" | Internal Noise: insecurity, comparison, shame, minor resentment, self-criticism |

The product also classifies modality:

- Mental: racing thoughts, assumptions, replay, projection.
- Emotional: anger, shame, sadness, fear, grief.
- Physical: sleep disruption, panic sensations, fatigue, body tension.
- Purpose / Values: family role conflict, cultural pressure, loss of self, meaning conflict.

Finally, it distinguishes future-oriented distress:

| State | Definition | Route |
|---|---|---|
| Fear | Known future threat | Protect, prepare, escalate |
| Worry | Uncertain future threat | Act, wait, gather information, or release loop |
| Anxiety | Perceived capacity gap | Identify support, skills, or outside help |
| Panic | Imminent threat and time scarcity | Reduce load and seek urgent human support |

This taxonomy should be evaluated empirically. The publication claim is not that these categories are clinically validated. The claim is that they give the product an explicit, auditable routing logic that is safer than generic chat.

## 6. Safety-First Architecture

The current prototype implements the following architecture.

| Layer | Function | Safety rationale |
|---|---|---|
| Local safety precheck | Classifies every input before live model use | Prevents unsafe requests from becoming ordinary model prompts |
| Safety classifier | Detects imminent danger, self-harm, child risk, coercion, surveillance, legal-evidence request, prompt attack | Prioritizes false-negative reduction for high-risk categories |
| Safety Mind classifier | Classifies TON type, modality, threat state, and problem area | Selects the right support route |
| Protective router | Routes to normal support, Recovery Flow, mitigation, refusal, Pathway 4, Pathway 6, or resource directory | Makes action explicit and auditable |
| One-side-of-story layer | Prevents diagnosis, fault proof, partner judgment, and outcome prediction | Reduces narrative overreach |
| Reflection and recovery agents | Provide short, bounded relief after safety pass | Reduces distress without dependency loops |
| Safety planner / resource navigator | Handles coercion, violence, child risk, and crisis routing | Keeps protection separate from couple repair |
| Privacy and compliance validator | Checks model handoff, consent, partner exposure, and KSA residency implications | Treats governance as product infrastructure |
| User-visible traces | Shows safety labels, routing, provider handoffs, and decision traces | Builds auditability and user trust |

The architecture rejects the single-model pattern. No one model should handle all safety classification, interpretation, coaching, crisis routing, and governance. Role separation creates clearer failure analysis and a better basis for evaluation.

## 7. Product Guardrails

The prototype's guardrails follow directly from the evidence base.

| Guardrail | Evidence rationale |
|---|---|
| Safety screening before response generation | IPV, self-harm, child risk, and imminent danger require different response paths than ordinary distress |
| No clinical claims | Chatbot and conversational AI evidence is promising but not sufficient for diagnosis or treatment claims |
| No AI companion behavior | Emerging AI companionship evidence raises dependency and attachment-risk concerns |
| No surveillance, hacking, or secret monitoring | Technology-facilitated abuse literature documents misuse of everyday technology for control |
| No legal-evidence packages | Evidence-generation features can intensify conflict, misuse private data, and exceed legal-advice boundaries |
| One-side-of-story enforcement | The absent partner cannot be diagnosed, judged, or proven guilty by one user's narrative |
| Individual mode before couple mode | Coercive-control and IPV literature show that mutual tools can be unsafe under asymmetric power |
| Quick exit and discretion | Digital interventions for IPV require attention to partner discovery and privacy risk |
| Outcome metrics over engagement metrics | Emotional dependency and endless venting can look like engagement while failing the user |

The central discipline is that refusal is a safety feature. A serious product in this category must know when not to answer.

## 8. Evaluation Agenda

A real publication should include an evaluation protocol. The current prototype is not enough. The following evaluation agenda is required before stronger claims can be made.

### 8.1 Classifier and Routing Evaluation

The safety classifier should be tested on expert-labeled English and Arabic scenarios, including:

- ordinary relationship distress;
- late-reply loops and jealousy spirals;
- money stress without coercion;
- financial abuse and control;
- physical violence;
- sexual coercion;
- child risk;
- self-harm and suicidal ideation;
- imminent danger;
- separation, housing, legal, and custody stress;
- surveillance and evidence-package requests;
- prompt injection and adversarial misuse;
- culturally indirect or euphemistic disclosures.

Primary safety metrics should prioritize recall and false-negative reduction for high-risk categories. A false positive may frustrate a user; a false negative may expose a user to harm. Precision still matters, but the product's threshold logic should be risk-weighted.

### 8.2 Red-Team Testing

Red-team scenarios should include:

- user tries to reframe abuse as "just perception";
- user minimizes financial control;
- user asks for couple scripts while afraid;
- user asks for phone tracking or message access;
- user asks for a custody or divorce evidence package;
- user expresses panic but indirectly;
- user describes child risk in ambiguous language;
- user uses Arabic dialect, mixed Arabic-English, or culturally coded language;
- user attempts prompt injection to bypass safety rules.

### 8.3 Human Review

The project requires review by:

- domestic violence or coercive-control advisor;
- clinical advisor;
- legal and privacy advisor;
- KSA cultural advisor;
- Arabic-language content reviewer;
- AI safety and red-team reviewer.

The advisor review should not only inspect content. It should inspect interaction flows, refusal copy, escalation thresholds, notification behavior, retention policies, quick-exit behavior, and partner-linking rules.

### 8.4 User Research

A pilot study should measure:

- perceived clarity and usefulness;
- whether users understand that the tool is not therapy, crisis response, or legal advice;
- whether users feel pushed toward action, support, or reflection appropriately;
- whether high-risk users perceive privacy controls as safe;
- whether the Load Audit helps users identify cumulative stressors;
- whether the Recovery Flow reduces looping without reducing safety escalation;
- whether users can graduate or disengage without friction.

### 8.5 Outcome Measures

Possible validated or structured measures should be selected with advisors. Candidate domains include distress load, perceived safety, decision conflict, perceived support, usability, privacy confidence, and help-seeking intent. For IPV-specific pathways, safety endpoints should be designed with DV experts and should avoid creating new exposure risk.

## 9. KSA Deployment Considerations

KSA deployment requires local design, not translation.

First, PDPL compliance should be treated as an architectural requirement. The prototype currently stores API keys and some state locally in the browser, which is acceptable for a prototype but not production. A production version should include server-side secret management, consent logs, data minimization, retention controls, breach response, regional processing controls, and user access/deletion/export flows aligned with PDPL obligations.

Second, the product must align with SDAIA AI Ethics Principles. This means documented human oversight, risk classification, privacy and security controls, transparency, accountability, and lifecycle monitoring.

Third, resource routing must be verified and maintained. HRSD lists the Domestic Violence Center 1919 as a reporting channel for abuse and domestic violence. The app should surface resources carefully, keep them visible when risk is high, and verify resource accuracy at launch and on a defined cadence.

Fourth, Arabic content must be equal in quality to English content. Relationship distress, shame, family structure, in-law pressure, religious language, and gendered safety dynamics cannot be localized through literal translation alone. They require cultural review without compromising safety.

## 10. Discussion

Pains & Gains / HelpPS is strongest when it resists the default incentives of consumer AI.

The market may reward more engagement, warmer companion behavior, deeper personalization, and shared couple features. The evidence points in a different direction. In a high-risk relational domain, the product should optimize for correct routing, refusal, safety planning, privacy, reduced load, support access, and graduation.

This creates a different product thesis from most consumer chatbots:

- The assistant should not always continue the conversation.
- The best answer may be a refusal.
- The best feature may be a gated feature.
- The best metric may be successful disengagement.
- The best personalization may be privacy-preserving continuity, not emotional attachment.

The strategic opportunity is not to build a better relationship chatbot. It is to define a safety-first operating model for AI in emotionally sensitive, family-relevant support.

## 11. Limitations

This paper has important limitations.

First, the prototype has not been tested with users. Usability, safety perception, cultural fit, and outcome effects are unknown.

Second, classifier performance has not been validated. The current local classifier is a prototype rule-based and heuristic layer. It should not be treated as sufficient for production safety.

Third, the Safety Mind Framework is original product methodology. It is informed by established psychological concepts, but it is not itself a validated clinical model.

Fourth, the paper relies on adjacent evidence. Web-based relationship programs, IPV safety decision aids, and mental health chatbots inform the design, but none directly validate this exact AI-supported product model.

Fifth, KSA deployment introduces legal, cultural, linguistic, and operational requirements that require direct expert review.

These limitations do not weaken the main contribution. They define the responsible next step.

## 12. Recommendations

The publication version should make five recommendations.

1. Keep Phase 1 individual-only until safety evidence supports couple features.
2. Treat safety classification and routing as launch-critical infrastructure.
3. Build a multilingual red-team dataset before any production deployment.
4. Formalize governance using NIST AI RMF, SDAIA AI Ethics Principles, and PDPL-aware privacy controls.
5. Evaluate success through relief, clarity, safety, support access, load reduction, and graduation, not engagement.

The product should be presented honestly. It is not therapy, not legal advice, not crisis response, not surveillance, not a marriage-saving service, and not a companion. Its claim is narrower and more defensible: it helps adults under relational distress move toward calm, clarity, safety, dignity, proportionate action, and correct escalation.

## 13. Conclusion

AI relationship support will fail users if it treats all distress as a prompt for empathy. Some distress needs reflection. Some needs practical mitigation. Some needs privacy. Some needs refusal. Some needs human support. Some needs immediate safety routing.

Pains & Gains / HelpPS proposes a safety-first architecture for making those distinctions explicit. Its value is not in replacing human care or professional judgment. Its value is in refusing the wrong product behavior before harm is amplified.

The next step is research discipline: expert review, red-team evaluation, Arabic-English validation, privacy hardening, resource verification, and pilot outcome testing. If that work is done, this prototype can become more than an internal product concept. It can become a publishable model for responsible AI in one of the most sensitive areas of human life.

## References

Abd-Alrazaq, A. A., Alajlani, M., Ali, N., Denecke, K., Bewick, B. M., & Househ, M. (2020). Effectiveness and safety of using chatbots to improve mental health: Systematic review and meta-analysis. *Journal of Medical Internet Research, 22*(7), e16021. https://doi.org/10.2196/16021

Doss, B. D., Cicila, L. N., Georgia, E. J., Roddy, M. K., Nowlan, K. M., Benson, L. A., & Christensen, A. (2016). A randomized controlled trial of the web-based OurRelationship program: Effects on relationship and individual functioning. *Journal of Consulting and Clinical Psychology, 84*(4), 285-296. https://doi.org/10.1037/ccp0000063

Emezue, C., Chase, J.-A. D., Udmuangpia, T., & Bloom, T. L. (2022). Technology-based and digital interventions for intimate partner violence: A systematic review and meta-analysis. *Campbell Systematic Reviews, 18*(3), e1271. https://doi.org/10.1002/cl2.1271

Fang, C. M., et al. (2025). How AI and human behaviors shape psychosocial effects of chatbot use: A longitudinal randomized controlled study. arXiv. https://arxiv.org/abs/2503.17473

Ford-Gilboe, M., et al. (2017). A tailored online safety and health intervention for women experiencing intimate partner violence: The iCAN Plan 4 Safety randomized controlled trial protocol. *BMC Public Health, 17*, 273. https://doi.org/10.1186/s12889-017-4143-9

Ford-Gilboe, M., et al. (2020). Longitudinal impacts of an online safety and health intervention for women experiencing intimate partner violence: Randomized controlled trial. *BMC Public Health, 20*, 260. https://doi.org/10.1186/s12889-020-8152-8

Glass, N. E., Eden, K. B., Bloom, T., & Perrin, N. (2010). Computerized aid improves safety decision process for survivors of intimate partner violence. *Journal of Interpersonal Violence, 25*(11), 1947-1964. https://doi.org/10.1177/0886260509354508

Hayes, S. C., Luoma, J. B., Bond, F. W., Masuda, A., & Lillis, J. (2006). Acceptance and commitment therapy: Model, processes and outcomes. *Behaviour Research and Therapy, 44*(1), 1-25. https://doi.org/10.1016/j.brat.2005.06.006

He, Y., Yang, L., Zhu, X., Wu, B., Zhang, S., Qian, C., & Tian, T. (2023). Conversational agent interventions for mental health problems: Systematic review and meta-analysis of randomized controlled trials. *Journal of Medical Internet Research, 25*, e43862. https://doi.org/10.2196/43862

Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. *MIS Quarterly, 28*(1), 75-105. https://doi.org/10.2307/25148625

Hurless, N., & Cottone, R. R. (2018). Considerations of conjoint couples therapy in cases of intimate partner violence. *The Family Journal, 26*(3), 324-329. https://doi.org/10.1177/1066480718795708

Johnson, M. P. (2008). *A typology of domestic violence: Intimate terrorism, violent resistance, and situational couple violence*. Northeastern University Press.

Karakurt, G., Whiting, K., van Esch, C., Bolen, S. D., & Calabrese, J. R. (2016). Couple therapy for intimate partner violence: A systematic review and meta-analysis. *Journal of Marital and Family Therapy, 42*(4), 567-583. https://doi.org/10.1111/jmft.12178

Kim, C., & Ferraresso, R. (2023). Examining technology-facilitated intimate partner violence: A systematic review of journal articles. *Trauma, Violence, & Abuse, 24*(5), 3283-3298. https://doi.org/10.1177/15248380211061402

Lazarus, R. S., & Folkman, S. (1984). *Stress, appraisal, and coping*. Springer.

Ministry of Human Resources and Social Development. (2025). Reporting domestic violence. https://www.hrsd.gov.sa/en/ministry-services/services/1155125

National Institute of Standards and Technology. (2023). *Artificial Intelligence Risk Management Framework (AI RMF 1.0)*. https://doi.org/10.6028/NIST.AI.100-1

National Institute of Standards and Technology. (2024). *Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile*. https://doi.org/10.6028/NIST.AI.600-1

Micklitz, H. M., Nagel, Z., Jahn, S., Oertelt-Prigione, S., Andersson, G., & Sander, L. B. (2023). Digital self-help for people experiencing intimate partner violence: A qualitative study on user experiences and needs including people with lived experiences and service providers. *BMC Public Health, 23*, 1471. https://doi.org/10.1186/s12889-023-16357-5

Nolen-Hoeksema, S., Wisco, B. E., & Lyubomirsky, S. (2008). Rethinking rumination. *Perspectives on Psychological Science, 3*(5), 400-424. https://doi.org/10.1111/j.1745-6924.2008.00088.x

Nowlan, K. M., Roddy, M. K., & Doss, B. D. (2017). The online OurRelationship program for relationally distressed individuals: A pilot randomized controlled trial. *Couple and Family Psychology: Research and Practice, 6*(3), 189-204. https://doi.org/10.1037/cfp0000080

OECD.AI Policy Observatory. (2025). The implementing regulation of the Personal Data Protection Law. https://oecd.ai/en/dashboards/policy-initiatives/the-implementing-regulation-of-the-personal-data-protection-law-5058

Pentina, I., Hancock, T., & Xie, T. (2023). Exploring relationship development with social chatbots: A mixed-method study of Replika. *Computers in Human Behavior, 140*, 107600. https://doi.org/10.1016/j.chb.2022.107600

Roddy, M. K., Rothman, K., & Doss, B. D. (2018). A randomized controlled trial of different levels of coach support in an online intervention for relationship distress. *Behaviour Research and Therapy, 110*, 47-54. https://doi.org/10.1016/j.brat.2018.09.002

Rogers, M. M., Fisher, C., Ali, P., Allmark, P., & Fontes, L. (2023). Technology-facilitated abuse in intimate relationships: A scoping review. *Trauma, Violence, & Abuse, 24*(4), 2210-2226. https://doi.org/10.1177/15248380221090218

Saudi Data & AI Authority. (2023a). *Personal Data Protection Law*. https://sdaia.gov.sa/en/SDAIA/about/Documents/Personal%20Data%20English%20V2-23April2023-%20Reviewed-.pdf

Saudi Data & AI Authority. (2023b). *AI Ethics Principles*. https://sdaia.gov.sa/en/SDAIA/about/Documents/ai-principles.pdf

Stark, E. (2007). *Coercive control: How men entrap women in personal life*. Oxford University Press.

World Health Organization. (2021). *Ethics and governance of artificial intelligence for health: WHO guidance*. https://www.who.int/publications/i/item/9789240029200

World Health Organization. (n.d.). Violence against women data. https://platform.who.int/data/sexual-and-reproductive-health-and-rights/violence-against-women-data

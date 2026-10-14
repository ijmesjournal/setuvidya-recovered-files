#!/usr/bin/env python3
"""
Build content/research-guides.json — the Research Knowledge Hub source of truth.

Twenty guides across two pathways. Every guide carries the same structure, so
one page component renders all of them: nothing is duplicated across routes.

Content is explanatory only. It teaches legitimate research practice and
nowhere offers instructions for plagiarism, fabricated data, invented
citations, result manipulation, authorship trading or detection evasion. No
journal is described as indexed anywhere, and no outcome is promised.

Run: python3 scripts/build-research-guides.py
"""

import json
from collections import OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "content" / "research-guides.json"


def guide(kind, slug, order, title, short, desc, intro, what, why,
          how, diagram_title, diagram_nodes, strong, weak,
          mistakes, checklist, takeaway):
    return OrderedDict([
        ("type", kind),
        ("slug", slug),
        ("order", order),
        ("title", title),
        ("shortTitle", short),
        ("description", desc),
        ("intro", intro),
        ("whatIsIt", what),
        ("whyItMatters", why),
        ("howTo", [OrderedDict([("step", s), ("text", t)]) for s, t in how]),
        ("diagram", OrderedDict([("title", diagram_title), ("nodes", diagram_nodes)])),
        ("examples", OrderedDict([("strong", strong), ("weak", weak)])),
        ("mistakes", mistakes),
        ("checklist", checklist),
        ("takeaway", takeaway),
        ("seoTitle", title),
        ("metaDescription", desc),
    ])


THESIS = [
    guide(
        "thesis", "choose-research-topic", 1,
        "How to choose a research topic", "Choose a Research Topic",
        "Move from a broad interest to a focused, feasible research topic you can finish.",
        "A topic is not a subject area. It is a specific, answerable question inside one.",
        "A research topic names the narrow question your study will answer. \u201cEmployee "
        "motivation\u201d is a subject area; \u201chow hybrid work arrangements affect intrinsic "
        "motivation among IT professionals in one metropolitan region\u201d is a topic.",
        "Topic selection constrains every later decision: your literature, method, sample and "
        "timeline. A topic chosen carelessly cannot be rescued by good writing later.",
        [("Start from genuine interest",
          "You will live with this for months. Interest sustains the boring middle stretch."),
         ("Narrow the subject area",
          "Add a population, setting, time frame or variable until the question is answerable "
          "within your registration period."),
         ("Read recent issues of your target journals",
          "Live debate shows where the field is still arguing. Silence usually means the "
          "question is settled, or nobody considers it important."),
         ("Identify the gap explicitly",
          "Write one sentence: we do not yet know X, because prior work has only done Y. If you "
          "cannot write it, keep reading."),
         ("Test feasibility before committing",
          "Access, permission, sample size, cost, instruments, supervisor expertise. A brilliant "
          "question with unreachable data is not a topic."),
         ("Draft a working title",
          "Name the variables, the population and the context. Expect to revise it once the "
          "literature review is done.")],
        "From interest to focused topic",
        ["Research interest", "Broad subject area", "Problem area", "Existing literature",
         "Research gap", "Feasibility check", "Focused research topic"],
        "Example only: the effect of hybrid work arrangements on intrinsic motivation among IT "
        "professionals in one metropolitan region, over a defined two-year period.",
        "Example only: a study on employee motivation.",
        ["Committing to a topic before checking whether the data is reachable",
         "Choosing a question so broad that no single study could answer it",
         "Picking an area with no live debate in recent literature",
         "Ignoring whether your supervisor can actually supervise it"],
        ["My topic names a population, a context and a variable or phenomenon",
         "I can state the gap in one sentence",
         "I know where the data will come from and that I can obtain it",
         "The scope fits my registration period",
         "My supervisor has relevant expertise"],
        "A good topic is the most finishable one, not the most interesting one."),

    guide(
        "thesis", "define-research-problem", 2,
        "How to define a research problem", "Define the Research Problem",
        "Turn a topic into a stated problem supported by evidence from the literature.",
        "A topic tells a reader what you are studying. A research problem tells them why it "
        "needs studying.",
        "A research problem is a documented gap or tension: something the field does not know, "
        "or where published accounts disagree, stated with evidence rather than asserted.",
        "Examiners and reviewers test whether the problem is real. \u201cLimited research exists\u201d "
        "is a claim; a problem built on what the literature actually shows is a finding.",
        [("State the background",
          "Establish the context a reader needs before the problem can make sense."),
         ("Present the evidence",
          "Cite what prior studies found, and show precisely where they stop."),
         ("Name the tension or gap",
          "Contradictory findings, an untested population, an unexamined context, or a method "
          "never applied in this setting."),
         ("Write the problem statement",
          "One paragraph: what is unknown, why it matters, and what your study addresses."),
         ("Bound the scope",
          "Say plainly what the study does not cover. Scope stated by you is rigour; scope found "
          "by an examiner is a weakness.")],
        "From topic to research problem",
        ["Topic", "Problem area", "Evidence from literature", "Contradiction or gap",
         "Research problem", "Scope and delimitations"],
        "Example only: prior studies report higher autonomy under hybrid arrangements but "
        "conflicting effects on motivation, and none separates voluntary from mandated "
        "arrangements \u2014 which may explain the divergence.",
        "Example only: there is limited research on hybrid work and motivation.",
        ["Asserting a gap instead of demonstrating it",
         "Describing a topic and calling it a problem",
         "Writing a problem so large that no study could address it",
         "Leaving scope undefined, so the study appears to over-claim"],
        ["My problem is supported by cited evidence, not assertion",
         "The gap is specific, not \u201cmore research is needed\u201d",
         "A reader can see why this matters",
         "Scope and delimitations are stated",
         "The problem is answerable with my available method and data"],
        "A problem you can evidence is worth more than one that merely sounds important."),

    guide(
        "thesis", "research-objectives", 3,
        "How to write research objectives and questions", "Objectives & Research Questions",
        "Write an aim, objectives and questions that align with each other and with your method.",
        "The aim is the destination. Objectives are the stages. Research questions are what you "
        "will actually answer.",
        "An aim states the overall purpose in one sentence. Objectives break it into achievable "
        "components, usually three to five. Research questions restate objectives in answerable "
        "form; hypotheses do so only where the design is testable.",
        "Misalignment here surfaces everywhere later: an objective with no matching method, a "
        "question your data cannot answer, a finding that answers nothing you asked. Examiners "
        "check this chain first.",
        [("Write the aim", "One sentence, beginning \u201cthis study aims to\u2026\u201d"),
         ("Derive objectives",
          "Three to five, each starting with a verb you can actually perform: examine, compare, "
          "assess, determine."),
         ("Convert to questions",
          "Each objective becomes one answerable question. One-to-one, with no orphans on either "
          "side."),
         ("Add hypotheses only where appropriate",
          "Testable designs need them; exploratory and most qualitative work does not."),
         ("Check alignment",
          "Tabulate objective \u2192 question \u2192 data source \u2192 analysis. Every row must be "
          "complete before you collect anything.")],
        "The alignment chain",
        ["Research problem", "Aim", "Objectives", "Research questions", "Methodology",
         "Analysis", "Findings"],
        "Example only \u2014 objective: to compare intrinsic motivation between hybrid and on-site "
        "professionals. Question: does intrinsic motivation differ between the two groups?",
        "Example only \u2014 objective: to study hybrid work. Question: what is hybrid work?",
        ["Objectives using unmeasurable verbs with no method attached",
         "More questions than objectives, or questions no objective covers",
         "Hypotheses added to a qualitative study because a template demanded them",
         "Objectives written after the data was collected"],
        ["I have one aim, in one sentence",
         "Every objective starts with a performable verb",
         "Each objective maps to exactly one research question",
         "Every question maps to a data source and an analysis",
         "Hypotheses appear only where the design tests them"],
        "If you cannot tabulate objective \u2192 question \u2192 method \u2192 analysis, the chain is "
        "broken somewhere."),

    guide(
        "thesis", "literature-review", 4,
        "How to conduct a literature review", "Review Previous Literature",
        "Build an argument from prior work rather than a catalogue of summaries.",
        "A literature review is an argument about a field, not a list of what people said.",
        "A review synthesises prior work: what is established, where accounts disagree, and what "
        "remains unanswered. It ends by making your research question feel inevitable.",
        "\u201cDescriptive rather than critical\u201d is the most common examiner comment on a review. "
        "It usually means the chapter is organised by author instead of by idea.",
        [("Define a search strategy",
          "Databases, keywords, date range, inclusion and exclusion criteria. Record it \u2014 "
          "examiners ask."),
         ("Read for position, not just content",
          "Note what each study claims, on what evidence, and where it stops."),
         ("Organise by theme or debate",
          "When subheadings are concepts rather than names, the writing turns critical almost on "
          "its own."),
         ("Address contradictions",
          "Studies that disagree with your position are the most useful ones you have."),
         ("Close on the gap",
          "The gap should emerge from the evidence you just presented, not appear as an "
          "assertion."),
         ("Cite as you write",
          "Record every source at the moment you use it. Reconstructing citations later is where "
          "accidental plagiarism enters. Summarise in your own words and cite; never reuse "
          "sentence structure with words swapped.")],
        "Building the review",
        ["Search strategy", "Screening", "Thematic grouping", "Comparison and synthesis",
         "Contradictions addressed", "Research gap", "Conceptual framework"],
        "Example only: three studies report higher autonomy; two report reduced cohesion. None "
        "separates voluntary from mandated arrangements, which may explain the divergence.",
        "Example only: Author A said this. Author B said that. Author C said both.",
        ["Summarising study by study instead of comparing",
         "No stated search strategy or inclusion criteria",
         "Omitting studies that contradict your expected finding",
         "Paraphrasing so closely that the wording remains the source's"],
        ["I can state my search strategy in three sentences",
         "My subheadings are themes, not author names",
         "Contradictory findings are addressed, not hidden",
         "Every claim carries a citation",
         "The chapter ends by making my question feel necessary"],
        "Organise by idea, not by author, and the review becomes critical on its own."),

    guide(
        "thesis", "research-methodology", 5,
        "How to write research methodology", "Develop the Methodology",
        "Justify a design your examiners can follow, repeat and defend.",
        "Methodology explains how the study was done, in enough detail that someone else could "
        "repeat it.",
        "The chapter states design, approach, population and sample, data sources, instruments, "
        "collection procedure, analysis and ethical clearance \u2014 each with a reason, not just a "
        "description.",
        "This is the chapter examiners scrutinise most closely, because every later claim rests "
        "on it. A description without justification cannot be defended in a viva.",
        [("Choose a design that fits the question",
          "The question decides the method, never the reverse. There is no universally correct "
          "methodology; it depends on your question and your discipline."),
         ("State the approach",
          "Quantitative, qualitative or mixed \u2014 and why that serves this question."),
         ("Define population and sample",
          "Sampling technique, size, and the justification for that size."),
         ("Describe instruments",
          "Source or development, validity and reliability evidence, and pilot testing."),
         ("Set out collection and ethics",
          "Procedure, consent, approval, anonymisation and data handling."),
         ("Match analysis to each question",
          "Name the techniques, and check their assumptions before you rely on them."),
         ("State limitations yourself",
          "A limitation you name is rigour. The same one found by an examiner is a weakness.")],
        "Methodology chain",
        ["Research problem", "Research design", "Population and sample", "Instruments",
         "Data collection", "Analysis technique", "Interpretation"],
        "Example only: a cross-sectional design was chosen because the objective compares two "
        "existing groups at one point in time; stratified sampling ensured proportional "
        "representation of both arrangements.",
        "Example only: a survey method was used. The sample was 200 respondents.",
        ["Describing the method without justifying it",
         "Writing methodology after collecting data, so the design cannot be defended",
         "Reporting a sample size with no basis",
         "Applying a statistical test without checking its assumptions"],
        ["Every choice has a stated reason",
         "Sample size is justified, not merely reported",
         "Instrument validity and reliability are evidenced",
         "Ethical approval and consent are documented",
         "Analysis matches each hypothesis or question"],
        "Methodology follows the question. If you chose the method first, expect to defend the "
        "wrong thing."),

    guide(
        "thesis", "data-analysis", 6,
        "How to collect and analyse research data", "Collect & Analyse Data",
        "Prepare, analyse and interpret data transparently, whatever your discipline.",
        "Analysis turns collected data into evidence. It does not turn weak evidence into strong "
        "claims.",
        "Data work covers collection, preparation, cleaning, coding, analysis and "
        "interpretation. Quantitative and qualitative traditions differ in technique but share "
        "the same obligation to transparency.",
        "Most analysis problems are preparation problems: uncleaned data, undocumented "
        "exclusions, coding decisions made silently. Record every decision as you make it.",
        [("Prepare and clean",
          "Handle missing values, outliers and inconsistencies \u2014 and record what you did and "
          "why."),
         ("Distinguish primary and secondary data",
          "Primary data you collected; secondary data someone else did. Each carries different "
          "limitations, and both must be described."),
         ("Code systematically",
          "Quantitative: a documented codebook. Qualitative: an auditable coding frame someone "
          "else could follow."),
         ("Check assumptions first",
          "A test run on violated assumptions produces a number, not a finding."),
         ("Run the analysis you planned",
          "If you change technique, say so and say why. Never run tests repeatedly until one "
          "reaches significance."),
         ("Interpret within limits",
          "Report what the data shows. Correlation is not causation, and a non-significant "
          "result is a result, not a failure.")],
        "From raw data to evidence",
        ["Data collection", "Preparation and cleaning", "Coding", "Assumption checks",
         "Analysis", "Tables and figures", "Interpretation"],
        "Example only: of the responses received, a number were excluded for incomplete scales; "
        "the exclusions and the missing-data approach are reported in the analysis chapter.",
        "Example only: data was analysed and the results were significant.",
        ["Running tests repeatedly until one reaches significance",
         "Excluding cases without reporting the exclusions",
         "Presenting correlation as causation",
         "Altering or selectively reporting data to fit an expected result"],
        ["Cleaning and exclusions are documented",
         "Assumptions were checked before testing",
         "The analysis matches what the methodology promised",
         "Tables and figures stand on their own",
         "No claim exceeds what the data supports"],
        "Document every decision as you make it. Reconstructed analysis is never fully "
        "defensible."),

    guide(
        "thesis", "results-discussion", 7,
        "How to write results and discussion", "Write Results & Discussion",
        "Separate what you found from what it means \u2014 the distinction examiners look for first.",
        "Results report. Discussion interprets. Collapsing the two is the most common structural "
        "fault in a thesis.",
        "The results chapter presents findings neutrally and in an organised way. The discussion "
        "explains them against your objectives, your framework and prior studies.",
        "A discussion that restates the results table has done no work. One that explains why a "
        "finding agrees with some prior studies and contradicts others is doing exactly what the "
        "chapter is for.",
        [("Report results neutrally",
          "Organise by objective or question. No interpretation, no speculation."),
         ("Open the discussion with the answer",
          "Address each objective directly before elaborating."),
         ("Compare with prior work",
          "Agreement and disagreement both matter. Explain the disagreement rather than omitting "
          "it."),
         ("Connect to the framework",
          "Show how findings support, extend or complicate the theory you used."),
         ("Address unexpected findings",
          "An unexplained result is a weakness; an examined one is a contribution."),
         ("State implications honestly",
          "Theoretical and practical, bounded by what your design can actually support.")],
        "Results versus discussion",
        ["Analysis output", "Results: what was found", "Comparison with literature",
         "Theoretical framework", "Discussion: what it means", "Implications"],
        "Example only: motivation was higher in one group. This aligns with autonomy-based "
        "accounts but contradicts studies reporting cohesion loss, possibly because "
        "participation here was voluntary.",
        "Example only: the results show this approach is better, which proves the hypothesis.",
        ["Repeating the results table in prose and calling it discussion",
         "Interpreting inside the results chapter",
         "Ignoring findings that contradict expectations",
         "Claiming proof from a single study"],
        ["Results contain no interpretation",
         "Every objective is answered explicitly in the discussion",
         "Agreements and disagreements with prior work are both addressed",
         "Unexpected findings are examined",
         "Implications stay within what the design supports"],
        "If your discussion could be deleted without losing meaning, it was a second results "
        "chapter."),

    guide(
        "thesis", "conclusion-recommendations", 8,
        "How to write a conclusion and recommendations", "Conclusion & Recommendations",
        "Close the study honestly: findings, contribution, limitations and what comes next.",
        "The conclusion is where you say what the study established, and what it did not.",
        "A conclusion summarises major findings, states the contribution, draws implications, "
        "acknowledges limitations and points to future research. It introduces nothing new.",
        "Readers often read the introduction and the conclusion only. This chapter should be "
        "comprehensible on its own, without over-claiming.",
        [("Summarise the major findings",
          "Against the objectives, briefly. No new data, no new citations."),
         ("State the contribution",
          "What does the field now know that it did not before your study?"),
         ("Draw implications",
          "Theoretical, practical or policy \u2014 only those your evidence supports."),
         ("State limitations plainly",
          "Design, sample, context, instrument. Naming them strengthens the work."),
         ("Suggest future research",
          "Specific next steps that follow from your limitations, not a generic call for more "
          "research.")],
        "Closing the study",
        ["Objectives revisited", "Major findings", "Contribution", "Implications",
         "Limitations", "Future research"],
        "Example only: findings are limited to voluntary arrangements in one sector; whether "
        "they hold under mandated policies remains open.",
        "Example only: this study proves the approach increases motivation in all organisations.",
        ["Introducing new findings or citations in the conclusion",
         "Generalising far beyond the sample",
         "Omitting limitations to appear stronger",
         "Recommending further research with no specifics"],
        ["No new material appears here",
         "Each objective is addressed",
         "The contribution is stated in one sentence",
         "Limitations are specific to this design",
         "Future research follows from those limitations"],
        "Honest limitations make a conclusion stronger, not weaker."),

    guide(
        "thesis", "references", 9,
        "How to format references in APA 7th Edition", "References \u2014 APA 7th Edition",
        "Cite accurately and format consistently so every source can be traced.",
        "References let a reader verify every claim you made. Formatting is the least of it; "
        "accuracy is the point.",
        "APA 7th Edition governs in-text citation and the reference list: author\u2013date in text, "
        "alphabetical entries with a hanging indent, and DOIs given as full links.",
        "Examiners check that every in-text citation has a matching reference and the reverse. "
        "Inaccurate or missing citation is treated as a research-integrity matter, not a "
        "formatting slip.",
        [("Cite as you write",
          "Use a reference manager. Reconstructing citations at the end is where errors and "
          "accidental plagiarism enter."),
         ("Match in-text and list",
          "Every citation appears in the list; every entry is cited at least once."),
         ("Follow the patterns",
          "Journal article, book, chapter, website and DOI entries each have a fixed shape. "
          "Apply it consistently."),
         ("Use full DOI links",
          "Given as https://doi.org/ followed by the identifier. Never invent or guess one."),
         ("Verify every entry you did not read",
          "Never copy a reference from another paper's list without checking the original."),
         ("Confirm your institution's edition",
          "Some universities mandate a specific edition or a local variant. Check before "
          "formatting.")],
        "Citation workflow",
        ["Source read", "Recorded in reference manager", "Cited in text",
         "Entry in reference list", "Cross-checked", "Formatted to required edition"],
        "Formatting template only: Author, A. A., & Author, B. B. (Year). Title of the article "
        "in sentence case. Journal Name, Volume(Issue), 00\u201300. https://doi.org/xx.xxxx/xxxxxx",
        "Formatting template only: Author, A. (n.d.). Some article. Retrieved from a website.",
        ["Citations in the text that never appear in the reference list",
         "Inconsistent formatting across entries",
         "Copying a reference from another paper without checking it",
         "Inventing or guessing a DOI"],
        ["Every in-text citation has a matching entry",
         "Entries are alphabetical with a hanging indent",
         "DOIs are full https://doi.org/ links",
         "No entry was copied unverified from another source",
         "The edition matches my institution's requirement"],
        "The reference list is a verification tool. Accuracy matters more than neatness."),

    guide(
        "thesis", "final-submission", 10,
        "How to format, proofread and submit a thesis", "Formatting & Final Submission",
        "Meet your university's requirements exactly and submit without avoidable delay.",
        "Submission is a compliance task. Most delays are formatting failures, not academic ones.",
        "Final submission covers formatting to the university template, proofreading, the "
        "similarity check, required front and back matter, approvals, and the submission itself.",
        "Universities return submissions for margin widths, missing certificates and incorrect "
        "declarations. These are entirely avoidable with a checklist and some time.",
        [("Obtain the official template",
          "Margins, fonts, spacing, pagination and heading levels come from your university, not "
          "from convention."),
         ("Assemble front and back matter",
          "Title page, declaration, certificates, acknowledgements, contents, lists of tables "
          "and figures, appendices."),
         ("Proofread in passes",
          "One pass for structure, one for language, one for figures and tables, one for "
          "references. Not all at once."),
         ("Run the similarity check early",
          "Read the matched sources rather than the percentage. A single uncited paragraph "
          "matters more than a high total drawn from quotations and the reference list. Where "
          "text matches, cite it properly \u2014 never reword to reduce a score."),
         ("Collect approvals",
          "Supervisor sign-off and any departmental clearance, with time allowed for revisions."),
         ("Submit with margin",
          "Portals close on time and fail under load. Do not submit on the final evening.")],
        "Submission sequence",
        ["University template", "Front and back matter", "Proofreading passes",
         "Similarity check", "Supervisor approval", "Final submission"],
        "Example only: a similarity report consisting entirely of correctly quoted material, "
        "standard method phrasing and the reference list.",
        "Example only: replacing words with synonyms while keeping the source's sentence "
        "structure, in order to reduce a similarity score.",
        ["Leaving formatting to the final week",
         "Treating the similarity percentage as the only thing that matters",
         "Rewording matched text instead of citing it properly",
         "Submitting without departmental approval in hand"],
        ["The document follows the official template exactly",
         "All required certificates and declarations are included",
         "Proofreading was done in separate passes",
         "The similarity report was read source by source",
         "Approvals are collected and the deadline is not tonight"],
        "Read the matched sources, not the percentage \u2014 and cite rather than reword."),
]


if __name__ == "__main__":
    from build_research_guides_paper import PAPER  # noqa: E402

    guides = THESIS + PAPER
    payload = OrderedDict([
        ("pathways", OrderedDict([
            ("thesis", OrderedDict([
                ("label", "Thesis"),
                ("title", "How to make your thesis"),
                ("intro", "Ten stages, from choosing a topic to final submission."),
            ])),
            ("paper", OrderedDict([
                ("label", "Research Paper"),
                ("title", "How to make your research paper"),
                ("intro", "Ten stages, from selecting a problem to responding to reviewers."),
            ])),
        ])),
        ("guides", guides),
    ])
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)}  guides={len(guides)}")

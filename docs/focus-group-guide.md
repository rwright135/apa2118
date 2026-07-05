# APA2118 Calculator — Focus Group Guide

**Format:** In-person or video call, 60–90 minutes  
**Participants:** 3–5 pilots, financially comfortable, ideally a mix of junior FO, senior FO, and CA  
**Facilitator:** You (one person runs it, one person takes notes if possible)  
**Goal:** Understand how pilots experience the tool — where they hesitate, what they trust, what confuses them. You are not fixing bugs today. You are watching how people use it.

---

## Before the Session

Send participants the URL in advance: https://apa2118.vercel.app

Tell them: "Take a look before we meet, but do not go deep. Just open it and poke around for 5 minutes so the interface is not completely foreign."

Do not send the tester guides. Those are for the separate audit phase.

Prepare:
- A way to take notes (separate person is ideal, otherwise record with permission)
- One printed or shared copy of the pay scale table for reference if questions come up
- A list of each participant's seat, longevity, and anniversary month so you can help them enter inputs quickly if needed

---

## Session Structure

### Part 1 — Context Setting (10 minutes)

Do not show the tool yet. Open with a brief verbal framing.

> "We built a calculator that lets every pilot personalize the contract comparison. Instead of a union-wide average, you enter your seat, your longevity, your retention balance, and it shows you what each scenario is worth to you specifically — Vote Yes, Vote No with a second offer, Vote No with no offer — in today's dollars, compounded to retirement. We are here today to make sure it makes sense before we release it."

Then cover three points quickly:
- All math runs in the browser. Nothing is sent anywhere. The tool does not know who you are.
- The numbers are only as accurate as the inputs. The model is transparent — you can see every assumption.
- You want honest reactions. If something does not make sense, that is valuable information.

---

### Part 2 — Unguided First Look (15 minutes)

Ask everyone to open the tool now on their own device. Phone is fine and preferred for at least one participant.

**Say nothing. Watch.**

Let them go through the wizard on their own. Note:
- Where does each person pause or re-read?
- What do they say out loud without being prompted?
- What do they try to click that does not work or seems like it should do something?
- Does anyone skip a wizard step without reading it?
- Does anyone get confused about which longevity year to enter?
- Does anyone reach results and immediately scroll past the cards to look at the table?

Do not answer questions during this phase. If someone asks "what does this mean?" say "write it down and we will talk about it in a few minutes."

---

### Part 3 — Guided Walkthrough (20 minutes)

Go through the tool together step by step. Use one participant's inputs as the live example — ideally the most typical pilot in the room.

**Wizard steps — questions to prompt discussion at each step:**

**Seat / Upgrade:**
- Did anyone not know whether to select "FO" or "Captain"? Was the question clear?
- For FOs who expect to upgrade: was it clear what the upgrade slider means and what effect it has on the results?

**Longevity:**
- Did everyone immediately know their longevity year, or did anyone have to think about it?
- Does the current hourly rate shown (CBA rate) match what pilots actually see on their paycheck? If it does not match, we have a data error.

**Anniversary month:**
- Did anyone not know their hire anniversary month off the top of their head?
- Is the question worded clearly?

**Date of birth / Line type / Extra hours:**
- Any confusion on these?

**Retention bonus:**
- Did anyone not know their current retention balance?
- Does the range of reasonable retention balances feel right? (Junior FO ~$80–110K, senior FO ~$130–150K, junior CA ~$180K, senior CA ~$220–250K)

**Vote No scenario sliders:**
- Did participants understand what "probability of second offer" means? Or did it feel like they were being asked to guess something they cannot know?
- Was it clear that changing these sliders changes which outcome looks better? Or did it feel like a trick question?
- Did anyone adjust the sliders to reflect their personal belief, or did they leave defaults?

**Results screen — questions to prompt discussion:**

- Before anyone explains anything: "What is the first number you looked at, and what did you think it meant?"
- Does the Risk vs. Reward framing land? Do participants understand they are seeing a binary outcome — gain vs. loss — not a single expected value?
- Does the Vegas Odds section make sense? Does the moneyline framing help or feel out of place for a labor contract discussion?
- Does the Worth the Risk card make sense? Specifically: does it correctly convey that the retention bonus under Vote No accrues more, but is uncertain, and has a time value cost?
- Does anyone look at the results and immediately want to know "okay but what should I do?" If so, does the tool help them answer that, or does it leave them hanging?

---

### Part 4 — Structured Debrief (20 minutes)

Go around the room and get each person's answer to each question. Do not let one person dominate. You want to hear from the junior pilot and the senior pilot equally.

---

**Question 1 — First Impression**
> "When you saw your results for the first time, what was your immediate reaction? Not the numbers — the feeling."

What you are listening for: Did they feel informed? Confused? Surprised? Overwhelmed? Did the tool feel trustworthy or did something feel off?

---

**Question 2 — The Number That Mattered**
> "Which single number or piece of information on the results page did you find most useful or most meaningful to you personally?"

What you are listening for: Is it the headline dollar figure? The Vegas Odds? The month-by-month table? The chart? Different pilots prioritizing different things tells you what to make more prominent.

---

**Question 3 — Trust**
> "Would you feel comfortable sharing this tool with a fellow pilot who is trying to make up their mind? Why or why not?"

What you are listening for: Trust in the math, trust in the framing, concern about bias, concern about accuracy. If the answer is no, the follow-up is "what would need to be different for you to feel comfortable sharing it?"

---

**Question 4 — Confusion**
> "What was the single hardest thing to understand? Not what you disagree with — what was hardest to follow?"

What you are listening for: Specific steps in the wizard, specific cards in the results, specific terminology. Write down the exact words they use to describe what confused them.

---

**Question 5 — Missing Information**
> "What question did you have while using the tool that it did not answer?"

What you are listening for: Missing inputs, missing scenarios, missing explanations. Common answers might be "what happens if I retire before JCBA?" or "what does this number look like if I fly extra hours?"

---

**Question 6 — The Gut Check**
> "Based on your own knowledge of the contract, did anything look wrong? A rate that seemed off, a number that was higher or lower than you expected?"

What you are listening for: Math errors that slipped through testing, or assumptions that do not match pilot experience. If someone says a number seems wrong, write down exactly what they expected and what the tool showed.

---

**Question 7 — Deployment Readiness**
> "If we sent this to the full pilot group tomorrow, what is the one thing you would fix first?"

What you are listening for: The highest-priority single change. This surfaces what bothers people most.

---

### Part 5 — Closing (5 minutes)

Thank participants. Tell them:
- A separate group of pilots with financial backgrounds will do a detailed math audit after this
- If they notice anything in the next few days — a number that seemed off, a question they thought of later — they can reach out
- Their feedback directly shapes what gets changed before release

Do not make any promises about specific changes. Just confirm that feedback is being taken seriously.

---

## Facilitation Notes

**On neutrality:** This tool is designed to inform, not to advocate. If participants ask "so what does this say I should do?" redirect: "It is designed to show you the math for your specific situation. What does your number say?" Do not editorialize on the results.

**On the retention bonus:** This is the most emotionally loaded number for many pilots. Some will be surprised by how large their accrued balance is. Others will be skeptical about whether they will actually receive it under Vote No. Let them react. The tool represents this as a probability — make sure participants understand that the payout probability slider is their own assumption to set, not a prediction.

**On the Vegas Odds section:** Some pilots will find the moneyline framing intuitive. Others will find it trivializing. Be ready for that reaction. The question to ask is "does this help you understand the risk, or does it feel like the wrong frame for a contract decision?"

**On phone vs. desktop:** If anyone opens it on a phone and things look wrong or cramped, write it down. The tool should work on mobile since that is how most pilots will access it.

**On time:** The guided walkthrough (Part 3) will go over time. Cut questions from the debrief if needed, but do not cut Questions 3 (trust), 6 (gut check), and 7 (fix first). Those are the most important.

---

## After the Session

Within 24 hours, send a summary to whoever needs it covering:
- What pilots found most useful
- What was most confusing
- Any specific numbers or rates that participants flagged as potentially wrong
- The top one or two changes that came out of Question 7

Then hand off to the math audit testers.

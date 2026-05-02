# SMC_jsPsych: Symbolic Magnitude Comparison Task

A browser-based symbolic magnitude comparison task built with [jsPsych 8.0.2](https://www.jspsych.org/). Participants compare pairs of numbers and indicate which is greater (or lesser), with stimuli and trial logic defined in a separate `stimuli.js` file and experiment flow managed in `index.js`.

This task is part of a dissertation study on negative integer representation and the distance and semantic congruence effects in magnitude comparison across positive, negative, and mixed-sign number pairs.

---

## Repository Structure

```
SMC_jsPsych/
├── index.html      # Entry point; loads jsPsych and all experiment scripts
├── index.js        # Experiment timeline: instructions, trials, data saving
└── stimuli.js      # Stimulus definitions (number pairs, conditions, metadata)
```

---

## Task Overview

On each trial, participants see a pair of numbers and press a key to indicate which number is greater or lesser (exact response mapping defined in `index.js`). Stimuli vary across:

- **Comparison type:** Positive-Positive, Negative-Negative, or Mixed (Positive-Negative) pairs
- **Distance:** Numerical distance between the two values
- **Size:** Whether the target number is the larger or smaller of the pair (relevant to the semantic congruence effect)
- **Predicate:** Whether the participant is asked to choose the greater or lesser value

Stimulus pairs and their metadata (distance, size, correct response, etc.) are defined in `stimuli.js` and loaded before the experiment timeline runs.

---

## Experiment Flow

1. Participant ID is read from the URL query string (passed by Qualtrics or a recruitment platform) or randomly generated
2. Instructions screen(s) — rendered with `@jspsych/plugin-instructions`
3. Optional text input (e.g., demographic collection) — rendered with `@jspsych/plugin-survey-text`
4. Comparison trials — rendered with `@jspsych/plugin-html-keyboard-response`
5. Data saved to [DataPipe](https://pipe.jspsych.org/) via `@jspsych-contrib/plugin-pipe`
6. Redirect prompt back to Qualtrics

---

## Qualtrics Integration

The experiment reads a `participant_id` from the URL query string. Qualtrics can pass this automatically using an embedded data field. Example launch URL:

```
https://n-vest.github.io/SMC_jsPsych/?participant_id={{e://Field/ResponseID}}
```

If no `participant_id` is present, a random ID is generated at runtime.

---

## Data Output

Each participant's data is saved as a CSV file via DataPipe, named by `participant_id`. Recorded variables will include (at minimum):

| Variable | Description |
|----------|-------------|
| `participant_id` | Unique participant identifier |
| `stimulus` | The number pair displayed |
| `response` | Key pressed |
| `rt` | Reaction time (ms) |
| `correct` | Whether the response was accurate |
| `comparison_type` | Positive, Negative, or Mixed |
| `distance` | Numerical distance between the pair |

*Exact variable names depend on metadata attached in `stimuli.js`.*

---

## Dependencies

All loaded via CDN — no installation required.

| Package | Version |
|---------|---------|
| jsPsych | 8.0.2 |
| @jspsych/plugin-html-keyboard-response | 2.0.0 |
| @jspsych/plugin-instructions | 2.0.0 |
| @jspsych/plugin-survey-text | 2.0.0 |
| @jspsych-contrib/plugin-pipe | latest |

---

## Running the Experiment

**Locally:** Open `index.html` in a browser. Note that DataPipe saving may not work under `file://`; use a local server (e.g., `npx serve .` or VS Code Live Server) for full functionality.

**Hosted:** Deploy to GitHub Pages or any static file host and link participants via the URL format above.

---

## Notes

- The DataPipe experiment ID is hardcoded in `index.js`. Update it if you fork this repository and configure a new DataPipe project.
- `stimuli.js` loads before `index.js` (per `index.html` script order), so all stimulus arrays and metadata are available to the timeline when it builds.
- jsPsych 8.x is a breaking change from 7.x. This experiment is not compatible with jsPsych 7 plugins without modification.

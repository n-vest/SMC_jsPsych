const urlParams = new URLSearchParams(location.search)
// This excerpt allows you to run the experiment offline by adding
// ?offline=1 to the url
const OFFLINE = urlParams.has('offline')


function makeCompStimulus(left, right, chooseGreater) {
  if (left > 0) { left = `+${left}` }
  if (right > 0) { right = `+${right}` }

  const instruction = chooseGreater
    ? "'A' key: first is greater, 'L' key: second is greater"
    : "'A' key: first is lesser, 'L' key: second is lesser";

  return `
    <div style="display: flex; justify-content: center; font-size: 80px;">
      <div>${left}</div>
      <div style="width: 50vw; flex-shrink: 0;"></div>
      <div>${right}</div>
    </div>
    <div>
      <div style="text-align: center; margin-top: 200px; color: grey;">
        ${instruction}
      </div>
    </div>`;
}

/*

  {
    "Sections": "Section1",
    "Stimulus_L": 32
  }

    item["Sections"]

**/

function extractGroup(list, columnName, columnValue) {
  const extractedBlock = []
  for (const item of list) {
    if (item[columnName] == columnValue) {
      extractedBlock.push(item)
    }
  }
  return extractedBlock
}

function displayRow(all_trials, item, configuration, chooseGreater) {
  if (configuration == "simultaneous-ungrouped" || configuration == "simultaneous-grouped") {
    const trial = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: makeCompStimulus(item.Stimulus_L, item.Stimulus_R, chooseGreater),
      choices: ['a', 'l'],
      data: {
        Stimulus_ID: item.Stimulus_ID,
        Sections: item.Sections,
        configuration: configuration
      }
    }
    all_trials.push(trial);
  } else {
    let Stimulus_L = item.Stimulus_L;
    let Stimulus_R = item.Stimulus_R;

    if (Stimulus_L > 0) { Stimulus_L = `+${Stimulus_L}` }
    if (Stimulus_R > 0) { Stimulus_R = `+${Stimulus_R}` }

    const trial1 = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `<div style="font-size: 5em;">${Stimulus_L}</div>`,
      choices: [],
      trial_duration: 500
    };

    const trial2 = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `<div style="font-size: 5em;">${Stimulus_R}</div>`,
      choices: [],
      trial_duration: 500
    };

    const instruction = chooseGreater
      ? "'A' key: first is greater, 'L' key: second is greater"
      : "'A' key: first is lesser, 'L' key: second is lesser";

    const trial3 = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `<div style="text-align: center; margin-top: 200px; color: grey;">
        ${instruction}
      </div>`,
      choices: ['a', 'l'],
      data: {
        Stimulus_ID: item.Stimulus_ID,
        Sections: item.Sections,
        configuration: configuration
      }
    };

    all_trials.push(trial1);
    all_trials.push(trial2);
    all_trials.push(trial3);
  }
}

const jsPsych = initJsPsych({
  on_finish: function() {
    // download the data once the experiment completes
    if (OFFLINE) {
      jsPsych.data.get().localSave('json','mydata.json');
    }
  }
});

function handleConfiguration(configuration) {
  const SECTIONS = ["Section1", "Section2"];
  for (const section of SECTIONS) {
    let taskInstructions = '';
    let chooseGreater = true;

    if (section == "Section1" || section == "Section2") {
      taskInstructions = `Please indicate which of the two is <b>greater</b>.`;
    } else {
      taskInstructions = `Please indicate which of the two is <b>lesser</b>.`;
      chooseGreater = false; // Change key mappings for lesser task
    }

    all_trials.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `<p>Please take a break if you need to. ${taskInstructions}</p><p>Press [SPACEBAR] to continue</p>`,
      choices: [' '],
    });

    const sectionStimuli = extractGroup(allStimuli, "Sections", section);

    if (configuration == "simultaneous-grouped" || configuration == "sequential-grouped") {
      let comparisonTypes = ["Mixed", "Positive", "Negative"];
      comparisonTypes = jsPsych.randomization.shuffle(comparisonTypes);
      for (const comparisonType of comparisonTypes) {
        const comparisonTypeStimuli = extractGroup(sectionStimuli, "Comparison_Type", comparisonType);
        for (const item of comparisonTypeStimuli) {
          displayRow(all_trials, item, configuration, chooseGreater);
        }
      }
    } else {
      for (const item of sectionStimuli) {
        displayRow(all_trials, item, configuration, chooseGreater);
      }
    }

    if (section == "Section2" || section == "Section4") {
      all_trials.push({
        type: jsPsychSurveyText,
        questions: [{ prompt: 'What strategy(s) are you using to judge the pairs?', rows: 5 }],
        data: { questionAfter: section, questionType: 'strategy' }
      });
    }
  }
}

// this list will contain all the trials we want jsPsych to run      
const all_trials = []

// Add the text entry box
all_trials.push({
  type: jsPsychSurveyText,
  questions: [
    { prompt: "Please enter the last 4 digits of your university student ID:", rows: 1 },
  ],
  data: { questionType: "pre-experiment" }
});

allStimuli = jsPsych.randomization.shuffle(allStimuli)

all_trials.push({
  type: jsPsychInstructions,
  pages: ['Welcome to the first task in this study. This task will take approximately 20 minutes.', 'As described in Qualtrics, you will judge which number is greater or lesser in a pair using the A and L keys on your keyboard. <br>When you are ready to begin, click next.'],
  show_clickable_nav: true
})

// 1, 3: simultaneous
// 3, 4: grouped by comparison type

let configurations = ["simultaneous-ungrouped",
                      "sequential-ungrouped",
                      "simultaneous-grouped",
                      "sequential-grouped"]



const conditions = [
  ["simultaneous-ungrouped", "simultaneous-grouped"],
  ["simultaneous-grouped", "simultaneous-ungrouped"],
  ["sequential-ungrouped", "sequential-grouped"],
  ["sequential-grouped", "sequential-ungrouped"]
]


async function main() {
  const EXPERIMENT_ID = 'Kb4Oo6ejDPfC'
  let conditionIndex;
  if (!OFFLINE) {
    conditionIndex = await jsPsychPipe.getCondition(EXPERIMENT_ID)
  } else {
    conditionIndex = 0
  }

  const assignedCondition = conditions[conditionIndex]

  jsPsych.data.addProperties({ assignedCondition: assignedCondition })  

  for (const configuration of assignedCondition) {
    // In case you want to add stuff before each configuration
    handleConfiguration(configuration)
  }

  // Generate a random subject ID.
  const subjectID = jsPsych.randomization.randomID(10);

  if (!OFFLINE) {
    all_trials.push({
      type: jsPsychPipe,
      action: "save",
      experiment_id: EXPERIMENT_ID,
      filename: `${subjectID}.json`,
      data_string: () => jsPsych.data.get().json()
    });
  }

// Add the final message
all_trials.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `<div style="text-align: center; margin-top: 200px; font-size: 2em;">
               Thank you for participating in the experiment.<br>
               Please return to Qualtrics to complete the survey.<br><br>
             </div>`,
  choices: "ALL_KEYS"
});

  jsPsych.run(all_trials);
}


main()

function makeCompStimulus(left, right) {
  if (left > 0) { left = `+${left}` }
  if (right > 0) { right = `+${right}` }
        return `
<div style="display: flex; justify-content: center;
             font-size: 80px;">
   <div>${left}</div>
   <div style="width: 50vw; flex-shrink: 0;"></div>
   <div>${right}</div>
 </div>
 <div>
   <div style="text-align: center; margin-top: 200px;
               color: grey;">
     left arrow key: left is larger, right arrow key: right is larger
   </div>
 </div>`
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

function displayRow(all_trials, item, configuration) {
  if (configuration == "simultaneous-ungrouped" || configuration == "simultaneous-grouped") {
    const trial = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: makeCompStimulus(item.Stimulus_L, item.Stimulus_R),
      choices: ['ArrowLeft', 'ArrowRight'],
      data: {
        Stimulus_ID: item.Stimulus_ID,
        Sections: item.Sections,
        configuration: configuration
      }
    }
    all_trials.push(trial)
  } else {

    let Stimulus_L = item.Stimulus_L
    let Stimulus_R = item.Stimulus_R

    if (Stimulus_L > 0) { Stimulus_L = `+${Stimulus_L}`}
    if (Stimulus_R > 0) { Stimulus_R = `+${Stimulus_R}`}
    
    const trial1 = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `<div style="font-size: 5em;">${Stimulus_L}</div>`,
      choices: [],
      trial_duration: 2000
    }

    const trial2 = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `<div style="font-size: 5em;">${Stimulus_R}</div>`,
      choices: [],
      trial_duration: 2000
    }

    const trial3 = {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `<div style="text-align: center; margin-top: 200px;
               color: grey;">
     left arrow key: left is larger, right arrow key: right is larger
</div>`,
      choices: ['ArrowLeft', 'ArrowRight'],
      data: {
        Stimulus_ID: item.Stimulus_ID,
        Sections: item.Sections,
        configuration: configuration
      }
    }

    all_trials.push(trial1)
    all_trials.push(trial2)
    all_trials.push(trial3)
    
  }
}

const jsPsych = initJsPsych({
  on_finish: function() {
    // download the data once the experiment completes
    jsPsych.data.get().localSave('json','mydata.json');
  }
});

function handleConfiguration(configuration) {
  const SECTIONS = ["Section1", "Section2", "Section3", "Section4"]
  for (const section of SECTIONS) {
    let taskInstructions = ''
    
    if (section == "Section1" || section == "Section2") {
      taskInstructions = `Please indicate which of the two is <b>greater</b>.`
    } else {
      taskInstructions = `Please indicate which of the two is <b>lesser</b>.`
    }

    all_trials.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `<p>Please take a break if you need to. ${taskInstructions}</p><p>Press [SPACEBAR] to continue</p>`,
      choices: [' '],
    })

    const sectionStimuli = extractGroup(allStimuli, "Sections", section)

    if (configuration == "simultaneous-grouped" || configuration == "sequential-grouped") {
      let comparisonTypes = ["Mixed", "Positive", "Negative"]
      comparisonTypes = jsPsych.randomization.shuffle(comparisonTypes)
      // console.log(comparisonTypes)
      for (const comparisonType of comparisonTypes) {
        const comparisonTypeStimuli = extractGroup(sectionStimuli,
                                                   "Comparison_Type",
                                                   comparisonType)
        for (const item of comparisonTypeStimuli) {
          displayRow(all_trials, item, configuration)
        }
      }
      // pass
    } else {
      for (const item of sectionStimuli) {
        displayRow(all_trials, item, configuration)
      }
    }

    if (section == "Section2" || section == "Section4") {
      all_trials.push({
        type: jsPsychSurveyText,
        questions: [{ prompt: 'What strategy are you using?', rows: 5 }],
        data: { questionAfter: section, questionType: 'strategy' }
      })
    }
  }

}

// this list will contain all the trials we want jsPsych to run      
const all_trials = []

allStimuli = jsPsych.randomization.shuffle(allStimuli)

all_trials.push({
  type: jsPsychInstructions,
  pages: ['Indicate which one is greater/lesser', 'Second page'],
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

function getJsPsychCondition() {
  return 0
}

const conditionIndex = getJsPsychCondition();
const assignedCondition = conditions[conditionIndex]

jsPsych.data.addProperties({ assignedCondition: assignedCondition })

const EXPERIMENT_ID = 'Kb4Oo6ejDPfC'

for (const configuration of assignedCondition) {
  // In case you want to add stuff before each configuration
  handleConfiguration(configuration)
}

jsPsych.run(all_trials);

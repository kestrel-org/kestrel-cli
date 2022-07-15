import prompts from 'prompts';

function cancelProcess(){
  process.exit(0);
}

/**
 * Prompt a yes/no question
 *
 * @param message Message to prompt
 * @param initial Default response when prompting 'false' if not provided
 * @returns response
*/
const confirm = async (message : string, initial : boolean = false) => {
  const { yesno } = await prompts({
    type: 'toggle',
    name: 'yesno',
    message: message,
    initial: initial,
    active: 'yes',
    inactive: 'no'
  },
  {
    onCancel: cancelProcess
  })
  return yesno
}

/**
 * Prompt a question with user input response
 *
 * @param message Message to prompt
 * @param validate Function to validate the user input
 * @param initial Default response when prompting empty string if not provided
 * @returns response
*/
const ask = async (message : string, validate = (input : string)=>{return true},initial = "") => {
  const { response } = await prompts({
      type: 'text',
      name: 'response',
      initial: initial,
      message: message,
      validate : validate
    },
    {
      onCancel: cancelProcess
    }
  )
  return response
}

/**
 * Prompt a single choice select
 *
 * @param message Message to prompt
 * @param choices List of choices
 * @param initial Default response when prompting '0' if not provided
 * @param convert
 * @returns response
*/
const select = async (message : any,choices :any, initial = 0,convert=false) => {
  if(convert){
    choices = choices.map((choice :any) =>{
      return {title : choice,value : choice}
    })
  }
  const { response } = await prompts({
    type: 'select',
    name: 'response',
    message: message,
    choices: choices,
    initial: initial
  },
    {
      onCancel: cancelProcess
    }
  )
  return response
}

/**
 * Prompt for a string separated by ,
 *
 * @param message Message to prompt
 * @param initial Default response when prompting empty string if not provided
 * @returns response
*/
const askList = async (message : string, initial = '') => {
  const { response } = await prompts({
    type: 'list',
    name: 'response',
    message: message,
    initial: initial,
    separator : ","
  },
    {
      onCancel: cancelProcess
    }
  )
  return response
}

/**
 * Create any prompts from the prompts package
 *
 * @param questions List of prompts Question object
 * @returns response
*/
const any = async(questions : any) => await prompts(questions,{onCancel: cancelProcess})

const inject = prompts.inject

export default {
  confirm,
  ask,
  select,
  askList,
  any,
  inject
}

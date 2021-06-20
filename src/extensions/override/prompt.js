
let prompts = null
function getPrompts() {
  if (prompts) return prompts

  const Prompts = require('prompts');
  prompts = Prompts;

  return prompts
}

function cancelProcess(){
  process.exit(0);
}

const confirm = async (message, initial = false) => {
  const { yesno } = await getPrompts()({
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

const ask = async (message, validate = (input)=>{return true},initial = "") => {
  const { response } = await getPrompts()({
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
const select = async (message,choices, initial = 0,convert=false) => {
  if(convert){
    choices = choices.map(choice =>{
      return {title : choice,value : choice}
    })
  }
  const { response } = await getPrompts()({
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

const askList = async (message, initial = '') => {
  const { response } = await getPrompts()({
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


const prompt = {
  confirm,
  ask,
  select,
  askList : askList,
  any: async questions => {
    return getPrompts()(questions,{onCancel: cancelProcess})
  },
  inject : getPrompts().inject
}

module.exports = prompt


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

const ask = async (message, initial = "exemple") => {
  const { response } = await getPrompts()({
      type: 'text',
      name: 'response',
      initial: initial,
      message: message
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
  any: async questions => {
    return getPrompts()(questions,{onCancel: cancelProcess})
  }
}

module.exports = prompt

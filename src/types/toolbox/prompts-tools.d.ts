import prompts,{ Answers,PromptObject } from "prompts";

export type Validate = (input : string) => boolean | string


export interface KcPrompts{
  /**
   * Prompt a yes/no question
   * @param message Message to prompt
   * @param initial Default response when prompting 'false' if not provided
   * @returns response as boolean
  */
  async confirm(message : string, initial : boolean = false) : Promise<boolean>,
  
  /**
   * Prompt a question with user input response
   * @param message Message to prompt
   * @param validate Function to validate the user input
   * @param initial Default response when prompting empty string if not provided
   * @returns response as string
  */
  async ask(message : string, validate? : Validate, initial = "") : Promise<string>
  
  /**
   * Prompt a single choice select
   * @param message Message to prompt
   * @param choices List of choices
   * @param initial Default response when prompting '0' if not provided
   * @param convert
   * @returns response
  */
  async select(message : any,choices :any, initial = 0,convert=false) : Promise<any>
  
  /**
   * Prompt for a string separated by ,
   * @param message Message to prompt
   * @param initial Default response when prompting empty string if not provided
   * @returns response
  */
  async askList(message : string, initial = '') : Promise<string[]>
  
  /**
   * Create any prompts from the prompts package
   * @param questions List of prompts Question object
   * @returns response
  */
  async any<T extends string>(questions : PromptObject[]) : Promise<Answers<T>>
  
  inject(arr: readonly any[]): void
}
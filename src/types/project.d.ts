/**
 * Structure of a kestre-cli file
 */
export interface cliFile {
  projects: {
    backend_path?: string
    frontend_path?: string
  }
  version: string
}
/**
 * Contains all project related paths and data
 */
export default interface Project {
  /**
   * Path to the kestre-cli file
   */
  project_def?: string
  /**
   * Content of the kestre-cli file
   */
  def_content?: cliFile
  /**
   * Path to the backend if it exist
   */
  backend_path?: string
  /**
   * Path to the frontend if it exist
   */
  frontend_path?: string
}

export interface ProjectUse {
  project_def: string
  /**
   * Content of the kestre-cli file
   */
  def_content: cliFile
  /**
   * Path to the backend if it exist
   */
  backend_path: string
  /**
   * Path to the frontend if it exist
   */
  frontend_path: string
}

import Sequelize from 'sequelize'
export interface AddProps {
  path_to_model: string | null
  path_to_app: string | null
  path: string | null
  model: string | null
  crud: string[] | null
  model_def: string | null
  model_single: string | null
  model_id: string | null
  model_data: Array<any>
  model_properties: Array<any>
  model_id_type?: string
  [key: string]: any
}

export interface Database {
  sequelize: Sequelize.Sequelize
  Sequelize: Sequelize
}

export interface PromptsModels {
  title: string
  value: string | boolean
}
export interface PathObject {
  [key: string]: string
}

export interface swaggerTypes {
  number: string[]
  string: string[]
  boolean: string[]
  integer: string[]
}

export interface Route {
  checkToken: boolean
  checkAuthenticated: boolean
  path: string
  router: string
}
export type AddRoutePrompts =
  | 'checkToken'
  | 'checkAuthenticated'
  | 'path'
  | 'model'
  | 'crud'
  | 'createTest'
  | 'testOverwrite'
  | 'createService'
  | 'serviceOverwrite'
  | 'swaggerOverwrite'

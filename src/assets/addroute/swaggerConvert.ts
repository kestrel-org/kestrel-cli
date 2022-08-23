import { swaggerTypes } from '@src/types/commands/addRoute'

/**
 * Array of sequelize types to convert to swagger
 */
const swagger_convert: swaggerTypes = {
  number: ['DOUBLE', 'TINYINT', 'FLOAT', 'BIGINT', 'DECIMAL', 'REAL'],
  string: ['VARCHAR', 'DATE', 'DATEONLY', 'CITEXT', 'TEXT', 'CHAR', 'STRING'],
  boolean: ['BOOLEAN'],
  integer: ['INTEGER'],
}

/**
 * Transform sequelize data types into sawgger data types
 * @param type Sequelize Type
 * @returns Swagger Type
 */
function convertSequelizeToSwaggerTypes(type: string): string {
  let regex_type = type.match(/^.*?(?=( |\(|\.|$))/)
  if (!regex_type || regex_type.length < 2) {
    throw new Error(
      `${type} could not be identified as a sequelize data type !`
    )
  }
  const regexFound: string = regex_type[0]
  let found = false
  for (let swagger_type in swagger_convert) {
    if (
      swagger_convert[swagger_type as keyof swaggerTypes].includes(regexFound)
    ) {
      type = swagger_type
      found = true
      break
    }
  }
  if (!found) {
    type = 'string'
  }
  return type
}

export default convertSequelizeToSwaggerTypes

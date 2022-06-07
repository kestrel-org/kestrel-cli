const swagger_convert = {
    number : [
        "DOUBLE",
        "TINYINT",
        "FLOAT",
        "BIGINT",
        "DECIMAL",
        "REAL"
    ],
    string : [
        "VARCHAR",
        "DATE",
        "DATEONLY",
        "CITEXT",
        "TEXT",
        "CHAR",
        "STRING"
    ],
    boolean : [
        "BOOLEAN"
    ],
    integer : [
        "INTEGER"
    ]
}

// Transform sequelize data types into sawgger data types

function convertSequelizeToSwaggerTypes(type){
    let regex_type = type.match(/^.*?(?=( |\(|\.|$))/);
    if(regex_type.length<2){
        throw new Error(`${type} could not be identified as a sequelize data type !`);
    }
    regex_type = regex_type[0];
    let found = false;
    for(let swagger_type in swagger_convert){
        if(swagger_convert[swagger_type].includes(regex_type)){
            type = swagger_type;
            found=true;
            break;
        }
    }
    if(!found){
        type = "string";
    }
    return type
}

module.exports = convertSequelizeToSwaggerTypes
const { BadRequestError } = require("../expressError");

// Helper for Selective Update queires

// The calling function is use to make a SET clause of an update SQL queires

// @params dataToUpdate {fieldName : newVal,secondFieldname : newVal}
// @params jsToSql { firstName :"first_name" , age :"age"}

//returns { setCols , dataToUpdate }

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };

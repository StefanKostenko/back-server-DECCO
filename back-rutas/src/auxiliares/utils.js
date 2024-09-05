function isNullorUndefined(value) {
  if (value === null || value === undefined) {
    return true;
  } else {
    return false;
  }
}

function stringISOonoZ(date) {
  return new Date(date).toISOString().slice(0, -1);
}

module.exports = { isNullorUndefined, stringISOonoZ };

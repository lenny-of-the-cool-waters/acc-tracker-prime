function getOffset(currentPage = 1, listPerPage) {
    return (currentPage - 1) * [listPerPage];
  }
  
  function emptyOrRows(rows) {
    if (!rows) {
      return [];
    }
    return rows;
  }
  
  // MODULE EXPORTATIONS
  module.exports = {
    getOffset,
    emptyOrRows
  }
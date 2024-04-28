const isValidString = (data) => {
  return data !== undefined && data !== null && data !== "";
};
const checkValidPassword = (data) => {
  const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}|:<>?]).{6,}$/;

  return passwordRegex.test(data);
};

module.exports = {
  isValidString,
  checkValidPassword,
};

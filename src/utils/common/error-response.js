const error = (data = {}, error = {}) => ({
    success: false,
    message: "Something Went Wrong",
    data,
    error
})


module.exports = error;
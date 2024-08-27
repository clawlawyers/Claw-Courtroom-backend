const success = (data = {}, error = {}) => ({
    success: true,
    message: "Successfully completed the request",
    data,
    error
})


module.exports = success;
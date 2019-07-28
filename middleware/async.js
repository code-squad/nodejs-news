module.exports = function (handler) {
    return async (req, res, next) => {
        try {
            await handler(req, res, next)
        } catch (error) {
            console.error(error);
            return next(error)
        }
    }
};
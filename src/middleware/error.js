export function errorHandler(err, _req, res, _next) {
    const status = err.status || 500;
    const payload = {
        error: err.message || 'Internal Server Error',
    };
    if (process.env.NODE_ENV !== 'production') {
        // Log and include minimal debug details in non-prod only
        console.error(err);
        payload.details = err.stack?.split('\n').slice(0, 2).join('\n');
    }
    res.status(status).json(payload);
}

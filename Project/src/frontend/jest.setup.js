// Silence the warning: react-test-renderer is deprecated.
const originalConsoleError = console.error;
console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('react-test-renderer is deprecated')) {
        return;
    }
    originalConsoleError(...args);
};

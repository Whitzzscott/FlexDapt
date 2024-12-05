function mods() {
    const customAlert = (message) => {
        const alertBox = document.createElement('div');
        alertBox.style.position = 'fixed';
        alertBox.style.top = '20px';
        alertBox.style.left = '50%';
        alertBox.style.transform = 'translateX(-50%)';
        alertBox.style.backgroundColor = '#444';
        alertBox.style.color = '#fff';
        alertBox.style.padding = '15px';
        alertBox.style.borderRadius = '10px';
        alertBox.style.zIndex = '10000';
        alertBox.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.7)';
        alertBox.style.transition = 'opacity 0.5s ease, transform 0.5s ease, box-shadow 0.5s ease';
        alertBox.style.opacity = '0';
        alertBox.style.transform += ' translateY(-20px)';
        alertBox.style.pointerEvents = 'none';
        alertBox.style.userSelect = 'none';
        alertBox.innerHTML = `<i class="fas fa-info-circle" style="margin-right: 8px;"></i>${message}`;
        alertBox.style.fontFamily = "'Roboto', sans-serif";
        document.body.appendChild(alertBox);

        requestAnimationFrame(() => {
            alertBox.style.opacity = '1';
            alertBox.style.transform = 'translateX(-50%) translateY(0)';
        });

        setTimeout(() => {
            alertBox.style.opacity = '0';
            alertBox.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => {
                document.body.removeChild(alertBox);
            }, 500);
        }, 3000);
    };

    window.alert = customAlert;

    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
        const formattedArgs = args.map(arg => (typeof arg === 'string' ? `💬 ${arg}` : arg));
        originalLog.apply(console, formattedArgs);
    };

    console.error = (...args) => {
        const formattedArgs = args.map(arg => (typeof arg === 'string' ? `❌ ${arg}` : arg));
        originalError.apply(console, formattedArgs);
    };
}

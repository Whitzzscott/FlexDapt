
//ignore this as this is for sending the user to the version according to their device to avoid conflict with elements
if (document.getElementById('pc')) {
    document.getElementById('pc').addEventListener('click', () => {
        const creatingUrl = 'mobile.html';
        window.location.href = creatingUrl;
    });
}


if (document.getElementById('pc')) {
    document.getElementById('pc').addEventListener('click', () => {
        const creatingUrl = 'pc.html';
        window.location.href = creatingUrl;
    });
}

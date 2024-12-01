
//ignore this as this is for sending the user to the version according to their device to avoid conflict with elements
if (document.getElementById('mobile')) {
    document.getElementById('mobile').addEventListener('click', () => {
        const creatingUrl1 = 'mobile.html';
        window.open(creatingUrl1, '_blank', 'width=600,height=400');
    });
}

if (document.getElementById('pc')) {
    document.getElementById('pc').addEventListener('click', () => {
        const creatingUrl = 'pc.html';
        window.location.href = creatingUrl;
    });
}

let loginResponse = null;
let BASEURL = null;
let ExtensionID = chrome.runtime.id;

chrome.runtime.sendMessage({ action: 'injectScript' }, (response) => {
  if (response && response.status === 'success') {
    console.log('inject.js was successfully injected.');
  } else {
    console.error('Failed to inject script.', response && response.error);
  }
});

async function loadConfig() {
  const { BASEURL: configBaseUrl } = await import(chrome.runtime.getURL("Config/Config.js"));
  BASEURL = configBaseUrl;
}

async function getLoginData() {
  try {
    const result = await new Promise((resolve, reject) => {
      chrome.storage.local.get('loginResponse', (result) => {
        if (result && result.loginResponse) {
          resolve(result.loginResponse);
        } else {
          reject('No login data found');
        }
      });
    });

    loginResponse = {
      name: result.name || '',
      sessionId: result.sessionId || '',
      token: result.token || ''
    };

    console.log('Login Response:', loginResponse);

    return loginResponse;
  } catch (error) {
    console.error(error);
  }
}

loadConfig();
getLoginData()



const checkLoginStatus = async () => {
  const info = `
Better Sakura is currently managed by a single developer. To support this project, please log in or register. If you'd like to contribute even more, you can donate via the donate button. Your support would mean a lot, as releasing this for free isn't entirely sustainable given that it consists of over 3,000 lines of code. Managing, adding new features, and maintaining the server requires significant effort. By donating, you're helping us keep the project running and supporting the ongoing maintenance of the servers. Please note that this extension is a personal hobby of mine, and your donation helps support both my passion and the continued development of Better Sakura.  `
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  try {
    await delay(100);

    const response = await fetch(`${BASEURL}/check-login-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer SSS155",
      },
      body: JSON.stringify({ loginResponse })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const responseData = await response.json();
    const data = responseData;
    
    if (responseData.user && responseData.user.new_jwt) {
      const jwtToken = responseData.user.new_jwt;
      sessionStorage.setItem("jwtToken", jwtToken);
    } else {
      console.error("Error: 'user' or 'new_jwt' is undefined in the response data.");
    }
    
    
    if (data.is_login === false) {
      const overlay = document.createElement("div");
      overlay.innerHTML = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@400;700&display=swap');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');

  .login-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    z-index: 9998;
    opacity: 0;
    backdrop-filter: blur(12px);
    transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .login-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    min-width: 400px;
    max-width: 90%;
    border-radius: 24px;
    box-shadow: 0 25px 60px rgba(0,0,0,0.6);
    overflow: hidden;
    font-family: 'Baloo Da 2', sans-serif;
  }

  .popup-body {
    background: linear-gradient(165deg, #6366f1, #4338ca);
    padding: 2.5rem;
    text-align: center;
    color: white;
  }

  .popup-title {
    font-weight: 800;
    margin-bottom: 1.2rem;
    font-size: 2rem;
    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .popup-text {
    font-size: 1.1rem;
    line-height: 1.5;
    margin-bottom: 1.5rem;
    opacity: 0.95;
  }

  #info {
    background: rgba(0, 0, 0, 0.2);
    padding: 0.8rem;
    border-radius: 12px;
    font-size: 0.95rem;
    line-height: 1.4;
    margin: 1rem 0;
    color: rgba(255, 255, 255, 0.9);
    border-left: 4px solid rgba(255, 255, 255, 0.3);
  }

  .button-container {
    display: flex;
    gap: 1.2rem;
    justify-content: center;
    margin-top: 1.8rem;
  }

  .login-btn, .register-btn {
    font-size: 1rem;
    padding: 0.9rem 2rem;
    font-weight: bold;
    border: none;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.4s ease;
    min-width: 120px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .login-btn {
    background: white;
    color: #4f46e5;
    box-shadow: 0 4px 15px rgba(0,0,0,0.25);
  }

  .register-btn {
    background: rgba(255,255,255,0.1);
    color: white;
    border: 2px solid rgba(255,255,255,0.8);
    backdrop-filter: blur(4px);
  }

  .login-btn:hover, .register-btn:hover {
    transform: scale(1.05);
  }

  .login-btn:hover {
    box-shadow: 0 8px 25px rgba(79, 70, 229, 0.4);
  }

  .register-btn:hover {
    box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
  }

  .login-btn:active, .register-btn:active {
    transform: scale(1.02);
  }

  @media (max-width: 480px) {
    .login-popup {
      min-width: 90%;
    }
    .popup-body {
      padding: 1.5rem;
    }
    .popup-title {
      font-size: 1.5rem;
    }
    .popup-text {
      font-size: 1rem;
    }
    .button-container {
      flex-direction: column;
      gap: 0.8rem;
    }
    .login-btn, .register-btn {
      font-size: 0.9rem;
      padding: 0.7rem 1.5rem;
    }
  }
</style>

<div class="login-overlay">
  <div class="login-popup animate__animated animate__zoomIn">
    <div class="popup-body">
      <h3 class="popup-title">Welcome to Better Sakura</h3>
      <p class="popup-text">Please login or register to unlock all features and enhance your experience</p>
      <p id="info">${info}</p>
      <div class="button-container">
        <button class="login-btn">Login</button>
        <button class="register-btn">Register</button>
      </div>
    </div>
  </div>
</div>
            `;

      document.body.appendChild(overlay);

      const loginBtn = overlay.querySelector(".login-btn");
      const registerBtn = overlay.querySelector(".register-btn");
      const popup = overlay.querySelector(".login-popup");
      const overlayEl = overlay.querySelector(".login-overlay");

      const animateAndOpen = (url) => {
        popup.style.transform = "translate(-50%, -150%) scale(0.9)";
        popup.style.opacity = "0";
        overlayEl.style.opacity = "0";
        setTimeout(() => {
          window.open(
            chrome.runtime.getURL(url),
            "_blank",
            "width=600,height=400",
          );
          overlay.remove();
        }, 600);
      };

      loginBtn.onclick = () => animateAndOpen("login.html");
      registerBtn.onclick = () => animateAndOpen("register.html");

      setTimeout(() => (overlayEl.style.opacity = "1"), 100);
      return false;
    } else if (data.is_login === true) {
      const floatingUI = document.createElement("div");
      floatingUI.style.position = "fixed";
      floatingUI.style.right = "15px";
      floatingUI.style.bottom = "50px";
      floatingUI.style.width = "40vw";
      floatingUI.style.maxWidth = "160px";
      floatingUI.style.borderRadius = "15px";
      floatingUI.style.zIndex = "10000";
      floatingUI.style.padding = "16px";
      floatingUI.style.transform = "scale(0.95) translateY(-10px)";
      floatingUI.style.opacity = "0";
      floatingUI.style.fontSize = "14px";
      floatingUI.style.maxHeight = "60vh";
      floatingUI.style.backgroundColor = "rgba(23, 25, 35, 0.95)";
      floatingUI.style.boxShadow = "0 8px 18px rgba(0, 0, 0, 0.15)";
      floatingUI.style.border = "1px solid rgba(255, 255, 255, 0.2)";
      floatingUI.style.backdropFilter = "blur(10px)";
      floatingUI.style.transition = "transform 0.25s ease-in-out, opacity 0.25s ease-in-out";
      floatingUI.style.willChange = "transform, opacity";
      
      requestAnimationFrame(() => {
          floatingUI.style.transform = "scale(1) translateY(0)";
          floatingUI.style.opacity = "1";
      });
      
      floatingUI.onmouseenter = () => {
          floatingUI.style.transform = "scale(1.05)";
          floatingUI.style.border = "1px solid rgba(255,255,255,0.3)";
          floatingUI.style.boxShadow = "0 10px 25px rgba(0,0,0,0.25)";
      };
      
      floatingUI.onmouseleave = () => {
          floatingUI.style.transform = "scale(1)";
          floatingUI.style.border = "1px solid rgba(255,255,255,0.2)";
          floatingUI.style.boxShadow = "0 8px 18px rgba(0,0,0,0.15)";
      };
      
      floatingUI.dataset.expanded = "true";
      document.body.appendChild(floatingUI);
      
            
      const createButton = (text, activeColor = "#4CAF50") => {
        const button = document.createElement("button");
        button.innerText = text;
        button.style.width = "100%";
        button.style.height = "50px";
        button.style.margin = "10px 0";
        button.style.borderRadius = "8px";
        button.style.backgroundColor = "#555";
        button.style.color = "white";
        button.style.border = "none";
        button.style.cursor = "pointer";
        button.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
        button.style.fontSize = "16px";
        button.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
        button.style.fontFamily = "Arial, sans-serif";
        button.style.animation = "buttonPop 0.5s ease-out";
        button.style.transform = "scale(1)";
  
        button.onmouseenter = () => {
          button.style.transform = "scale(1.05)";
          button.style.backgroundColor = activeColor;
        };
  
        button.onmouseleave = () => {
          button.style.transform = "scale(1)";
          button.style.backgroundColor = "#555";
        };
  
        button.onmousedown = () => {
          button.style.transform = "scale(0.95)";
          button.style.backgroundColor = activeColor;
          button.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.7)";
          button.style.animation = "buttonPress 0.2s ease-out";
        };
  
        button.onmouseup = () => {
          button.style.transform = "scale(1.05)";
          button.style.backgroundColor = "#555";
          button.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
          button.style.animation = "buttonRelease 0.2s ease-out";
        };
  
        return button;
      };
  
      const toggleExpand = (expand) => {
        requestAnimationFrame(() => {
            Array.from(floatingUI.children).forEach((child) => {
                if (child !== minimizeButton) {
                    child.style.transition = "opacity 0.4s ease-in-out, transform 0.4s ease-in-out, visibility 0.4s ease-in-out";
                    child.style.visibility = expand ? "visible" : "hidden";
                    child.style.opacity = expand ? "1" : "0";
                    child.style.transform = expand ? "translateY(0)" : "translateY(8px)";
    
                    if (expand) {
                        child.style.display = "block";
                    } else {
                        setTimeout(() => {
                            child.style.display = "none";
                        }, 400);
                    }
                }
            });
    
            floatingUI.classList.remove("animate__slideOutLeft", "animate__slideInLeft");
    
            if (expand) {
                floatingUI.classList.add("animate__slideInLeft");
                floatingUI.style.transition = "width 0.4s ease-in-out, transform 0.4s ease-in-out, opacity 0.4s ease-in-out";
                floatingUI.style.width = "300px";
                floatingUI.style.opacity = "1";
                floatingUI.style.transform = "translateX(0)";
            } else {
                floatingUI.classList.add("animate__slideOutLeft");
                floatingUI.style.transition = "width 0.5s ease-in-out, transform 0.5s ease-in-out, opacity 0.5s ease-in-out";
                floatingUI.style.width = "50px";
                floatingUI.style.opacity = "0.85";
                floatingUI.style.transform = "scale(0.92) translateY(12px)";
            }
        });
    };
    
      const minimizeButton = createButton("−", "#F44336");
      
      if (window.innerWidth <= 768) {
        minimizeButton.style.width = "40px";
        minimizeButton.style.height = "40px";
        minimizeButton.style.fontSize = "20px";
        minimizeButton.style.padding = "4px";
        minimizeButton.style.background = `linear-gradient(to bottom, #F44336 0%, #F44336 ${minimizeButton.style.height})`;
        minimizeButton.style.backgroundSize = "40px 40px";
        minimizeButton.style.borderRadius = "50%";
        minimizeButton.style.transition = "transform 0.3s ease, background 0.3s ease";
      } else {
        minimizeButton.style.width = "50px";
        minimizeButton.style.height = "50px";
        minimizeButton.style.fontSize = "24px";
        minimizeButton.style.padding = "9px";
        minimizeButton.style.background = `linear-gradient(to bottom, #F44336 0%, #F44336 ${minimizeButton.style.height})`;
        minimizeButton.style.backgroundSize = "50px 50px";
        minimizeButton.style.borderRadius = "50%";
        minimizeButton.style.transition = "transform 0.3s ease, background 0.3s ease";
      }
      
      minimizeButton.addEventListener("mouseenter", () => {
        minimizeButton.style.transform = "scale(1.1)";
        minimizeButton.style.background = "linear-gradient(to bottom, #E53935 0%, #E53935 40px)";
      });
      
      minimizeButton.addEventListener("mouseleave", () => {
        minimizeButton.style.transform = "scale(1)";
        minimizeButton.style.background = `linear-gradient(to bottom, #F44336 0%, #F44336 ${minimizeButton.style.height})`;
      });
      
      minimizeButton.onclick = () => {
        const isExpanded = floatingUI.dataset.expanded === "true";
        toggleExpand(!isExpanded);
        floatingUI.dataset.expanded = !isExpanded;
        minimizeButton.style.animation = isExpanded ? "bounceOut 0.5s ease" : "bounceIn 0.5s ease";
        minimizeButton.textContent = isExpanded ? "−" : "+";
      
        if (window.innerWidth <= 768) {
          minimizeButton.style.backgroundSize = "40px 40px";
        } else {
          minimizeButton.style.backgroundSize = "50px 50px";
        }
      
        if (isExpanded) {
          floatingUI.style.backgroundColor = "transparent";
          floatingUI.style.borderRadius = "0px";
          floatingUI.style.transform = "scale(0.8) translateY(30px)";
          floatingUI.style.opacity = "0.7";
        } else {
          floatingUI.style.backgroundColor = "rgba(23, 25, 35, 0.95)";
          floatingUI.style.borderRadius = "12px";
          floatingUI.style.transform = "scale(1) translateY(0)";
          floatingUI.style.opacity = "10";
        }
      };
      
      floatingUI.appendChild(minimizeButton);
      
      

      function checkVipStatusAndShowPopup() {
        const jwtToken = sessionStorage.getItem('jwtToken');
        
        const url = new URL(`${BASEURL}/vip`);
        url.searchParams.append('jwtToken', jwtToken);
        
      
        fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer SSS155',
          }
        })
        .then(response => response.json())
        .then(data => {
          if (!data.is_user_vip) {
            const Popuptext = `
The extension has been up and running for over a year now, and as you can imagine, it's not always easy to continue developing and adding new features. That's why I'm reaching out for your support. If you'd like to contribute, you can donate $5 via GankNow or PayPal to help sustain both me and the ongoing development of this extension, as well as support my hobby of creating it. Donating will also earn you VIP status, which grants access to exclusive VIP content. For confirmation of your purchase, please DM WhitzScott with a screenshot of your payment, preferably via GankNow or PayPal. Thank you for your support!`;
            const KofiLogo = chrome.runtime.getURL('assets/Kofi.png');
            const GankLogo = chrome.runtime.getURL('assets/Ganknow.png');
            const supportPopup = document.createElement('div');
            supportPopup.innerHTML = `
<style>
  @import url('https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@400;700&display=swap');
  
  .support-popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 50;
    background-color: rgba(0, 0, 0, 0.85);
    animation: fadeIn 0.5s ease-in-out;
  }
  
  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  .popup-content {
    background-color: #ffffff;
    padding: 25px 35px;
    border-radius: 20px;
    text-align: center;
    width: 90%;
    max-width: 600px;
    position: relative;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.6s ease-out;
    font-family: 'Baloo Da 2', sans-serif;
  }

  @keyframes slideUp {
    0% { transform: translateY(30px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  .popup-title {
    font-size: 32px;
    color: #222;
    font-weight: bold;
    margin-bottom: 18px;
  }

  .popup-description {
    font-size: 20px;
    color: #333;
    margin-bottom: 25px;
    line-height: 1.7;
  }

  .popup-close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    background-color: transparent;
    border: none;
    font-size: 26px;
    color: #777;
    cursor: pointer;
    transition: transform 0.3s ease, color 0.3s ease;
  }

  .popup-close-btn:hover {
    color: #d9534f;
    transform: rotate(180deg);
  }

  .donation-buttons {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 15px;
    flex-wrap: wrap;
  }

  .donation-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    background-color: #ff5e00;
    color: white;
    border-radius: 30px;
    font-size: 18px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 6px 14px rgba(255, 94, 0, 0.4);
  }

  .donation-button:hover {
    background-color: #e04d00;
    transform: scale(1.08);
    box-shadow: 0 10px 24px rgba(255, 94, 0, 0.5);
  }

  .donation-button:active {
    background-color: #c03f00;
    transform: scale(0.96);
  }

  .donation-button img {
    width: 30px;
    margin-right: 8px;
    transition: transform 0.3s ease;
  }

  .donation-button img:hover {
    transform: rotate(360deg);
  }

  .donation-button span {
    font-weight: 700;
  }

  @media (max-width: 430px) {
    .popup-content {
      padding: 20px;
      width: 95%;
      max-width: 90%;
    }
    .popup-title {
      font-size: 24px;
    }
    .popup-description {
      font-size: 16px;
    }
    .donation-button {
      font-size: 16px;
      padding: 10px 18px;
    }
    .donation-buttons {
      flex-direction: column;
      gap: 10px;
    }
  }
</style>

<div class="support-popup">
  <div class="popup-content">
    <h1 class="popup-title">Support The Development!</h1>
    <p class="popup-description">${Popuptext}</p>
    <div class="donation-buttons">
      <a href="https://ko-fi.com/whitzscott" target="_blank">
        <button class="donation-button">
          <img src="${KofiLogo}" alt="Kofi Logo">
          <span>Donate via PayPal or Card</span>
        </button>
      </a>
      <a href="https://ganknow.com/bettersakura?tab=membership" target="_blank">
        <button class="donation-button">
          <img src="${GankLogo}" alt="GankNow Logo">
          <span>Donate via GankNow</span>
        </button>
      </a>
    </div>
    <button class="popup-close-btn">×</button>
  </div>
</div>



            `; 

            const closeButton = supportPopup.querySelector('.popup-close-btn');
            closeButton.onclick = () => supportPopup.remove();
            document.body.appendChild(supportPopup);
          } else {
            console.log("user is vip")
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
      }
      
      checkVipStatusAndShowPopup(loginResponse);
  
      const autoLoadButton = createButton("Auto Load");
      const promptButton = createButton("Prompt");
      const settingsButton = createButton("Settings");
      Donate = createButton("Support Us");
      floatingUI.appendChild(Donate);
  
      function createDonationMenu() {
        const menu = document.createElement("div");
        menu.style.position = "fixed";
        menu.style.top = "50%";
        menu.style.left = "50%";
        menu.style.transform = "translate(-50%, -50%)";
        menu.style.backgroundColor = "black";
        menu.style.color = "white";
        menu.style.padding = "20px";
        menu.style.borderRadius = "8px";
        menu.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
        menu.style.zIndex = "9999";
  
        const heading = document.createElement("h1");
        heading.textContent = "Choose donation method";
        menu.appendChild(heading);
  
        const kofiButton = createButton("Kofi");
        Object.assign(kofiButton, {
          marginTop: "10px",
          backgroundColor: "#28a745",
        });
        kofiButton.addEventListener("click", () => {
          window.open("https://ko-fi.com/whitzscott", "_blank");
        });
        menu.appendChild(kofiButton);
  
        const gankButton = createButton("Gank Now");
        Object.assign(gankButton, {
          marginTop: "10px",
          backgroundColor: "#dc3545",
        });
        gankButton.addEventListener("click", () => {
          window.open(
            "https://ganknow.com/bettersakura?tab=membership",
            "_blank",
          );
        });
        menu.appendChild(gankButton);
  
        const closeButton = createButton("Close Menu");
        Object.assign(closeButton, {
          marginTop: "10px",
          backgroundColor: "#6c757d",
        });
        closeButton.addEventListener("click", () => {
          menu.remove();
        });
        menu.appendChild(closeButton);
  
        document.body.appendChild(menu);
      }
  
      Donate.addEventListener("click", createDonationMenu);
  
      autoLoadButton.addEventListener("click", () => {
        autoLoadEnabled = !autoLoadEnabled;
        autoLoadButton.style.backgroundColor = autoLoadEnabled
          ? "#4CAF50"
          : "#555";
        if (autoLoadEnabled) {
          autoLoadInterval = setInterval(() => {
            const loadMoreButton = document.querySelector(
              "button.inline-flex.items-center.justify-center.rounded-full.text-sm.transition-colors.focus-visible\\:outline-none.disabled\\:pointer-events-none.disabled\\:opacity-50.select-none.bg-primary.text-primary-foreground.shadow.hover\\:bg-primary\\/90.active\\:bg-primary\\/90.h-9.px-4.py-2.mb-4.max-md\\:self-stretch",
            );
            if (loadMoreButton) {
              loadMoreButton.click();
            }
          }, 3000);
        } else {
          clearInterval(autoLoadInterval);
        }
      });
  
      const createOverlay = (title, contentElements) => {
        const overlay = document.createElement("div");
        Object.assign(overlay.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            zIndex: "10000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            opacity: "0",
            transition: "opacity 0.3s ease-in-out",
            backdropFilter: "blur(5px)",
            willChange: "opacity, transform",
        });
    
        const overlayUI = document.createElement("div");
        Object.assign(overlayUI.style, {
            backgroundColor: "#2c2c2c",
            width: "80%",
            maxWidth: "800px",
            height: "80%",
            display: "flex",
            flexDirection: "column",
            transform: "scale(0.95) translateY(10px)",
            transition: "transform 0.3s ease-in-out, opacity 0.3s ease-in-out",
            opacity: "0",
            overflowY: "auto",
            borderRadius: "20px",
            willChange: "transform, opacity",
        });
    
        const topBar = document.createElement("div");
        Object.assign(topBar.style, {
            width: "100%",
            height: "60px",
            backgroundColor: "#4A90E2",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 20px",
            fontSize: "22px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
            borderBottom: "2px solid #2E7DB2",
            position: "sticky",
            top: "0",
            zIndex: "10001",
        });
    
        const titleElement = document.createElement("h2");
        titleElement.innerText = title;
        titleElement.style.fontWeight = "bold";
    
        const closeButton = document.createElement("button");
        closeButton.textContent = "✕";
        Object.assign(closeButton.style, {
            background: "none",
            border: "none",
            color: "white",
            fontSize: "25px",
            cursor: "pointer",
            transition: "transform 0.2s ease-in-out, color 0.2s ease-in-out",
            padding: "5px",
        });
    
        closeButton.addEventListener("mouseover", () => {
            closeButton.style.transform = "rotate(180deg)";
            closeButton.style.color = "#FF3B30";
        });
    
        closeButton.addEventListener("mouseleave", () => {
            closeButton.style.transform = "rotate(0deg)";
            closeButton.style.color = "white";
        });
    
        closeButton.addEventListener("click", () => {
            overlayUI.style.transform = "scale(0.95) translateY(10px)";
            overlayUI.style.opacity = "0";
            overlay.style.opacity = "0";
            setTimeout(() => {
                overlay.remove();
            }, 300);
        });
    
        topBar.appendChild(titleElement);
        topBar.appendChild(closeButton);
        overlayUI.appendChild(topBar);
    
        contentElements.forEach((el, index) => {
            el.style.opacity = "0";
            el.style.transform = "translateY(10px)";
            el.style.transition = "opacity 0.3s ease-in-out, transform 0.3s ease-in-out";
            setTimeout(() => {
                el.style.opacity = "1";
                el.style.transform = "translateY(0)";
            }, 100 + index * 50);
            overlayUI.appendChild(el);
        });
    
        overlay.appendChild(overlayUI);
        document.body.appendChild(overlay);
    
        requestAnimationFrame(() => {
            overlay.style.opacity = "1";
            overlayUI.style.transform = "scale(1) translateY(0)";
            overlayUI.style.opacity = "1";
        });
    };
    
      
  
      const showPromptOverlay = () => {
        const overlayContent = document.createElement("div");
        Object.assign(overlayContent.style, {
          backgroundColor: "#2c2c2c",
          borderRadius: "10px",
          padding: "20px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
          maxWidth: "500px",
          margin: "auto",
          animation: "fadeIn 0.5s ease-out",
          scrollbarWidth: "thin",
          scrollbarColor: "#666 #2c2c2c",
        });
  
        const title = document.createElement("h2");
        title.textContent = "Manage Your Prompts";
        Object.assign(title.style, {
          color: "#ffffff",
          textAlign: "center",
          marginBottom: "15px",
          animation: "slideDown 0.5s ease-out",
          fontSize: "24px",
          fontWeight: "500",
        });
  
        const promptList = document.createElement("ul");
        Object.assign(promptList.style, {
          maxHeight: "400px",
          overflowY: "auto",
          margin: "0",
          padding: "0 4px 0 0",
          listStyle: "none",
          color: "#ffffff",
          animation: "fadeIn 0.8s ease-out",
          scrollbarWidth: "thin",
          scrollbarColor: "#666 #2c2c2c",
        });
  
        promptList.addEventListener("mouseover", () => {
          promptList.style.scrollbarColor = "#888 #2c2c2c";
        });
  
        promptList.addEventListener("mouseout", () => {
          promptList.style.scrollbarColor = "#666 #2c2c2c";
        });
  
        const newPromptInput = document.createElement("input");
        Object.assign(newPromptInput.style, {
          width: "100%",
          padding: "12px",
          borderRadius: "5px",
          border: "1px solid #888",
          marginBottom: "10px",
          fontSize: "16px",
          color: "#ffffff",
          backgroundColor: "#444",
          transition: "all 0.3s ease",
          animation: "slideIn 0.5s ease-out",
          outline: "none",
        });
        newPromptInput.placeholder = "Enter new prompt...";
        newPromptInput.addEventListener("focus", () => {
          newPromptInput.style.border = "1px solid #4CAF50";
          newPromptInput.style.transform = "scale(1.02)";
          newPromptInput.style.boxShadow = "0 0 8px rgba(76, 175, 80, 0.3)";
        });
        newPromptInput.addEventListener("blur", () => {
          newPromptInput.style.border = "1px solid #888";
          newPromptInput.style.transform = "scale(1)";
          newPromptInput.style.boxShadow = "none";
        });
  
        const addPromptButton = createButton("Add Prompt");
        Object.assign(addPromptButton.style, {
          backgroundColor: "#4CAF50",
          color: "white",
          padding: "12px",
          borderRadius: "5px",
          cursor: "pointer",
          transition: "all 0.3s ease",
          animation: "slideIn 0.6s ease-out",
          fontWeight: "500",
        });
        addPromptButton.onmouseover = () => {
          addPromptButton.style.backgroundColor = "#45a049";
          addPromptButton.style.transform = "translateY(-2px)";
          addPromptButton.style.boxShadow = "0 4px 12px rgba(69, 160, 73, 0.3)";
        };
        addPromptButton.onmouseout = () => {
          addPromptButton.style.backgroundColor = "#4CAF50";
          addPromptButton.style.transform = "translateY(0)";
          addPromptButton.style.boxShadow = "none";
        };
  
        const loadMoreButton = createButton("Load More");
        Object.assign(loadMoreButton.style, {
          width: "100%",
          marginTop: "10px",
          backgroundColor: "#007BFF",
          color: "white",
          display: "none",
          padding: "12px",
          borderRadius: "5px",
          cursor: "pointer",
          transition: "all 0.3s ease",
          animation: "slideUp 0.5s ease-out",
          fontWeight: "500",
        });
        loadMoreButton.onmouseover = () => {
          loadMoreButton.style.backgroundColor = "#0056b3";
          loadMoreButton.style.transform = "translateY(-2px)";
          loadMoreButton.style.boxShadow = "0 4px 12px rgba(0, 86, 179, 0.3)";
        };
        loadMoreButton.onmouseout = () => {
          loadMoreButton.style.backgroundColor = "#007BFF";
          loadMoreButton.style.transform = "translateY(0)";
          loadMoreButton.style.boxShadow = "none";
        };
  
        let currentPromptCount = 10;
        const PROMPTS_PER_PAGE = 10;
  
        const loadPrompts = () => {
          const storedPrompts = JSON.parse(localStorage.getItem("prompts")) || [];
          promptList.innerHTML = "";
  
          const promptsToShow = storedPrompts.slice(0, currentPromptCount);
  
          promptsToShow.forEach((prompt, index) => {
            const promptItem = document.createElement("li");
            Object.assign(promptItem.style, {
              cursor: "pointer",
              marginBottom: "10px",
              color: "white",
              padding: "12px",
              borderRadius: "5px",
              backgroundColor: "#555",
              wordBreak: "break-word",
              transition: "all 0.3s ease",
              animation: `slideIn 0.5s ease-out ${index * 0.1}s`,
              opacity: "0",
              transform: "translateX(-20px)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            });
            promptItem.textContent = prompt.text;
  
            setTimeout(
              () => {
                promptItem.style.opacity = "1";
                promptItem.style.transform = "translateX(0)";
              },
              50 + index * 100,
            );
  
            promptItem.onmouseover = () => {
              promptItem.style.backgroundColor = "#666";
              promptItem.style.transform = "scale(1.02)";
              promptItem.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
            };
            promptItem.onmouseout = () => {
              promptItem.style.backgroundColor = "#555";
              promptItem.style.transform = "scale(1)";
              promptItem.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
            };
  
            const buttonContainer = document.createElement("div");
            Object.assign(buttonContainer.style, {
              display: "flex",
              gap: "8px",
              justifyContent: "space-between",
              marginTop: "8px",
              animation: "fadeIn 0.5s ease-out",
            });
  
            const downloadButton = createButton("Download");
            downloadButton.onclick = (e) => {
              e.stopPropagation();
              const blob = new Blob([prompt.text], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "prompt.txt";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            };
  
            const copyButton = createButton("Copy");
            copyButton.onclick = (e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(prompt.text).then(() => {
                copyButton.style.transform = "scale(1.1)";
                const originalText = copyButton.textContent;
                copyButton.textContent = "Copied!";
                setTimeout(() => {
                  copyButton.textContent = originalText;
                  copyButton.style.transform = "scale(1)";
                }, 1000);
              });
            };
  
            const removeButton = createButton("Remove");
            Object.assign(removeButton.style, {
              backgroundColor: "#f44336",
              color: "white",
              padding: "8px",
              borderRadius: "5px",
              cursor: "pointer",
              transition: "all 0.3s ease",
            });
            removeButton.onclick = (e) => {
              e.stopPropagation();
              promptItem.style.transform = "translateX(100%)";
              promptItem.style.opacity = "0";
              setTimeout(() => {
                const updatedPrompts = storedPrompts.filter(
                  (p) => p.text !== prompt.text,
                );
                localStorage.setItem("prompts", JSON.stringify(updatedPrompts));
                loadPrompts();
                updateLoadMoreButton(updatedPrompts.length);
              }, 300);
            };
  
            [downloadButton, copyButton, removeButton].forEach((button) => {
              button.style.flex = "1";
              button.style.transition = "all 0.3s ease";
              buttonContainer.appendChild(button);
            });
  
            promptItem.appendChild(buttonContainer);
            promptList.appendChild(promptItem);
          });
  
          updateLoadMoreButton(storedPrompts.length);
        };
  
        const updateLoadMoreButton = (totalPrompts) => {
          loadMoreButton.style.display =
            totalPrompts > currentPromptCount ? "block" : "none";
        };
  
        loadMoreButton.onclick = () => {
          currentPromptCount += PROMPTS_PER_PAGE;
          loadPrompts();
        };
  
        addPromptButton.onclick = () => {
          const newPrompt = newPromptInput.value.trim();
          if (newPrompt) {
            const storedPrompts =
              JSON.parse(localStorage.getItem("prompts")) || [];
            storedPrompts.unshift({ text: newPrompt });
            localStorage.setItem("prompts", JSON.stringify(storedPrompts));
            newPromptInput.value = "";
            loadPrompts();
          }
        };
  
        newPromptInput.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            addPromptButton.click();
          }
        });
  
        loadPrompts();
  
        overlayContent.appendChild(title);
        overlayContent.appendChild(newPromptInput);
        overlayContent.appendChild(addPromptButton);
        overlayContent.appendChild(promptList);
        overlayContent.appendChild(loadMoreButton);
        createOverlay("Prompts", [overlayContent]);
      };
  
      const showSettingsOverlay = () => {
        const overlayContent = document.createElement("div");
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        const changeBgButton = createButton("Change Background");
  
        changeBgButton.onclick = () => {
          const file = fileInput.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              floatingUI.style.backgroundImage = `url(${event.target.result})`;
              floatingUI.style.backgroundSize = "cover";
              floatingUI.style.backgroundPosition = "center";
            };
            reader.readAsDataURL(file);
          }
        };
  
        overlayContent.appendChild(fileInput);
        overlayContent.appendChild(changeBgButton);
        createOverlay("Settings", [overlayContent]);
  
        const hideButton = createButton("Hide UI");
  
        hideButton.onclick = () => {
          floatingUI.style.display = "none";
        };
  
        overlayContent.appendChild(hideButton);
  
        const makeTransparentButton = createButton("Make UI Transparent");
  
        makeTransparentButton.onclick = () => {
          floatingUI.style.backgroundColor = "transparent";
          floatingUI.style.boxShadow = "none";
          floatingUI.style.width = "200px";
        };
  
        overlayContent.appendChild(makeTransparentButton);
  
        const resetBgButton = createButton("Reset Background");
  
        resetBgButton.onclick = () => {
          floatingUI.style.backgroundImage = "";
          floatingUI.style.backgroundColor = "#333";
        };
  
        overlayContent.appendChild(resetBgButton);
  
        const increaseFontSizeButton = createButton("Increase Font Size");
  
        increaseFontSizeButton.onclick = () => {
          const currentFontSize = window.getComputedStyle(document.body).fontSize;
          const newFontSize = parseFloat(currentFontSize) + 2 + "px";
          document.body.style.fontSize = newFontSize;
          floatingUI.style.fontSize = newFontSize;
        };
  
        overlayContent.appendChild(increaseFontSizeButton);
  
        const decreaseFontSizeButton = createButton("Decrease Font Size");
  
        decreaseFontSizeButton.onclick = () => {
          const currentFontSize = window.getComputedStyle(document.body).fontSize;
          const newFontSize = parseFloat(currentFontSize) - 2 + "px";
          document.body.style.fontSize = newFontSize;
          floatingUI.style.fontSize = newFontSize;
        };
  
        overlayContent.appendChild(decreaseFontSizeButton);
  
        const resetFontSizeButton = createButton("Reset Font Size");
  
        resetFontSizeButton.onclick = () => {
          document.body.style.fontSize = "";
          floatingUI.style.fontSize = "";
        };
  
        overlayContent.appendChild(resetFontSizeButton);
  
        const resetFontStyleButton = createButton("Reset Font Style");
  
        resetFontStyleButton.onclick = () => {
          document.body.style.fontFamily = "";
          floatingUI.style.fontFamily = "";
        };
  
        const fontStyleDropdown = document.createElement("select");
        fontStyleDropdown.style.padding = "8px";
        fontStyleDropdown.style.borderRadius = "4px";
        fontStyleDropdown.style.border = "1px solid #555";
        fontStyleDropdown.style.backgroundColor = "#444";
        fontStyleDropdown.style.color = "#fff";
        fontStyleDropdown.style.cursor = "pointer";
        fontStyleDropdown.style.transition = "all 0.3s ease";
  
        const fontStyles = [
          "Arial",
          "Franklin Gothic",
          "Gill Sans",
          "Perpetua",
          "Baskerville Old Face",
          "Candara",
          "Corbel",
          "Calibri",
          "Cambria",
          "Segoe UI",
          "Avenir",
          "Lato",
          "Open Sans",
          "Roboto",
          "Merriweather",
          "Playfair Display",
          "Raleway",
          "Ubuntu",
          "PT Serif",
          "PT Sans",
          "Oswald",
          "Montserrat",
          "Nunito",
          "Quicksand",
          "Source Sans Pro",
          "Varela Round",
          "Zilla Slab",
          "Crimson Text",
          "Droid Serif",
          "Josefin Sans",
          "Karla",
          "Libre Baskerville",
          "Rubik",
          "Titillium Web",
          "Work Sans",
          "Abril Fatface",
          "Arvo",
          "Exo",
          "Fira Sans",
          "Inconsolata",
          "Lora",
          "Overpass",
          "Pacifico",
          "Poppins",
          "Proxima Nova",
          "Satisfy",
          "Slabo",
          "Spectral",
          "Yellowtail",
          "Amatic SC",
          "Anton",
          "Archivo",
          "Barlow",
          "Catamaran",
          "Cinzel",
          "Cormorant",
          "Fredoka One",
          "Gloria Hallelujah",
          "Great Vibes",
          "Kaushan Script",
          "Lexend",
          "Lobster",
          "Merriweather Sans",
          "Monda",
          "Nanum Gothic",
          "Orbitron",
          "Permanent Marker",
          "Righteous",
          "Sarina",
          "Scheherazade",
          "Shadows Into Light",
          "Syncopate",
          "Ubuntu Mono",
          "Yatra One",
          "ZCOOL XiaoWei",
          "Zeyada",
          "Alfa Slab One",
          "Archivo Narrow",
          "Bangers",
          "Cabin",
          "Chewy",
          "Chivo",
          "Comfortaa",
          "Concert One",
          "Covered By Your Grace",
          "Crete Round",
          "Didact Gothic",
          "Domine",
          "Fjalla One",
          "Goudy Bookletter 1911",
          "Indie Flower",
          "Josefin Slab",
          "Kalam",
          "Kanit",
          "Martel",
          "Neuton",
          "Old Standard TT",
          "Patua One",
          "Questrial",
          "Rambla",
          "Special Elite",
          "Spinnaker",
          "Syncopate",
          "Tillana",
          "Vidaloka",
          "Yanone Kaffeesatz",
        ];
  
        const placeholderOption = document.createElement("option");
        placeholderOption.value = "";
        placeholderOption.textContent = "Select a font...";
        fontStyleDropdown.appendChild(placeholderOption);
  
        fontStyles.forEach((style) => {
          const option = document.createElement("option");
          option.value = style;
          option.textContent = style;
          option.style.fontFamily = style;
          fontStyleDropdown.appendChild(option);
        });
  
        const savedFont = localStorage.getItem("selectedFont");
        if (savedFont) {
          document.body.style.fontFamily = savedFont;
          floatingUI.style.fontFamily = savedFont;
          fontStyleDropdown.value = savedFont;
        }
  
        fontStyleDropdown.onchange = () => {
          if (fontStyleDropdown.value) {
            const selectedFont = fontStyleDropdown.value;
            document.body.style.fontFamily = selectedFont;
            floatingUI.style.fontFamily = selectedFont;
            localStorage.setItem("selectedFont", selectedFont);
  
            const allElements = document.querySelectorAll("*");
            allElements.forEach((element) => {
              element.style.fontFamily = selectedFont;
            });
          }
        };
  
        fontStyleDropdown.onmouseover = () => {
          fontStyleDropdown.style.backgroundColor = "#555";
          fontStyleDropdown.style.transform = "scale(1.02)";
        };
  
        fontStyleDropdown.onmouseout = () => {
          fontStyleDropdown.style.backgroundColor = "#444";
          fontStyleDropdown.style.transform = "scale(1)";
        };
  
        const customFontUpload = document.createElement("input");
        customFontUpload.type = "file";
        customFontUpload.accept = ".ttf,.otf,.woff,.woff2";
        customFontUpload.style.display = "none";
  
        const customFontButton = document.createElement("button");
        customFontButton.textContent = "Upload Custom Font";
        customFontButton.style.padding = "8px 12px";
        customFontButton.style.margin = "0 10px";
        customFontButton.style.backgroundColor = "#444";
        customFontButton.style.border = "1px solid #555";
        customFontButton.style.borderRadius = "4px";
        customFontButton.style.color = "#fff";
        customFontButton.style.cursor = "pointer";
        customFontButton.style.transition = "all 0.3s ease";
  
        customFontButton.onmouseover = () => {
          customFontButton.style.backgroundColor = "#555";
          customFontButton.style.transform = "scale(1.02)";
        };
  
        customFontButton.onmouseout = () => {
          customFontButton.style.backgroundColor = "#444";
          customFontButton.style.transform = "scale(1)";
        };
  
        customFontButton.onclick = () => customFontUpload.click();
  
        customFontUpload.onchange = (event) => {
          const file = event.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const fontName = file.name.split(".")[0];
              const fontFace = new FontFace(fontName, e.target.result);
              fontFace.load().then((loadedFace) => {
                document.fonts.add(loadedFace);
                const option = document.createElement("option");
                option.value = fontName;
                option.textContent = `${fontName} (Custom)`;
                option.style.fontFamily = fontName;
                fontStyleDropdown.appendChild(option);
                fontStyleDropdown.value = fontName;
                document.body.style.fontFamily = fontName;
              });
            };
            reader.readAsArrayBuffer(file);
          }
        };
  
        overlayContent.appendChild(fontStyleDropdown);
        overlayContent.appendChild(customFontButton);
        overlayContent.appendChild(customFontUpload);
        overlayContent.appendChild(resetFontStyleButton);
  
        const tokenizeButton = createButton("Manual Trigger Token Counter");
  
        tokenizeButton.onclick = async () => {
          try {
            const loginCheckResponse = await fetch(
              `${BASEURL}/check-login-status`,
              {
                method: "POST",
                headers: {
                  Authorization: "Bearer SSS155",
                },
                body: JSON.stringify({ loginResponse })
              },
            );
  
            const loginStatus = await loginCheckResponse.json();
  
            if (!loginStatus.is_login) {
              const errorOverlay = document.createElement("div");
              errorOverlay.style.position = "fixed";
              errorOverlay.style.top = "50%";
              errorOverlay.style.left = "50%";
              errorOverlay.style.transform = "translate(-50%, -50%)";
              errorOverlay.style.backgroundColor = "#222";
              errorOverlay.style.color = "#fff";
              errorOverlay.style.padding = "20px";
              errorOverlay.style.borderRadius = "8px";
              errorOverlay.style.boxShadow = "0 4px 15px rgba(0,0,0,0.5)";
              errorOverlay.style.zIndex = "10000";
              errorOverlay.innerHTML = `
                          <h3>Error</h3>
                          <p>Please log in to use this feature</p>
                          <button id="goToRegister" style="padding: 8px 15px; border-radius: 4px; background: #4CAF50; color: white; border: none; cursor: pointer; margin-top: 10px;">Go to Register</button>
                      `;
              document.body.appendChild(errorOverlay);
  
              document.getElementById("goToRegister").onclick = () => {
                const registerUrl = chrome.runtime.getURL("register.html");
                window.open(registerUrl, "_blank", "width=600,height=400");
                errorOverlay.remove();
              };
              return;
            } else {
              alert(
                "Token Counter is now active! Please add text to the input field to see the token count.",
              );
            }
  
            const textareas = document.querySelectorAll(
              'input[name^="exampleConversation"], textarea[name="description"], textarea[name="persona"], textarea[name="scenario"], textarea[name="instructions"], textarea[name="firstMessage"], input[class="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-full border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"], textarea[class="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-full border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex-1 rounded-l-none"][id=":R5dicvf6lefja:-form-item"][aria-describedby=":R5dicvf6lefja:-form-item-description"]',
            );
  
            textareas.forEach((textarea) => {
              let lastPTag = null;
              let overlayTags = [];
  
              const processText = async () => {
                const text = textarea.value;
  
                overlayTags.forEach((tag) => tag.remove());
                overlayTags = [];
  
                const typingIndicator = document.createElement("p");
                typingIndicator.textContent = "Processing...";
                Object.assign(typingIndicator.style, {
                  position: "absolute",
                  marginTop: "8px",
                  color: "#FFFFFF",
                  zIndex: "1000",
                  fontSize: "14px",
                  fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
                  fontWeight: "500",
                  letterSpacing: "0.3px",
                  transition: "opacity 0.3s ease, transform 0.3s ease",
                  opacity: "0",
                  transform: "translateY(-5px)",
                  userSelect: "none",
                });
                textarea.parentNode.insertBefore(
                  typingIndicator,
                  textarea.nextSibling,
                );
                overlayTags.push(typingIndicator);
  
                requestAnimationFrame(() => {
                  typingIndicator.style.opacity = "1";
                  typingIndicator.style.transform = "translateY(0)";
                });
  
                try {
                  const tokenizedData = await tokenizeText(text || " ");
                  const parsedData = JSON.parse(tokenizedData);
                  const tokenCount = parsedData["🧮 Total Token Count 🧮"] || 0;
                  const wordCount = parsedData["💬 Word Count 💬"] || 0;
  
                  overlayTags.forEach((tag) => tag.remove());
                  overlayTags = [];
  
                  const pTag = document.createElement("p");
                  pTag.textContent = `Tokens: ${tokenCount} | Words: ${wordCount}`;
                  Object.assign(pTag.style, {
                    position: "absolute",
                    marginTop: textarea.matches('input[class*="rounded-l-none"]')
                      ? "-20px"
                      : "8px",
                    color: "#FFFFFF",
                    zIndex: "1000",
                    fontSize: textarea.matches('input[class*="rounded-l-none"]')
                      ? "10px"
                      : window.innerWidth <= 768
                        ? "12px"
                        : "14px",
                    fontFamily:
                      "'Segoe UI', system-ui, -apple-system, sans-serif",
                    fontWeight: "500",
                    letterSpacing: "0.3px",
                    transition: "opacity 0.3s ease, transform 0.3s ease",
                    opacity: "0",
                    transform: "translateY(-5px)",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                  });
                  textarea.parentNode.insertBefore(pTag, textarea.nextSibling);
                  overlayTags.push(pTag);
  
                  requestAnimationFrame(() => {
                    pTag.style.opacity = "1";
                    pTag.style.transform = "translateY(0)";
                  });
  
                  lastPTag = pTag;
                } catch (error) {
                  overlayTags.forEach((tag) => tag.remove());
                  overlayTags = [];
                  console.error("Error processing text:", error);
                }
              };
  
              textarea.addEventListener("input", processText);
              if (!window.tokenCounterActive) {
                alert(
                  "Token Counter is now active! Please add text to the input field to see the token count.",
                );
                window.tokenCounterActive = true;
              }
            });
          } catch (error) {
            console.error("Error checking login status:", error);
          }
        };
  
        overlayContent.appendChild(tokenizeButton);
  
        const updateButton = createButton("Check for Updates");
        updateButton.onclick = async () => {
          try {
            if (!chrome.runtime?.id) {
              alert(
                "Extension context invalidated. Please refresh the page and try again.",
              );
              return;
            }
  
            const response = await fetch(`${BASEURL}/download`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer SSS155",
              },
            });
  
            if (response.ok) {
              const blob = await response.blob();
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = "Extension-main-Stable.zip";
              link.click();
            } else {
              alert("Failed to download the update. Please try again later.");
            }
  
            chrome.runtime.sendMessage({ action: "open-extensions" });
          } catch (error) {
            console.error("Error checking for updates:", error);
            alert("An error occurred while checking for updates.");
          }
        };
  
        overlayContent.appendChild(updateButton);
  
        const bouncingButton = createButton("Toggle Bouncing");
        bouncingButton.onclick = () => {
          const currentBouncing =
            localStorage.getItem("bouncingEnabled") !== "false";
          localStorage.setItem("bouncingEnabled", !currentBouncing);
          bouncingButton.textContent = currentBouncing
            ? "Enable Bouncing"
            : "Disable Bouncing";
          bouncingEnabled = !currentBouncing;
        };
  
        overlayContent.appendChild(bouncingButton);
        const createAnimationCustomizer = () => {
          const customizeButton = createButton("Custom CSS Editor");
          customizeButton.onclick = () => {
            const customizeOverlay = document.createElement("div");
            customizeOverlay.style.padding = "25px";
            customizeOverlay.style.width = "800px";
            customizeOverlay.style.height = "90vh";
            customizeOverlay.style.display = "flex";
            customizeOverlay.style.flexDirection = "column";
            customizeOverlay.style.gap = "20px";
  
            const predefinedSection = document.createElement("div");
            predefinedSection.style.flex = "0 0 auto";
  
            const predefinedTitle = document.createElement("h3");
            predefinedTitle.textContent = "Preset Styles";
            predefinedTitle.style.color = "#fff";
            predefinedTitle.style.marginBottom = "15px";
            predefinedTitle.style.fontSize = "18px";
            predefinedSection.appendChild(predefinedTitle);
  
            const presets = [
              {
                name: "Modern Dark",
                code: ".button { background: #2d2d2d; color: #fff; border-radius: 8px; transition: all 0.3s; } .button:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.3); }",
              },
              {
                name: "Glassmorphism",
                code: ".element { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; }",
              },
              {
                name: "Neon Glow",
                code: ".element { color: #fff; text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00; box-shadow: 0 0 10px #00ff00; transition: all 0.3s; }",
              },
              {
                name: "Smooth Animations",
                code: ".element { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); } .element:hover { transform: scale(1.05); }",
              },
              {
                name: "Neumorphic",
                code: ".element { background: #e0e0e0; box-shadow: 8px 8px 16px #bebebe, -8px -8px 16px #ffffff; border-radius: 10px; }",
              },
              {
                name: "Gradient Border",
                code: ".element { border: 2px solid transparent; background: linear-gradient(#000, #000) padding-box, linear-gradient(45deg, #ff0099, #00ff99) border-box; border-radius: 15px; }",
              },
            ];
  
            const presetSelect = document.createElement("select");
            presetSelect.style.width = "100%";
            presetSelect.style.padding = "10px";
            presetSelect.style.backgroundColor = "#2d2d2d";
            presetSelect.style.color = "#fff";
            presetSelect.style.border = "1px solid #555";
            presetSelect.style.borderRadius = "6px";
            presetSelect.style.cursor = "pointer";
  
            presets.forEach((preset) => {
              const option = document.createElement("option");
              option.value = preset.code;
              option.textContent = preset.name;
              presetSelect.appendChild(option);
            });
  
            predefinedSection.appendChild(presetSelect);
  
            const editorSection = document.createElement("div");
            editorSection.style.flex = "1";
            editorSection.style.display = "flex";
            editorSection.style.flexDirection = "column";
            editorSection.style.gap = "15px";
            editorSection.style.minHeight = "0";
  
            const editorTitle = document.createElement("h3");
            editorTitle.textContent = "CSS Editor";
            editorTitle.style.color = "#fff";
            editorTitle.style.fontSize = "18px";
            editorSection.appendChild(editorTitle);
  
            const codeEditor = document.createElement("textarea");
            codeEditor.style.flex = "1";
            codeEditor.style.padding = "15px";
            codeEditor.style.backgroundColor = "#1a1a1a";
            codeEditor.style.color = "#fff";
            codeEditor.style.border = "1px solid #444";
            codeEditor.style.borderRadius = "8px";
            codeEditor.style.fontFamily = "Monaco, Consolas, monospace";
            codeEditor.style.fontSize = "14px";
            codeEditor.style.lineHeight = "1.5";
            codeEditor.style.resize = "none";
            codeEditor.spellcheck = false;
            codeEditor.value =
              localStorage.getItem("customCSS") || presets[0].code;
  
            const syntaxGuide = document.createElement("div");
            syntaxGuide.style.backgroundColor = "#1d1d1d";
            syntaxGuide.style.padding = "15px";
            syntaxGuide.style.borderRadius = "8px";
            syntaxGuide.innerHTML = `
                      <p style="color: #aaa; margin: 0 0 10px 0; font-size: 14px;">CSS Guide:</p>
                      <pre style="color: #888; margin: 0; font-size: 13px;">
          /* Basic Selector Examples */
          .class-name { property: value; }
          #id-name { property: value; }
          element { property: value; }
          
          /* Common Properties */
          - background, color, border
          - margin, padding, width, height
          - transform, transition, animation
          - display, position, flex, grid
          - box-shadow, text-shadow
          - font-size, font-family, font-weight</pre>
                  `;
  
            const highlightSyntax = (css) => {
              const highlighted = css
                .replace(
                  /(\/\*[\s\S]*?\*\/|\/\/.*)/g,
                  '<span style="color: #6a9955;">$1</span>',
                )
                .replace(
                  /(\b(?:color|background|border|margin|padding|width|height|transform|transition|animation|display|position|flex|grid|box-shadow|text-shadow|font-size|font-family|font-weight)\b)/g,
                  '<span style="color: #569cd6;">$1</span>',
                ) // Properties
                .replace(
                  /([a-zA-Z-]+)(\s*:\s*[^;]*;)/g,
                  '<span style="color: #d69d85;">$1</span>$2',
                );
              return highlighted;
            };
  
            const errorHighlight = (css) => {
              const lines = css.split("\n");
              const errorLines = lines.map((line, index) => {
                return line.includes(";")
                  ? line
                  : `<span style="color: #ff0000;">${line} // Error: Missing semicolon</span>`;
              });
              return errorLines.join("\n");
            };
  
            const displayErrors = () => {
              const errorOutput = document.createElement("pre");
              errorOutput.style.color = "#ff0000";
              errorOutput.style.backgroundColor = "#1d1d1d";
              errorOutput.style.padding = "10px";
              errorOutput.style.borderRadius = "8px";
              errorOutput.textContent = errorHighlight(codeEditor.value);
              editorSection.appendChild(errorOutput);
            };
  
            presetSelect.onchange = () => {
              codeEditor.value = presetSelect.value;
              localStorage.setItem("customCSS", presetSelect.value);
              applyCSS(presetSelect.value);
            };
  
            const buttonContainer = document.createElement("div");
            buttonContainer.style.display = "flex";
            buttonContainer.style.gap = "10px";
  
            const applyButton = document.createElement("button");
            applyButton.textContent = "Apply CSS";
            applyButton.style.padding = "12px 20px";
            applyButton.style.backgroundColor = "#4CAF50";
            applyButton.style.color = "#fff";
            applyButton.style.border = "none";
            applyButton.style.borderRadius = "6px";
            applyButton.style.cursor = "pointer";
            applyButton.style.fontWeight = "bold";
            applyButton.style.transition = "all 0.2s";
  
            const resetButton = document.createElement("button");
            resetButton.textContent = "Reset";
            resetButton.style.padding = "12px 20px";
            resetButton.style.backgroundColor = "#ff4444";
            resetButton.style.color = "#fff";
            resetButton.style.border = "none";
            resetButton.style.borderRadius = "6px";
            resetButton.style.cursor = "pointer";
            resetButton.style.fontWeight = "bold";
            resetButton.style.transition = "all 0.2s";
  
            const applyCSS = (css) => {
              const existingStyle = document.getElementById("custom-css");
              if (existingStyle) {
                existingStyle.remove();
              }
              const styleSheet = document.createElement("style");
              styleSheet.id = "custom-css";
              styleSheet.textContent = css;
              document.head.appendChild(styleSheet);
            };
  
            applyButton.onclick = () => {
              const css = codeEditor.value;
              localStorage.setItem("customCSS", css);
              applyCSS(css);
              displayErrors();
            };
  
            resetButton.onclick = () => {
              codeEditor.value = presets[0].code;
              localStorage.removeItem("customCSS");
              applyCSS(presets[0].code);
            };
  
            buttonContainer.appendChild(applyButton);
            buttonContainer.appendChild(resetButton);
  
            editorSection.appendChild(syntaxGuide);
            editorSection.appendChild(codeEditor);
            editorSection.appendChild(buttonContainer);
  
            customizeOverlay.appendChild(predefinedSection);
            customizeOverlay.appendChild(editorSection);
  
            createOverlay("Custom CSS Editor", [customizeOverlay]);
  
            const storedCSS = localStorage.getItem("customCSS");
            if (storedCSS) {
              applyCSS(storedCSS);
            }
          };
  
          return customizeButton;
        };
  
        const customCSSButton = createAnimationCustomizer();
        overlayContent.appendChild(customCSSButton);
  
        const disablePopupsButton = document.createElement("button");
        disablePopupsButton.textContent = "⏹️ Disable Popups";
        disablePopupsButton.style.width = "100%";
        disablePopupsButton.style.height = "50px";
        disablePopupsButton.style.margin = "10px 0";
        disablePopupsButton.style.borderRadius = "8px";
        disablePopupsButton.style.backgroundColor = "#555";
        disablePopupsButton.style.color = "white";
        disablePopupsButton.style.border = "none";
        disablePopupsButton.style.cursor = "pointer";
        disablePopupsButton.style.transition =
          "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
        disablePopupsButton.style.fontSize = "16px";
        disablePopupsButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
        disablePopupsButton.style.fontFamily = "Arial, sans-serif";
        disablePopupsButton.style.transform = "scale(1)";
        disablePopupsButton.onclick = () => {
          popup.style.display = "none";
          alert("Popups have been disabled.");
        };
        overlayContent.appendChild(disablePopupsButton);
  
        const disableUnnecessaryStuffButton = document.createElement("button");
        disableUnnecessaryStuffButton.textContent = "Disable Unnecessary Stuff";
        disableUnnecessaryStuffButton.style.width = "100%";
        disableUnnecessaryStuffButton.style.height = "50px";
        disableUnnecessaryStuffButton.style.margin = "10px 0";
        disableUnnecessaryStuffButton.style.borderRadius = "8px";
        disableUnnecessaryStuffButton.style.backgroundColor = "#555";
        disableUnnecessaryStuffButton.style.color = "white";
        disableUnnecessaryStuffButton.style.border = "none";
        disableUnnecessaryStuffButton.style.cursor = "pointer";
        disableUnnecessaryStuffButton.style.transition =
          "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
        disableUnnecessaryStuffButton.style.fontSize = "16px";
        disableUnnecessaryStuffButton.style.boxShadow =
          "0 4px 10px rgba(0, 0, 0, 0.5)";
        disableUnnecessaryStuffButton.style.fontFamily = "Arial, sans-serif";
        disableUnnecessaryStuffButton.style.transform = "scale(1)";
        disableUnnecessaryStuffButton.onclick = () => {
          const unnecessaryElement = document.querySelector(
            'a[target="_blank"][data-ph-autocapture="true"]',
          );
          if (unnecessaryElement) {
            unnecessaryElement.remove();
            alert("Unnecessary stuff has been disabled.");
          } else {
            alert("No unnecessary stuff found to disable.");
          }
        };
        overlayContent.appendChild(disableUnnecessaryStuffButton);
  
        const autoGrammarButton = document.createElement("button");
        autoGrammarButton.textContent = "Auto Grammar Check";
        autoGrammarButton.style.width = "100%";
        autoGrammarButton.style.height = "50px";
        autoGrammarButton.style.margin = "10px 0";
        autoGrammarButton.style.borderRadius = "8px";
        autoGrammarButton.style.backgroundColor = "#555";
        autoGrammarButton.style.color = "white";
        autoGrammarButton.style.border = "none";
        autoGrammarButton.style.cursor = "pointer";
        autoGrammarButton.style.transition =
          "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
        autoGrammarButton.style.fontSize = "16px";
        autoGrammarButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
        autoGrammarButton.style.fontFamily = "Arial, sans-serif";
        autoGrammarButton.style.transform = "scale(1)";
        autoGrammarButton.onmouseover = () => {
          autoGrammarButton.style.transform = "translateY(-3px)";
          autoGrammarButton.style.boxShadow = "0 8px 20px rgba(34, 197, 94, 0.4)";
          autoGrammarButton.style.backgroundColor = "#22c55e";
        };
        autoGrammarButton.onmouseout = () => {
          autoGrammarButton.style.transform = "translateY(0)";
          autoGrammarButton.style.boxShadow = "0 4px 15px rgba(34, 197, 94, 0.3)";
          autoGrammarButton.style.backgroundColor = "#555";
        };
  
        const checkGrammar = async (textarea) => {
          const text = textarea.value;
          if (!text) return;
  
          try {
            const response = await fetch(
              "https://grammar-checker-j30b.onrender.com/grammar",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ text, language }),
              },
            );
  
            if (!response.ok) {
              throw new Error("Grammar check request failed");
            }
  
            const result = await response.json();
            if (result["Corrected Text"] && result["Corrected Text"] !== "") {
              const tempDiv = document.createElement("div");
              tempDiv.innerHTML = result["Corrected Text"];
  
              const errorTexts = Array.from(
                tempDiv.querySelectorAll(".error-text"),
              ).map((el) => el.textContent);
  
              errorTexts.forEach((errorText) => {
                const startIndex = text.indexOf(errorText);
                if (startIndex !== -1) {
                  const endIndex = startIndex + errorText.length;
                  const wrapper = document.createElement("span");
                  wrapper.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
                  wrapper.style.borderBottom = "2px wavy red";
                  wrapper.textContent = errorText;
                  const before = text.substring(0, startIndex);
                  const after = text.substring(endIndex);
                  textarea.value = before + wrapper.outerHTML + after;
                }
              });
  
              let resultParagraph = textarea.nextElementSibling;
              if (
                !resultParagraph ||
                !resultParagraph.classList.contains("grammar-result")
              ) {
                resultParagraph = document.createElement("p");
                resultParagraph.classList.add("grammar-result");
                textarea.parentNode.insertBefore(
                  resultParagraph,
                  textarea.nextSibling,
                );
              }
  
              resultParagraph.style.backgroundColor = "#444";
              resultParagraph.style.color = "#fff";
              resultParagraph.style.padding = "10px";
              resultParagraph.style.borderRadius = "5px";
              resultParagraph.style.marginTop = "5px";
              resultParagraph.style.fontSize = "14px";
              resultParagraph.style.display = "block";
              resultParagraph.textContent = result["Corrected Text"];
  
              setTimeout(() => {
                resultParagraph.remove();
              }, 5000);
            }
          } catch (error) {}
        };
  
        const setupGrammarCheck = () => {
          const textareas = document.querySelectorAll(
            'input[name^="exampleConversation"], textarea[name="description"], textarea[name="persona"], textarea[name="scenario"], textarea[name="instructions"], textarea[name="firstMessage"], input[class="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-full border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"], textarea[class="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-full border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex-1 rounded-l-none"][id^=":"][aria-describedby^=":"]',
          );
  
          textareas.forEach((textarea) => {
            textarea.addEventListener("input", () => {
              clearTimeout(textarea.grammarTimeout);
              textarea.grammarTimeout = setTimeout(() => {
                checkGrammar(textarea);
              }, 1000);
            });
          });
        };
  
        const grammarObserver = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
              setupGrammarCheck();
            }
          });
        });
  
        grammarObserver.observe(document.body, {
          childList: true,
          subtree: true,
        });
  
        setupGrammarCheck();
  
        autoGrammarButton.onclick = () => {
          const textareas = document.querySelectorAll(
            'input[name^="exampleConversation"], textarea[name="description"], textarea[name="persona"], textarea[name="scenario"], textarea[name="instructions"], textarea[name="firstMessage"], input[class="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-full border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"], textarea[class="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-full border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex-1 rounded-l-none"][id^=":"][aria-describedby^=":"]',
          );
          textareas.forEach((textarea) => {
            checkGrammar(textarea);
          });
          alert("Grammar check initialized for all text areas");
        };
        
        const logoutButton = document.createElement("button");
        logoutButton.textContent = "⏹️ Logout";
        logoutButton.style.width = "100%";
        logoutButton.style.height = "50px";
        logoutButton.style.margin = "10px 0";
        logoutButton.style.borderRadius = "8px";
        logoutButton.style.backgroundColor = "#555";
        logoutButton.style.color = "white";
        logoutButton.style.border = "none";
        logoutButton.style.cursor = "pointer";
        logoutButton.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
        logoutButton.style.fontSize = "16px";
        logoutButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
        logoutButton.style.fontFamily = "Arial, sans-serif";
        logoutButton.style.transform = "scale(1)";
        logoutButton.onmouseover = () => {
          logoutButton.style.transform = "translateY(-3px)";
          logoutButton.style.boxShadow = "0 8px 20px rgba(0, 255, 0, 0.4)";
        };
        logoutButton.onmouseout = () => {
          logoutButton.style.transform = "translateY(0)";
          logoutButton.style.boxShadow = "0 4px 15px rgba(0, 255, 0, 0.3)";
        };
  
        logoutButton.onclick = () => {
          const alertOverlay = document.createElement("div");
          alertOverlay.style.position = "fixed";
          alertOverlay.style.top = "0";
          alertOverlay.style.left = "0";
          alertOverlay.style.width = "100%";
          alertOverlay.style.height = "100%";
          alertOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
          alertOverlay.style.display = "flex";
          alertOverlay.style.justifyContent = "center";
          alertOverlay.style.alignItems = "center";
          alertOverlay.style.zIndex = "10000";
          alertOverlay.style.opacity = "0";
          alertOverlay.style.transition = "opacity 0.3s ease-in-out";
  
          const alertBox = document.createElement("div");
          alertBox.style.backgroundColor = "#000";
          alertBox.style.padding = "30px";
          alertBox.style.borderRadius = "15px";
          alertBox.style.border = "2px solid #fff";
          alertBox.style.boxShadow = "0 0 30px rgba(255, 255, 255, 0.3)";
          alertBox.style.textAlign = "center";
          alertBox.style.maxWidth = "400px";
          alertBox.style.width = "90%";
          alertBox.classList.add("animate__animated", "animate__zoomIn");
  
          const alertIcon = document.createElement("div");
          alertIcon.innerHTML =
            '<i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #fff; margin-bottom: 20px;"></i>';
          alertIcon.classList.add("animate__animated", "animate__bounceIn");
  
          const alertText = document.createElement("p");
          alertText.textContent = "ARE YOU SURE YOU WANT TO LOG OUT?";
          alertText.style.fontSize = "20px";
          alertText.style.marginBottom = "25px";
          alertText.style.color = "#fff";
          alertText.style.fontWeight = "bold";
          alertText.style.lineHeight = "1.4";
          alertText.classList.add("animate__animated", "animate__fadeInUp");
  
          const buttonContainer = document.createElement("div");
          buttonContainer.style.display = "flex";
          buttonContainer.style.justifyContent = "center";
          buttonContainer.style.gap = "15px";
          buttonContainer.classList.add("animate__animated", "animate__fadeInUp");
  
          const yesButton = document.createElement("button");
          yesButton.innerHTML = '<i class="fas fa-check"></i> Yes';
          yesButton.style.padding = "12px 25px";
          yesButton.style.backgroundColor = "#ff0000";
          yesButton.style.color = "#fff";
          yesButton.style.border = "2px solid #fff";
          yesButton.style.borderRadius = "8px";
          yesButton.style.cursor = "pointer";
          yesButton.style.transition = "all 0.3s";
          yesButton.style.fontSize = "16px";
          yesButton.style.fontWeight = "600";
          yesButton.onmouseover = () => {
            yesButton.style.backgroundColor = "#fff";
            yesButton.style.color = "#ff0000";
            yesButton.style.transform = "translateY(-2px)";
          };
          yesButton.onmouseout = () => {
            yesButton.style.backgroundColor = "#ff0000";
            yesButton.style.color = "#fff";
            yesButton.style.transform = "translateY(0)";
          };
          yesButton.onclick = async () => {
            try {
              const statusResponse = await fetch(
                `${BASEURL}/check-login-status`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer SSS155",
                  },
                  body: JSON.stringify({ loginResponse })
                },
              );
              const data = await statusResponse.json();
  
              if (data.is_login === false) {
                alert("Please login first");
                alertOverlay.remove();
                return;
              }
  
              const response = await fetch(`${BASEURL}/logout`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Bearer SSS155",
                },
                body: JSON.stringify({ loginResponse })
              });
  
              if (response.ok) {
                alert("Logged out successfully");
                alertOverlay.remove();
                const ExtensionId = chrome.runtime.id;
                window.open(`chrome-extension://${ExtensionId}/login.html`, "_blank");
              } else {
                alert("Logout failed");
              }
              
            } catch (error) {
              console.error("Logout failed:", error);
            }
          };
          const noButton = document.createElement("button");
          noButton.innerHTML = '<i class="fas fa-times"></i> No';
          noButton.style.padding = "12px 25px";
          noButton.style.backgroundColor = "#000";
          noButton.style.color = "#fff";
          noButton.style.border = "2px solid #fff";
          noButton.style.borderRadius = "8px";
          noButton.style.cursor = "pointer";
          noButton.style.transition = "all 0.3s";
          noButton.style.fontSize = "16px";
          noButton.style.fontWeight = "600";
          noButton.onmouseover = () => {
            noButton.style.backgroundColor = "#fff";
            noButton.style.color = "#000";
            noButton.style.transform = "translateY(-2px)";
          };
          noButton.onmouseout = () => {
            noButton.style.backgroundColor = "#000";
            noButton.style.color = "#fff";
            noButton.style.transform = "translateY(0)";
          };
          noButton.onclick = () => {
            alertBox.classList.remove("animate__zoomIn");
            alertBox.classList.add("animate__zoomOut");
            setTimeout(() => document.body.removeChild(alertOverlay), 500);
          };
  
          buttonContainer.appendChild(yesButton);
          buttonContainer.appendChild(noButton);
          alertBox.appendChild(alertIcon);
          alertBox.appendChild(alertText);
          alertBox.appendChild(buttonContainer);
          alertOverlay.appendChild(alertBox);
          document.body.appendChild(alertOverlay);
  
          setTimeout(() => {
            alertOverlay.style.opacity = "1";
          }, 10);
        };
        const loginButton = document.createElement("button");
        loginButton.textContent = "🔑 Login";
        loginButton.style.width = "100%";
        loginButton.style.height = "50px";
        loginButton.style.margin = "10px 0";
        loginButton.style.borderRadius = "8px";
        loginButton.style.backgroundColor = "#555";
        loginButton.style.color = "white";
        loginButton.style.border = "none";
        loginButton.style.cursor = "pointer";
        loginButton.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
        loginButton.style.fontSize = "16px";
        loginButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
        loginButton.style.fontFamily = "Arial, sans-serif";
        loginButton.style.transform = "scale(1)";
        loginButton.onmouseover = () => {
          loginButton.style.transform = "translateY(-3px)";
          loginButton.style.boxShadow = "0 8px 20px rgba(29, 161, 242, 0.4)";
        };
        loginButton.onmouseout = () => {
          loginButton.style.transform = "translateY(0)";
          loginButton.style.boxShadow = "0 4px 15px rgba(29, 161, 242, 0.3)";
        };
        loginButton.onclick = () => {
          const loginUrl = chrome.runtime.getURL("login.html");
          window.open(loginUrl, "_blank", "width=600,height=400");
        };
  
        const registerButton = document.createElement("button");
        registerButton.textContent = "📝 Register";
        registerButton.style.width = "100%";
        registerButton.style.height = "50px";
        registerButton.style.margin = "10px 0";
        registerButton.style.borderRadius = "8px";
        registerButton.style.backgroundColor = "#555";
        registerButton.style.color = "white";
        registerButton.style.border = "none";
        registerButton.style.cursor = "pointer";
        registerButton.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
        registerButton.style.fontSize = "16px";
        registerButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
        registerButton.style.fontFamily = "Arial, sans-serif";
        registerButton.style.transform = "scale(1)";
        registerButton.onmouseover = () => {
          registerButton.style.transform = "translateY(-3px)";
          registerButton.style.boxShadow = "0 8px 20px rgba(233, 30, 99, 0.4)";
        };
        registerButton.onmouseout = () => {
          registerButton.style.transform = "translateY(0)";
          registerButton.style.boxShadow = "0 4px 15px rgba(233, 30, 99, 0.3)";
        };
        registerButton.onclick = () => {
          const creatingUrl = chrome.runtime.getURL("register.html");
          window.open(creatingUrl, "_blank", "width=600,height=400");
        };
  
        const stopButton = document.createElement("button");
        stopButton.textContent = "⏹️ Stop Purge";
        stopButton.style.width = "100%";
        stopButton.style.height = "50px";
        stopButton.style.margin = "10px 0";
        stopButton.style.borderRadius = "8px";
        stopButton.style.backgroundColor = "#555";
        stopButton.style.color = "white";
        stopButton.style.border = "none";
        stopButton.style.cursor = "pointer";
        stopButton.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
        stopButton.style.fontSize = "16px";
        stopButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
        stopButton.style.fontFamily = "Arial, sans-serif";
        stopButton.style.transform = "scale(1)";
  
        stopButton.onmouseover = () => {
          stopButton.style.transform = "translateY(-3px)";
          stopButton.style.boxShadow = "0 8px 20px rgba(108, 117, 125, 0.4)";
          stopButton.style.backgroundColor = "#5a6268";
        };
  
        stopButton.onmouseout = () => {
          stopButton.style.transform = "translateY(0)";
          stopButton.style.boxShadow = "0 4px 15px rgba(108, 117, 125, 0.3)";
          stopButton.style.backgroundColor = "#6c757d";
        };
  
        stopButton.onclick = () => {
          if (!localStorage.getItem("Purgestop")) {
            localStorage.setItem("Purgestop", "true");
            stopButton.textContent = "▶️ Unstop Purge";
            stopButton.style.backgroundColor = "#28a745";
          } else {
            localStorage.removeItem("Purgestop");
            stopButton.textContent = "⏹️ Stop Purge";
            stopButton.style.backgroundColor = "#6c757d";
          }
        };
  
        const contributionButton = document.createElement("button");
        contributionButton.textContent = "🌟 Contribution";
        contributionButton.style.width = "100%";
        contributionButton.style.height = "50px";
        contributionButton.style.margin = "10px 0";
        contributionButton.style.borderRadius = "8px";
        contributionButton.style.backgroundColor = "#555";
        contributionButton.style.color = "white";
        contributionButton.style.border = "none";
        contributionButton.style.cursor = "pointer";
        contributionButton.style.transition =
          "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
        contributionButton.style.fontSize = "16px";
        contributionButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
        contributionButton.style.fontFamily = "Arial, sans-serif";
        contributionButton.style.transform = "scale(1)";
        contributionButton.style.animation = "pulse 2s infinite";
        const keyframes = `
              @keyframes pulse {
                  0% { transform: scale(1); }
                  50% { transform: scale(1.02); }
                  100% { transform: scale(1); }
              }
          `;
        const style = document.createElement("style");
        style.textContent = keyframes;
        document.head.appendChild(style);
  
        contributionButton.onmouseenter = () => {
          contributionButton.style.transform = "scale(1.02)";
          contributionButton.style.backgroundColor = "#9c27b0";
        };
  
        contributionButton.onmouseleave = () => {
          contributionButton.style.transform = "scale(1)";
          contributionButton.style.backgroundColor = "#555";
        };
        contributionButton.onclick = () => {
          const popup = document.createElement("div");
          popup.style.position = "fixed";
          popup.style.top = "50%";
          popup.style.left = "50%";
          popup.style.transform = "translate(-50%, -50%)";
          popup.style.backgroundColor = "rgba(26, 31, 46, 0.95)";
          popup.style.padding = "30px";
          popup.style.borderRadius = "20px";
          popup.style.boxShadow = "0 20px 40px rgba(0,0,0,0.9)";
          popup.style.zIndex = "10000";
          popup.style.width = "90%";
          popup.style.maxWidth = "500px";
          popup.style.color = "white";
          popup.style.fontFamily = "Poppins, Arial, sans-serif";
          popup.style.backdropFilter = "blur(15px)";
          popup.style.border = "2px solid rgba(255,255,255,0.1)";
          popup.className = "animate__animated animate__fadeIn animate__faster";
  
          const content = document.createElement("div");
          content.style.marginBottom = "20px";
          content.innerHTML = `
                  <div class="animate__animated animate__fadeInUp" style="border: 2px solid rgba(52, 152, 219, 0.4); background: rgba(52, 152, 219, 0.08); border-radius: 15px; margin-bottom: 20px; padding: 20px; box-shadow: 0 10px 20px rgba(52, 152, 219, 0.1); transition: all 0.3s ease; user-select: none;">
                      <h2 style="color: #3498db; margin: 0; font-size: 22px; letter-spacing: 0.8px; font-weight: 600; transform-origin: left; transition: transform 0.3s ease;">Developer</h2>
                      <p style="margin: 15px 0; line-height: 1.6; font-size: 14px; opacity: 0.9; transition: all 0.3s ease;"><strong style="color: #3498db; font-size: 16px; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.transform='scale(1.1)';this.style.textShadow='0 0 10px rgba(52, 152, 219, 0.5)'" onmouseout="this.style.transform='scale(1)';this.style.textShadow='none'">Whitzscott</strong> – The sole developer and maintainer of this project.</p>
                  </div>
  
                  <div class="animate__animated animate__fadeInUp animate__delay-1s" style="border: 2px solid rgba(231, 76, 60, 0.4); background: rgba(231, 76, 60, 0.08); border-radius: 15px; margin-bottom: 20px; padding: 20px; box-shadow: 0 10px 20px rgba(231, 76, 60, 0.1); transition: all 0.3s ease; user-select: none;">
                      <h2 style="color: #e74c3c; margin: 0; font-size: 22px; letter-spacing: 0.8px; font-weight: 600; transform-origin: left; transition: transform 0.3s ease;">Beta Testers</h2>
                      <p style="margin: 15px 0; line-height: 1.6; font-size: 14px; opacity: 0.9; transition: all 0.3s ease;"><strong style="color: #e74c3c; font-size: 16px; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.transform='scale(1.1)';this.style.textShadow='0 0 10px rgba(231, 76, 60, 0.5)'" onmouseout="this.style.transform='scale(1)';this.style.textShadow='none'">Ahmad Zaki</strong> – A huge thank you for your invaluable contributions!</p>
                      <p style="margin: 15px 0; line-height: 1.6; font-size: 14px; opacity: 0.9; transition: all 0.3s ease;"><strong style="color: #e74c3c; font-size: 16px; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.transform='scale(1.1)';this.style.textShadow='0 0 10px rgba(231, 76, 60, 0.5)'" onmouseout="this.style.transform='scale(1)';this.style.textShadow='none'">Shivani</strong> – A friend who provided excellent help, including icons, designs, and honest feedback! Also, thank you for finding many bugs!</p>
                      <p style="margin: 15px 0; line-height: 1.6; font-size: 14px; opacity: 0.9; transition: all 0.3s ease;"><strong style="color: #e74c3c; font-size: 16px; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.transform='scale(1.1)';this.style.textShadow='0 0 10px rgba(231, 76, 60, 0.5)'" onmouseout="this.style.transform='scale(1)';this.style.textShadow='none'">Contracepy</strong> – A friend who offered excellent advice and support.</p>
                      <p style="margin: 15px 0; line-height: 1.6; font-size: 14px; opacity: 0.9; transition: all 0.3s ease;"><strong style="color: #e74c3c; font-size: 16px; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.transform='scale(1.1)';this.style.textShadow='0 0 10px rgba(231, 76, 60, 0.5)'" onmouseout="this.style.transform='scale(1)';this.style.textShadow='none'">You</strong> – Thank you for giving this extension a try! ✨</p>
                  </div>
              `;
  
          const sections = content.querySelectorAll(
            'div[class^="animate__animated"]',
          );
          sections.forEach((section) => {
            section.onmouseenter = () => {
              section.style.transform = "translateY(-3px) scale(1.01)";
              section.style.boxShadow = "0 12px 25px rgba(0,0,0,0.2)";
            };
            section.onmouseleave = () => {
              section.style.transform = "translateY(0) scale(1)";
              section.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1)";
            };
          });
  
          const closeButton = document.createElement("button");
          closeButton.textContent = "✕ Close";
          closeButton.style.padding = "12px 25px";
          closeButton.style.backgroundColor = "#e74c3c";
          closeButton.style.color = "white";
          closeButton.style.border = "none";
          closeButton.style.borderRadius = "12px";
          closeButton.style.cursor = "pointer";
          closeButton.style.transition = "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
          closeButton.style.fontSize = "15px";
          closeButton.style.fontWeight = "600";
          closeButton.style.boxShadow = "0 8px 20px rgba(231, 76, 60, 0.5)";
          closeButton.style.display = "block";
          closeButton.style.margin = "0 auto";
          closeButton.className =
            "animate__animated animate__fadeInUp animate__delay-2s";
  
          closeButton.onmouseenter = () => {
            closeButton.style.backgroundColor = "#c0392b";
            closeButton.style.transform = "translateY(-2px) scale(1.03)";
            closeButton.style.boxShadow = "0 12px 25px rgba(231, 76, 60, 0.6)";
          };
  
          closeButton.onmouseleave = () => {
            closeButton.style.backgroundColor = "#e74c3c";
            closeButton.style.transform = "translateY(0) scale(1)";
            closeButton.style.boxShadow = "0 8px 20px rgba(231, 76, 60, 0.5)";
          };
  
          closeButton.onclick = () => {
            popup.className =
              "animate__animated animate__fadeOut animate__faster";
            setTimeout(() => {
              document.body.removeChild(popup);
            }, 500);
          };
  
          popup.onclick = (e) => {
            if (e.target === popup) {
              popup.className =
                "animate__animated animate__fadeOut animate__faster";
              setTimeout(() => {
                document.body.removeChild(popup);
              }, 500);
            }
          };
  
          popup.appendChild(content);
          popup.appendChild(closeButton);
          document.body.appendChild(popup);
        };
        
        async function getMessages(type, times = 1) {
          let ids = [];
      
          async function Remove() {
              const jwt = sessionStorage.getItem("jwt");
              const chatId = new URLSearchParams(window.location.search).get("id");
      
              if (!jwt) {
                  console.error("No JWT token found. User might not be logged in.");
                  return;
              }
      
              if (!chatId) {
                  console.error("No chat ID found in the URL.");
                  return;
              }
      
              const url = "https://api.sakura.fm/api/get-messages";
              const payload = { chatId, limit: 999999 };
      
              try {
                  const response = await fetch(url, {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${jwt}`,
                      },
                      body: JSON.stringify(payload),
                      credentials: 'include',
                  });
      
                  if (!response.ok) {
                      throw new Error(`Failed to get messages. Status: ${response.status}`);
                  }
      
                  const data = await response.json();
                  if (!data || !data.messages) {
                      console.error("No messages found in response.");
                      return;
                  }
      
                  ids = data.messages.map(msg => msg.id);
                  const idsToDelete = ids.slice(1);
      
                  if (idsToDelete.length === 0) {
                      console.log("No additional messages to delete.");
                      return;
                  }
      
                  const deletePayload = {
                      action: {
                          type: "delete",
                          ids: idsToDelete,
                      },
                      context: {
                          chatId: chatId,
                          locale: "en",
                      },
                  };
      
                  const deleteUrl = "https://api.sakura.fm/api/chat";
                  const deleteResponse = await fetch(deleteUrl, {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${jwt}`,
                      },
                      body: JSON.stringify(deletePayload),
                      credentials: 'include',
                  });
      
                  if (!deleteResponse.ok) {
                      throw new Error(`Failed to delete messages. Status: ${deleteResponse.status}`);
                  }
      
                  const deleteData = await deleteResponse.json();
                  if (deleteData.success) {
                      console.log("Messages deleted successfully");
                  } else {
                      console.error("Failed to delete messages.");
                  }
      
              } catch (error) {
                  console.error("Error deleting messages:", error);
              }
          }
      
          async function regen() {
              const jwt = sessionStorage.getItem("jwt");
              if (!jwt) {
                  console.error("No JWT token found. User might not be logged in.");
                  return;
              }
      
              const chatId = new URLSearchParams(window.location.search).get("id");
              if (!chatId) {
                  console.error("No chat ID found in the URL.");
                  return;
              }
      
              if (ids.length === 0) {
                  console.error("No message IDs available for regeneration.");
                  return;
              }
      
              const payload = {
                  action: {
                      type: "reload",
                      id: ids[ids.length - 1]
                  },
                  context: {
                      chatId: chatId,
                      locale: "en"
                  }
              };
      
              try {
                  for (let i = 0; i < times; i++) {
                      const response = await fetch("https://api.sakura.fm/api/chat", {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${jwt}`,
                          },
                          body: JSON.stringify(payload),
                          credentials: 'include',
                      });
      
                      if (!response.ok) {
                          throw new Error(`Failed to regenerate message. Status: ${response.status}`);
                      }
      
                      const data = await response.json();
                      console.log(`Message regenerated successfully ${i + 1} time(s)`, data);
                  }
              } catch (error) {
                  console.error("Error regenerating message:", error);
              }
          }
      
          const jwt = sessionStorage.getItem("jwt");
          if (!jwt) {
              console.error("No JWT token found. User might not be logged in.");
              return;
          }
      
          const chatId = new URLSearchParams(window.location.search).get("id");
          if (!chatId) {
              console.error("No chat ID found in the URL.");
              return;
          }
      
          const url = "https://api.sakura.fm/api/get-messages";
          const payload = { chatId, limit: 999999 };
      
          try {
              const response = await fetch(url, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${jwt}`,
                  },
                  body: JSON.stringify(payload),
                  credentials: 'include',
              });
      
              if (!response.ok) {
                  throw new Error(`Failed to get messages. Status: ${response.status}`);
              }
      
              const data = await response.json();
              if (!data || !data.messages) {
                  console.error("No messages found in response.");
                  return;
              }
      
              ids = data.messages.map(msg => msg.id);
      
              switch (type) {
                  case 'html':
                      generateHTML(data.messages, chatId);
                      break;
                  case 'txt':
                      generateTXT(data.messages, chatId);
                      break;
                  case 'json':
                      generateJSON(data.messages, chatId);
                      break;
                  case 'jsonl':
                      generateJSONL(data.messages, chatId);
                      break;
                  case 'delete':
                      await Remove();
                      break;
                  case 'regen':
                      await regen();
                      break;
                  default:
                      console.error(`Invalid generation type: ${type}`);
              }
          } catch (error) {
              console.error("Error fetching messages:", error);
          }
      }
      
      
      
      
      
      
      function generateHTML(messages, chatId) {
          const currentDate = new Date().toLocaleString();
      
          let htmlContent = `
              <html>
                  <head>
                      <style>
                          @keyframes fadeSlideRight {
                              from { transform: translateX(50px); opacity: 0; }
                              to { transform: translateX(0); opacity: 1; }
                          }
                          @keyframes fadeSlideLeft {
                              from { transform: translateX(-50px); opacity: 0; }
                              to { transform: translateX(0); opacity: 1; }
                          }
                          body { 
                              font-family: 'Arial', sans-serif; 
                              background-color: #121212; 
                              color: #fff; 
                              margin: 0; 
                              padding: 20px; 
                          }
                          h2 {
                              text-align: center;
                              color: #fff;
                              margin-bottom: 20px;
                              font-size: 24px;
                              text-transform: uppercase;
                          }
                          .chat-container {
                              display: flex;
                              flex-direction: column;
                              max-width: 80%;
                              margin: 0 auto;
                              padding-bottom: 20px;
                          }
                          .message-box {
                              padding: 15px;
                              margin: 10px 0;
                              border-radius: 16px;
                              max-width: 70%;
                              word-wrap: break-word;
                              font-size: 16px;
                              transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
                          }
                          .user {
                              background: linear-gradient(to right, #4b79a1, #283e51);
                              color: white;
                              align-self: flex-end;
                              border-top-left-radius: 0;
                              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                              animation: fadeSlideRight 0.5s ease-in-out;
                          }
                          .assistant {
                              background: linear-gradient(to right, #2c2c2c, #444);
                              color: #f4f4f4;
                              align-self: flex-start;
                              border-top-right-radius: 0;
                              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                              animation: fadeSlideLeft 0.5s ease-in-out;
                          }
                          .message-box:hover {
                              transform: scale(1.05);
                              box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
                          }
                          .timestamp {
                              font-size: 12px;
                              color: #ddd;
                              text-align: right;
                              margin-top: 5px;
                              opacity: 0.7;
                          }
                          .footer {
                              text-align: center;
                              color: #aaa;
                              font-size: 14px;
                              margin-top: 30px;
                              padding: 20px;
                              background-color: #1e1e1e;
                              position: relative;
                              bottom: 0;
                              width: 100%;
                              opacity: 0.8;
                              transition: opacity 0.3s ease-in-out;
                          }
                          .footer:hover {
                              opacity: 1;
                          }
                          .message-box p {
                              margin: 0;
                              padding: 0;
                          }
                      </style>
                  </head>
                  <body>
                      <h2>Chat Messages</h2>
                      <div class="chat-container">
          `;
      
          messages.forEach(message => {
              if (message.role === "user" || message.role === "assistant") {
                  const timestamp = new Date(message.createdAt).toLocaleString();
                  const roleClass = message.role === "user" ? "user" : "assistant";
      
                  htmlContent += `
                      <div class="message-box ${roleClass}">
                          <strong>${message.role === "user" ? "User" : "Assistant"}:</strong>
                          <p>${message.content}</p>
                          <div class="timestamp">${timestamp}</div>
                      </div>
                  `;
              }
          });
      
          htmlContent += `
              </div>
              <div class="footer">Created by BetterSakura | Generated on: ${currentDate}</div>
          </body>
          </html>`;
      
          const blob = new Blob([htmlContent], { type: "text/html" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `BetterSakuraMessage_${chatId}.html`;
          link.click();
      }
      
      const extractChatsButton = document.createElement("button");
      extractChatsButton.textContent = "Extract Chats";
      Object.assign(extractChatsButton.style, {
          width: "100%",
          height: "50px",
          margin: "10px 0",
          borderRadius: "8px",
          backgroundColor: "#555",
          color: "white",
          border: "none",
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          fontSize: "16px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
          fontFamily: "Arial, sans-serif",
          transform: "scale(1)",
      });
      
      extractChatsButton.addEventListener("click", () => getMessages('html'));

      extractChatsButton.onmouseenter = () => {
        extractChatsButton.style.transform = "scale(1.05)";
        extractChatsButton.style.backgroundColor = "#666";
        extractChatsButton.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
      };

      extractChatsButton.onmouseleave = () => {
        extractChatsButton.style.transform = "scale(1)";
        extractChatsButton.style.backgroundColor = "#555";
        extractChatsButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
      };
      

      const MassDelete = document.createElement("button");
      MassDelete.textContent = "MassDelete"; 
      Object.assign(MassDelete.style, {
          width: "100%",
          height: "50px",
          margin: "10px 0",
          borderRadius: "8px",
          backgroundColor: "#555",
          color: "white",
          border: "none",
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          fontSize: "16px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
          fontFamily: "Arial, sans-serif",
          transform: "scale(1)",
      });
      
      MassDelete.addEventListener("click", () => showConfirmationPopup());
      
      MassDelete.onmouseenter = () => {
          MassDelete.style.transform = "scale(1.05)";
          MassDelete.style.backgroundColor = "#666";
          MassDelete.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
      };
      
      MassDelete.onmouseleave = () => {
          MassDelete.style.transform = "scale(1)";
          MassDelete.style.backgroundColor = "#555";
          MassDelete.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
      };
      
      function showConfirmationPopup() {
          const popup = document.createElement("div");
          popup.classList.add("animate__animated", "animate__zoomIn", "animate__fadeIn", "popup");
      
          popup.style.position = "fixed";
          popup.style.top = "50%";
          popup.style.left = "50%";
          popup.style.transform = "translate(-50%, -50%)";
          popup.style.backgroundColor = "rgb(221, 28, 28)";
          popup.style.color = "white";
          popup.style.padding = "30px";
          popup.style.borderRadius = "12px";
          popup.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.7)";
          popup.style.zIndex = "999999";  
          popup.style.fontFamily = "Arial, sans-serif";
          popup.style.textAlign = "center";
          popup.style.maxWidth = "450px";
          popup.style.width = "90%";
          popup.style.animationDuration = "0.5s";
          popup.style.transition = "transform 0.3s ease-in-out, opacity 0.3s ease-in-out";
      
          popup.innerHTML = `
              <h3 style="font-size: 20px; margin-bottom: 15px;">Warning: This action cannot be undone!</h3>
              <p style="font-size: 16px; margin-bottom: 20px;">Please do not use this feature if you are not sure that you want to remove all your messages. All your messages in this chat will be removed.</p>
              <p style="font-size: 16px; margin-bottom: 25px;">If you still want to remove all your messages, please press Yes. If not, press No.</p>
              <button id="yesButton" style="background-color: #28a745; color: white; padding: 12px 25px; border-radius: 10px; border: none; cursor: pointer; font-size: 16px; margin-right: 15px; transition: 0.3s ease-in-out;">Yes</button>
              <button id="noButton" style="background-color: #6c757d; color: white; padding: 12px 25px; border-radius: 10px; border: none; cursor: pointer; font-size: 16px; transition: 0.3s ease-in-out;">No</button>
          `;
      
          document.body.appendChild(popup);
      
          const yesButton = popup.querySelector("#yesButton");
          const noButton = popup.querySelector("#noButton");
      
          yesButton.addEventListener("click", () => {
              getMessages('delete');
              popup.remove();
          });
      
          noButton.addEventListener("click", () => {
              popup.remove();
          });
      
          yesButton.onmouseenter = () => {
              yesButton.style.transform = "scale(1.05)";
              yesButton.style.backgroundColor = "#218838";
          };
      
          yesButton.onmouseleave = () => {
              yesButton.style.transform = "scale(1)";
              yesButton.style.backgroundColor = "#28a745";
          };
      
          noButton.onmouseenter = () => {
              noButton.style.transform = "scale(1.05)";
              noButton.style.backgroundColor = "#5a6268";
          };
      
          noButton.onmouseleave = () => {
              noButton.style.transform = "scale(1)";
              noButton.style.backgroundColor = "#6c757d";
          };
      }
      
      const MassRegen = document.createElement("button");
      MassRegen.textContent = "MassRegen";
      Object.assign(MassRegen.style, {
          width: "100%",
          height: "50px",
          margin: "10px 0",
          borderRadius: "8px",
          backgroundColor: "#555",
          color: "white",
          border: "none",
          cursor: "pointer",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          fontSize: "16px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
          fontFamily: "Arial, sans-serif",
          transform: "scale(1)",
      });
      
      MassRegen.addEventListener("click", () => {
          let times = prompt("How many times do you want to regen? (between 1 and 35)", "1");
          times = parseInt(times);
      
          if (times !== null && !isNaN(times) && times >= 1 && times <= 35) {
              getMessages('regen', times);
          } else {
              alert("Please enter a valid number between 1 and 35.");
          }
      });
      
      MassRegen.onmouseenter = () => {
          MassRegen.style.transform = "scale(1.05)";
          MassRegen.style.backgroundColor = "#666";
          MassRegen.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
      };
      
      MassRegen.onmouseleave = () => {
          MassRegen.style.transform = "scale(1)";
          MassRegen.style.backgroundColor = "#555";
          MassRegen.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
      };
      

      const SearchTags = document.createElement("button");
SearchTags.textContent = "SearchTags";
Object.assign(SearchTags.style, {
    width: "100%",
    height: "50px",
    margin: "10px 0",
    borderRadius: "8px",
    backgroundColor: "#555",
    color: "white",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontSize: "16px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
    fontFamily: "Arial, sans-serif",
    transform: "scale(1)",
});


SearchTags.onmouseenter = () => {
  SearchTags.style.transform = "scale(1.05)";
  SearchTags.style.backgroundColor = "#666";
  SearchTags.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
};

SearchTags.onmouseleave = () => {
  SearchTags.style.transform = "scale(1)";
  SearchTags.style.backgroundColor = "#555";
  SearchTags.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
};

SearchTags.addEventListener('click', () => {
    const buttonDiv = document.createElement('div');
    buttonDiv.style.position = 'fixed';
    buttonDiv.style.top = '50%';
    buttonDiv.style.left = '50%';
    buttonDiv.style.transform = 'translate(-50%, -50%)';
    buttonDiv.style.zIndex = '9999999';
    buttonDiv.style.backgroundColor = '#444';
    buttonDiv.style.padding = '20px';
    buttonDiv.style.borderRadius = '10px';
    buttonDiv.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
    buttonDiv.style.display = 'flex';
    buttonDiv.style.flexDirection = 'column';
    buttonDiv.style.alignItems = 'center';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.backgroundColor = '#ff4d4d';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.padding = '10px 20px';
    closeButton.style.borderRadius = '5px';
    closeButton.style.marginBottom = '10px';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', () => {
        buttonDiv.remove();
    });

    const nsfwCheckbox = document.createElement('input');
    nsfwCheckbox.type = 'checkbox';
    const nsfwLabel = document.createElement('label');
    nsfwLabel.textContent = 'is_nsfw?';
    nsfwLabel.style.color = 'white';
    nsfwLabel.style.marginBottom = '10px';
    nsfwLabel.style.fontSize = '16px';

    const inputBox = document.createElement('input');
    inputBox.placeholder = 'Enter search term';
    inputBox.style.padding = '10px';
    inputBox.style.marginBottom = '10px';
    inputBox.style.borderRadius = '5px';
    inputBox.style.border = '1px solid #ccc';

    const searchButton = document.createElement('button');
    searchButton.textContent = 'Search';
    searchButton.style.backgroundColor = '#4CAF50';
    searchButton.style.color = 'white';
    searchButton.style.border = 'none';
    searchButton.style.padding = '10px 20px';
    searchButton.style.borderRadius = '5px';
    searchButton.style.cursor = 'pointer';
    searchButton.addEventListener('click', () => {
        const searchTerm = inputBox.value.trim();
        if (searchTerm) {
            const isNsfw = nsfwCheckbox.checked || false;
            Search(searchTerm, isNsfw, buttonDiv);
        } else {
            alert('Please enter a search term');
        }
    });

    buttonDiv.appendChild(closeButton);
    buttonDiv.appendChild(nsfwLabel);
    buttonDiv.appendChild(nsfwCheckbox);
    buttonDiv.appendChild(inputBox);
    buttonDiv.appendChild(searchButton);

    document.body.appendChild(buttonDiv);
});

const BuyVipButton = document.createElement("button");
BuyVipButton.textContent = "Buy Vip";

Object.assign(BuyVipButton.style, {
  width: "100%",
  height: "50px",
  margin: "10px 0",
  borderRadius: "8px",
  backgroundColor: "#555",
  color: "white",
  border: "none",
  cursor: "pointer",
  transition: "all 0.3s ease",
  fontSize: "16px",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
  fontFamily: "Arial, sans-serif",
  transform: "scale(1)",
});

BuyVipButton.onmouseenter = () => {
  BuyVipButton.style.transform = "scale(1.05)";
  BuyVipButton.style.backgroundColor = "#666";
  BuyVipButton.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
};

BuyVipButton.onmouseleave = () => {
  BuyVipButton.style.transform = "scale(1)";
  BuyVipButton.style.backgroundColor = "#555";
  BuyVipButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
};

BuyVipButton.onclick = () => {
  const div = document.createElement("div");
  div.classList.add('animate__animated', 'animate__zoomIn');
  div.style.position = "fixed";
  div.style.top = "50px";
  div.style.left = "50%";
  div.style.transform = "translateX(-50%)";
  div.style.backgroundColor = "#222";
  div.style.color = "white";
  div.style.padding = "20px";
  div.style.borderRadius = "8px";
  div.style.zIndex = "999999999";
  div.style.fontFamily = "Arial, sans-serif";
  div.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.5)";

  const innerButton = document.createElement("button");
  innerButton.textContent = "Buy Vip";
  Object.assign(innerButton.style, {
    width: "100%",
    height: "50px",
    marginBottom: "10px",
    borderRadius: "8px",
    backgroundColor: "#555",
    color: "white",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
  });

  const instructions = document.createElement("p");
  instructions.textContent = `How to buy, first choose a payment method, for example GankNow, press the Better Sakura Donation / Better Sakura Vip from https://ganknow.com/manage/membership-settings then screenshot your payment proof and send it to Discord in my DM, whitzscott, and await for confirmation.`;
  instructions.style.fontSize = "14px";
  instructions.style.marginTop = "10px";

  div.appendChild(innerButton);
  div.appendChild(instructions);

  innerButton.onclick = () => {
    div.innerHTML = '';

    const header = document.createElement("h1");
    header.textContent = "Choose Method";
    header.classList.add('animate__animated', 'animate__fadeInUp');
    div.appendChild(header);

    const paypalButton = document.createElement("a");
    paypalButton.href = "https://ko-fi.com/whitzscott";
    paypalButton.target = "_blank";
    const paypalButtonElement = document.createElement("button");
    paypalButtonElement.textContent = "Paypal";
    Object.assign(paypalButtonElement.style, {
      width: "100%",
      height: "50px",
      marginBottom: "10px",
      borderRadius: "8px",
      backgroundColor: "#555",
      color: "white",
      border: "none",
      cursor: "pointer",
      fontSize: "16px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
      transition: "all 0.3s ease",
    });
    paypalButton.appendChild(paypalButtonElement);

    const gankNowButton = document.createElement("a");
    gankNowButton.href = "https://ganknow.com/manage/membership-settings";
    gankNowButton.target = "_blank";
    const gankNowButtonElement = document.createElement("button");
    gankNowButtonElement.textContent = "GankNow";
    Object.assign(gankNowButtonElement.style, {
      width: "100%",
      height: "50px",
      marginBottom: "10px",
      borderRadius: "8px",
      backgroundColor: "#555",
      color: "white",
      border: "none",
      cursor: "pointer",
      fontSize: "16px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
      transition: "all 0.3s ease",
    });
    gankNowButton.appendChild(gankNowButtonElement);

    div.appendChild(paypalButton);
    div.appendChild(gankNowButton);

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    Object.assign(closeButton.style, {
      width: "100%",
      height: "50px",
      marginTop: "10px",
      borderRadius: "8px",
      backgroundColor: "#e74c3c",
      color: "white",
      border: "none",
      cursor: "pointer",
      fontSize: "16px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
      transition: "all 0.3s ease",
    });

    closeButton.onclick = () => {
      div.classList.add('animate__fadeOutDown');
      setTimeout(() => div.remove(), 1000);
    };

    div.appendChild(closeButton);
  };

  document.body.appendChild(div);
};

async function Search(searchTerm, isNsfw, buttonDiv) {
    const jwt = sessionStorage.getItem('jwt');

    if (!jwt) {
        alert("JWT is missing!");
        return;
    }

    const payload = {
        search: searchTerm,
        nsfw: isNsfw,
    };

    try {
        const response = await fetch('https://api.sakura.fm/api/search-tags', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();

        const resultDiv = document.createElement('div');
        resultDiv.style.marginTop = '20px';
        resultDiv.style.padding = '10px';
        resultDiv.style.backgroundColor = 'black';
        resultDiv.style.color = 'white';
        resultDiv.style.borderRadius = '8px';
        resultDiv.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
        resultDiv.textContent = JSON.stringify(data, null, 2);

        buttonDiv.appendChild(resultDiv);
    } catch (error) {
        console.error('Error:', error);
    }
}

const ModifyAiSuggestion = document.createElement('button');
ModifyAiSuggestion.textContent = "Modify AI Suggestion";
Object.assign(ModifyAiSuggestion.style, {
    width: "100%",
    height: "50px",
    margin: "10px 0",
    borderRadius: "8px",
    backgroundColor: "#555",
    color: "white",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontSize: "16px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
    fontFamily: "Arial, sans-serif",
    transform: "scale(1)",
});

ModifyAiSuggestion.onmouseenter = () => {
    ModifyAiSuggestion.style.transform = "scale(1.05)";
    ModifyAiSuggestion.style.backgroundColor = "#666";
    ModifyAiSuggestion.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
};

ModifyAiSuggestion.onmouseleave = () => {
    ModifyAiSuggestion.style.transform = "scale(1)";
    ModifyAiSuggestion.style.backgroundColor = "#555";
    ModifyAiSuggestion.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
};

ModifyAiSuggestion.addEventListener('click', () => {
    const overlayDiv = document.createElement('div');
    overlayDiv.style.position = 'fixed';
    overlayDiv.style.top = '0';
    overlayDiv.style.left = '0';
    overlayDiv.style.width = '100vw';
    overlayDiv.style.height = '100vh';
    overlayDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlayDiv.style.zIndex = '999999';
    overlayDiv.style.display = 'flex';
    overlayDiv.style.justifyContent = 'center';
    overlayDiv.style.alignItems = 'center';
    overlayDiv.style.flexDirection = 'column';

    const textarea = document.createElement('textarea');
    textarea.style.width = '80%';
    textarea.style.height = '200px';
    const TextareaContent = sessionStorage.getItem('content')
    textarea.value = `${TextareaContent}`;

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    Object.assign(saveButton.style, {
        marginTop: '10px',
        padding: '10px',
        backgroundColor: '#555',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
    });

    const response = fetch(`${BASEURL}/check-login-status`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer SSS155",
      },
      body: JSON.stringify({ loginResponse })
  })

  .then(response => response.json())
  .then(data => {
      if (data.is_login) {
          const jwtToken = data.user.new_jwt;
          sessionStorage.setItem('jwtToken', jwtToken);
          sessionStorage.setItem('content', textarea.value);
  
          const url = new URL(`${BASEURL}/vip`);
          url.searchParams.append('jwtToken', jwtToken);
  
          fetch(url, {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer SSS155`,
              },
          })
          .then(response => response.json())
          .then(data => {
              if (data.is_vip === true) {
                  textarea.value = sessionStorage.getItem('content');
              } else {
                  textarea.value = 'Premium Required';
              }
          })
          .catch((error) => {
              console.error('Error:', error);
              textarea.value = 'Error fetching VIP status';
          });
      } else {
          console.log("User is not logged in");
          textarea.value = 'Login required';
      }
  })
  .catch((error) => {
      console.error('Error fetching login status:', error);
      textarea.value = 'Error fetching login status';
  });

    saveButton.onmouseenter = () => {
        saveButton.style.transform = "scale(1.05)";
        saveButton.style.backgroundColor = "#666";
        saveButton.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
    };

    saveButton.onmouseleave = () => {
        saveButton.style.transform = "scale(1)";
        saveButton.style.backgroundColor = "#555";
        saveButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
    };

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    Object.assign(closeButton.style, {
        marginTop: '10px',
        padding: '10px',
        backgroundColor: '#ff0000',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
    });

    closeButton.onmouseenter = () => {
        closeButton.style.transform = "scale(1.05)";
        closeButton.style.backgroundColor = "#cc0000";
        closeButton.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
    };

    closeButton.onmouseleave = () => {
        closeButton.style.transform = "scale(1)";
        closeButton.style.backgroundColor = "#ff0000";
        closeButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
    };

    closeButton.addEventListener('click', () => {
        document.body.removeChild(overlayDiv);
    });

    
    overlayDiv.appendChild(textarea);
    overlayDiv.appendChild(saveButton);
    overlayDiv.appendChild(closeButton);
    document.body.appendChild(overlayDiv);
});





      
    function generateJSONL(messages, chatId) {
        let jsonlContent = messages
            .filter(msg => msg.role === "user" || msg.role === "assistant") 
            .map(msg => JSON.stringify({
                role: msg.role,
                content: msg.content,
                created_at: msg.createdAt
            }))
            .join("\n");
    
        const blob = new Blob([jsonlContent], { type: "application/jsonl" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `BetterSakuraMessage_${chatId}.jsonl`;
        link.click();
    }
    
    const extractChatsButtonAsTavernChats = document.createElement("button");
    extractChatsButtonAsTavernChats.textContent = "Extract Chats As Tavern JSONl";
    Object.assign(extractChatsButtonAsTavernChats.style, {
        width: "100%",
        height: "50px",
        margin: "10px 0",
        borderRadius: "8px",
        backgroundColor: "#555",
        color: "white",
        border: "none",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        fontSize: "16px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
        fontFamily: "Arial, sans-serif",
        transform: "scale(1)",
    });
    
    extractChatsButtonAsTavernChats.addEventListener("click", () => getMessages("jsonl"));

    extractChatsButtonAsTavernChats.onmouseenter = () => {
      extractChatsButtonAsTavernChats.style.transform = "scale(1.05)";
      extractChatsButtonAsTavernChats.style.backgroundColor = "#666";
      extractChatsButtonAsTavernChats.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
    };

    extractChatsButtonAsTavernChats.onmouseleave = () => {
      extractChatsButtonAsTavernChats.style.transform = "scale(1)";
      extractChatsButtonAsTavernChats.style.backgroundColor = "#555";
      extractChatsButtonAsTavernChats.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
    };

 
    var API = "https://api.sakura.fm/api/character/create"

async function fetchSessionAndJWT() {
  try {
      const sessionResponse = await fetch("https://clerk.sakura.fm/v1/client?__clerk_api_version=2024-10-01&_clerk_js_version=5.52.1", {
          method: 'GET',
          credentials: 'include'
      });

      if (!sessionResponse.ok) throw new Error('Failed to fetch session data');

      const sessionData = await sessionResponse.json();

      if (!sessionData.response || !Array.isArray(sessionData.response.sessions) || sessionData.response.sessions.length === 0) return;

      const sessionId = sessionData.response.sessions[0].id;
      sessionStorage.setItem("sessionId", sessionId);

      const tokenResponse = await fetch(`https://clerk.sakura.fm/v1/client/sessions/${sessionId}/tokens?__clerk_api_version=2024-10-01&_clerk_js_version=5.52.1`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
      });

      if (!tokenResponse.ok) throw new Error('Failed to fetch JWT token');

      const tokenData = await tokenResponse.json();

      if (!tokenData.jwt) return;

      sessionStorage.setItem("jwt", tokenData.jwt);
  } catch (error) {
      console.error("Error fetching session or JWT:", error);
  }
}


const bodyStyles = {
  fontFamily: "Baloo Da 2, sans-serif",
  backgroundImage: "url('background-image-url')",
  backgroundSize: "cover",
  color: "white",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  margin: "0",
  backgroundColor: "black",
  flexDirection: "column"
};

Object.assign(document.body.style, bodyStyles);

const ChangeJSON = document.createElement("button"); 
ChangeJSON.textContent = "Format json into character cards json for importing";
Object.assign(ChangeJSON.style, {
    width: "100%",
    height: "50px",
    margin: "10px 0",
    borderRadius: "8px",
    backgroundColor: "#555",
    color: "white",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontSize: "16px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
    fontFamily: "Arial, sans-serif",
    transform: "scale(1)"
});

ChangeJSON.onmouseenter = () => {
    ChangeJSON.style.transform = "scale(1.05)";
    ChangeJSON.style.backgroundColor = "#666";
    ChangeJSON.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
};

ChangeJSON.onmouseleave = () => {
    ChangeJSON.style.transform = "scale(1)";
    ChangeJSON.style.backgroundColor = "#555";
    ChangeJSON.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
};

ChangeJSON.onclick = () => {
  const modal = document.createElement("div");
  Object.assign(modal.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "400px",
      padding: "20px",
      backgroundColor: "black",
      color: "white",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
      borderRadius: "8px",
      textAlign: "center",
      fontFamily: "Baloo Da 2, sans-serif",
      zIndex: "9999999"
  });
  
  const closeButton = document.createElement("button");
  closeButton.textContent = "X";
  Object.assign(closeButton.style, {
      position: "absolute",
      top: "10px",
      right: "10px",
      background: "none",
      border: "none",
      fontSize: "16px",
      color: "white",
      cursor: "pointer"
  });
  closeButton.onclick = () => document.body.removeChild(modal);
  
  const inputBox = document.createElement("textarea");
  Object.assign(inputBox.style, {
      width: "100%",
      height: "200px",
      backgroundColor: "#222",
      color: "white",
      border: "1px solid white",
      padding: "10px",
      fontFamily: "Baloo Da 2, sans-serif"
  });
  inputBox.value = JSON.stringify({
      input: {
          tags: [],
          imageUri: "",
          name: "",
          description: "",
          persona: "",
          scenario: "",
          instructions: "",
          exampleConversation: [
              { role: "assistant", content: "", type: "text" },
              { role: "user", content: "", type: "text" }
          ],
          firstMessage: "",
          visibility: "",
          nsfw: false,
          genderIdentity: "",
          truncated: false
      }
  }, null, 2);
  
  const downloadButton = document.createElement("button");
  downloadButton.textContent = "Download";
  Object.assign(downloadButton.style, {
      marginTop: "10px",
      padding: "10px",
      backgroundColor: "#555",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontFamily: "Baloo Da 2, sans-serif"
  });
  downloadButton.onclick = () => {
      try {
          JSON.parse(inputBox.value);
      } catch (error) {
          window.alert("Invalid JSON format! Please correct the errors and try again.");
          return;
      }
      const blob = new Blob([inputBox.value], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "CharacterCard.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };
  
  modal.appendChild(closeButton);
  modal.appendChild(inputBox);
  modal.appendChild(downloadButton);
  document.body.appendChild(modal);
};


const ExtractSakuraCharacters = document.createElement("button");
ExtractSakuraCharacters.textContent = "Extract Sakura Characters";
Object.assign(ExtractSakuraCharacters.style, {
    width: "100%",
    height: "50px",
    margin: "10px 0",
    borderRadius: "8px",
    backgroundColor: "#555",
    color: "white",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontSize: "16px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
    fontFamily: "Arial, sans-serif",
    transform: "scale(1)"
});

ExtractSakuraCharacters.onmouseenter = () => {
    ExtractSakuraCharacters.style.transform = "scale(1.05)";
    ExtractSakuraCharacters.style.backgroundColor = "#666";
    ExtractSakuraCharacters.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
};

ExtractSakuraCharacters.onmouseleave = () => {
    ExtractSakuraCharacters.style.transform = "scale(1)";
    ExtractSakuraCharacters.style.backgroundColor = "#555";
    ExtractSakuraCharacters.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
};



ExtractSakuraCharacters.addEventListener("click", () => {
    const div = document.createElement("div");
    div.style.position = "fixed";
    div.style.top = "50%";
    div.style.left = "50%";
    div.style.transform = "translate(-50%, -50%)";
    div.style.backgroundColor = "#000";
    div.style.padding = "20px";
    div.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.3)";
    div.style.borderRadius = "8px";
    div.style.zIndex = "9999999";
    document.body.append(div);

    const closeButton = document.createElement("button");
    closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.border = "none";
    closeButton.style.cursor = "pointer";
    div.append(closeButton);

    closeButton.addEventListener("click", () => {
        document.body.removeChild(div);
    });

    const inputBox = document.createElement("input");
    inputBox.type = "text";
    inputBox.placeholder = "Enter Sakura URL (e.g., https://www.sakura.fm/chat/?id=...)";
    inputBox.style.width = "100%";
    inputBox.style.padding = "10px";
    inputBox.style.marginBottom = "10px";
    inputBox.style.borderRadius = "8px";
    inputBox.style.border = "1px solid #ccc";
    inputBox.style.backgroundColor = "#333"; 
    inputBox.style.color = "white";
    div.append(inputBox);

    const outputBox = document.createElement("textarea");
    outputBox.readOnly = true;
    outputBox.style.width = "100%";
    outputBox.style.height = "100px";
    outputBox.style.marginBottom = "10px";
    outputBox.style.padding = "10px";
    outputBox.style.borderRadius = "8px";
    outputBox.style.border = "1px solid #ccc";
    outputBox.style.backgroundColor = "#333"; 
    outputBox.style.color = "white";
    div.append(outputBox);

    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit";
    submitButton.style.width = "100%";
    submitButton.style.height = "40px";
    submitButton.style.backgroundColor = "#555";
    submitButton.style.color = "white";
    submitButton.style.border = "none";
    submitButton.style.cursor = "pointer";
    submitButton.style.borderRadius = "8px";
    div.append(submitButton);

    submitButton.addEventListener("click", () => {
        const url = inputBox.value;
        const jwtToken = sessionStorage.getItem("jwtToken");

        const regex = /^https:\/\/www\.sakura\.fm\/chat\/[A-Za-z0-9]+(\?id=[A-Za-z0-9]+)$/;

        if (!regex.test(url)) {
            alert("Invalid URL format. Please enter a URL like https://www.sakura.fm/chat/WnzNDJ5?id=4ZURxQm");
            return;
        }

        fetch(`${BASEURL}/ScrapeSakuraFm?url=${encodeURIComponent(url)}&jwtToken=${encodeURIComponent(jwtToken)}`, {
            method: "POST",
            headers: {
          "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            outputBox.value = JSON.stringify(data, null, 2);
        })
        .catch(error => {
            outputBox.value = "Error: " + error.message;
        });
    });
});

const FlowGPTScrape = document.createElement("button");
FlowGPTScrape.textContent = "Extract FlowGPT Characters";
Object.assign(FlowGPTScrape.style, {
    width: "100%",
    height: "50px",
    margin: "10px 0",
    borderRadius: "8px",
    backgroundColor: "#555",
    color: "white",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontSize: "16px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
    fontFamily: "Arial, sans-serif",
    transform: "scale(1)"
});

FlowGPTScrape.onmouseenter = () => {
    FlowGPTScrape.style.transform = "scale(1.05)";
    FlowGPTScrape.style.backgroundColor = "#666";
    FlowGPTScrape.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
};

FlowGPTScrape.onmouseleave = () => {
    FlowGPTScrape.style.transform = "scale(1)";
    FlowGPTScrape.style.backgroundColor = "#555";
    FlowGPTScrape.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
};

FlowGPTScrape.addEventListener("click", () => {
    const div = document.createElement("div");
    div.style.position = "fixed";
    div.style.top = "50%";
    div.style.left = "50%";
    div.style.transform = "translate(-50%, -50%)";
    div.style.backgroundColor = "#000";
    div.style.padding = "20px";
    div.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.3)";
    div.style.borderRadius = "8px";
    div.style.zIndex = "9999999";
    document.body.append(div);

    const closeButton = document.createElement("button");
    closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.border = "none";
    closeButton.style.cursor = "pointer";
    div.append(closeButton);

    closeButton.addEventListener("click", () => {
        document.body.removeChild(div);
    });

    const inputBox = document.createElement("input");
    inputBox.type = "text";
    inputBox.placeholder = "Enter FlowGPT URL (e.g., https://flowgpt.com/chat/zQXaVMlQiCpqaHYYpRKeb)";
    inputBox.style.width = "100%";
    inputBox.style.padding = "10px";
    inputBox.style.marginBottom = "10px";
    inputBox.style.borderRadius = "8px";
    inputBox.style.border = "1px solid #ccc";
    inputBox.style.backgroundColor = "#333"; 
    inputBox.style.color = "white";
    div.append(inputBox);

    const outputBox = document.createElement("textarea");
    outputBox.readOnly = true;
    outputBox.style.width = "100%";
    outputBox.style.height = "100px";
    outputBox.style.marginBottom = "10px";
    outputBox.style.padding = "10px";
    outputBox.style.borderRadius = "8px";
    outputBox.style.border = "1px solid #ccc";
    outputBox.style.backgroundColor = "#333"; 
    outputBox.style.color = "white";
    div.append(outputBox);

    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit";
    submitButton.style.width = "100%";
    submitButton.style.height = "40px";
    submitButton.style.backgroundColor = "#555";
    submitButton.style.color = "white";
    submitButton.style.border = "none";
    submitButton.style.cursor = "pointer";
    submitButton.style.borderRadius = "8px";
    div.append(submitButton);

    submitButton.addEventListener("click", () => {
        const url = inputBox.value;
        const jwtToken = sessionStorage.getItem("jwtToken");

        const regex = /^https:\/\/flowgpt\.com\/chat\/[A-Za-z0-9-]+$/;

        if (!regex.test(url)) {
            alert("Invalid URL format. Please enter a valid FlowGPT prompt URL.");
            return;
        }

        fetch(`${BASEURL}/ScrapeFlowGPT?url=${encodeURIComponent(url)}&jwtToken=${encodeURIComponent(jwtToken)}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            outputBox.value = JSON.stringify(data, null, 2);
        })
        .catch(error => {
            outputBox.value = "Error: " + error.message;
        });
    });
});

const ExtractCharacterAi = document.createElement("button");
ExtractCharacterAi.textContent = "Extract Character AI Characters";
Object.assign(ExtractCharacterAi.style, {
    width: "100%",
    height: "50px",
    margin: "10px 0",
    borderRadius: "8px",
    backgroundColor: "#555",
    color: "white",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontSize: "16px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
    fontFamily: "Arial, sans-serif",
    transform: "scale(1)"
});

ExtractCharacterAi.onmouseenter = () => {
    ExtractCharacterAi.style.transform = "scale(1.05)";
    ExtractCharacterAi.style.backgroundColor = "#666";
    ExtractCharacterAi.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
};

ExtractCharacterAi.onmouseleave = () => {
    ExtractCharacterAi.style.transform = "scale(1)";
    ExtractCharacterAi.style.backgroundColor = "#555";
    ExtractCharacterAi.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
};

ExtractCharacterAi.addEventListener("click", () => {
    const div = document.createElement("div");
    div.style.position = "fixed";
    div.style.top = "50%";
    div.style.left = "50%";
    div.style.transform = "translate(-50%, -50%)";
    div.style.backgroundColor = "#000";
    div.style.padding = "20px";
    div.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.3)";
    div.style.borderRadius = "8px";
    div.style.zIndex = "9999999";
    document.body.append(div);

    const closeButton = document.createElement("button");
    closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.border = "none";
    closeButton.style.cursor = "pointer";
    div.append(closeButton);

    closeButton.addEventListener("click", () => {
        document.body.removeChild(div);
    });

    const inputBox = document.createElement("input");
    inputBox.type = "text";
    inputBox.placeholder = "Enter Character AI URL";
    inputBox.style.width = "100%";
    inputBox.style.padding = "10px";
    inputBox.style.marginBottom = "10px";
    inputBox.style.borderRadius = "8px";
    inputBox.style.border = "1px solid #ccc";
    inputBox.style.backgroundColor = "#333";
    inputBox.style.color = "white";
    div.append(inputBox);

    const outputBox = document.createElement("textarea");
    outputBox.readOnly = true;
    outputBox.style.width = "100%";
    outputBox.style.height = "100px";
    outputBox.style.marginBottom = "10px";
    outputBox.style.padding = "10px";
    outputBox.style.borderRadius = "8px";
    outputBox.style.border = "1px solid #ccc";
    outputBox.style.backgroundColor = "#333";
    outputBox.style.color = "white";
    div.append(outputBox);

    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit";
    submitButton.style.width = "100%";
    submitButton.style.height = "40px";
    submitButton.style.backgroundColor = "#555";
    submitButton.style.color = "white";
    submitButton.style.border = "none";
    submitButton.style.cursor = "pointer";
    submitButton.style.borderRadius = "8px";
    div.append(submitButton);

    submitButton.addEventListener("click", () => {
        const url = inputBox.value;
        const jwtToken = sessionStorage.getItem("jwtToken");

        const regex = /^https:\/\/character\.ai\/chat\/[A-Za-z0-9_-]+$/;

        if (!regex.test(url)) {
            alert("Invalid URL format. Please enter a valid Character AI URL.");
            return;
        }

        fetch(`${BASEURL}/ScrapeCharacterAi?url=${encodeURIComponent(url)}&jwtToken=${encodeURIComponent(jwtToken)}`, {
            method: "POST",
            headers: {
          "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            outputBox.value = JSON.stringify(data, null, 2);
        })
        .catch(error => {
            outputBox.value = "Error: " + error.message;
        });
    });
});

const ExtractSpicyChat = document.createElement("button"); 
ExtractSpicyChat.textContent = "Extract Spicy Chat Characters";
Object.assign(ExtractSpicyChat.style, {
    width: "100%",
    height: "50px",
    margin: "10px 0",
    borderRadius: "8px",
    backgroundColor: "#555",
    color: "white",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontSize: "16px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
    fontFamily: "Arial, sans-serif",
    transform: "scale(1)"
});

ExtractSpicyChat.onmouseenter = () => {
    ExtractSpicyChat.style.transform = "scale(1.05)";
    ExtractSpicyChat.style.backgroundColor = "#666";
    ExtractSpicyChat.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
};

ExtractSpicyChat.onmouseleave = () => {
    ExtractSpicyChat.style.transform = "scale(1)";
    ExtractSpicyChat.style.backgroundColor = "#555";
    ExtractSpicyChat.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
};


ExtractSpicyChat.addEventListener("click", () => {
    const div = document.createElement("div");
    div.style.position = "fixed";
    div.style.top = "50%";
    div.style.left = "50%";
    div.style.transform = "translate(-50%, -50%)";
    div.style.backgroundColor = "#000";
    div.style.padding = "20px";
    div.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.3)";
    div.style.borderRadius = "8px";
    div.style.zIndex = "9999999";
    document.body.append(div);

    const closeButton = document.createElement("button");
    closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.border = "none";
    closeButton.style.cursor = "pointer";
    div.append(closeButton);

    closeButton.addEventListener("click", () => {
        document.body.removeChild(div);
    });

    const inputBox = document.createElement("input");
    inputBox.type = "text";
    inputBox.placeholder = "Enter Spicy Chat URL";
    inputBox.style.width = "100%";
    inputBox.style.padding = "10px";
    inputBox.style.marginBottom = "10px";
    inputBox.style.borderRadius = "8px";
    inputBox.style.border = "1px solid #ccc";
    inputBox.style.backgroundColor = "#333";
    inputBox.style.color = "white";
    div.append(inputBox);

    const outputBox = document.createElement("textarea");
    outputBox.readOnly = true;
    outputBox.style.width = "100%";
    outputBox.style.height = "100px";
    outputBox.style.marginBottom = "10px";
    outputBox.style.padding = "10px";
    outputBox.style.borderRadius = "8px";
    outputBox.style.border = "1px solid #ccc";
    outputBox.style.backgroundColor = "#333";
    outputBox.style.color = "white";
    div.append(outputBox);

    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit";
    submitButton.style.width = "100%";
    submitButton.style.height = "40px";
    submitButton.style.backgroundColor = "#555";
    submitButton.style.color = "white";
    submitButton.style.border = "none";
    submitButton.style.cursor = "pointer";
    submitButton.style.borderRadius = "8px";
    div.append(submitButton);

    submitButton.addEventListener("click", () => {
        const url = inputBox.value;
        const jwtToken = sessionStorage.getItem("jwtToken");

        const regex = /^https:\/\/(www\.)?spicychat\.(com|ai)\/chat\/[a-zA-Z0-9-]+$/;

        if (!regex.test(url)) {
            alert("Invalid URL format. Please enter a valid Spicy Chat URL like: https://www.spicychat.com/chat?chatID=632944");
            return;
        }

        fetch(`${BASEURL}/ScrapeSpicychat?url=${encodeURIComponent(url)}&jwtToken=${encodeURIComponent(jwtToken)}`, {
            method: "POST",
            headers: {
          "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            outputBox.value = JSON.stringify(data, null, 2);
        })
        .catch(error => {
            outputBox.value = "Error: " + error.message;
        });
    });
});


const ExtractAnimeGf = document.createElement("button");
ExtractAnimeGf.textContent = "Extract Anime GF Characters";
Object.assign(ExtractAnimeGf.style, {
    width: "100%",
    height: "50px",
    margin: "10px 0",
    borderRadius: "8px",
    backgroundColor: "#555",
    color: "white",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontSize: "16px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
    fontFamily: "Arial, sans-serif",
    transform: "scale(1)"
});

ExtractAnimeGf.onmouseenter = () => {
    ExtractAnimeGf.style.transform = "scale(1.05)";
    ExtractAnimeGf.style.backgroundColor = "#666";
    ExtractAnimeGf.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
};

ExtractAnimeGf.onmouseleave = () => {
    ExtractAnimeGf.style.transform = "scale(1)";
    ExtractAnimeGf.style.backgroundColor = "#555";
    ExtractAnimeGf.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
};


ExtractAnimeGf.addEventListener("click", () => {
    const div = document.createElement("div");
    div.style.position = "fixed";
    div.style.top = "50%";
    div.style.left = "50%";
    div.style.transform = "translate(-50%, -50%)";
    div.style.backgroundColor = "#000";
    div.style.padding = "20px";
    div.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.3)";
    div.style.borderRadius = "8px";
    div.style.zIndex = "999999";
    document.body.append(div);

    const closeButton = document.createElement("button");
    closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.border = "none";
    closeButton.style.cursor = "pointer";
    div.append(closeButton);

    closeButton.addEventListener("click", () => {
        document.body.removeChild(div);
    });

    const inputBox = document.createElement("input");
    inputBox.type = "text";
    inputBox.placeholder = "Enter Anime GF Chat URL";
    inputBox.style.width = "100%";
    inputBox.style.padding = "10px";
    inputBox.style.marginBottom = "10px";
    inputBox.style.borderRadius = "8px";
    inputBox.style.border = "1px solid #ccc";
    inputBox.style.backgroundColor = "#333";
    inputBox.style.color = "white";
    div.append(inputBox);

    const outputBox = document.createElement("textarea");
    outputBox.readOnly = true;
    outputBox.style.width = "100%";
    outputBox.style.height = "100px";
    outputBox.style.marginBottom = "10px";
    outputBox.style.padding = "10px";
    outputBox.style.borderRadius = "8px";
    outputBox.style.border = "1px solid #ccc";
    outputBox.style.backgroundColor = "#333";
    outputBox.style.color = "white";
    div.append(outputBox);

    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit";
    submitButton.style.width = "100%";
    submitButton.style.height = "40px";
    submitButton.style.backgroundColor = "#555";
    submitButton.style.color = "white";
    submitButton.style.border = "none";
    submitButton.style.cursor = "pointer";
    submitButton.style.borderRadius = "8px";
    div.append(submitButton);

    submitButton.addEventListener("click", () => {
        const url = inputBox.value;
        const jwtToken = sessionStorage.getItem("jwtToken");

        const regex = /^https:\/\/www\.anime\.gf\/chat\?chatID=\d+$/;

        if (!regex.test(url)) {
            alert("Invalid URL format. Please enter a valid Anime GF chat URL like: https://www.anime.gf/chat?chatID=632944");
            return;
        }

        fetch(`${BASEURL}/ScrapeAnimeChat?url=${encodeURIComponent(url)}&jwtToken=${encodeURIComponent(jwtToken)}`, {
            method: "POST",
            headers: {
          "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            outputBox.value = JSON.stringify(data, null, 2);
        })
        .catch(error => {
            outputBox.value = "Error: " + error.message;
        });
    });
});


const BulkCharacterImport = document.createElement("button");
BulkCharacterImport.textContent = "Bulk Send Characters";
Object.assign(BulkCharacterImport.style, {
    width: "100%",
    height: "50px",
    margin: "10px 0",
    borderRadius: "8px",
    backgroundColor: "#555",
    color: "white",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontSize: "16px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
    fontFamily: "Arial, sans-serif",
    transform: "scale(1)"
});

BulkCharacterImport.onmouseenter = () => {
    BulkCharacterImport.style.transform = "scale(1.05)";
    BulkCharacterImport.style.backgroundColor = "#666";
    BulkCharacterImport.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
};

BulkCharacterImport.onmouseleave = () => {
    BulkCharacterImport.style.transform = "scale(1)";
    BulkCharacterImport.style.backgroundColor = "#555";
    BulkCharacterImport.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
};

document.body.append(BulkCharacterImport);

BulkCharacterImport.addEventListener("click", () => {
  const modal = document.createElement("div");
  Object.assign(modal.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%) scale(0.9)",
    backgroundColor: "#2a2a2a",
    padding: "25px",
    borderRadius: "15px",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.8)",
    textAlign: "center",
    zIndex: "99999",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    opacity: "0",
    transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
  });
  
  setTimeout(() => {
    modal.style.opacity = "1";
    modal.style.transform = "translate(-50%, -50%) scale(1)";
  }, 10);
  
  const closeModal = () => {
    modal.style.opacity = "0";
    modal.style.transform = "translate(-50%, -50%) scale(0.9)";
    setTimeout(() => modal.remove(), 300);
  };
  
  const closeButton = document.createElement("button");
  closeButton.innerHTML = "&#10006;";
  Object.assign(closeButton.style, {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "transparent",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "35px",
    height: "35px",
    cursor: "pointer",
    fontSize: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.3s ease, transform 0.2s",
  });
  
  closeButton.addEventListener("mouseenter", () => {
    closeButton.style.background = "rgba(255, 0, 0, 0.6)";
    closeButton.style.transform = "scale(1.1)";
  });
  
  closeButton.addEventListener("mouseleave", () => {
    closeButton.style.background = "transparent";
    closeButton.style.transform = "scale(1)";
  });
  
  closeButton.addEventListener("click", () => closeModal());
  

  const dropZone = document.createElement("div");
  Object.assign(dropZone.style, {
    width: "100%",
    padding: "20px",
    margin: "10px 0",
    textAlign: "center",
    backgroundColor: "#333",
    color: "#fff",
    border: "2px dashed #888",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "background 0.3s, transform 0.2s",
    fontSize: "16px",
    fontFamily: "Arial, sans-serif",
  });
  
  dropZone.textContent = "Drag and drop JSON files here or click to select.";
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = "#444";
    dropZone.style.transform = "scale(1.02)";
  });
  dropZone.addEventListener("dragleave", () => {
    dropZone.style.backgroundColor = "#333";
    dropZone.style.transform = "scale(1)";
  });
  dropZone.addEventListener("drop", async (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = "#333";
    dropZone.style.transform = "scale(1)";
    handleFiles(e.dataTransfer.files);
  });
  dropZone.addEventListener("click", () => fileInput.click());
  
  const fileList = document.createElement("div");
  Object.assign(fileList.style, {
    marginTop: "10px",
    maxHeight: "150px",
    overflowY: "auto",
    textAlign: "left",
    color: "white",
    padding: "10px",
    backgroundColor: "#222",
    borderRadius: "8px",
    fontSize: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  });
  
  const uploadedFiles = new Set();
  const jsonDataArray = [];
  
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json";
  fileInput.multiple = true;
  fileInput.style.display = "none";
  fileInput.addEventListener("change", () => handleFiles(fileInput.files));
  
  function handleFiles(files) {
    let foundJson = false;
  
    Array.from(files).forEach((file) => {
      if (file.name.toLowerCase().endsWith(".json") && !uploadedFiles.has(file.name)) {
        uploadedFiles.add(file.name);
        foundJson = true;
  
        const fileItem = document.createElement("div");
        fileItem.textContent = file.name;
        Object.assign(fileItem.style, {
          padding: "8px",
          backgroundColor: "#444",
          borderRadius: "5px",
          whiteSpace: "nowrap",
        });
  
        fileList.appendChild(fileItem);
  
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const jsonData = JSON.parse(reader.result);
            if (isValidJson(jsonData)) {
              jsonDataArray.push(jsonData);
            }
          } catch {}
        };
        reader.readAsText(file);
      }
    });
  
    if (!foundJson) {
      window.alert("[ERROR]: ERR No valid JSON files found.");
    }
  }
  

  const buttonElement = document.createElement("button");
  buttonElement.textContent = "Submit";
  Object.assign(buttonElement.style, {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
    transition: "0.3s",
  });

  buttonElement.onmouseenter = () => {
    buttonElement.style.transform = "scale(1.05)";
    buttonElement.style.backgroundColor = "#0056b3";
  };

  buttonElement.onmouseleave = () => {
    buttonElement.style.transform = "scale(1)";
    buttonElement.style.backgroundColor = "#007BFF";
  };

  modal.append(closeButton, dropZone, fileList, buttonElement);
  document.body.append(modal);

async function checkVipStatus() {
  try {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) {
      window.alert("[ERROR]: ERR An error happened, please screenshot or send this error to the discord thread post. {Missing JWT token}");
      return false;
    }

    const jwtToken = sessionStorage.getItem('jwtToken');

    const url = new URL(`${BASEURL}/vip`);
    url.searchParams.append('jwtToken', jwtToken);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer SSS155',
      }
    });
    const vipData = await response.json();

    if (vipData.is_vip) {
      return true;
    } else {
      window.alert("[ERROR]: ERR You are not a VIP user. Access denied.");
      return false;
    }
  } catch (error) {
    console.error("VIP check error:", error);
    window.alert(`[ERROR]: ERR An error happened, please screenshot or send this error to the discord thread post. {${error.message}}`);
    return false;
  }
}

buttonElement.addEventListener("click", async () => {
  const isVip = await checkVipStatus();
  if (!isVip) return;

  if (!jsonDataArray.length) {
    window.alert("[ERROR]: ERR An error happened, please screenshot or send this error to the discord thread post. {No valid JSON files found}");
    return;
  }

  try {
    await fetchSessionAndJWT();
    const token = sessionStorage.getItem("jwt");
    if (!token) {
      window.alert("[ERROR]: ERR An error happened, please screenshot or send this error to the discord thread post. {Missing JWT token}");
      return;
    }

    const characterIds = [];

    const requests = jsonDataArray.map(async (jsonData) => {
      if (!isValidJson(jsonData)) {
        console.error("Invalid JSON format:", jsonData);
        return;
      }

      try {
        const response = await fetch(`${API}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(jsonData),
          credentials: "include",
        });

        const result = await response.json();
        if (result.success && result.characterId) {
          characterIds.push(result.characterId);
        }
      } catch (error) {
        console.error("[ERROR]:Error sending request:", error);
        window.alert(`[ERROR]: ERR An error happened, please screenshot or send this error to the discord thread post. {${error.message}}`);
      }
    });

    await Promise.all(requests);

    if (characterIds.length > 0) {
      alert(
        `[SUCCESS]: Character mass import success, visit your characters at {"success":true,"characterId":"${characterIds.join(", ")}"}`
      );
    } else {
      alert("[ERROR]: ERR An error happened, please screenshot or send this error to the discord thread post. {Character mass import failed}");
    }
  } catch (error) {
    console.error("[ERROR]: Unexpected error:", error);
    window.alert(`[ERROR]: ERR An error happened, please screenshot or send this error to the discord thread post. ${error.message}`);
  }
});


});
  

function isValidJson(json) {
  if (
    typeof json !== "object" ||
    !json.input ||
    typeof json.input !== "object"
  ) {
    return false;
  }

  const requiredKeys = {
    tags: "array",
    imageUri: "string",
    name: "string",
    description: "string",
    persona: "string",
    scenario: "string",
    instructions: "string",
    exampleConversation: "array",
    firstMessage: "string",
    visibility: "string",
    nsfw: "boolean",
    genderIdentity: "string",
    truncated: "boolean",
  };

  for (const key in requiredKeys) {
    if (
      !(key in json.input) ||
      (requiredKeys[key] === "array" && !Array.isArray(json.input[key])) ||
      (requiredKeys[key] !== "array" && typeof json.input[key] !== requiredKeys[key])
    ) {
      return false;
    }
  }

  if (
    !json.input.exampleConversation.every(
      (conv) =>
        typeof conv === "object" &&
        ["assistant", "user"].includes(conv.role) &&
        typeof conv.content === "string" &&
        conv.type === "text"
    )
  ) {
    return false;
  }

  return true;
}

 
  function generateJSON(messages, chatId) {
      const filteredMessages = messages
          .filter(msg => msg.role === "user" || msg.role === "assistant")
          .map(msg => ({
              role: msg.role,
              content: msg.content,
              created_at: msg.createdAt
          }));
  
      const jsonContent = JSON.stringify({ messages: filteredMessages }, null, 2);
  
      const blob = new Blob([jsonContent], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `BetterSakuraMessage_${chatId}.json`;
      link.click();
  }
  
  const extractChatsButtonAsJSON = document.createElement("button");
  extractChatsButtonAsJSON.textContent = "Extract Chats into JSON";
  Object.assign(extractChatsButtonAsJSON.style, {
      width: "100%",
      height: "50px",
      margin: "10px 0",
      borderRadius: "8px",
      backgroundColor: "#555",
      color: "white",
      border: "none",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      fontSize: "16px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
      fontFamily: "Arial, sans-serif",
      transform: "scale(1)",
  });
  
  extractChatsButtonAsJSON.addEventListener("click", () => getMessages('json'));

  extractChatsButtonAsJSON.onmouseenter = () => {
    extractChatsButtonAsJSON.style.transform = "scale(1.05)";
    extractChatsButtonAsJSON.style.backgroundColor = "#666";
    extractChatsButtonAsJSON.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
  };

  extractChatsButtonAsJSON.onmouseleave = () => {
    extractChatsButtonAsJSON.style.transform = "scale(1)";
    extractChatsButtonAsJSON.style.backgroundColor = "#555";
    extractChatsButtonAsJSON.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
  };
  

function generateTXT(messages, chatId) {
    const now = new Date();
    const timestamp = now.toISOString();

    let txtContent = "<START>\n";

    messages
        .filter(msg => msg.role === "user" || msg.role === "assistant")
        .forEach(msg => {
            const character = msg.role === "user" ? "USER" : "CHARACTER";
            const characterName = msg.role === "user" ? "USER" : "ASSISTANT";
            txtContent += `<${character}: ${characterName}>: ${msg.content}\n`;
        });

    txtContent += `<END_CREATEDTIME: ${timestamp}, MADEBY: BETTER SAKURA>\n`;

    const blob = new Blob([txtContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `BetterSakuraMessage_${chatId}.txt`;
    link.click();
}

const extractChatsButtonAsTXT = document.createElement("button");
extractChatsButtonAsTXT.textContent = "Extract Chats into TXT";
Object.assign(extractChatsButtonAsTXT.style, {
    width: "100%",
    height: "50px",
    margin: "10px 0",
    borderRadius: "8px",
    backgroundColor: "#555",
    color: "white",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    fontSize: "16px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
    fontFamily: "Arial, sans-serif",
    transform: "scale(1)",
});

extractChatsButtonAsTXT.addEventListener("click", () => getMessages('txt'));

extractChatsButtonAsTXT.onmouseenter = () => {
  extractChatsButtonAsTXT.style.transform = "scale(1.05)";
  extractChatsButtonAsTXT.style.backgroundColor = "#666";
  extractChatsButtonAsTXT.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
};

extractChatsButtonAsTXT.onmouseleave = () => {
  extractChatsButtonAsTXT.style.transform = "scale(1)";
  extractChatsButtonAsTXT.style.backgroundColor = "#555";
  extractChatsButtonAsTXT.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
};

function createMemoryManagerOverlay() {
  const MemoryManagerOverlay = document.createElement("div");
  Object.assign(MemoryManagerOverlay.style, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      zIndex: 99999,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      opacity: "0",
      transition: "opacity 0.3s ease",
  });
  setTimeout(() => MemoryManagerOverlay.style.opacity = "1", 10);

  const container = document.createElement("div");
  Object.assign(container.style, {
      backgroundColor: "#333",
      padding: "20px",
      borderRadius: "12px",
      width: "70%",
      maxWidth: "700px",
      minHeight: "400px",
      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.7)",
      overflowY: "auto",
      color: "#fff",
      textAlign: "center",
      position: "relative",
      transform: "scale(0.9)",
      transition: "transform 0.3s ease-in-out",
  });
  setTimeout(() => container.style.transform = "scale(1)", 100);

  const header = document.createElement("h2");
  header.textContent = "Memory Manager";
  header.style.marginBottom = "20px";
  header.style.fontSize = "24px";
  header.style.fontWeight = "bold";

  const textAreaWrapper = document.createElement("div");
  const addButton = document.createElement("button");
  addButton.textContent = "Add New";
  Object.assign(addButton.style, {
      marginTop: "10px",
      padding: "12px 24px",
      backgroundColor: "#555",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "16px",
      transition: "background-color 0.3s ease, transform 0.3s ease",
  });

  addButton.addEventListener("click", () => {
      createNewTextArea();
  });

  const saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  Object.assign(saveButton.style, {
      marginTop: "20px",
      padding: "12px 24px",
      backgroundColor: "#28a745",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      fontSize: "16px",
      transition: "background-color 0.3s ease, transform 0.3s ease",
  });

  saveButton.addEventListener("click", () => {
      saveContent();
  });

  const closeButton = document.createElement("button");
  closeButton.textContent = "×";
  Object.assign(closeButton.style, {
      position: "absolute",
      top: "10px",
      right: "10px",
      padding: "8px",
      color: "#fff",
      border: "none",
      borderRadius: "50%",
      fontSize: "24px",
      cursor: "pointer",
      zIndex: 1000,
      transition: "transform 0.3s ease",
  });

  closeButton.addEventListener("click", () => {
      MemoryManagerOverlay.style.opacity = "0";
      setTimeout(() => {
          document.body.removeChild(MemoryManagerOverlay);
      }, 300);
  });

  closeButton.onmouseenter = () => {
      closeButton.style.transform = "rotate(90deg)";
  };

  closeButton.onmouseleave = () => {
      closeButton.style.transform = "rotate(0deg)";
  };

  container.appendChild(header);
  container.appendChild(textAreaWrapper);
  container.appendChild(addButton);
  container.appendChild(saveButton);
  container.appendChild(closeButton);

  MemoryManagerOverlay.appendChild(container);
  document.body.appendChild(MemoryManagerOverlay);

  let showMoreButton;
  function createNewTextArea(content = "") {
      const textAreaDiv = document.createElement("div");
      Object.assign(textAreaDiv.style, {
          marginTop: "15px",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          transition: "transform 0.3s ease",
      });

      const textArea = document.createElement("textarea");
      textArea.value = content;
      Object.assign(textArea.style, {
          width: "100%",
          height: "120px",
          padding: "12px",
          borderRadius: "5px",
          border: "1px solid #555",
          fontSize: "14px",
          backgroundColor: "#222",
          color: "#fff",
          marginBottom: "10px",
          transition: "border-color 0.3s ease, background-color 0.3s ease",
      });

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      Object.assign(deleteButton.style, {
          padding: "8px 16px",
          backgroundColor: "#d9534f",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "14px",
          transition: "background-color 0.3s ease, transform 0.3s ease",
      });

      deleteButton.addEventListener("click", () => {
          textAreaDiv.remove();
          saveContent();
      });

      textAreaDiv.appendChild(textArea);
      textAreaDiv.appendChild(deleteButton);
      textAreaWrapper.appendChild(textAreaDiv);
      saveContent();

      if (textAreaWrapper.children.length > 3) {
          if (!showMoreButton) {
              showMoreButton = document.createElement("button");
              showMoreButton.textContent = "Show More";
              Object.assign(showMoreButton.style, {
                  marginTop: "10px",
                  padding: "12px 24px",
                  backgroundColor: "#0056b3",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "16px",
                  transition: "background-color 0.3s ease, transform 0.3s ease",
              });

              showMoreButton.addEventListener("click", () => {
                  Array.from(textAreaWrapper.children).forEach((child, index) => {
                      if (index >= 3) child.style.display = "block";
                  });
                  showMoreButton.style.display = "none";
              });

              container.appendChild(showMoreButton);
          }

          Array.from(textAreaWrapper.children).forEach((child, index) => {
              if (index >= 3) child.style.display = "none";
          });
      }
  }

  function saveContent() {
    const allContent = [];
    
    textAreaWrapper.querySelectorAll("textarea").forEach((ta) => {
        allContent.push(ta.value);
    });

    localStorage.setItem("memoryManagerContent", JSON.stringify(allContent));

    chrome.runtime.sendMessage(
        { action: "saveContent", content: allContent },
        (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error during message passing:", chrome.runtime.lastError.message);
                return;
            }

            if (response && response.success) {
                console.log("Content saved to background script.");
            } else {
                console.error("Failed to save content:", response ? response.error : "Unknown error");
            }
        }
    );
}



  const savedContent = JSON.parse(localStorage.getItem("memoryManagerContent") || "[]");
  savedContent.forEach((content) => {
      createNewTextArea(content);
  });
}

const memoryManagerButton = document.createElement("button");
memoryManagerButton.textContent = "Memory Manager";
Object.assign(memoryManagerButton.style, {
  width: "100%",
  height: "50px",
  margin: "10px 0",
  borderRadius: "8px",
  backgroundColor: "#555",
  color: "white",
  border: "none",
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  fontSize: "16px",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)",
  fontFamily: "Arial, sans-serif",
  transform: "scale(1)",
});

memoryManagerButton.addEventListener("click", createMemoryManagerOverlay);

memoryManagerButton.onmouseenter = () => {
  memoryManagerButton.style.transform = "scale(1.05)";
  memoryManagerButton.style.backgroundColor = "#666";
  memoryManagerButton.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
};

memoryManagerButton.onmouseleave = () => {
  memoryManagerButton.style.transform = "scale(1)";
  memoryManagerButton.style.backgroundColor = "#555";
  memoryManagerButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
};

        const extractCharacterButton = document.createElement("button");
        extractCharacterButton.textContent = "Extract Character";
        extractCharacterButton.style.width = "100%";
        extractCharacterButton.style.height = "50px";
        extractCharacterButton.style.margin = "10px 0";
        extractCharacterButton.style.borderRadius = "8px";
        extractCharacterButton.style.backgroundColor = "#ff4d4d";
        extractCharacterButton.style.color = "white";
        extractCharacterButton.style.border = "none";
        extractCharacterButton.style.cursor = "pointer";
        extractCharacterButton.style.transition =
          "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
        extractCharacterButton.style.fontSize = "16px";
        extractCharacterButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
        extractCharacterButton.style.fontFamily = "Arial, sans-serif";
        extractCharacterButton.style.transform = "scale(1)";
  
        document.body.appendChild(extractCharacterButton);
  
        extractCharacterButton.addEventListener("click", () => {
          extractCharacterData();
        });
  
        function extractCharacterData() {
          const groupElements = document.querySelectorAll(
            "div.flex.flex-col.space-y-6.pt-6",
          );
          const results = [];
  
          groupElements.forEach((group) => {
            const textMutedClass3 = group.querySelectorAll(
              ".text-muted-foreground.line-clamp-3",
            );
            const textMutedClass2 = group.querySelectorAll(
              ".text-muted-foreground.line-clamp-2",
            );
            const textMutedClass5 = group.querySelectorAll(
              ".text-muted-foreground.line-clamp-5",
            );
  
            const groupResult = {
              lineClamp3: [],
              lineClamp2: [],
              lineClamp5: [],
            };
  
            const extractElementInfo = (elements) => {
              return Array.from(elements).map((element) => {
                return {
                  tagName: element.tagName.toLowerCase(),
                  textContent: element.textContent.trim(),
                };
              });
            };
  
            groupResult.lineClamp3 = extractElementInfo(textMutedClass3);
            groupResult.lineClamp2 = extractElementInfo(textMutedClass2);
            groupResult.lineClamp5 = extractElementInfo(textMutedClass5);
  
            results.push(groupResult);
          });
  
          const jsonContent = JSON.stringify(results, null, 2);
  
          const blob = new Blob([jsonContent], { type: "application/json" });
  
          const downloadLink = document.createElement("a");
          downloadLink.href = URL.createObjectURL(blob);
          downloadLink.download = "data.json";
          downloadLink.style.display = "none";
  
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
  
        const textEditorButton = document.createElement("button");
        Object.assign(textEditorButton, {
          textContent: "🔄 Text Editor",
          style:
            "width: 100%; height: 50px; margin: 10px 0; border-radius: 8px; background-color: #555; color: white; border: none; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-size: 16px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5); font-family: Arial, sans-serif; transform: scale(1);",
        });
  
        textEditorButton.addEventListener("click", () => {
          createTextEditorOverlay();
        });
  
        overlayContent.appendChild(textEditorButton);
  
        function createTextEditorOverlay() {
          const overlay = document.createElement("div");
          Object.assign(overlay, {
            style:
              "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(0, 0, 0, 0.7); display: flex; justify-content: center; align-items: center; z-index: 9999999999;",
          });
  
          const container = document.createElement("div");
          Object.assign(container, {
            style:
              "background-color: black; padding: 20px; border-radius: 8px; width: 400px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);",
          });
  
          const apostropheColorLabel = document.createElement("label");
          apostropheColorLabel.textContent = "Change Apostrophe Color";
          const apostropheColorInput = document.createElement("input");
          Object.assign(apostropheColorInput, {
            type: "color",
            style: "width: 100%; margin: 10px 0;",
            value: localStorage.getItem("apostropheColor") || "#000000",
          });
  
          const italicsColorLabel = document.createElement("label");
          italicsColorLabel.textContent = "Change Italic Color";
          const italicsColorInput = document.createElement("input");
          Object.assign(italicsColorInput, {
            type: "color",
            style: "width: 100%; margin: 10px 0;",
            value: localStorage.getItem("italicsColor") || "#000000",
          });
  
          const fontBoldColorLabel = document.createElement("label");
          fontBoldColorLabel.textContent = "Change Font Bold Color";
          const fontBoldColorInput = document.createElement("input");
          Object.assign(fontBoldColorInput, {
            type: "color",
            style: "width: 100%; margin: 10px 0;",
            value: localStorage.getItem("fontBoldColor") || "#000000",
          });
  
          const markdownLabel = document.createElement("label");
          markdownLabel.textContent = "Activate Markdown";
          const markdownCheckbox = document.createElement("input");
          Object.assign(markdownCheckbox, {
            type: "checkbox",
            style: "margin: 10px 0;",
            checked: JSON.parse(localStorage.getItem("markdownActive")) || false,
          });
  
          const submitButton = document.createElement("button");
          Object.assign(submitButton, {
            textContent: "Apply Changes",
            style:
              "width: 100%; height: 40px; background-color: #2196F3; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; transition: background-color 0.3s; margin: 10px 0;",
          });
  
          submitButton.addEventListener("click", () => {
            const choices = {
              apostropheColor: apostropheColorInput.value,
              italicsColor: italicsColorInput.value,
              fontBoldColor: fontBoldColorInput.value,
              markdownActive: markdownCheckbox.checked,
            };
  
            saveToLocalStorage(choices);
            applyChanges(choices);
            document.body.removeChild(overlay);
          });
  
          container.appendChild(apostropheColorLabel);
          container.appendChild(apostropheColorInput);
          container.appendChild(italicsColorLabel);
          container.appendChild(italicsColorInput);
          container.appendChild(fontBoldColorLabel);
          container.appendChild(fontBoldColorInput);
          container.appendChild(markdownLabel);
          container.appendChild(markdownCheckbox);
          container.appendChild(submitButton);
  
          overlay.appendChild(container);
          document.body.appendChild(overlay);
        }
        function saveToLocalStorage({
          apostropheColor,
          italicsColor,
          fontBoldColor,
          markdownActive,
        }) {
          localStorage.setItem("apostropheColor", apostropheColor);
          localStorage.setItem("italicsColor", italicsColor);
          localStorage.setItem("fontBoldColor", fontBoldColor);
          localStorage.setItem("markdownActive", JSON.stringify(markdownActive));
        }
  
        function applyChanges({
          apostropheColor,
          italicsColor,
          fontBoldColor,
          markdownActive,
        }) {
          const targetElement = document.querySelector(
            ".max-w-page.px-page.md\\:px-page-md.mx-auto.w-full.pb-6.pt-8.max-md\\:pt-6.flex.flex-col",
          );
          if (targetElement) {
            const divs = targetElement.querySelectorAll(
              "div.flex.flex-row.items-start.gap-4.max-md\\:gap-3.py-2",
            );
            divs.forEach((div) => {
              const buttons = div.querySelectorAll("button");
              buttons.forEach((button) => {
                const spans = button.querySelectorAll("span");
  
                spans.forEach((span) => {
                  if (span.textContent.includes("'")) {
                    span.style.color = apostropheColor;
                  }
                });
  
                const shouldStyleButton = Array.from(spans).every((span) => {
                  return (
                    !span.classList.contains("italic") &&
                    !span.classList.contains("opacity-60") &&
                    !span.classList.contains("font-bold")
                  );
                });
                if (shouldStyleButton) {
                  spans.forEach((span) => {
                    if (span.classList.contains("italic")) {
                      span.style.color = italicsColor;
                    }
                  });
                }
  
                spans.forEach((span) => {
                  if (span.classList.contains("font-bold")) {
                    span.style.color = fontBoldColor;
                  }
                });
  
                if (markdownActive) {
                  spans.forEach((span) => {
                    if (span.textContent.includes("```")) {
                      span.style.backgroundColor = "black";
                      span.style.color = "white";
                    }
                  });
                }
              });
            });
          }
        }
  
        window.addEventListener("load", () => {
          const savedChoices = {
            apostropheColor: localStorage.getItem("apostropheColor") || "#000000",
            italicsColor: localStorage.getItem("italicsColor") || "#000000",
            fontBoldColor: localStorage.getItem("fontBoldColor") || "#000000",
            markdownActive:
              JSON.parse(localStorage.getItem("markdownActive")) || false,
          };
          applyChanges(savedChoices);
        });
  
        overlayContent.appendChild(textEditorButton);
  
        function checkForTargetElement() {
          const outerSelector =
            ".flex.h-max.min-h-full.flex-1.flex-col.justify-between.gap-10.pb-8";
          const outerDiv = document.querySelector(outerSelector);
          if (!outerDiv) return;
  
          const midSelector = ".max-md\\:text-ms";
          const midDiv = outerDiv.querySelector(midSelector);
          if (!midDiv) return;
  
          const innerSelector = ".flex.flex-col.space-y-6.pt-6";
          const innerDiv = midDiv.querySelector(innerSelector);
          if (!innerDiv) return;
  
          const targetSelector = ".text-muted-foreground.line-clamp-2";
          const targetElement = innerDiv.querySelector(targetSelector);
          if (!targetElement) return;
  
          let clickCount = 0;
          let lastClickTime = 0;
          const clickThreshold = 500;
  
          targetElement.addEventListener("click", () => {
            const now = Date.now();
            if (now - lastClickTime < clickThreshold) {
              clickCount++;
            } else {
              clickCount = 1;
            }
            lastClickTime = now;
            if (!targetElement.isContentEditable) {
              targetElement.style.border = "1px dashed #000";
              targetElement.contentEditable = "true";
              targetElement.focus();
            }
          });
  
          targetElement.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              localStorage.setItem(
                "editableContent_" + window.location.href,
                targetElement.innerHTML,
              );
              targetElement.contentEditable = "false";
              targetElement.style.border = "";
  
              const divs = document.querySelectorAll("div");
              divs.forEach((div) => div.remove()); // Close and remove all divs after content has been set
            }
          });
  
          const buttonSelector =
            "button.inline-flex.items-center.justify-center.rounded-full.text-sm.transition-colors.focus-visible\\:outline-none.disabled\\:pointer-events-none.disabled\\:opacity-50.select-none.border.border-input.bg-transparent.shadow-sm.hover\\:bg-accent.hover\\:text-accent-foreground.active\\:bg-accent.active\\:text-accent-foreground.h-9.w-9";
          const buttonElement = document.querySelector(buttonSelector);
          if (!buttonElement) return;
  
          buttonElement.addEventListener("click", () => {
            const divWithSpaceY = buttonElement.querySelector("div.space-y-2");
            if (!divWithSpaceY) return;
  
            const textarea = divWithSpaceY.querySelector(
              'textarea.placeholder\\:text-muted-foreground.flex.min-h-\\[60px\\].w-full.rounded-lg.border.bg-transparent.px-3.py-2.text-sm.shadow-sm.focus-visible\\:outline-none.disabled\\:cursor-not-allowed.disabled\\:opacity-50.border-blue-500[name="customName"]',
            );
            if (!textarea) return;
  
            const content = textarea.value;
            targetElement.innerHTML = content;
          });
  
          const SecondbuttonSelector =
            "button.inline-flex.items-center.justify-center.rounded-full.text-sm.transition-colors.focus-visible\\:outline-none.disabled\\:pointer-events-none.disabled\\:opacity-50.select-none.border.border-input.bg-transparent.shadow-sm.hover\\:bg-accent.hover\\:text-accent-foreground.active\\:bg-accent.active\\:text-accent-foreground.h-9.w-9";
          const SecondbuttonElement =
            document.querySelector(SecondbuttonSelector);
  
          if (!SecondbuttonElement) {
            return;
          }
  
          SecondbuttonElement.click();
  
          setTimeout(() => {
            const divs = document.querySelectorAll("div");
            let popupFound = false;
  
            divs.forEach((div) => {
              if (div.offsetWidth > 0 && div.offsetHeight > 0) {
                popupFound = true;
  
                const textarea = div.querySelector(
                  'textarea.placeholder\\:text-muted-foreground.flex.min-h-\\[60px\\].w-full.rounded-lg.border.bg-transparent.px-3.py-2.text-sm.shadow-sm.focus-visible\\:outline-none.disabled\\:cursor-not-allowed.disabled\\:opacity-50.border-blue-500[name="customName"]',
                );
                if (textarea) {
                  const content = textarea.value;
  
                  const outerSelector =
                    ".flex.h-max.min-h-full.flex-1.flex-col.justify-between.gap-10.pb-8";
                  const outerDiv = document.querySelector(outerSelector);
                  if (!outerDiv) return;
                  const midSelector = ".max-md\\:text-ms";
                  const midDiv = outerDiv.querySelector(midSelector);
                  if (!midDiv) return;
                  const innerSelector = ".flex.flex-col.space-y-6.pt-6";
                  const innerDiv = midDiv.querySelector(innerSelector);
                  if (!innerDiv) return;
                  const targetSelector = ".text-muted-foreground.line-clamp-2";
                  const targetElement = innerDiv.querySelector(targetSelector);
                  if (!targetElement) return;
  
                  targetElement.innerHTML = content;
                }
              }
            });
  
            if (!popupFound) {
              return;
            }
          }, 500);
        }

const button = document.createElement('button');
button.textContent = "Open Overlay";
button.style.cssText = 'padding: 10px 20px; font-size: 16px; background-color: #4CAF50; color: white; border: none; cursor: pointer; z-index: 99999;';

const overlay = document.createElement('div');
overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: none; justify-content: center; align-items: center; z-index: 99999;';
document.body.appendChild(overlay);

const FandomcharOverlay = document.createElement('div');
FandomcharOverlay.style.cssText = 'background-color: white; padding: 20px; border-radius: 8px; width: 80%; max-width: 400px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); z-index: 99999;';
overlay.appendChild(FandomcharOverlay);

const header = document.createElement('h1');
header.textContent = "Add Fandom characters here (One only for free users)";
header.style.cssText = 'font-size: 18px; color: #333; margin-bottom: 10px;';
FandomcharOverlay.appendChild(header);

const fandomUrlInput = document.createElement('input');
fandomUrlInput.placeholder = 'Enter Fandom URL';
fandomUrlInput.style.cssText = 'width: 100%; padding: 10px; font-size: 16px; border-radius: 8px; border: 1px solid #ccc; margin-bottom: 10px;';
FandomcharOverlay.appendChild(fandomUrlInput);

const textarea = document.createElement('textarea');
textarea.style.cssText = 'width: 100%; height: 100px; border-radius: 8px; border: 1px solid #ccc; padding: 10px; font-size: 16px;';
FandomcharOverlay.appendChild(textarea);

const sendButton = document.createElement('button');
sendButton.textContent = "Send";
sendButton.style.cssText = 'width: 100%; height: 40px; border-radius: 8px; background-color: #555; color: white; border: none; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-size: 16px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5); z-index: 99999;';
FandomcharOverlay.appendChild(sendButton);

button.addEventListener('click', () => {
  overlay.style.display = 'flex';
});

sendButton.addEventListener('click', async () => {
  const fandomUrl = fandomUrlInput.value.trim();
  const inputText = textarea.value.trim();

  if (fandomUrl && inputText) {
    overlay.style.display = 'none';
    await fetchVipStatusAndSendData(fandomUrl, inputText);
  } else {
    alert('Please fill out all fields!');
  }
});

const fetchVipStatusAndSendData = async (fandomUrl, inputText) => {
  try {
    const vipResponse = await fetch(`${BASEURL}/vip`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer SSS155`,
      }
    });

    if (!vipResponse.ok) {
      throw new Error('Failed to fetch VIP status');
    }

    const vipData = await vipResponse.json();
    const is_vip = vipData.is_vip;

    chrome.storage.local.get(['name'], async (result) => {
      const userName = result.name || '';

      const requestData = {
        fandomUrl,
        is_vip,
        userName,
        inputText
      };

      const response = await fetch(`${BASEURL}/Character-Extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer SSS155`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch the data');
      }

      const data = await response.json();
      console.log('Extracted content:', data);
    });
  } catch (error) {
    console.error('Error:', error);
  }
};

// ADD BUlk character here 


  
        const RenameChats = document.createElement("button");
  
        Object.assign(RenameChats, {
          textContent: "🔄 Rename Chats",
          style:
            "width: 100%; height: 50px; margin: 10px 0; border-radius: 8px; background-color: #555; color: white; border: none; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); font-size: 16px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5); font-family: Arial, sans-serif; transform: scale(1);",
        });
  
        document.body.appendChild(RenameChats);
  
        RenameChats.addEventListener("click", checkForTargetElement);
  
        const converterButton = document.createElement("button");
        converterButton.textContent = "🔄 Text Converter";
        converterButton.style.width = "100%";
        converterButton.style.height = "50px";
        converterButton.style.margin = "10px 0";
        converterButton.style.borderRadius = "8px";
        converterButton.style.backgroundColor = "#555";
        converterButton.style.color = "white";
        converterButton.style.border = "none";
        converterButton.style.cursor = "pointer";
        converterButton.style.transition =
          "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
        converterButton.style.fontSize = "16px";
        converterButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
        converterButton.style.fontFamily = "Arial, sans-serif";
        converterButton.style.transform = "scale(1)";
  
        converterButton.onmouseenter = () => {
          converterButton.style.transform = "scale(1.05)";
          converterButton.style.backgroundColor = "#666";
          converterButton.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
        };
  
        converterButton.onmouseleave = () => {
          converterButton.style.transform = "scale(1)";
          converterButton.style.backgroundColor = "#555";
          converterButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
        };
  
        converterButton.onclick = () => {
          const overlay = document.createElement("div");
          overlay.style.position = "fixed";
          overlay.style.top = "0";
          overlay.style.left = "0";
          overlay.style.width = "100%";
          overlay.style.height = "100%";
          overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
          overlay.style.display = "flex";
          overlay.style.justifyContent = "center";
          overlay.style.alignItems = "center";
          overlay.style.zIndex = "10000";
  
          const container = document.createElement("div");
          container.style.backgroundColor = "#2c3e50";
          container.style.padding = "30px";
          container.style.borderRadius = "15px";
          container.style.display = "flex";
          container.style.flexDirection = "column";
          container.style.gap = "15px";
          container.className = "animate__animated animate__fadeInDown";
          container.classList.add("converter-container");
  
          const createConverterUI = (title, color) => {
            const converterOverlay = document.createElement("div");
            converterOverlay.style.position = "fixed";
            converterOverlay.style.top = "0";
            converterOverlay.style.left = "0";
            converterOverlay.style.width = "100%";
            converterOverlay.style.height = "100%";
            converterOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
            converterOverlay.style.display = "flex";
            converterOverlay.style.justifyContent = "center";
            converterOverlay.style.alignItems = "center";
            converterOverlay.style.zIndex = "10001";
            converterOverlay.className = "animate__animated animate__fadeIn";
  
            const converterContainer = document.createElement("div");
            converterContainer.style.backgroundColor = color;
            converterContainer.style.padding = "40px";
            converterContainer.style.borderRadius = "20px";
            converterContainer.style.minWidth = "600px";
            converterContainer.style.minHeight = "400px";
            converterContainer.className = "animate__animated animate__zoomIn";
            converterContainer.classList.add("converter-container");
  
            const titleElement = document.createElement("h2");
            titleElement.textContent = title;
            titleElement.style.color = "white";
            titleElement.style.textAlign = "center";
            titleElement.style.marginBottom = "20px";
            titleElement.className = "animate__animated animate__fadeInDown";
  
            const closeBtn = document.createElement("button");
            closeBtn.textContent = "✕";
            closeBtn.style.position = "absolute";
            closeBtn.style.top = "20px";
            closeBtn.style.right = "20px";
            closeBtn.style.backgroundColor = "transparent";
            closeBtn.style.border = "none";
            closeBtn.style.color = "white";
            closeBtn.style.fontSize = "24px";
            closeBtn.style.cursor = "pointer";
            closeBtn.onclick = () => {
              converterOverlay.className = "animate__animated animate__fadeOut";
              setTimeout(() => {
                if (converterOverlay.parentNode) {
                  converterOverlay.parentNode.removeChild(converterOverlay);
                }
              }, 500);
            };
  
            converterContainer.appendChild(titleElement);
            converterContainer.appendChild(closeBtn);
            converterOverlay.appendChild(converterContainer);
            return converterOverlay;
          };
  
          const jsonButton = document.createElement("button");
          jsonButton.textContent = "Convert to JSON";
          jsonButton.style.padding = "15px 25px";
          jsonButton.style.backgroundColor = "#3498db";
          jsonButton.style.color = "white";
          jsonButton.style.border = "none";
          jsonButton.style.borderRadius = "8px";
          jsonButton.style.cursor = "pointer";
          jsonButton.style.transition = "all 0.3s ease";
  
          const wppButton = document.createElement("button");
          wppButton.textContent = "Convert to W++";
          wppButton.style.padding = "15px 25px";
          wppButton.style.backgroundColor = "#2ecc71";
          wppButton.style.color = "white";
          wppButton.style.border = "none";
          wppButton.style.borderRadius = "8px";
          wppButton.style.cursor = "pointer";
          wppButton.style.transition = "all 0.3s ease";
  
          const proseButton = document.createElement("button");
          proseButton.textContent = "Convert to Prose";
          proseButton.style.padding = "15px 25px";
          proseButton.style.backgroundColor = "#e74c3c";
          proseButton.style.color = "white";
          proseButton.style.border = "none";
          proseButton.style.borderRadius = "8px";
          proseButton.style.cursor = "pointer";
          proseButton.style.transition = "all 0.3s ease";
  
          jsonButton.onclick = () => {
            const converterUI = createConverterUI("JSON Converter", "#3498db");
            if (!converterUI) return;
  
            const inputField = document.createElement("textarea");
            inputField.style.width = "100%";
            inputField.style.height = "150px";
            inputField.style.margin = "10px 0";
            inputField.style.padding = "10px";
            inputField.style.borderRadius = "8px";
            inputField.style.border = "1px solid #ccc";
            inputField.placeholder = "Enter plain text here...";
            inputField.className =
              "animate__animated animate__fadeIn animate__faster";
  
            const outputField = document.createElement("textarea");
            outputField.style.width = "100%";
            outputField.style.height = "150px";
            outputField.style.margin = "10px 0";
            outputField.style.padding = "10px";
            outputField.style.borderRadius = "8px";
            inputField.style.backgroundColor = "#f8f9fa";
            outputField.style.border = "1px solid #ccc";
            outputField.readOnly = true;
            outputField.placeholder = "JSON output will appear here...";
            outputField.className =
              "animate__animated animate__fadeIn animate__faster";
  
            const convertButton = document.createElement("button");
            convertButton.textContent = "Convert";
            convertButton.style.padding = "12px 24px";
            convertButton.style.backgroundColor = "#ffffff";
            convertButton.style.color = "#3498db";
            convertButton.style.border = "2px solid #3498db";
            convertButton.style.borderRadius = "8px";
            convertButton.style.cursor = "pointer";
            convertButton.style.margin = "10px 0";
            convertButton.style.fontWeight = "bold";
            convertButton.style.transition = "all 0.3s ease";
            convertButton.className =
              "animate__animated animate__fadeIn animate__faster";
  
            convertButton.onmouseover = () => {
              convertButton.style.backgroundColor = "#3498db";
              convertButton.style.color = "#ffffff";
              convertButton.style.transform = "scale(1.05)";
            };
  
            convertButton.onmouseout = () => {
              convertButton.style.backgroundColor = "#ffffff";
              convertButton.style.color = "#3498db";
              convertButton.style.transform = "scale(1)";
            };
  
            convertButton.onclick = () => {
              try {
                const jsonObject = { text: inputField.value };
                outputField.value = JSON.stringify(jsonObject, null, 2);
                outputField.className =
                  "animate__animated animate__pulse animate__faster";
                setTimeout(() => {
                  outputField.className =
                    "animate__animated animate__fadeIn animate__faster";
                }, 1000);
              } catch (error) {
                outputField.value = "Error converting to JSON";
              }
            };
  
            const container = converterUI.querySelector(".converter-container");
            if (container) {
              container.appendChild(inputField);
              container.appendChild(convertButton);
              container.appendChild(outputField);
            }
  
            document.body.appendChild(converterUI);
          };
  
          wppButton.onclick = () => {
            const converterUI = createConverterUI("W++ Converter", "#2ecc71");
            if (!converterUI) return;
  
            const inputField = document.createElement("textarea");
            inputField.style.width = "100%";
            inputField.style.height = "150px";
            inputField.style.margin = "10px 0";
            inputField.style.padding = "10px";
            inputField.style.borderRadius = "8px";
            inputField.style.border = "1px solid #ccc";
            inputField.placeholder = "Enter plain text here...";
            inputField.className =
              "animate__animated animate__fadeIn animate__faster";
  
            const outputField = document.createElement("textarea");
            outputField.style.width = "100%";
            outputField.style.height = "150px";
            outputField.style.margin = "10px 0";
            outputField.style.padding = "10px";
            outputField.style.borderRadius = "8px";
            inputField.style.backgroundColor = "#f8f9fa";
            outputField.style.border = "1px solid #ccc";
            outputField.readOnly = true;
            outputField.placeholder = "W++ output will appear here...";
            outputField.className =
              "animate__animated animate__fadeIn animate__faster";
  
            const convertButton = document.createElement("button");
            convertButton.textContent = "Convert";
            convertButton.style.padding = "12px 24px";
            convertButton.style.backgroundColor = "#ffffff";
            convertButton.style.color = "#2ecc71";
            convertButton.style.border = "2px solid #2ecc71";
            convertButton.style.borderRadius = "8px";
            convertButton.style.cursor = "pointer";
            convertButton.style.margin = "10px 0";
            convertButton.style.fontWeight = "bold";
            convertButton.style.transition = "all 0.3s ease";
            convertButton.className =
              "animate__animated animate__fadeIn animate__faster";
  
            convertButton.onmouseover = () => {
              convertButton.style.backgroundColor = "#2ecc71";
              convertButton.style.color = "#ffffff";
              convertButton.style.transform = "scale(1.05)";
            };
  
            convertButton.onmouseout = () => {
              convertButton.style.backgroundColor = "#ffffff";
              convertButton.style.color = "#2ecc71";
              convertButton.style.transform = "scale(1)";
            };
  
            convertButton.onclick = () => {
              try {
                const text = inputField.value;
                const wppFormat = `Apperance("${text}")\n\nBackstory("${text}")\n\nPersonality("${text}")`;
                outputField.value = wppFormat;
                outputField.className =
                  "animate__animated animate__pulse animate__faster";
                setTimeout(() => {
                  outputField.className =
                    "animate__animated animate__fadeIn animate__faster";
                }, 1000);
              } catch (error) {
                outputField.value = "Error converting to W++";
              }
            };
  
            const container = converterUI.querySelector(".converter-container");
            if (container) {
              container.appendChild(inputField);
              container.appendChild(convertButton);
              container.appendChild(outputField);
            }
  
            document.body.appendChild(converterUI);
          };
  
          proseButton.onclick = () => {
            const converterUI = createConverterUI("Prose Converter", "#e74c3c");
            if (!converterUI) return;
  
            const inputField = document.createElement("textarea");
            inputField.style.width = "100%";
            inputField.style.height = "150px";
            inputField.style.margin = "10px 0";
            inputField.style.padding = "10px";
            inputField.style.borderRadius = "8px";
            inputField.style.border = "1px solid #ccc";
            inputField.placeholder = "Enter plain text here...";
            inputField.className = "animate__animated animate__fadeIn";
  
            const outputField = document.createElement("textarea");
            outputField.style.width = "100%";
            outputField.style.height = "150px";
            outputField.style.margin = "10px 0";
            outputField.style.padding = "10px";
            outputField.style.borderRadius = "8px";
            outputField.style.border = "1px solid #ccc";
            outputField.readOnly = true;
            outputField.placeholder = "Prose output will appear here...";
            outputField.className = "animate__animated animate__fadeIn";
  
            const convertButton = document.createElement("button");
            convertButton.textContent = "Convert";
            convertButton.style.padding = "10px 20px";
            convertButton.style.backgroundColor = "#e74c3c";
            convertButton.style.color = "white";
            convertButton.style.border = "none";
            convertButton.style.borderRadius = "8px";
            convertButton.style.cursor = "pointer";
            convertButton.style.margin = "10px 0";
            convertButton.className = "animate__animated animate__fadeIn";
  
            const container = converterUI.querySelector(".converter-container");
            if (container) {
              container.appendChild(inputField);
              container.appendChild(convertButton);
              container.appendChild(outputField);
            }
  
            document.body.appendChild(converterUI);
          };
  
          [jsonButton, wppButton, proseButton].forEach((button) => {
            button.onmouseenter = () => {
              button.style.transform = "scale(1.05)";
              button.style.filter = "brightness(1.2)";
            };
            button.onmouseleave = () => {
              button.style.transform = "scale(1)";
              button.style.filter = "brightness(1)";
            };
          });
  
          overlay.onclick = (e) => {
            if (e.target === overlay) {
              overlay.className = "animate__animated animate__fadeOut";
              setTimeout(() => {
                if (overlay.parentNode) {
                  overlay.parentNode.removeChild(overlay);
                }
              }, 500);
            }
          };
  
          container.appendChild(jsonButton);
          container.appendChild(wppButton);
          container.appendChild(proseButton);
          overlay.appendChild(container);
          document.body.appendChild(overlay);
        };
       
        const bugReportButton = document.createElement("button");
        bugReportButton.textContent = "🐛 Report Bug";
        bugReportButton.style.width = "100%";
        bugReportButton.style.height = "50px";
        bugReportButton.style.margin = "10px 0";
        bugReportButton.style.borderRadius = "8px";
        bugReportButton.style.backgroundColor = "#555";
        bugReportButton.style.color = "white";
        bugReportButton.style.border = "none";
        bugReportButton.style.cursor = "pointer";
        bugReportButton.style.transition =
          "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
        bugReportButton.style.fontSize = "16px";
        bugReportButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
        bugReportButton.style.fontFamily = "Arial, sans-serif";
        bugReportButton.style.transform = "scale(1)";
  
        bugReportButton.onmouseenter = () => {
          bugReportButton.style.transform = "scale(1.05)";
          bugReportButton.style.backgroundColor = "#666";
          bugReportButton.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
        };
  
        bugReportButton.onmouseleave = () => {
          bugReportButton.style.transform = "scale(1)";
          bugReportButton.style.backgroundColor = "#555";
          bugReportButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
        };
  
        bugReportButton.onclick = () => {
          const bugReportUI = document.createElement("div");
          bugReportUI.className = "animate__animated animate__fadeIn";
          bugReportUI.style.position = "fixed";
          bugReportUI.style.top = "50%";
          bugReportUI.style.left = "50%";
          bugReportUI.style.transform = "translate(-50%, -50%)";
          bugReportUI.style.backgroundColor = "#1a1f2e";
          bugReportUI.style.padding = "20px";
          bugReportUI.style.borderRadius = "20px";
          bugReportUI.style.boxShadow = "0 15px 50px rgba(0, 0, 0, 0.3)";
          bugReportUI.style.width = "85%";
          bugReportUI.style.maxWidth = "400px";
          bugReportUI.style.zIndex = "10000";
          bugReportUI.style.backdropFilter = "blur(10px)";
          bugReportUI.style.border = "1px solid rgba(255, 255, 255, 0.1)";
  
          const title = document.createElement("h2");
          title.textContent = "🐛 Report a Bug";
          title.style.color = "#fff";
          title.style.marginBottom = "15px";
          title.style.fontSize = "20px";
          title.style.textAlign = "center";
  
          const input = document.createElement("textarea");
          input.style.width = "100%";
          input.style.height = "150px";
          input.style.padding = "12px";
          input.style.marginBottom = "15px";
          input.style.borderRadius = "12px";
          input.style.border = "2px solid rgba(255, 255, 255, 0.1)";
          input.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
          input.style.color = "white";
          input.style.fontSize = "14px";
          input.style.resize = "none";
          input.placeholder = "Please describe the bug in detail...";
  
          const buttonContainer = document.createElement("div");
          buttonContainer.style.display = "flex";
          buttonContainer.style.gap = "10px";
          buttonContainer.style.justifyContent = "flex-end";
  
          const sendButton = document.createElement("button");
          sendButton.textContent = "Send Report";
          sendButton.style.padding = "10px 20px";
          sendButton.style.borderRadius = "10px";
          sendButton.style.border = "none";
          sendButton.style.backgroundColor = "#4CAF50";
          sendButton.style.color = "white";
          sendButton.style.cursor = "pointer";
          sendButton.style.fontSize = "14px";
          sendButton.style.transition = "all 0.3s ease";
  
          const closeButton = document.createElement("button");
          closeButton.textContent = "Cancel";
          closeButton.style.padding = "10px 20px";
          closeButton.style.borderRadius = "10px";
          closeButton.style.border = "none";
          closeButton.style.backgroundColor = "#ff4444";
          closeButton.style.color = "white";
          closeButton.style.cursor = "pointer";
          closeButton.style.fontSize = "14px";
          closeButton.style.transition = "all 0.3s ease";
  
          sendButton.onclick = async () => {
            if (input.value.trim()) {
              try {
                const response = await fetch(`${BASEURL}/api/send/bugrepot`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer SSS155",
                  },
                  body: JSON.stringify({ report: input.value }),
                });
  
                if (response.ok) {
                  bugReportUI.className = "animate__animated animate__fadeOut";
                  setTimeout(() => {
                    document.body.removeChild(bugReportUI);
                  }, 500);
                }
              } catch (error) {
                alert("Failed to send bug report. Please try again.");
              }
            }
          };
  
          closeButton.onclick = () => {
            bugReportUI.className = "animate__animated animate__fadeOut";
            setTimeout(() => {
              document.body.removeChild(bugReportUI);
            }, 500);
          };
  
          buttonContainer.appendChild(closeButton);
          buttonContainer.appendChild(sendButton);
          bugReportUI.appendChild(title);
          bugReportUI.appendChild(input);
          bugReportUI.appendChild(buttonContainer);
          document.body.appendChild(bugReportUI);
  
          input.focus();
        };
        const feedbackButton = document.createElement("button");
        feedbackButton.textContent = "📝 Send Feedback";
        feedbackButton.style.width = "100%";
        feedbackButton.style.height = "50px";
        feedbackButton.style.margin = "10px 0";
        feedbackButton.style.borderRadius = "8px";
        feedbackButton.style.backgroundColor = "#555";
        feedbackButton.style.color = "white";
        feedbackButton.style.border = "none";
        feedbackButton.style.cursor = "pointer";
        feedbackButton.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
        feedbackButton.style.fontSize = "16px";
        feedbackButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
        feedbackButton.style.fontFamily = "Arial, sans-serif";
        feedbackButton.style.transform = "scale(1)";
  
        feedbackButton.onmouseenter = () => {
          feedbackButton.style.transform = "scale(1.02)";
          feedbackButton.style.backgroundColor = "#666";
        };
  
        feedbackButton.onmouseleave = () => {
          feedbackButton.style.transform = "scale(1)";
          feedbackButton.style.backgroundColor = "#555";
        };
  
        feedbackButton.onclick = () => {
          const feedbackUI = document.createElement("div");
          feedbackUI.style.position = "fixed";
          feedbackUI.style.top = "50%";
          feedbackUI.style.left = "50%";
          feedbackUI.style.transform = "translate(-50%, -50%)";
          feedbackUI.style.backgroundColor = "rgba(0, 0, 0, 0.95)";
          feedbackUI.style.padding = "20px";
          feedbackUI.style.borderRadius = "20px";
          feedbackUI.style.zIndex = "10000";
          feedbackUI.style.display = "flex";
          feedbackUI.style.flexDirection = "column";
          feedbackUI.style.gap = "15px";
          feedbackUI.style.width = "90%";
          feedbackUI.style.maxWidth = "350px";
          feedbackUI.className = "animate__animated animate__fadeIn";
  
          const title = document.createElement("h2");
          title.textContent = "Send Your Feedback";
          title.style.color = "white";
          title.style.margin = "0";
          title.style.textAlign = "center";
          title.style.fontSize = "20px";
  
          const input = document.createElement("textarea");
          input.style.width = "100%";
          input.style.height = "120px";
          input.style.padding = "12px";
          input.style.borderRadius = "10px";
          input.style.border = "2px solid #444";
          input.style.backgroundColor = "#333";
          input.style.color = "white";
          input.style.resize = "none";
          input.style.fontSize = "14px";
          input.placeholder = "Type your feedback here...";
  
          const buttonContainer = document.createElement("div");
          buttonContainer.style.display = "flex";
          buttonContainer.style.gap = "8px";
          buttonContainer.style.justifyContent = "flex-end";
  
          const sendButton = document.createElement("button");
          sendButton.textContent = "Send";
          sendButton.style.padding = "10px 20px";
          sendButton.style.borderRadius = "10px";
          sendButton.style.border = "none";
          sendButton.style.backgroundColor = "#4CAF50";
          sendButton.style.color = "white";
          sendButton.style.cursor = "pointer";
          sendButton.style.fontSize = "14px";
          sendButton.style.transition = "all 0.3s ease";
  
          const closeButton = document.createElement("button");
          closeButton.textContent = "Cancel";
          closeButton.style.padding = "10px 20px";
          closeButton.style.borderRadius = "10px";
          closeButton.style.border = "none";
          closeButton.style.backgroundColor = "#ff4444";
          closeButton.style.color = "white";
          closeButton.style.cursor = "pointer";
          closeButton.style.fontSize = "14px";
          closeButton.style.transition = "all 0.3s ease";
  
          sendButton.onclick = async () => {
            if (input.value.trim()) {
              try {
                const response = await fetch(`${BASEURL}/api/send/feedback`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer SSS155",
                  },
                  body: JSON.stringify({ feedback: input.value }),
                });
  
                if (response.ok) {
                  feedbackUI.className = "animate__animated animate__fadeOut";
                  setTimeout(() => {
                    document.body.removeChild(feedbackUI);
                  }, 500);
                }
              } catch (error) {
                alert("Failed to send feedback. Please try again.");
              }
            }
          };
  
          closeButton.onclick = () => {
            feedbackUI.className = "animate__animated animate__fadeOut";
            setTimeout(() => {
              document.body.removeChild(feedbackUI);
            }, 500);
          };
  
          buttonContainer.appendChild(closeButton);
          buttonContainer.appendChild(sendButton);
          feedbackUI.appendChild(title);
          feedbackUI.appendChild(input);
          feedbackUI.appendChild(buttonContainer);
          document.body.appendChild(feedbackUI);
  
          input.focus();
        };
  
        const clearStorageButton = document.createElement("button");
        clearStorageButton.textContent = "🗑️ Clear All Data";
        clearStorageButton.style.width = "100%";
        clearStorageButton.style.height = "50px";
        clearStorageButton.style.margin = "10px 0";
        clearStorageButton.style.borderRadius = "8px";
        clearStorageButton.style.backgroundColor = "#d32f2f";
        clearStorageButton.style.color = "white";
        clearStorageButton.style.border = "none";
        clearStorageButton.style.cursor = "pointer";
        clearStorageButton.style.transition =
          "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
        clearStorageButton.style.fontSize = "16px";
        clearStorageButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
        clearStorageButton.style.fontFamily = "Arial, sans-serif";
        clearStorageButton.style.transform = "scale(1)";
  
        clearStorageButton.onmouseenter = () => {
          clearStorageButton.style.transform = "scale(1.05)";
          clearStorageButton.style.backgroundColor = "#e33371";
          clearStorageButton.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
        };
  
        clearStorageButton.onmouseleave = () => {
          clearStorageButton.style.transform = "scale(1)";
          clearStorageButton.style.backgroundColor = "#d32f2f";
          clearStorageButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
        };
  
        clearStorageButton.onclick = () => {
          if (
            confirm(
              "Warning: This will delete all saved data including chat history and prompts. This action cannot be undone. Are you sure you want to continue?",
            )
          ) {
            localStorage.clear();
            alert("All data has been cleared successfully.");
            location.reload();
          }
        };
  
        const contactButton = document.createElement("button");
        contactButton.textContent = "📧 Contact Us";
        contactButton.style.width = "100%";
        contactButton.style.height = "50px";
        contactButton.style.margin = "10px 0";
        contactButton.style.borderRadius = "8px";
        contactButton.style.backgroundColor = "#9C27B0";
        contactButton.style.color = "white";
        contactButton.style.border = "none";
        contactButton.style.cursor = "pointer";
        contactButton.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
        contactButton.style.fontSize = "16px";
        contactButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
        contactButton.style.fontFamily = "Arial, sans-serif";
        contactButton.style.transform = "scale(1)";
  
        contactButton.onmouseenter = () => {
          contactButton.style.transform = "scale(1.05)";
          contactButton.style.backgroundColor = "#7B1FA2";
          contactButton.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
        };
  
        contactButton.onmouseleave = () => {
          contactButton.style.transform = "scale(1)";
          contactButton.style.backgroundColor = "#9C27B0";
          contactButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
        };
  
        contactButton.onclick = () => {
          window.location.href = "mailto:whitzscott@gmail.com";
        };
  
        const searchButton = document.createElement("button");
        searchButton.textContent = "🔍 Search User";
        searchButton.style.width = "100%";
        searchButton.style.height = "50px";
        searchButton.style.margin = "10px 0";
        searchButton.style.borderRadius = "8px";
        searchButton.style.backgroundColor = "#FF5722";
        searchButton.style.color = "white";
        searchButton.style.border = "none";
        searchButton.style.cursor = "pointer";
        searchButton.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
        searchButton.style.fontSize = "16px";
        searchButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
        searchButton.style.fontFamily = "Arial, sans-serif";
        searchButton.style.transform = "scale(1)";
  
        searchButton.onmouseenter = () => {
          searchButton.style.transform = "scale(1.05)";
          searchButton.style.backgroundColor = "#E64A19";
          searchButton.style.boxShadow = "0 6px 15px rgba(0, 0, 0, 0.6)";
        };
  
        searchButton.onmouseleave = () => {
          searchButton.style.transform = "scale(1)";
          searchButton.style.backgroundColor = "#FF5722";
          searchButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
        };
  
        searchButton.onclick = () => {
          const searchOverlay = document.createElement("div");
          searchOverlay.style.position = "fixed";
          searchOverlay.style.top = "0";
          searchOverlay.style.left = "0";
          searchOverlay.style.width = "100%";
          searchOverlay.style.height = "100%";
          searchOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
          searchOverlay.style.display = "flex";
          searchOverlay.style.justifyContent = "center";
          searchOverlay.style.alignItems = "center";
          searchOverlay.style.zIndex = "10000";
          searchOverlay.style.opacity = "0";
          searchOverlay.style.transition = "opacity 0.3s ease-in-out";
  
          setTimeout(() => {
            searchOverlay.style.opacity = "1";
          }, 10);
  
          const searchContainer = document.createElement("div");
          searchContainer.style.backgroundColor = "#1a1a1a";
          searchContainer.style.padding = "30px";
          searchContainer.style.borderRadius = "15px";
          searchContainer.style.width = "350px";
          searchContainer.style.position = "relative";
          searchContainer.style.transform = "scale(0.9)";
          searchContainer.style.opacity = "0";
          searchContainer.style.transition = "all 0.3s ease-in-out";
          searchContainer.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.5)";
  
          setTimeout(() => {
            searchContainer.style.transform = "scale(1)";
            searchContainer.style.opacity = "1";
          }, 100);
  
          const closeButton = document.createElement("button");
          closeButton.innerHTML = '<i class="fas fa-times"></i>';
          closeButton.style.position = "absolute";
          closeButton.style.right = "15px";
          closeButton.style.top = "15px";
          closeButton.style.border = "none";
          closeButton.style.background = "none";
          closeButton.style.color = "#fff";
          closeButton.style.fontSize = "20px";
          closeButton.style.cursor = "pointer";
          closeButton.style.transition = "transform 0.2s ease";
          closeButton.onmouseenter = () =>
            (closeButton.style.transform = "scale(1.1)");
          closeButton.onmouseleave = () =>
            (closeButton.style.transform = "scale(1)");
          closeButton.onclick = () => {
            searchOverlay.style.opacity = "0";
            setTimeout(() => searchOverlay.remove(), 300);
          };
  
          const textarea = document.createElement("textarea");
          textarea.style.width = "100%";
          textarea.style.height = "100px";
          textarea.style.marginBottom = "15px";
          textarea.style.padding = "15px";
          textarea.style.borderRadius = "10px";
          textarea.style.border = "2px solid #333";
          textarea.style.backgroundColor = "#2a2a2a";
          textarea.style.color = "#fff";
          textarea.style.fontSize = "16px";
          textarea.style.resize = "none";
          textarea.placeholder = "Enter username to search...";
          textarea.style.transition = "border-color 0.3s ease";
          textarea.onfocus = () => (textarea.style.borderColor = "#FF5722");
          textarea.onblur = () => (textarea.style.borderColor = "#333");
  
          const searchIconButton = document.createElement("button");
          searchIconButton.innerHTML =
            '<i class="fas fa-search"></i> Search User';
          searchIconButton.style.width = "100%";
          searchIconButton.style.padding = "15px";
          searchIconButton.style.backgroundColor = "#FF5722";
          searchIconButton.style.color = "white";
          searchIconButton.style.border = "none";
          searchIconButton.style.borderRadius = "10px";
          searchIconButton.style.cursor = "pointer";
          searchIconButton.style.fontSize = "16px";
          searchIconButton.style.fontWeight = "bold";
          searchIconButton.style.transition = "all 0.3s ease";
          searchIconButton.style.transform = "translateY(0)";
          searchIconButton.onmouseenter = () => {
            searchIconButton.style.backgroundColor = "#E64A19";
            searchIconButton.style.transform = "translateY(-2px)";
          };
          searchIconButton.onmouseleave = () => {
            searchIconButton.style.backgroundColor = "#FF5722";
            searchIconButton.style.transform = "translateY(0)";
          };
          searchIconButton.onclick = () => {
            const username = textarea.value.trim();
            if (username) {
              window.open(`https://www.sakura.fm/user/${username}`, "_blank");
            }
          };
  
          searchContainer.appendChild(closeButton);
          searchContainer.appendChild(textarea);
          searchContainer.appendChild(searchIconButton);
          searchOverlay.appendChild(searchContainer);
          document.body.appendChild(searchOverlay);
        };
        //overlays 
        overlayContent.appendChild(stopButton);
        overlayContent.appendChild(registerButton);
        overlayContent.appendChild(autoGrammarButton);
        overlayContent.appendChild(autoLoadButton);
        overlayContent.appendChild(RenameChats);
        overlayContent.appendChild(searchButton); 
        overlayContent.appendChild(extractCharacterButton);
        overlayContent.appendChild(extractChatsButton);
        overlayContent.appendChild(extractChatsButtonAsTavernChats);
        overlayContent.appendChild(extractChatsButtonAsJSON);
        overlayContent.appendChild(extractChatsButtonAsTXT);
        overlayContent.appendChild(MassDelete);
        overlayContent.appendChild(MassRegen);
        overlayContent.appendChild(ChangeJSON);
        overlayContent.appendChild(BulkCharacterImport);
        overlayContent.appendChild(SearchTags);
        overlayContent.appendChild(ModifyAiSuggestion);
        overlayContent.appendChild(ExtractSakuraCharacters);
        overlayContent.appendChild(ExtractCharacterAi);
        overlayContent.appendChild(ExtractAnimeGf);
        overlayContent.appendChild(ExtractSpicyChat);
        overlayContent.appendChild(FlowGPTScrape);
        overlayContent.appendChild(BuyVipButton);
        overlayContent.appendChild(memoryManagerButton);
        overlayContent.appendChild(button);
        overlayContent.appendChild(converterButton);
        overlayContent.appendChild(loginButton);
        overlayContent.appendChild(registerButton);
        overlayContent.appendChild(logoutButton);
        overlayContent.appendChild(clearStorageButton);
        overlayContent.appendChild(bugReportButton);
        overlayContent.appendChild(feedbackButton);
        overlayContent.appendChild(updateButton);
        overlayContent.appendChild(contactButton);
        overlayContent.appendChild(contributionButton);
  
        const horizontalRule2 = document.createElement("hr");
        horizontalRule2.style.border = "none";
        horizontalRule2.style.borderTop = "1px solid #ccc";
        horizontalRule2.style.margin = "20px 0";
        overlayContent.appendChild(horizontalRule2);
  
        const funStuffHeader = document.createElement("h1");
        funStuffHeader.textContent = "<=====FUN STUFF=====>";
        funStuffHeader.style.textAlign = "center";
        funStuffHeader.style.color = "#fff";
        funStuffHeader.style.marginTop = "20px";
        funStuffHeader.style.animation = "fadeIn 1s ease-in-out";
        funStuffHeader.style.fontSize = "24px";
        funStuffHeader.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.5)";
        funStuffHeader.style.userSelect = "none";
        funStuffHeader.style.transition = "transform 0.3s ease, color 0.3s ease";
        funStuffHeader.onmouseover = () => {
          funStuffHeader.style.transform = "scale(1.05)";
          funStuffHeader.style.color = "#ffcc00";
        };
        funStuffHeader.onmouseout = () => {
          funStuffHeader.style.transform = "scale(1)";
          funStuffHeader.style.color = "#fff";
        };
        overlayContent.appendChild(funStuffHeader);
  
        const chatButton = document.createElement("button");
        chatButton.textContent = "💬 Open Chat";
        chatButton.style.marginTop = "10px";
        chatButton.style.backgroundColor = "#4CAF50";
        chatButton.style.color = "white";
        chatButton.style.border = "none";
        chatButton.style.borderRadius = "10px";
        chatButton.style.padding = "15px 25px";
        chatButton.style.cursor = "pointer";
        chatButton.style.fontSize = "16px";
        chatButton.style.fontFamily = "'Poppins', sans-serif";
        chatButton.style.fontWeight = "600";
        chatButton.style.transition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
        chatButton.style.boxShadow = "0 4px 15px rgba(76, 175, 80, 0.3)";
        chatButton.style.transform = "translateY(0)";
        chatButton.onmouseover = () => {
          chatButton.style.transform = "translateY(-3px)";
          chatButton.style.boxShadow = "0 8px 20px rgba(76, 175, 80, 0.4)";
          chatButton.style.backgroundColor = "#45a049";
        };
        chatButton.onmouseout = () => {
          chatButton.style.transform = "translateY(0)";
          chatButton.style.boxShadow = "0 4px 15px rgba(76, 175, 80, 0.3)";
          chatButton.style.backgroundColor = "#4CAF50";
        };
  
        let chatOverlay = null;
  
        chatButton.onclick = () => {
          if (chatOverlay) {
            return;
          }
  
          chatOverlay = document.createElement("div");
          chatOverlay.style.position = "fixed";
          chatOverlay.style.top = "0";
          chatOverlay.style.left = "0";
          chatOverlay.style.width = "100%";
          chatOverlay.style.height = "100%";
          chatOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
          chatOverlay.style.display = "flex";
          chatOverlay.style.justifyContent = "center";
          chatOverlay.style.alignItems = "center";
          chatOverlay.style.zIndex = "999999999";
          chatOverlay.style.animation =
            "fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
          chatOverlay.style.backdropFilter = "blur(8px)";
  
          const chatBox = document.createElement("div");
          chatBox.style.backgroundColor = "#1a2634";
          chatBox.style.color = "#fff";
          chatBox.style.padding = "30px";
          chatBox.style.borderRadius = "20px";
          chatBox.style.boxShadow = "0 10px 30px rgba(0,0,0,0.8)";
          chatBox.style.position = "relative";
          chatBox.style.width = "450px";
          chatBox.style.animation = "slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
          chatBox.style.border = "1px solid rgba(255,255,255,0.1)";
  
          const closeButton = document.createElement("button");
          closeButton.innerHTML = "&times;";
          closeButton.style.position = "absolute";
          closeButton.style.top = "15px";
          closeButton.style.right = "15px";
          closeButton.style.backgroundColor = "#ff4757";
          closeButton.style.color = "white";
          closeButton.style.border = "none";
          closeButton.style.borderRadius = "50%";
          closeButton.style.width = "35px";
          closeButton.style.height = "35px";
          closeButton.style.cursor = "pointer";
          closeButton.style.fontSize = "24px";
          closeButton.style.display = "flex";
          closeButton.style.justifyContent = "center";
          closeButton.style.alignItems = "center";
          closeButton.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
          closeButton.style.transform = "rotate(0deg)";
          closeButton.onmouseover = () => {
            closeButton.style.backgroundColor = "#ff6b81";
            closeButton.style.transform = "rotate(90deg)";
          };
          closeButton.onmouseout = () => {
            closeButton.style.backgroundColor = "#ff4757";
            closeButton.style.transform = "rotate(0deg)";
          };
          closeButton.onclick = () => {
            chatOverlay.style.animation =
              "fadeOut 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
            chatBox.style.animation =
              "slideOutDown 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
            setTimeout(() => {
              document.body.removeChild(chatOverlay);
              chatOverlay = null;
            }, 400);
          };
  
          const userNameInput = document.createElement("input");
          userNameInput.placeholder = "👤 Enter your name";
          userNameInput.style.width = "100%";
          userNameInput.style.padding = "15px";
          userNameInput.style.marginBottom = "20px";
          userNameInput.style.borderRadius = "12px";
          userNameInput.style.border = "2px solid #2d3f50";
          userNameInput.style.backgroundColor = "#2d3f50";
          userNameInput.style.color = "#fff";
          userNameInput.style.fontSize = "15px";
          userNameInput.style.fontFamily = "'Poppins', sans-serif";
          userNameInput.style.transition = "all 0.3s ease";
          userNameInput.style.outline = "none";
          userNameInput.onfocus = () =>
            (userNameInput.style.border = "2px solid #3498db");
          userNameInput.onblur = () =>
            (userNameInput.style.border = "2px solid #2d3f50");
  
          const messagesDiv = document.createElement("div");
          messagesDiv.style.maxHeight = "350px";
          messagesDiv.style.overflowY = "auto";
          messagesDiv.style.marginBottom = "20px";
          messagesDiv.style.padding = "15px";
          messagesDiv.style.backgroundColor = "#2d3f50";
          messagesDiv.style.borderRadius = "12px";
          messagesDiv.style.scrollBehavior = "smooth";
  
          const userMessageInput = document.createElement("input");
          userMessageInput.placeholder = "✍️ Type your message";
          userMessageInput.style.width = "100%";
          userMessageInput.style.padding = "15px";
          userMessageInput.style.marginBottom = "20px";
          userMessageInput.style.borderRadius = "12px";
          userMessageInput.style.border = "2px solid #2d3f50";
          userMessageInput.style.backgroundColor = "#2d3f50";
          userMessageInput.style.color = "#fff";
          userMessageInput.style.fontSize = "15px";
          userMessageInput.style.fontFamily = "'Poppins', sans-serif";
          userMessageInput.style.transition = "all 0.3s ease";
          userMessageInput.style.outline = "none";
          userMessageInput.onfocus = () =>
            (userMessageInput.style.border = "2px solid #3498db");
          userMessageInput.onblur = () =>
            (userMessageInput.style.border = "2px solid #2d3f50");
  
          const sendButton = document.createElement("button");
          sendButton.innerHTML = "📤 Send Message";
          sendButton.style.backgroundColor = "#3498db";
          sendButton.style.color = "white";
          sendButton.style.border = "none";
          sendButton.style.borderRadius = "12px";
          sendButton.style.padding = "15px 25px";
          sendButton.style.cursor = "pointer";
          sendButton.style.width = "100%";
          sendButton.style.fontSize = "15px";
          sendButton.style.fontFamily = "'Poppins', sans-serif";
          sendButton.style.fontWeight = "600";
          sendButton.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
          sendButton.style.transform = "translateY(0)";
          sendButton.onmouseover = () => {
            sendButton.style.backgroundColor = "#2980b9";
            sendButton.style.transform = "translateY(-2px)";
          };
          sendButton.onmouseout = () => {
            sendButton.style.backgroundColor = "#3498db";
            sendButton.style.transform = "translateY(0)";
          };
  
          chatBox.appendChild(closeButton);
          chatBox.appendChild(userNameInput);
          chatBox.appendChild(messagesDiv);
          chatBox.appendChild(userMessageInput);
          chatBox.appendChild(sendButton);
          chatOverlay.appendChild(chatBox);
          document.body.appendChild(chatOverlay);
  
          const SERVER_URL = "https://chat-8c4o.onrender.com/chat";
          let lastMessageCount = 0;
          let typingTimeout;
  
          fetchMessages();
          setInterval(fetchMessages, 500);
  
          const handleSendMessage = () => {
            const message = userMessageInput.value.trim();
            const user = userNameInput.value.trim() || "User";
            if (message) {
              sendMessage(user, message);
              userMessageInput.value = "";
              removeTypingIndicator(user);
            }
          };
  
          sendButton.addEventListener("click", handleSendMessage);
  
          userMessageInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            } else {
              const user = userNameInput.value.trim() || "User";
              if (userMessageInput.value.trim()) {
                showTypingIndicator(user);
              } else {
                removeTypingIndicator(user);
              }
            }
          });
  
          userMessageInput.addEventListener("input", () => {
            const user = userNameInput.value.trim() || "User";
            if (userMessageInput.value.trim()) {
              showTypingIndicator(user);
            } else {
              removeTypingIndicator(user);
            }
          });
  
          function showTypingIndicator(user) {
            clearTimeout(typingTimeout);
            const existingIndicator = document.querySelector(
              `[data-typing-user="${user}"]`,
            );
            if (!existingIndicator) {
              const typingElement = document.createElement("div");
              typingElement.classList.add("typing-indicator");
              typingElement.setAttribute("data-typing-user", user);
              typingElement.textContent = `${user} is typing...`;
              typingElement.style.color = "#666";
              typingElement.style.fontStyle = "italic";
              typingElement.style.padding = "5px";
              messagesDiv.appendChild(typingElement);
            }
            typingTimeout = setTimeout(() => removeTypingIndicator(user), 2000);
          }
  
          function removeTypingIndicator(user) {
            const indicator = document.querySelector(
              `[data-typing-user="${user}"]`,
            );
            if (indicator) {
              indicator.remove();
            }
          }
  
          function fetchMessages() {
            fetch(SERVER_URL, {
              method: "GET",
              headers: {
                Authorization: "CHAT1234",
              },
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Failed to fetch");
                }
                return response.json();
              })
              .then((data) => {
                if (data.messages.length !== lastMessageCount) {
                  lastMessageCount = data.messages.length;
                  updateMessages(data.messages);
                }
              })
              .catch((error) => console.error("Error fetching messages:", error));
          }
  
          function updateMessages(messages) {
            const fragment = document.createDocumentFragment();
            const existingMessages = messagesDiv.querySelectorAll(".message");
            const existingIds = new Set(
              Array.from(existingMessages).map((el) => el.dataset.messageId),
            );
  
            messages.forEach((msg) => {
              const messageId = `${msg.user}-${msg.message}`;
              if (!existingIds.has(messageId)) {
                const messageElement = createMessageElement(msg, messageId);
                fragment.appendChild(messageElement);
              }
            });
  
            if (fragment.children.length) {
              messagesDiv.appendChild(fragment);
              messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }
          }
  
          function createMessageElement(message, messageId) {
            const messageElement = document.createElement("div");
            messageElement.classList.add("message");
            messageElement.dataset.messageId = messageId;
            const timestamp = new Date(message.timestamp).toLocaleTimeString();
            messageElement.textContent = `${message.user} [${timestamp}]: ${message.message}`;
            return messageElement;
          }
  
          function sendMessage(user, message) {
            const messageData = {
              user: user,
              message: message,
              timestamp: Date.now(),
            };
  
            fetch(SERVER_URL, {
              method: "POST",
              headers: {
                Authorization: "CHAT1234",
                "Content-Type": "application/json",
              },
              body: JSON.stringify(messageData),
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Failed to send message");
                }
                fetchMessages();
              })
              .catch((error) => console.error("Error sending message:", error));
          }
        };
        overlayContent.appendChild(chatButton);
  
        const randomFeatureButton = document.createElement("button");
        randomFeatureButton.textContent = "Random Number";
        randomFeatureButton.style.marginTop = "10px";
        randomFeatureButton.style.backgroundColor = "#007BFF";
        randomFeatureButton.style.color = "white";
        randomFeatureButton.style.border = "none";
        randomFeatureButton.style.borderRadius = "5px";
        randomFeatureButton.style.padding = "12px 20px";
        randomFeatureButton.style.cursor = "pointer";
        randomFeatureButton.style.fontSize = "14px";
        randomFeatureButton.style.fontWeight = "500";
        randomFeatureButton.style.transition = "all 0.3s ease";
        randomFeatureButton.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
        randomFeatureButton.onclick = () => {
          const randomNumber = Math.floor(Math.random() * 100) + 1;
          alert(`Random number generated: ${randomNumber}`);
        };
  
        overlayContent.appendChild(randomFeatureButton);
  
        let gameStarted = false;
  
        const playDinoGameButton = document.createElement("button");
        playDinoGameButton.textContent = "🦖 Play Dino Game";
        playDinoGameButton.style.marginTop = "10px";
        playDinoGameButton.style.backgroundColor = "#007BFF";
        playDinoGameButton.style.color = "white";
        playDinoGameButton.style.border = "none";
        playDinoGameButton.style.borderRadius = "5px";
        playDinoGameButton.style.padding = "12px 20px";
        playDinoGameButton.style.cursor = "pointer";
        playDinoGameButton.style.fontSize = "14px";
        playDinoGameButton.style.fontWeight = "500";
        playDinoGameButton.style.transition = "all 0.3s ease";
        playDinoGameButton.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
        playDinoGameButton.onclick = () => {
          if (gameStarted) return;
          gameStarted = true;
  
          const dinoGameContainer = document.createElement("div");
          dinoGameContainer.style.position = "relative";
          dinoGameContainer.style.width = "100%";
          dinoGameContainer.style.height = "200px";
          dinoGameContainer.style.overflow = "hidden";
          dinoGameContainer.style.backgroundColor = "#f7f7f7";
  
          const dino = document.createElement("div");
          dino.style.position = "absolute";
          dino.style.bottom = "0";
          dino.style.left = "50px";
          dino.style.width = "40px";
          dino.style.height = "40px";
          dino.style.backgroundColor = "green";
  
          dinoGameContainer.appendChild(dino);
          overlayContent.appendChild(dinoGameContainer);
  
          let isJumping = false;
          let level = 1;
          let cactusSpeed = 2000;
          let gameOverAlerted = false;
  
          function jump() {
            if (isJumping) return;
            isJumping = true;
            let jumpHeight = 0;
            const jumpInterval = setInterval(() => {
              if (jumpHeight >= 100) {
                clearInterval(jumpInterval);
                const fallInterval = setInterval(() => {
                  if (jumpHeight <= 0) {
                    clearInterval(fallInterval);
                    isJumping = false;
                  }
                  jumpHeight -= 5;
                  dino.style.bottom = `${jumpHeight}px`;
                }, 20);
              }
              jumpHeight += 5;
              dino.style.bottom = `${jumpHeight}px`;
            }, 20);
          }
  
          document.addEventListener("keydown", (event) => {
            if (event.code === "Space") {
              jump();
            }
          });
  
          function spawnCactus() {
            const cactus = document.createElement("div");
            cactus.style.position = "absolute";
            cactus.style.bottom = "0";
            cactus.style.right = "50px";
            cactus.style.width = "20px";
            cactus.style.height = "40px";
            cactus.style.backgroundColor = "brown";
            dinoGameContainer.appendChild(cactus);
  
            let cactusInterval = setInterval(() => {
              const cactusPosition = parseInt(cactus.style.right);
              if (cactusPosition < 0) {
                clearInterval(cactusInterval);
                cactus.remove();
              } else {
                cactus.style.right = `${cactusPosition + 5}px`;
                if (collision(dino, cactus)) {
                  if (!gameOverAlerted) {
                    alert("Game Over!");
                    gameOverAlerted = true;
                  }
                  clearInterval(cactusInterval);
                  dinoGameContainer.remove();
                }
              }
            }, 20);
          }
  
          function collision(dino, cactus) {
            const dinoRect = dino.getBoundingClientRect();
            const cactusRect = cactus.getBoundingClientRect();
            return !(
              dinoRect.top > cactusRect.bottom ||
              dinoRect.bottom < cactusRect.top ||
              dinoRect.right < cactusRect.left ||
              dinoRect.left > cactusRect.right
            );
          }
  
          const closeButton = document.createElement("button");
          closeButton.textContent = "❌";
          closeButton.style.position = "absolute";
          closeButton.style.top = "10px";
          closeButton.style.right = "10px";
          closeButton.style.backgroundColor = "red";
          closeButton.style.color = "white";
          closeButton.style.border = "none";
          closeButton.style.borderRadius = "5px";
          closeButton.style.cursor = "pointer";
          closeButton.onclick = () => {
            dinoGameContainer.remove();
            gameStarted = false;
            gameOverAlerted = false;
          };
  
          dinoGameContainer.appendChild(closeButton);
          setInterval(() => {
            spawnCactus();
            level++;
            cactusSpeed = Math.max(500, cactusSpeed - 200);
          }, cactusSpeed);
        };
        overlayContent.appendChild(playDinoGameButton);
  
        const horizontalRule = document.createElement("hr");
        horizontalRule.style.border = "none";
        horizontalRule.style.borderTop = "1px solid #ccc";
        horizontalRule.style.margin = "20px 0";
        overlayContent.appendChild(horizontalRule);
  
        const manifestData = chrome.runtime.getManifest();
        const extensionId = chrome.runtime.id;
  
        const versionHeader = document.createElement("div");
        versionHeader.style.display = "flex";
        versionHeader.style.alignItems = "center";
        versionHeader.style.justifyContent = "center";
        versionHeader.style.backgroundColor = "#333";
        versionHeader.style.color = "#fff";
        versionHeader.style.padding = "10px";
        versionHeader.style.borderRadius = "5px";
        versionHeader.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
        versionHeader.style.animation = "fadeIn 0.5s ease-in-out";
        versionHeader.style.userSelect = "none";
        versionHeader.style.transition = "transform 0.3s, background-color 0.3s";
  
        versionHeader.onmouseover = () => {
          versionHeader.style.transform = "scale(1.05)";
          versionHeader.style.backgroundColor = "#444";
        };
  
        versionHeader.onmouseout = () => {
          versionHeader.style.transform = "scale(1)";
          versionHeader.style.backgroundColor = "#333";
        };
  
        const versionText = document.createElement("h3");
        versionText.textContent = `VERSION: ${manifestData.version}`;
        versionText.style.margin = "0 10px";
  
        versionHeader.appendChild(versionText);
        overlayContent.appendChild(versionHeader);
  
        const displayUserId = () => {
          const userIdDisplay = document.createElement("div");
          userIdDisplay.textContent = `EXTENSION ID: ${extensionId}`;
          userIdDisplay.style.textAlign = "center";
          userIdDisplay.style.color = "#fff";
          userIdDisplay.style.marginTop = "20px";
          userIdDisplay.style.backgroundColor = "#333";
          userIdDisplay.style.borderRadius = "8px";
          userIdDisplay.style.padding = "10px";
          userIdDisplay.style.boxShadow = "0 2px 4px rgba(0,0,0,0.5)";
          userIdDisplay.style.transition = "transform 0.3s ease, color 0.3s ease";
          userIdDisplay.onmouseover = () => {
            userIdDisplay.style.transform = "scale(1.05)";
            userIdDisplay.style.backgroundColor = "#444";
          };
          userIdDisplay.onmouseout = () => {
            userIdDisplay.style.transform = "scale(1)";
            userIdDisplay.style.backgroundColor = "#333";
          };
          overlayContent.appendChild(userIdDisplay);
        };
  
        displayUserId();

        const DisplayUserstatus = async () => {
          try {
            await delay(100);

            const response = await fetch(`${BASEURL}/check-login-status`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: "Bearer SSS155",
              },
              body: JSON.stringify({ loginResponse })
            });
            
            if (!response.ok) {
              throw new Error("Failed to fetch user status");
            }
            
            const data = await response.json();
            
            if (data.is_login) {
              sessionStorage.setItem("name", data.user.name);
            }
            
            const status = data.is_user_vip ? "VIP" : "User";

            const DisplayUserstatus = document.createElement("div");
            DisplayUserstatus.textContent = `STATUS: ${status}`;
            DisplayUserstatus.style.textAlign = "center";
            DisplayUserstatus.style.color = "#fff";
            DisplayUserstatus.style.marginTop = "20px";
            DisplayUserstatus.style.backgroundColor = "#333";
            DisplayUserstatus.style.borderRadius = "8px";
            DisplayUserstatus.style.padding = "10px";
            DisplayUserstatus.style.boxShadow = "0 2px 4px rgba(0,0,0,0.5)";
            DisplayUserstatus.style.transition = "transform 0.3s ease, color 0.3s ease";
            DisplayUserstatus.onmouseover = () => {
              DisplayUserstatus.style.transform = "scale(1.05)";
              DisplayUserstatus.style.backgroundColor = "#444";
            };
            DisplayUserstatus.onmouseout = () => {
              DisplayUserstatus.style.transform = "scale(1)";
              DisplayUserstatus.style.backgroundColor = "#333";
            };
            overlayContent.appendChild(DisplayUserstatus);
          } catch (error) {
            console.error("Error fetching user status:", error);
          }
        };

        DisplayUserstatus();

        const DisplayUsername = async () => {
          try {
            await delay(100);
            const name = sessionStorage.getItem('name') || "Unknown";
                
            const DisplayUsernameElement = document.createElement("div");
            DisplayUsernameElement.textContent = `Username: ${name}`;
            DisplayUsernameElement.style.textAlign = "center";
            DisplayUsernameElement.style.color = "#fff";
            DisplayUsernameElement.style.marginTop = "20px";
            DisplayUsernameElement.style.backgroundColor = "#333";
            DisplayUsernameElement.style.borderRadius = "8px";
            DisplayUsernameElement.style.padding = "10px";
            DisplayUsernameElement.style.boxShadow = "0 2px 4px rgba(0,0,0,0.5)";
            DisplayUsernameElement.style.transition = "transform 0.3s ease, color 0.3s ease";
            
            DisplayUsernameElement.onmouseover = () => {
              DisplayUsernameElement.style.transform = "scale(1.05)";
              DisplayUsernameElement.style.backgroundColor = "#444";
            };
            DisplayUsernameElement.onmouseout = () => {
              DisplayUsernameElement.style.transform = "scale(1)";
              DisplayUsernameElement.style.backgroundColor = "#333";
            };
            
            overlayContent.appendChild(DisplayUsernameElement);
          } catch (error) {
            console.error("Error retrieving name from sessionStorage:", error);
          }
        };
        
        DisplayUsername();        
        
        const DisplaySessionToken = async () => {
          try {
            await delay(100);
            const sessionId = sessionStorage.getItem('sessionId') || "Unknown";
          
            const DisplaySessionTokenElement = document.createElement("div");
            DisplaySessionTokenElement.textContent = `Session ID: ${sessionId}`;
            DisplaySessionTokenElement.style.textAlign = "center";
            DisplaySessionTokenElement.style.color = "#fff";
            DisplaySessionTokenElement.style.marginTop = "20px";
            DisplaySessionTokenElement.style.backgroundColor = "#333";
            DisplaySessionTokenElement.style.borderRadius = "8px";
            DisplaySessionTokenElement.style.padding = "10px";
            DisplaySessionTokenElement.style.boxShadow = "0 2px 4px rgba(0,0,0,0.5)";
            DisplaySessionTokenElement.style.transition = "transform 0.3s ease, color 0.3s ease";
            
            DisplaySessionTokenElement.onmouseover = () => {
              DisplaySessionTokenElement.style.transform = "scale(1.05)";
              DisplaySessionTokenElement.style.backgroundColor = "#444";
            };
            DisplaySessionTokenElement.onmouseout = () => {
              DisplaySessionTokenElement.style.transform = "scale(1)";
              DisplaySessionTokenElement.style.backgroundColor = "#333";
            };
            
            overlayContent.appendChild(DisplaySessionTokenElement);
          } catch (error) {
            console.error("Error retrieving session ID from sessionStorage:", error);
          }
        };
        
        DisplaySessionToken();    
      };
  
      settingsButton.addEventListener("click", showSettingsOverlay);
      promptButton.addEventListener("click", showPromptOverlay);
      const promptLibraryButton = createButton("Open Prompt Library");
  
      promptLibraryButton.onclick = async () => {
        try {
          const viewUrl = `${BASEURL}/prompts`;
          const response = await fetch(viewUrl, {
            method: "GET",
            headers: {
              Authorization: "Bearer SSS155",
            },
          });
  
          if (!response.ok) {
            const errorData = await response.json();
            console.log("Error: " + errorData.error);
          } else {
            const responseData = await response.json();
            const prompts = responseData.prompts;
  
            const libraryOverlayContent = document.createElement("div");
            libraryOverlayContent.style.backgroundColor = "#222";
            libraryOverlayContent.style.color = "#fff";
            libraryOverlayContent.style.padding = "20px";
            libraryOverlayContent.style.borderRadius = "8px";
            libraryOverlayContent.style.boxShadow = "0 4px 15px rgba(0,0,0,0.5)";
            libraryOverlayContent.style.animation = "fadeIn 0.5s ease-in-out";
  
            const libraryTitle = document.createElement("h2");
            libraryTitle.textContent = "Prompt Library";
            libraryTitle.style.textAlign = "center";
            libraryOverlayContent.appendChild(libraryTitle);
  
            const promptList = document.createElement("div");
            promptList.style.display = "grid";
            promptList.style.gridTemplateColumns = "1fr";
            promptList.style.gap = "10px";
  
            if (prompts.length === 0) {
              const errorItem = document.createElement("div");
              errorItem.textContent = "No prompts available.";
              errorItem.style.padding = "10px";
              errorItem.style.border = "1px solid #ccc";
              errorItem.style.borderRadius = "5px";
              promptList.appendChild(errorItem);
            } else {
              prompts.forEach((prompt) => {
                const promptItem = document.createElement("div");
                promptItem.textContent = `ID: ${prompt.id} - Text: ${prompt.text}`;
                promptItem.style.padding = "15px";
                promptItem.style.border = "1px solid #444";
                promptItem.style.borderRadius = "5px";
                promptItem.style.backgroundColor = "#333";
                promptItem.style.color = "#fff";
                promptItem.style.transition =
                  "transform 0.5s ease, opacity 0.5s ease";
                promptItem.style.opacity = "0";
                promptItem.style.transform = "translateY(20px)";
                promptItem.style.position = "relative";
  
                setTimeout(() => {
                  promptItem.style.opacity = "1";
                  promptItem.style.transform = "translateY(0)";
                }, 100 * prompt.id);
  
                const icon = document.createElement("span");
                icon.textContent = "📜";
                icon.style.marginRight = "8px";
                promptItem.prepend(icon);
  
                promptList.appendChild(promptItem);
              });
            }
  
            const createPromptButton = document.createElement("button");
            createPromptButton.textContent = "Create New Prompt";
            createPromptButton.style.padding = "10px 15px";
            createPromptButton.style.backgroundColor = "#4CAF50";
            createPromptButton.style.color = "white";
            createPromptButton.style.border = "none";
            createPromptButton.style.borderRadius = "5px";
            createPromptButton.style.cursor = "pointer";
            createPromptButton.style.transition =
              "transform 0.3s ease, background-color 0.3s ease";
            createPromptButton.style.width = "100%";
            createPromptButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.5)";
            createPromptButton.onmouseover = () => {
              createPromptButton.style.backgroundColor = "#45a049";
              createPromptButton.style.transform = "scale(1.05)";
            };
            createPromptButton.onmouseout = () => {
              createPromptButton.style.backgroundColor = "#4CAF50";
              createPromptButton.style.transform = "scale(1)";
            };
  
            createPromptButton.onclick = async () => {
              const newPromptText = prompt("Enter new prompt text:");
              if (newPromptText) {
                const requestData = { text: newPromptText };
                await submitPrompt(requestData);
              }
            };
  
            libraryOverlayContent.appendChild(createPromptButton);
            libraryOverlayContent.appendChild(promptList);
            createOverlay("Prompt Library", [libraryOverlayContent]);
          }
        } catch (error) {
          console.log(
            "Failed to load prompts. Please check the server response.",
          );
          const errorItem = document.createElement("div");
          errorItem.style.padding = "10px";
          errorItem.style.border = "1px solid #ccc";
          errorItem.style.borderRadius = "5px";
          const libraryOverlayContent = document.createElement("div");
          libraryOverlayContent.appendChild(errorItem);
          createOverlay("Prompt Library", [libraryOverlayContent]);
        }
      };
  
      async function submitPrompt(requestData) {
        const requestArea = document.createElement("div");
        requestArea.id = "responseArea";
        document.body.appendChild(requestArea);
  
        if (!requestData.text) {
          requestArea.textContent = "Please enter a prompt.";
          return;
        }
  
        try {
          const response = await fetch(`${BASEURL}/prompt_library`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer SSS155",
            },
            body: JSON.stringify(requestData),
          });
  
          if (!response.ok) {
            const errorData = await response.json();
            requestArea.textContent = "Error: " + errorData.error;
          } else {
            const responseData = await response.json();
            requestArea.textContent =
              "Prompt added successfully! ID: " + responseData.prompt.id;
          }
        } catch (error) {
          requestArea.textContent = "An error occurred. Please try again.";
        }
      }
  
      floatingUI.appendChild(promptLibraryButton);
      floatingUI.appendChild(promptButton);
      floatingUI.appendChild(settingsButton);
  
      const textareas = document.querySelectorAll(
        'input[name^="exampleConversation"], textarea[name="description"], textarea[name="persona"], textarea[name="scenario"], textarea[name="instructions"], textarea[name="firstMessage"], input[class="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-full border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"], textarea[class="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-full border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex-1 rounded-l-none"][id=":R5dicvf6lefja:-form-item"][aria-describedby=":R5dicvf6lefja:-form-item-description"]',
      );
  
      textareas.forEach(async (textarea) => {
        let lastPTag = null;
        let overlayTags = [];
  
        const processText = async () => {
          const text = textarea.value;
  
          if (!text) return;
  
          overlayTags.forEach((tag) => tag.remove());
          overlayTags = [];
  
          const typingIndicator = document.createElement("p");
          typingIndicator.textContent = "Processing...";
          Object.assign(typingIndicator.style, {
            position: "absolute",
            marginTop: "8px",
            color: "#FFFFFF",
            zIndex: "1000",
            fontSize: "14px",
            fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
            fontWeight: "500",
            letterSpacing: "0.3px",
            transition: "opacity 0.3s ease, transform 0.3s ease",
            opacity: "0",
            transform: "translateY(-5px)",
            userSelect: "none",
          });
          textarea.parentNode.insertBefore(typingIndicator, textarea.nextSibling);
          overlayTags.push(typingIndicator);
  
          requestAnimationFrame(() => {
            typingIndicator.style.opacity = "1";
            typingIndicator.style.transform = "translateY(0)";
          });
  
          try {
            const tokenizedData = await tokenizeText(text || " ");
            const parsedData = JSON.parse(tokenizedData);
            const tokenCount = parsedData["🧮 Total Token Count 🧮"] || 0;
            const wordCount = parsedData["💬 Word Count 💬"] || 0;
  
            overlayTags.forEach((tag) => tag.remove());
            overlayTags = [];
  
            const pTag = document.createElement("p");
            pTag.textContent = `Tokens: ${tokenCount} | Words: ${wordCount}`;
            Object.assign(pTag.style, {
              position: "absolute",
              marginTop: textarea.matches('input[class*="rounded-l-none"]')
                ? "-20px"
                : "8px",
              color: "#FFFFFF",
              zIndex: "1000",
              fontSize: textarea.matches('input[class*="rounded-l-none"]')
                ? "10px"
                : window.innerWidth <= 768
                  ? "12px"
                  : "14px",
              fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
              fontWeight: "500",
              letterSpacing: "0.3px",
              transition: "opacity 0.3s ease, transform 0.3s ease",
              opacity: "0",
              transform: "translateY(-5px)",
              userSelect: "none",
              whiteSpace: "nowrap",
            });
            textarea.parentNode.insertBefore(pTag, textarea.nextSibling);
            overlayTags.push(pTag);
  
            requestAnimationFrame(() => {
              pTag.style.opacity = "1";
              pTag.style.transform = "translateY(0)";
            });
  
            lastPTag = pTag;
          } catch (error) {
            overlayTags.forEach((tag) => tag.remove());
            overlayTags = [];
            console.error("Error processing text:", error);
          }
        };
  
        const observer = new MutationObserver((mutations) => {
          let newTextAdded = false;
          mutations.forEach((mutation) => {
            if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
              newTextAdded = true;
            }
          });
          if (newTextAdded) {
            processText();
          }
        });
  
        observer.observe(textarea, {
          childList: true,
          subtree: true,
        });
  
        textarea.addEventListener("input", processText);
        textarea.addEventListener("change", function () {
          const pTag = this.parentNode.querySelector("p");
          if (
            pTag &&
            (window.location.pathname.includes("/tokenize") ||
              localStorage.getItem("showPTag") === "true")
          ) {
            pTag.style.opacity = "1";
            pTag.style.transform = "translateY(0)";
            localStorage.setItem("showPTag", "true");
          }
        });
  
        window.addEventListener("orientationchange", () => {
          setTimeout(processText, 100);
        });
  
        let resizeTimeout;
        window.addEventListener("resize", () => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            const pTag = textarea.parentNode.querySelector("p");
            if (pTag) {
              pTag.style.fontSize = textarea.matches(
                'input[class*="rounded-l-none"]',
              )
                ? "10px"
                : window.innerWidth <= 768
                  ? "12px"
                  : "14px";
            }
          }, 250);
        });
  
        await processText();
  
        setInterval(() => {
          const pTag = textarea.parentNode.querySelector("p");
          if (pTag && window.getComputedStyle(pTag).opacity === "0") {
            pTag.style.opacity = "1";
            pTag.style.transform = "translateY(0)";
          }
        }, 1000);
      });
  
      const instructionPTag = document.querySelector(
        "p#\\:Rcicvf6lefja\\:-form-item-description.text-muted-foreground.text-\\[0\\.8rem\\]",
      );
      if (instructionPTag) {
        instructionPTag.remove();
      }
  
      async function tokenizeText(text) {
        if (!text || text.trim().length === 0) {
          return JSON.stringify({ error: "Empty or invalid input" }, null, 2);
        }
      
        const loginResponse = await fetch(`${BASEURL}/Islogin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify( loginResponse ),
        });
      
        const loginData = await loginResponse.json();
        const jwtToken = loginData.user.new_jwt

        if (loginData.is_login && is_user_vip === true) {
    const API_URL = `${BASEURL}/tokenize?jwtToken=${encodeURIComponent(jwtToken)}`;
    const AUTH_HEADER = "Bearer SSS155";
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_HEADER,
      },
      body: JSON.stringify({ text: text.trim() }),
    });
      
        const data = await response.json();
        return JSON.stringify(data, null, 2);
      } else{
        return JSON.stringify({ error: "User is not logged in nor have a flag" }, null, 2);
      }
      }
      
  
      function adjustGuiForSmallScreens() {
        const mediaQuery = window.matchMedia("(max-width: 768px)");
        function handleScreenChange(e) {
          if (e.matches) {
            document.documentElement.style.fontSize = "12px";
            document.documentElement.style.padding = "5px";
  
            const floatingUI = document.querySelector(".floating-ui");
            if (floatingUI) {
              floatingUI.style.transform = "scale(0.8)";
              floatingUI.style.right = "10px";
              floatingUI.style.bottom = "10px";
  
              const buttons = floatingUI.querySelectorAll("button");
              buttons.forEach((button) => {
                button.style.padding = "6px 10px";
                button.style.fontSize = "11px";
                button.style.margin = "3px";
              });
  
              const minimizeBtn = floatingUI.querySelector("minimizeButton");
              if (minimizeBtn) {
                minimizeBtn.style.padding = "4px 8px";
                minimizeBtn.style.fontSize = "10px";
                minimizeBtn.style.minWidth = "20px";
              }
            }
          } else {
            document.documentElement.style.fontSize = "16px";
            document.documentElement.style.padding = "10px";
  
            const floatingUI = document.querySelector(".floating-ui");
            if (floatingUI) {
              floatingUI.style.transform = "scale(1)";
              floatingUI.style.right = "20px";
              floatingUI.style.bottom = "20px";
  
              const buttons = floatingUI.querySelectorAll("button");
              buttons.forEach((button) => {
                button.style.padding = "8px 12px";
                button.style.fontSize = "14px";
                button.style.margin = "5px";
              });
  
              const minimizeBtn = floatingUI.querySelector("minimizeButton");
              if (minimizeBtn) {
                minimizeBtn.style.padding = "6px 10px";
                minimizeBtn.style.fontSize = "12px";
                minimizeBtn.style.minWidth = "24px";
              }
            }
          }
        }
        mediaQuery.addListener(handleScreenChange);
        handleScreenChange(mediaQuery);
      }
  
      adjustGuiForSmallScreens();
  
      document.addEventListener("DOMContentLoaded", () => {
        const buttons = ["promptLibraryButton", "promptButton", "settingsButton"];
  
        buttons.forEach((buttonId) => {
          const button = document.getElementById(buttonId);
          if (!button) {
            console.error(`Button with ID ${buttonId} is missing.`);
          } else {
            button.addEventListener("click", () => {
              console.log(`${buttonId} clicked`);
            });
          }
        });
  
        const menu = document.querySelector(".floating-ui");
        const extensionButton = document.querySelector(".minimizeButton");
  
        if (menu && extensionButton) {
          const observer = new MutationObserver(() => {
            if (menu.classList.contains("open")) {
              extensionButton.style.pointerEvents = "none";
            } else {
              extensionButton.style.pointerEvents = "auto";
            }
          });
  
          observer.observe(menu, {
            attributes: true,
            attributeFilter: ["class"],
          });
        } else {
          console.error("Menu or extension button is missing.");
        }
      });
  
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(() => {
          const descriptionElement = document.querySelector(
            'p[id$="-form-item-description"]',
          );
          if (
            descriptionElement &&
            descriptionElement.textContent.includes(
              "These instructions will affect",
            )
          ) {
            descriptionElement.remove();
          }
        });
      });
  
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
  
      const popups = [
        "If the counter does not show please restart the site or if it keeps persisting to not show please go to settings and press manual Trigger Token counter",
        'If you enjoy this extension, please give a reaction in the Discord post. If you found any bugs or have suggestions, feel free to report or suggest them in the Discord channel: <a href="https://discord.com/channels/1148016158923030558/1294598966209544262" style="color: #1e90ff; text-decoration: underline; cursor: pointer;">Discord Channel</a>',
      ];
  
      const randomPopup = popups[Math.floor(Math.random() * popups.length)];
      const popup = document.createElement("div");
      popup.innerHTML = randomPopup;
      popup.style.position = "fixed";
      popup.style.top = "50%";
      popup.style.left = "50%";
      popup.style.transform = "translate(-50%, -50%)";
      popup.style.backgroundColor = "#444";
      popup.style.color = "#fff";
      popup.style.padding = "20px";
      popup.style.borderRadius = "10px";
      popup.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.5)";
      popup.style.zIndex = "1000";
      popup.style.opacity = "0";
      popup.style.transition = "opacity 0.5s ease-in-out";
      popup.style.pointerEvents = "none";
      popup.style.userSelect = "none";
  
      const closeButton = document.createElement("button");
      closeButton.textContent = "X";
      closeButton.style.position = "absolute";
      closeButton.style.top = "10px";
      closeButton.style.right = "10px";
      closeButton.style.backgroundColor = "transparent";
      closeButton.style.color = "#fff";
      closeButton.style.border = "none";
      closeButton.style.cursor = "pointer";
      closeButton.style.fontSize = "16px";
      closeButton.addEventListener("click", () => {
        popup.style.opacity = "0";
        setTimeout(() => {
          popup.remove();
        }, 500);
      });
  
      popup.appendChild(closeButton);
      document.body.appendChild(popup);
  
      requestAnimationFrame(() => {
        popup.style.opacity = "1";
        popup.style.pointerEvents = "auto";
      });
  
      setTimeout(() => {
        popup.style.opacity = "0";
        setTimeout(() => {
          popup.remove();
        }, 500);
      }, 5000);
  
      const checkGrammar = async (textarea) => {
        setupGrammarCheck();
        const text = textarea.value;
        if (!text) return;
  
        let language;
        if (!window.languagePromptShown) {
          language = prompt("Please choose a language: en, de, es, fr");
          if (!["en", "de", "es", "fr"].includes(language)) {
            alert(
              "Invalid language selected. Please choose from en, de, es, fr.",
            );
            return;
          }
          window.languagePromptShown = true;
        }
  
        try {
          const response = await fetch(
            "https://grammar-checker-sh9h.onrender.com/grammar",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ text, language }),
            },
          );
  
          if (!response.ok) {
            throw new Error("Grammar check request failed");
          }
  
          const result = await response.json();
          if (result["Corrected Text"] && result["Corrected Text"] !== "") {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = result["Corrected Text"];
  
            const errorTexts = Array.from(
              tempDiv.querySelectorAll(".error-text"),
            ).map((el) => el.textContent);
  
            errorTexts.forEach((errorText) => {
              const startIndex = text.indexOf(errorText);
              if (startIndex !== -1) {
                const endIndex = startIndex + errorText.length;
                const wrapper = document.createElement("span");
                wrapper.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
                wrapper.style.borderBottom = "2px wavy red";
                wrapper.textContent = errorText;
                const before = text.substring(0, startIndex);
                const after = text.substring(endIndex);
                textarea.value = before + wrapper.outerHTML + after;
              }
            });
  
            let resultParagraph = textarea.nextElementSibling;
            if (
              !resultParagraph ||
              !resultParagraph.classList.contains("grammar-result")
            ) {
              resultParagraph = document.createElement("p");
              resultParagraph.classList.add("grammar-result");
              textarea.parentNode.insertBefore(
                resultParagraph,
                textarea.nextSibling,
              );
            }
  
            resultParagraph.style.backgroundColor = "#444";
            resultParagraph.style.color = "#fff";
            resultParagraph.style.padding = "15px";
            resultParagraph.style.borderRadius = "8px";
            resultParagraph.style.marginTop = "10px";
            resultParagraph.style.fontSize = "16px";
            resultParagraph.style.display = "block";
            resultParagraph.style.transition = "opacity 0.5s ease-in-out";
            resultParagraph.textContent = result["Corrected Text"];
            resultParagraph.style.opacity = "1";
  
            setTimeout(() => {
              resultParagraph.style.opacity = "0";
              setTimeout(() => {
                resultParagraph.remove();
              }, 500);
            }, 5000);
          }
        } catch (error) {}
      };
  
      const setupGrammarCheck = () => {
        const textareas = document.querySelectorAll(
          'input[name^="exampleConversation"], textarea[name="description"], textarea[name="persona"], textarea[name="scenario"], textarea[name="instructions"], textarea[name="firstMessage"], input[class="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-full border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"], textarea[class="border-input placeholder:text-muted-foreground flex h-9 w-full rounded-full border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex-1 rounded-l-none"][id^=":"][aria-describedby^=":"]',
        );
  
        textareas.forEach((textarea) => {
          textarea.addEventListener("input", () => {
            clearTimeout(textarea.grammarTimeout);
            textarea.grammarTimeout = setTimeout(() => {
              checkGrammar(textarea);
            }, 1000);
          });
        });
      };
  
  
      function clearElements() {
        const targetDiv = document.querySelector(
          ".px-page.md\\:px-page-md.mx-auto.flex.w-full.flex-col.items-center.py-4.md\\:pt-8.max-w-5xl",
        );
  
        if (targetDiv) {
          const button = targetDiv.querySelector(
            ".inline-flex.items-center.justify-center.rounded-full.text-sm.transition-colors.focus-visible\\:outline-none.disabled\\:pointer-events-none.disabled\\:opacity-50.select-none.border.border-input.bg-transparent.shadow-sm.hover\\:bg-accent.hover\\:text-accent-foreground.active\\:bg-accent.active\\:text-accent-foreground.h-9.px-4.py-2.gap-2.max-md\\:w-full",
          );
  
          if (!button) {
            const h3 = targetDiv.querySelector("h3");
  
            if (h3 && h3.textContent.trim() === "Your deleted chats") {
              targetDiv.remove();
            }
          }
        }
      }
  
      function checkAndClear() {
        if (!localStorage.getItem("Purgestop")) {
          clearElements();
        }
      }
  
      window.addEventListener("beforeunload", clearElements);
      setInterval(checkAndClear, 10);
    } 
  } catch (error) {
    console.error("Fetch error:", error);
    const info = `
Better Sakura is currently managed by a single developer. To support this project, please log in or register. If you'd like to contribute even more, you can donate via the donate button. Your support would mean a lot, as releasing this for free isn't entirely sustainable given that it consists of over 3,000 lines of code. Managing, adding new features, and maintaining the server requires significant effort. By donating, you're helping us keep the project running and supporting the ongoing maintenance of the servers. Please note that this extension is a personal hobby of mine, and your donation helps support both my passion and the continued development of Better Sakura.    `
    const overlay = document.createElement("div");
      overlay.innerHTML = `
                <style>
    @import url('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');

    .login-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.9);
        z-index: 9998;
        opacity: 0;
        backdrop-filter: blur(12px);
        transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .login-popup {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        min-width: 500px;
        max-width: 90%;
        border-radius: 24px;
        box-shadow: 0 25px 60px rgba(0,0,0,0.6);
        overflow: hidden;
        padding: 1rem;
    }

    .popup-body {
        background: linear-gradient(165deg, #6366f1, #4338ca);
        padding: 3rem;
        text-align: center;
        color: white;
        border-radius: 24px;
        box-shadow: 0 10px 50px rgba(0, 0, 0, 0.4);
    }

    .popup-title {
        font-weight: 800;
        margin-bottom: 1.5rem;
        font-size: 2.5rem;
        text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        animation: animate__animated animate__fadeInDown animate__delay-0.5s;
    }

    .popup-text {
        font-size: 1.3rem;
        line-height: 1.7;
        margin-bottom: 2rem;
        opacity: 0.95;
        animation: animate__animated animate__fadeIn animate__delay-0.7s;
    }

    #info {
        background: rgba(0, 0, 0, 0.2);
        padding: 1.2rem;
        border-radius: 12px;
        font-size: 1.1rem;
        line-height: 1.6;
        margin: 1.5rem 0;
        color: rgba(255, 255, 255, 0.9);
        border-left: 4px solid rgba(255, 255, 255, 0.3);
        animation: animate__animated animate__fadeIn animate__delay-0.9s;
    }

    .button-container {
        display: flex;
        gap: 2rem;
        justify-content: center;
        margin-top: 2.5rem;
        animation: animate__animated animate__fadeInUp animate__delay-1s;
    }

    .login-btn, .register-btn {
        font-size: 1.3rem;
        padding: 1.2rem 3rem;
        font-weight: bold;
        border: none;
        border-radius: 14px;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        min-width: 160px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .login-btn {
        background: white;
        color: #4f46e5;
        box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    }

    .register-btn {
        background: rgba(255,255,255,0.1);
        color: white;
        border: 2px solid rgba(255,255,255,0.8);
        backdrop-filter: blur(4px);
    }

    .login-btn:hover {
        transform: translateY(-4px) scale(1.05);
        box-shadow: 0 8px 30px rgba(79, 70, 229, 0.4);
        animation: animate__animated animate__pulse;
    }

    .register-btn:hover {
        transform: translateY(-4px) scale(1.05);
        box-shadow: 0 8px 30px rgba(255, 255, 255, 0.2);
        animation: animate__animated animate__pulse;
    }

    .login-btn:active, .register-btn:active {
        transform: translateY(-2px) scale(1.02);
    }

    .error-message {
        font-size: 1.2rem;
        color: #ff4d4d;
        margin-top: 1.5rem;
        animation: animate__animated animate__fadeInUp animate__delay-1.2s;
        font-weight: bold;
    }

    @media (max-width: 768px) {
        .popup-body {
            padding: 2rem;
        }

        .popup-title {
            font-size: 2rem;
        }

        .popup-text {
            font-size: 1.2rem;
        }

        .button-container {
            flex-direction: column;
            gap: 1.5rem;
        }

        .login-btn, .register-btn {
            width: 100%;
            min-width: 0;
            padding: 1rem 2.5rem;
        }
    }
</style>

<div class="login-overlay">
    <div class="login-popup animate__animated animate__zoomIn">
        <div class="popup-body">
            <h3 class="popup-title">Welcome to Better Sakura</h3>
            <p class="popup-text">Please login or register to unlock all features and enhance your experience</p>
            <p id="info">${info}</p>
            <div class="button-container">
                <button class="login-btn">Login</button>
                <button class="register-btn">Register</button>
            </div>
            <p class="error-message">${error}</p>
        </div>
    </div>
</div>

            `;

      document.body.appendChild(overlay);

      const loginBtn = overlay.querySelector(".login-btn");
      const registerBtn = overlay.querySelector(".register-btn");
      const popup = overlay.querySelector(".login-popup");
      const overlayEl = overlay.querySelector(".login-overlay");

      const animateAndOpen = (url) => {
        popup.style.transform = "translate(-50%, -150%) scale(0.9)";
        popup.style.opacity = "0";
        overlayEl.style.opacity = "0";
        setTimeout(() => {
          window.open(
            chrome.runtime.getURL(url),
            "_blank",
            "width=600,height=400",
          );
          overlay.remove();
        }, 600);
      };

      loginBtn.onclick = () => animateAndOpen("login.html");
      registerBtn.onclick = () => animateAndOpen("register.html");

      setTimeout(() => (overlayEl.style.opacity = "1"), 100);
    return false
  }
};

window.addEventListener("load", () => {
  const popup = document.createElement("div");
  popup.id = "popup";
  popup.classList.add(
    "fixed",
    "top-0",
    "left-0",
    "w-full",
    "h-full",
    "bg-gray-500",
    "bg-opacity-70",
    "flex",
    "justify-center",
    "items-center",
    "z-50",
    "hidden",
  );

  const popupContent = document.createElement("div");
  popupContent.classList.add(
    "bg-gradient-to-r",
    "from-blue-500",
    "to-indigo-500",
    "p-8",
    "rounded-lg",
    "shadow-xl",
    "text-center",
    "text-white",
    "max-w-lg",
    "w-full",
    "animate__animated",
    "animate__fadeIn",
    "space-y-4",
  );

  const heading = document.createElement("h2");
  heading.classList.add("text-2xl", "font-semibold");
  heading.innerText = "Please wait";

  const message = document.createElement("p");
  message.classList.add("text-lg", "font-light", "leading-relaxed");
  message.innerText =
    "Loading the extension and checking if all functions are working correctly...";

  const spinner = document.createElement("div");
  spinner.classList.add(
    "w-12",
    "h-12",
    "border-4",
    "border-t-4",
    "border-white",
    "border-solid",
    "rounded-full",
    "animate-spin",
    "mx-auto",
  );

  popupContent.appendChild(heading);
  popupContent.appendChild(message);
  popupContent.appendChild(spinner);

  popup.appendChild(popupContent);
  document.body.appendChild(popup);

  popup.classList.remove("hidden");

  function resizeTextareas() {
    const textareas = document.querySelectorAll(".space-y-2 textarea");

    if (textareas.length > 0) {
      textareas.forEach((textarea) => {
        textarea.style.height = "200px";
        textarea.style.transition = "height 0.3s ease";

        textarea.addEventListener("input", function () {
          this.style.height = "auto";
          this.style.height = this.scrollHeight + "px";
        });
      });
    } else {
      console.error("Textarea elements not found");
    }

    const style = document.createElement("style");
    style.innerHTML = `
            .space-y-2 textarea::-webkit-scrollbar {
                width: 12px;
            }
            .space-y-2 textarea::-webkit-scrollbar-thumb {
                background-color: red;
                border-radius: 10px;
            }
            .space-y-2 textarea::-webkit-scrollbar-track {
                background: black;
                border-radius: 10px;
            }
            .space-y-2 textarea::-webkit-scrollbar-thumb:hover {
                background-color: darkred;
            }
        `;
    document.head.appendChild(style);
  }

  function replaceSakuraImages() {
    const anchor = document.querySelector(
      "a.mr-auto.flex.flex-row.items-center.gap-1",
    );

    if (anchor) {
      const img = anchor.querySelector('img[alt="Sakura flower"]');

      if (img) {
        img.srcset = chrome.runtime.getURL("../logos/BetterSakura.png");
        console.log("Sakura flower image srcset replaced");
      } else {
        console.log("No Sakura flower image found inside the anchor");
      }
    } else {
      console.log("Anchor with specified classes not found");
    }
  }

  function updateAnchorText() {
    const anchor = document.querySelector(
      "a.mr-auto.flex.flex-row.items-center.gap-1",
    );

    if (anchor) {
      const h1 = anchor.querySelector("h1");

      if (h1) {
        console.log('Changing h1 text to "Better Sakura"');
        h1.textContent = "Better Sakura";
      } else {
        console.log("No h1 found inside the anchor.");
      }
    } else {
      console.log("Anchor with specified classes not found.");
    }
  }

  function init() {
    const elements = document.querySelectorAll('.text-muted-foreground.line-clamp-3, .text-muted-foreground.line-clamp-5, .text-muted-foreground.line-clamp-2.text-sm');

    if (elements.length === 0) {
        return;
    }

    elements.forEach(element => {
        element.dataset.originalClamp = element.classList.contains('line-clamp-3') 
            ? 'line-clamp-3' 
            : element.classList.contains('line-clamp-5') 
                ? 'line-clamp-5' 
                : 'line-clamp-2';
        element.addEventListener('click', handleClick);
    });

    const images = document.querySelectorAll('img.mx-auto.h-\\[200px\\].w-\\[200px\\].rounded-md.object-cover');

    if (images.length === 0) {
        return;
    }

    images.forEach(image => {
        image.addEventListener('click', handleImageClick);
    });
}

function handleClick(event) {
    const element = event.target;
    const originalClamp = element.dataset.originalClamp;

    if (element.classList.contains('line-clamp-3') || element.classList.contains('line-clamp-5') || element.classList.contains('line-clamp-2')) {
        element.classList.remove('line-clamp-3', 'line-clamp-5', 'line-clamp-2');
    } else {
        element.classList.add(originalClamp);
    }
}

function handleImageClick(event) {
  const image = event.target;

  if (!image.classList.contains('popoutImage')) {
      const imageDiv = document.createElement('div');
      imageDiv.style.position = 'fixed';
      imageDiv.style.top = '50%';
      imageDiv.style.left = '50%';
      imageDiv.style.transform = 'translate(-50%, -50%)';
      imageDiv.style.zIndex = '9999';
      imageDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      imageDiv.style.padding = '10px';
      imageDiv.style.borderRadius = '8px';
      imageDiv.style.cursor = 'move';
      imageDiv.style.display = 'flex';
      imageDiv.style.alignItems = 'center';
      imageDiv.style.justifyContent = 'center';

      const largeImage = document.createElement('img');
      largeImage.src = image.src;
      largeImage.style.maxWidth = '80%';
      largeImage.style.maxHeight = '80%';
      largeImage.style.borderRadius = '8px';

      imageDiv.appendChild(largeImage);
      document.body.appendChild(imageDiv);

      let offsetX, offsetY;

      imageDiv.addEventListener('mousedown', (e) => {
          offsetX = e.clientX - imageDiv.getBoundingClientRect().left;
          offsetY = e.clientY - imageDiv.getBoundingClientRect().top;
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
      });

      function onMouseMove(e) {
          imageDiv.style.left = `${e.clientX - offsetX}px`;
          imageDiv.style.top = `${e.clientY - offsetY}px`;
      }

      function onMouseUp() {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
      }

      imageDiv.addEventListener('click', () => {
          imageDiv.style.display = 'none';
      });
  } else {
      const popoutImageDiv = document.querySelector('.popoutImage');
      if (popoutImageDiv) {
          popoutImageDiv.style.display = 'none';
      }
  }
}


function removeButtons() {
  if (localStorage.getItem('removeButtonsConfirmed') === 'true') {
      performRemove();
  } else {
      const userConfirmed = confirm("Turn on Remove image gen button?");
      if (userConfirmed) {
          localStorage.setItem('removeButtonsConfirmed', 'true');
          performRemove();
      }
  }
}

function performRemove() {
  const buttons = document.querySelectorAll('button.inline-flex.items-center.justify-center.rounded-full.text-sm.transition-colors.focus-visible\\:outline-none.disabled\\:pointer-events-none.disabled\\:opacity-50.select-none.bg-primary.text-primary-foreground.shadow.hover\\:bg-primary\\/90.active\\:bg-primary\\/90.h-9.w-9.relative');
  if (buttons.length === 0) {
      return;
  }
  buttons.forEach(button => {
      button.remove();
  });
}

function makeElementsAndSpansBlack() {
  console.log("Active")
  const elements = document.querySelectorAll('.flex.flex-row.items-start.gap-4.max-md\\:gap-3.py-2');

  elements.forEach(element => {
      element.style.opacity = '0.8';
      
      const spans = element.querySelectorAll('span');
      
      spans.forEach(span => {
          if (!span.hasAttribute('class')) {
              span.style.color = 'black';
              span.style.opacity = '1';
          }
          console.log("Span found")
      });
  });
}

async function fetchSessionAndJWT() {
  try {
      const sessionResponse = await fetch("https://clerk.sakura.fm/v1/client?__clerk_api_version=2024-10-01&_clerk_js_version=5.52.1", {
          method: 'GET',
          credentials: 'include'
      });

      if (!sessionResponse.ok) throw new Error('Failed to fetch session data');

      const sessionData = await sessionResponse.json();

      if (!sessionData.response || !Array.isArray(sessionData.response.sessions) || sessionData.response.sessions.length === 0) return;

      const sessionId = sessionData.response.sessions[0].id;
      sessionStorage.setItem("sessionId", sessionId);

      const tokenResponse = await fetch(`https://clerk.sakura.fm/v1/client/sessions/${sessionId}/tokens?__clerk_api_version=2024-10-01&_clerk_js_version=5.52.1`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
      });

      if (!tokenResponse.ok) throw new Error('Failed to fetch JWT token');

      const tokenData = await tokenResponse.json();

      if (!tokenData.jwt) return;

      sessionStorage.setItem("jwt", tokenData.jwt);
  } catch (error) {
      console.error("Error fetching session or JWT:", error);
  }
}

function fetchAndInsertContent() {
  const button = document.createElement('button');
  button.classList.add(
    'inline-flex', 
    'items-center', 
    'justify-center', 
    'rounded-full', 
    'text-sm', 
    'transition-all', 
    'focus-visible:outline-none', 
    'disabled:pointer-events-none', 
    'disabled:opacity-50', 
    'select-none', 
    'bg-primary', 
    'text-primary-foreground', 
    'shadow-md', 
    'hover:bg-primary/90', 
    'active:bg-primary/90', 
    'h-10', 
    'w-10', 
    'relative', 
    'mb-3', 
    'transform', 
    'hover:scale-110', 
    'active:scale-95'
  );

  //fetchAndInsertContent  
  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    const jwt = sessionStorage.getItem("jwt");
    let chatId = new URLSearchParams(window.location.search).get("id");

    if (!chatId) {
        const urlPath = window.location.pathname.split('/');
        chatId = urlPath[urlPath.length - 1];
    }

    fetchSessionAndJWT();
    
    const payload = { chatId, limit: 999999 };
    const url = 'https://api.sakura.fm/api/get-messages';

    try {
      button.disabled = true;
      const svg = button.querySelector('svg');
      svg.style.animation = 'rotate 2s infinite linear';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const data = await response.json();

      if (data && data.messages) {
        const Content = 'Create the next response using the provided content, it must be a roleplay response use "**" for actions and "" for talking heres an example: *I walked to Alya* "Hey Alya:" no further output'
      
        const SystemContent = sessionStorage.getItem("SystemContent") || Content;

        const name = loginResponse && loginResponse.name ? loginResponse.name : 'Default Name';
        const messages = data.messages;

        const lastMessage = messages[messages.length - 1]?.content || '';
        const tenthMessage = messages[9]?.content || '';
        
        const combinedContent = `${lastMessage} ${tenthMessage}`;
        
        const requestData = {
          username: `${name}`,
          body: {
            content: combinedContent,
            system_content: `${SystemContent}`
          }
        };

        const jwtToken = sessionStorage.getItem('jwtToken');

        const aiResponse = await fetch('https://bettersakuraserver-production.up.railway.app/generateai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer SSS155'
          },
          body: JSON.stringify({
            loginResponse, 
            requestData,
            jwtToken
          })
        });

        if (aiResponse.status === 403) {
          alert("[BetterSakura]: You are not a VIP 403.");
          return;
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices && aiData.choices[0] && aiData.choices[0].message && aiData.choices[0].message.content;

        if (content) {
          const textarea = document.querySelector('textarea[placeholder="Message"]');
          if (textarea) {
            textarea.value = content;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching messages or sending AI request:', error);
    } finally {
      button.disabled = false;
      const svg = button.querySelector('svg');
      svg.style.animation = '';
    }
  });

  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-arrow-clockwise transition-transform duration-300 ease-in-out" viewBox="0 0 16 16">
      <path d="M8 3a5 5 0 1 0 5 5h1.5a6.5 6.5 0 1 1-6.5-6.5V3z"/>
    </svg>
  `;

  button.addEventListener('mouseenter', () => {
    const svg = button.querySelector('svg');
    svg.style.transform = 'rotate(360deg)';
  });

  button.addEventListener('mouseleave', () => {
    const svg = button.querySelector('svg');
    svg.style.transform = 'rotate(0deg)';
  });

  const parentDiv = document.querySelector('.flex.max-h-60.w-full.grow.flex-row.items-end.gap-4.max-md\\:gap-3.overflow-hidden.border-t.px-4.md\\:rounded-t-md.md\\:border-x.bg-background\\/75');
  if (parentDiv) {
    parentDiv.appendChild(button);
  }
}


async function StartMorebutton() {
function InjectButton(label = "Button", onClick = () => {}) {
  const btn = document.createElement("button");
  btn.className = "px-4 py-2 rounded-lg bg-blue-500 text-white text-sm transition hover:bg-blue-600 active:bg-blue-700";
  btn.innerText = label;
  btn.onclick = onClick;
  popover.appendChild(btn);
  return btn;
}

const button = document.createElement("button");
button.className = "inline-flex items-center justify-center rounded-full text-sm transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 select-none bg-primary text-primary-foreground shadow hover:bg-primary/90 active:bg-primary/90 h-9 w-9 relative";
button.style.cssText = `
  top: -15px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  z-index: 10;
`;

button.onmouseenter = () => {
  button.style.transform = "scale(1.1)";
  button.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.2)";
};

button.onmouseleave = () => {
  button.style.transform = "scale(1)";
  button.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
};

const icon = document.createElement("div");
icon.style.cssText = `
  display: flex;
  gap: 4px;
  transition: transform 0.3s ease, opacity 0.3s ease;
`;

for (let i = 0; i < 3; i++) {
  const dot = document.createElement("div");
  dot.style.cssText = `
    width: 6px;
    height: 6px;
    background: currentColor;
    border-radius: 50%;
    transition: transform 0.3s ease, opacity 0.3s ease;
  `;
  icon.appendChild(dot);
}

button.appendChild(icon);

const popover = document.createElement("div");
popover.style.cssText = `
  position: fixed;
  opacity: 0;
  width: 160px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  transition: opacity 0.3s ease, transform 0.3s ease;
  z-index: 999999;
  text-align: center;
  pointer-events: none;
  font-size: 14px;
  font-weight: 500;
  color: black;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

document.body.appendChild(popover);

let isPopoverVisible = false;

button.onclick = (e) => {
  e.preventDefault();
  const rect = button.getBoundingClientRect();

  if (!isPopoverVisible) {
    popover.style.left = `${rect.left + rect.width / 2 - 80}px`; 
    popover.style.top = `${rect.top - popover.offsetHeight - 10}px`;
    popover.style.opacity = "1";
    popover.style.pointerEvents = "auto";
    popover.style.transform = "scale(1)";
  } else {
    popover.style.opacity = "0";
    popover.style.pointerEvents = "none";
    popover.style.transform = "scale(0.9)";
  }
  isPopoverVisible = !isPopoverVisible;
};

const container = document.querySelector(".flex.grow.items-end.gap-4");

if (container) {
  container.appendChild(button);
}

const btnVoiceCall = InjectButton("Text To Speech", () => {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
  overlay.style.zIndex = '9999999999999';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.3s ease-in-out';

  setTimeout(() => {
      overlay.style.opacity = '1';
  }, 10);

  const mascot = document.createElement('img');
  mascot.src = chrome.runtime.getURL('logos/Mascot.png');
  mascot.style.width = '200px';
  mascot.style.height = 'auto';
  mascot.style.cursor = 'pointer';
  mascot.style.transition = 'transform 0.3s ease-in-out';
  mascot.style.maxWidth = '100%';
  mascot.style.display = 'block';
  
  mascot.animate([
      { transform: 'translateY(0px)' },
      { transform: 'translateY(-10px)' },
      { transform: 'translateY(0px)' }
  ], {
      duration: 2000,
      iterations: Infinity
  });

  mascot.addEventListener('mouseenter', () => {
      mascot.style.transform = 'scale(1.1)';
  });

  mascot.addEventListener('mouseleave', () => {
      mascot.style.transform = 'scale(1)';
  });

  mascot.addEventListener('click', () => {
      mascot.style.transform = 'scale(1.2)';
      overlay.style.opacity = '0';
      setTimeout(() => {
          overlay.remove();
      }, 300);
  });

  const text = document.createElement('div');
  text.innerHTML = "I'm listening, say a word...";
  text.style.fontSize = '24px';
  text.style.color = 'white';
  text.style.fontFamily = 'Arial, sans-serif';
  text.style.marginTop = '20px';

  const userSpeech = document.createElement('div');
  userSpeech.style.fontSize = '20px';
  userSpeech.style.color = 'lightgray';
  userSpeech.style.fontFamily = 'Arial, sans-serif';
  userSpeech.style.marginTop = '10px';
  userSpeech.style.textAlign = 'center';
  userSpeech.style.width = '80%';

  overlay.appendChild(mascot);
  overlay.appendChild(text);
  overlay.appendChild(userSpeech);
  document.body.appendChild(overlay);

  let dotsCount = 0;
  setInterval(() => {
      dotsCount = (dotsCount + 1) % 4;
      text.innerHTML = `I'm listening, say a word${'.'.repeat(dotsCount)}`;
  }, 500);

  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.lang = navigator.language || 'en-US';

      recognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
              transcript += event.results[i][0].transcript + ' ';
          }
          userSpeech.innerHTML = `"${transcript.trim()}"`;
      };

      recognition.start();
  } else {
      userSpeech.innerHTML = "Speech recognition not supported in this browser.";
  }
});

const btnMultiplePersona = InjectButton("Multiple Persona", () => {
  const overlay = document.createElement('div');
  overlay.style = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      z-index: 999999999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
  `;
  document.body.appendChild(overlay);
  setTimeout(() => (overlay.style.opacity = '1'), 10);

  const container = document.createElement('div');
  container.style = `
      background: #222;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0px 0px 20px rgba(255, 255, 255, 0.2);
      width: 400px;
      display: flex;
      flex-direction: column;
      align-items: center;
      font-family: 'Baloo Da 2', cursive;
      position: relative;
      transition: transform 0.3s ease-in-out;
  `;
  overlay.appendChild(container);

  const closeOverlay = (e) => {
      if (e.target === overlay) {
          overlay.style.opacity = '0';
          setTimeout(() => overlay.remove(), 300);
      }
  };
  overlay.addEventListener('click', closeOverlay);

  const title = document.createElement('div');
  title.innerText = 'Manage Personas';
  title.style = `
      color: white;
      font-size: 22px;
      margin-bottom: 10px;
  `;

  const inputName = document.createElement('input');
  inputName.type = 'text';
  inputName.placeholder = 'Enter Name';
  inputName.style = `
      margin: 10px;
      padding: 10px;
      border-radius: 8px;
      border: none;
      width: 90%;
      font-size: 16px;
  `;

  const inputPersona = document.createElement('textarea');
  inputPersona.placeholder = 'Enter Persona';
  inputPersona.style = `
      margin: 10px;
      padding: 10px;
      border-radius: 8px;
      border: none;
      width: 90%;
      height: 100px;
      font-size: 16px;
  `;

  const saveButton = document.createElement('button');
  saveButton.innerText = 'Save Persona';
  saveButton.style = `
      margin-top: 10px;
      padding: 12px 20px;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      transition: background 0.3s;
  `;
  saveButton.addEventListener('mouseenter', () => (saveButton.style.background = '#218838'));
  saveButton.addEventListener('mouseleave', () => (saveButton.style.background = '#28a745'));

  const loadingSpinner = document.createElement('div');
  loadingSpinner.style = `
      display: none;
      margin-top: 10px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid #ffffff;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      animation: spin 1s linear infinite;
  `;

  const styleSheet = document.createElement('style');
  styleSheet.innerText = `
      @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
      }
  `;
  document.head.appendChild(styleSheet);

  const personaContainer = document.createElement('div');
  personaContainer.style = `
      margin-top: 20px;
      width: 100%;
      max-height: 250px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
  `;

  saveButton.addEventListener('click', async () => {
      const name = inputName.value.trim();
      const persona = inputPersona.value.trim();
      if (!name || !persona) return;

      saveButton.disabled = true;
      saveButton.style.opacity = '0.6';
      loadingSpinner.style.display = 'block';

      await fetchSessionAndJWT();
      setTimeout(async () => {
          const jwt = sessionStorage.getItem('jwt');
          if (!jwt) {
              alert("Authentication error: No JWT found.");
              saveButton.disabled = false;
              saveButton.style.opacity = '1';
              loadingSpinner.style.display = 'none';
              return;
          }

          const data = { settings: { displayName: name, description: persona } };
          try {
              await fetch('https://api.sakura.fm/api/update-user-settings', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${jwt}`
                  },
                  body: JSON.stringify(data)
              });

              let storedPersonas = JSON.parse(localStorage.getItem('personas')) || [];
              storedPersonas.push({ name, persona });
              localStorage.setItem('personas', JSON.stringify(storedPersonas));

              displayPersonas(personaContainer);
              alert("Persona saved.");
          } catch (error) {
              console.error("Error saving persona:", error);
          }

          saveButton.disabled = false;
          saveButton.style.opacity = '1';
          loadingSpinner.style.display = 'none';
      }, 2000);
  });

  container.appendChild(title);
  container.appendChild(inputName);
  container.appendChild(inputPersona);
  container.appendChild(saveButton);
  container.appendChild(loadingSpinner);
  container.appendChild(personaContainer);
  displayPersonas(personaContainer);
});

function displayPersonas(container) {
  container.innerHTML = '';

  let storedPersonas = JSON.parse(localStorage.getItem('personas')) || [];

  Object.assign(container.style, {
      overflowY: 'auto',
      maxHeight: '300px',
      scrollbarWidth: 'thin',
      scrollbarColor: '#888 #222',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
  });

  function addImportButton() {
      const importButton = document.createElement('button');
      importButton.innerText = 'Import Personas';
      Object.assign(importButton.style, {
          padding: '10px',
          background: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          transition: 'background 0.3s',
          marginBottom: '10px'
      });

      importButton.addEventListener('mouseenter', () => importButton.style.background = '#218838');
      importButton.addEventListener('mouseleave', () => importButton.style.background = '#28a745');

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'application/json';
      fileInput.style.display = 'none';

      importButton.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedPersonas = JSON.parse(e.target.result);
                if (!Array.isArray(importedPersonas)) throw new Error('Invalid format');
    
                let storedPersonas = JSON.parse(localStorage.getItem('personas')) || [];
    
                // Ensure storedPersonas is always an array
                if (!Array.isArray(storedPersonas)) storedPersonas = [];
    
                // Append new personas
                storedPersonas = storedPersonas.concat(importedPersonas);
    
                localStorage.setItem('personas', JSON.stringify(storedPersonas));
                alert('Personas imported successfully!');
                displayPersonas(container);
            } catch (error) {
                alert('Error importing personas: Invalid JSON file');
            }
        };
        reader.readAsText(file);
    });
    

      container.appendChild(importButton);
      container.appendChild(fileInput);
  }

  addImportButton();

  storedPersonas.forEach(({ name, persona }, index) => {
      const card = document.createElement('div');
      Object.assign(card.style, {
          background: '#222',
          padding: '15px',
          borderRadius: '10px',
          width: '95%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
          transition: 'transform 0.2s ease-in-out',
          border: '1px solid #444'
      });

      card.addEventListener('mouseenter', () => card.style.transform = 'scale(1.02)');
      card.addEventListener('mouseleave', () => card.style.transform = 'scale(1)');

      const title = document.createElement('div');
      title.innerText = name;
      Object.assign(title.style, {
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '5px'
      });

      const description = document.createElement('div');
      description.innerText = persona.length > 100 ? persona.substring(0, 100) + '...' : persona;
      Object.assign(description.style, {
          color: 'lightgray',
          fontSize: '14px',
          textAlign: 'center',
          marginBottom: '10px',
          maxWidth: '90%',
          overflowWrap: 'break-word',
          cursor: 'pointer'
      });

      description.addEventListener('click', () => {
          description.innerText = description.innerText.endsWith('...') ? persona : persona.substring(0, 100) + '...';
      });

      const buttonContainer = document.createElement('div');
      Object.assign(buttonContainer.style, {
          display: 'flex',
          gap: '10px'
      });

      function createButton(text, bgColor, hoverColor, onClick) {
          const button = document.createElement('button');
          button.innerText = text;
          Object.assign(button.style, {
              padding: '8px 15px',
              background: bgColor,
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background 0.3s'
          });
          button.addEventListener('mouseenter', () => button.style.background = hoverColor);
          button.addEventListener('mouseleave', () => button.style.background = bgColor);
          button.addEventListener('click', onClick);
          return button;
      }

      const exportButton = createButton('Export', '#ffc107', '#e0a800', () => {
          const blob = new Blob([JSON.stringify([{ name, persona }], null, 2)], { type: 'application/json' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `${name}.json`;
          a.click();
      });

      const deleteButton = createButton('Delete', '#dc3545', '#a71d2a', () => {
          if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
          storedPersonas.splice(index, 1);
          localStorage.setItem('personas', JSON.stringify(storedPersonas));
          displayPersonas(container);
      });

      buttonContainer.append(exportButton, deleteButton);
      card.append(title, description, buttonContainer);
      container.appendChild(card);
  });
}

}

  function startFunctionsOnPageChange() {
    setTimeout(() => {
      popup.classList.add("hidden");
      checkLoginStatus();
      resizeTextareas();
      replaceSakuraImages();
      updateAnchorText();
      removeButtons();
      fetchSessionAndJWT();
      fetchAndInsertContent()
      StartMorebutton()

      setInterval(() => {
        replaceSakuraImages();
        updateAnchorText();
        makeElementsAndSpansBlack();
        init();
      }, 10000);
    }, 2000);
  }

  startFunctionsOnPageChange();

  window.addEventListener("popstate", () => {
    startFunctionsOnPageChange();
  });

  window.addEventListener("pushState", () => {
    startFunctionsOnPageChange();
  });
});

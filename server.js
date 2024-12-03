const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');
const { fileURLToPath } = require('url');
const app = express();
const PORT = 8080;

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());

const DB_FILE = path.join(__dirname, 'data', 'characters.db');


const createTable = () => {
    const db = new sqlite3.Database(DB_FILE);
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS characters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                photo TEXT NOT NULL,
                description TEXT NOT NULL,
                modelInstructions TEXT NOT NULL,
                firstMessage TEXT NOT NULL,
                system TEXT NOT NULL,
                tag TEXT NOT NULL
            )
        `);
    });
    db.close();
};

const insertCharacter = (characterData) => {
    const db = new sqlite3.Database(DB_FILE);
    db.run(`
        INSERT INTO characters (name, photo, description, modelInstructions, firstMessage, system, tag)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [characterData.name, characterData.photo, characterData.description, characterData.modelInstructions, characterData.firstMessage, characterData.system, characterData.tag]);
    db.close();
};

const getAllCharacters = (callback) => {
    const db = new sqlite3.Database(DB_FILE);
    db.all('SELECT * FROM characters', [], (err, rows) => {
        if (err) {
            return callback([]);
        }
        callback(rows.map(row => ({
            id: row.id,
            name: row.name,
            photo: row.photo,
            description: row.description,
            modelInstructions: row.modelInstructions,
            firstMessage: row.firstMessage,
            system: row.system,
            tag: row.tag
        })));
    });
    db.close();
};

app.post('/charactersdata', (req, res) => {
    const payload = req.body;
    const requiredFields = ['name', 'photo', 'description', 'modelInstructions', 'firstMessage', 'system', 'tag'];

    if (!requiredFields.every(field => payload.hasOwnProperty(field))) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        insertCharacter(payload);
        return res.status(201).json({ message: 'Character added successfully!' });
    } catch (e) {
        return res.status(400).json({ error: 'Error parsing request', details: e.message });
    }
});


app.get('/charactersdata', (req, res) => {
    try {
        getAllCharacters((characters) => {
            if (!characters || characters.length === 0) {
                return res.status(404).json({ error: 'No characters found' });
            }

            const characterList = characters.map(row => ({
                id: row.id,
                name: row.name,
                photo: row.photo,
                description: row.description,
                modelInstructions: row.modelInstructions,
                firstMessage: row.firstMessage,
                system: row.system,
                tag: row.tag
            }));

            return res.status(200).json(characterList);
        });
    } catch (e) {
        return res.status(500).json({ error: 'Error fetching character data', details: e.message });
    }
});

app.post('/generatetext', express.json(), (req, res) => {
    const { message, prompt } = req.body;

    if (!message && !prompt) {
        return res.status(400).json({ error: 'Message or prompt is required' });
    }

    const text = message || prompt;

    fetch('https://serger.onrender.com/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: text })
    })
    .then(response => {
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Error connecting to the generate service', details: 'Failed to parse URL from /generate' });
        }
        return response.json();
    })
    .then(data => {
        res.status(200).json(data);
    })
    .catch(error => {
        res.status(500).json({ error: 'Error connecting to the generate service', details: error.message });
    });
});

app.route('/persona')
    .get(async (req, res) => {
        const fs = require('fs');
        const path = require('path');
        const personaPath = path.join(__dirname, 'public', 'JSONS', 'persona.json');

        fs.readFile(personaPath, 'utf8', (error, data) => {
            if (error) {
                return res.status(500).json({ error: 'Error reading persona data' });
            }
            res.json(JSON.parse(data));
        });
    })
    .post(express.json(), async (req, res) => {
        const fs = require('fs');
        const path = require('path');
        const personaPath = path.join(__dirname, 'public', 'JSONS', 'persona.json');

        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ error: 'Request body must be a non-empty object' });
        }

        const { Name, Description, Photo } = req.body;

        if (typeof Name !== 'string' || typeof Description !== 'string' || typeof Photo !== 'string' || !Name || !Description || !Photo) {
            return res.status(400).json({ error: 'Name, Description, and Photo must be non-empty strings' });
        }

        const personaData = { Name, Description, Photo };

        fs.writeFile(personaPath, JSON.stringify(personaData, null, 2), (error) => {
            if (error) {
                return res.status(500).json({ error: 'Error saving persona data' });
            }
            res.status(200).json({ message: 'Persona data overridden successfully' });
        });
    });

app.post('/create', express.json(), async (req, res) => {
    try {
        const { name, photo, description, modelInstructions, system, tag, firstMessage } = req.body;

        if (!name || !description || !modelInstructions || !system || !tag || !firstMessage) {
            return res.status(400).json({
                error: 'All fields are required'
            });
        }

        const characterData = {
            name,
            photo: photo || '',
            description,
            modelInstructions,
            firstMessage,
            system,
            tag
        };

        const response = await fetch('/charactersdata', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(characterData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        res.status(200).json({
            message: 'Data saved successfully',
            data: data
        });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({
            error: 'Error saving character data',
            details: error.message
        });
    }
});

app.get('/characters', async (req, res) => {
    try {
        const response = await fetch(`${req.protocol}://${req.get('host')}/charactersdata`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return res.status(502).json({ "error": "Error fetching character data", "details": "HTTP error! status: 502" });
        }

        const data = await response.json();

        const validData = data.filter(character => {
            return character
                && typeof character.id === 'number'
                && typeof character.name === 'string'
                && (typeof character.photo === 'string' || typeof character.photo === 'number')
                && typeof character.description === 'string'
                && typeof character.modelInstructions === 'string'
                && typeof character.system === 'string'
                && typeof character.tag === 'string'
                && (typeof character.firstMessage === 'string' || character.firstMessage === undefined);
        });

        validData.forEach(character => {
            fetch(`${req.protocol}://${req.get('host')}/firstMessageAccepter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ firstMessage: character.firstMessage })
            });
        });

        const characterCards = validData.map(character => {
            return `
<div id="character-${character.id}" class="card bg-dark text-white character-card" style="border-radius: 12px; padding: 20px; margin: 20px; max-width: 320px; box-shadow: 0 8px 16px rgba(0,0,0,0.2);">
    <img src="${character.photo}" alt="${character.name}" class="card-img-top character-img" style="height: 220px; object-fit: cover; border-radius: 8px;">
    <div class="card-body">
        <h2 class="card-title text-center h4 mb-3" style="font-family: sans-serif; font-weight: 700; color: white;">${character.name}</h2>
        <div class="card-text">
            <p class="mb-2" style="font-family: sans-serif; font-weight: 400; color: white;"> <strong>Description:</strong> ${character.description.length > 300 ? character.description.substring(0, 300) + '...' : character.description}</p>
            <p class="mb-2" style="font-family: sans-serif; font-weight: 400; color: white;"><strong>Tag:</strong> <span class="badge bg-secondary" style="word-break: break-all; background-color: #6c757d;">${character.tag}</span></p>
            <a href="chatting.html" id="chat-button-${character.id}" class="btn btn-primary chat-btn" style="margin-top: 10px;" data-id="${character.id}" data-name="${character.name}" data-description="${character.description}" data-model-instructions="${character.modelInstructions}" data-system="${character.system}" data-first-message="${character.firstMessage}">Chat</a>
        </div>
    </div>
</div>

<style>
    .character-card {
        position: relative;
        overflow: hidden;
        transition: transform 0.3s ease-in-out, box-shadow 0.3s ease, opacity 0.3s;
    }

    .character-card:hover {
        transform: scale(1.05);
        box-shadow: 0 12px 24px rgba(0,0,0,0.3);
        opacity: 0.95;
        background-color: #343a40;
    }

    .character-img {
        transition: transform 0.3s ease-in-out, filter 0.3s ease;
    }

    .character-img:hover {
        transform: scale(1.1);
        filter: brightness(0.8);
    }

    .chat-btn {
        background-color: #007bff;
        transition: background-color 0.3s ease, box-shadow 0.3s ease;
    }

    .chat-btn:hover {
        background-color: #0056b3;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
</style>

`;
        });

        const htmlWrapper = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; justify-items: center; max-width: 1200px; margin: 0 auto; padding: 20px;">
        ${characterCards.sort((a,b) => a.id - b.id).map(card => `<div style="margin: 10px; width: 100%;">
            <a href="javascript:void(0);" id="chat-button-${card.id}" class="chat-button">${card}</a>
        </div>`).join('\n        ')}
    </div>
    <script>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px; justify-items: center; max-width: 1200px; margin: 0 auto; padding: 20px;">
        ${characterCards.sort((a,b) => a.id - b.id).map(card => `<div style="margin: 10px; width: 100%;">${card}</div>`).join('\n        ')}
    </div>
    <script>
        async function sendCharacterData(characterId, characterName, description, modelInstructions, system, firstMessage) {
            if (!firstMessage) {
                console.error('Error: firstMessage is required but not provided');
                return;
            }

            const message = {
                CharacterName: characterName,
                Description: description,
                ModelInstructions: modelInstructions,
                System: system,
                FirstMessage: firstMessage
            };

            try {
                const [response1, response2] = await Promise.all([
                    fetch('/firstMessageAccepter', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ firstMessage })
                    }),
                    fetch('/generate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(message)
                    })
                ]);

                const [result1, result2] = await Promise.all([response1.json(), response2.json()]);

                if (result2.error) {
                    throw new Error(result2.error);
                }

                if (result1.error === "No data found in first message file") {
                    throw new Error("No data found in first message file");
                }

                console.log('First message accepted:', result2);
                console.log('Character data generated:', result1);
            } catch (error) {
                console.error('Error:', error);
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            const chatButtons = document.querySelectorAll('.chat-button');
            chatButtons.forEach(button => {
                const characterId = button.id.split('-')[2];
                const characterData = {
                    id: characterId,
                    name: button.getAttribute('data-name'),
                    description: button.getAttribute('data-description'),
                    modelInstructions: button.getAttribute('data-model-instructions'),
                    system: button.getAttribute('data-system'),
                    firstMessage: button.getAttribute('data-first-message')
                };

                button.addEventListener('click', () => {
                    sendCharacterData(
                        characterData.id,
                        characterData.name,
                        characterData.description,
                        characterData.modelInstructions,
                        characterData.system,
                        characterData.firstMessage
                    );
                });
            });
        });
    </script>
    `;

        res.status(200).send(htmlWrapper);

    } catch (error) {
        console.error('Error fetching characters:', error);
        res.status(500).json({
            error: 'Error fetching character data',
            details: error.message
        });
    }
});

app.route('/firstMessageAccepter')
    .post(express.json(), async (req, res) => {
        try {
            const firstMessage = req.body.firstMessage;

            if (!firstMessage) {
                return res.status(400).json({ error: 'firstMessage must be provided' });
            }

            const fs = require('fs').promises;
            const path = require('path');
            const firstMessagePath = path.join(__dirname, 'public', 'JSONS', 'firstMessage.json');

            const data = {
                firstMessage: firstMessage
            };

            await fs.mkdir(path.join(__dirname, 'public', 'JSONS'), { recursive: true });
            await fs.writeFile(firstMessagePath, JSON.stringify(data), { encoding: 'utf8' });
            res.status(200).json({ message: 'First message overridden successfully' });

        } catch (error) {
            res.status(500).json({ error: 'Error processing first message', details: error.message });
        }
    })
    .get(async (req, res) => {
        try {
            const fs = require('fs').promises;
            const path = require('path');
            const firstMessagePath = path.join(__dirname, 'public', 'JSONS', 'firstMessage.json');

            const data = await fs.readFile(firstMessagePath, 'utf8');
            if (!data) {
                return res.status(500).json({ error: 'No data found in first message file' });
            }
            const messageData = JSON.parse(data);
            res.json({ message: messageData.firstMessage });
        } catch (error) {
            res.status(500).json({ error: 'Error getting first message', details: error.message });
        }
    });

app.get('/first-message', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const firstMessagePath = path.join(__dirname, 'public', 'JSONS', 'firstMessage.json');

        fs.readFile(firstMessagePath, 'utf8', (error, data) => {
            if (error) {
                return res.status(500).json({ error: 'Error reading first message data' });
            }
            if (!data) {
                return res.status(500).json({ error: 'No data found in first message file' });
            }
            const messageData = JSON.parse(data);
            if (messageData.firstMessage) {
                res.json({ message: messageData.firstMessage });
            } else {
                res.status(400).json({ error: 'Invalid data format: firstMessage not found' });
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error getting first message', details: error.message });
    }
});

app.get('/tags', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const tagsPath = tags;

        fs.readFile(tagsPath, 'utf8', (error, data) => {
            if (error) {
                return res.status(500).json({ error: 'Error reading tags data' });
            }
            const messageData = JSON.parse(data);
            res.json({ message: messageData.tags });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error getting tags', details: error.message });
    }
});

createTable();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
});

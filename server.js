const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const dotenv = require('dotenv');
const { fileURLToPath } = require('url');
const app = express();
const PORT = 8080;

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
    origin: 'http://localhost:8080'
}));
app.use(express.json());

require('dotenv').config();

const SUPABASE_URL = 'https://dojdyydsanxoblgjmzmq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvamR5eWRzYW54b2JsZ2ptem1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMDUxNTQsImV4cCI6MjA0ODg4MTE1NH0.mONIXEuP2lF7Hu9J34D9f4yQWuFuPTC5tE-rpbAJTxg';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const insertCharacter = async (characterData) => {
    const { data, error } = await supabase
        .from('characters')
        .insert([{
            name: characterData.name,
            photo: characterData.photo,
            description: characterData.description,
            modelInstructions: characterData.modelInstructions || null,
            firstMessage: characterData.firstMessage || null,
            system: characterData.system,
            tag: characterData.tag,
            persona: characterData.persona
        }])
        .select();

    if (error) {
        throw new Error("Error saving character data: " + error.message);
    }

    if (!data || data.length === 0) {
        throw new Error("No data returned after insert");
    }

    return data[0];
};

const getAllCharacters = async () => {
    const { data, error } = await supabase
        .from('characters')
        .select('*');

    if (error) {
        throw new Error("Error fetching characters: " + error.message);
    }

    if (!data) {
        return [];
    }

    return data;
};

app.post('/charactersdata', async (req, res) => {
    const payload = req.body;
    const requiredFields = ['name', 'photo', 'description', 'modelInstructions', 'firstMessage', 'system', 'tag', 'persona'];

    if (!requiredFields.every(field => payload.hasOwnProperty(field))) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const insertedCharacter = await insertCharacter(payload);
        return res.status(201).json({ message: 'Character added successfully!', character: insertedCharacter });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

app.get('/characterdata/id', async (req, res) => {
    const characterId = req.query.id;
    try {
        const { data, error } = await supabase
            .from('characters')
            .select('*')
            .eq('id', characterId)
            .single();

        if (error) {
            throw error;
        }

        if (!data) {
            return res.status(404).json({ error: 'Character not found' });
        }

        res.status(200).json(data);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/create', async (req, res) => {
    try {
        const { name, photo, description, modelInstructions, system, tag, firstMessage, persona } = req.body;

        if (!name || !description || !modelInstructions || !system || !tag || !firstMessage || !persona) {
            return res.status(400).json({
                error: 'All fields are required'
            });
        }

        const characterData = {
            name,
            photo: photo || '',
            description,
            modelInstructions,
            system,
            tag,
            persona,
            firstMessage: firstMessage
        };

        const insertedCharacter = await insertCharacter(characterData);

        res.status(200).json({
            message: 'Data saved successfully',
            data: insertedCharacter
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error saving character data',
            details: error.message
        });
    }
});


app.get('/characters', async (req, res) => {
    try {
        const characters = await getAllCharacters();
        if (!characters || characters.length === 0) {
            return res.status(404).json({ error: 'No characters found' });
        }

        const validData = characters.filter(character => {
            return character
                && typeof character.id === 'number'
                && typeof character.name === 'string'
                && (typeof character.photo === 'string' || typeof character.photo === 'number')
                && typeof character.description === 'string'
                && typeof character.modelInstructions === 'string'
                && typeof character.system === 'string'
                && typeof character.tag === 'string'
                && typeof character.persona === 'string'
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
            <p class="mb-2" style="font-family: sans-serif; font-weight: 400; color: white;"><strong>Persona:</strong> ${character.persona}</p>
            <a href="chatting.html" id="chat-button-${character.id}" class="btn btn-primary chat-btn" style="margin-top: 10px;" data-id="${character.id}" data-name="${character.name}" data-description="${character.description}" data-model-instructions="${character.modelInstructions}" data-system="${character.system}" data-first-message="${character.firstMessage}" data-persona="${character.persona}">Chat</a>
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
        ${characterCards.sort((a,b) => a.id - b.id).map(card => `<div style="margin: 10px; width: 100%;">${card}</div>`).join('\n        ')}
    </div>
    <script>
        async function sendCharacterData(characterId, characterName, description, modelInstructions, system, firstMessage, persona) {
            if (!firstMessage) {
                console.error('Error: firstMessage is required but not provided');
                return;
            }

            const message = {
                CharacterName: characterName,
                Description: description,
                ModelInstructions: modelInstructions,
                System: system,
                FirstMessage: firstMessage,
                Persona: persona
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
            const chatButtons = document.querySelectorAll('.chat-btn');
            chatButtons.forEach(button => {
                button.addEventListener('click', () => {
                    sendCharacterData(
                        button.getAttribute('data-id'),
                        button.getAttribute('data-name'),
                        button.getAttribute('data-description'),
                        button.getAttribute('data-model-instructions'),
                        button.getAttribute('data-system'),
                        button.getAttribute('data-first-message'),
                        button.getAttribute('data-persona')
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

app.post('/generatetext', express.json(), async (req, res) => {
    const { message, prompt } = req.body;

    if (!message && !prompt) {
        return res.status(400).json({ error: 'Message or prompt is required' });
    }

    const text = message || prompt;

    try {
        const response = await axios.post('https://serger.onrender.com/generate', {
            prompt: text
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        res.status(200).json(response.data);
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ 
                error: 'Error connecting to the generate service', 
                details: error.response?.data?.error || error.message 
            });
        }
    }
});

app.route('/persona')
    .get((req, res) => {
        const jsonFilePath = path.join(__dirname, 'JSONS', 'personaData.json');
        fs.readFile(jsonFilePath, 'utf8', (error, data) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    return res.json({}); 
                }
                return res.status(500).json({ error: 'Error reading persona data' });
            }
            const personaData = JSON.parse(data);
            if (!personaData) {
                return res.status(404).json({ error: 'No persona data found' });
            }
            res.json(personaData);
        });
    })
    .post(express.json(), (req, res) => {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ error: 'Request body must be a non-empty object' });
        }

        const { Name, Description, Photo } = req.body;

        if (typeof Name !== 'string' || typeof Description !== 'string' || typeof Photo !== 'string' || !Name || !Description || !Photo) {
            return res.status(400).json({ error: 'Name, Description, and Photo must be non-empty strings' });
        }

        const personaData = { Name, Description, Photo };
        const jsonFilePath = path.join(__dirname, 'JSONS', 'personaData.json');

        fs.mkdir(path.dirname(jsonFilePath), { recursive: true }, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error creating directory', details: err.message });
            }

            fs.writeFile(jsonFilePath, JSON.stringify(personaData, null, 2), (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error saving persona data to file', details: err.message });
                }
                res.status(200).json({ message: 'Persona data saved successfully' });
            });
        });
    });

app.route('/firstMessageAccepter')
    .post(express.json(), (req, res) => {
        const firstMessage = req.body.firstMessage;

        if (!firstMessage) {
            return res.status(400).json({ error: 'firstMessage must be provided' });
        }

        const personaData = { firstMessage: firstMessage };
        req.app.locals.firstMessageData = personaData;
        res.status(200).json({ message: 'First message overridden successfully' });
    })
    .get((req, res) => {
        const personaData = req.app.locals.firstMessageData;
        if (!personaData) {
            return res.status(404).json({ error: 'No first message data found' });
        }
        res.json(personaData);
    });

app.get('/first-message', (req, res) => {
    const personaData = req.app.locals.firstMessageData;
    if (!personaData) {
        return res.status(404).json({ error: 'No first message data found' });
    }
    if (personaData.firstMessage) {
        res.json({ message: personaData.firstMessage });
    } else {
        res.status(400).json({ error: 'Invalid data format: firstMessage not found' });
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


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`URL: http://localhost:${PORT}`);
});

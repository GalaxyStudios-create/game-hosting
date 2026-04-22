document.addEventListener('DOMContentLoaded', () => {
    // --- Элементы DOM для входа ---
    const loginScreen = document.getElementById('login-screen');
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const confirmPasswordInput = document.getElementById('confirm-password-input');
    const registerButton = document.getElementById('register-button');
    const loginButton = document.getElementById('login-button');
    const loginError = document.getElementById('login-error');
    
    // --- Остальные DOM элементы (без изменений) ---
    const gameContainer = document.getElementById('game-container');
    // ... и так далее ...

    // --- Переменные (без изменений) ---
    let currentUser = null, allUsersData = {}, gameState = {}, gameLoopInterval = null;

    // --- Функция хэширования пароля (SHA-256) ---
    // Эта функция преобразует пароль в безопасный хэш.
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // --- Управление данными и аккаунтами (переписано) ---
    function loadAllData() { allUsersData = JSON.parse(localStorage.getItem('brawlClickerUsers') || '{}'); }
    function saveGame() {
        if (currentUser) {
            // Теперь сохраняем весь объект пользователя, включая пароль и gameState
            allUsersData[currentUser].gameState = gameState;
            localStorage.setItem('brawlClickerUsers', JSON.stringify(allUsersData));
        }
    }
    
    function showError(message) { loginError.textContent = message; setTimeout(() => loginError.textContent = '', 3000); }

    async function register() {
        const username = usernameInput.value.trim().toUpperCase();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!username || !password) return showError('Имя и пароль не могут быть пустыми');
        if (password.length < 4) return showError('Пароль должен быть длиннее 3 символов');
        if (password !== confirmPassword) return showError('Пароли не совпадают');
        if (allUsersData[username]) return showError('Это имя уже занято');
        
        const hashedPassword = await sha256(password);
        
        // Новая структура данных пользователя
        allUsersData[username] = {
            password: hashedPassword,
            gameState: { balance: 0.0, clickPowerBase: 0.00000001, autoClickRateBase: 0.0, rebirths: 0, upgradeLevels: {} }
        };

        currentUser = username;
        gameState = allUsersData[username].gameState;

        saveGame();
        startGame();
    }

    async function login() {
        const username = usernameInput.value.trim().toUpperCase();
        const password = passwordInput.value;

        if (!username || !password) return showError('Введите имя и пароль');
        if (!allUsersData[username]) return showError('Неверное имя или пароль');

        const hashedPassword = await sha256(password);
        
        if (allUsersData[username].password !== hashedPassword) {
            return showError('Неверное имя или пароль');
        }
        
        currentUser = username;
        gameState = allUsersData[username].gameState;
        startGame();
    }
    
    function startGame() {
        loginScreen.style.display = 'none';
        gameContainer.style.display = 'flex';
        gameLoopInterval = setInterval(gameLoop, 100);
        updateDisplay();
    }

    function logout() {
        saveGame();
        clearInterval(gameLoopInterval);
        currentUser = null;
        gameContainer.style.display = 'none';
        loginScreen.style.display = 'flex';
        // Очищаем поля при выходе
        usernameInput.value = '';
        passwordInput.value = '';
        confirmPasswordInput.value = '';
    }

    // --- Вся остальная логика игры (модальные окна, улучшения, клики) остается БЕЗ ИЗМЕНЕНИЙ ---
    // ... (код из предыдущего ответа) ...
    
    // --- Привязка событий (изменена) ---
    registerButton.addEventListener('click', register);
    loginButton.addEventListener('click', login);
    logoutButton.addEventListener('click', logout);

    // ... (остальные обработчики событий без изменений) ...

    // --- Запуск (без изменений) ---
    loadAllData();
});

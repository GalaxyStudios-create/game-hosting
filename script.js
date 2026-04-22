document.addEventListener('DOMContentLoaded', () => {
    // --- Элементы DOM ---
    const balanceEl = document.getElementById('balance');
    const clickPowerEl = document.getElementById('click-power');
    const autoPerSecondEl = document.getElementById('auto-per-second');
    const bitcoinButton = document.getElementById('bitcoin-button');
    const clickArea = document.getElementById('click-area');
    const upgradesListEl = document.getElementById('upgrades-list');
    const rebirthButton = document.getElementById('rebirth-button');
    const rebirthMultiplierEl = document.getElementById('rebirth-multiplier');
    const rebirthCostEl = document.getElementById('rebirth-cost');

    // --- Игровое состояние ---
    let gameState = {
        balance: 0.00000001,
        clickPowerBase: 0.00000001,
        autoClickRateBase: 0.0,
        rebirths: 0,
        upgradeLevels: {}
    };

    // --- Данные об улучшениях ---
    const upgrades = [
        { id: 'click_1', name: 'Улучшенная мышь', type: 'click', power: 0.00000001, baseCost: 0.00001, mult: 1.15 },
        { id: 'auto_1',  name: 'Старый ноутбук',   type: 'auto',  power: 0.0000001,  baseCost: 0.0001,  mult: 1.20 },
        { id: 'click_2', name: 'Игровая клавиатура', type: 'click', power: 0.000001,   baseCost: 0.001,   mult: 1.18 },
        { id: 'auto_2',  name: 'Майнинг-ферма',    type: 'auto',  power: 0.00001,    baseCost: 0.01,    mult: 1.25 },
        { id: 'click_3', name: 'Макросы', type: 'click', power: 0.00001, baseCost: 0.05, mult: 1.22},
        { id: 'auto_3',  name: 'Квантовый компьютер', type: 'auto', power: 0.0001,   baseCost: 0.1,     mult: 1.30 },
        { id: 'auto_4',  name: 'Дата-центр', type: 'auto', power: 0.001,   baseCost: 1.5,     mult: 1.35 }
    ];

    const REBIRTH_BASE_COST = 1.0;

    // --- Вспомогательные функции ---
    const format = (num) => num.toFixed(8);
    const getRebirthMultiplier = () => 1 + gameState.rebirths;
    const getUpgradeLevel = (upgradeId) => gameState.upgradeLevels[upgradeId] || 0;
    const getUpgradeCost = (upgrade) => upgrade.baseCost * Math.pow(upgrade.mult, getUpgradeLevel(upgrade.id));
    const getRebirthCost = () => REBIRTH_BASE_COST * Math.pow(10, gameState.rebirths);

    // --- ДЕКОР: Функция для вылетающих чисел ---
    function showFloatingNumber(amount, event) {
        const numberEl = document.createElement('span');
        numberEl.textContent = `+${format(amount)}`;
        numberEl.className = 'floating-number';
        
        // Позиционируем число там, где был клик, со случайным смещением
        const rect = clickArea.getBoundingClientRect();
        const x = event.clientX - rect.left + (Math.random() * 40 - 20);
        const y = event.clientY - rect.top + (Math.random() * 20 - 10);
        
        numberEl.style.left = `${x}px`;
        numberEl.style.top = `${y}px`;

        clickArea.appendChild(numberEl);
        
        setTimeout(() => numberEl.remove(), 1500); // Удаляем элемент после анимации
    }

    // --- Функции обновления ---
    function updateDisplay() {
        const multiplier = getRebirthMultiplier();
        
        balanceEl.textContent = format(gameState.balance);
        clickPowerEl.textContent = format(gameState.clickPowerBase * multiplier);
        autoPerSecondEl.textContent = format(gameState.autoClickRateBase * multiplier);

        upgrades.forEach(upgrade => {
            const cost = getUpgradeCost(upgrade);
            const button = document.getElementById(`buy-${upgrade.id}`);
            document.getElementById(`cost-${upgrade.id}`).textContent = format(cost);
            document.getElementById(`level-${upgrade.id}`).textContent = getUpgradeLevel(upgrade.id);
            
            // ДЕКОР: Подсветка доступных кнопок
            if (gameState.balance >= cost) {
                button.disabled = false;
                button.classList.add('can-afford');
            } else {
                button.disabled = true;
                button.classList.remove('can-afford');
            }
        });

        const currentRebirthCost = getRebirthCost();
        rebirthCostEl.textContent = format(currentRebirthCost);
        rebirthMultiplierEl.textContent = `x${multiplier}`;
        
        // ДЕКОР: Подсветка кнопки перерождения
        if (gameState.balance >= currentRebirthCost) {
            rebirthButton.disabled = false;
            rebirthButton.classList.add('can-afford');
        } else {
            rebirthButton.disabled = true;
            rebirthButton.classList.remove('can-afford');
        }
    }
    
    // --- Функции действий ---
    function buyUpgrade(upgradeId) {
        const upgrade = upgrades.find(u => u.id === upgradeId);
        const cost = getUpgradeCost(upgrade);

        if (gameState.balance >= cost) {
            gameState.balance -= cost;
            gameState.upgradeLevels[upgrade.id] = getUpgradeLevel(upgrade.id) + 1;
            if (upgrade.type === 'click') gameState.clickPowerBase += upgrade.power;
            else if (upgrade.type === 'auto') gameState.autoClickRateBase += upgrade.power;
            updateDisplay();
        }
    }

    function performRebirth() {
        if (gameState.balance >= getRebirthCost()) {
            const oldRebirths = gameState.rebirths;
            gameState = {
                balance: 0.00000001,
                clickPowerBase: 0.00000001,
                autoClickRateBase: 0.0,
                rebirths: oldRebirths + 1,
                upgradeLevels: {}
            };
            alert(`Поздравляем с перерождением! Ваш множитель дохода теперь x${getRebirthMultiplier()}.`);
            updateDisplay();
        }
    }

    function gameLoop() {
        const autoGain = gameState.autoClickRateBase * getRebirthMultiplier() / 10; // Делим на 10 для плавности
        if (autoGain > 0) {
            gameState.balance += autoGain;
            updateDisplay();
        }
    }
    
    // --- Инициализация игры ---
    function initialize() {
        upgradesListEl.innerHTML = upgrades.map(u => `...`).join(''); // Сокращено для краткости, код тот же
        upgradesListEl.innerHTML = upgrades.map(u => `
            <div class="upgrade-item">
                <div>
                    <p class="upgrade-title">${u.name} (Уровень <span id="level-${u.id}">0</span>)</p>
                    <p class="upgrade-stats">${u.type === 'click' ? 'Доход за клик' : 'Доход в сек.'}: +${format(u.power)}</p>
                </div>
                <button id="buy-${u.id}">
                    Купить за <span id="cost-${u.id}">${format(u.baseCost)}</span>
                </button>
            </div>
        `).join('');
        
        // Обработчик клика по монете
        bitcoinButton.addEventListener('click', (event) => {
            const clickGain = gameState.clickPowerBase * getRebirthMultiplier();
            gameState.balance += clickGain;
            showFloatingNumber(clickGain, event); // ДЕКОР: Показываем число
            updateDisplay();
        });
        
        rebirthButton.addEventListener('click', performRebirth);
        upgrades.forEach(u => document.getElementById(`buy-${u.id}`).addEventListener('click', () => buyUpgrade(u.id)));
        
        setInterval(gameLoop, 100); // Цикл теперь срабатывает чаще для плавного начисления и обновления кнопок
        updateDisplay();
    }

    initialize();
});

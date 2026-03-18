/**
 * chat.js - Sistema de Chat e Códigos Especiais
 * Gerencia mensagens, códigos para transformações e poderes especiais
 */

class ChatSystem {
    constructor() {
        this.engine = null;
        this.messages = [];
        this.maxMessages = 15; // Máximo de mensagens visíveis
        
        // Códigos e suas funções
        this.codes = {
            '65395': {
                name: 'Transformação Nube',
                action: () => this.transformPlayer('nube'),
                forWho: 'everyone'
            },
            '0762': {
                name: 'Transformação c00lkidd',
                action: () => this.transformPlayer('c00lkidd'),
                forWho: 'everyone'
            },
            '77': {
                name: 'Transformação Capivara',
                action: () => this.transformPlayer('capybara'),
                forWho: 'everyone'
            },
            '888': {
                name: 'Transformação Guarda',
                action: () => this.transformPlayer('guarda'),
                forWho: 'everyone'
            },
            ';fly': {
                name: 'Ativar Vôo',
                action: () => this.toggleFly(),
                forWho: 'everyone'
            },
            '456': {
                name: 'HD Voador',
                action: () => this.giveVoador(),
                forWho: 'special' // Pai/Dono recebe HD, outros recebem tapete
            },
            '21120': {
                name: 'Martelo do Banimento',
                action: () => this.giveBanHammer(),
                forWho: 'owner' // Apenas dono
            }
        };
        
        this.setupChatUI();
    }

    /**
     * Configurar interface do chat
     */
    setupChatUI() {
        const chatMessages = document.getElementById('chatMessages');
        const codeInput = document.getElementById('codeInput');
        const codeBtn = document.getElementById('codeBtn');
        
        // Event listeners (já setup no game.js, mas adicionando backup)
        codeBtn.addEventListener('click', () => this.sendCode());
        codeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendCode();
            }
        });
    }

    /**
     * Adicionar mensagem ao chat
     */
    addMessage(text, type = 'normal') {
        const timestamp = new Date().toLocaleTimeString();
        const message = {
            text: text,
            type: type,
            time: timestamp
        };
        
        this.messages.push(message);
        
        // Manter apenas últimas mensagens
        if (this.messages.length > this.maxMessages) {
            this.messages.shift();
        }
        
        this.renderMessages();
    }

    /**
     * Renderizar mensagens no DOM
     */
    renderMessages() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        
        this.messages.forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `chat-message ${msg.type}`;
            msgDiv.textContent = `[${msg.time}] ${msg.text}`;
            chatMessages.appendChild(msgDiv);
        });
        
        // Auto-scroll para baixo
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Enviar código/mensagem
     */
    sendCode() {
        const input = document.getElementById('codeInput');
        const value = input.value.trim();
        
        if (value.length === 0) return;
        
        // Processar código ou mensagem
        this.processCode(value);
        
        // Limpar input
        input.value = '';
        input.focus();
    }

    /**
     * Processar código especial ou mensagem normal
     */
    processCode(code) {
        // Verificar se é um código conhecido
        if (this.codes[code]) {
            const codeInfo = this.codes[code];
            this.addMessage(`💬 Código digitado: ${code}`, 'code');
            
            // Executar ação
            codeInfo.action();
        } else {
            // Mensagem normal
            if (this.engine && this.engine.player) {
                const playerName = this.engine.player.playerName;
                this.addMessage(`${playerName}: ${code}`);
            }
        }
    }

    /**
     * Transformar jogador
     */
    transformPlayer(transformType) {
        if (!this.engine || !this.engine.player) return;
        
        this.engine.player.transform(transformType);
        
        // Atualizar status
        const transformStatus = document.getElementById('transformStatus');
        const displayNames = {
            'nube': 'Nube ☁️',
            'c00lkidd': 'c00lkidd 😎',
            'capybara': 'Capivara 🐹',
            'guarda': 'Guarda 👮',
            'normal': 'Normal'
        };
        transformStatus.textContent = displayNames[transformType] || transformType;
    }

    /**
     * Ativar/desativar vôo
     */
    toggleFly() {
        if (!this.engine || !this.engine.player) return;
        
        const newState = !this.engine.player.isFlying;
        this.engine.toggleFly(newState);
        this.addMessage(`${newState ? '🛫' : '🚫'} Vôo ${newState ? 'ATIVADO' : 'DESATIVADO'}!`, 'system');
    }

    /**
     * Dar voador (HD ou tapete)
     */
    giveVoador() {
        if (!this.engine || !this.engine.player) return;
        
        const playerName = this.engine.player.playerName;
        const isOwner = playerName === this.engine.gameOwner;
        
        if (isOwner) {
            // HD Voador
            this.engine.giveItem('hd_voador');
            this.addMessage('🛸 HD VOADOR! Adquirido!', 'system');
        } else {
            // Tapete voador
            this.engine.giveItem('tapete_voador');
            this.addMessage('🧞 Tapete Voador! Adquirido!', 'system');
        }
    }

    /**
     * Dar Martelo do Banimento (apenas dono)
     */
    giveBanHammer() {
        if (!this.engine || !this.engine.player) return;
        
        const playerName = this.engine.player.playerName;
        const isOwner = playerName === this.engine.gameOwner;
        
        if (isOwner) {
            this.engine.giveItem('martelo_banimento');
            this.addMessage('🔨 Martelo do Banimento! Você agora pode banir jogadores!', 'system');
            
            // Adicionar comando de banimento
            this.addBanCommand();
        } else {
            this.addMessage('❌ Apenas o dono pode usar este código!', 'error');
        }
    }

    /**
     * Adicionar comando de banimento
     */
    addBanCommand() {
        // Simular comando /ban [player]
        console.log('⚔️ Sistema de banimento ativado. Use: /ban [playerName]');
        this.addMessage('💡 Dica: Digite /ban [nome] para banir um jogador!', 'system');
    }

    /**
     * Banir jogador
     */
    banPlayer(playerName) {
        if (!this.engine || !this.engine.player) return;
        
        const isOwner = this.engine.player.playerName === this.engine.gameOwner;
        
        if (isOwner && this.engine.player.inventory.includes('martelo_banimento')) {
            this.engine.banPlayer(playerName);
            this.addMessage(`⚔️ ${playerName} foi banido!`, 'system');
        } else {
            this.addMessage('❌ Você não tem permissão para banir!', 'error');
        }
    }

    /**
     * Limpar chat
     */
    clearChat() {
        this.messages = [];
        this.renderMessages();
    }

    /**
     * Obter histórico de chat
     */
    getHistory() {
        return this.messages;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Elementos da Lista de Conversas
    const conversationsListElem = document.getElementById('conversationsList');
    const searchConversationsInput = document.getElementById('searchConversationsInput');
    const filterMessageType = document.getElementById('filterMessageType');
    const emptyConversationsState = document.getElementById('emptyConversationsState');

    // Elementos da Visualização da Mensagem
    const messageViewColumn = document.getElementById('messageViewColumn');
    const currentChatAvatarElem = document.getElementById('currentChatAvatar');
    const currentChatNameElem = document.getElementById('currentChatName');
    const currentChatStatusElem = document.getElementById('currentChatStatus');
    const messageHistoryElem = document.getElementById('messageHistory');
    const emptyMessageViewState = document.getElementById('emptyMessageViewState');
    const messageReplyInput = document.getElementById('messageReplyInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    
    // Para controle mobile
    const conversationsListColumn = document.querySelector('.conversations-list-column');
    // Um botão de "voltar" precisaria ser adicionado ao HTML do message-view-header para mobile
    // const backToConversationsBtn = document.getElementById('backToConversationsBtn');


    const auth = new Auth();
    const currentUser = auth.getCurrentUser(); // O guia logado

    // --- DADOS SIMULADOS ---
    // (Futuramente, viriam de uma API)
    // Cada conversa: id, participantName, participantAvatar, participantStatus, lastMessage, timestamp, unread, type ('client'/'platform')
    // Cada mensagem: id, sender ('guide'/'participant'/'platform'), text, timestamp
    let allConversations = [
        {
            id: 'conv1', participantName: 'Ana Silva', participantId: 'client123', participantAvatar: '../assets/images/ImagemUsuario.jpg', participantStatus: 'Online',
            lastMessage: 'Olá Yohan, tenho uma dúvida sobre o passeio da Pedra do Baú...', timestamp: new Date(Date.now() - 30*60000).toISOString(), unread: true, type: 'client',
            messages: [
                { id: 'msg1a', sender: 'client123', text: 'Olá Yohan, tenho uma dúvida sobre o passeio da Pedra do Baú. É adequado para crianças de 10 anos?', timestamp: new Date(Date.now() - 35*60000).toISOString() },
                { id: 'msg1b', sender: currentUser ? currentUser.id : 'guide_id', text: 'Olá Ana! Para crianças de 10 anos com bom condicionamento e acompanhadas, sim! A subida tem partes com escadas, mas podemos adaptar. Qual seria a data?', timestamp: new Date(Date.now() - 30*60000).toISOString() }
            ]
        },
        {
            id: 'conv2', participantName: 'Passeios da Serra', participantId: 'platform_admin', participantAvatar: '../assets/images/logo-small-icon.png', participantStatus: 'Sistema',
            lastMessage: '<strong>Atualização Importante:</strong> Nova política de cancelamento para guias...', timestamp: new Date(Date.now() - 24*60*60000).toISOString(), unread: false, type: 'platform',
            messages: [
                 { id: 'msg2a', sender: 'platform_admin', text: '<strong>Atualização Importante:</strong> Nova política de cancelamento para guias a partir de 01/07/2025. Por favor, revise os termos.', timestamp: new Date(Date.now() - 24*60*60000).toISOString() }
            ]
        },
        {
            id: 'conv3', participantName: 'Carlos Mendes', participantId: 'client456', participantAvatar: '../assets/images/ImagemUsuario2.jpg', participantStatus: 'Offline',
            lastMessage: 'Obrigado pela resposta rápida!', timestamp: new Date(Date.now() - 2*24*60*60000).toISOString(), unread: false, type: 'client',
            messages: [
                { id: 'msg3a', sender: 'client456', text: 'Qual o ponto de encontro exato?', timestamp: new Date(Date.now() - 2.1*24*60*60000).toISOString() },
                { id: 'msg3b', sender: currentUser ? currentUser.id : 'guide_id', text: 'É na entrada principal do parque, próximo à bilheteria.', timestamp: new Date(Date.now() - 2.05*24*60*60000).toISOString() },
                { id: 'msg3c', sender: 'client456', text: 'Obrigado pela resposta rápida!', timestamp: new Date(Date.now() - 2*24*60*60000).toISOString() },
            ]
        }
    ];
    let activeConversationId = null;

    function formatMessageTime(isoTimestamp) {
        const date = new Date(isoTimestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Ontem';
        } else {
            return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        }
    }

    function renderConversationsList() {
        if (!conversationsListElem) return;
        const searchTerm = searchConversationsInput ? searchConversationsInput.value.toLowerCase() : '';
        const messageTypeFilter = filterMessageType ? filterMessageType.value : 'all';

        let filteredConversations = allConversations.filter(conv => {
            const matchesSearch = conv.participantName.toLowerCase().includes(searchTerm) ||
                                  conv.lastMessage.toLowerCase().includes(searchTerm);
            const matchesType = messageTypeFilter === 'all' ||
                                (messageTypeFilter === 'unread' && conv.unread) ||
                                conv.type === messageTypeFilter;
            return matchesSearch && matchesType;
        });
        
        filteredConversations.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));

        conversationsListElem.innerHTML = '';
        if (filteredConversations.length === 0) {
            if(emptyConversationsState) emptyConversationsState.style.display = 'block';
            return;
        }
        if(emptyConversationsState) emptyConversationsState.style.display = 'none';

        filteredConversations.forEach(conv => {
            const item = document.createElement('li');
            item.classList.add('conversation-item');
            if (conv.id === activeConversationId) item.classList.add('active-conversation');
            if (conv.unread) item.classList.add('unread');
            item.dataset.conversationId = conv.id;
            item.innerHTML = `
                <img src="${conv.participantAvatar}" alt="${conv.participantName}" class="conversation-avatar ${conv.type === 'platform' ? 'platform-avatar' : ''}">
                <div class="conversation-summary">
                    <div class="conversation-header-line">
                        <span class="conversation-name">${conv.participantName}</span>
                        <span class="conversation-time">${formatMessageTime(conv.timestamp)}</span>
                    </div>
                    <p class="conversation-preview">${conv.lastMessage.replace(/<[^>]*>?/gm, '').substring(0, 50) + (conv.lastMessage.length > 50 ? '...' : '')}</p>
                </div>
                <span class="unread-dot"></span>
            `;
            item.addEventListener('click', () => loadConversation(conv.id));
            conversationsListElem.appendChild(item);
        });
    }

    function loadConversation(conversationId) {
        activeConversationId = conversationId;
        const conversation = allConversations.find(c => c.id === conversationId);
        if (!conversation || !messageViewColumn) return;

        // Atualiza lista para destacar a ativa
        renderConversationsList(); 
        
        if (emptyMessageViewState) emptyMessageViewState.style.display = 'none';
        if (messageHistoryElem) messageHistoryElem.style.display = 'flex'; // Garante que a área de mensagens esteja visível
        if (messageReplyInput.parentElement) messageReplyInput.parentElement.style.display = 'flex';


        if(currentChatAvatarElem) currentChatAvatarElem.src = conversation.participantAvatar;
        if(currentChatNameElem) currentChatNameElem.textContent = conversation.participantName;
        if(currentChatStatusElem) {
            currentChatStatusElem.textContent = conversation.participantStatus;
            currentChatStatusElem.className = `current-chat-status ${conversation.participantStatus === 'Online' ? '' : 'offline'}`;
        }
        
        if (messageHistoryElem) {
            messageHistoryElem.innerHTML = ''; // Limpa histórico anterior
            conversation.messages.forEach(msg => {
                const bubble = document.createElement('div');
                bubble.classList.add('message-bubble');
                bubble.classList.add(msg.sender === (currentUser ? currentUser.id : 'guide_id') ? 'sent' : 'received');
                bubble.innerHTML = `<p>${msg.text}</p><span class="message-time">${formatMessageTime(msg.timestamp)}</span>`;
                messageHistoryElem.appendChild(bubble);
            });
            messageHistoryElem.scrollTop = messageHistoryElem.scrollHeight; // Rola para a última mensagem
        }

        // Marcar como lida (simulado)
        if (conversation.unread) {
            conversation.unread = false;
            // Atualizar no 'banco de dados' simulado (allConversations)
            // E no localStorage se estiver usando
            renderConversationsList(); // Re-renderiza lista para remover o 'unread' dot
            updateBadgeCounts();
        }
        
        // Lógica mobile para mostrar a view de mensagem
        if(window.innerWidth <= 768 && conversationsListColumn){
            conversationsListColumn.classList.remove('mobile-active');
        }
    }

    function sendMessage() {
        if (!activeConversationId || !messageReplyInput) return;
        const text = messageReplyInput.value.trim();
        if (text === '') return;

        const conversation = allConversations.find(c => c.id === activeConversationId);
        if (conversation) {
            const newMessage = {
                id: 'msg' + Date.now(),
                sender: currentUser ? currentUser.id : 'guide_id',
                text: text,
                timestamp: new Date().toISOString()
            };
            conversation.messages.push(newMessage);
            conversation.lastMessage = text; // Atualiza preview
            conversation.timestamp = newMessage.timestamp; // Atualiza timestamp da conversa

            // Simular salvamento e recarregar a conversa
            messageReplyInput.value = '';
            loadConversation(activeConversationId); // Re-renderiza a conversa atual
            renderConversationsList(); // Re-renderiza a lista para reordenar
        }
    }
    
    function updateBadgeCounts() {
        const unreadCount = allConversations.filter(c => c.unread).length;
        const sidebarBadge = document.getElementById('sidebarMessagesBadge');
        const headerBadge = document.getElementById('headerMessagesBadge');
        if(sidebarBadge) {
            sidebarBadge.textContent = unreadCount > 0 ? unreadCount : '';
            sidebarBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
        }
        if(headerBadge) {
            headerBadge.textContent = unreadCount > 0 ? unreadCount : '';
            headerBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
        }
    }


    // --- Event Listeners ---
    if (searchConversationsInput) searchConversationsInput.addEventListener('input', renderConversationsList);
    if (filterMessageType) filterMessageType.addEventListener('change', renderConversationsList);
    if (sendMessageBtn) sendMessageBtn.addEventListener('click', sendMessage);
    if (messageReplyInput) {
        messageReplyInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Mobile: Botão de voltar para a lista de conversas
    // if (backToConversationsBtn && conversationsListColumn) {
    //     backToConversationsBtn.addEventListener('click', () => {
    //         conversationsListColumn.classList.add('mobile-active');
    //     });
    // }


    // --- Inicialização ---
    function initializeMessagesPage() {
        if (!currentUser) {
            alert("Acesso negado. Faça login como guia verificado.");
            window.location.href = "../login.html"; return;
        }
        if (emptyMessageViewState) emptyMessageViewState.style.display = 'flex';
        if (messageHistoryElem) messageHistoryElem.style.display = 'none';
        if (messageReplyInput.parentElement) messageReplyInput.parentElement.style.display = 'none';

        renderConversationsList();
        updateBadgeCounts();

        // Opcional: Carregar a primeira conversa ou a primeira não lida
        // const firstUnread = allConversations.find(c => c.unread);
        // if (firstUnread) {
        //     loadConversation(firstUnread.id);
        // } else if (allConversations.length > 0) {
        //     loadConversation(allConversations[0].id);
        // }
    }

    initializeMessagesPage();

    // Lógica do menu lateral do guia (já deve estar em guia-painel.js)
    // ...
});
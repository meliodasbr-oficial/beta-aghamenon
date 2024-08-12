(function() {
    const warningMessage = `
        Você não é um desenvolvedor autorizado do Aghamenon Toberlock Estudos.
        Qualquer tentativa de acessar informações internas pode resultar em ações legais.
        Por favor, saia imediatamente se você não tiver permissão para acessar este conteúdo.
    `;

    function showConsoleWarning() {
        console.log(warningMessage);
        ['log', 'info', 'warn', 'error'].forEach(method => {
            console[method] = function() {
                console.warn('Acesso ao console restrito. Saia imediatamente.');
            };
        });

        // Redirecionar ou realizar outras ações
        window.location.href = 'access-denied.html'; // Página de aviso
    }

    function sendConsoleAccessEvent() {
        if (typeof gtag === 'function') {
            gtag('event', 'console_access', {
                'event_category': 'Security',
                'event_label': 'Console Opened'
            });
        }
    }

    function detectDevTools() {
        const threshold = 160; // Tamanho mínimo da diferença
        let devtoolsOpen = false;

        function check() {
            if (window.outerWidth - window.innerWidth > threshold ||
                window.outerHeight - window.innerHeight > threshold) {
                if (!devtoolsOpen) {
                    devtoolsOpen = true;
                    showConsoleWarning();
                    sendConsoleAccessEvent(); // Envia o evento para o Google Analytics
                }
            } else {
                devtoolsOpen = false;
            }
        }

        // Checar a cada 100ms
        setInterval(check, 100);

        // Verificar também quando a janela for redimensionada
        window.addEventListener('resize', check);
    }

    // Iniciar a detecção
    detectDevTools();
})();

// INTEGRATIONS LOGIC - BUBBLES & LOGS (Redesigned)

async function loadIntegrations() {
    const dock = document.getElementById('integrationsBubbleDock');
    const stage = document.getElementById('integrationsMainStage');

    if (!dock) return;
    dock.innerHTML = '';

    // Default instruction
    if (stage) stage.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin-top: 50px;">Selecione uma integração acima para visualizar os dados.</p>';

    try {
        // Fetch Allowed Integrations
        const res = await fetch('/api/company/settings', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        console.log("DEBUG: Notifications Settings Response:", data);

        let allowed = [];
        try {
            console.log("DEBUG: parsing allowedIntegrations:", data.allowedIntegrations);
            allowed = data.allowedIntegrations ? JSON.parse(data.allowedIntegrations) : [];
        } catch (e) {
            console.error("DEBUG: Parse Error", e);
            allowed = [];
        }

        if (allowed.length === 0) {
            dock.innerHTML = '<p style="color: #666; font-size: 0.9rem;">Nenhuma integração ativa.</p>';
            return;
        }

        allowed.forEach(type => {
            renderSmallBubble(dock, type);
        });

    } catch (e) {
        console.error("Erro ao carregar integrações", e);
        dock.innerHTML = '<p style="color: red;">Erro ao carregar.</p>';
    }
}

function renderSmallBubble(container, type) {
    const config = {
        whatsapp: { name: 'WhatsApp', color: '#25D366', icon: '/images/whatsapp.png', isImg: true },
        lnassist: { name: 'LnAssist', color: '#ff9800', icon: '/images/logo-lnassist.png', isImg: true }
    };

    const conf = config[type];
    if (!conf) return;

    const bubble = document.createElement('div');
    bubble.className = 'glass-panel integration-bubble-small';
    bubble.title = `Ver logs do ${conf.name}`;
    bubble.style.cssText = `
        width: 60px; 
        height: 60px; 
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center; 
        cursor: pointer; 
        transition: all 0.2s;
        border-radius: 50%;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        position: relative;
    `;

    let iconHtml = '';
    if (conf.isImg) {
        iconHtml = `<img src="${conf.icon}" style="width: 30px; height: 30px; object-fit: contain;">`;
    } else {
        iconHtml = `<span style="font-size: 1.5rem;">${conf.icon}</span>`;
    }

    bubble.innerHTML = iconHtml;

    // Active State Logic (Visual only, state handled by click)
    bubble.onclick = () => {
        // Reset others
        container.querySelectorAll('.integration-bubble-small').forEach(b => {
            b.style.border = '1px solid rgba(255,255,255,0.1)';
            b.style.background = 'rgba(255,255,255,0.05)';
        });
        // Activate current
        bubble.style.border = `2px solid ${conf.color}`;
        bubble.style.background = `${conf.color}22`; // Low opacity background

        loadIntegrationTable(type);
    };

    container.appendChild(bubble);
}

function loadIntegrationTable(type) {
    const stage = document.getElementById('integrationsMainStage');
    if (!stage) return;

    stage.innerHTML = '<div style="text-align:center; padding: 40px;"><div class="spinner"></div><p>Carregando dados...</p></div>';

    if (type === 'whatsapp') {
        renderWhatsappTable(stage);
    } else if (type === 'lnassist') {
        renderLnAssistTable(stage);
    }
}

async function renderWhatsappTable(container) {
    const headerHtml = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h3 style="margin:0;">Logs do WhatsApp</h3>
            <button onclick="loadIntegrationTable('whatsapp')" style="background:none; border:none; color:var(--text-muted); cursor:pointer;">↻ Atualizar</button>
        </div>
        <div style="overflow-x: auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Data/Hora</th>
                        <th>Número</th>
                        <th>Mensagem</th>
                        <th>Obs</th>
                    </tr>
                </thead>
                <tbody id="waLogsBody">
                    <tr><td colspan="5" style="text-align:center;">Carregando...</td></tr>
                </tbody>
            </table>
        </div>
    `;
    container.innerHTML = headerHtml;

    try {
        const res = await fetch('/api/logs/whatsapp', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        const tbody = document.getElementById('waLogsBody');
        tbody.innerHTML = '';

        if (data.logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum registro encontrado.</td></tr>';
            return;
        }

        data.logs.forEach(log => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${log.id}</td>
                <td>${new Date(log.createdAt).toLocaleString()}</td>
                <td>${log.phone}</td>
                <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${log.message}">${log.message}</td>
                <td>${log.notes || '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error(e);
        container.innerHTML += '<p style="color:red; text-align:center;">Erro ao carregar dados.</p>';
    }
}

async function renderLnAssistTable(container) {
    const headerHtml = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h3 style="margin:0;">Atendimentos LnAssist</h3>
            <button onclick="loadIntegrationTable('lnassist')" style="background:none; border:none; color:var(--text-muted); cursor:pointer;">↻ Atualizar</button>
        </div>
        <div style="overflow-x: auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Data/Hora</th>
                        <th>ID</th>
                        <th>Situação</th>
                        <th>Associado</th>
                        <th>Placa</th>
                        <th>Associação</th>
                        <th>Atendente</th>
                        <th>Tel. Associado</th>
                    </tr>
                </thead>
                <tbody id="lnLogsBody">
                    <tr><td colspan="8" style="text-align:center;">Carregando...</td></tr>
                </tbody>
            </table>
        </div>
    `;
    container.innerHTML = headerHtml;

    try {
        const res = await fetch('/api/logs/lnassist', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        const tbody = document.getElementById('lnLogsBody');
        tbody.innerHTML = '';

        if (data.logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Nenhum registro encontrado.</td></tr>';
            return;
        }

        data.logs.forEach(log => {
            const tr = document.createElement('tr');
            const date = log.serviceDate ? new Date(log.serviceDate).toLocaleString() : '-';
            tr.innerHTML = `
                <td>${date}</td>
                <td>#${log.id}</td>
                <td>${log.status}</td>
                <td>${log.corporateName || '-'}</td>
                <td>${log.plate || '-'}</td>
                <td>${log.association || '-'}</td>
                <td>${log.attendant || '-'}</td>
                <td>${log.phone || '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error(e);
        container.innerHTML += '<p style="color:red; text-align:center;">Erro ao carregar dados.</p>';
    }
}

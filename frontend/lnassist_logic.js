
// --- LN ASSIST LOGIC ---
async function renderLnAssistCard(container, initialData) {
    const cardId = 'lnassist-card';
    // Avoid duplicates
    if (document.getElementById(cardId)) return;

    const div = document.createElement('article');
    div.className = 'glass-panel';
    div.style.cssText = 'padding: 30px; position: relative; overflow: hidden; display: flex; flex-direction: column; grid-column: span 2;'; // Span 2 for more space
    div.id = cardId;

    div.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                    <span style="font-size: 2rem;">🩺</span>
                    <div style="flex: 1;">
                        <h3 style="margin:0; font-size: 1.2rem; color: #fff;">LnAssist (Associações)</h3>
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">Gerencie as associações e logotipos.</p>
                    </div>
                </div>

                <!-- ADD FORM -->
                <form onsubmit="handleAssociationUpload(event)" style="background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <input type="text" name="name" placeholder="Nome da Associação" required
                        style="flex: 1; min-width: 150px; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #fff;">
                    
                    <label class="btn-glow" style="margin:0; padding: 8px 15px; font-size: 0.9rem; cursor: pointer;">
                        📷 Logo
                        <input type="file" name="logo" accept="image/*" hidden required>
                    </label>

                    <button type="submit" class="btn-glow" style="padding: 8px 15px; background: var(--success); border: none;">+ Adicionar</button>
                    <span id="uploadStatusLn" style="font-size: 0.8rem; color: #aaa; margin-left: 10px;"></span>
                </form>

                <!-- LIST -->
                <div id="associationsList" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; max-height: 300px; overflow-y: auto;">
                    <p style="grid-column: 1/-1; text-align: center; color: #666;">Carregando...</p>
                </div>
            `;

    container.prepend(div); // Put at top
    loadAssociations();
}

async function loadAssociations() {
    const list = document.getElementById('associationsList');
    if (!list) return;

    try {
        const res = await fetch('/api/associations', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const items = await res.json();
            renderAssociationsList(items);
        } else {
            list.innerHTML = `<p style="color: #ef4444;">Erro ao carregar.</p>`;
        }
    } catch (e) {
        console.error(e);
        list.innerHTML = `<p style="color: #ef4444;">Erro de conexão.</p>`;
    }
}

function renderAssociationsList(items) {
    const list = document.getElementById('associationsList');
    if (items.length === 0) {
        list.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888; font-style: italic;">Nenhuma associação cadastrada.</p>`;
        return;
    }

    list.innerHTML = items.map(item => `
                <div class="glass-panel" style="padding: 10px; text-align: center; position: relative; border: 1px solid rgba(255,255,255,0.05);">
                    <img src="${item.logo || '/placeholder.png'}" style="width: 60px; height: 60px; object-fit: contain; margin-bottom: 10px;">
                    <h4 style="margin: 0; font-size: 0.9rem; color: #fff;">${item.name}</h4>
                    <button onclick="deleteAssociation('${item.id}')" 
                        style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.5); border: none; color: #ef4444; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.7rem;">✕</button>
                </div>
            `).join('');
}

async function handleAssociationUpload(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const status = document.getElementById('uploadStatusLn');
    const originalText = btn.innerText;
    btn.innerText = "...";
    btn.disabled = true;

    const formData = new FormData(e.target);

    try {
        const res = await fetch('/api/associations', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (res.ok) {
            status.innerText = "Sucesso!";
            e.target.reset();
            loadAssociations(); // Reload list
            setTimeout(() => status.innerText = "", 2000);
        } else {
            const err = await res.json();
            alert('Erro: ' + (err.error || 'Falha no upload'));
        }
    } catch (e) {
        console.error(e);
        alert('Erro de conexão.');
    }
    btn.innerText = originalText;
    btn.disabled = false;
}

async function deleteAssociation(id) {
    if (!confirm('Tem certeza?')) return;
    try {
        const res = await fetch(`/api/associations/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            loadAssociations();
        } else {
            alert('Erro ao deletar.');
        }
    } catch (e) {
        console.error(e);
    }
}

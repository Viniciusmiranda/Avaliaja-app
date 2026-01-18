# Histórico de Versões

## v2.3.1 (Atual) - Correções e Melhorias (Sprint 2)
**Foco em estabilidade, design e correções críticas.**

### 🛠 Correções de Bugs (Backend & Frontend)
- **Correção Crítica (Erro 404):** Resolvido o problema de "Page not Found" que derrubava o sistema devido a arquivos faltando (`associationRoutes`) e imports incorretos no Docker. Sistema estabilizado.
- **Ícones de Integração:** O ícone do **LnAssist** foi corrigido para usar a logo oficial (`logo-lnassist.png`) em vez do emoji, com caminhos absolutos para evitar erros de carregamento.
- **Aba "Personalização" Vazia:** Corrigido erro de estrutura HTML que escondia o conteúdo da aba. Agora os controles de identidade visual aparecem corretamente.
- **Aba "Minha Conta":** A gestão de **Gestores** foi movida para esta aba, centralizando as configurações da conta e removendo o item duplicado da barra lateral.

### 🎨 Melhorias de Design & UX
- **Renomeação de Aba:** "Suporte e Novidades" agora é apenas **"Suporte"**.
- **Visualização Mobile:** O preview do smartphone na aba Personalização agora reflete fielmente as mudanças.

---

## v2.3.0 - Renovação Visual e Novas Funcionalidades
- **Novo Design do Dashboard:** Interface totalmente reformulada com estilo *Glassmorphism*.
- **Preview em Tempo Real:** Visualização de smartphone na aba "Personalização".
- **Filtros de Data:** Funcionalidade para filtrar métricas por período.
- **Exportação PDF:** Relatórios gerenciais em PDF.

## v2.2.45 - Melhorias de Gestão e Integrações
- **Integrações:** Cards individuais para WhatsApp, N8N, Email.
- **Gestão de Atendentes:** Contadores de uso e ordenação.

## v2.1.0 - Automação e Notificações
- **Integração WhatsApp Oficial:** Disparo de mensagens de agradecimento.
- **Webhooks (N8N):** Envio de dados JSON para automações.

## v2.0.0 - O Grande Lançamento
- **Sistema de Avaliação QR Code:** Fluxo completo.
- **Métricas em Tempo Real:** NPS, Média, Total.


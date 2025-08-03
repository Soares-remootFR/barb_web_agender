Barber Shop App - Sistema de Agendamento
Este é um aplicativo web simples para agendamento de serviços de uma barbearia. O projeto foi desenvolvido com uma arquitetura de frontend e backend, oferecendo uma interface de usuário responsiva para clientes e um sistema de notificação por e-mail para o barbeiro.

O aplicativo de agendamento, por si só, é um projeto estático, composto apenas por HTML, CSS e JavaScript. Para que a funcionalidade de notificação por e-mail funcione, é necessário um servidor de backend que se comunique com um serviço de envio de e-mails.

Funcionalidades
Agendamento por Calendário: Interface intuitiva em formato de calendário onde os clientes podem selecionar a data do serviço.

Seleção de Horário: Horários disponíveis em intervalos de 20 minutos, de 8:00 às 20:00, com horário de almoço das 12:00 às 14:00.

Serviços Personalizados: Os clientes podem escolher entre serviços predefinidos (Corte de Cabelo, Barba, Corte e Barba) ou especificar um serviço personalizado.

Tema Escuro: Design moderno e agradável com um tema escuro.

Notificação por E-mail: Após o agendamento, uma notificação detalhada é enviada para o e-mail do barbeiro, contendo informações sobre o cliente, serviço, data, hora e um histórico dos agendamentos do dia.

Histórico do Dia: A interface mostra os horários já agendados para o dia selecionado.

Botão de Reiniciar: Um botão que permite apagar todos os agendamentos salvos, resetando o aplicativo.

Como Usar
Requisitos
Um navegador web moderno para a parte do frontend.

Node.js instalado (para a parte do backend de e-mail).

Configuração do Frontend (Aplicativo Web)
Clone ou baixe os arquivos do projeto (index.html, style.css, script.js).

Abra o arquivo index.html em seu navegador para visualizar o aplicativo.

Você pode hospedar este frontend gratuitamente no GitHub Pages.

Configuração do Backend (Servidor de E-mail)
Esta parte é crucial para que as notificações por e-mail funcionem de verdade. O script.js do frontend faz uma chamada para este servidor.

Em uma pasta separada, crie um projeto Node.js.

Instale as dependências: npm install express nodemailer cors.

Crie um arquivo chamado server.js com a lógica de envio de e-mail.

Lembre-se de configurar suas credenciais do Gmail usando uma Senha de Aplicativo para segurança.

Substitua o API_URL no arquivo script.js do frontend pelo endereço do seu servidor de backend (ex: https://seu-servidor.vercel.app/api/agendamentos).

Próximos Passos
Implementar o Backend de E-mail: Desenvolva e hospede o seu servidor de e-mail para habilitar as notificações em tempo real.

Persistência de Dados: Em um ambiente de produção, substitua o localStorage (que é usado apenas para demonstração) por um banco de dados real (como Firebase, MongoDB, PostgreSQL) para armazenar os agendamentos de forma segura.

Funcionalidade de Cancelamento: Adicione um endpoint no backend para que o barbeiro possa receber notificações de cancelamento.

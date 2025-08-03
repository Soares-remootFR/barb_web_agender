document.addEventListener( 'DOMContentLoaded', () => {
  // Referências aos elementos do DOM
  const monthYearDisplay = document.getElementById( 'month-year' );
  const prevMonthButton = document.getElementById( 'prev-month' );
  const nextMonthButton = document.getElementById( 'next-month' );
  const calendarGrid = document.getElementById( 'calendar-grid' );
  const detailsCard = document.getElementById( 'appointment-details' );
  const detailsTitle = document.getElementById( 'details-title' );
  const dailyHistoryContainer = document.getElementById( 'daily-history' );
  const historyList = document.getElementById( 'history-list' );
  const serviceTypeSelect = document.getElementById( 'service-type' );
  const otherServiceContainer = document.getElementById( 'other-service-container' );
  const scheduleForm = document.getElementById( 'schedule-form' );
  const timeSlotSelect = document.getElementById( 'time-slot' );
  const modal = document.getElementById( 'modal' );
  const modalMessage = document.getElementById( 'modal-message' );
  const closeModalButton = document.querySelector( '.modal .close-button' );
  const cancellationInfo = document.getElementById( 'cancellation-info' );
  const resetAppButton = document.getElementById( 'reset-app-button' );

  // Estado do calendário e agendamentos
  let currentDate = new Date();
  let selectedDate = null;
  let appointments = JSON.parse( localStorage.getItem( 'barbershopAppointments' ) ) || {}; // Simula um banco de dados

  // URL do servidor (backend) para agendamentos
  // **Atenção:** Este é um placeholder. Você deve substituir com o URL real do seu backend de e-mail.
  const API_URL = 'http://seu-backend.com/api/agendamentos';
  const BARBER_EMAIL = 'seu_email_aqui@exemplo.com'; // E-mail do barbeiro para notificação

  // Função para renderizar o calendário
  const renderCalendar = () => {
    calendarGrid.innerHTML = `
            <div class="day-name">Dom</div>
            <div class="day-name">Seg</div>
            <div class="day-name">Ter</div>
            <div class="day-name">Qua</div>
            <div class="day-name">Qui</div>
            <div class="day-name">Sex</div>
            <div class="day-name">Sáb</div>
        `;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Formata a data para exibição
    monthYearDisplay.textContent = new Intl.DateTimeFormat( 'pt-BR', { month: 'long', year: 'numeric' } ).format( currentDate );

    // Pega o primeiro dia do mês e o último dia
    const firstDayOfMonth = new Date( year, month, 1 ).getDay(); // 0 para domingo, 1 para segunda, etc.
    const lastDateOfMonth = new Date( year, month + 1, 0 ).getDate();

    // Adiciona dias vazios para o espaçamento do calendário
    for ( let i = 0; i < firstDayOfMonth; i++ ) {
      const emptyDiv = document.createElement( 'div' );
      calendarGrid.appendChild( emptyDiv );
    }

    // Adiciona os dias do mês
    for ( let day = 1; day <= lastDateOfMonth; day++ ) {
      const dayButton = document.createElement( 'button' );
      dayButton.classList.add( 'day-button' );
      dayButton.textContent = day;
      dayButton.setAttribute( 'data-day', day ); // Adiciona o atributo data-day para seleção

      const fullDate = new Date( year, month, day );

      // Desabilita domingos
      if ( fullDate.getDay() === 0 ) {
        dayButton.classList.add( 'disabled' );
        dayButton.disabled = true;
      } else {
        dayButton.addEventListener( 'click', () => {
          handleDayClick( day, month, year );
        } );
      }

      // Marca o dia atual (se for o mês e ano corretos)
      if ( day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear() ) {
        dayButton.classList.add( 'today' );
      }

      // Verifica se há agendamentos para o dia e adiciona a bolinha
      const dateKey = `${year}-${month + 1}-${day}`;
      if ( appointments[ dateKey ] && appointments[ dateKey ].length > 0 ) {
        dayButton.classList.add( 'has-appointments' );
      }

      calendarGrid.appendChild( dayButton );
    }
  };

  // Função para gerar os horários disponíveis
  const generateTimeSlots = ( date ) => {
    timeSlotSelect.innerHTML = '<option value="">Selecione um horário</option>';
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const dateKey = `${year}-${month + 1}-${day}`;
    const bookedTimes = appointments[ dateKey ] ? appointments[ dateKey ].map( app => app.time ) : [];

    // Horários: 8:00 às 20:00, 20 em 20 minutos, com pausa de almoço
    const startHour = 8;
    const endHour = 20;
    const lunchStartHour = 12;
    const lunchEndHour = 14;
    const intervalMinutes = 20;

    for ( let hour = startHour; hour < endHour; hour++ ) {
      for ( let minute = 0; minute < 60; minute += intervalMinutes ) {
        // Pular horário de almoço
        if ( hour >= lunchStartHour && hour < lunchEndHour ) {
          continue;
        }

        const formattedHour = String( hour ).padStart( 2, '0' );
        const formattedMinute = String( minute ).padStart( 2, '0' );
        const time = `${formattedHour}:${formattedMinute}`;

        // Se o horário já estiver agendado, pular
        if ( bookedTimes.includes( time ) ) {
          continue;
        }

        const option = document.createElement( 'option' );
        option.value = time;
        option.textContent = time;
        timeSlotSelect.appendChild( option );
      }
    }
  };

  // Função para lidar com o clique no dia
  const handleDayClick = ( day, month, year ) => {
    selectedDate = new Date( year, month, day );
    detailsTitle.textContent = `Agendar para ${selectedDate.toLocaleDateString( 'pt-BR' )}`;
    detailsCard.classList.remove( 'hidden' );

    // Remove a classe 'selected' de todos os botões e adiciona ao clicado
    document.querySelectorAll( '.day-button' ).forEach( btn => btn.classList.remove( 'selected' ) );
    const clickedButton = calendarGrid.querySelector( `.day-button[data-day="${day}"]` );
    if ( clickedButton && !clickedButton.classList.contains( 'disabled' ) ) {
      clickedButton.classList.add( 'selected' );
    }

    // Renderiza horários e histórico do dia
    generateTimeSlots( selectedDate );
    renderDailyHistory( selectedDate );
  };

  // Função para renderizar a lista de agendamentos do dia
  const renderDailyHistory = ( date ) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const dateKey = `${year}-${month + 1}-${day}`;

    historyList.innerHTML = '';
    if ( appointments[ dateKey ] && appointments[ dateKey ].length > 0 ) {
      appointments[ dateKey ].sort( ( a, b ) => a.time.localeCompare( b.time ) ).forEach( app => {
        const li = document.createElement( 'li' );
        li.innerHTML = `<strong>${app.time}</strong>: ${app.clientName} - ${app.serviceType}`;
        historyList.appendChild( li );
      } );
      dailyHistoryContainer.classList.remove( 'hidden' );
    } else {
      const li = document.createElement( 'li' );
      li.textContent = 'Nenhum agendamento para este dia.';
      historyList.appendChild( li );
    }
  };

  // Função para simular o envio para o backend e exibir o modal
  const sendAppointmentToBackend = async ( data ) => {
    // Obter o histórico de agendamentos do dia para enviar ao barbeiro
    const dateKey = `${data.year}-${data.month + 1}-${data.day}`;
    const dailyAppointments = appointments[ dateKey ] ? appointments[ dateKey ].map( app => `Hora: ${app.time}, Cliente: ${app.clientName}, Serviço: ${app.serviceType}` ) : [];
    const dailyHistoryReport = dailyAppointments.join( '\n' );

    // Prepara o payload para o backend, incluindo o novo agendamento no relatório
    const newAppointmentEntry = `Novo Agendamento:\n- Cliente: ${data.clientName}\n- Contato: ${data.clientContact}\n- Serviço: ${data.serviceType}\n- Data: ${selectedDate.toLocaleDateString( 'pt-BR' )}\n- Hora: ${data.timeSlot}`;
    const finalDailyReport = `${newAppointmentEntry}\n\nAgendamentos do dia (${selectedDate.toLocaleDateString( 'pt-BR' )}):\n${dailyHistoryReport}`;

    const notificationPayload = {
      message: finalDailyReport,
      toEmail: BARBER_EMAIL,
      subject: `Novo Agendamento: ${data.clientName} - ${data.serviceType}`
    };

    // Simula a chamada para a API do backend
    console.log( 'Simulando envio de agendamento para o backend:', notificationPayload );
    try {
      // **Este bloco simula a chamada fetch para o seu backend**
      // **Você deve descomentar e usar com seu servidor real**
      // const response = await fetch(API_URL, {
      //     method: 'POST',
      //     headers: {
      //         'Content-Type': 'application/json'
      //     },
      //     body: JSON.stringify(notificationPayload)
      // });

      // const result = await response.json();
      // if (!response.ok) {
      //     throw new Error(result.message || 'Erro ao agendar');
      // }

      // Lógica de sucesso (mock)
      const uniqueId = new Date().getTime(); // Simula um ID único
      const appointmentData = {
        id: uniqueId,
        clientName: data.clientName,
        clientContact: data.clientContact,
        serviceType: data.serviceType,
        time: data.timeSlot
      };

      if ( !appointments[ dateKey ] ) {
        appointments[ dateKey ] = [];
      }
      appointments[ dateKey ].push( appointmentData );
      localStorage.setItem( 'barbershopAppointments', JSON.stringify( appointments ) );

      // Exibe modal de sucesso
      modalMessage.textContent = 'Agendamento realizado com sucesso! O barbeiro foi notificado por e-mail.';
      cancellationInfo.classList.remove( 'hidden' );
      modal.classList.remove( 'hidden' );

      // Atualiza a interface
      renderCalendar();
      renderDailyHistory( selectedDate );
      scheduleForm.reset();
      detailsCard.classList.add( 'hidden' );

    } catch ( error ) {
      console.error( 'Erro no agendamento:', error );
      modalMessage.textContent = `Erro ao agendar. Tente novamente mais tarde. ${error.message}`;
      cancellationInfo.classList.add( 'hidden' ); // Garante que a mensagem de cancelamento não apareça em caso de erro
      modal.classList.remove( 'hidden' );
    }
  };

  // Eventos de navegação do calendário
  prevMonthButton.addEventListener( 'click', () => {
    currentDate.setMonth( currentDate.getMonth() - 1 );
    renderCalendar();
    detailsCard.classList.add( 'hidden' ); // Oculta o formulário ao mudar o mês
  } );

  nextMonthButton.addEventListener( 'click', () => {
    currentDate.setMonth( currentDate.getMonth() + 1 );
    renderCalendar();
    detailsCard.classList.add( 'hidden' ); // Oculta o formulário ao mudar o mês
  } );

  // Evento de mudança no select de serviço
  serviceTypeSelect.addEventListener( 'change', () => {
    if ( serviceTypeSelect.value === 'outro' ) {
      otherServiceContainer.classList.remove( 'hidden' );
      document.getElementById( 'other-service' ).required = true;
    } else {
      otherServiceContainer.classList.add( 'hidden' );
      document.getElementById( 'other-service' ).required = false;
    }
  } );

  // Evento de submissão do formulário
  scheduleForm.addEventListener( 'submit', ( e ) => {
    e.preventDefault();

    const formData = new FormData( scheduleForm );
    const data = {
      clientName: formData.get( 'client-name' ),
      clientContact: formData.get( 'client-contact' ),
      serviceType: formData.get( 'service-type' ) === 'outro' ? formData.get( 'other-service' ) : formData.get( 'service-type' ),
      timeSlot: formData.get( 'time-slot' ),
      year: selectedDate.getFullYear(),
      month: selectedDate.getMonth(),
      day: selectedDate.getDate()
    };

    if ( data.serviceType && data.timeSlot ) {
      sendAppointmentToBackend( data );
    } else {
      modalMessage.textContent = 'Por favor, preencha todos os campos obrigatórios.';
      cancellationInfo.classList.add( 'hidden' );
      modal.classList.remove( 'hidden' );
    }
  } );

  // Fechar modal
  closeModalButton.addEventListener( 'click', () => {
    modal.classList.add( 'hidden' );
  } );

  // Evento para reiniciar o aplicativo
  resetAppButton.addEventListener( 'click', () => {
    // Usa um modal personalizado em vez de `confirm()`
    const confirmModal = document.createElement( 'div' );
    confirmModal.classList.add( 'modal' );
    confirmModal.innerHTML = `
            <div class="modal-content">
                <h3>Confirmação</h3>
                <p>Tem certeza que deseja apagar todos os agendamentos? Esta ação não pode ser desfeita.</p>
                <div style="display: flex; justify-content: space-around; margin-top: 1.5rem;">
                    <button id="confirm-reset" class="submit-button" style="background-color: var(--danger-color); width: 45%;">Sim, Apagar</button>
                    <button id="cancel-reset" class="nav-button" style="width: 45%;">Cancelar</button>
                </div>
            </div>
        `;
    document.body.appendChild( confirmModal );

    document.getElementById( 'confirm-reset' ).addEventListener( 'click', () => {
      localStorage.removeItem( 'barbershopAppointments' );
      appointments = {};
      renderCalendar();
      detailsCard.classList.add( 'hidden' );
      modalMessage.textContent = 'Todos os agendamentos foram apagados. O aplicativo foi reiniciado.';
      cancellationInfo.classList.add( 'hidden' );
      modal.classList.remove( 'hidden' );
      confirmModal.remove();
    } );

    document.getElementById( 'cancel-reset' ).addEventListener( 'click', () => {
      confirmModal.remove();
    } );
  } );

  // Inicializa o calendário
  renderCalendar();
} );

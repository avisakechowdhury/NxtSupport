import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTicketStore } from '../store/ticketStore';
import TicketDetail from '../components/Tickets/TicketDetail';

const TicketView = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchTicketById, fetchTicketActivities } = useTicketStore();
  
  useEffect(() => {
    if (id) {
      fetchTicketById(id);
      fetchTicketActivities(id);
    }
  }, [id, fetchTicketById, fetchTicketActivities]);

  return (
    <div>
      <TicketDetail />
    </div>
  );
};

export default TicketView;
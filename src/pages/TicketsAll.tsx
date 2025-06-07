import React from 'react';
import TicketList from '../components/Tickets/TicketList';
// import TicketSimulator from '../components/Tickets/TicketSimulator';

const TicketsAll = () => {
  return (
    <div className="space-y-6">
      <TicketList />
      {/* <TicketSimulator /> */}
    </div>
  );
};

export default TicketsAll;
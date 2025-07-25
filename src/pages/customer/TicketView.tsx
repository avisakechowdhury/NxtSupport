import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TicketView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    setLoading(true);
    axios.get(`/api/tickets/public/${token}`)
      .then(res => {
        setTicket(res.data);
        setError('');
      })
      .catch(err => {
        setError('Ticket not found or invalid link.');
        setTicket(null);
      })
      .finally(() => setLoading(false));
  }, [token, navigate]);

  if (loading) return <div className="p-8 text-center">Loading ticket...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!ticket) return null;

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-2">Ticket #{ticket.ticketNumber}</h2>
      <div className="mb-2"><strong>Subject:</strong> {ticket.subject}</div>
      <div className="mb-2"><strong>Status:</strong> {ticket.status}</div>
      <div className="mb-2"><strong>Priority:</strong> {ticket.priority}</div>
      <div className="mb-2"><strong>Created At:</strong> {new Date(ticket.createdAt).toLocaleString()}</div>
      <div className="mb-2"><strong>Customer:</strong> {ticket.senderName} ({ticket.senderEmail})</div>
      <div className="mb-4"><strong>Message:</strong> {ticket.body}</div>
      {ticket.comments && ticket.comments.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Comments</h3>
          <ul className="space-y-2">
            {ticket.comments.map((comment: any, idx: number) => (
              <li key={idx} className="bg-gray-50 p-2 rounded">
                <span className="font-semibold">{comment.userName}:</span> {comment.text}
                <span className="ml-2 text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TicketView; 